import L from "leaflet";

L.Control.PolylineDraw = L.Control.extend({
  options: {
    position: "topright",
    fire: false,
    layer: false,
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
    button.title = "Start transect";
    var svgIcon =
      '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" version="1.1" viewBox="0 0 126.156 135.376" xmlSpace="preserve" > <g transform="translate(-37.969 -10.936)"> <path fill="white" strokeWidth="0.265" d="M148.71 146.197c-1.014-.196-2.014-1.49-3.045-3.94a27.822 27.822 0 00-5.51-8.426c-4.854-5.11-9.885-7.818-17.972-9.677-12.15-2.792-22.477-1.93-31.486 2.626-3.4 1.72-5.3 2.905-11.526 7.188-6.296 4.33-8.315 5.548-12.022 7.247-4.898 2.245-9.068 3.44-13.063 3.748-9.976.767-17.013-5.52-16.025-14.315.609-5.417 3.74-9.76 9.975-13.83 3.118-2.037 8.313-4.301 9.867-4.301 1.48 0 3.16 1.899 3.16 3.57 0 .893-.591 2.283-1.179 2.77-.257.214-1.538.83-2.846 1.37-4.902 2.022-9.597 5.554-11.132 8.374-1.441 2.647-1.137 5.253.88 7.544 3.023 3.434 8.413 2.903 18.114-1.785 2.641-1.277 4.987-2.658 7.012-4.13 8.76-6.369 13.657-9.24 19.849-11.642 11.716-4.543 24.535-4.655 36.64-.318 11.828 4.238 19.429 11.056 23.954 21.488 1.207 2.784 1.327 4.084.475 5.166-.93 1.183-2.337 1.617-4.12 1.273zm-83.441-35.135c-.796-.433-1.399-1.276-1.655-2.317-.212-.862 5.916-32.234 6.563-33.597.546-1.152 63.028-63.592 63.995-63.953 1.216-.454 2.125-.324 3.37.485.648.42 6.792 6.402 13.655 13.295 13.191 13.25 13.142 13.19 12.857 15.319-.109.81-3.859 4.657-31.776 32.601-17.41 17.426-32.012 31.852-32.45 32.057-1.031.483-31.511 6.51-32.85 6.496-.56-.006-1.33-.18-1.709-.386zm21.488-10.59c4.132-.803 7.722-1.547 7.978-1.653.375-.155-1.36-2.018-8.92-9.574-5.161-5.16-9.431-9.327-9.488-9.26-.148.172-3.092 15.185-3.092 15.767 0 .432 5.436 6.181 5.845 6.181.091 0 3.546-.657 7.677-1.46z" ></path> </g> </svg>';
    button.innerHTML = svgIcon;

    L.DomEvent.on(button, "click", this._toggleDrawing, this);
    map.on("dblclick", this._disableDrawing, this);
    return this._container;
  },

  onRemove: function (map) {
    this._isDrawing = false;
    this._map.dragging.enable();
    L.DomUtil.removeClass(this._container, "leaflet-polyline-draw-enabled");
    document.getElementById("map").style.removeProperty("cursor");
    this._map.off("click", this._addPoint, this);
    this._map.off("mousemove", this._updatePreview, this);
    this._map.off("keydown", this._finishDrawingOnKeyPress, this);
    this._map.off("dblclick", this._disableDrawing, this);
    if (this._previewPolyline) {
      this._previewPolyline.remove();
    }
    if (this._polyline) {
      this._polyline.remove();
    }
    if (this._textbox) {
      this._map.getContainer().removeChild(this._textbox);
      this._map.off("mousemove", this._updateTextboxPosition, this);
      this._textbox = null;
    }
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
    if (this._previewPolyline) {
      this._previewPolyline.remove();
    }
    if (this._polyline) {
      this._polyline.remove();
    }
    this._polylinePoints = [];
    this._previewPolyline = L.polyline([], {
      color: "red",
      opacity: 0.7,
      dashArray: "10, 5",
      dashOffset: "0",
    });
    if (this.options.layer) {
      this.options.layer.addLayer(this._previewPolyline);
    } else {
      this._previewPolyline.addTo(this._map);
    }

    this._textbox = L.DomUtil.create("div", "leaflet-polyline-draw-textbox");
    this._textbox.innerHTML = "Add first point";
    this._map.getContainer().appendChild(this._textbox);
    this._map.on("mousemove", this._updateTextboxPosition, this);
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

  _updateTextboxPosition: function (e) {
    var pos = this._map.mouseEventToContainerPoint(e.originalEvent);
    if (this._textbox) {
      this._textbox.style.display = "block";
      this._textbox.style.left = pos.x + 5 + "px";
      this._textbox.style.top = pos.y + 5 + "px";
    }
  },

  _addPoint: function (e) {
    if (this._polylinePoints.length === 0) {
      this._textbox.innerHTML = "Add second point";
    } else {
      this._textbox.innerHTML = "Double click to finish";
    }
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
    this._polyline = L.polyline(this._polylinePoints, { color: "red" });
    if (this.options.layer) {
      this.options.layer.addLayer(this._polyline);
    } else {
      this._polyline.addTo(this._map);
    }
    if (
      typeof this.options.fire === "function" &&
      this._polylinePoints.length > 2
    ) {
      this.options.fire(this._polylinePoints);
    }
    if (this._textbox) {
      this._map.getContainer().removeChild(this._textbox);
      this._map.off("mousemove", this._updateTextboxPosition, this);
      this._textbox = null;
    }
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
