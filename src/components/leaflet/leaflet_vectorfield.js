import L from "leaflet";
import { min, max } from "d3";

L.VectorField = (L.Layer ? L.Layer : L.Class).extend({
  options: {
    vectorArrowColor: false,
    size: 20,
    min: "null",
    max: "null",
    palette: [
      { color: [68, 1, 84], point: 0 },
      { color: [59, 82, 139], point: 0.25 },
      { color: [33, 145, 140], point: 0.5 },
      { color: [94, 201, 98], point: 0.75 },
      { color: [253, 231, 37], point: 1 },
    ],
  },
  initialize: function (geometry, data, options) {
    L.Util.setOptions(this, options);
    this._dataWidth = geometry[0].length / 2;
    this._dataHeight = geometry.length;
    this._geometry = geometry;
    this._data = data;
    if (isNaN(this.options.min)) this.options.min = min(data.flat());
    if (isNaN(this.options.max)) this.options.max = max(data.flat());
  },
  onAdd: function (map) {
    this._map = map;

    if (!this._canvas) {
      this._initCanvas();
    }

    if (this.options.pane) {
      this.getPane().appendChild(this._canvas);
    } else {
      map._panes.overlayPane.appendChild(this._canvas);
    }
    map.on("click", this._onClick, this);
    map.on("moveend", this._reset, this);
    map.on("mousemove", this._onMousemove, this);
    if (map.options.zoomAnimation && L.Browser.any3d) {
      map.on("zoomanim", this._animateZoom, this);
    }
    this._reset();
  },
  _initCanvas: function () {
    var canvas = (this._canvas = L.DomUtil.create(
      "canvas",
      "leaflet-vectorfield-layer leaflet-layer"
    ));

    var originProp = L.DomUtil.testProp([
      "transformOrigin",
      "WebkitTransformOrigin",
      "msTransformOrigin",
    ]);
    canvas.style[originProp] = "50% 50%";

    var size = this._map.getSize();
    canvas.width = size.x;
    canvas.height = size.y;

    var animated = this._map.options.zoomAnimation && L.Browser.any3d;
    L.DomUtil.addClass(
      canvas,
      "leaflet-zoom-" + (animated ? "animated" : "hide")
    );

    this._canvas = canvas;
    this._ctx = canvas.getContext("2d");
    this._width = canvas.width;
    this._height = canvas.height;
  },
  onRemove: function (map) {
    if (this.options.pane) {
      this.getPane().removeChild(this._canvas);
    } else {
      map.getPanes().overlayPane.removeChild(this._canvas);
    }
    map.off("click", this._onClick, this);
    map.off("moveend", this._reset, this);
    map.off("mousemove", this._onMousemove, this);

    if (map.options.zoomAnimation) {
      map.off("zoomanim", this._animateZoom, this);
    }
  },
  redraw: function () {
    if (!this._frame && this._map && !this._map._animating) {
      this._frame = L.Util.requestAnimFrame(this._redraw, this);
    }
    return this;
  },
  _reset: function () {
    var topLeft = this._map.containerPointToLayerPoint([0, 0]);
    var size = this._map.getSize();
    this._canvas.width = size.x;
    this._canvas.height = size.y;
    this._width = size.x;
    this._height = size.y;
    L.DomUtil.setPosition(this._canvas, topLeft);
    this._redraw();
  },

  _firstPixel: function () {
    for (var i = 0; i < this._dataWidth - 1; i++) {
      for (var j = 0; j < this._dataHeight - 1; j++) {
        if (
          !isNaN(this._geometry[i][j]) &&
          !isNaN(this._geometry[i + 1][j]) &&
          !isNaN(this._geometry[i][j + 1]) &&
          !isNaN(this._geometry[i + 1][j + 1])
        ) {
          return { i, j };
        }
      }
    }
  },

  _pixelSize: function () {
    var { i, j } = this._firstPixel();
    var i0j0 = this._map.latLngToContainerPoint(
      L.latLng(this._geometry[i][j], this._geometry[i][j + this._dataWidth])
    );
    var i1j0 = this._map.latLngToContainerPoint(
      L.latLng(
        this._geometry[i + 1][j],
        this._geometry[i + 1][j + this._dataWidth]
      )
    );
    var i0j1 = this._map.latLngToContainerPoint(
      L.latLng(
        this._geometry[i][j + 1],
        this._geometry[i][j + 1 + this._dataWidth]
      )
    );
    var i1j1 = this._map.latLngToContainerPoint(
      L.latLng(
        this._geometry[i + 1][j + 1],
        this._geometry[i + 1][j + 1 + this._dataWidth]
      )
    );
    var apixelx = [i0j0.x, i1j0.x, i0j1.x, i1j1.x];
    var apixely = [i0j0.x, i1j0.x, i0j1.x, i1j1.x];

    var pixelx = Math.max(...apixelx) - Math.min(...apixelx);
    var pixely = Math.max(...apixely) - Math.min(...apixely);

    return Math.max(pixelx, pixely);
  },

  _drawArrow: function (cell, ctx, size) {
    var { center, value, rotation } = cell;

    size =
      size * 0.5 +
      (size * (value - this.options.min)) /
        (this.options.max - this.options.min);

    // Arrow Center
    ctx.save();
    ctx.translate(center.x, center.y);

    // Arrow Color
    var color = [0, 0, 0];
    if (this.options.vectorArrowColor) {
      color = this._getColor(value);
    }
    ctx.strokeStyle = `rgb(${color.join(",")})`;

    // Arrow Rotation
    if (value === 0) rotation = Math.PI / 4;
    ctx.rotate(rotation); // Rotation in rads

    // Set other properties
    ctx.globalAlpha = 1;
    ctx.lineWidth = 1;

    // Draw Path
    if (value === 0) {
      ctx.beginPath();
      ctx.moveTo(-size / 4, 0);
      ctx.lineTo(+size / 4, 0);
      ctx.moveTo(0, -size / 4);
      ctx.lineTo(0, +size / 4);
      ctx.stroke();
      ctx.restore();
    } else {
      ctx.beginPath();
      ctx.moveTo(-size / 2, 0);
      ctx.lineTo(+size / 2, 0);
      ctx.moveTo(size * 0.15, -size * 0.15);
      ctx.lineTo(+size / 2, 0);
      ctx.lineTo(size * 0.15, size * 0.15);
      ctx.stroke();
      ctx.restore();
    }
  },
  _drawArrows: function () {
    var ctx = this._ctx;
    ctx.clearRect(0, 0, this._width, this._height);

    var i, j, k, l, latlng, p, value, rotation, cell;
    var lat, lng, vx, vy, alat, alng, avx, avy;
    var { size } = this.options;

    var pixelSize = this._pixelSize();

    var stride = Math.max(1, Math.floor((1.2 * size) / pixelSize));

    if (stride === 1) {
      size = pixelSize * 0.5;
    }

    var maxRow = (Math.floor(this._dataHeight / stride) - 1) * stride + 1;
    var maxCol = (Math.floor(this._dataWidth / stride) - 1) * stride + 1;

    for (i = 0; i < maxRow; i += stride) {
      for (j = 0; j < maxCol; j += stride) {
        alat = [];
        alng = [];
        avx = [];
        avy = [];
        for (k = 0; k < stride; k++) {
          for (l = 0; l < stride; l++) {
            if (!isNaN(this._data[i + k][j + l])) {
              alat.push(this._geometry[i + k][j + l]);
              alng.push(this._geometry[i + k][j + l + this._dataWidth]);
              avx.push(this._data[i + k][j + l]);
              avy.push(this._data[i + k][j + l + this._dataWidth]);
            }
          }
        }

        if (alat.length > 0) {
          lat = this._getAve(alat);
          lng = this._getAve(alng);
          vx = this._getAve(avx);
          vy = this._getAve(avy);

          latlng = L.latLng(lat, lng);
          p = this._map.latLngToContainerPoint(latlng);
          value = Math.abs(Math.sqrt(Math.pow(vx, 2) + Math.pow(vy, 2)));
          rotation = Math.atan2(vx, vy) - Math.PI / 2;

          cell = { center: p, value: value, rotation: rotation };
          this._drawArrow(cell, ctx, size);
        }
      }
    }
  },

  _getAve: function (arr) {
    const sum = arr.reduce((a, b) => a + b, 0);
    return sum / arr.length || 0;
  },

  _hex: function (c) {
    var s = "0123456789abcdef";
    var i = parseInt(c, 10);
    if (i === 0 || isNaN(c)) return "00";
    i = Math.round(Math.min(Math.max(0, i), 255));
    return s.charAt((i - (i % 16)) / 16) + s.charAt(i % 16);
  },

  _trim: function (s) {
    return s.charAt(0) === "#" ? s.substring(1, 7) : s;
  },

  _convertToRGB: function (hex) {
    var color = [];
    color[0] = parseInt(this._trim(hex).substring(0, 2), 16);
    color[1] = parseInt(this._trim(hex).substring(2, 4), 16);
    color[2] = parseInt(this._trim(hex).substring(4, 6), 16);
    return color;
  },

  _convertToHex: function (rgb) {
    return this._hex(rgb[0]) + this._hex(rgb[1]) + this._hex(rgb[2]);
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

  _redraw: function () {
    if (!this._map) {
      return;
    }
    this._drawArrows();
  },

  _animateZoom: function (e) {
    var scale = this._map.getZoomScale(e.zoom),
      offset = this._map
        ._getCenterOffset(e.center)
        ._multiplyBy(-scale)
        .subtract(this._map._getMapPanePos());

    if (L.DomUtil.setTransform) {
      L.DomUtil.setTransform(this._canvas, offset, scale);
    } else {
      this._canvas.style[L.DomUtil.TRANSFORM] =
        L.DomUtil.getTranslateString(offset) + " scale(" + scale + ")";
    }
  },

  _onMousemove: function (t) {
    //var e = this._queryValue(t);
    this.fire("mousemove", t);
  },

  _onClick: function (t) {
    var e = this._queryValue(t);
    this.fire("click", e);
  },

  _queryValue: function (click) {
    let point = this._WGSlatlngtoCH(click.latlng.lat, click.latlng.lng);
    let data = this._data.flat().filter((i) => i !== null);
    data = data.map((d) => {
      return {
        data: d,
        dist: Math.sqrt((d[0] - point.y) ** 2 + (d[1] - point.x) ** 2),
      };
    });
    data.sort((a, b) => (a.dist > b.dist ? 1 : -1));
    let u = null;
    let v = null;
    if (data[0].dist < 300) {
      u = data[0].data[3];
      v = data[0].data[4];
    }
    click["value"] = { u, v };
    return click;
  },
});

L.vectorfield = function (data, options) {
  return new L.VectorField(data, options);
};
