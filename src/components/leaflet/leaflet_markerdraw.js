import L from "leaflet";

L.Control.MarkerDraw = L.Control.extend({
  options: {
    position: "topright",
    markerIconUrl: "marker-icon.png",
    fire: false,
    layer: false,
  },

  onAdd: function (map) {
    this._map = map;
    this._container = L.DomUtil.create(
      "div",
      "leaflet-bar leaflet-marker-draw-toolbar"
    );

    var button = L.DomUtil.create("a", "leaflet-marker-draw", this._container);
    button.href = "#";
    button.title = "Profile";

    // Create an SVG icon
    var svgIcon =
      '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" style="margin: 6px;" version="1.1" viewBox="0 0 27.411 39.394" > <g transform="translate(-166.395 -160.11)"> <path fill="#e5e5e5" fillOpacity="1" strokeWidth="0.265" d="M176.248 193.749c-5.649-8.895-8.483-13.663-9.1-15.31-.31-.828-.63-2.41-.714-3.516-.694-9.26 7.79-16.564 16.78-14.444 5.209 1.228 9.432 5.629 10.409 10.846.389 2.078.137 5.229-.568 7.114-.807 2.158-12.434 21.064-12.953 21.064-.11 0-1.843-2.59-3.854-5.754zm6.235-14.376c1.6-.726 2.332-1.444 3.075-3.02.772-1.638.799-3.306.078-4.896-1.103-2.432-2.848-3.552-5.534-3.552s-4.432 1.12-5.534 3.552a5.759 5.759 0 000 4.763c.725 1.6 1.444 2.332 3.02 3.075 1.637.772 3.305.798 4.895.078z" ></path> </g> </svg>';
    button.innerHTML = svgIcon;

    L.DomEvent.on(button, "click", this._toggleAdding, this);
    this._enableDrawing()
    return this._container;
  },

  _toggleAdding: function (e) {
    e.preventDefault();
    if (this._isAdding) {
      this._disableAdding();
    } else {
      e.stopPropagation();
      this._enableAdding();
    }
  },

  _enableAdding: function () {
    this._isAdding = true;
    this._map.dragging.disable();
    L.DomUtil.addClass(this._container, "leaflet-marker-draw-enabled");
    document.getElementById("map").style.cursor = "crosshair";
    this._map.on("click", this._addMarker, this);
    if (this._marker) {
      this._marker.remove()
    }
  },

  _disableAdding: function () {
    this._isAdding = false;
    this._map.dragging.enable();
    L.DomUtil.removeClass(this._container, "leaflet-marker-draw-enabled");
    document.getElementById("map").style.removeProperty("cursor");
    this._map.off("click", this._addMarker, this);
  },

  _addMarker: function (e) {
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
      this.options.fire(e.latlng);
    }
    this._disableAdding();
  },
});

L.control.markerDraw = function (options) {
  return new L.Control.MarkerDraw(options);
};
