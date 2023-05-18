import L from "leaflet";

L.Map.mergeOptions({
  showCursorLocation: false,
});

L.Map.addInitHook(function () {
  if (this.options.showCursorLocation) {
    this.on("mousemove", this.showCursorLocation, this);
  }
});

L.Map.include({
  showCursorLocation: function (e) {
    var content = "";
    this.eachLayer(function (layer) {
      if (typeof layer.getFeatureValue === "function") {
        let value = layer.getFeatureValue(e);
        if (value !== null) {
          content = content + `<div>${value}</div>`;
        }
      }
    });

    if (this._tooltip) {
      this._tooltip.remove();
    }

    if (content !== "") {
      this._tooltip = L.tooltip({ direction: "top", opacity: 1 })
        .setLatLng(e.latlng)
        .setContent(content)
        .addTo(this);
      document.getElementById("map").style.cursor = "crosshair";
    } else {
      document.getElementById("map").style.removeProperty("cursor");
    }
  },
});
