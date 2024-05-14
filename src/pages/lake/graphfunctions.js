import axios from "axios";
import CONFIG from "../../config.json";
import COLORS from "../../components/colors/colors.json";
import Translate from "../../translations.json";
import { formatAPIDatetime, getDoyArray, removeFeb } from "./functions";

export const loading = (message, id) => {
  var parent = document.getElementById(id);
  if (parent) {
    parent.querySelector("#loading-text").innerHTML = message;
    parent.style.visibility = "visible";
  }
};

export const loaded = (id) => {
  if (document.getElementById(id)) {
    document.getElementById(id).style.visibility = "hidden";
  }
};

export const addLayer = async (layer, language, loadingId) => {
  var source = layer.sources[layer.source];
  if (source.data_access === "simstrat_heatmap") {
    return await addSimstratHeatmap(layer, language);
  } else if (source.data_access === "simstrat_doy") {
    return await addSimstratDoy(layer, language);
  }
};

export const updateLayer = async (layer, loadingId) => {
  var source = layer.sources[layer.source];
  if (source.data_access === "simstrat_heatmap") {
    return await updateSimstratHeatmap(layer, loadingId);
  }
};

export const removeLayer = (layer) => {};

const addSimstratHeatmap = async (layer, language) => {
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
    }/${source.parameter}/${formatAPIDatetime(start)}/${formatAPIDatetime(
      maxDate
    )}`
  );
  var x = data.time.map((t) => new Date(t));
  var y = data.depths;
  var z = data[source.parameter];
  layer.displayOptions.data = { x, y, z };
  return layer;
};

const updateSimstratHeatmap = async (layer, loadingId) => {
  var source = layer.sources[layer.source];
  if (layer.displayOptions.updatePeriod) {
    loading("Downloading new period from the server", loadingId);
    let period = layer.displayOptions.period;
    var { data } = await axios.get(
      `${CONFIG.alplakes_api}/simulations/1d/depthtime/${source.model}/${
        source.lake
      }/${source.parameter}/${formatAPIDatetime(period[0])}/${formatAPIDatetime(
        period[1]
      )}`
    );
    var x = data.time.map((t) => new Date(t));
    var y = data.depths;
    var z = data[source.parameter];
    layer.displayOptions.data = { x, y, z };
    layer.displayOptions.updatePeriod = false;
  }
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

const addSimstratDoy = async (layer, language) => {
  var source = layer.sources[layer.source];
  var options = {
    xlabel: "time",
    xunits: "",
    ylabel: Translate[layer.parameter][language],
    yunits: layer.unit,
  };
  layer.displayOptions = { ...layer.displayOptions, ...options };
  var { data } = await axios.get(
    `${CONFIG.alplakes_api}/simulations/1d/doy/${source.model}/${source.lake}/${source.parameter}/${layer.displayOptions.depth}`
  );
  var x = getDoyArray()
  if (x.length === 365){
    layer.displayOptions.data = { confidenceAxis: "y", upper: removeFeb(data.max), lower: removeFeb(data.min), y: removeFeb(data.mean), x };
  } else {
    layer.displayOptions.data = { confidenceAxis: "y", upper: data.max, lower: data.min, y: data.mean, x };
  }
  console.log(layer.displayOptions.data);
  return layer;
};


