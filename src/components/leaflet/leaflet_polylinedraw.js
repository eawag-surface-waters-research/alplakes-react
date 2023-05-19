import L from "leaflet";

L.Control.PolylineDraw = L.Control.extend({
  options: {
    position: "topleft",
    fire: false,
  },

  onAdd: function (map) {
    this._map = map;
    this._container = L.DomUtil.create(
      "div",
      "leaflet-bar leaflet-polyline-draw-toolbar"
    );

    var button = L.DomUtil.create(
      "a",
      "leaflet-polyline-draw",
      this._container
    );
    button.href = "#";
    button.title = "Transect";
    var svgIcon =
      '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" style="margin: 8px;" version="1.1" viewBox="0 0 38.129 39.415" > <g fill="#e5e5e5" fillOpacity="1" transform="translate(-84.361 -76.73)"> <path strokeWidth="0.265" d="M104.933 110.369c-5.65-8.895-8.483-13.663-9.1-15.31-.31-.828-.63-2.41-.714-3.516-.694-9.26 7.79-16.564 16.78-14.444 5.209 1.228 9.432 5.629 10.409 10.846.389 2.078.137 5.23-.568 7.115-.807 2.157-12.434 21.064-12.953 21.064-.11 0-1.843-2.59-3.854-5.755zm6.235-14.376c1.6-.725 2.332-1.444 3.075-3.02.772-1.637.799-3.306.078-4.895-1.103-2.432-2.848-3.553-5.534-3.553s-4.432 1.12-5.534 3.553a5.759 5.759 0 000 4.762c.725 1.6 1.444 2.332 3.02 3.075 1.637.772 3.305.799 4.895.078z" ></path> <path strokeWidth="0.123" d="M88.938 101.87c-2.624-4.132-3.94-6.347-4.226-7.112-.144-.385-.294-1.12-.332-1.633-.323-4.302 3.618-7.694 7.794-6.71 2.42.571 4.381 2.615 4.835 5.039.18.965.064 2.428-.264 3.304-.375 1.002-5.775 9.784-6.017 9.784-.05 0-.856-1.203-1.79-2.673zm2.896-6.678c.744-.337 1.083-.671 1.429-1.403.358-.76.37-1.536.036-2.274-.512-1.13-1.323-1.65-2.57-1.65-1.249 0-2.06.52-2.571 1.65a2.675 2.675 0 000 2.212c.337.743.67 1.083 1.403 1.429.76.358 1.535.37 2.273.036z" ></path> <path stroke="#e5e5e5" strokeDasharray="none" strokeOpacity="1" strokeWidth="0.791" d="M90.914 104.176l18.09 11.637" ></path> </g> </svg>';
    button.innerHTML = svgIcon;

    L.DomEvent.on(button, "click", this._toggleDrawing, this);
    map.on("dblclick", this._disableDrawing, this);

    return this._container;
  },

  _toggleDrawing: function (e) {
    e.preventDefault();
    if (this._isDrawing) {
      this._disableDrawing();
    } else {
      e.stopPropagation();
      this._enableDrawing();
    }
  },

  _enableDrawing: function () {
    this._isDrawing = true;
    this._map.dragging.disable();
    L.DomUtil.addClass(this._container, "leaflet-polyline-draw-enabled");
    document.getElementById("map").style.cursor = "crosshair";
    this._map.on("click", this._addPoint, this);
    this._map.on("mousemove", this._updatePreview, this);
    this._map.on("keydown", this._finishDrawingOnKeyPress, this);
    this._polylinePoints = [];
    this._previewPolyline = L.polyline([], {
      color: "red",
      opacity: 0.7,
    }).addTo(this._map);
  },

  _disableDrawing: function () {
    this._isDrawing = false;
    this._map.dragging.enable();
    L.DomUtil.removeClass(this._container, "leaflet-polyline-draw-enabled");
    document.getElementById("map").style.removeProperty("cursor");
    this._map.off("click", this._addPoint, this);
    this._map.off("mousemove", this._updatePreview, this);
    this._map.off("keydown", this._finishDrawingOnKeyPress, this);
    this._previewPolyline.remove();
    this._createPolyline();
  },

  _addPoint: function (e) {
    var latlng = e.latlng;
    this._polylinePoints.push(latlng);
    this._updatePreview();
  },

  _updatePreview: function (e) {
    try {
      this._previewPolyline.setLatLngs(this._polylinePoints.concat(e.latlng));
    } catch (e) {}
  },

  _createPolyline: function () {
    var polyline = L.polyline(this._polylinePoints, { color: "red" }).addTo(
      this._map
    );
    this._map.fire("polyline:created", { layer: polyline });
  },
  _finishDrawingOnKeyPress: function (e) {
    if (
      this._isDrawing &&
      (e.originalEvent.key === "Enter" || e.originalEvent.key === "Escape")
    ) {
      this._disableDrawing();
    }
  },
});

L.control.polylineDraw = function (options) {
  return new L.Control.PolylineDraw(options);
};
