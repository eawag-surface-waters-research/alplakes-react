import L from "leaflet";
import * as d3 from "d3";
import axios from "axios";
import COLORS from "../colors/colors.json";
import CONFIG from "../../config.json";
import leaflet_marker from "../../img/leaflet_marker.png";
import Translate from "../../translations.json";
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

const getColor = (value, min, max, palette) => {
  if (value === null || isNaN(value)) {
    return false;
  }
  if (value > max) {
    return palette[palette.length - 1].color;
  }
  if (value < min) {
    return palette[0].color;
  }
  var loc = (value - min) / (max - min);

  var index = 0;
  for (var i = 0; i < palette.length - 1; i++) {
    if (loc >= palette[i].point && loc <= palette[i + 1].point) {
      index = i;
    }
  }
  var color1 = palette[index].color;
  var color2 = palette[index + 1].color;

  var f =
    (loc - palette[index].point) /
    (palette[index + 1].point - palette[index].point);

  var rgb = [
    color1[0] + (color2[0] - color1[0]) * f,
    color1[1] + (color2[1] - color1[1]) * f,
    color1[2] + (color2[2] - color1[2]) * f,
  ];

  return rgb;
};

const formatTime = (date) => {
  let hours = date.getHours();
  let minutes = date.getMinutes();
  hours = hours.toString().padStart(2, "0");
  minutes = minutes.toString().padStart(2, "0");
  return `${hours}:${minutes}`;
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

const formatDatetime = (datetime, offset = 0) => {
  var a = new Date(datetime).getTime();
  a = new Date(a + offset);
  var year = a.getFullYear();
  var month = a.getMonth() + 1;
  var date = a.getDate();
  var hour = a.getHours();
  var minute = a.getMinutes();
  return `${hour < 10 ? "0" + hour : hour}:${
    minute < 10 ? "0" + minute : minute
  } ${date < 10 ? "0" + date : date}.${
    month < 10 ? "0" + month : month
  }.${String(year)}`;
};

const formatSencastDay = (datetime) => {
  var a = new Date(datetime);
  var year = a.getFullYear();
  var month = a.getMonth() + 1;
  var date = a.getDate();
  return `${String(year)}${month < 10 ? "0" + month : month}${
    date < 10 ? "0" + date : date
  }`;
};

const capitalize = (string) => {
  if (string.length === 0) {
    return string;
  }
  return string.charAt(0).toUpperCase() + string.slice(1);
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

const parseAlplakesDate = (str) => {
  const d = new Date(
    `${str.slice(0, 4)}-${str.slice(4, 6)}-${str.slice(6, 8)}T${str.slice(
      8,
      10
    )}:${str.slice(10, 12)}:00.000+00:00`
  );
  return d;
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

const satelliteStringToDate = (date) => {
  return new Date(
    `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}T${date.slice(
      9,
      11
    )}:${date.slice(11, 13)}:00.000+00:00`
  );
};

const closestIndex = (num, arr) => {
  let curr = arr[0],
    diff = Math.abs(num - curr);
  let index = 0;
  for (let val = 0; val < arr.length; val++) {
    let newdiff = Math.abs(num - arr[val]);
    if (newdiff < diff) {
      diff = newdiff;
      curr = arr[val];
      index = val;
    }
  }
  return index;
};

export const compareDates = (date1, date2) => {
  return date1 - date2;
};

export const filterImages = (images, coverage, satellite) => {
  var available = {};
  for (let date of Object.keys(images)) {
    let day = JSON.parse(JSON.stringify(images[date]));
    day.time = new Date(day.time);
    day.images = day.images
      .filter((i) => i.percent > coverage)
      .map((i) => {
        i.time = new Date(i.time);
        return i;
      });
    if (satellite.length > 0) {
      day.images = day.images.filter((i) => satellite.includes(i.model));
    }
    if (day.images.length > 0) {
      available[date] = day;
    }
  }
  return available;
};

const weightedAverage = (values, weights) => {
  if (
    values.length !== weights.length ||
    values.length === 0 ||
    weights.length === 0
  ) {
    throw new Error(
      "Values and weights arrays must have the same length and cannot be empty."
    );
  }
  const sumOfProducts = values.reduce(
    (acc, value, index) => acc + value * weights[index],
    0
  );
  const sumOfWeights = weights.reduce((acc, weight) => acc + weight, 0);
  return sumOfProducts / sumOfWeights;
};

export const parseAPITime = (date) => {
  return new Date(
    `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}T${date.slice(
      8,
      10
    )}:${date.slice(10, 12)}:00.000+00:00`
  );
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

const loading = (message, id) => {
  var parent = document.getElementById(id);
  if (parent) {
    parent.querySelector("#loading-text").innerHTML = message;
    parent.style.visibility = "visible";
  }
};

export const loaded = (id) => {
  if (document.getElementById(id)) {
    document.getElementById(id).style.visibility = "hidden";
  }
};

export const addLayer = async (
  layer,
  layers,
  dataStore,
  layerStore,
  map,
  initialLoad,
  props
) => {
  var {
    period,
    language,
    datetime,
    depth,
    getTransect,
    getProfile,
    setDepthAndPeriod,
    active,
    loadingId,
    mapId,
    setLayers,
  } = props;
  var source = layer.sources[layer.source];
  if (source.type === "alplakes_hydrodynamic") {
    return await addAlplakesHydrodynamic(
      layer,
      period,
      dataStore,
      layerStore,
      map,
      datetime,
      depth,
      initialLoad,
      setDepthAndPeriod,
      loadingId,
      setLayers,
      layers
    );
  } else if (source.type === "sencast_tiff") {
    return await addSencastTiff(layer, layerStore, map, active, loadingId);
  } else if (source.type === "alplakes_particles") {
    return await addAlplakesParticles(
      layer,
      period,
      dataStore,
      layerStore,
      map,
      mapId,
      datetime,
      depth,
      initialLoad,
      loadingId
    );
  } else if (source.type === "alplakes_transect") {
    return await addAlplakesTransect(
      layer,
      layerStore,
      map,
      mapId,
      getTransect
    );
  } else if (source.type === "alplakes_profile") {
    return await addAlplakesProfile(layer, layerStore, map, mapId, getProfile);
  } else if (source.type === "current_temperature_points") {
    return await addAlplakesMeasurements(
      layer,
      layerStore,
      map,
      loadingId,
      language
    );
  }
};

export const updateLayer = async (layer, dataStore, layerStore, map, props) => {
  var { datetime, depth, active, loadingId } = props;
  var source = layer.sources[layer.source];
  if (source.type === "alplakes_hydrodynamic") {
    return await updateAlplakesHydrodynamic(
      layer,
      dataStore,
      layerStore,
      map,
      datetime,
      depth,
      loadingId
    );
  } else if (source.type === "sencast_tiff") {
    return await updateSencastTiff(layer, layerStore, map, active, loadingId);
  } else if (source.type === "alplakes_particles") {
    return await updateAlplakesParticles(
      layer,
      dataStore,
      layerStore,
      map,
      datetime,
      depth,
      loadingId
    );
  }
};

export const removeLayer = async (layer, layerStore, map) => {
  var source = layer.sources[layer.source];
  if (source.type === "alplakes_hydrodynamic") {
    return await removeAlplakesHydrodynamic(layer, layerStore, map);
  } else if (source.type === "sencast_tiff") {
    return await removeSencastTiff(layer, layerStore, map);
  } else if (source.type === "alplakes_transect") {
    return removeAlplakesTransect(layer, layerStore, map);
  } else if (source.type === "alplakes_profile") {
    return removeAlplakesProfile(layer, layerStore, map);
  } else if (source.type === "alplakes_particles") {
    return removeAlplakesParticles(layer, layerStore, map);
  } else if (source.type === "current_temperature_points") {
    return await removeAlplakesMeasurements(layer, layerStore, map);
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
  initialLoad,
  setDepthAndPeriod,
  loadingId,
  setLayers,
  layers
) => {
  var source = layer.sources[layer.source];
  if (initialLoad || source.height === undefined) {
    loading("Collecting metadata", loadingId);
    ({ layer, period, depth, datetime } = await getAlplakesHydrodynamicMetadata(
      layer,
      depth,
      datetime
    ));
    setDepthAndPeriod(depth, period, datetime);
  }
  loading("Downloading lake geometry", loadingId);
  await downloadAlplakesHydrodynamicGeometry(layer, period, dataStore);
  loading(`Downloading lake ${layer.parameter} field`, loadingId);
  await downloadAlplakesHydrodynamicParameter(
    layer,
    period,
    depth,
    dataStore,
    initialLoad
  );
  plotAlplakesHydrodynamic(
    layer,
    datetime,
    depth,
    dataStore,
    layerStore,
    map,
    setLayers,
    layers
  );
  loaded(loadingId);
  return layer;
};

const getAlplakesHydrodynamicMetadata = async (layer, depth, datetime) => {
  var source = layer.sources[layer.source];
  var data;
  try {
    ({ data } = await axios.get(
      `${CONFIG.alplakes_bucket}/simulations/${source.model}/cache/${
        layer.lake
      }/metadata.json?timestamp=${
        Math.round((new Date().getTime() + 1800000) / 3600000) * 3600 - 3600
      }`
    ));
  } catch (e) {
    ({ data } = await axios.get(
      `${CONFIG.alplakes_api}/simulations/metadata/${source.model}/${layer.lake}`
    ));
  }
  if (data.end_date.length === 10) {
    data.end_date = data.end_date + " 21:00";
  }
  source.minDate = stringToDate(data.start_date).getTime();
  source.maxDate = stringToDate(data.end_date).getTime();
  source.height = data.height;
  source.width = data.width;
  var startDate = source.maxDate + source.start * 8.64e7;
  source.depths = data.depth;
  let index = closestIndex(depth, source.depths);
  depth = source.depths[index];
  if ("missing_weeks" in data) {
    source.missingDates = data.missing_weeks;
  }
  var period = [startDate, source.maxDate];
  if (datetime < startDate || datetime > source.maxDate) datetime = startDate;
  return { layer, period, depth, datetime };
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
      `${CONFIG.alplakes_bucket}/simulations/${source.model}/cache/${layer.lake}/geometry.txt`
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
  initialLoad,
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
  setNested(dataStore, path, {});

  var start = period[0];
  var end = period[1];
  var par;
  if (initialLoad) {
    try {
      ({ data: par } = await axios.get(
        `${CONFIG.alplakes_bucket}/simulations/${source.model}/cache/${
          layer.lake
        }/${parameter}.txt?timestamp=${
          Math.round((new Date().getTime() + 1800000) / 3600000) * 3600 - 3600
        }`
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

  var average = { x: [], y: [], title: `${depth}m`, name: "Average" };
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
    setNested(dataStore, [...path, String(date.getTime())], data);
    let mean = d3.mean(data_flat);
    if (mean) {
      average.y.push(d3.mean(data_flat));
      average.x.push(date);
    }
  }

  var min = d3.min(bounds.min);
  var max = d3.max(bounds.max);
  layer.displayOptions.min = min;
  layer.displayOptions.max = max;
  layer.displayOptions.dataMin = min;
  layer.displayOptions.dataMax = max;
  layer.displayOptions.data = [average];
};

const plotAlplakesHydrodynamic = (
  layer,
  datetime,
  depth,
  dataStore,
  layerStore,
  map,
  setLayers,
  layers
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
        interpolateValue,
        data,
        depth,
        setLayers,
        layers
      );
    } else {
      plotAlplakesHydrodynamicRaster(
        layer,
        layerStore,
        map,
        geometry,
        data[closestDate(datetime, Object.keys(data))],
        false,
        data,
        depth,
        setLayers,
        layers
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
  interpolate,
  fullData,
  depth,
  setLayers,
  layers
) => {
  var source = layer.sources[layer.source];
  var path = [source.type, source.model, layer.lake, layer.parameter];
  var options = layer.displayOptions;
  if ("paletteName" in layer.displayOptions) {
    let palette = COLORS[layer.displayOptions.paletteName].map((c) => {
      return { color: [c[0], c[1], c[2]], point: c[3] };
    });
    layer.displayOptions.palette = palette;
    options["palette"] = palette;
  }
  if (!("opacity" in layer.displayOptions)) {
    options["opacity"] = 1;
  }
  if ("unit" in layer) {
    options["unit"] = layer.unit;
  }
  options["interpolate"] = interpolate;
  var leaflet_layer = new L.Raster(geometry, data, options).addTo(map);
  leaflet_layer.on("click", function (event) {
    if (event.value !== null) {
      let label = `${round(event.latlng.lat, 2)}, ${round(
        event.latlng.lng,
        2
      )}`;
      if (
        !layer.displayOptions.data.map((d) => d.name).includes(label) &&
        layer.displayOptions.data.length < 6
      ) {
        layer.displayOptions.data.push(
          setAlplakesRasterGraphData(event.index, label, fullData)
        );
        setLayers(layers);
      }
    }
  });
  if ("labels" in layer && layer.displayOptions.labels) {
    layer.labels.map((p) => {
      let { value, index } = leaflet_layer._getValue(L.latLng(p.latlng));
      let marker = L.marker(p.latlng, {
        icon: L.divIcon({
          className: "leaflet-mouse-marker",
          iconAnchor: [20, 20],
          iconSize: [40, 40],
        }),
      }).addTo(layerStore["labels"]);
      let tooltip = marker.bindTooltip(
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
          interactive: true,
        }
      );
      tooltip.on("click", function (event) {
        L.DomEvent.stopPropagation(event);
        if (value !== null) {
          let label = `${p.name}`;
          if (
            !layer.displayOptions.data.map((d) => d.name).includes(label) &&
            layer.displayOptions.data.length < 6
          ) {
            layer.displayOptions.data.push(
              setAlplakesRasterGraphData(index, label, fullData)
            );
            setLayers(layers);
          }
        }
      });
      return marker;
    });
  }
  setNested(layerStore, path, leaflet_layer);
};

const setAlplakesRasterGraphData = (index, label, data) => {
  var slice = { x: [], y: [], name: label };
  for (let ts of Object.keys(data)) {
    slice.x.push(new Date(parseFloat(ts)));
    slice.y.push(data[ts][index[0]][index[1]]);
  }
  return slice;
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
    let palette = COLORS[layer.displayOptions.paletteName].map((c) => {
      return { color: [c[0], c[1], c[2]], point: c[3] };
    });
    layer.displayOptions.palette = palette;
    options["palette"] = palette;
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
    let palette = COLORS[layer.displayOptions.paletteName].map((c) => {
      return { color: [c[0], c[1], c[2]], point: c[3] };
    });
    layer.displayOptions.palette = palette;
    options["palette"] = palette;
  }

  var newData;
  if (layer.displayOptions.interpolate) {
    ({ newData } = getTimestepData(data, datetime));
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
          let { value } = leaflet_layer._getValue(L.latLng(p.latlng));
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
          let { value } = leaflet_layer._getValue(L.latLng(p.latlng));
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
  return layer;
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
  return layer;
};

const addSencastTiff = async (layer, layerStore, map, active, loadingId) => {
  layer.displayOptions.dataMin = layer.displayOptions.min;
  layer.displayOptions.dataMax = layer.displayOptions.max;
  var source = layer.sources[layer.source];
  source.bucket = source.bucket.replace("{lake}", layer.lake);
  if (active) {
    source = await collectSencastMetadata(source, loadingId, layer.lake);
    var images = filterImages(source.available, 10, []);
    var includeDates = Object.values(images).map((m) => m.time);
    includeDates.sort(compareDates);
    var currentDate = includeDates[includeDates.length - 1];
    var date = source.available[formatSencastDay(currentDate)];
    var image = date.images.filter((i) => i.percent === date.max_percent)[0];
    layer.displayOptions.image = image;
  } else {
    var { data } = await axios.get(CONFIG.sencast_bucket + source.bucket);
    let datetime = satelliteStringToDate(data.dt);
    let date = formatSencastDay(datetime);
    let { lake, group } = componentsFromFilename(data.k);
    layer.displayOptions.image = {
      url: `${CONFIG.sencast_bucket}/alplakes/cropped/${group}/${lake}/${data.k}`,
      ave: data.mean,
      date: date,
      time: datetime,
    };
  }
  await plotSencastTiff(layer.displayOptions.image.url, layer, layerStore, map);
  return layer;
};

const componentsFromFilename = (filename) => {
  let parts = filename.replace(".tif", "").replace("_lowres", "").split("_");
  let lake = parts[parts.length - 1];
  let group;
  let satellite;
  if (filename.includes("COLLECTION_")) {
    group = "collection";
    satellite = filename.includes("_L9") ? "L9" : "L8";
  } else if (filename.includes("_S2")) {
    group = "sentinel2";
    satellite = filename.includes("_S2A")
      ? "S2A"
      : filename.includes("_S2B")
      ? "S2B"
      : "S2C";
  } else if (filename.includes("_S3")) {
    group = "sentinel3";
    satellite = filename.includes("_S3A") ? "S3A" : "S3B";
  }
  return { lake, group, satellite };
};

const collectSencastMetadata = async (source, loadingId, lake) => {
  var available = {};
  loading("Collecting metadata", loadingId);
  for (let model of source.models) {
    model.metadata = model.metadata.replace("{lake}", lake);
    let { data: files } = await axios.get(
      CONFIG.sencast_bucket + model.metadata
    );
    let max_pixels = d3.max(files.map((m) => parseFloat(m.p)));
    for (let file of files) {
      let time = satelliteStringToDate(file.dt);
      let date = formatSencastDay(time);
      let { lake, satellite, group } = componentsFromFilename(file.k);
      let url = `${CONFIG.sencast_bucket}/alplakes/cropped/${group}/${lake}/${file.k}`;
      let split = file.k.split("_");
      let tile = split[split.length - 1].split(".")[0];
      let percent = Math.ceil((parseFloat(file.vp) / max_pixels) * 100);
      let { min, max, mean: ave } = file;
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
        available[date].ave = weightedAverage(
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
  source.available = available;
  loaded(loadingId);
  return source;
};

const plotSencastTiff = async (url, layer, layerStore, map, loadingId) => {
  var source = layer.sources[layer.source];
  var path = [source.type, layer.lake, layer.parameter];
  var options = layer.displayOptions;
  if ("paletteName" in layer.displayOptions) {
    let palette = COLORS[layer.displayOptions.paletteName].map((c) => {
      return { color: [c[0], c[1], c[2]], point: c[3] };
    });
    layer.displayOptions.palette = palette;
    options["palette"] = palette;
  }
  if (!("opacity" in layer.displayOptions)) {
    options["opacity"] = 1;
  }
  if (!("coverage" in layer.displayOptions)) {
    options["coverage"] = 0.1;
  }
  if (!("satellite" in layer.displayOptions)) {
    options["satellite"] = [];
  }
  options["source_url"] = url;

  if ("available" in source) {
    var images = filterImages(
      source.available,
      options["coverage"],
      options["satellite"]
    );
    options["availableImages"] = images;
    options["includeDates"] = Object.values(images).map((m) => m.time);
  }

  var leaflet_layer = getNested(layerStore, path);
  if (leaflet_layer !== null && leaflet_layer !== undefined) {
    if (leaflet_layer.options.source_url === url) {
      await leaflet_layer.update(false, options);
    } else {
      loading("Downloading satellite image", loadingId);
      let { data } = await axios.get(url, {
        responseType: "arraybuffer",
      });
      await leaflet_layer.update(data, options);
    }
  } else {
    loading("Downloading satellite image", loadingId);
    let { data } = await axios.get(url, {
      responseType: "arraybuffer",
    });
    leaflet_layer = await L.floatgeotiff(data, options).addTo(map);
    setNested(layerStore, path, leaflet_layer);
  }
  loaded(loadingId);
};

const updateSencastTiff = async (layer, layerStore, map, active, loadingId) => {
  var source = layer.sources[layer.source];
  if (active && !("available" in source)) {
    source = await collectSencastMetadata(source, loadingId, layer.lake);
  }
  await plotSencastTiff(
    layer.displayOptions.image.url,
    layer,
    layerStore,
    map,
    loadingId
  );
  if (layerStore["wms"]) {
    map.removeLayer(layerStore["wms"]);
    layerStore["wms"] = null;
  }
  if (layer.displayOptions.wms) {
    var url = "";
    var type = "TRUE-COLOR";
    if (layer.displayOptions.image.url.includes("/S2")) {
      url = CONFIG.sentinel2_wms;
      type = "TRUE_COLOR";
    }
    if (layer.displayOptions.image.url.includes("/S3"))
      url = CONFIG.sentinel3_wms;
    layerStore["wms"] = L.tileLayer
      .wms(url, {
        tileSize: 512,
        attribution:
          '&copy; <a href="http://www.sentinel-hub.com/" target="_blank">Sentinel Hub</a>',
        minZoom: 6,
        maxZoom: 16,
        preset: type,
        layers: type,
        time: formatWmsDate(layer.displayOptions.image.time),
        gain: 1,
        gamma: 1,
      })
      .addTo(map);
  }
  return layer;
};

const removeSencastTiff = (layer, layerStore, map) => {
  var source = layer.sources[layer.source];
  var path = [source.type, layer.lake, layer.parameter];
  var leaflet_layer = getNested(layerStore, path);
  map.removeLayer(leaflet_layer);
  setNested(layerStore, path, null);
  if (layerStore["wms"]) {
    map.removeLayer(layerStore["wms"]);
    layerStore["wms"] = null;
  }
  return layer;
};

const addAlplakesParticles = async (
  layer,
  period,
  dataStore,
  layerStore,
  map,
  mapId,
  datetime,
  depth,
  initialLoad,
  loadingId
) => {
  const overwrite = { parameter: "velocity", type: "alplakes_hydrodynamic" };
  var source = layer.sources[layer.source];
  if (initialLoad || source.height === undefined) {
    loading("Collecting metadata", loadingId);
    ({ layer, period, depth, datetime } = await getAlplakesHydrodynamicMetadata(
      layer,
      depth,
      datetime
    ));
  }
  loading("Downloading lake geometry", loadingId);
  await downloadAlplakesHydrodynamicGeometry(
    layer,
    period,
    dataStore,
    overwrite
  );
  loading("Downloading lake velocity field", loadingId);
  await downloadAlplakesHydrodynamicParameter(
    layer,
    period,
    depth,
    dataStore,
    initialLoad,
    overwrite
  );
  plotAlplakesParticles(
    layer,
    datetime,
    depth,
    dataStore,
    layerStore,
    map,
    mapId
  );
  loaded(loadingId);
};

const plotAlplakesParticles = (
  layer,
  datetime,
  depth,
  dataStore,
  layerStore,
  map,
  mapId
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
  options.id = mapId;

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
  layerStore,
  map,
  mapId,
  getTransect
) => {
  if ("paletteName" in layer.displayOptions) {
    layer.displayOptions.palette = COLORS[layer.displayOptions.paletteName].map(
      (c) => {
        return { color: [c[0], c[1], c[2]], point: c[3] };
      }
    );
  }
  var source = layer.sources[layer.source];
  var path = [source.type, source.model, layer.lake];
  var leaflet_layer = L.layerGroup([]).addTo(map);
  leaflet_layer.setZIndex(999);
  var leaflet_control = L.control
    .polylineDraw({
      fire: (event) => getTransect(event, layer.id),
      layer: leaflet_layer,
      id: mapId,
    })
    .addTo(map);
  setNested(layerStore, path, {
    layer: leaflet_layer,
    control: leaflet_control,
  });
  return layer;
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
  layerStore,
  map,
  mapId,
  getProfile
) => {
  if ("paletteName" in layer.displayOptions) {
    layer.displayOptions.palette = COLORS[layer.displayOptions.paletteName].map(
      (c) => {
        return { color: [c[0], c[1], c[2]], point: c[3] };
      }
    );
  }
  var source = layer.sources[layer.source];
  var path = [source.type, source.model, layer.lake];
  var leaflet_layer = L.layerGroup([]).addTo(map);
  leaflet_layer.setZIndex(999);
  var leaflet_control = L.control
    .markerDraw({
      fire: (event) => getProfile(event, layer.id),
      layer: leaflet_layer,
      markerIconUrl: leaflet_marker,
      id: mapId,
    })
    .addTo(map);
  setNested(layerStore, path, {
    layer: leaflet_layer,
    control: leaflet_control,
  });
  return layer;
};

const removeAlplakesProfile = (layer, layerStore, map) => {
  var source = layer.sources[layer.source];
  var path = [source.type, source.model, layer.lake];
  var leaflet = getNested(layerStore, path);
  leaflet.control.remove(map);
  map.removeLayer(leaflet.layer);
  setNested(layerStore, path, null);
};

const addAlplakesMeasurements = async (
  layer,
  layerStore,
  map,
  loadingId,
  language
) => {
  loading("Collecting metadata", loadingId);
  var source = layer.sources[layer.source];
  var path = [source.type];
  var leaflet_layer = L.layerGroup([]).addTo(map);
  if ("paletteName" in layer.displayOptions) {
    layer.displayOptions.palette = COLORS[layer.displayOptions.paletteName].map(
      (c) => {
        return { color: [c[0], c[1], c[2]], point: c[3] };
      }
    );
  }
  let minDate = new Date();
  minDate.setHours(0, 0, 0, 0);
  let { data } = await axios.get(
    source.url + `?timestamp=${new Date().getTime()}`
  );
  for (let i = 0; i < data["features"].length; i++) {
    let station = data["features"][i];
    let time = new Date(station.properties.last_time * 1000);
    var marker;
    var color = getColor(
      station.properties.last_value,
      layer.displayOptions.min,
      layer.displayOptions.max,
      layer.displayOptions.palette
    );
    var updated = time > minDate;
    var show =
      updated &&
      "lake" in station.properties &&
      station.properties.lake === layer.lake;
    if (station.properties.icon === "river") {
      marker = L.marker(
        [station.geometry.coordinates[1], station.geometry.coordinates[0]],
        {
          icon: L.divIcon({
            className: "custom-square-marker",
            html: `<div style="background-color: rgb(${color[0]},${color[1]},${
              color[2]
            });opacity: ${updated ? 1 : 0.3}"></div>`,
            iconSize: [10, 10],
            iconAnchor: [5, 5],
          }),
          value: station.properties.last_value,
        }
      ).addTo(leaflet_layer);
    } else {
      marker = L.marker(
        [station.geometry.coordinates[1], station.geometry.coordinates[0]],
        {
          icon: L.divIcon({
            className: "custom-circle-marker",
            html: `<div style="background-color: rgb(${color[0]},${color[1]},${
              color[2]
            });opacity: ${updated ? 1 : 0.3}"></div>`,
            iconSize: [14, 14],
            iconAnchor: [7, 7],
          }),
          value: station.properties.latest_value,
        }
      ).addTo(leaflet_layer);
    }
    marker.bindTooltip(
      `<div class="value">${
        round(station.properties.last_value, 2) + layer.unit
      }</div><div class="time">${
        updated ? formatTime(time) : formatDatetime(time)
      }</div>`,
      {
        direction: "top",
        permanent: show,
        className: "current_temperature_tooltip",
        offset: [0, -2],
      }
    );
    var { label, source: dataSource, url, icon } = station.properties;
    marker.bindPopup(
      `<div class=title>${label}</div><table><tr><td>${
        Translate.lastreading[language]
      }</td><td>${
        round(station.properties.last_value, 2) + layer.unit
      }</td></tr><tr><td></td><td>${formatDatetime(time)}</td></tr><tr><td>${
        Translate.type[language]
      }</td><td>${capitalize(icon)} station</td></tr><tr><td>${
        Translate.source[language]
      }</td><td>${dataSource}</td></tr></table><a class="external-link" href="${url}" target="_blank">${
        Translate.viewdataset[language]
      }</a>`
    );
  }
  setNested(layerStore, path, leaflet_layer);
  loaded(loadingId);
  return layer;
};

const removeAlplakesMeasurements = (layer, layerStore, map) => {
  var source = layer.sources[layer.source];
  var path = [source.type];
  var leaflet = getNested(layerStore, path);
  map.removeLayer(leaflet);
  setNested(layerStore, path, null);
};
