import L from "leaflet";
import * as d3 from "d3";
import axios from "axios";
import COLORS from "../colors/colors.json";
import CONFIG from "../../config.json";
import "./leaflet_raster";
import "./leaflet_streamlines";
import "./leaflet_floatgeotiff";
import "./leaflet_particles";

const setNested = (obj, args, value) => {
  for (var i = 0; i < args.length - 1; i++) {
    if (!obj || !obj.hasOwnProperty(args[i])) {
      obj[args[i]] = {};
    }
    obj = obj[args[i]];
  }
  obj[args[args.length - 1]] = value;
};

const checkNested = (obj, args) => {
  for (var i = 0; i < args.length; i++) {
    if (!obj || !obj.hasOwnProperty(args[i])) {
      return false;
    }
    obj = obj[args[i]];
  }
  return true;
};

const getNested = (obj, args) => {
  return args.reduce((acc, arg) => acc && acc[arg], obj);
};

const formatDate = (datetime, offset = 0) => {
  var a = new Date(datetime).getTime();
  a = new Date(a + offset);
  var year = a.getFullYear();
  var month = a.getMonth() + 1;
  var date = a.getDate();
  var hour = a.getHours();
  return `${String(year)}${month < 10 ? "0" + month : month}${
    date < 10 ? "0" + date : date
  }${hour < 10 ? "0" + hour : hour}`;
};

const formatWmsDate = (datetime) => {
  var year = datetime.getFullYear();
  var month = datetime.getMonth() + 1;
  var date = datetime.getDate();
  return `${String(year)}-${month < 10 ? "0" + month : month}-${
    date < 10 ? "0" + date : date
  }/${String(year)}-${month < 10 ? "0" + month : month}-${
    date < 10 ? "0" + date : date
  }`;
};

const parseDate = (dateString) => {
  const year = dateString.slice(0, 4);
  const month = parseInt(dateString.slice(4, 6)) - 1; // month is zero-indexed
  const day = dateString.slice(6, 8);
  const hour = dateString.slice(9, 11);
  const minute = dateString.slice(11, 13);
  const second = dateString.slice(13, 15);
  const date = new Date(year, month, day, hour, minute, second);
  return date;
};

const parseAlplakesDate = (str) => {
  const d = new Date(
    `${str.slice(0, 4)}-${str.slice(4, 6)}-${str.slice(6, 8)}T${str.slice(
      8,
      10
    )}:${str.slice(10, 12)}:00.000+00:00`
  );
  return String(d.getTime());
};

const findClosest = (array, key, value) => {
  let closest = null;
  let minDiff = Infinity;

  for (let i = 0; i < array.length; i++) {
    let diff = Math.abs(array[i][key] - value);
    if (diff < minDiff) {
      minDiff = diff;
      closest = array[i];
    }
  }

  return closest;
};

const closestDate = (targetDate, dateList) => {
  let closest = Infinity;
  let closestDate = null;
  dateList.forEach((date) => {
    const diff = Math.abs(parseInt(date) - parseInt(targetDate));
    if (diff < closest) {
      closest = diff;
      closestDate = date;
    }
  });
  return closestDate;
};

const getTimestepData = (data, datetime) => {
  var keys = Object.keys(data)
    .map((d) => parseInt(d))
    .sort((a, b) => a - b);
  var max = Math.max(...keys);
  var min = Math.min(...keys);
  if (datetime >= max) {
    return {
      interpolate: 0,
      newData: [data[String(max)], data[String(max)]],
    };
  } else if (datetime <= min) {
    return {
      interpolate: 0,
      newData: [data[String(min)], data[String(min)]],
    };
  } else {
    var low, high;
    for (let i = 0; i < keys.length - 1; i++) {
      low = keys[i];
      high = keys[i + 1];
      if (high > datetime) break;
    }
    return {
      interpolate: (datetime - low) / (high - low),
      newData: [data[String(low)], data[String(high)]],
    };
  }
};

const round = (value, decimals) => {
  return Math.round(value * 10 ** decimals) / 10 ** decimals;
};

export const flyToBounds = (bounds, map) => {
  map.flyToBounds(
    L.latLngBounds(L.latLng(bounds.southWest), L.latLng(bounds.northEast))
  );
};

