import L from "leaflet";

L.TileLayer.Default = L.TileLayer.extend({
  createTile: function(coords, done) {
      var tile = L.TileLayer.prototype.createTile.call(this, coords, done);
      tile.classList.add('tile-class');
      return tile;
  }
});
L.tileLayer.default = function (url, options) {
  return new L.TileLayer.Default(url, options);
};
