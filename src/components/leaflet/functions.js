import L from "leaflet";
import * as d3 from "d3";
import axios from "axios";
import COLORS from "../colors/colors.json";
import CONFIG from "../../config.json";
import leaflet_marker from "../../img/leaflet_marker.png";
import "./leaflet_raster";
import "./leaflet_streamlines";
import "./leaflet_floatgeotiff";
import "./leaflet_particletracking";
import "./leaflet_polylinedraw";
import "./leaflet_vectorfield";
import "./leaflet_markerdraw";

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

const addMinutes = (date, minutes) => {
  return new Date(date.getTime() + minutes * 60000);
};

export const toRadians = (degrees) => {
  return (degrees * Math.PI) / 180;
};

export const dayName = (YYYYMMDD, language, Translations, full = false) => {
  if (formatDateYYYYMMDD(new Date()) === YYYYMMDD) {
    if (full) {
      return Translations.today[language].toLowerCase();
    }
    return Translations.today[language];
  }
  const year = parseInt(YYYYMMDD.substr(0, 4), 10);
  const month = parseInt(YYYYMMDD.substr(4, 2), 10) - 1; // Subtracting 1 to make it zero-based
  const day = parseInt(YYYYMMDD.substr(6, 2), 10);
  var daysOfWeekNames = Translations.axis[language].shortDays;
  if (full) {
    daysOfWeekNames = Translations.axis[language].days;
  }
  const date = new Date(year, month, day);
  const dayOfWeekNumber = date.getDay();
  return daysOfWeekNames[dayOfWeekNumber];
};

export const dateName = (YYYYMMDD, language, Translations) => {
  const year = parseInt(YYYYMMDD.substr(0, 4), 10);
  const month = parseInt(YYYYMMDD.substr(4, 2), 10) - 1; // Subtracting 1 to make it zero-based
  const day = parseInt(YYYYMMDD.substr(6, 2), 10);
  return `${day} ${Translations.axis[language].months[month]} ${year}`;
};

const formatDepth = (number) => {
  const stringNumber = number.toString();
  if (!stringNumber.includes(".")) {
    return stringNumber + ".0";
  }
  return stringNumber;
};

export const formatDateYYYYMMDD = (d) => {
  const date = new Date(d);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
};

const formatDate = (datetime, offset = 0) => {
  var a = new Date(datetime).getTime();
  a = new Date(a + offset);
  var year = a.getUTCFullYear();
  var month = a.getUTCMonth() + 1;
  var date = a.getUTCDate();
  var hour = a.getUTCHours();
  var minute = a.getMinutes();
  return `${String(year)}${month < 10 ? "0" + month : month}${
    date < 10 ? "0" + date : date
  }${hour < 10 ? "0" + hour : hour}${minute < 10 ? "0" + minute : minute}`;
};

const formatDateBucket = (datetime, offset = 0) => {
  var a = new Date(datetime).getTime();
  a = new Date(a + offset);
  var year = a.getUTCFullYear();
  var month = a.getUTCMonth() + 1;
  var date = a.getUTCDate();
  var hour = a.getUTCHours();
  return `${String(year)}${month < 10 ? "0" + month : month}${
    date < 10 ? "0" + date : date
  }${hour < 10 ? "0" + hour : hour}00`;
};

const formatDateIso = (datetime) => {
  var year = datetime.getFullYear();
  var month = datetime.getMonth() + 1;
  var date = datetime.getDate();
  var hour = datetime.getHours();
  var minute = datetime.getMinutes();
  return `${String(year)}-${month < 10 ? "0" + month : month}-${
    date < 10 ? "0" + date : date
  }T${hour < 10 ? "0" + hour : hour}:${
    minute < 10 ? "0" + minute : minute
  }:00Z`;
};

const formatWmsDate = (datetime, minutes = 120) => {
  var start = addMinutes(datetime, -minutes);
  var end = addMinutes(datetime, minutes);
  return `${formatDateIso(start)}/${formatDateIso(end)}`;
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
      interpolateValue: 0,
      newData: [data[String(max)], data[String(max)]],
    };
  } else if (datetime <= min) {
    return {
      interpolateValue: 0,
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
      interpolateValue: (datetime - low) / (high - low),
      newData: [data[String(low)], data[String(high)]],
    };
  }
};

const round = (value, decimals) => {
  return Math.round(value * 10 ** decimals) / 10 ** decimals;
};