export const addLayer = async (
  layer,
  period,
  dataStore,
  layerStore,
  map,
  datetime,
  depth,
  setSimpleline
) => {
  if (layer.type === "alplakes_hydrodynamic") {
    await addAlplakesHydrodynamic(
      layer,
      period,
      dataStore,
      layerStore,
      map,
      datetime,
      depth,
      setSimpleline
    );
  } else if (layer.type === "sencast_tiff") {
    await addSencastTiff(layer, dataStore, layerStore, datetime, map);
  } else if (layer.type === "sentinel_hub_wms") {
    await addSentinelHubWms(layer, dataStore, layerStore, datetime, map);
  } else if (layer.type === "alplakes_particles") {
    await addAlplakesParticles(
      layer,
      period,
      dataStore,
      layerStore,
      map,
      datetime,
      depth
    );
  }
};

export const updateLayer = async (
  layer,
  dataStore,
  layerStore,
  map,
  datetime,
  depth
) => {
  if (layer.type === "alplakes_hydrodynamic") {
    await updateAlplakesHydrodynamic(
      layer,
      dataStore,
      layerStore,
      map,
      datetime,
      depth
    );
  } else if (layer.type === "sencast_tiff") {
    await updateSencastTiff(layer, dataStore, layerStore, map, datetime);
  } else if (layer.type === "sentinel_hub_wms") {
    await updateSentinelHubWms(layer, dataStore, layerStore, map, datetime);
  }
};

export const removeLayer = async (layer, layerStore, map) => {
  if (layer.type === "alplakes_hydrodynamic") {
    await removeAlplakesHydrodynamic(layer, layerStore, map);
  } else if (layer.type === "sencast_tiff") {
    await removeSencastTiff(layer, layerStore, map);
  } else if (layer.type === "sentinel_hub_wms") {
    removeSentinelHubWms(layer, layerStore, map);
  }
};

const addAlplakesHydrodynamic = async (
  layer,
  period,
  dataStore,
  layerStore,
  map,
  datetime,
  depth,
  setSimpleline
) => {
  await downloadAlplakesHydrodynamicGeometry(layer, period, dataStore);
  var simpleline = await downloadAlplakesHydrodynamicParameter(
    layer,
    period,
    depth,
    dataStore
  );
  if ("simpleline" in layer.properties) {
    setSimpleline(simpleline);
  }
  plotAlplakesHydrodynamic(layer, datetime, depth, dataStore, layerStore, map);
};

const downloadAlplakesHydrodynamicGeometry = async (
  layer,
  period,
  dataStore,
  overwrite = false
) => {
  var type = layer.type;
  if (typeof overwrite === "object") {
    if ("type" in overwrite) type = overwrite.type;
  }

  var path = [type, layer.properties.model, layer.properties.lake, "geometry"];

  if (checkNested(dataStore, path)) {
    return;
  }
  var { data: geometry } = await axios.get(
    `${CONFIG.alplakes_api}/simulations/layer_alplakes/${
      layer.properties.model
    }/${layer.properties.lake}/geometry/${formatDate(period[0])}/${formatDate(
      period[1]
    )}/0`
  );
  geometry = geometry
    .split("\n")
    .map((g) => g.split(",").map((s) => parseFloat(s)));
  setNested(dataStore, path, geometry);
};

const downloadAlplakesHydrodynamicParameter = async (
  layer,
  period,
  depth,
  dataStore,
  overwrite = false
) => {
  var type = layer.type;
  var parameter = layer.properties.parameter;
  if (typeof overwrite === "object") {
    if ("type" in overwrite) type = overwrite.type;
    if ("parameter" in overwrite) parameter = overwrite.parameter;
  }

  var path = [
    type,
    layer.properties.model,
    layer.properties.lake,
    parameter,
    String(depth),
  ];

  var start = period[0];
  var end = period[1];
  if (checkNested(dataStore, path)) {
    console.log("Check downloaded to avoid repeat downloads");
  }
  var { data: par } = await axios.get(
    `${CONFIG.alplakes_api}/simulations/layer_alplakes/${
      layer.properties.model
    }/${layer.properties.lake}/${parameter}/${formatDate(start)}/${formatDate(
      end
    )}/${depth}`
  );
  par = par.split("\n").map((g) => g.split(",").map((s) => parseFloat(s)));

  var simpleline = { x: [], y: [] };
  var bounds = { min: [], max: [] };

  for (
    var i = 0;
    i < Math.floor(par.length / (layer.properties.height + 1));
    i++
  ) {
    var date = parseAlplakesDate(
      String(par[i * (layer.properties.height + 1)][0])
    );
    var data = par.slice(
      i * (layer.properties.height + 1) + 1,
      (i + 1) * (layer.properties.height + 1)
    );
    var data_flat = data.flat();
    bounds.min.push(d3.min(data_flat));
    bounds.max.push(d3.max(data_flat));
    setNested(dataStore, [...path, date], data);
    if ("simpleline" in layer.properties) {
      simpleline.y.push(d3.mean(data_flat));
      simpleline.x.push(parseInt(date));
    }
  }
  var min = d3.min(bounds.min);
  var max = d3.max(bounds.max);
  layer.properties.options.min = min;
  layer.properties.options.max = max;
  layer.properties.options.dataMin = min;
  layer.properties.options.dataMax = max;
  return simpleline;
};

