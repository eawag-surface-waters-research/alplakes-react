import L from "leaflet";

L.TileLayer.ClippedWMTS = L.TileLayer.extend({
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
