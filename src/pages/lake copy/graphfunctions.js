import axios from "axios";
import CONFIG from "../../config.json";
import COLORS from "../../components/colors/colors.json";
import Translate from "../../translations.json";
import {
  formatAPIDatetime,
  getDoyArray,
  removeLeap,
  hour,
  closestDateIndex,
} from "./functions";

export const loading = (message, id) => {
  var parent = document.getElementById(id);
  if (parent) {
    parent.querySelector("#loading-text").innerHTML = message;
    parent.style.visibility = "visible";
  }
};

const stringToDate = (date) => {
  let time = "00";
  if (date.length > 10) {
    time = date.slice(11, 13);
  }
  return new Date(
    `${date.slice(0, 4)}-${date.slice(5, 7)}-${date.slice(
      8,
      10
    )}T${time}:00:00.000+00:00`
  );
};

export const loaded = (id) => {
  if (document.getElementById(id)) {
    document.getElementById(id).style.visibility = "hidden";
  }
};

export const addLayer = async (layer, language, loadingId) => {
  var source = layer.sources[layer.source];
  if (source.data_access === "simstrat_heatmap") {
    return await addSimstratHeatmap(layer, language, loadingId);
  } else if (source.data_access === "simstrat_doy") {
    return await addSimstratDoy(layer, language);
  } else if (source.data_access === "simstrat_linegraph") {
    return await addSimstratLinegraph(layer, language);
  }
};

export const updateLayer = async (layer, loadingId) => {
  var source = layer.sources[layer.source];
  if (source.data_access === "simstrat_heatmap") {
    return await updateSimstratHeatmap(layer, loadingId);
  } else if (source.data_access === "simstrat_linegraph") {
    return await updateSimstratLinegraph(layer, loadingId);
  }
};

export const removeLayer = (layer) => {};

const simstratMetadata = async (model, lake) => {
  var metadata;
  try {
    ({ data: metadata } = await axios.get(
      `${
        CONFIG.alplakes_bucket
      }/simulations/${model}/cache/${lake}/metadata.json?timestamp=${hour()}`
    ));
  } catch (e) {
    console.error("Failed to collect Simstrat metadata from S3.");
    ({ data: metadata } = await axios.get(
      `${CONFIG.alplakes_api}/simulations/1d/metadata/${model}/${lake}`
    ));
  }

  if (metadata.end_date.length === 10) {
    metadata.end_date = metadata.end_date + " 22:00";
  }

  var maxDate = stringToDate(metadata.end_date);
  var minDate = stringToDate(metadata.start_date);
  var depths = metadata.depth;
  return { minDate, maxDate, depths };
};

const addSimstratHeatmap = async (layer, language, loadingId) => {
  loading(`Downloading data from the server`, loadingId);
  var source = layer.sources[layer.source];
  var { maxDate, minDate } = await simstratMetadata(source.model, source.lake);
  var start = new Date(maxDate.getTime() - 365 * 24 * 60 * 60 * 1000);
  var data;
  try {
    ({ data } = await axios.get(
      `${CONFIG.alplakes_bucket}/simulations/${source.model}/cache/${
        source.lake
      }/heatmap_${source.parameter}.json?timestamp=${hour()}`
    ));
  } catch (e) {
    console.error("Failed to collect heatmap from S3.");
    ({ data } = await axios.get(
      `${CONFIG.alplakes_api}/simulations/1d/depthtime/${source.model}/${
        source.lake
      }/${formatAPIDatetime(start)}/${formatAPIDatetime(maxDate)}?variables=${
        source.parameter
      }`
    ));
  }
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
    let palette = COLORS[layer.displayOptions.paletteName].map((c) => {
      return { color: [c[0], c[1], c[2]], point: c[3] };
    });
    layer.displayOptions.palette = palette
    options["palette"] = palette
  }
  layer.displayOptions = { ...layer.displayOptions, ...options };
  var x = data.time.map((t) => new Date(t));
  var y = data.depth["data"];
  var z = data["variables"][source.parameter]["data"];
  layer.displayOptions.data = { x, y, z };
  return layer;
};

