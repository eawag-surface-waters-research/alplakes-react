import L from "leaflet";

L.Control.PolylineDraw = L.Control.extend({
  options: {
    position: "topleft",
    fire: false,
    layer: false,
    id: "map",
    enabledFunction: false,
    title: "",
    labelDisplayDuration: 2000,
  },

  onAdd: function (map) {
    this._map = map;
    this._container = L.DomUtil.create(
      "div",
      "leaflet-bar leaflet-draw-toolbar"
    );

    var button = L.DomUtil.create("a", "leaflet-draw", this._container);
    button.href = "#";
    var svgIcon =
      '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" version="1.1" viewBox="0 0 135.246 129.12" > <g strokeWidth="0.265" transform="translate(-4.964 -29.138)"> <path fill="#44bca7" d="M70.216 109.702l-2.24-2.25 20.279-20.306c21.623-21.651 20.878-20.814 20.469-22.994-.237-1.26-2.157-3.171-3.426-3.41-2.44-.457-1.216-1.535-23.238 20.466l-20.304 20.284-1.85-1.836c-2.025-2.009-2.753-3.221-2.511-4.183.09-.357 14.072-14.525 32.617-33.05 29.83-29.798 32.567-32.462 33.765-32.856.717-.236 1.978-.429 2.802-.429 2.54 0 4.02.953 8.518 5.488 4.526 4.563 5.089 5.493 5.089 8.403 0 3.51 2.132 1.167-33.402 36.71-37.546 37.558-32.845 33.706-36.568 29.963z" ></path> <path fill="red" d="M38.07 157.42c1.598-.996 5.361-3.907 6.061-4.688.449-.5.788-.563 3.09-.563 3.326 0 3.418.082 3.418 3.043 0 1.658-.105 2.316-.416 2.627-.356.356-1.358.415-6.946.41l-6.53-.004zm19.414.397c-.243-.292-.363-1.156-.363-2.605 0-1.448.12-2.313.363-2.605.325-.392 1.327-.437 9.55-.437 10.84 0 10.063-.239 10.063 3.088 0 3.215.734 2.997-10.109 2.997-8.18 0-9.18-.046-9.504-.438zm26.4-.046c-.598-.661-.616-4.17-.025-5.013l.412-.588h9.213c8.213 0 9.252.047 9.573.433.567.684.654 4.184.124 4.993l-.432.659h-9.213c-8.59 0-9.243-.033-9.651-.484zm26.437.068c-.312-.311-.416-.97-.416-2.627 0-1.657.104-2.315.416-2.627.362-.361 1.586-.415 9.41-.415 5.694 0 9.182.1 9.506.273.45.241.512.573.512 2.726 0 1.553-.116 2.567-.318 2.768-.234.235-2.712.318-9.506.318-8 0-9.242-.054-9.604-.416z" ></path> <path fill="#ccc" d="M12.142 158.089c-3.239-.482-6.776-1.27-7.02-1.564-.202-.243-.21-.503-.026-.833.147-.264 11.882-12.088 26.08-26.276l25.812-25.796 4.127 4.127 4.127 4.127-1.473 1.394c-2.637 2.493-5.156 6.617-12.21 19.984-1.996 3.783-4.226 7.772-4.955 8.863-5.556 8.312-12.648 13.266-22.027 15.384-1.774.401-3.562.56-7.011.623-2.547.047-4.988.032-5.424-.033z" ></path> </g> </svg>';
    button.innerHTML = svgIcon;

    // Create label element
    this._label = L.DomUtil.create("span", "leaflet-draw-label", this._container);
    this._label.innerHTML = this.options.title;
    this._label.style.display = "none";

    L.DomEvent.on(button, "click", this._toggleDrawing, this);
    L.DomEvent.on(button, "mouseenter", this._showLabel, this);
    L.DomEvent.on(button, "mouseleave", this._hideLabel, this);
    
    map.on("dblclick", this._disableDrawing, this);

    this._showLabelTemporarily();

    return this._container;
  },

  onRemove: function (map) {
    this._isDrawing = false;
    this._map.dragging.enable();
    L.DomUtil.removeClass(this._container, "leaflet-draw-enabled");
    document.getElementById(this.options.id).style.removeProperty("cursor");
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
    if (typeof this.options.enabledFunction === "function") {
      this.options.enabledFunction();
    }
    this._isDrawing = true;
    this._map.dragging.disable();
    L.DomUtil.addClass(this._container, "leaflet-draw-enabled");
    document.getElementById(this.options.id).style.cursor = "crosshair";
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

    this._textbox = L.DomUtil.create("div", "leaflet-draw-textbox");
    this._textbox.innerHTML = "Add first point";
    this._map.getContainer().appendChild(this._textbox);
    this._map.on("mousemove", this._updateTextboxPosition, this);
  },

  _disableDrawing: function () {
    if (this._isDrawing) {
      this._isDrawing = false;
      this._map.dragging.enable();
      L.DomUtil.removeClass(this._container, "leaflet-draw-enabled");
      document.getElementById(this.options.id).style.removeProperty("cursor");
      this._map.off("click", this._addPoint, this);
      this._map.off("mousemove", this._updatePreview, this);
      this._map.off("keydown", this._finishDrawingOnKeyPress, this);
      this._previewPolyline.remove();
      this._createPolyline();
    }
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