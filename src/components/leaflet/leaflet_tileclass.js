import L from "leaflet";

L.TileLayer.Default = L.TileLayer.extend({
  createTile: function(coords, done) {
      var tile = L.TileLayer.prototype.createTile.call(this, coords, done);
      if (this.options.tileClass) {
        tile.classList.add(this.options.tileClass);
      }
      return tile;
  }
});
L.tileLayer.default = function (url, options) {
  return new L.TileLayer.Default(url, options);
};
