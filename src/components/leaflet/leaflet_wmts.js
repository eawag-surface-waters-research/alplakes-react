import L from "leaflet";

L.TileLayer.ClippedWMTS = L.TileLayer.extend({
  options: {
    crossOrigin: "anonymous",
  },
  defaultWmtsParams: {
    service: "WMTS",
    request: "GetTile",
    version: "1.0.0",
    layer: "",
    style: "",
    tilematrixset: "",
    format: "image/png",
  },

  initialize: function (url, options) {
    this._url = url;
    var wmtsParams = L.extend({}, this.defaultWmtsParams);
    for (var i in options) {
      if (!this.options.hasOwnProperty(i) && i !== "clipPolygon") {
        wmtsParams[i] = options[i];
      }
    }
    this.wmtsParams = wmtsParams;
    this._clipPolygon = options.clipPolygon || null;
    L.setOptions(this, options);
  },

  getTileUrl: function (coords) {
    if (this.options.layer) {
      var tileMatrix = this.options.tilematrixset + ":" + coords.z;
      var url = L.Util.template(this._url, { s: this._getSubdomain(coords) });

      return (
        url +
        L.Util.getParamString(
          L.extend({}, this.wmtsParams, {
            TileMatrix: tileMatrix,
            TileRow: coords.y,
            TileCol: coords.x,
          }),
          url
        )
      );
    } else {
      return L.Util.template(this._url, {
        s: this._getSubdomain(coords),
        z: coords.z,
        x: coords.x,
        y: coords.y,
      });
    }
  },

  onAdd: function (map) {
    L.TileLayer.prototype.onAdd.call(this, map);
    this._map = map;

    if (this._container) {
      this._container.style.zIndex = 2;
    }

    if (this._clipPolygon) {
      this._updateClipPath();
    }

    map.on("moveend", this._updateClipPath, this);
    map.on("zoomend", this._updateClipPath, this);

    if (map.options.zoomAnimation && L.Browser.any3d) {
      map.on("zoomanim", this._animateZoom, this);
    }

    return this;
  },

  onRemove: function (map) {
    map.off("moveend", this._updateClipPath, this);
    map.off("zoomend", this._updateClipPath, this);

    if (map.options.zoomAnimation && L.Browser.any3d) {
      map.off("zoomanim", this._animateZoom, this);
    }

    // Clear any clip-path styling
    if (this._container) {
      this._container.style.clipPath = "";
      this._container.style.webkitClipPath = "";
    }

    L.TileLayer.prototype.onRemove.call(this, map);
  },

  _updateClipPath: function () {
    if (!this._map || !this._clipPolygon || !this._container) return;

    // Create an array to store polygon points
    const points = [];

    // Convert each lat/lng in the polygon to container points
    for (let i = 0; i < this._clipPolygon.length; i++) {
      const latLng = L.latLng(this._clipPolygon[i]);
      const point = this._map.latLngToContainerPoint(latLng);

      // Get the position relative to the tile container
      const containerPos = this._map.getContainer().getBoundingClientRect();
      const tilePos = this._container.getBoundingClientRect();

      const x = point.x - (tilePos.left - containerPos.left);
      const y = point.y - (tilePos.top - containerPos.top);

      points.push(`${x}px ${y}px`);
    }

    // Create the CSS polygon clip-path value
    const clipValue = `polygon(${points.join(", ")})`;

    // Apply the clip path to the container with vendor prefixes for maximum compatibility
    this._container.style.clipPath = clipValue;
    this._container.style.webkitClipPath = clipValue; // For Safari
  },

  _animateZoom: function (e) {
    if (!this._map || !this._container) return;

    // Update clip path immediately after zoom animation completes
    this._map.once("zoomend", this._updateClipPath, this);
  },

  getFeatureValue: function (e) {
    const latlng = e.latlng || e;
    if (!this._insidePolygon(latlng)) return null;
    var size = this.getTileSize();
    var point = this._map.project(latlng, this._tileZoom).floor();
    var coords = point.unscaleBy(size).floor();
    var offset = point.subtract(coords.scaleBy(size));
    coords.z = this._tileZoom;
    var tile = this._tiles[this._tileCoordsToKey(coords)];
    if (!tile || !tile.loaded) return null;
    try {
      var canvas = document.createElement("canvas");
      canvas.width = 1;
      canvas.height = 1;
      var context = canvas.getContext("2d");
      context.drawImage(tile.el, -offset.x, -offset.y, size.x, size.y);
      const rgb = context.getImageData(0, 0, 1, 1).data.toString();
      if (this.options.lookup && rgb in this.options.lookup) {
        return this.options.lookup[rgb];
      }
      return null;
    } catch (e) {
      return null;
    }
  },

  _insidePolygon: function (latlng) {
    let inside = false;
    const n = this._clipPolygon.length;
    let x = latlng.lng,
      y = latlng.lat;
    let xinters;
    let p1x, p1y, p2x, p2y;
    let i,
      j = n - 1;

    for (i = 0; i < n; i++) {
      p1x = this._clipPolygon[i][1];
      p1y = this._clipPolygon[i][0];
      p2x = this._clipPolygon[j][1];
      p2y = this._clipPolygon[j][0];
      if (y > Math.min(p1y, p2y)) {
        if (y <= Math.max(p1y, p2y)) {
          if (x <= Math.max(p1x, p2x)) {
            if (p1y !== p2y) {
              xinters = ((y - p1y) * (p2x - p1x)) / (p2y - p1y) + p1x;
            }
            if (p1x === p2x || x <= xinters) {
              inside = !inside;
            }
          }
        }
      }
      j = i;
    }

    return inside;
  },

  setClipPolygon: function (polygon) {
    this._clipPolygon = polygon;

    if (this._map) {
      this._updateClipPath();
    }

    return this;
  },
});

L.TileLayer.WMTS = L.TileLayer.extend({
  defaultWmtsParams: {
    service: "WMTS",
    request: "GetTile",
    version: "1.0.0",
    layer: "",
    style: "",
    tilematrixset: "",
    format: "image/png",
  },

  initialize: function (url, options) {
    this._url = url;
    var wmtsParams = L.extend({}, this.defaultWmtsParams);
    for (var i in options) {
      if (!this.options.hasOwnProperty(i)) {
        wmtsParams[i] = options[i];
      }
    }
    this.wmtsParams = wmtsParams;
    L.setOptions(this, options);
  },

  getTileUrl: function (coords) {
    if (this.options.layer) {
      var tileMatrix = this.options.tilematrixset + ":" + coords.z;
      var url = L.Util.template(this._url, { s: this._getSubdomain(coords) });

      return (
        url +
        L.Util.getParamString(
          L.extend({}, this.wmtsParams, {
            TileMatrix: tileMatrix,
            TileRow: coords.y,
            TileCol: coords.x,
          }),
          url
        )
      );
    } else {
      return L.Util.template(this._url, {
        s: this._getSubdomain(coords),
        z: coords.z,
        x: coords.x,
        y: coords.y,
      });
    }
  },
});

L.tileLayer.clippedWmts = function (url, options) {
  return new L.TileLayer.ClippedWMTS(url, options);
};

L.tileLayer.wmts = function (url, options) {
  return new L.TileLayer.WMTS(url, options);
};
