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

export const update = (map, updates) => {
    console.log(updates)
  };