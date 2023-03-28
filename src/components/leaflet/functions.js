import L from "leaflet";
import axios from "axios";
import COLORS from "../colors/colors.json";
import CONFIG from "../../config.json";
import "./leaflet_raster";

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

export const updateLayer = async () => {};

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
    )}/${formatDate(end)}/0`
  );
  parameter = parameter
    .split("\n")
    .map((g) => g.split(",").map((s) => parseFloat(s)));

  for (
    var i = 0;
    i < Math.floor(parameter.length / (layer.properties.height + 1));
    i++
  ) {
    var date = parameter[i * (layer.properties.height + 1)];
    var data = parameter.slice(
      i * (layer.properties.height + 1) + 1,
      (i + 1) * (layer.properties.height + 1)
    );
    addToNested(dataStore, [...path, date], data);
  }
};

const closestDate = (datetime, dates) => {
  return dates[0];
};

const plotAlplakesHydrodynamic = (
  layer,
  datetime,
  dataStore,
  layerStore,
  map
) => {
  var { model, lake, parameter } = layer.properties;
  var data = dataStore[layer.type][model][lake][parameter];
  var dates = Object.keys(data);
  var date = closestDate(datetime, dates);
  if (parameter === "temperature") {
    plotAlplakesHydrodynamicTemperature(
      layer,
      layerStore,
      map,
      dataStore[layer.type][model][lake]["geometry"],
      data[date]
    );
  }
};

const plotAlplakesHydrodynamicTemperature = (
  layer,
  layerStore,
  map,
  geometry,
  data
) => {
  var options = {};
  if (
    "display" in layer.properties &&
    "min_value" in layer.properties.display
  ) {
    options["min"] = layer.properties.display.min_value;
  }
  if (
    "display" in layer.properties &&
    "max_value" in layer.properties.display
  ) {
    options["max"] = layer.properties.display.max_value;
  }
  if ("display" in layer.properties && "palette" in layer.properties.display) {
    options["palette"] = layer.properties.display.palette;
  } else if (
    "display" in layer.properties &&
    "paletteName" in layer.properties.display
  ) {
    layer.properties.display.palette =
      COLORS[layer.properties.display.paletteName];
    options["palette"] = COLORS[layer.properties.display.paletteName];
  }

  var rasterLayer = new L.Raster(geometry, data, options).addTo(map);
};