const keepDuplicatesWithHighestValue = (list, dateKey, valueKey) => {
  const uniqueObjects = {};
  for (const obj of list) {
    const currentDate = obj[dateKey];
    const currentValue = obj[valueKey];

    if (
      !uniqueObjects[currentDate] ||
      uniqueObjects[currentDate][valueKey] < currentValue
    ) {
      uniqueObjects[currentDate] = obj;
    }
  }

  return Object.values(uniqueObjects);
};

export const flyToBounds = async (bounds, map) => {
  return new Promise((resolve) => {
    function flyEnd() {
      resolve();
      map.off("zoomend", flyEnd);
    }
    map.on("zoomend", flyEnd);
    map.fitBounds(
      L.latLngBounds(L.latLng(bounds.southWest), L.latLng(bounds.northEast)),
      { padding: [20, 20] }
    );
  });
};

const loading = (message) => {
  if (document.getElementById("loading")) {
    document.getElementById("loading-text").innerHTML = message;
    document.getElementById("loading").style.visibility = "visible";
  }
};

const loaded = () => {
  if (document.getElementById("loading")) {
    document.getElementById("loading").style.visibility = "hidden";
  }
};

export const addLayer = async (
  layer,
  period,
  dataStore,
  layerStore,
  map,
  datetime,
  depth,
  setSimpleline,
  getTransect,
  getProfile,
  bucket
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
      setSimpleline,
      bucket
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
      depth,
      bucket
    );
  } else if (layer.type === "alplakes_transect") {
    await addAlplakesTransect(
      layer,
      dataStore,
      layerStore,
      datetime,
      map,
      getTransect
    );
  } else if (layer.type === "alplakes_profile") {
    await addAlplakesProfile(
      layer,
      dataStore,
      layerStore,
      datetime,
      map,
      getProfile
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
  } else if (layer.type === "alplakes_particles") {
    await updateAlplakesParticles(
      layer,
      dataStore,
      layerStore,
      map,
      datetime,
      depth
    );
  }
  loaded();
};

