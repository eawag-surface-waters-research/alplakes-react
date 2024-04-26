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
      return Translations.today[language];
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

export const round = (value, decimals) => {
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
  getTransect,
  getProfile,
  bucket
) => {
  var source = layer.sources[layer.source];
  if (source.type === "alplakes_hydrodynamic") {
    await addAlplakesHydrodynamic(
      layer,
      period,
      dataStore,
      layerStore,
      map,
      datetime,
      depth,
      bucket
    );
  } else if (source.type === "sencast_tiff") {
    await addSencastTiff(layer, dataStore, layerStore, datetime, map);
  } else if (source.type === "sentinel_hub_wms") {
    await addSentinelHubWms(layer, dataStore, layerStore, datetime, map);
  } else if (source.type === "alplakes_particles") {
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
  } else if (source.type === "alplakes_transect") {
    await addAlplakesTransect(
      layer,
      dataStore,
      layerStore,
      datetime,
      map,
      getTransect
    );
  } else if (source.type === "alplakes_profile") {
    await addAlplakesProfile(
      layer,
      dataStore,
      layerStore,
      datetime,
      map,
      getProfile
    );
  }
  loaded();
};

export const updateLayer = async (
  layer,
  dataStore,
  layerStore,
  map,
  datetime,
  depth
) => {
  var source = layer.sources[layer.source];
  if (source.type === "alplakes_hydrodynamic") {
    await updateAlplakesHydrodynamic(
      layer,
      dataStore,
      layerStore,
      map,
      datetime,
      depth
    );
  } else if (source.type === "sencast_tiff") {
    await updateSencastTiff(layer, dataStore, layerStore, map, datetime);
  } else if (source.type === "sentinel_hub_wms") {
    await updateSentinelHubWms(layer, dataStore, layerStore, map, datetime);
  } else if (source.type === "alplakes_particles") {
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
  var source = layer.sources[layer.source];
  if (source.type === "alplakes_hydrodynamic") {
    await removeAlplakesHydrodynamic(layer, layerStore, map);
  } else if (source.type === "sencast_tiff") {
    await removeSencastTiff(layer, layerStore, map);
  } else if (source.type === "sentinel_hub_wms") {
    removeSentinelHubWms(layer, layerStore, map);
  } else if (source.type === "alplakes_transect") {
    removeAlplakesTransect(layer, layerStore, map);
  } else if (source.type === "alplakes_profile") {
    removeAlplakesProfile(layer, layerStore, map);
  } else if (source.type === "alplakes_particles") {
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
  bucket
) => {
  loading("Downloading lake geometry");
  await downloadAlplakesHydrodynamicGeometry(layer, period, dataStore);
  loading(`Downloading lake ${layer.parameter} field`);
  await downloadAlplakesHydrodynamicParameter(
    layer,
    period,
    depth,
    dataStore,
    bucket
  );
  plotAlplakesHydrodynamic(layer, datetime, depth, dataStore, layerStore, map);
  loaded();
};

const downloadAlplakesHydrodynamicGeometry = async (
  layer,
  period,
  dataStore,
  overwrite = false
) => {
  var source = layer.sources[layer.source];
  var type = source.type;
  if (typeof overwrite === "object") {
    if ("type" in overwrite) type = overwrite.type;
  }

  var path = [type, source.model, layer.lake, "geometry"];

  if (checkNested(dataStore, path)) {
    return;
  }

  var geometry;

  try {
    ({ data: geometry } = await axios.get(
      `${CONFIG.alplakes_bucket}/simulations/${source.model}/metadata/${layer.lake}/geometry.txt`
    ));
  } catch (e) {
    ({ data: geometry } = await axios.get(
      `${CONFIG.alplakes_api}/simulations/layer_alplakes/${source.model}/${
        layer.lake
      }/geometry/${formatDate(period[0])}/${formatDate(period[1])}/0`
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
  var source = layer.sources[layer.source];
  var type = source.type;
  var parameter = layer.parameter;
  if (typeof overwrite === "object") {
    if ("type" in overwrite) type = overwrite.type;
    if ("parameter" in overwrite) parameter = overwrite.parameter;
  }

  var path = [type, source.model, layer.lake, parameter, String(depth)];

  var start = period[0];
  var end = period[1];
  if (checkNested(dataStore, path)) {
    console.log("Check downloaded to avoid repeat downloads");
  }
  var par;
  if (bucket) {
    try {
      ({ data: par } = await axios.get(
        `${CONFIG.alplakes_bucket}/simulations/${source.model}/data/${
          layer.lake
        }/${parameter}_${formatDateBucket(start)}_${formatDateBucket(
          end
        )}_${formatDepth(depth)}.txt`
      ));
    } catch (e) {
      ({ data: par } = await axios.get(
        `${CONFIG.alplakes_api}/simulations/layer_alplakes/${source.model}/${
          layer.lake
        }/${parameter}/${formatDate(start)}/${formatDate(end)}/${formatDepth(
          depth
        )}`
      ));
    }
  } else {
    ({ data: par } = await axios.get(
      `${CONFIG.alplakes_api}/simulations/layer_alplakes/${source.model}/${
        layer.lake
      }/${parameter}/${formatDate(start)}/${formatDate(end)}/${depth}`
    ));
  }

  par = par.split("\n").map((g) => g.split(",").map((s) => parseFloat(s)));
  var bounds = { min: [], max: [] };
  for (var i = 0; i < Math.floor(par.length / (source.height + 1)); i++) {
    var date = parseAlplakesDate(String(par[i * (source.height + 1)][0]));
    var data = par.slice(
      i * (source.height + 1) + 1,
      (i + 1) * (source.height + 1)
    );
    var data_flat = data.flat();
    if (parameter === "velocity") {
      data_flat = data_flat.map((d) => Math.abs(d));
    }
    bounds.min.push(d3.min(data_flat));
    bounds.max.push(d3.max(data_flat));
    setNested(dataStore, [...path, date], data);
  }
  var min = d3.min(bounds.min);
  var max = d3.max(bounds.max);
  layer.displayOptions.min = min;
  layer.displayOptions.max = max;
  layer.displayOptions.dataMin = min;
  layer.displayOptions.dataMax = max;
};

const plotAlplakesHydrodynamic = (
  layer,
  datetime,
  depth,
  dataStore,
  layerStore,
  map
) => {
  var source = layer.sources[layer.source];
  var path = [
    source.type,
    source.model,
    layer.lake,
    layer.parameter,
    String(depth),
  ];
  var geometry_path = [source.type, source.model, layer.lake, "geometry"];

  var data = getNested(dataStore, path);
  var geometry = getNested(dataStore, geometry_path);
  var { display } = layer;
  if (display === "raster") {
    if (layer.displayOptions.interpolate) {
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
  var source = layer.sources[layer.source];
  var path = [source.type, source.model, layer.lake, layer.parameter];
  var options = layer.displayOptions;
  if ("paletteName" in layer.displayOptions) {
    layer.displayOptions.palette = COLORS[layer.displayOptions.paletteName];
    options["palette"] = COLORS[layer.displayOptions.paletteName];
  }
  if (!("opacity" in layer.displayOptions)) {
    options["opacity"] = 1;
  }
  if ("unit" in layer) {
    options["unit"] = layer.unit;
  }
  options["interpolate"] = interpolate;
  var leaflet_layer = new L.Raster(geometry, data, options).addTo(map);
  if ("labels" in layer && layer.displayOptions.labels) {
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
          `<div class="temperature-label"><div class="name">${
            p.name
          }</div><div class="value">${
            typeof value === "number"
              ? Math.round(value * 10) / 10 + options["unit"]
              : ""
          }</div></div>`,
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
  var source = layer.sources[layer.source];
  var path = [source.type, source.model, layer.lake, layer.parameter];
  var options = layer.displayOptions;
  if ("paletteName" in layer.displayOptions) {
    layer.displayOptions.palette = COLORS[layer.displayOptions.paletteName];
    options["palette"] = COLORS[layer.displayOptions.paletteName];
  }
  if (!("opacity" in layer.displayOptions)) {
    options["opacity"] = 1;
  }
  if ("unit" in layer) {
    options["unit"] = layer.unit;
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
  var source = layer.sources[layer.source];
  var layer_path = [source.type, source.model, layer.lake, layer.parameter];
  var data_path = [
    source.type,
    source.model,
    layer.lake,
    layer.parameter,
    String(depth),
  ];
  var geometry_path = [source.type, source.model, layer.lake, "geometry"];

  var data = getNested(dataStore, data_path);
  var geometry = getNested(dataStore, geometry_path);

  var options = layer.displayOptions;
  if ("paletteName" in layer.displayOptions) {
    layer.displayOptions.palette = COLORS[layer.displayOptions.paletteName];
    options["palette"] = COLORS[layer.displayOptions.paletteName];
  }

  var newData;
  if (layer.displayOptions.interpolate) {
    var out = getTimestepData(data, datetime);
    options["interpolate"] = out.interpolateValue;
    newData = out.newData;
  } else {
    newData = data[closestDate(datetime, Object.keys(data))];
  }

  var leaflet_layer = getNested(layerStore, layer_path);
  if (layer.parameter === "velocity") {
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
        layer.displayOptions.labels
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
              `<div class="temperature-label"><div class="name">${
                p.name
              }</div><div class="value">${
                typeof value === "number"
                  ? Math.round(value * 10) / 10 + options["unit"]
                  : ""
              }</div></div>`,
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
      } else if (layer.displayOptions.labels) {
        layerStore["labels"].getLayers().forEach((m) => {
          let old = m.getTooltip();
          let p = layer.labels.find((p) => p.name === old.options.id);
          let value = leaflet_layer._getValue(L.latLng(p.latlng));
          m.getTooltip().setContent(
            `<div class="temperature-label"><div class="name">${
              p.name
            }</div><div class="value">${
              typeof value === "number"
                ? Math.round(value * 10) / 10 + options["unit"]
                : ""
            }</div></div>`
          );
        });
      } else {
        layerStore["labels"].clearLayers();
      }
    }
  }
};

const removeAlplakesHydrodynamic = (layer, layerStore, map) => {
  var source = layer.sources[layer.source];
  var path = [source.type, source.model, layer.lake, layer.parameter];
  var leaflet_layer = getNested(layerStore, path);
  if (leaflet_layer) {
    if (layer.parameter === "velocity" && leaflet_layer) {
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
  var source = layer.sources[layer.source];
  await plotSencastTiff(source.url, layer, layerStore, map);
};

const plotSencastTiff = async (url, layer, layerStore, map) => {
  var source = layer.sources[layer.source];
  var path = [source.type, layer.lake, layer.parameter];
  var options = layer.displayOptions;
  if ("paletteName" in layer.displayOptions) {
    layer.displayOptions.palette = COLORS[layer.displayOptions.paletteName];
    options["palette"] = COLORS[layer.displayOptions.paletteName];
  }
  if (!("opacity" in layer.displayOptions)) {
    options["opacity"] = 1;
  }
  if (!("convolve" in layer.displayOptions)) {
    options["convolve"] = 0;
  }
  loading("Downloading satellite image");
  var { data } = await axios.get(url, {
    responseType: "arraybuffer",
  });

  loading("Processing satellite image");
  var leaflet_layer = getNested(layerStore, path);
  if (leaflet_layer !== null && leaflet_layer !== undefined) {
    await leaflet_layer.update(data, options);
  } else {
    leaflet_layer = await L.floatgeotiff(data, options).addTo(map);
    setNested(layerStore, path, leaflet_layer);
  }
};

const updateSencastTiff = async (
  layer,
  dataStore,
  layerStore,
  map,
  datetime
) => {
  if (layerStore["wms"]) {
    map.removeLayer(layerStore["wms"]);
    layerStore["wms"] = null;
  }
  if (layer.displayOptions.wms) {
    layerStore["wms"] = L.tileLayer
      .wms(layer.properties.wms, {
        tileSize: 512,
        attribution:
          '&copy; <a href="http://www.sentinel-hub.com/" target="_blank">Sentinel Hub</a>',
        minZoom: 6,
        maxZoom: 16,
        preset: "TRUE-COLOR",
        layers: "TRUE-COLOR",
        time: formatWmsDate(layer.displayOptions.date),
        gain: 1,
        gamma: 1,
      })
      .addTo(map);
  }
  await plotSencastTiff(layer.url, layer, layerStore, map);
};

const removeSencastTiff = (layer, layerStore, map) => {
  var source = layer.sources[layer.source];
  var path = [source.type, source.model, layer.lake, layer.parameter];
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
  var source = layer.sources[layer.source];
  var path = [source.type, source.model, layer.lake, layer.parameter];
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
    layer.displayOptions.includeDates = dates.map((m) => m.time);
    layer.displayOptions.percentage = dates.map((m) => m.percent);
    layer.displayOptions.date = image.time;
  } else {
    metadata = getNested(dataStore, path);
    image = findClosest(metadata, "unix", layer.displayOptions.date);
  }

  var leaflet_layer = L.tileLayer
    .wms(layer.properties.wms, {
      tileSize: 512,
      attribution:
        '&copy; <a href="http://www.sentinel-hub.com/" target="_blank">Sentinel Hub</a>',
      minZoom: 6,
      maxZoom: 16,
      preset: layer.displayOptions.layer,
      layers: layer.displayOptions.layer,
      time: formatWmsDate(layer.displayOptions.date),
      gain: layer.displayOptions.gain,
      gamma: layer.displayOptions.gamma,
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
  var source = layer.sources[layer.source];
  var path = [source.type, source.model, layer.lake, layer.parameter];
  var metadata = getNested(dataStore, path);
  var leaflet_layer = getNested(layerStore, path);

  const image = findClosest(
    metadata,
    "unix",
    layer.displayOptions.date.getTime()
  );
  layer.displayOptions.updateDate = false;

  leaflet_layer.setParams({
    time: formatWmsDate(image.time),
    gain: layer.displayOptions.gain,
    gamma: layer.displayOptions.gamma,
  });
};

const removeSentinelHubWms = (layer, layerStore, map) => {
  var source = layer.sources[layer.source];
  var path = [source.type, source.model, layer.lake, layer.parameter];
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
  var source = layer.sources[layer.source];
  var path = [
    "alplakes_hydrodynamic",
    source.model,
    layer.lake,
    "velocity",
    String(depth),
  ];
  var geometry_path = [
    "alplakes_hydrodynamic",
    source.model,
    layer.lake,
    "geometry",
  ];
  var layer_path = [source.type, source.model, layer.lake];
  var data = getNested(dataStore, path);
  var geometry = getNested(dataStore, geometry_path);
  var options = layer.displayOptions;
  if (!("opacity" in layer.displayOptions)) {
    options["opacity"] = 1;
  }
  if ("unit" in layer) {
    options["unit"] = layer.unit;
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
  var source = layer.sources[layer.source];
  var layer_path = [source.type, source.model, layer.lake];

  var options = layer.displayOptions;

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
  var source = layer.sources[layer.source];
  var path = [source.type, source.model, layer.lake];
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
  var source = layer.sources[layer.source];
  var path = [source.type, source.model, layer.lake];
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
  var source = layer.sources[layer.source];
  var path = [source.type, source.model, layer.lake];
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
  var source = layer.sources[layer.source];
  var path = [source.type, source.model, layer.lake];
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
  var source = layer.sources[layer.source];
  var path = [source.type, source.model, layer.lake];
  var leaflet = getNested(layerStore, path);
  leaflet.control.remove(map);
  map.removeLayer(leaflet.layer);
  setNested(layerStore, path, null);
};
