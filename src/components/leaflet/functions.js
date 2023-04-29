import L from "leaflet";
import * as d3 from "d3";
import axios from "axios";
import COLORS from "../colors/colors.json";
import CONFIG from "../../config.json";
import "./leaflet_raster";
import "./leaflet_streamlines";

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

const parseAlplakesDate = (str) => {
  const d = new Date(
    `${str.slice(0, 4)}-${str.slice(4, 6)}-${str.slice(6, 8)}T${str.slice(
      8,
      10
    )}:${str.slice(10, 12)}:00.000+00:00`
  );
  return String(d.getTime());
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
  if (layer.type === "alplakes_hydrodynamic")
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
};

export const updateLayer = async (
  layer,
  dataStore,
  layerStore,
  map,
  datetime,
  depth
) => {
  if (layer.type === "alplakes_hydrodynamic")
    await updateAlplakesHydrodynamic(
      layer,
      dataStore,
      layerStore,
      map,
      datetime,
      depth
    );
};

export const removeLayer = async (layer, layerStore, map) => {
  if (layer.type === "alplakes_hydrodynamic")
    await removeAlplakesHydrodynamic(layer, layerStore, map);
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
  dataStore
) => {
  var path = [
    layer.type,
    layer.properties.model,
    layer.properties.lake,
    "geometry",
  ];
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
  dataStore
) => {
  var path = [
    layer.type,
    layer.properties.model,
    layer.properties.lake,
    layer.properties.parameter,
    String(depth),
  ];
  var start = period[0];
  var end = period[1];
  if (checkNested(dataStore, path)) {
    console.log("Check downloaded to avoid repeat downloads");
  }
  var { data: parameter } = await axios.get(
    `${CONFIG.alplakes_api}/simulations/layer_alplakes/${
      layer.properties.model
    }/${layer.properties.lake}/${layer.properties.parameter}/${formatDate(
      start
    )}/${formatDate(end)}/${depth}`
  );
  parameter = parameter
    .split("\n")
    .map((g) => g.split(",").map((s) => parseFloat(s)));

  var simpleline = { x: [], y: [] };
  var bounds = { min: [], max: [] };

  for (
    var i = 0;
    i < Math.floor(parameter.length / (layer.properties.height + 1));
    i++
  ) {
    var date = parseAlplakesDate(
      String(parameter[i * (layer.properties.height + 1)][0])
    );
    var data = parameter.slice(
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
    if ("parameter" in layer.properties) {
      options["parameter"] = layer.properties.parameter;
    }
    if ("unit" in layer.properties) {
      options["unit"] = layer.properties.unit;
    }
    if ("opacity" in layer.properties.options) {
      options["opacity"] = layer.properties.options.opacity;
    } else {
      options["opacity"] = 1;
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
    if ("parameter" in layer.properties) {
      options["parameter"] = layer.properties.parameter;
    }
    if ("unit" in layer.properties) {
      options["unit"] = layer.properties.unit;
    }
    if ("opacity" in layer.properties.options) {
      options["opacity"] = layer.properties.options.opacity;
    } else {
      options["opacity"] = 1;
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