const plotAlplakesHydrodynamic = (
  layer,
  datetime,
  depth,
  dataStore,
  layerStore,
  map
) => {
  var path = [
    layer.type,
    layer.properties.model,
    layer.properties.lake,
    layer.properties.parameter,
    String(depth),
  ];
  var geometry_path = [
    layer.type,
    layer.properties.model,
    layer.properties.lake,
    "geometry",
  ];
  var data = getNested(dataStore, path);
  var geometry = getNested(dataStore, geometry_path);
  var { display } = layer.properties;
  if (display === "raster") {
    var { interpolate, newData } = getTimestepData(data, datetime);
    plotAlplakesHydrodynamicRaster(
      layer,
      layerStore,
      map,
      geometry,
      newData,
      interpolate
    );
  } else if (display === "streamlines") {
    plotAlplakesHydrodynamicStreamlines(
      layer,
      layerStore,
      map,
      geometry,
      data[closestDate(datetime, Object.keys(data))]
    );
  }
};

const plotAlplakesHydrodynamicRaster = (
  layer,
  layerStore,
  map,
  geometry,
  data,
  interpolate
) => {
  var path = [
    layer.type,
    layer.properties.model,
    layer.properties.lake,
    layer.properties.parameter,
  ];
  var options = { interpolate };
  if ("options" in layer.properties) {
    options = layer.properties.options;
    if ("paletteName" in layer.properties.options) {
      layer.properties.options.palette =
        COLORS[layer.properties.options.paletteName];
      options["palette"] = COLORS[layer.properties.options.paletteName];
    }
    if (!("opacity" in layer.properties.options)) {
      options["opacity"] = 1;
    }
    if ("unit" in layer.properties) {
      options["unit"] = layer.properties.unit;
    }
  }
  var leaflet_layer = new L.Raster(geometry, data, options).addTo(map);
  setNested(layerStore, path, leaflet_layer);
};

const plotAlplakesHydrodynamicStreamlines = (
  layer,
  layerStore,
  map,
  geometry,
  data
) => {
  var path = [
    layer.type,
    layer.properties.model,
    layer.properties.lake,
    layer.properties.parameter,
  ];
  var options = {};
  if ("options" in layer.properties) {
    options = layer.properties.options;
    if ("paletteName" in layer.properties.options) {
      layer.properties.options.palette =
        COLORS[layer.properties.options.paletteName];
      options["palette"] = COLORS[layer.properties.options.paletteName];
    }
    if (!("opacity" in layer.properties.options)) {
      options["opacity"] = 1;
    }
    if ("unit" in layer.properties) {
      options["unit"] = layer.properties.unit;
    }
  }
  var leaflet_layer = new L.Streamlines(geometry, data, options).addTo(map);
  setNested(layerStore, path, leaflet_layer);
};

const updateAlplakesHydrodynamic = (
  layer,
  dataStore,
  layerStore,
  map,
  datetime,
  depth
) => {
  var layer_path = [
    layer.type,
    layer.properties.model,
    layer.properties.lake,
    layer.properties.parameter,
  ];
  var data_path = [
    layer.type,
    layer.properties.model,
    layer.properties.lake,
    layer.properties.parameter,
    String(depth),
  ];

  var data = getNested(dataStore, data_path);

  var options = {};
  if ("options" in layer.properties) {
    options = layer.properties.options;
    if ("paletteName" in layer.properties.options) {
      layer.properties.options.palette =
        COLORS[layer.properties.options.paletteName];
      options["palette"] = COLORS[layer.properties.options.paletteName];
    }
  }

  var newData;
  if (layer.properties.display === "raster") {
    var out = getTimestepData(data, datetime);
    options["interpolate"] = out.interpolate;
    newData = out.newData;
  } else {
    newData = data[closestDate(datetime, Object.keys(data))];
  }

  var leaflet_layer = getNested(layerStore, layer_path);
  if (leaflet_layer !== null) {
    leaflet_layer.update(newData, options);
  }
};

