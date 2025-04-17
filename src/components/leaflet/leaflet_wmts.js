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

    if (this._clipPolygon) {
      this._createClipPath();
    }

    map.on("moveend", this._updateClipPath, this);
    map.on("zoomend", this._updateClipPath, this);

    if (map.options.zoomAnimation && L.Browser.any3d) {
      map.on("zoomanim", this._animateZoom, this);
      map.on("zoomend", this._resetClipTransform, this);
    }

    return this;
  },

  onRemove: function (map) {
    map.off("moveend", this._updateClipPath, this);
    map.off("zoomend", this._updateClipPath, this);

    if (map.options.zoomAnimation && L.Browser.any3d) {
      map.off("zoomanim", this._animateZoom, this);
      map.off("zoomend", this._resetClipTransform, this);
    }

    if (this._clipSvg) {
      document.body.removeChild(this._clipSvg);
      this._clipSvg = null;
      this._clipPolygonElement = null;
    }

    L.TileLayer.prototype.onRemove.call(this, map);
  },

  _createClipPath: function () {
    if (!this._clipPolygon || !this._container) return;

    this._clipId = "clip-" + L.Util.stamp(this);

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", 0);
    svg.setAttribute("height", 0);
    svg.style.display = "block";
    svg.style.position = "absolute";
    svg.style.pointerEvents = "none";
    svg.style.transition = "transform 0.3s ease";
    svg.style.transformOrigin = "top left";

    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    const clipPath = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "clipPath"
    );
    clipPath.setAttribute("id", this._clipId);

    const polygon = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "polygon"
    );
    polygon.style.transition = "all 0.3s ease"; // optional smooth morphing
    this._clipPolygonElement = polygon;

    clipPath.appendChild(polygon);
    defs.appendChild(clipPath);
    svg.appendChild(defs);
    document.body.appendChild(svg);

    this._clipSvg = svg;

    this._container.style.clipPath = `url(#${this._clipId})`;
    this._container.style.zIndex = 2;
    this._updateClipPath();
  },

  _updateClipPath: function () {
    if (!this._map || !this._clipPolygon || !this._clipPolygonElement) return;

    window.requestAnimationFrame(() => {
      const points = [];

      const containerPoint = this._map.getContainer().getBoundingClientRect();
      const tileContainerPoint = this._container.getBoundingClientRect();
      const offsetX = tileContainerPoint.left - containerPoint.left;
      const offsetY = tileContainerPoint.top - containerPoint.top;

      for (let i = 0; i < this._clipPolygon.length; i++) {
        const latLng = L.latLng(this._clipPolygon[i]);
        const containerPt = this._map.latLngToContainerPoint(latLng);

        const x = containerPt.x - offsetX;
        const y = containerPt.y - offsetY;

        points.push(`${x},${y}`);
      }

      this._clipPolygonElement.setAttribute("points", points.join(" "));
    });
  },

  _animateZoom: function (e) {
    if (!this._map || !this._clipSvg) return;

    const scale = this._map.getZoomScale(e.zoom);
    const offset = this._map
      ._latLngToNewLayerPoint(this._map.getCenter(), e.zoom, e.center)
      .subtract(this._map._getMapPanePos())
      .multiplyBy(-(scale - 1));

    const transformStr = `translate(${offset.x}px, ${offset.y}px) scale(${scale})`;

    this._clipSvg.style.transition = "transform 0.3s ease";
    this._clipSvg.style.transformOrigin = "top left";
    this._clipSvg.style.transform = transformStr;
  },

  _resetClipTransform: function () {
    if (this._clipSvg) {
      this._clipSvg.style.transition = "";
      this._clipSvg.style.transform = "";
    }
  },

  setClipPolygon: function (polygon) {
    this._clipPolygon = polygon;

    if (this._map) {
      if (this._clipPolygonElement) {
        this._updateClipPath();
      } else {
        this._createClipPath();
      }
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
