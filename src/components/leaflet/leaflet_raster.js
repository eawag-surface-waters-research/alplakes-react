import L from "leaflet";
import { min, max } from "d3";

L.Raster = L.Layer.extend({
  options: {
    opacity: 1,
    min: "null",
    max: "null",
    palette: [
      { color: [255, 255, 255], point: 0 },
      { color: [0, 0, 0], point: 1 },
    ],
  },
  initialize: function (geometry, data, options) {
    this._geometry = geometry;
    this._data = data;
    L.Util.setOptions(this, options);
    if (isNaN(this.options.min)) this.options.min = min(data.flat());
    if (isNaN(this.options.max)) this.options.max = max(data.flat());
  },
  onAdd: function (map) {
    this.raster = L.layerGroup().addTo(map);
    this.plotPolygons();
  },
  onRemove: function (map) {
    map.removeLayer(this.raster);
  },
  plotPolygons: function () {
    var y = this._data.length;
    var x = this._data[0].length;
    for (var i = 1; i < y - 1; i++) {
      for (var j = 1; j < x - 1; j++) {
        if (!isNaN(this._data[i][j])) {
          let color = this._getColor(
            this._data[i][j],
            this.options.min,
            this.options.max,
            this.options.palette
          );
          let coords = this._getCellCorners(this._geometry, i, j, x);
          this.raster.addLayer(
            L.polygon(coords, {
              color: `rgb(${color.join(",")})`,
              fillColor: `rgb(${color.join(",")})`,
              fillOpacity: 1,
            })
          );
        }
      }
    }
  },
  _getCellCorners: function (data, i, j, x) {
    function cellCorner(center, opposite, left, right) {
      if (isNaN(center[0])) {
        return false;
      } else if (!isNaN(opposite[0]) && !isNaN(left[0]) && !isNaN(right[0])) {
        var m1 = (center[1] - opposite[1]) / (center[0] - opposite[0]);
        var m2 = (left[1] - right[1]) / (left[0] - right[0]);
        m1 = isFinite(m1) ? m1 : 0.0;
        m2 = isFinite(m2) ? m2 : 0.0;
        var c1 = opposite[1] - m1 * opposite[0];
        var c2 = right[1] - m2 * right[0];
        var x = (c2 - c1) / (m1 - m2);
        var y = m1 * x + c1;
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
      return [tl, bl, br, tr];
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
});

L.raster = function (geometry, data, options) {
  return new L.Raster(geometry, data, options);
};

if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
  module.exports = L;
}
