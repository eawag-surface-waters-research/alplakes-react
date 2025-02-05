import axios from "axios";
import CONFIG from "../../../config.json";
import pako from "pako";
import * as d3 from "d3";
import * as general from "./general";

export const download1DLinegraph = async (
  model,
  lake,
  start,
  end,
  depth,
  parameter,
  bucket = false
) => {
  const apiUrl = `${
    CONFIG.alplakes_api
  }/simulations/1d/point/${model}/${lake}/${general.formatAPIDatetime(
    start
  )}/${general.formatAPIDatetime(end)}/${depth}?variables=${parameter}`;
  const bucketUrl = `${
    CONFIG.alplakes_bucket
  }/simulations/${model}/cache/${lake}/linegraph_${parameter}.json${general.hour()}`;
  const urls = bucket ? [[bucketUrl, apiUrl]] : [[apiUrl]];
  const response = await fetchDataParallel(urls);
  return response[0];
};

export const downloadPastYear = async (
  model,
  lake,
  parameter,
  bucket = false
) => {
  var { start_date, end_date } = await downloadModelMetadata(model, lake);
  var start = new Date(end_date.getTime() - 365 * 24 * 60 * 60 * 1000);
  const apiUrl = `${
    CONFIG.alplakes_api
  }/simulations/1d/depthtime/${model}/${lake}/${general.formatAPIDatetime(
    start
  )}/${general.formatAPIDatetime(end_date)}?variables=${parameter}`;
  const bucketUrl = `${
    CONFIG.alplakes_bucket
  }/simulations/${model}/cache/${lake}/heatmap_${parameter}.json.gz?timestamp=${general.hour()}`;
  const urls = bucket ? [[bucketUrl, apiUrl]] : [[apiUrl]];
  const response = await fetchDataParallel(urls);
  const data = response[0];
  var x = data.time.map((t) => new Date(t));
  var y = data.depth["data"];
  var z = data["variables"][parameter]["data"];
  return { data: { x, y, z }, start_date, end_date, start, end: end_date };
};

export const download1DHeatmap = async (model, lake, parameter, start, end) => {
  const apiUrl = `${
    CONFIG.alplakes_api
  }/simulations/1d/depthtime/${model}/${lake}/${general.formatAPIDatetime(
    start
  )}/${general.formatAPIDatetime(end)}?variables=${parameter}`;
  const response = await fetchDataParallel([[apiUrl]]);
  const data = response[0];
  var x = data.time.map((t) => new Date(t));
  var y = data.depth["data"];
  var z = data["variables"][parameter]["data"];
  return { x, y, z };
};

export const downloadDoy = async (
  model,
  lake,
  depth,
  parameter,
  bucket = false
) => {
  const start = new Date(new Date().getFullYear(), 0, 1, 0, 0);
  const end = new Date();
  end.setDate(end.getDate() + 5);
  const apiUrl = `${CONFIG.alplakes_api}/simulations/1d/doy/${model}/${lake}/${parameter}/${depth}`;
  const bucketUrl = `${CONFIG.alplakes_bucket}/simulations/${model}/cache/${lake}/doy_${parameter}.json`;
  const apiCurrent = `${
    CONFIG.alplakes_api
  }/simulations/1d/point/${model}/${lake}/${general.formatAPIDatetime(
    start
  )}/${general.formatAPIDatetime(
    end
  )}/${depth}?variables=${parameter}&resample=daily`;
  const bucketCurrent = `${
    CONFIG.alplakes_bucket
  }/simulations/${model}/cache/${lake}/doy_currentyear.json?timestamp=${general.hour()}`;
  const urls = bucket
    ? [
        [bucketUrl, apiUrl],
        [bucketCurrent, apiCurrent],
      ]
    : [[apiUrl], [apiCurrent]];
  const response = await fetchDataParallel(urls);
  const data = response[0];
  const current = response[1];

  const x = general.getDoyArray();
  var display = [];
  var min_year = false;
  var max_year = false;
  if ("start_time" in data) {
    min_year = new Date(data["start_time"]).getFullYear();
  }
  if ("end_time" in data) {
    max_year = new Date(data["end_time"]).getFullYear();
  }
  if (data && "min" in data["variables"])
    display.push({
      x,
      y: general.removeLeap(data["variables"].min["data"]),
      name: false,
      lineColor: "lightgrey",
    });
  if (data && "max" in data["variables"])
    display.push({
      x,
      y: general.removeLeap(data["variables"].max["data"]),
      name: false,
      lineColor: "lightgrey",
    });
  if (data && "perc5" in data["variables"] && "perc95" in data["variables"]) {
    display.push({
      confidenceAxis: "y",
      upper: general.removeLeap(data["variables"].perc95["data"]),
      lower: general.removeLeap(data["variables"].perc5["data"]),
      x,
      y: general.removeLeap(data["variables"].mean["data"]),
      lineColor: "grey",
      name: false,
    });
  }
  if (data && "perc25" in data["variables"] && "perc75" in data["variables"]) {
    display.push({
      confidenceAxis: "y",
      upper: general.removeLeap(data["variables"].perc75["data"]),
      lower: general.removeLeap(data["variables"].perc25["data"]),
      x,
      y: general.removeLeap(data["variables"].mean["data"]),
      lineColor: "grey",
      name: false,
    });
  }
  if (data && "lastyear" in data["variables"]) {
    display.push({
      x,
      y: general.removeLeap(data["variables"].lastyear["data"]),
      name: false,
      lineColor: "#ffc045",
    });
  }
  if (current) {
    var xx = current.time.map((t) => new Date(t));
    var yy = current["variables"][parameter]["data"];
    display.push({
      x: xx,
      y: yy,
      name: false,
      lineColor: "#ff7d45",
      lineWeight: 2,
    });
  }
  return {
    min_year,
    max_year,
    data: display,
  };
};

