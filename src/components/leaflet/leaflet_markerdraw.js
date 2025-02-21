import L from "leaflet";

L.Control.MarkerDraw = L.Control.extend({
  options: {
    position: "topleft",
    markerIconUrl: "marker-icon.png",
    fire: false,
    layer: false,
    id: "map",
  },

  onAdd: function (map) {
    this._map = map;
    this._container = L.DomUtil.create(
      "div",
      "leaflet-bar leaflet-draw-toolbar"
    );

    var button = L.DomUtil.create("a", "leaflet-draw", this._container);
    button.href = "#";
    button.title = "Profile";

    // Create an SVG icon
    var svgIcon =
      '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" version="1.1" viewBox="0 0 399.618 399.268" > <g strokeWidth="0.781" transform="translate(114.16 80.268)"> <path fill="#a6e9f8" d="M4.539 318.044c-8.07-1.348-16.383-4.131-22.876-7.66-2.669-1.45-7.488-4.082-10.71-5.849-9.257-5.077-16.35-6.678-27.684-6.248-11.394.432-16.406 1.951-26.84 8.135-16.174 9.586-22.873 10.473-28.178 3.729-4.968-6.315-1.994-14.864 6.478-18.623 2.187-.97 7.361-3.722 11.498-6.114 14.61-8.448 25.193-11.106 41.953-10.54 16.173.547 24.321 3.127 41.128 13.022 10.488 6.176 22.716 8.735 33.744 7.064 8.221-1.247 14.379-3.602 23.035-8.811 12.63-7.601 23.588-10.992 37.729-11.674 3.436-.166 5.282-.166 4.1 0l-2.148.3v22.552l2.148.12c1.182.066-1.19.355-5.272.642-9.264.65-15.931 2.838-24.355 7.99-3.573 2.184-8.777 5.017-11.564 6.294-12.096 5.541-29.197 7.84-42.186 5.67zm145.87.6c.972-.187 2.378-.18 3.125.016.747.196-.048.348-1.767.34-1.718-.01-2.329-.169-1.357-.356zm9.373 0c.972-.187 2.378-.18 3.125.016.746.196-.049.348-1.767.34-1.718-.01-2.33-.169-1.358-.356zm8.632-.762c.564-.226 1.237-.198 1.497.062s-.202.444-1.025.41c-.91-.037-1.095-.222-.472-.472zm103.099-3.905c.564-.226 1.238-.198 1.497.062.26.26-.202.444-1.025.41-.91-.038-1.095-.223-.472-.472zm3.905 0c.564-.226 1.238-.198 1.497.062.26.26-.201.444-1.025.41-.91-.038-1.095-.223-.472-.472zm5.614-2.105c0-.162.615-.777 1.367-1.367 1.239-.971 1.266-.944.295.295-1.02 1.301-1.662 1.715-1.662 1.072zM94.213 298.355c.564-.225 1.238-.197 1.498.062.259.26-.202.445-1.026.41-.91-.036-1.095-.222-.472-.471zm124.188 0c.564-.225 1.238-.197 1.497.062.26.26-.201.445-1.025.41-.91-.036-1.095-.222-.472-.471zm16.402 0c.564-.225 1.238-.197 1.497.062.26.26-.201.445-1.025.41-.91-.036-1.095-.222-.472-.471zm-9.412-.8c.972-.186 2.378-.18 3.124.017.747.195-.048.348-1.766.34-1.719-.01-2.33-.17-1.358-.356zm-73.038-2.329c.752-.196 1.982-.196 2.734 0 .752.197.137.358-1.367.358-1.503 0-2.118-.161-1.367-.358zm5.468 0c.751-.196 1.982-.196 2.733 0 .752.197.137.358-1.366.358-1.504 0-2.12-.161-1.367-.358zm53.55-19.521c.565-.226 1.238-.198 1.498.062s-.202.444-1.025.41c-.91-.038-1.095-.222-.472-.472zm4.687-.781c.564-.226 1.238-.198 1.497.062.26.26-.202.444-1.025.41-.91-.037-1.095-.222-.472-.472zm21.87 0c.563-.226 1.237-.198 1.497.062s-.202.444-1.025.41c-.91-.037-1.095-.222-.472-.472zm-13.306-.82c1.837-.166 4.648-.163 6.248.01 1.6.167.096.302-3.34.3-3.437 0-4.746-.14-2.908-.306zM210.638-30.522c-.972-1.239-.944-1.267.294-.295.752.59 1.367 1.205 1.367 1.367 0 .643-.641.229-1.661-1.072z" ></path> <path fill="#75e0f6" d="M149.034 318.404c-11.274-1.077-21.564-4.69-33.058-11.608-9.548-5.745-15.657-7.898-25.717-9.062l-4.49-.52v-22.538h4.226c10.413 0 25.102 4.614 36.318 11.408 20.58 12.467 38.368 12.713 59.234.82 15.901-9.063 23.476-11.402 38.922-12.016 7.714-.307 11.77-.092 16.554.877 11.552 2.341 16.282 4.33 33.679 14.163 7.237 4.09 8.283 4.96 9.628 8 2.035 4.6 1.298 9.018-2.066 12.382-5.308 5.308-10.323 4.854-22.71-2.059-15.078-8.412-21.043-10.32-32.415-10.364-11.582-.045-17.163 1.783-33.976 11.13-13.876 7.715-28.68 10.864-44.13 9.387zm60.922-331.45c0-.163.615-.778 1.367-1.368 1.239-.971 1.266-.944.295.295-1.02 1.301-1.662 1.715-1.662 1.072z" ></path> <path fill="#4ab7ea" d="M97.481-19.988c-.003-51.663-.029-52.558-1.613-55.156-1.001-1.642-1.222-2.489-.583-2.237.565.223 26.334 10.523 57.264 22.89 60.315 24.116 60.414 24.164 61.595 30.068.708 3.54-.656 7.864-3.268 10.367-1.904 1.823-44.134 19.194-109.682 45.115l-3.71 1.467-.003-52.514z" ></path> <path fill="#fd9000" d="M8.742 294.984c-6.09-.892-13.426-3.574-19.458-7.113-8.507-4.991-15.186-8.194-20.283-9.726-2.578-.775-5.102-1.784-5.61-2.243-1.097-.992-3.633-10.834-5.045-19.58-1.504-9.31-1.265-31.116.444-40.615 4.899-27.218 17.063-50.62 36.354-69.936 22.842-22.872 50.35-35.322 83.79-37.924l6.834-.531v167.36H81.44c-10.317 0-23.243 4.185-35.259 11.416-13.519 8.135-24.617 10.771-37.44 8.892z" ></path> <path fill="#fc6017" d="M144.347 293.807c-5.82-1.42-10.937-3.695-17.52-7.794-10.522-6.55-22.575-10.55-35.396-11.748l-5.663-.528V107.53h-2.374c-1.305 0-5.787.372-9.958.828-6.602.722-10.02 1.316-20.667 3.594l-2.148.46v-10.088c0-15.394 2.707-23.378 10.604-31.276 10.286-10.285 26.945-13.116 39.969-6.791 5.112 2.483 12.106 8.8 14.764 13.334 3.856 6.58 4.957 11.883 4.972 23.955l.014 11.06 5.674 1.795c7.763 2.455 20.312 8.573 28.499 13.893 41.17 26.755 63.941 74.383 58.705 122.785-.805 7.443-4.152 23.219-5.257 24.78-.309.436-3.022 1.579-6.029 2.539-3.007.96-8.28 3.337-11.716 5.282-9.988 5.65-16.841 8.822-21.838 10.107-5.703 1.465-18.659 1.475-24.635.019z" ></path> <path fill="#715c56" d="M74.235-4.899c.206-67.177.225-67.903 1.818-70.037 2.554-3.42 5.151-4.955 8.934-5.28 1.933-.165 2.675.1 1.923.293-1.29.332-1.142 4.105-1.142 70.276v70.168l-4.1.56c-2.256.309-4.897.863-5.87 1.23l-1.77.67z" ></path> <path fill="#52423e" d="M93.579 61.448c-1.074-.344-3.27-.66-4.882-.703l-2.929-.078v-140.59h2.284c2.828 0 6.921 3.313 8.367 6.773 1.507 3.606 1.594 135.421.089 135.301-.537-.043-1.855-.359-2.93-.703z" ></path> </g> </svg>';
    button.innerHTML = svgIcon;

    L.DomEvent.on(button, "click", this._toggleAdding, this);
    return this._container;
  },

  onRemove: function (map) {
    L.DomUtil.removeClass(this._container, "leaflet-draw-enabled");
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
    this._isAdding = true;
    this._map.dragging.disable();
    L.DomUtil.addClass(this._container, "leaflet-draw-enabled");
    document.getElementById(this.options.id).style.cursor = "crosshair";
    this._map.on("click", this._addMarker, this);
    if (this._marker) {
      this._marker.remove();
    }
    this._textbox = L.DomUtil.create("div", "leaflet-draw-textbox");
    this._textbox.innerHTML = "Add first point";
    this._map.getContainer().appendChild(this._textbox);
    this._map.on("mousemove", this._updateTextboxPosition, this);
  },

  _disableDrawing: function () {
    this._isAdding = false;
    this._map.dragging.enable();
    L.DomUtil.removeClass(this._container, "leaflet-draw-enabled");
    document.getElementById(this.options.id).style.removeProperty("cursor");
    this._map.off("click", this._addMarker, this);
    if (this._textbox) {
      this._map.getContainer().removeChild(this._textbox);
      this._map.off("mousemove", this._updateTextboxPosition, this);
      this._textbox = null;
    }
  },

  _updateTextboxPosition: function (e) {
    var pos = this._map.mouseEventToContainerPoint(e.originalEvent);
    if (this._textbox) {
      this._textbox.innerHTML = `Add profile <br> (${
        Math.round(e.latlng.lat * 1000) / 1000
      }, ${Math.round(e.latlng.lng * 1000) / 1000})`;
      this._textbox.style.display = "block";
      this._textbox.style.left = pos.x + 5 + "px";
      this._textbox.style.top = pos.y + 5 + "px";
    }
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
    this._disableDrawing();
  },
});

L.control.markerDraw = function (options) {
  return new L.Control.MarkerDraw(options);
};
