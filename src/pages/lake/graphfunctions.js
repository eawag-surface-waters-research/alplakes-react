import axios from "axios";
import CONFIG from "../../config.json";
import COLORS from "../../components/colors/colors.json";
import Translate from "../../translations.json";
import { formatAPIDatetime } from "./functions";

export const addLayer = async (layer, language) => {
  var source = layer.sources[layer.source];
  if (source.data_access === "simstrat_heatmap_temperature") {
    return await addSimstratHeatmap(layer, "T", language);
  }
};

export const updateLayer = async (layer) => {
  console.log("Update layer");
};

export const removeLayer = (layer) => {
  console.log("Remove layer");
};

const addSimstratHeatmap = async (layer, parameter, language) => {
  var source = layer.sources[layer.source];
  var { maxDate, minDate } = await simstratMetadata(source.model, source.lake);
  var start = new Date(maxDate.getTime() - 7 * 24 * 60 * 60 * 1000);
  var options = {
    period: [start, maxDate],
    minDate,
    maxDate,
    xlabel: "time",
    xunits: "",
    ylabel: "Depth",
    yunits: "m",
    zlabel: Translate[layer.parameter][language],
    zunits: layer.unit,
  };
  if ("paletteName" in layer.displayOptions) {
    layer.displayOptions.palette = COLORS[layer.displayOptions.paletteName];
    options["palette"] = COLORS[layer.displayOptions.paletteName];
  }
  layer.displayOptions = { ...layer.displayOptions, ...options };
  var { data } = await axios.get(
    `${CONFIG.alplakes_api}/simulations/1d/depthtime/${source.model}/${
      source.lake
    }/${parameter}/${formatAPIDatetime(start)}/${formatAPIDatetime(maxDate)}`
  );
  var x = data.time.map((t) => new Date(t));
  var y = data.depths;
  var z = data[parameter];
  layer.displayOptions.data = { x, y, z };
  return layer;
};

const simstratMetadata = async (model, lake) => {
  var { data: metadata } = await axios.get(
    `${CONFIG.alplakes_api}/simulations/1d/metadata/${model}/${lake}`
  );
  var maxDate = new Date(metadata.end_date);
  var minDate = new Date(metadata.start_date);
  var depths = metadata.depths;
  return { minDate, maxDate, depths };
};