export const downloadClimate = async (lake) => {
  const url = `${CONFIG.alplakes_bucket}/simulations/simstrat/ch2018/${lake}.json`;
  const response = await fetchDataParallel([[url]]);
  const data = response[0];
  const surface = [
    {
      x: data["yearly"]["surface"]["RCP26"]["x"],
      y: data["yearly"]["surface"]["RCP26"]["y_ave"],
      confidenceAxis: "y",
      upper: data["yearly"]["surface"]["RCP26"]["y_max"],
      lower: data["yearly"]["surface"]["RCP26"]["y_min"],
      name: false,
      lineColor: "green",
    },
    {
      x: data["yearly"]["surface"]["RCP45"]["x"],
      y: data["yearly"]["surface"]["RCP45"]["y_ave"],
      confidenceAxis: "y",
      upper: data["yearly"]["surface"]["RCP45"]["y_max"],
      lower: data["yearly"]["surface"]["RCP45"]["y_min"],
      name: false,
      lineColor: "orange",
    },
    {
      x: data["yearly"]["surface"]["RCP85"]["x"],
      y: data["yearly"]["surface"]["RCP85"]["y_ave"],
      confidenceAxis: "y",
      upper: data["yearly"]["surface"]["RCP85"]["y_max"],
      lower: data["yearly"]["surface"]["RCP85"]["y_min"],
      name: false,
      lineColor: "red",
    },
  ];
  const bottom = [
    {
      x: data["yearly"]["bottom"]["RCP26"]["x"],
      y: data["yearly"]["bottom"]["RCP26"]["y_ave"],
      confidenceAxis: "y",
      upper: data["yearly"]["bottom"]["RCP26"]["y_max"],
      lower: data["yearly"]["bottom"]["RCP26"]["y_min"],
      name: false,
      lineColor: "green",
    },
    {
      x: data["yearly"]["bottom"]["RCP45"]["x"],
      y: data["yearly"]["bottom"]["RCP45"]["y_ave"],
      confidenceAxis: "y",
      upper: data["yearly"]["bottom"]["RCP45"]["y_max"],
      lower: data["yearly"]["bottom"]["RCP45"]["y_min"],
      name: false,
      lineColor: "orange",
    },
    {
      x: data["yearly"]["bottom"]["RCP85"]["x"],
      y: data["yearly"]["bottom"]["RCP85"]["y_ave"],
      confidenceAxis: "y",
      upper: data["yearly"]["bottom"]["RCP85"]["y_max"],
      lower: data["yearly"]["bottom"]["RCP85"]["y_min"],
      name: false,
      lineColor: "red",
    },
  ];
  return { surface, bottom };
};