const updateSimstratHeatmap = async (layer, loadingId) => {
  var source = layer.sources[layer.source];
  if (layer.displayOptions.updatePeriod) {
    loading("Downloading data from the server", loadingId);
    let period = layer.displayOptions.period;
    var { data } = await axios.get(
      `${CONFIG.alplakes_api}/simulations/1d/depthtime/${source.model}/${
        source.lake
      }/${formatAPIDatetime(period[0])}/${formatAPIDatetime(
        period[1]
      )}?variables=${source.parameter}`
    );
    var x = data.time.map((t) => new Date(t));
    var y = data.depth["data"];
    var z = data["variables"][source.parameter]["data"];
    layer.displayOptions.data = { x, y, z };
    layer.displayOptions.updatePeriod = false;
  }
  return layer;
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
  var data = {};
  try {
    ({ data } = await axios.get(
      `${CONFIG.alplakes_bucket}/simulations/${source.model}/cache/${source.lake}/doy_${source.parameter}.json`
    ));
  } catch (e) {
    console.error("Failed to collect DOY from S3.");
    try {
      ({ data } = await axios.get(
        `${CONFIG.alplakes_api}/simulations/1d/doy/${source.model}/${source.lake}/${source.parameter}/${layer.displayOptions.depth}`
      ));
    } catch (e) {
      console.error("Failed to collect DOY from API.");
    }
  }
  var x = removeLeap(getDoyArray());
  var display = [];
  if ("start_time" in data) {
    source["min_date"] = new Date(data["start_time"]);
  }
  if ("end_time" in data) {
    source["max_date"] = new Date(data["end_time"]);
  }
  if ("min" in data["variables"])
    display.push({
      x,
      y: removeLeap(data["variables"].min["data"]),
      name: false,
      lineColor: "lightgrey",
    });
  if ("max" in data["variables"])
    display.push({
      x,
      y: removeLeap(data["variables"].max["data"]),
      name: false,
      lineColor: "lightgrey",
    });
  if ("perc5" in data["variables"] && "perc95" in data["variables"]) {
    display.push({
      confidenceAxis: "y",
      upper: removeLeap(data["variables"].perc95["data"]),
      lower: removeLeap(data["variables"].perc5["data"]),
      x,
      y: removeLeap(data["variables"].mean["data"]),
      lineColor: "grey",
      name: false,
    });
  }
  if ("perc25" in data["variables"] && "perc75" in data["variables"]) {
    display.push({
      confidenceAxis: "y",
      upper: removeLeap(data["variables"].perc75["data"]),
      lower: removeLeap(data["variables"].perc25["data"]),
      x,
      y: removeLeap(data["variables"].mean["data"]),
      lineColor: "grey",
      name: false,
    });
  }
  if ("lastyear" in data["variables"]) {
    display.push({
      x,
      y: removeLeap(data["variables"].lastyear["data"]),
      name: new Date().getFullYear() - 1,
      lineColor: "#ffc045",
    });
  }
  var start = new Date(new Date().getFullYear(), 0, 1, 0, 0);
  var end = new Date();
  end.setDate(end.getDate() + 5);
  var currentData = false;
  try {
    ({ data: currentData } = await axios.get(
      `${CONFIG.alplakes_bucket}/simulations/${source.model}/cache/${
        source.lake
      }/doy_currentyear.json?timestamp=${hour()}`
    ));
  } catch (e) {
    console.error("Failed to collect current year from S3.");
    try {
      ({ data: currentData } = await axios.get(
        `${CONFIG.alplakes_api}/simulations/1d/point/${source.model}/${
          source.lake
        }/${formatAPIDatetime(start)}/${formatAPIDatetime(end)}/${
          layer.displayOptions.depth
        }?variables=${source.parameter}&resample=daily`
      ));
    } catch (e) {
      console.error("Failed to collect current year from API.");
    }
  }

  if (currentData !== false) {
    var xx = currentData.time.map((t) => new Date(t));
    var yy = currentData["variables"][source.parameter]["data"];
    display.push({
      x: xx,
      y: yy,
      name: new Date().getFullYear(),
      lineColor: "#ff7d45",
      lineWeight: 2,
    });
  }

  if (display.length === 0) {
    throw Object.assign(new Error("Unable to access DOY data."), { code: 402 });
  }

  layer.displayOptions.data = display;
  return layer;
};

const addSimstratLinegraph = async (layer, language) => {
  var source = layer.sources[layer.source];
  var { maxDate, minDate, depths } = await simstratMetadata(
    source.model,
    source.lake
  );
  var depth = Math.min(...depths);
  var start = new Date(maxDate.getTime() - 5 * 24 * 60 * 60 * 1000);
  var data;
  try {
    ({ data } = await axios.get(
      `${CONFIG.alplakes_bucket}/simulations/${source.model}/cache/${
        source.lake
      }/linegraph_${source.parameter}.json?timestamp=${hour()}`
    ));
  } catch (e) {
    console.error("Failed to collect linegraph from S3.");
    ({ data } = await axios.get(
      `${CONFIG.alplakes_api}/simulations/1d/point/${source.model}/${
        source.lake
      }/${formatAPIDatetime(start)}/${formatAPIDatetime(
        maxDate
      )}/${depth}?variables=${source.parameter}`
    ));
  }
  var options = {
    depths,
    depth,
    period: [start, maxDate],
    minDate,
    maxDate,
    xlabel: "time",
    xunits: "",
    ylabel: Translate[layer.parameter][language],
    yunits: layer.unit,
    curve: true,
    padding: true,
  };
  layer.displayOptions = { ...layer.displayOptions, ...options };
  var x = data.time.map((t) => new Date(t));
  var y = data["variables"][source.parameter]["data"];
  layer.displayOptions.data = { x, y };
  let cdi = closestDateIndex(new Date(), x);
  layer.displayOptions.labels = { time: x[cdi], value: y[cdi] };
  return layer;
};

const updateSimstratLinegraph = async (layer, loadingId) => {
  var source = layer.sources[layer.source];
  if (layer.displayOptions.update) {
    loading("Downloading data from the server", loadingId);
    let { period, depth } = layer.displayOptions;
    var { data } = await axios.get(
      `${CONFIG.alplakes_api}/simulations/1d/point/${source.model}/${
        source.lake
      }/${formatAPIDatetime(period[0])}/${formatAPIDatetime(
        period[1]
      )}/${depth}?variables=${source.parameter}`
    );
    var x = data.time.map((t) => new Date(t));
    var y = data["variables"][source.parameter]["data"];
    layer.displayOptions.data = { x, y };
    layer.displayOptions.updatePeriod = false;
  }
  return layer;
};
