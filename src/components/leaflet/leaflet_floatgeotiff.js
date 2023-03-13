import L from "leaflet";
import { min, max } from "d3";
import * as GeoTIFF from "geotiff";

L.FloatGeotiff = L.ImageOverlay.extend({
  options: {
    opacity: 1,
    min: false,
    max: false,
    palette: [
      { color: [255, 255, 255], point: 0 },
      { color: [0, 0, 0], point: 1 },
    ],
    validpixelexpression: true,
  },
  initialize: async function (data, options) {
    this._url = "geotiff.tif";
    this._data = data;
    this.raster = {};
    L.Util.setOptions(this, options);
    this._getData();
  },
  changeOpacity: function (opacity) {
    this._image.style.opacity = opacity;
    this.options.opacity = opacity;
  },
  setData: function (newData) {
    this._data = newData;
    this._getData();
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
    this.raster.width = image.getWidth();
    this.raster.height = image.getHeight();
    if (isNaN(this.options.min)) this.options.min = min(this.raster.data[0]);
    if (isNaN(this.options.max)) this.options.max = max(this.raster.data[0]);
    this._reset();
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
  _reset: function () {
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
    }
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
    var loc =
      (value - this.options.min) / (this.options.max - this.options.min);

    var index = 0;
    for (var i = 0; i < this.options.palette.length - 1; i++) {
      if (
        loc >= this.options.palette[i].point &&
        loc <= this.options.palette[i + 1].point
      ) {
        index = i;
      }
    }
    var color1 = this.options.palette[index].color;
    var color2 = this.options.palette[index + 1].color;

    var f =
      (loc - this.options.palette[index].point) /
      (this.options.palette[index + 1].point -
        this.options.palette[index].point);

    var rgb = [
      color1[0] + (color2[0] - color1[0]) * f,
      color1[1] + (color2[1] - color1[1]) * f,
      color1[2] + (color2[2] - color1[2]) * f,
    ];

    return rgb;
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
      let yy = Math.round(
        ((y + n) / (args.plotHeight + n + s)) * raster.height
      );
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
            ? raster.data[1][ii]
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
    click["value"] = this.getValueAtLatLng(click.latlng.lat, click.latlng.lng)
    return click;
  },
});

L.floatgeotiff = function (data, options) {
  return new L.FloatGeotiff(data, options);
};

if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
  module.exports = L;
}