export const downloadModelMetadata = async (model, lake) => {
  var urls;
  if (model === "simstrat") {
    urls = [
      [
        `${
          CONFIG.alplakes_bucket
        }/simulations/${model}/cache/${lake}/metadata.json${general.hour()}`,
        `${CONFIG.alplakes_api}/simulations/1d/metadata/${model}/${lake}`,
      ],
    ];
  } else if (model === "delft3d-flow") {
    urls = [
      [
        `${
          CONFIG.alplakes_bucket
        }/simulations/${model}/cache/${lake}/metadata.json${general.hour()}`,
        `${CONFIG.alplakes_api}/simulations/metadata/${model}/${lake}`,
      ],
    ];
  } else {
    console.error("Model not recognised.");
    return false;
  }
  const response = await fetchDataParallel(urls);
  const metadata = response[0];
  metadata.start_date = general.stringToDate(metadata.start_date + " 00:00");
  metadata.end_date = general.stringToDate(metadata.end_date + " 22:00");
  return metadata;
};

export const download3DMap = async (
  model,
  lake,
  start,
  end,
  depth,
  parameters,
  height,
  bucket = false
) => {
  var response = false;
  var urls = parameters.map((p) => {
    let api_url = `${
      CONFIG.alplakes_api
    }/simulations/layer_alplakes/${model}/${lake}/${p}/${general.formatAPIDatetime(
      start
    )}/${general.formatAPIDatetime(end)}/${depth}`;
    let bucket_url = `${
      CONFIG.alplakes_bucket
    }/simulations/${model}/cache/${lake}/${p}.txt.gz${general.hour()}`;
    if (bucket) {
      return [bucket_url, api_url];
    }
    return [api_url];
  });
  response = await fetchDataParallel(urls);
  const data = {};
  for (let i = 0; i < parameters.length; i++) {
    try {
      data[parameters[i]] = process3dData(response[i], parameters[i], height);
    } catch (e) {
      console.error(`Failed to process ${parameters[i]}`);
      console.error(e);
      data[parameters[i]] = false;
    }
  }
  return data;
};

const process3dData = (data, parameter, height) => {
  if (parameter === "geometry") {
    return data.split("\n").map((g) => g.split(",").map((s) => parseFloat(s)));
  } else {
    var timeArr = [];
    var dataArr = [];
    data = data.split("\n").map((g) => g.split(",").map((s) => parseFloat(s)));
    var bounds = { min: [], max: [] };
    for (let i = 0; i < Math.floor(data.length / (height + 1)); i++) {
      timeArr.push(
        general.parseAlplakesDate(String(data[i * (height + 1)][0]))
      );
      var slice = data.slice(i * (height + 1) + 1, (i + 1) * (height + 1));
      dataArr.push(slice);
      var slice_flat = slice.flat();
      if (parameter === "velocity") {
        slice_flat = slice_flat.map((d) => Math.abs(d));
      }
      bounds.min.push(d3.min(slice_flat));
      bounds.max.push(d3.max(slice_flat));
    }
    return {
      min: d3.min(bounds.min),
      max: d3.max(bounds.max),
      start: d3.min(timeArr),
      end: d3.max(timeArr),
      time: timeArr,
      data: dataArr,
    };
  }
};

const arrayBufferToString = (arrayBuffer) => {
  const decoder = new TextDecoder("utf-8");
  return decoder.decode(arrayBuffer);
};

const fetchDataParallel = async (urls) => {
  const fetchData = async (url) => {
    for (let i = 0; i < url.length; i++) {
      try {
        const response = await axios.get(
          url[i],
          url[i].includes(".gz")
            ? {
                responseType: "arraybuffer",
              }
            : {}
        );
        response["url"] = url[i];
        return response;
      } catch (error) {
        console.error(error);
      }
    }
    return false;
  };
  const requests = urls.map((url) => {
    return fetchData(url);
  });
  const responses = await Promise.all(requests);
  return responses.map((response) => {
    if (response) {
      if (response.url.includes(".gz")) {
        try {
          const decompressedData = pako.ungzip(response.data, { to: "string" });
          if (response.url.includes(".json")) {
            return JSON.parse(decompressedData);
          } else {
            return decompressedData;
          }
        } catch (error) {
          try {
            return arrayBufferToString(response.data);
          } catch (error) {
            return false;
          }
        }
      } else if (response.url.includes(".txt")) {
        return arrayBufferToString(response.data);
      } else {
        return response.data;
      }
    } else {
      return false;
    }
  });
};