const removeAlplakesHydrodynamic = (layer, layerStore, map) => {
  var path = [
    layer.type,
    layer.properties.model,
    layer.properties.lake,
    layer.properties.parameter,
  ];
  var leaflet_layer = getNested(layerStore, path);
  map.removeLayer(leaflet_layer);
  setNested(layerStore, path, null);
};

const addSencastTiff = async (layer, dataStore, layerStore, datetime, map) => {
  var path = [
    layer.type,
    layer.properties.model,
    layer.properties.lake,
    layer.properties.parameter,
  ];
  var metadata;
  var image;
  if (!checkNested(dataStore, path)) {
    ({ data: metadata } = await axios.get(layer.properties.metadata));
    metadata = metadata.map((m) => {
      m.unix = parseDate(m.dt).getTime();
      m.url = CONFIG.sencast_bucket + m.k;
      m.time = parseDate(m.dt);
      return m;
    });
    setNested(dataStore, path, metadata);
    image = findClosest(metadata, "unix", datetime);
    layer.properties.options.date = image.time;
    layer.properties.options.url = image.url;
    layer.properties.options.includeDates = metadata.map((m) => m.time);
    layer.properties.options.percentage = metadata.map((m) =>
      Math.round((parseFloat(m.vp) / parseFloat(m.p)) * 100)
    );
    layer.properties.options.validpixelexpression = true;

    layer.properties.options.min = round(image.min, 2);
    layer.properties.options.max = round(image.max, 2);
    layer.properties.options.dataMin = round(image.min, 2);
    layer.properties.options.dataMax = round(image.max, 2);
  } else {
    metadata = getNested(dataStore, path);
    image = findClosest(metadata, "unix", layer.properties.options.date);
  }

  await plotSencastTiff(image.url, layer, layerStore, map);
};

const plotSencastTiff = async (url, layer, layerStore, map) => {
  var path = [
    layer.type,
    layer.properties.model,
    layer.properties.lake,
    layer.properties.parameter,
  ];
  var options = {};
  if ("options" in layer.properties) {
    options = layer.properties.options;
    if ("paletteName" in layer.properties.options) {
      layer.properties.options.palette =
        COLORS[layer.properties.options.paletteName];
      options["palette"] = COLORS[layer.properties.options.paletteName];
    }
    if (!("opacity" in layer.properties.options)) {
      options["opacity"] = 1;
    }
    if (!("convolve" in layer.properties.options)) {
      options["convolve"] = 0;
    }
  }
  var { data } = await axios.get(url, {
    responseType: "arraybuffer",
  });

  var leaflet_layer = L.floatgeotiff(data, options).addTo(map);
  setNested(layerStore, path, leaflet_layer);
};

const updateSencastTiff = async (
  layer,
  dataStore,
  layerStore,
  map,
  datetime
) => {
  var path = [
    layer.type,
    layer.properties.model,
    layer.properties.lake,
    layer.properties.parameter,
  ];

  var options = {};
  if ("options" in layer.properties) {
    options = layer.properties.options;
    if ("paletteName" in layer.properties.options) {
      layer.properties.options.palette =
        COLORS[layer.properties.options.paletteName];
      options["palette"] = COLORS[layer.properties.options.paletteName];
    }
    if ("unit" in layer.properties) {
      options["unit"] = layer.properties.unit;
    }
  }

  var metadata = getNested(dataStore, path);

  var data = false;
  if (
    "date" in layer.properties.options &&
    "updateDate" in layer.properties.options &&
    layer.properties.options.updateDate
  ) {
    const image = findClosest(
      metadata,
      "unix",
      layer.properties.options.date.getTime()
    );

    layer.properties.options.url = image.url;
    layer.properties.options.min = round(image.min, 2);
    layer.properties.options.max = round(image.max, 2);
    layer.properties.options.dataMin = round(image.min, 2);
    layer.properties.options.dataMax = round(image.max, 2);
    layer.properties.options.updateDate = false;

    ({ data } = await axios.get(image.url, {
      responseType: "arraybuffer",
    }));
  }

  var leaflet_layer = getNested(layerStore, path);
  if (leaflet_layer !== null && leaflet_layer !== undefined) {
    leaflet_layer.update(data, options);
  }
};

const removeSencastTiff = (layer, layerStore, map) => {
  var path = [
    layer.type,
    layer.properties.model,
    layer.properties.lake,
    layer.properties.parameter,
  ];
  var leaflet_layer = getNested(layerStore, path);
  map.removeLayer(leaflet_layer);
  setNested(layerStore, path, null);
};

