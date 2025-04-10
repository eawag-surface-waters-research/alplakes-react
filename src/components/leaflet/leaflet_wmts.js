import L from "leaflet";

L.TileLayer.WMTS = L.TileLayer.extend({
    defaultWmtsParams: {
      service: 'WMTS',
      request: 'GetTile',
      version: '1.0.0',
      layer: '',
      style: '',
      tilematrixset: '',
      format: 'image/png'
    },
    
    initialize: function (url, options) {
      this._url = url;
      var wmtsParams = L.extend({}, this.defaultWmtsParams);
      for (var i in options) {
        if (!this.options.hasOwnProperty(i)) {
          wmtsParams[i] = options[i];
        }
      }
      this.wmtsParams = wmtsParams;
      L.setOptions(this, options);
    },
    
    getTileUrl: function (coords) {
      // Construct the TileMatrix as "EPSG:3857:<zoom level>"
      var tileMatrix = this.options.tilematrixset + ':' + coords.z;
      var url = L.Util.template(this._url, { s: this._getSubdomain(coords) });
      return url + L.Util.getParamString(L.extend({}, this.wmtsParams, {
        TileMatrix: tileMatrix,
        TileRow: coords.y,
        TileCol: coords.x
      }), url);
    }
  });
  
  // Convenience factory method
  L.tileLayer.wmts = function (url, options) {
    return new L.TileLayer.WMTS(url, options);
  };