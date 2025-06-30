import axios from "axios";
import CONFIG from "../../../config.json";
import pako from "pako";
import * as d3 from "d3";
import * as general from "./general";

export const collectMetadata = async (layers, graphSelection) => {
  const functions = {
    threed: threedMetadata,
    satellite: satelliteMetadata,
    measurements: measurementsMetadata,
  };
  for (let layer of layers) {
    if (layer.active && !("metadata" in layer["sources"][layer["source"]])) {
      layer["sources"][layer["source"]]["metadata"] = await functions[
        layer.type
      ](layer["sources"][layer["source"]], layer.unit);
      if ("graph" in layer["sources"][layer["source"]]["metadata"]) {
        layer.graph = layer["sources"][layer["source"]]["metadata"]["graph"];
        graphSelection = { id: layer.id, type: Object.keys(layer.graph)[0] };
      }
    }
  }
  return { layers, graphSelection };
};

const threedMetadata = async (parameters, unit) => {
  const metadata = await downloadModelMetadata(
    parameters.model.toLowerCase(),
    parameters.key
  );
  return metadata;
};

const satelliteMetadata = async (parameters, unit) => {
  var available = {};
  var reference = false;
  var csv = `data:text/csv;charset=utf-8,Datetime,Satellite,Mean (${unit}),Min (${unit}),Max (${unit}),Pixel Coverage (%),URL\n`;
  if ("reference" in parameters) {
    try {
      ({ data: reference } = await axios.get(
        CONFIG.sencast_bucket + parameters.reference
      ));
      reference.datetime = reference.datetime.map((t) =>
        general.satelliteStringToDate(t)
      );
    } catch (e) {
      console.error("Cannot find reference dataset");
    }
  }
  var overallLake = "";
  for (let model of parameters.models) {
    let { data: files } = await axios.get(
      CONFIG.sencast_bucket + model.metadata
    );
    let max_pixels = d3.max(files.map((m) => parseFloat(m.p)));
    for (let file of files) {
      let time = general.satelliteStringToDate(file.dt);
      let date = general.formatSencastDay(time);
      let { lake, satellite, group } = general.componentsFromFilename(file.k);
      overallLake = lake;
      let url = `${CONFIG.sencast_bucket}/alplakes/cropped/${group}/${lake}/${file.k}`;
      let split = file.k.split("_");
      let tile = split[split.length - 1].split(".")[0];
      let percent = Math.ceil((parseFloat(file.vp) / max_pixels) * 100);
      let { min, max, mean: ave } = file;
      csv =
        csv +
        `${general.formatDateWithUTC(
          time
        )},${satellite},${ave},${min},${max},${percent},${url}\n`;
      let image = {
        url,
        time,
        tile,
        satellite,
        model: model.model,
        percent,
        ave,
        min,
        max,
      };

      if (date in available) {
        available[date].images.push(image);
        available[date].max_percent = Math.max(
          available[date].max_percent,
          percent
        );
        available[date].max = Math.max(available[date].max, max);
        let total_percent = available[date].images
          .map((i) => i.percent)
          .reduce((acc, currentValue) => acc + currentValue, 0);
        available[date].ave = general.weightedAverage(
          available[date].images.map((i) => i.ave),
          available[date].images.map((i) => i.percent / total_percent)
        );
      } else {
        available[date] = {
          images: [image],
          max_percent: percent,
          ave,
          min,
          max,
          time,
        };
      }
    }
  }
  var images = general.filterImages(available, 10, []);
  var includeDates = Object.values(images).map((m) => m.time);
  if (includeDates.length === 0) {
    images = general.filterImages(available, 0, []);
    includeDates = Object.values(images).map((m) => m.time);
  }
  if (includeDates.length === 0) {
    return { available, image: false, includeDates };
  } else {
    includeDates.sort(general.compareDates);
    var currentDate = includeDates[includeDates.length - 1];
    var date = available[general.formatSencastDay(currentDate)];
    var image = date.images.filter((i) => i.percent === date.max_percent)[0];
    var graph = {
      satellite_timeseries: { available, reference, csv, lake: overallLake },
    };
    return { available, image, includeDates, graph };
  }
};

const measurementsMetadata = (parameters, unit) => {
  return {};
};

export const downloadData = async (
  add,
  layers,
  updates,
  period,
  datetime,
  depth,
  mapId,
  initial
) => {
  const functions = {
    threed: threedDownload,
    satellite: satelliteDownload,
    measurements: measurementsDownload,
  };
  var data;
  for (let layer of layers) {
    if (add.includes(layer.id)) {
      let out = await functions[layer.type](
        layer,
        updates,
        period,
        datetime,
        depth,
        mapId,
        initial
      );
      if (out) {
        ({ data, updates, period, datetime, depth } = out);
        if (data) {
          layer["sources"][layer["source"]]["data"] = data;
        }
      } else {
        return false;
      }
    }
  }
  if (layers.filter((l) => l.active && l.playControls).length > 0) {
    var dataStore = {};
    for (let layer of layers.filter((l) => l.active && l.playControls)) {
      dataStore[layer.id] =
        layer.sources[layer.source].data[layer.parameter].data;
    }
    updates.push({
      event: "addPlay",
      options: {
        data: dataStore,
        period: [period[0].getTime(), period[1].getTime()],
        datetime: datetime.getTime(),
        timestep: 1800000,
      },
    });
  }
  return { layers, updates, period, datetime, depth };
};

