import L from "leaflet";
import axios from "axios";
import COLORS from "../colors/colors.json";
import CONFIG from "../../config.json";
import "./leaflet_raster";
import "./leaflet_streamlines";

const addToNested = (obj, args, value) => {
  for (var i = 0; i < args.length; i++) {
    if (!obj || !obj.hasOwnProperty(args[i])) {
      if (i === args.length - 1) {
        obj[args[i]] = value;
        return;
      } else {
        obj[args[i]] = {};
      }
    }
    obj = obj[args[i]];
  }
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
  datetime
) => {
  if (layer.type === "alplakes_hydrodynamic")
    await addAlplakesHydrodynamic(
      layer,
      period,
      dataStore,
      layerStore,
      map,
      datetime
    );
};

export const updateLayer = async (
  layer,
  dataStore,
  layerStore,
  map,
  datetime
) => {
  if (layer.type === "alplakes_hydrodynamic")
    await updateAlplakesHydrodynamic(
      layer,
      dataStore,
      layerStore,
      map,
      datetime
    );
};

const addAlplakesHydrodynamic = async (
  layer,
  period,
  dataStore,
  layerStore,
  map,
  datetime
) => {
  await downloadAlplakesHydrodynamicGeometry(layer, period, dataStore);
  await downloadAlplakesHydrodynamicParameter(layer, period, dataStore);
  plotAlplakesHydrodynamic(layer, datetime, dataStore, layerStore, map);
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
  addToNested(dataStore, path, geometry);
};

const downloadAlplakesHydrodynamicParameter = async (
  layer,
  period,
  dataStore
) => {
  var path = [
    layer.type,
    layer.properties.model,
    layer.properties.lake,
    layer.properties.parameter,
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
    )}/${formatDate(end)}/${layer.properties.depth}`
  );
  parameter = parameter
    .split("\n")
    .map((g) => g.split(",").map((s) => parseFloat(s)));

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
    addToNested(dataStore, [...path, date], data);
  }
};

const plotAlplakesHydrodynamic = (
  layer,
  datetime,
  dataStore,
  layerStore,
  map
) => {
  var { model, lake, parameter, display } = layer.properties;
  var data = dataStore[layer.type][model][lake][parameter];
  if (display === "raster") {
    plotAlplakesHydrodynamicRaster(
      layer,
      layerStore,
      map,
      dataStore[layer.type][model][lake]["geometry"],
      data[closestDate(datetime, Object.keys(data))]
    );
  } else if (display === "streamlines") {
    plotAlplakesHydrodynamicStreamlines(
      layer,
      layerStore,
      map,
      dataStore[layer.type][model][lake]["geometry"],
      data[closestDate(datetime, Object.keys(data))]
    );
  }
};

const plotAlplakesHydrodynamicRaster = (
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
  }
  var leaflet_layer = new L.Raster(geometry, data, options).addTo(map);
  addToNested(layerStore, path, leaflet_layer);
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
  }
  var leaflet_layer = new L.Streamlines(geometry, data, options).addTo(map);
  addToNested(layerStore, path, leaflet_layer);
};

const updateAlplakesHydrodynamic = (
  layer,
  dataStore,
  layerStore,
  map,
  datetime
) => {
  var { model, lake, parameter } = layer.properties;
  var path = [
    layer.type,
    layer.properties.model,
    layer.properties.lake,
    layer.properties.parameter,
  ];

  
  var data = dataStore[layer.type][model][lake][parameter];
  var newData = data[closestDate(datetime, Object.keys(data))];

  var options = {};
  if ("options" in layer.properties) {
    options = layer.properties.options;
    if ("paletteName" in layer.properties.options) {
      layer.properties.options.palette =
        COLORS[layer.properties.options.paletteName];
      options["palette"] = COLORS[layer.properties.options.paletteName];
    }
  }
  var leaflet_layer = getNested(layerStore, path);
  leaflet_layer.update(newData, options);
};