export const removeLayer = async (layer, layerStore, map) => {
  if (layer.type === "alplakes_hydrodynamic") {
    await removeAlplakesHydrodynamic(layer, layerStore, map);
  } else if (layer.type === "sencast_tiff") {
    await removeSencastTiff(layer, layerStore, map);
  } else if (layer.type === "sentinel_hub_wms") {
    removeSentinelHubWms(layer, layerStore, map);
  } else if (layer.type === "alplakes_transect") {
    removeAlplakesTransect(layer, layerStore, map);
  } else if (layer.type === "alplakes_profile") {
    removeAlplakesProfile(layer, layerStore, map);
  } else if (layer.type === "alplakes_particles") {
    removeAlplakesParticles(layer, layerStore, map);
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
  setSimpleline,
  bucket
) => {
  loading("Downloading lake geometry");
  await downloadAlplakesHydrodynamicGeometry(layer, period, dataStore);
  loading(`Downloading lake ${layer.properties.parameter} field`);
  var simpleline = await downloadAlplakesHydrodynamicParameter(
    layer,
    period,
    depth,
    dataStore,
    bucket
  );
  if ("simpleline" in layer.properties) {
    setSimpleline(simpleline);
  }
  plotAlplakesHydrodynamic(layer, datetime, depth, dataStore, layerStore, map);
  loaded();
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

  var geometry;

  try {
    ({ data: geometry } = await axios.get(
      `${CONFIG.alplakes_bucket}/simulations/${layer.properties.model}/metadata/${layer.properties.lake}/geometry.txt`
    ));
  } catch (e) {
    ({ data: geometry } = await axios.get(
      `${CONFIG.alplakes_api}/simulations/layer_alplakes/${
        layer.properties.model
      }/${layer.properties.lake}/geometry/${formatDate(period[0])}/${formatDate(
        period[1]
      )}/0`
    ));
  }

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
  bucket,
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
  var par;
  if (bucket) {
    try {
      ({ data: par } = await axios.get(
        `${CONFIG.alplakes_bucket}/simulations/${layer.properties.model}/data/${
          layer.properties.lake
        }/${parameter}_${formatDateBucket(start)}_${formatDateBucket(
          end
        )}_${formatDepth(depth)}.txt`
      ));
    } catch (e) {
      ({ data: par } = await axios.get(
        `${CONFIG.alplakes_api}/simulations/layer_alplakes/${
          layer.properties.model
        }/${layer.properties.lake}/${parameter}/${formatDate(
          start
        )}/${formatDate(end)}/${formatDepth(depth)}`
      ));
    }
  } else {
    ({ data: par } = await axios.get(
      `${CONFIG.alplakes_api}/simulations/layer_alplakes/${
        layer.properties.model
      }/${layer.properties.lake}/${parameter}/${formatDate(start)}/${formatDate(
        end
      )}/${depth}`
    ));
  }

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
    if (parameter === "velocity") {
      data_flat = data_flat.map((d) => Math.abs(d));
    }
    bounds.min.push(d3.min(data_flat));
    bounds.max.push(d3.max(data_flat));
    setNested(dataStore, [...path, date], data);
    if ("simpleline" in layer.properties) {
      let mean = d3.mean(data_flat);
      if (mean) {
        simpleline.y.push(d3.mean(data_flat));
        simpleline.x.push(parseInt(date));
      }
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
  var { display, interpolate } = layer.properties;
  if (display === "raster") {
    if (interpolate) {
      var { interpolateValue, newData } = getTimestepData(data, datetime);
      plotAlplakesHydrodynamicRaster(
        layer,
        layerStore,
        map,
        geometry,
        newData,
        interpolateValue
      );
    } else {
      plotAlplakesHydrodynamicRaster(
        layer,
        layerStore,
        map,
        geometry,
        data[closestDate(datetime, Object.keys(data))],
        false
      );
    }
  } else if (display === "current") {
    plotAlplakesHydrodynamicCurrent(
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
  options["interpolate"] = interpolate;
  var leaflet_layer = new L.Raster(geometry, data, options).addTo(map);
  if ("labels" in layer && layer.properties.options.labels) {
    layer.labels.map((p) => {
      let value = leaflet_layer._getValue(L.latLng(p.latlng));
      return L.marker(p.latlng, {
        icon: L.divIcon({
          className: "leaflet-mouse-marker",
          iconAnchor: [20, 20],
          iconSize: [40, 40],
        }),
      })
        .bindTooltip(
          `${p.name}<br>${
            typeof value === "string" || value instanceof String ? value : ""
          }`,
          {
            id: p.name,
            permanent: true,
            direction: p.direction ? p.direction : "top",
            offset: L.point(0, 0),
          }
        )
        .addTo(layerStore["labels"]);
    });
  }
  setNested(layerStore, path, leaflet_layer);
};

const plotAlplakesHydrodynamicCurrent = (
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
  var leaflet_layer = { arrows: false, streamlines: false, raster: false };

  if ("arrows" in options && options.arrows) {
    leaflet_layer.arrows = L.vectorfield(geometry, data, options).addTo(map);
  }
  if ("streamlines" in options && options.streamlines) {
    leaflet_layer.streamlines = L.streamlines(geometry, data, options).addTo(
      map
    );
  }
  if ("raster" in options && options.raster) {
    leaflet_layer.raster = L.raster(geometry, data, options).addTo(map);
  }
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
  var geometry_path = [
    layer.type,
    layer.properties.model,
    layer.properties.lake,
    "geometry",
  ];

  var data = getNested(dataStore, data_path);
  var geometry = getNested(dataStore, geometry_path);

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
  if (layer.properties.interpolate) {
    var out = getTimestepData(data, datetime);
    options["interpolate"] = out.interpolateValue;
    newData = out.newData;
  } else {
    newData = data[closestDate(datetime, Object.keys(data))];
  }

  var leaflet_layer = getNested(layerStore, layer_path);
  if (layer.properties.parameter === "velocity") {
    for (var key of Object.keys(leaflet_layer)) {
      if (leaflet_layer[key] && options[key]) {
        leaflet_layer[key].update(newData, options);
      } else if (leaflet_layer[key] && !options[key]) {
        map.removeLayer(leaflet_layer[key]);
        leaflet_layer[key] = false;
      } else if (!leaflet_layer[key] && options[key]) {
        if (key === "arrows") {
          leaflet_layer.arrows = L.vectorfield(
            geometry,
            newData,
            options
          ).addTo(map);
        }
        if (key === "streamlines") {
          leaflet_layer.streamlines = L.streamlines(
            geometry,
            newData,
            options
          ).addTo(map);
        }
        if (key === "raster") {
          leaflet_layer.raster = L.raster(geometry, newData, options).addTo(
            map
          );
        }
      }
    }
  } else if (leaflet_layer !== null) {
    leaflet_layer.update(newData, options);
    if ("labels" in layer) {
      if (
        layerStore["labels"].getLayers().length === 0 &&
        layer.properties.options.labels
      ) {
        layer.labels.map((p) => {
          let value = leaflet_layer._getValue(L.latLng(p.latlng));
          return L.marker(p.latlng, {
            icon: L.divIcon({
              className: "leaflet-mouse-marker",
              iconAnchor: [0, 0],
              iconSize: [0, 0],
            }),
          })
            .bindTooltip(
              `${p.name}<br>${
                typeof value === "string" || value instanceof String
                  ? value
                  : ""
              }`,
              {
                id: p.name,
                permanent: true,
                sticky: true,
                direction: p.direction ? p.direction : "top",
                offset: L.point(0, 0),
              }
            )
            .addTo(layerStore["labels"]);
        });
      } else if (layer.properties.options.labels) {
        layerStore["labels"].getLayers().forEach((m) => {
          let old = m.getTooltip();
          let p = layer.labels.find((p) => p.name === old.options.id);
          let value = leaflet_layer._getValue(L.latLng(p.latlng));
          m.getTooltip().setContent(
            `${p.name}<br>${
              typeof value === "string" || value instanceof String ? value : ""
            }`
          );
        });
      } else {
        layerStore["labels"].clearLayers();
      }
    }
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
  if (leaflet_layer) {
    if (layer.properties.parameter === "velocity" && leaflet_layer) {
      for (var key of Object.keys(leaflet_layer)) {
        if (leaflet_layer[key]) {
          map.removeLayer(leaflet_layer[key]);
        }
      }
    } else {
      map.removeLayer(leaflet_layer);
    }
  }
  if ("labels" in layer) {
    layerStore["labels"].clearLayers();
  }
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
    loading("Downloading file list");
    ({ data: metadata } = await axios.get(layer.properties.metadata));
    var max_pixels = d3.max(metadata.map((m) => parseFloat(m.p)));
    metadata = metadata.map((m) => {
      m.unix = parseDate(m.dt).getTime();
      m.date = m.dt.slice(0, 8);
      m.url = CONFIG.sencast_bucket + "/" + m.k;
      m.time = parseDate(m.dt);
      let split = m.k.split("_");
      m.tile = split[split.length - 1].split(".")[0];
      m.satellite = split[0].split("/")[2];
      m.percent = Math.ceil((parseFloat(m.vp) / max_pixels) * 100);
      m.ave = Math.round(parseFloat(m.mean) * 100) / 100;
      return m;
    });
    setNested(dataStore, path, metadata);
    image = findClosest(metadata, "unix", datetime);
    layer.properties.options.image = image;
    layer.properties.options.images = metadata;
    var dates = keepDuplicatesWithHighestValue(metadata, "date", "percent");
    layer.properties.options.includeDates = dates.map((m) => m.time);
    layer.properties.options.percentage = dates.map((m) => m.percent);
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
  loading("Downloading satellite image");
  var { data } = await axios.get(url, {
    responseType: "arraybuffer",
  });

  loading("Processing satellite image");
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

    layer.properties.options.image = image;
    layer.properties.options.min = round(image.min, 2);
    layer.properties.options.max = round(image.max, 2);
    layer.properties.options.dataMin = round(image.min, 2);
    layer.properties.options.dataMax = round(image.max, 2);
    layer.properties.options.updateDate = false;
    loading("Downloading satellite image");
    ({ data } = await axios.get(image.url, {
      responseType: "arraybuffer",
    }));
  }

  if (
    "image" in layer.properties.options &&
    "updateImage" in layer.properties.options &&
    layer.properties.options.updateImage
  ) {
    const image = layer.properties.options.image;
    layer.properties.options.min = round(image.min, 2);
    layer.properties.options.max = round(image.max, 2);
    layer.properties.options.dataMin = round(image.min, 2);
    layer.properties.options.dataMax = round(image.max, 2);
    layer.properties.options.updateImage = false;
    loading("Downloading satellite image");
    ({ data } = await axios.get(image.url, {
      responseType: "arraybuffer",
    }));
  }
  loading("Processing satellite image");

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
    var max_pixels = d3.max(metadata.map((m) => parseFloat(m.p)));
    metadata = metadata.map((m) => {
      m.unix = parseDate(m.dt).getTime();
      m.date = m.dt.slice(0, 8);
      m.url = CONFIG.sencast_bucket + "/" + m.k;
      m.time = parseDate(m.dt);
      m.percent = Math.ceil((parseFloat(m.vp) / max_pixels) * 100);
      return m;
    });
    setNested(dataStore, path, metadata);
    image = findClosest(metadata, "unix", datetime);
    var dates = keepDuplicatesWithHighestValue(metadata, "date", "percent");
    layer.properties.options.includeDates = dates.map((m) => m.time);
    layer.properties.options.percentage = dates.map((m) => m.percent);
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
  depth,
  bucket
) => {
  const overwrite = { parameter: "velocity", type: "alplakes_hydrodynamic" };
  loading("Downloading lake geometry");
  await downloadAlplakesHydrodynamicGeometry(
    layer,
    period,
    dataStore,
    overwrite
  );
  loading("Downloading lake velocity field");
  await downloadAlplakesHydrodynamicParameter(
    layer,
    period,
    depth,
    dataStore,
    bucket,
    overwrite
  );
  plotAlplakesParticles(layer, datetime, depth, dataStore, layerStore, map);
};

const plotAlplakesParticles = (
  layer,
  datetime,
  depth,
  dataStore,
  layerStore,
  map
) => {
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
  var layer_path = [layer.type, layer.properties.model, layer.properties.lake];
  var data = getNested(dataStore, path);
  var geometry = getNested(dataStore, geometry_path);
  var options = {};
  if ("options" in layer.properties) {
    options = layer.properties.options;
    if (!("opacity" in layer.properties.options)) {
      options["opacity"] = 1;
    }
    if ("unit" in layer.properties) {
      options["unit"] = layer.properties.unit;
    }
  }
  var leaflet_layer = L.control
    .particleTracking(geometry, data, datetime, options)
    .addTo(map);
  setNested(layerStore, layer_path, leaflet_layer);
};

const updateAlplakesParticles = (
  layer,
  dataStore,
  layerStore,
  map,
  datetime,
  depth
) => {
  var layer_path = [layer.type, layer.properties.model, layer.properties.lake];

  var options = {};
  if ("options" in layer.properties) {
    options = layer.properties.options;
  }

  var leaflet_layer = getNested(layerStore, layer_path);
  if (leaflet_layer && leaflet_layer !== null) {
    if ("remove" in options && options.remove) {
      leaflet_layer.clear();
      options.remove = false;
    }
    leaflet_layer.update(datetime, options);
  }
};

const removeAlplakesParticles = (layer, layerStore, map) => {
  var path = [layer.type, layer.properties.model, layer.properties.lake];
  var leaflet = getNested(layerStore, path);
  leaflet.remove(map);
  setNested(layerStore, path, null);
};

const addAlplakesTransect = async (
  layer,
  dataStore,
  layerStore,
  datetime,
  map,
  getTransect
) => {
  var path = [layer.type, layer.properties.model, layer.properties.lake];
  var leaflet_layer = L.layerGroup([]).addTo(map);
  leaflet_layer.setZIndex(999);
  var leaflet_control = L.control
    .polylineDraw({
      fire: (event) => getTransect(event, layer),
      layer: leaflet_layer,
    })
    .addTo(map);
  setNested(layerStore, path, {
    layer: leaflet_layer,
    control: leaflet_control,
  });
};

const removeAlplakesTransect = (layer, layerStore, map) => {
  var path = [layer.type, layer.properties.model, layer.properties.lake];
  var leaflet = getNested(layerStore, path);
  leaflet.control.remove(map);
  map.removeLayer(leaflet.layer);
  setNested(layerStore, path, null);
};

const addAlplakesProfile = async (
  layer,
  dataStore,
  layerStore,
  datetime,
  map,
  getProfile
) => {
  var path = [layer.type, layer.properties.model, layer.properties.lake];
  var leaflet_layer = L.layerGroup([]).addTo(map);
  leaflet_layer.setZIndex(999);
  var leaflet_control = L.control
    .markerDraw({
      fire: (event) => getProfile(event, layer),
      layer: leaflet_layer,
      markerIconUrl: leaflet_marker,
    })
    .addTo(map);
  setNested(layerStore, path, {
    layer: leaflet_layer,
    control: leaflet_control,
  });
};

const removeAlplakesProfile = (layer, layerStore, map) => {
  var path = [layer.type, layer.properties.model, layer.properties.lake];
  var leaflet = getNested(layerStore, path);
  leaflet.control.remove(map);
  map.removeLayer(leaflet.layer);
  setNested(layerStore, path, null);
};
