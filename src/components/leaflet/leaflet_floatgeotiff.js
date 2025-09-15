import L from "leaflet";
import { min, max } from "d3";
import * as GeoTIFF from "geotiff";

L.FloatGeotiff = L.ImageOverlay.extend({
  options: {
    opacity: 1,
    min: false,
    max: false,
    unit: "",
    decimal: 1,
    colorRampSteps: 2,
    palette: [
      { color: [255, 255, 255], point: 0 },
      { color: [0, 0, 0], point: 1 },
    ],
    invalidpixel: 1,
    validpixelexpression: true,
    convolve: 0,
  },
  initialize: async function (data, options) {
    this._url = "geotiff.tif";
    this.convolve = false;
    this._data = data;
    this.raster = {};
    L.Util.setOptions(this, options);
    await this._processData();
    this._convolve();
    this._createColorRamp();
    this._reset();
    if (document.getElementById("loading")) {
      document.getElementById("loading").style.visibility = "hidden";
    }
  },
  update: async function (data, options) {
    L.Util.setOptions(this, options);
    if (data !== false) {
      this._data = data;
      await this._processData();
    }
    this._convolve();
    this._createColorRamp();
    this._reset();
    if (document.getElementById("loading")) {
      document.getElementById("loading").style.visibility = "hidden";
    }
  },
  onAdd: function (map) {
    this._map = map;
    if (!this._image) {
      this._initImage();
    }
    map._panes.overlayPane.appendChild(this._image);
    map.on("click", this._onClick, this);
    map.on("moveend", this._reset, this);
    map.on("mousemove", this._onMousemove, this);
    if (map.options.zoomAnimation && L.Browser.any3d) {
      map.on("zoomanim", this._animateZoom, this);
    }
    this._reset();
  },
  onRemove: function (map) {
    map.getPanes().overlayPane.removeChild(this._image);
    map.off("moveend", this._reset, this);
    map.off("click", this._onClick, this);
    map.off("mousemove", this._onMousemove, this);
    if (map.options.zoomAnimation) {
      map.off("zoomanim", this._animateZoom, this);
    }
  },
  _processData: async function () {
    const tiff = await GeoTIFF.fromArrayBuffer(this._data);
    const image = await tiff.getImage();
    var meta = image.getFileDirectory();
    var x_min = meta.ModelTiepoint[3];
    var x_max = x_min + meta.ModelPixelScale[0] * meta.ImageWidth;
    var y_min = meta.ModelTiepoint[4];
    var y_max = y_min - meta.ModelPixelScale[1] * meta.ImageLength;
    this._rasterBounds = L.latLngBounds([
      [y_min, x_min],
      [y_max, x_max],
    ]);
    this.raster.data = await image.readRasters();
    if (this.raster.data.length > 1) {
      if (max(this.raster.data[1]) > 1) {
        this.options.invalidpixel = 0;
      }
    }
    this.raster.width = image.getWidth();
    this.raster.height = image.getHeight();
    if (this.options.min === undefined)
      this.options.min = min(this.raster.data[0]);
    if (this.options.min === undefined)
      this.options.max = max(this.raster.data[0]);
    this.plotData = this.raster.data[0].slice(0);
  },
  _createConvolutionMatrix: function (n) {
    var center = Math.floor(n / 2);
    var matrix = new Array(n);
    for (var i = 0; i < n; i++) {
      matrix[i] = new Array(n);
      for (var j = 0; j < n; j++) {
        var diffX = j - center;
        var diffY = i - center;
        matrix[i][j] = [diffX, diffY];
      }
    }

    return matrix;
  },
  _convolve: function () {
    if (this.options.convolve !== this.convolve) {
      if (this.options.convolve === 0) {
        this.plotData = this.raster.data[0].slice(0);
      } else {
        const multiband = this.raster.data.length > 1;
        const width = this.raster.width;
        const height = this.raster.height;
        const convolveSize = this.options.convolve;
        const offsets = [];
        for (let i = -convolveSize; i <= convolveSize; i++) {
          for (let j = -convolveSize; j <= convolveSize; j++) {
            offsets.push([i, j]);
          }
        }

        const rasterData = this.raster.data[0];
        const validPixelCheck = (index) =>
          !isNaN(rasterData[index]) &&
          (!multiband ||
            this.raster.data[1][index] !== this.options.invalidpixel);

        const newPlotData = new Float32Array(width * height).fill(NaN);

        for (let h = convolveSize; h < height - convolveSize; h++) {
          for (let w = convolveSize; w < width - convolveSize; w++) {
            const centerIndex = h * width + w;
            if (validPixelCheck(centerIndex)) {
              let sum = 0;
              let count = 0;

              for (const [dx, dy] of offsets) {
                const neighborW = w + dx;
                const neighborH = h + dy;
                const neighborIndex = neighborH * width + neighborW;

                if (validPixelCheck(neighborIndex)) {
                  sum += rasterData[neighborIndex];
                  count++;
                }
              }

              if (count > 0) {
                newPlotData[centerIndex] = sum / count;
              }
            }
          }
        }

        this.plotData = newPlotData;
      }
      this.convolve = this.options.convolve;
    }
  },
  getValueAtLatLng: function (lat, lng) {
    try {
      var x = Math.floor(
        (this.raster.width * (lng - this._rasterBounds._southWest.lng)) /
          (this._rasterBounds._northEast.lng -
            this._rasterBounds._southWest.lng)
      );
      var y =
        this.raster.height -
        Math.ceil(
          (this.raster.height * (lat - this._rasterBounds._southWest.lat)) /
            (this._rasterBounds._northEast.lat -
              this._rasterBounds._southWest.lat)
        );
      var i = y * this.raster.width + x;
      return this.raster.data[0][i];
    } catch (err) {
      return undefined;
    }
  },
  _animateZoom: function (e) {
    var scale = this._map.getZoomScale(e.zoom),
      offset = this._map._latLngBoundsToNewLayerBounds(
        this._map.getBounds(),
        e.zoom,
        e.center
      ).min;
    L.DomUtil.setTransform(this._image, offset, scale);
  },
  _reset: function () {
    if (this.hasOwnProperty("_map")) {
      if (this._rasterBounds) {
        var topLeft = this._map.latLngToLayerPoint(
            this._map.getBounds().getNorthWest()
          ),
          size = this._map
            .latLngToLayerPoint(this._map.getBounds().getSouthEast())
            ._subtract(topLeft);
        L.DomUtil.setPosition(this._image, topLeft);
        this._image.style.width = size.x + "px";
        this._image.style.height = size.y + "px";

        this._drawImage();
      }
    }
  },
  _drawImage: function () {
    if (this.raster.hasOwnProperty("data")) {
      var args = {};
      this.topLeft = this._map.latLngToLayerPoint(
        this._map.getBounds().getNorthWest()
      );
      this.size = this._map
        .latLngToLayerPoint(this._map.getBounds().getSouthEast())
        ._subtract(this.topLeft);
      args.rasterPixelBounds = L.bounds(
        this._map.latLngToContainerPoint(this._rasterBounds.getNorthWest()),
        this._map.latLngToContainerPoint(this._rasterBounds.getSouthEast())
      );
      args.xStart =
        args.rasterPixelBounds.min.x > 0 ? args.rasterPixelBounds.min.x : 0;
      args.xFinish =
        args.rasterPixelBounds.max.x < this.size.x
          ? args.rasterPixelBounds.max.x
          : this.size.x;
      args.yStart =
        args.rasterPixelBounds.min.y > 0 ? args.rasterPixelBounds.min.y : 0;
      args.yFinish =
        args.rasterPixelBounds.max.y < this.size.y
          ? args.rasterPixelBounds.max.y
          : this.size.y;
      args.plotWidth = args.xFinish - args.xStart;
      args.plotHeight = args.yFinish - args.yStart;

      if (args.plotWidth <= 0 || args.plotHeight <= 0) {
        let plotCanvas = document.createElement("canvas");
        plotCanvas.width = this.size.x;
        plotCanvas.height = this.size.y;
        let ctx = plotCanvas.getContext("2d");
        ctx.clearRect(0, 0, plotCanvas.width, plotCanvas.height);
        this._image.src = plotCanvas.toDataURL();
        return;
      }

      args.xOrigin = this._map.getPixelBounds().min.x + args.xStart;
      args.yOrigin = this._map.getPixelBounds().min.y + args.yStart;
      args.lngSpan =
        (this._rasterBounds._northEast.lng -
          this._rasterBounds._southWest.lng) /
        this.raster.width;
      args.latSpan =
        (this._rasterBounds._northEast.lat -
          this._rasterBounds._southWest.lat) /
        this.raster.height;

      //Draw image data to canvas and pass to image element
      let plotCanvas = document.createElement("canvas");
      plotCanvas.width = this.size.x;
      plotCanvas.height = this.size.y;
      let ctx = plotCanvas.getContext("2d");
      ctx.clearRect(0, 0, plotCanvas.width, plotCanvas.height);

      this._render(ctx, args);

      this._image.src = String(plotCanvas.toDataURL());
      this._image.style.opacity = this.options.opacity;
      this._image.style.zIndex = this.options.zIndex + 100;
    }
  },
  _createColorRamp: function () {
    var _colorRamp = [];
    var noSteps = 10 ** this.options.colorRampSteps;
    var step = (this.options.max - this.options.min) / noSteps;
    for (var i = 0; i < noSteps + 1; i++) {
      let value = this.options.min + step * i;
      var loc =
        (value - this.options.min) / (this.options.max - this.options.min);

      var index = 0;
      for (var j = 0; j < this.options.palette.length - 1; j++) {
        if (
          loc >= this.options.palette[j].point &&
          loc <= this.options.palette[j + 1].point
        ) {
          index = j;
          break;
        }
      }

      var color1 = this.options.palette[index].color;
      var color2 = this.options.palette[index + 1].color;

      var f =
        (loc - this.options.palette[index].point) /
        (this.options.palette[index + 1].point -
          this.options.palette[index].point);

      _colorRamp.push([
        color1[0] + (color2[0] - color1[0]) * f,
        color1[1] + (color2[1] - color1[1]) * f,
        color1[2] + (color2[2] - color1[2]) * f,
      ]);
    }
    this._colorRamp = _colorRamp;
    return _colorRamp;
  },
  _getColor: function (value) {
    if (value === null || isNaN(value)) {
      return false;
    }
    if (value > this.options.max) {
      return this.options.palette[this.options.palette.length - 1].color;
    }
    if (value < this.options.min) {
      return this.options.palette[0].color;
    }

    var index = Math.round(
      ((value - this.options.min) / (this.options.max - this.options.min)) *
        10 ** this.options.colorRampSteps
    );

    return this._colorRamp[index];
  },
  _render: function (ctx, args) {
    ctx.globalAlpha = this.options.opacity;
    const imgData = ctx.createImageData(args.plotWidth, args.plotHeight);
    const data = imgData.data;

    const e = Math.abs(Math.max(args.rasterPixelBounds.min.x, 0));
    const n = Math.abs(Math.max(args.rasterPixelBounds.min.y, 0));

    const rasterWidth = this.raster.width;
    const rasterHeight = this.raster.height;
    const boundsSW = this._rasterBounds._southWest;
    const boundsNE = this._rasterBounds._northEast;
    const latDiff = boundsNE.lat - boundsSW.lat;
    const lngDiff = boundsNE.lng - boundsSW.lng;

    const validpixelexpression =
      this.raster.data.length > 1 && this.options.validpixelexpression;

    let pixelIndex = 0;

    // Loop rows
    for (let y = 0; y < args.plotHeight; y++) {
      // compute latLng at left + right edge of this row
      const latLngLeft = this._map.containerPointToLatLng([e, y + n]);
      const latLngRight = this._map.containerPointToLatLng([
        args.plotWidth + e,
        y + n,
      ]);

      // linear increments per column
      const dLng = (latLngRight.lng - latLngLeft.lng) / args.plotWidth;
      const dLat = (latLngRight.lat - latLngLeft.lat) / args.plotWidth;

      let curLng = latLngLeft.lng;
      let curLat = latLngLeft.lat;

      // Loop cols
      for (let x = 0; x < args.plotWidth; x++) {
        const xx = Math.floor(
          (rasterWidth * (curLng - boundsSW.lng)) / lngDiff
        );
        const yy =
          rasterHeight -
          Math.ceil((rasterHeight * (curLat - boundsSW.lat)) / latDiff);

        if (xx >= 0 && xx < rasterWidth && yy >= 0 && yy < rasterHeight) {
          const ii = yy * rasterWidth + xx;
          const color = this._getColor(this.plotData[ii]);

          if (color) {
            data[pixelIndex] = color[0];
            data[pixelIndex + 1] = color[1];
            data[pixelIndex + 2] = color[2];
            data[pixelIndex + 3] =
              validpixelexpression &&
              this.raster.data[1][ii] === this.options.invalidpixel
                ? 0
                : 255;
          } else {
            data[pixelIndex] = 0;
            data[pixelIndex + 1] = 0;
            data[pixelIndex + 2] = 0;
            data[pixelIndex + 3] = 0;
          }
        } else {
          // transparent if outside bounds
          data[pixelIndex] = 0;
          data[pixelIndex + 1] = 0;
          data[pixelIndex + 2] = 0;
          data[pixelIndex + 3] = 0;
        }

        // step forward
        curLng += dLng;
        curLat += dLat;

        pixelIndex += 4;
      }
    }

    ctx.putImageData(imgData, args.xStart, args.yStart);
  },
  transform: function (rasterImageData, args) {
    //Create image data and Uint32 views of data to speed up copying
    var imageData = new ImageData(args.plotWidth, args.plotHeight);
    var outData = imageData.data;
    var outPixelsU32 = new Uint32Array(outData.buffer);
    var inData = rasterImageData.data;
    var inPixelsU32 = new Uint32Array(inData.buffer);

    var zoom = this._map.getZoom();
    var scale = this._map.options.crs.scale(zoom);
    var d = 57.29577951308232; //L.LatLng.RAD_TO_DEG;

    var transformationA = this._map.options.crs.transformation._a;
    var transformationB = this._map.options.crs.transformation._b;
    var transformationC = this._map.options.crs.transformation._c;
    var transformationD = this._map.options.crs.transformation._d;
    if (L.version >= "1.0") {
      transformationA = transformationA * this._map.options.crs.projection.R;
      transformationC = transformationC * this._map.options.crs.projection.R;
    }

    for (var y = 0; y < args.plotHeight; y++) {
      var yUntransformed =
        ((args.yOrigin + y) / scale - transformationD) / transformationC;
      var currentLat =
        (2 * Math.atan(Math.exp(yUntransformed)) - Math.PI / 2) * d;
      var rasterY =
        this.raster.height -
        Math.ceil(
          (currentLat - this._rasterBounds._southWest.lat) / args.latSpan
        );

      for (var x = 0; x < args.plotWidth; x++) {
        //Location to draw to
        var index = y * args.plotWidth + x;

        //Calculate lat-lng of (x,y)
        //This code is based on leaflet code, unpacked to run as fast as possible
        //Used to deal with TIF being EPSG:4326 (lat,lon) and map being EPSG:3857 (m E,m N)
        var xUntransformed =
          ((args.xOrigin + x) / scale - transformationB) / transformationA;
        var currentLng = xUntransformed * d;
        var rasterX = Math.floor(
          (currentLng - this._rasterBounds._southWest.lng) / args.lngSpan
        );

        var rasterIndex = rasterY * this.raster.width + rasterX;

        //Copy pixel value
        outPixelsU32[index] = inPixelsU32[rasterIndex];
      }
    }
    return imageData;
  },
  _onMousemove: function (t) {
    var e = this._queryValue(t);
    this.fire("mousemove", e);
  },
  _round: function (value, decimals) {
    return Math.round(value * 10 ** decimals) / 10 ** decimals;
  },
  _onClick: function (t) {
    var e = this._queryValue(t);
    this.fire("click", e);
  },
  _queryValue: function (click) {
    click["value"] = this.getValueAtLatLng(click.latlng.lat, click.latlng.lng);
    return click;
  },
  getFeatureValue: function (e) {
    const value = this.getValueAtLatLng(e.latlng.lat, e.latlng.lng);
    if (isFinite(value)) {
      return `${this._round(value, this.options.decimal)} ${this.options.unit}`;
    } else {
      return null;
    }
  },
});

L.floatgeotiff = function (data, options) {
  return new L.FloatGeotiff(data, options);
};

if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
  module.exports = L;
}
