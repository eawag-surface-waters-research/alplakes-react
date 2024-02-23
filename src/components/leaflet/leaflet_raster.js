import L from "leaflet";
import { min, max } from "d3";

L.Raster = L.Layer.extend({
  options: {
    parameter: "",
    unit: "",
    opacity: 1,
    min: "null",
    max: "null",
    zIndex: 1,
    tooltipSensitivity: 500,
    interpolate: false,
    palette: [
      { color: [255, 255, 255], point: 0 },
      { color: [0, 0, 0], point: 1 },
    ],
  },
  initialize: function (geometry, data, options) {
    this._geometry = geometry;
    this._dataWidth = geometry[0].length / 2;
    this._dataHeight = geometry.length;
    this._data = data;
    this._grid_vertices();
    L.Util.setOptions(this, options);
    if (isNaN(this.options.min)) this.options.min = min(data.flat());
    if (isNaN(this.options.max)) this.options.max = max(data.flat());
    this._values = [];
    this._points = [];
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
      "leaflet-raster-layer leaflet-layer"
    ));

    var originProp = L.DomUtil.testProp([
      "transformOrigin",
      "WebkitTransformOrigin",
      "msTransformOrigin",
    ]);
    canvas.style[originProp] = "50% 50%";
    canvas.style.opacity = this.options.opacity;
    canvas.style.zIndex = this.options.zIndex + 100;

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
  update: function (data, options) {
    this._data = data;
    L.Util.setOptions(this, options);
    this._canvas.style.opacity = this.options.opacity;
    this._canvas.style.zIndex = this.options.zIndex + 100;
    this._reset();
  },
  _grid_vertices: function () {
    var vertices = [];
    for (var i = 1; i < this._dataHeight - 1; i++) {
      for (var j = 1; j < this._dataWidth - 1; j++) {
        let coords = this._getCellCorners(
          this._geometry,
          i,
          j,
          this._dataWidth
        );
        vertices.push(coords);
      }
    }
    this._vertices = vertices;
  },
  _reset: function (event) {
    var topLeft = this._map.containerPointToLayerPoint([0, 0]);
    var size = this._map.getSize();
    this._canvas.width = size.x;
    this._canvas.height = size.y;
    this._width = size.x;
    this._height = size.y;
    L.DomUtil.setPosition(this._canvas, topLeft);
    this._drawLayer();
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
  _drawLayer: function () {
    this._ctx.clearRect(0, 0, this._width, this._height);
    var cell = 0;
    var values = [];
    var points = [];
    var i, j, value;
    if (this.options.interpolate !== false && this._data.length === 2) {
      var start = this._data[0];
      var end = this._data[1];
      for (i = 1; i < this._dataHeight - 1; i++) {
        for (j = 1; j < this._dataWidth - 1; j++) {
          if (!isNaN(start[i][j]) && !isNaN(end[i][j])) {
            value =
              start[i][j] +
              (end[i][j] - start[i][j]) * this.options.interpolate;
            if ("vector" in this.options && this.options.vector) {
              let value2 =
                start[i][j + this._dataWidth] +
                (end[i][j + this._dataWidth] - start[i][j + this._dataWidth]) *
                  this.options.interpolate;
              value = Math.sqrt(value ** 2 + value2 ** 2);
            }
            let color = this._getColor(
              value,
              this.options.min,
              this.options.max,
              this.options.palette
            );
            values.push(value);
            points.push(
              L.latLng([
                this._geometry[i][j],
                this._geometry[i][j + this._dataWidth],
              ])
            );
            let coords = this._vertices[cell];
            this._drawCell(this._ctx, coords, `rgb(${color.join(",")})`);
          }
          cell++;
        }
      }
    } else {
      for (i = 1; i < this._dataHeight - 1; i++) {
        for (j = 1; j < this._dataWidth - 1; j++) {
          if (!isNaN(this._data[i][j])) {
            value = this._data[i][j];
            if ("vector" in this.options && this.options.vector) {
              let value2 = this._data[i][j + this._dataWidth];
              value = Math.sqrt(value ** 2 + value2 ** 2);
            }
            let color = this._getColor(
              value,
              this.options.min,
              this.options.max,
              this.options.palette
            );
            values.push(value);
            points.push(
              L.latLng([
                this._geometry[i][j],
                this._geometry[i][j + this._dataWidth],
              ])
            );
            let coords = this._vertices[cell];
            this._drawCell(this._ctx, coords, `rgb(${color.join(",")})`);
          }
          cell++;
        }
      }
    }
    this._points = points;
    this._values = values;
  },
  _drawCell: function (ctx, coords, color) {
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.beginPath();
    let p = this._map.latLngToContainerPoint(coords[0]);
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(p.x, p.y);
    for (var i = 1; i < coords.length; i++) {
      let p = this._map.latLngToContainerPoint(coords[i]);
      ctx.lineTo(p.x, p.y);
    }
    ctx.closePath();
    ctx.stroke();
    ctx.fill();
  },
  _getCellCorners: function (data, i, j, x) {
    function cellCorner(center, opposite, left, right) {
      if (isNaN(center[0])) {
        return false;
      } else if (!isNaN(opposite[0]) && !isNaN(left[0]) && !isNaN(right[0])) {
        var x = ( opposite[0] + left[0] + right[0] + center[0] ) / 4
        var y = ( opposite[1] + left[1] + right[1] + center[1] ) / 4
        return [x, y];
      } else if (!isNaN(opposite[0])) {
        let x = center[0] + (opposite[0] - center[0]) / 2;
        let y = center[1] + (opposite[1] - center[1]) / 2;
        return [x, y];
      } else if (!isNaN(left[0]) && !isNaN(right[0])) {
        let x = left[0] + (right[0] - left[0]) / 2;
        let y = left[1] + (right[1] - left[1]) / 2;
        return [x, y];
      } else if (!isNaN(right[0])) {
        let x =
          center[0] + (right[0] - center[0]) / 2 + (right[1] - center[1]) / 2;
        let y =
          center[1] + (right[1] - center[1]) / 2 - (right[0] - center[0]) / 2;
        return [x, y];
      } else if (!isNaN(left[0])) {
        let x =
          center[0] + (left[0] - center[0]) / 2 - (left[1] - center[1]) / 2;
        let y =
          center[1] + (left[1] - center[1]) / 2 + (left[0] - center[0]) / 2;
        return [x, y];
      } else {
        return false;
      }
    }

    function oppositePoint(center, corner) {
      let x = center[0] + center[0] - corner[0];
      let y = center[1] + center[1] - corner[1];
      return [x, y];
    }
    // TopLeft
    var tl = cellCorner(
      [data[i][j], data[i][j + x]],
      [data[i - 1][j - 1], data[i - 1][j - 1 + x]],
      [data[i][j - 1], data[i][j - 1 + x]],
      [data[i - 1][j], data[i - 1][j + x]]
    );
    // BottomLeft
    var bl = cellCorner(
      [data[i][j], data[i][j + x]],
      [data[i + 1][j - 1], data[i + 1][j - 1 + x]],
      [data[i + 1][j], data[i + 1][j + x]],
      [data[i][j - 1], data[i][j - 1 + x]]
    );
    // BottomRight
    var br = cellCorner(
      [data[i][j], data[i][j + x]],
      [data[i + 1][j + 1], data[i + 1][j + 1 + x]],
      [data[i][j + 1], data[i][j + 1 + x]],
      [data[i + 1][j], data[i + 1][j + x]]
    );
    // TopRight
    var tr = cellCorner(
      [data[i][j], data[i][j + x]],
      [data[i - 1][j + 1], data[i - 1][j + 1 + x]],
      [data[i - 1][j], data[i - 1][j + x]],
      [data[i][j + 1], data[i][j + 1 + x]]
    );
    if (!tl && br) tl = oppositePoint([data[i][j], data[i][j + x]], br);
    if (!bl && tr) bl = oppositePoint([data[i][j], data[i][j + x]], tr);
    if (!br && tl) br = oppositePoint([data[i][j], data[i][j + x]], tl);
    if (!tr && bl) tr = oppositePoint([data[i][j], data[i][j + x]], bl);
    if (tl && bl && br && tr) {
      return [L.latLng(tl), L.latLng(bl), L.latLng(br), L.latLng(tr)];
    } else {
      return false;
    }
  },
  _getColor: function (value, min, max, palette) {
    if (value === null || isNaN(value)) {
      return false;
    }
    if (value > max) {
      return palette[palette.length - 1].color;
    }
    if (value < min) {
      return palette[0].color;
    }
    var loc = (value - min) / (max - min);

    var index = 0;
    for (var i = 0; i < palette.length - 1; i++) {
      if (loc >= palette[i].point && loc <= palette[i + 1].point) {
        index = i;
      }
    }
    var color1 = palette[index].color;
    var color2 = palette[index + 1].color;

    var f =
      (loc - palette[index].point) /
      (palette[index + 1].point - palette[index].point);

    var rgb = [
      color1[0] + (color2[0] - color1[0]) * f,
      color1[1] + (color2[1] - color1[1]) * f,
      color1[2] + (color2[2] - color1[2]) * f,
    ];

    return rgb;
  },
  _onMousemove: function (t) {
    try {
      var e = this._queryValue(t);
      this.fire("mousemove", e);
    } catch (e) {
      console.error("Leaflet raster mousemove event failed.", e);
    }
  },
  _onClick: function (t) {
    try {
      var e = this._queryValue(t);
      this.fire("click", e);
    } catch (e) {
      console.error("Leaflet raster click event failed.", e);
    }
  },
  getFeatureValue: function (t) {
    try {
      return this._getValue(t.latlng);
    } catch (e) {
      console.error("Leaflet raster getFeatureValue event failed.", e);
    }
  },
  _queryValue: function (e) {
    e["value"] = this._getValue(e.latlng);
    return e;
  },
  _getValue: function (latlng) {
    var closest = null;
    var closestDistance = Infinity;
    for (var i = 0; i < this._points.length; i++) {
      let distance = latlng.distanceTo(this._points[i]);
      if (distance < closestDistance) {
        closest = i;
        closestDistance = distance;
      }
    }
    if (closest && closestDistance < this.options.tooltipSensitivity) {
      return this._values[closest];
    } else {
      return null;
    }
  },
});

L.raster = function (geometry, data, options) {
  return new L.Raster(geometry, data, options);
};

if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
  module.exports = L;
}
