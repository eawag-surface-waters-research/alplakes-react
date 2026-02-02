import L from "leaflet";

L.Control.MarkerDraw = L.Control.extend({
  options: {
    position: "topleft",
    markerIconUrl: "marker-icon.png",
    fire: false,
    id: "map",
    onlyOne: true,
    enabledFunction: false,
    svgIcon: "",
    title: "",
    hover: "",
    markerColor: "#ff0000",
    labelDisplayDuration: 2000,
  },

  onAdd: function (map) {
    this._map = map;
    this._markers = {};
    this._markerLayer = L.layerGroup().addTo(map);
    this._container = L.DomUtil.create(
      "div",
      "leaflet-bar leaflet-draw-toolbar",
    );

    var button = L.DomUtil.create("a", "leaflet-draw", this._container);
    button.href = "#";
    button.innerHTML = this.options.svgIcon;

    this._label = L.DomUtil.create("span", "leaflet-draw-label", this._container);
    this._label.innerHTML = this.options.title;
    this._label.style.display = "none";

    L.DomEvent.on(button, "click", this._toggleAdding, this);
    L.DomEvent.on(button, "mouseenter", this._showLabel, this);
    L.DomEvent.on(button, "mouseleave", this._hideLabel, this);

    this._showLabelTemporarily();

    return this._container;
  },

  onRemove: function (map) {
    L.DomUtil.removeClass(this._container, "leaflet-draw-enabled");
    this._map.off("keydown", this._finishDrawingOnKeyPress, this);
    document.getElementById(this.options.id).style.removeProperty("cursor");
    if (this._markerLayer) {
      this._markerLayer.clearLayers();
      this._map.removeLayer(this._markerLayer);
      this._markerLayer = null;
    }
    if (this._labelTimeout) {
      clearTimeout(this._labelTimeout);
    }
  },

  _showLabel: function () {
    if (this._label && !this._labelTimeout) {
      this._label.style.display = "inline-block";
    }
  },

  _hideLabel: function () {
    if (this._label && !this._labelTimeout) {
      this._label.style.display = "none";
    }
  },

  _showLabelTemporarily: function () {
    if (this._label) {
      this._label.style.display = "inline-block";
      this._labelTimeout = setTimeout(() => {
        this._label.style.display = "none";
        this._labelTimeout = null;
      }, this.options.labelDisplayDuration);
    }
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
    const { lat, lng } = e.latlng;
    this.addMarker(lat, lng);
  },

  addMarker: async function (lat, lng, color) {
    const markerID = Date.now().toString();
    this._disableDrawing();

    if (this.options.onlyOne) {
      if (this._markerLayer) {
        this._markerLayer.clearLayers();
      }
      this._markers = {};
    }

    var markerIcon = this._createMarkerIcon(color);

    var marker = L.marker({ lat, lng }, { icon: markerIcon });

    this._markers[markerID] = marker;
    this._markerLayer.addLayer(marker);

    if (typeof this.options.fire === "function") {
      let latlng = await this.options.fire({ lat, lng, id: markerID });
      if (latlng) marker.setLatLng(latlng);
    }
  },
  updateMarker: function (id, properties) {
    if (id in this._markers) {
      if ("lat" in properties && "lng" in properties) {
        this._markers[id].setLatLng({
          lat: properties["lat"],
          lng: properties["lng"],
        });
      }
      if ("color" in properties) {
        const newIcon = this._createMarkerIcon(properties["color"]);
        this._markers[id].setIcon(newIcon);
      }
      if ("label" in properties) {
        this._markers[id]
          .bindTooltip(properties["label"], {
            permanent: true,
            direction: "top",
            className: "drawn-marker-label",
            offset: [3, -44],
          })
          .openTooltip();
      }
    }
  },
  deleteMarker: function (id) {
    if (this._markers[id]) {
      this._markerLayer.removeLayer(this._markers[id]);
      delete this._markers[id];
    }
  },
  _finishDrawingOnKeyPress: function (e) {
    if (this._isAdding && e.originalEvent.key === "Escape") {
      this._disableDrawing();
    }
  },
  _createMarkerIcon: function (color) {
    color = color || this.options.markerColor;
    const svgIcon = `
    <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
      <path d="M12.5 0C5.596 0 0 5.596 0 12.5c0 8.437 12.5 28.5 12.5 28.5S25 20.937 25 12.5C25 5.596 19.404 0 12.5 0z" 
            fill="${color}"/>
      <circle cx="12.5" cy="12.5" r="4" fill="#fff"/>
    </svg>
  `;
    return L.divIcon({
      html: svgIcon,
      className: "custom-marker-icon",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
    });
  },
});

L.control.markerDraw = function (options) {
  return new L.Control.MarkerDraw(options);
};