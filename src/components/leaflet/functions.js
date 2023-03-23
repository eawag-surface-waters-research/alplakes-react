import L from "leaflet";
import axios from "axios";
import CONFIG from "../../config.json";

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

export const addLayer = async (layer, period, dataStore, layerStore, map) => {
  if (layer.type === "alplakes_hydrodynamic")
    await addAlplakesHydrodynamic(layer, period, dataStore, layerStore, map);
};

const addAlplakesHydrodynamic = async (
  layer,
  period,
  dataStore,
  layerStore,
  map
) => {
  await downloadAlplakesHydrodynamicGeometry(layer, period, dataStore);
  await downloadAlplakesHydrodynamicParameter(layer, period, dataStore);
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
  var x = [];
  var y = [];
  geometry.map((g) => {
    x.push(g.slice(0, layer.width));
    y.push(g.slice(layer.width));
  });
  addToNested(dataStore, path, { x, y });
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

  for (var i = 1; i < Math.floor(parameter.length / layer.properties.height) + 1; i++){
    console.log(formatDate(period[0], i * (3 * 3600 * 1000)))
  }

  
};