const addSentinelHubWms = async (
  layer,
  dataStore,
  layerStore,
  datetime,
  map
) => {
  var path = [
    layer.type,
    layer.properties.model,
    layer.properties.lake,
    layer.properties.parameter,
  ];
  var metadata;
  var image;
  if (!checkNested(dataStore, path)) {
    ({ data: metadata } = await axios.get(layer.properties.metadata));
    metadata = metadata.map((m) => {
      m.unix = parseDate(m.dt).getTime();
      m.url = CONFIG.sencast_bucket + m.k;
      m.time = parseDate(m.dt);
      return m;
    });
    setNested(dataStore, path, metadata);
    image = findClosest(metadata, "unix", datetime);
    layer.properties.options.includeDates = metadata.map((m) => m.time);
    layer.properties.options.percentage = metadata.map((m) =>
      Math.round((parseFloat(m.vp) / parseFloat(m.p)) * 100)
    );
    layer.properties.options.date = image.time;
  } else {
    metadata = getNested(dataStore, path);
    image = findClosest(metadata, "unix", layer.properties.options.date);
  }

  var leaflet_layer = L.tileLayer
    .wms(layer.properties.wms, {
      tileSize: 512,
      attribution:
        '&copy; <a href="http://www.sentinel-hub.com/" target="_blank">Sentinel Hub</a>',
      minZoom: 6,
      maxZoom: 16,
      preset: layer.properties.options.layer,
      layers: layer.properties.options.layer,
      time: formatWmsDate(layer.properties.options.date),
      gain: layer.properties.options.gain,
      gamma: layer.properties.options.gamma,
    })
    .addTo(map);
  setNested(layerStore, path, leaflet_layer);
};

const updateSentinelHubWms = async (
  layer,
  dataStore,
  layerStore,
  map,
  datetime
) => {
  var path = [
    layer.type,
    layer.properties.model,
    layer.properties.lake,
    layer.properties.parameter,
  ];
  var metadata = getNested(dataStore, path);
  var leaflet_layer = getNested(layerStore, path);

  const image = findClosest(
    metadata,
    "unix",
    layer.properties.options.date.getTime()
  );
  layer.properties.options.updateDate = false;

  leaflet_layer.setParams({
    time: formatWmsDate(image.time),
    gain: layer.properties.options.gain,
    gamma: layer.properties.options.gamma,
  });
};

const removeSentinelHubWms = (layer, layerStore, map) => {
  var path = [
    layer.type,
    layer.properties.model,
    layer.properties.lake,
    layer.properties.parameter,
  ];
  var leaflet_layer = getNested(layerStore, path);
  map.removeLayer(leaflet_layer);
  setNested(layerStore, path, null);
};

const addAlplakesParticles = async (
  layer,
  period,
  dataStore,
  layerStore,
  map,
  datetime,
  depth
) => {
  const overwrite = { parameter: "velocity", type: "alplakes_hydrodynamic" };
  await downloadAlplakesHydrodynamicGeometry(
    layer,
    period,
    dataStore,
    overwrite
  );
  await downloadAlplakesHydrodynamicParameter(
    layer,
    period,
    depth,
    dataStore,
    overwrite
  );
  plotAlplakesParticles(layer, datetime, depth, dataStore, layerStore, map);
};

const plotAlplakesParticles = (layer, datetime, depth, dataStore, layerStore, map) => {
  var path = [
    "alplakes_hydrodynamic",
    layer.properties.model,
    layer.properties.lake,
    "velocity",
    String(depth),
  ];
  var geometry_path = [
    "alplakes_hydrodynamic",
    layer.properties.model,
    layer.properties.lake,
    "geometry",
  ];
  var layer_path = [
    layer.type,
    layer.properties.model,
    layer.properties.lake,
    "velocity",
  ];
  var data = getNested(dataStore, path);
  var geometry = getNested(dataStore, geometry_path);
  var options = {};
  if ("options" in layer.properties) {
    options = layer.properties.options;
    if ("paletteName" in layer.properties.options) {
      layer.properties.options.palette =
        COLORS[layer.properties.options.paletteName];
      options["palette"] = COLORS[layer.properties.options.paletteName];
    }
    if (!("opacity" in layer.properties.options)) {
      options["opacity"] = 1;
    }
    if ("unit" in layer.properties) {
      options["unit"] = layer.properties.unit;
    }
  }
  var leaflet_layer = new L.Particles(geometry, data, options).addTo(map);
  setNested(layerStore, layer_path, leaflet_layer);
};
