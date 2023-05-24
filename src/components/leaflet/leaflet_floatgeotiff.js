import L from "leaflet";
import { min, max, mean } from "d3";
import * as GeoTIFF from "geotiff";

L.FloatGeotiff = L.ImageOverlay.extend({
  options: {
    opacity: 1,
    min: false,
    max: false,
    unit: "",
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
    this._data = data;
    this.raster = {};
    L.Util.setOptions(this, options);
    this._getData();
  },
  update: function (newData, options) {
    L.Util.setOptions(this, options);
    if (newData !== false) this._data = newData;
    this._getData();
  },
  onAdd: function (map) {
    this._map = map;
    if (!this._image) {
      this._initImage();
    }
    map._panes.overlayPane.appendChild(this._image);
    map.on("click", this._onClick, this);
    map.on("moveend", this._redraw, this);
    map.on("mousemove", this._onMousemove, this);
    if (map.options.zoomAnimation && L.Browser.any3d) {
      map.on("zoomanim", this._animateZoom, this);
    }
    this._redraw();
  },
  onRemove: function (map) {
    map.getPanes().overlayPane.removeChild(this._image);
    map.off("moveend", this._redraw, this);
    map.off("click", this._onClick, this);
    map.off("mousemove", this._onMousemove, this);
    if (map.options.zoomAnimation) {
      map.off("zoomanim", this._animateZoom, this);
    }
  },
  _getData: async function () {
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
    if (this.options.convolve > 0) {
      this._convolve();
    }
    if (this.options.min === undefined)
      this.options.min = min(this.raster.data[0]);
    if (this.options.min === undefined)
      this.options.max = max(this.raster.data[0]);
    this._colorRamp = this._createColorRamp();
    this._redraw();
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
    var matrix = this._createConvolutionMatrix(2 * this.options.convolve + 1);
    for (
      var h = this.options.convolve;
      h < this.raster.height - this.options.convolve;
      h++
    ) {
      for (
        var w = this.options.convolve;
        w < this.raster.width - this.options.convolve;
        w++
      ) {
        let index = h * this.raster.width + w;
        if (
          !isNaN(this.raster.data[0][index]) &&
          this.raster.data[1][index] !== this.options.invalidpixel
        ) {
          var values = [];
          for (var i = 0; i < matrix.length; i++) {
            for (var j = 0; j < matrix.length; j++) {
              let wi = w + matrix[i][j][0];
              let hi = h + matrix[i][j][1];
              let ii = hi * this.raster.width + wi;
              if (
                !isNaN(this.raster.data[0][ii]) &&
                this.raster.data[1][ii] !== this.options.invalidpixel
              ) {
                values.push(this.raster.data[0][ii]);
              }
            }
          }
          if (values.length > 0) {
            this.raster.data[0][index] = mean(values);
          }
        }
      }
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
    if (L.version >= "1.0") {
      var scale = this._map.getZoomScale(e.zoom),
        offset = this._map._latLngBoundsToNewLayerBounds(
          this._map.getBounds(),
          e.zoom,
          e.center
        ).min;
      L.DomUtil.setTransform(this._image, offset, scale);
    } else {
      this.scale = this._map.getZoomScale(e.zoom);
      this.nw = this._map.getBounds().getNorthWest();
      this.se = this._map.getBounds().getSouthEast();
      this.topLeft = this._map._latLngToNewLayerPoint(
        this.nw,
        e.zoom,
        e.center
      );
      this.size = this._map
        ._latLngToNewLayerPoint(this.se, e.zoom, e.center)
        ._subtract(this.topLeft);
      this._image.style[L.DomUtil.TRANSFORM] =
        L.DomUtil.getTranslateString(this.topLeft) +
        " scale(" +
        this.scale +
        ") ";
    }
  },
  _reset: function () {},
  _redraw: function () {
    if (this.hasOwnProperty("_map")) {
      if (this._rasterBounds) {
        this.topLeft = this._map.latLngToLayerPoint(
          this._map.getBounds().getNorthWest()
        );
        this.size = this._map
          .latLngToLayerPoint(this._map.getBounds().getSouthEast())
          ._subtract(this.topLeft);

        L.DomUtil.setPosition(this._image, this.topLeft);
        this._image.style.width = this.size.x + "px";
        this._image.style.height = this.size.y + "px";

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

      this._render(this.raster, plotCanvas, ctx, args);

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
  _render: function (raster, plotCanvas, ctx, args) {
    ctx.globalAlpha = this.options.opacity;
    var imgData = ctx.createImageData(args.plotWidth, args.plotHeight);
    var n = Math.abs(Math.min(args.rasterPixelBounds.min.y, 0));
    var e = Math.abs(Math.min(args.xFinish - args.rasterPixelBounds.max.x, 0));
    var s = Math.abs(Math.min(args.yFinish - args.rasterPixelBounds.max.y, 0));
    var w = Math.abs(Math.min(args.rasterPixelBounds.min.x, 0));
    var validpixelexpression =
      this.raster.data.length > 1 && this.options.validpixelexpression;
    for (let y = 0; y < args.plotHeight; y++) {
      let yy =
        Math.round(((y + n) / (args.plotHeight + n + s)) * raster.height) - 5; // Needs fixing
      for (let x = 0; x < args.plotWidth; x++) {
        let xx = Math.round(
          ((x + w) / (args.plotWidth + e + w)) * raster.width
        );
        let ii = yy * raster.width + xx;
        let i = y * args.plotWidth + x;
        let color = this._getColor(raster.data[0][ii]);
        if (color) {
          imgData.data[i * 4 + 0] = color[0];
          imgData.data[i * 4 + 1] = color[1];
          imgData.data[i * 4 + 2] = color[2];
          imgData.data[i * 4 + 3] = validpixelexpression
            ? raster.data[1][ii] === this.options.invalidpixel
              ? 0
              : 255
            : 255;
        } else {
          imgData.data[i * 4 + 0] = 0;
          imgData.data[i * 4 + 1] = 0;
          imgData.data[i * 4 + 2] = 0;
          imgData.data[i * 4 + 3] = 0;
        }
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
      return `${Math.round(value * 100) / 100} ${this.options.unit}`;
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
