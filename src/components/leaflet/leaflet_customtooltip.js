import L, { latLng } from "leaflet";

L.Map.mergeOptions({
  showCursorLocation: false,
});

L.Map.addInitHook(function () {
  if (this.options.showCursorLocation) {
    this.on("mousemove", this.showCursorLocation, this);
    this.on("customLayersUpdate", this.updateCursorLocation, this);
  }
});

L.Map.include({
  _updateCursorLocationTooltip: function (content, latlng) {
    if (!this._cursorLocationTooltip) {
      this._cursorLocationTooltip = L.tooltip({ direction: "top", opacity: 1 })
        .setLatLng(latlng)
        .addTo(this);
    }
    this._cursorLocationTooltip.setContent(content);
    this._cursorLocationTooltip.setLatLng(latlng);
    this._cursorLocationTooltip.customData = { latlng };
  },
  updateCursorLocation: function (e) {
    if (this._cursorLocationTooltip) {
      e.latlng = this._cursorLocationTooltip.customData.latlng;
      var content = "";
      this.eachLayer(function (layer) {
        if (typeof layer.getFeatureValue === "function") {
          let value = layer.getFeatureValue(e);
          if (value !== null) {
            content = content + `<div>${value}</div>`;
          }
        }
      });
      this._updateCursorLocationTooltip(
        content,
        this._cursorLocationTooltip.customData.latlng
      );
    }
  },

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

    if (content !== "") {
      this._updateCursorLocationTooltip(content, e.latlng);
    } else if (this._cursorLocationTooltip) {
      this._cursorLocationTooltip.remove();
      this._cursorLocationTooltip = false;
    }
  },
  triggerLayersUpdate: function () {
    this.fire("customLayersUpdate");
  },
});
