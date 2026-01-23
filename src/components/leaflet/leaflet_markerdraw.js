import L from "leaflet";

L.Control.MarkerDraw = L.Control.extend({
  options: {
    position: "topleft",
    markerIconUrl: "marker-icon.png",
    fire: false,
    layer: false,
    id: "map",
    enabledFunction: false,
    svgIcon: "",
    title: "",
    hover: "",
  },

  onAdd: function (map) {
    this._map = map;
    this._container = L.DomUtil.create(
      "div",
      "leaflet-bar leaflet-draw-toolbar",
    );

    var button = L.DomUtil.create("a", "leaflet-draw", this._container);
    button.href = "#";
    button.title = this.options.title;
    button.innerHTML = this.options.svgIcon;

    L.DomEvent.on(button, "click", this._toggleAdding, this);
    return this._container;
  },

  onRemove: function (map) {
    L.DomUtil.removeClass(this._container, "leaflet-draw-enabled");
    this._map.off("keydown", this._finishDrawingOnKeyPress, this);
    document.getElementById(this.options.id).style.removeProperty("cursor");
  },

  _toggleAdding: function (e) {
    e.preventDefault();
    if (this._isAdding) {
      this._disableDrawing();
    } else {
      e.stopPropagation();
      this._enableDrawing();
    }
  },

  _enableDrawing: function () {
    if (typeof this.options.enabledFunction === "function") {
      this.options.enabledFunction();
    }
    this._isAdding = true;
    this._map.dragging.disable();
    L.DomUtil.addClass(this._container, "leaflet-draw-enabled");
    document.getElementById(this.options.id).style.cursor = "crosshair";
    this._map.on("click", this._addMarker, this);
    this._map.on("keydown", this._finishDrawingOnKeyPress, this);
    if (this._marker) {
      this._marker.remove();
    }
    this._textbox = L.DomUtil.create("div", "leaflet-draw-textbox");
    this._textbox.innerHTML = "Add first point";
    this._map.getContainer().appendChild(this._textbox);
    this._map.on("mousemove", this._updateTextboxPosition, this);
  },

  _disableDrawing: function () {
    if (this._isAdding) {
      this._isAdding = false;
      this._map.dragging.enable();
      L.DomUtil.removeClass(this._container, "leaflet-draw-enabled");
      document.getElementById(this.options.id).style.removeProperty("cursor");
      this._map.off("click", this._addMarker, this);
      this._map.off("keydown", this._finishDrawingOnKeyPress, this);
      if (this._textbox) {
        this._map.getContainer().removeChild(this._textbox);
        this._map.off("mousemove", this._updateTextboxPosition, this);
        this._textbox = null;
      }
    }
  },

  _updateTextboxPosition: function (e) {
    var pos = this._map.mouseEventToContainerPoint(e.originalEvent);
    if (this._textbox) {
      this._textbox.innerHTML = `${this.options.hover} <br> (${
        Math.round(e.latlng.lat * 1000) / 1000
      }, ${Math.round(e.latlng.lng * 1000) / 1000})`;
      this._textbox.style.display = "block";
      this._textbox.style.left = pos.x + 5 + "px";
      this._textbox.style.top = pos.y + 5 + "px";
    }
  },

  _addMarker: async function (e) {
    this._disableDrawing();
    var markerIcon = L.icon({
      iconUrl: this.options.markerIconUrl,
      iconSize: [25, 36],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
    });
    this._marker = L.marker(e.latlng, { icon: markerIcon });
    if (this.options.layer) {
      this.options.layer.addLayer(this._marker);
    } else {
      this._marker.addTo(this._map);
    }

    if (typeof this.options.fire === "function") {
      let latlng = await this.options.fire(e.latlng);
      if (latlng) this._marker.setLatLng(latlng);
    }
  },
  addMarker: async function (lat, lng) {
    if (this._marker) {
      this._marker.remove();
    }
    this._disableDrawing();
    var markerIcon = L.icon({
      iconUrl: this.options.markerIconUrl,
      iconSize: [25, 36],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
    });
    this._marker = L.marker({ lat, lng }, { icon: markerIcon });
    if (this.options.layer) {
      this.options.layer.addLayer(this._marker);
    } else {
      this._marker.addTo(this._map);
    }

    if (typeof this.options.fire === "function") {
      let latlng = await this.options.fire({ lat, lng });
      this._marker.setLatLng(latlng);
    }
  },
  _finishDrawingOnKeyPress: function (e) {
    if (this._isAdding && e.originalEvent.key === "Escape") {
      this._disableDrawing();
    }
  },
});

L.control.markerDraw = function (options) {
  return new L.Control.MarkerDraw(options);
};
