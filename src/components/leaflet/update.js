import L from "leaflet";
import * as d3 from "d3";
import axios from "axios";
import COLORS from "../colors/colors.json";
import CONFIG from "../../config.json";
import leaflet_marker from "../../img/leaflet_marker.png";
import Translate from "../../translations.json";
import "./leaflet_raster";
import "./leaflet_streamlines";
import "./leaflet_floatgeotiff";
import "./leaflet_particletracking";
import "./leaflet_polylinedraw";
import "./leaflet_vectorfield";
import "./leaflet_markerdraw";

export const update = async (map, layers, updates) => {
  const functions = {
    addLayer: {
      addTiff: addTiff,
    },
    updateLayer: {},
    removeLayer: {},
  };
  for (let i = 0; i < updates.length; i++) {
    await functions[updates[i].event][updates[i].type](
      map,
      layers,
      updates[i].id,
      updates[i].options
    );
  }
};

const addTiff = async (map, layers, id, options) => {
  var defaultOptions = {
    paletteName: "vik",
    opacity: 1,
  };
  var displayOptions = { ...defaultOptions, ...options.displayOptions };
  let palette = COLORS[displayOptions["paletteName"]].map((c) => {
    return { color: [c[0], c[1], c[2]], point: c[3] };
  });
  displayOptions.palette = palette;
  let { data } = await axios.get(options.url, {
    responseType: "arraybuffer",
  });
  layers[id] = await L.floatgeotiff(data, displayOptions).addTo(map);
};