const threedDownload = async (
  layer,
  updates,
  period,
  datetime,
  depth,
  mapId,
  initial
) => {
  const source = layer.sources[layer.source];
  if (period === false) {
    period = [
      new Date(source.metadata.end_date.getTime() - 5 * 24 * 60 * 60 * 1000),
      source.metadata.end_date,
    ];
  }
  if (depth === false) {
    depth = 0;
  }
  const data = await download3DMap(
    source.model.toLowerCase(),
    source.key,
    period[0],
    period[1],
    depth,
    ["geometry", layer.parameter],
    source.metadata.height,
    initial
  );
  if (data) {
    layer.displayOptions.unit = layer.unit;
    layer.displayOptions.min = data[layer.parameter].min;
    layer.displayOptions.max = data[layer.parameter].max;
    layer.displayOptions.dataMin = data[layer.parameter].min;
    layer.displayOptions.dataMax = data[layer.parameter].max;
    var index;
    const timestep =
      (data[layer.parameter].end - data[layer.parameter].start) /
      (data[layer.parameter].data.length - 1);
    if (datetime === false) {
      index = data[layer.parameter].data.length - 1;
      datetime = data[layer.parameter].end;
      const now = new Date();
      if (data[layer.parameter].end > now) {
        index = Math.ceil((now - data[layer.parameter].start) / timestep);
        datetime = new Date(
          data[layer.parameter].start.getTime() + index * timestep
        );
      }
    } else {
      index = Math.ceil((datetime - data[layer.parameter].start) / timestep);
    }
    const plotTypes = ["raster", "streamlines", "vector"].filter(
      (p) => p in layer.displayOptions && layer.displayOptions[p]
    );
    for (let plotType of plotTypes) {
      updates.push({
        event: "addLayer",
        type: plotType,
        id: layer.id,
        options: {
          data: data[layer.parameter].data[index],
          geometry: data.geometry,
          displayOptions: layer.displayOptions,
        },
      });
    }
    if (layer.display === "particles") {
      updates.push({
        event: "addLayer",
        type: "particles",
        id: layer.id,
        options: {
          id: mapId,
          data: data[layer.parameter].data,
          datetime: datetime.getTime(),
          times: data[layer.parameter].time.map((t) => t.getTime()),
          geometry: data.geometry,
          displayOptions: layer.displayOptions,
        },
      });
    }
    return { data, updates, period, datetime, depth };
  } else {
    return false;
  }
};

const satelliteDownload = async (
  layer,
  updates,
  period,
  datetime,
  depth,
  mapId,
  initial
) => {
  layer.displayOptions["unit"] = layer.unit;
  updates.push({
    event: "addLayer",
    type: "tiff",
    id: "satellite_" + layer.parameter,
    options: {
      url: layer.sources[layer.source].metadata.image.url,
      time: layer.sources[layer.source].metadata.image.time,
      displayOptions: layer.displayOptions,
    },
  });
  return { data: false, updates, period, datetime, depth };
};

const measurementsDownload = async (
  layer,
  updates,
  period,
  datetime,
  depth,
  mapId,
  initial
) => {
  var { data } = await axios.get(
    layer.sources[layer.source].url + general.hour()
  );
  const now = new Date();
  const minDate = new Date(now.getTime() - 48 * 60 * 60 * 1000);
  for (let i = 0; i < data.features.length; i++) {
    let time = new Date(data.features[i].properties.last_time * 1000);
    if (
      data.features[i].properties.lake === layer.sources[layer.source].key &&
      time > minDate
    ) {
      data.features[i].properties.permenant = true;
      data.features[i].properties.recent = true;
    } else if (time > minDate) {
      data.features[i].properties.permenant = false;
      data.features[i].properties.recent = true;
    } else {
      data.features[i].properties.permenant = false;
      data.features[i].properties.recent = false;
    }
  }
  updates.push({
    event: "addLayer",
    type: "points",
    id: "current_temperature",
    options: {
      data: data,
      displayOptions: layer.displayOptions,
      unit: "°C",
      lake: layer.sources[layer.source].key,
    },
  });
  return { data: false, updates, period, datetime, depth };
};

export const getProfileAlplakesHydrodynamic = async (
  api,
  model,
  lake,
  period,
  latlng
) => {
  const url = `${api}/simulations/depthtime/${model}/${lake}/${general.formatAPIDate(
    period[0]
  )}0000/${general.formatAPIDate(period[1])}2359/${latlng.lat}/${latlng.lng}`;
  try {
    const { data } = await axios.get(url);
    if (data.distance > 500) {
      return false;
    }
    return data;
  } catch (e) {
    console.error(e);
    return false;
  }
};

export const getTransectAlplakesHydrodynamic = async (
  api,
  model,
  lake,
  period,
  latlng
) => {
  latlng.pop();
  const url = `${api}/simulations/transect/${model}/${lake}/${general.formatAPIDatetime(
    period[0]
  )}/${general.formatAPIDatetime(period[1])}/${latlng
    .map((l) => l.lat)
    .join(",")}/${latlng.map((l) => l.lng).join(",")}?variables=temperature`;
  try {
    const { data } = await axios.get(url);
    return data;
  } catch (e) {
    console.error(e);
    return false;
  }
};

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
  if (data) {
    var x = data.time.map((t) => new Date(t));
    var y = data.depth["data"];
    var z = data["variables"][parameter]["data"];
    return { x, y, z };
  } else {
    return false;
  }
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
      return false;
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
