import L from "leaflet";
import axios from "axios";
import COLORS from "../colors/colors.json";
import CONFIG from "../../config.json";
import leaflet_marker from "../../img/leaflet_marker.png";
import Translate from "../../translations.json";
import {
  getColor,
  round,
  formatTime,
  formatDatetime,
  capitalize,
  formatWmsDate,
} from "./general";
import "./leaflet_raster";
import "./leaflet_streamlines";
import "./leaflet_floatgeotiff";
import "./leaflet_particletracking";
import "./leaflet_polylinedraw";
import "./leaflet_vectorfield";
import "./leaflet_markerdraw";
import icons from "./icons.json";

export const update = async (
  map,
  layers,
  updates,
  language,
  addControls,
  removeControls,
  server,
  play,
  togglePlay,
) => {
  const functions = {
    addLayer: {
      tiff: addTiff,
      points: addPoints,
      raster: addRaster,
      vector: addVectorField,
      particles: addParticles,
    },
    updateLayer: {
      tiff: updateTiff,
      raster: updateRaster,
      vector: updateVectorField,
      streamlines: updateStreamlines,
      particles: updateParticles,
      wms: updateWms,
    },
  };
  if (play) togglePlay();
  for (let i = 0; i < updates.length; i++) {
    if (
      updates[i].event in functions &&
      updates[i].type in functions[updates[i].event]
    ) {
      if (!(updates[i].id in layers)) layers[updates[i].id] = {};
      await functions[updates[i].event][updates[i].type](
        map,
        layers,
        updates[i].id,
        updates[i].options,
        language,
        server,
      );
    } else if (updates[i].event === "loaded") {
    } else if (updates[i].event === "removeLayer") {
      genericRemoveLayer(map, layers, updates[i].id);
    } else if (updates[i].event === "addPlay") {
      addPlay(updates[i].options, addControls);
    } else if (updates[i].event === "removePlay") {
      removeControls();
    } else if (updates[i].event === "bounds") {
      setBounds(map, updates[i].options);
    } else {
      console.error(
        `Event ${updates[i].event} has no function ${updates[i].type}`,
      );
    }
  }
};

const addRaster = async (map, layers, id, options, language, server) => {
  var defaultOptions = {
    paletteName: "vik",
    opacity: 1,
    interpolate: false,
  };
  var displayOptions = { ...defaultOptions, ...options.displayOptions };
  let palette = COLORS[displayOptions["paletteName"]].map((c) => {
    return { color: [c[0], c[1], c[2]], point: c[3] };
  });
  displayOptions.palette = palette;
  layers[id]["data"] = { geometry: options.geometry, data: options.data };
  layers[id]["raster"] = new L.Raster(
    options.geometry,
    options.data,
    displayOptions,
  ).addTo(map);

  if ("profile" in options.displayOptions && options.displayOptions.profile) {
    layers[id]["profile_layer"] = L.layerGroup([]).addTo(map);
    layers[id]["profile_layer"].setZIndex(999);
    layers[id]["profile_control"] = L.control
      .markerDraw({
        fire: (event) => server.getProfile(event, id),
        layer: layers[id]["profile_layer"],
        markerIconUrl: leaflet_marker,
        id: map.getContainer().id,
        enabledFunction: server.disableControls,
        svgIcon: icons["profile"],
        title: "Profile",
        hover: "Add profile",
      })
      .addTo(map);
  }

  if ("transect" in options.displayOptions && options.displayOptions.transect) {
    layers[id]["transect_layer"] = L.layerGroup([]).addTo(map);
    layers[id]["transect_layer"].setZIndex(999);
    layers[id]["transect_control"] = L.control
      .polylineDraw({
        fire: (event) => server.getTransect(event, id),
        layer: layers[id]["transect_layer"],
        id: map.getContainer().id,
        enabledFunction: server.disableControls,
      })
      .addTo(map);
  }

  if ("labels" in options) {
    const labelLayer = L.layerGroup([]).addTo(map);
    for (let i = 0; i < options.labels.length; i++) {
      var value;
      if (options.data.length === 2) {
        let valueA = options.data[0][options.labels[i].i][options.labels[i].j];
        let valueB = options.data[1][options.labels[i].i][options.labels[i].j];
        value = valueA + (valueB - valueA) * displayOptions.interpolate;
      } else {
        value = options.data[options.labels[i].i][options.labels[i].j];
      }
      let marker = L.marker(options.labels[i].latlng, {
        icon: L.divIcon({
          className: "leaflet-mouse-marker",
          iconAnchor: [20, 20],
          iconSize: [40, 40],
        }),
      }).addTo(labelLayer);
      marker.bindTooltip(
        `<a href=${
          options.labels[i].url
        }><div class="temperature-label"><div class="name">${
          options.labels[i].name
        }</div><div class="value">${
          typeof value === "number"
            ? String(Math.round(value * 10) / 10) + displayOptions["unit"]
            : ""
        }</div></div></a>`,
        {
          id: options.labels[i].name,
          unit: displayOptions["unit"],
          permanent: true,
          direction: options.labels[i].direction
            ? options.labels[i].direction
            : "top",
          offset: L.point(0, 0),
          interactive: true,
        },
      );
    }
    layers[id]["labels"] = labelLayer;
  }
};

const updateRaster = (map, layers, id, options, language) => {
  if ("raster" in layers[id]) {
    if (options.raster) {
      layers[id]["raster"].update(false, options);
    } else {
      map.removeLayer(layers[id]["raster"]);
      delete layers[id]["raster"];
    }
  } else if ("data" in layers[id]) {
    if (options.raster) {
      var defaultOptions = {
        paletteName: "vik",
        opacity: 1,
        interpolate: false,
      };
      var displayOptions = { ...defaultOptions, ...options };
      let palette = COLORS[displayOptions["paletteName"]].map((c) => {
        return { color: [c[0], c[1], c[2]], point: c[3] };
      });
      displayOptions.palette = palette;
      layers[id]["raster"] = new L.Raster(
        layers[id].data.geometry,
        layers[id].data.data,
        displayOptions,
      ).addTo(map);
    }
  }
};

const updateLabels = (labels_layer, raster_layer) => {
  labels_layer.getLayers().forEach((m) => {
    let tooltip = m.getTooltip();
    let { value } = raster_layer._getValue(L.latLng(tooltip._latlng));
    m.getTooltip().setContent(
      `<div class="temperature-label"><div class="name">${
        tooltip.options.id
      }</div><div class="value">${
        typeof value === "number"
          ? Math.round(value * 10) / 10 + tooltip.options.unit
          : ""
      }</div></div>`,
    );
  });
};

const addVectorField = async (map, layers, id, options, language, server) => {
  var defaultOptions = {
    opacity: 1,
    interpolate: false,
  };
  var displayOptions = { ...defaultOptions, ...options.displayOptions };
  layers[id]["data"] = { geometry: options.geometry, data: options.data };
  layers[id]["vector"] = new L.vectorfield(
    options.geometry,
    options.data,
    displayOptions,
  ).addTo(map);
};

const updateVectorField = (map, layers, id, options, language) => {
  if ("vector" in layers[id]) {
    if (options.vector) {
      layers[id]["vector"].update(false, options);
    } else {
      map.removeLayer(layers[id]["vector"]);
      delete layers[id]["vector"];
    }
  } else if ("data" in layers[id]) {
    if (options.vector) {
      var defaultOptions = {
        opacity: 1,
        interpolate: false,
      };
      var displayOptions = { ...defaultOptions, ...options };
      layers[id]["vector"] = new L.vectorfield(
        layers[id].data.geometry,
        layers[id].data.data,
        displayOptions,
      ).addTo(map);
    }
  }
};

const updateStreamlines = (map, layers, id, options, language) => {
  if ("streamlines" in layers[id]) {
    if (options.streamlines) {
      layers[id]["streamlines"].update(false, options);
    } else {
      map.removeLayer(layers[id]["streamlines"]);
      delete layers[id]["streamlines"];
    }
  } else if ("data" in layers[id]) {
    if (options.streamlines) {
      layers[id]["streamlines"] = L.streamlines(
        layers[id].data.geometry,
        layers[id].data.data,
        options,
      ).addTo(map);
    }
  }
};

const addParticles = async (map, layers, id, options, language, server) => {
  var defaultOptions = {
    opacity: 1,
  };
  var displayOptions = {
    ...defaultOptions,
    ...options.displayOptions,
    enabledFunction: server.disableControls,
  };
  displayOptions.id = options.id;
  layers[id]["particles_control"] = L.control
    .particleTracking(
      options.geometry,
      options.data,
      options.datetime,
      options.times,
      displayOptions,
    )
    .addTo(map);
};

const updateParticles = (map, layers, id, options, language) => {
  if ("remove" in options && options.remove) {
    layers[id]["particles_control"].clear();
    options.remove = false;
  }
  layers[id]["particles_control"].update(false, options);
};

const addTiff = async (map, layers, id, options, language, server) => {
  var defaultOptions = {
    paletteName: "vik",
    opacity: 1,
  };
  var displayOptions = { ...defaultOptions, ...options.displayOptions };
  let palette = COLORS[displayOptions["paletteName"]].map((c) => {
    return { color: [c[0], c[1], c[2]], point: c[3] };
  });
  displayOptions.palette = palette;
  let { data } = await axios.get(options.url, {
    responseType: "arraybuffer",
  });
  layers[id]["tiff"] = await L.floatgeotiff(data, displayOptions).addTo(map);
  if (!map["satelliteTimeseriesControl"]) {
    map["satelliteTimeseriesControl"] = L.control
      .markerDraw({
        fire: (event) => server.getSatelliteTimeseries(event),
        markerIconUrl: leaflet_marker,
        id: map.getContainer().id,
        enabledFunction: server.disableControls,
        svgIcon: icons["satelliteTimeseries"],
        title: "Satellite timeseries",
        hover: "Add timeseries",
      })
      .addTo(map);
  }
};

const updateTiff = async (map, layers, id, options, language) => {
  if (layers[id]["tiff"].options.url === options.url) {
    await layers[id]["tiff"].update(false, options);
  } else {
    let { data } = await axios.get(options.url, {
      responseType: "arraybuffer",
    });
    await layers[id]["tiff"].update(data, options);
    updateWms(map, layers, id, options, language);
  }
};

const updateWms = async (map, layers, id, options, language) => {
  try {
    map.removeLayer(layers[id]["wms"]);
    delete layers[id]["wms"];
  } catch (e) {}
  if (options.wms) {
    var url = "";
    var type = "TRUE_COLOR";
    var time = formatWmsDate(options.time);
    if (options.url.includes("sentinel2")) {
      url = CONFIG.sentinel2_wms;
    } else if (options.url.includes("sentinel3")) {
      url = CONFIG.sentinel3_wms;
    } else if (
      options.url.includes("_L9_") ||
      options.url.includes("_L8_") ||
      options.url.includes("landsat")
    ) {
      url = CONFIG.landsat89_wms;
      type = "TRUE-COLOR-L1";
      time = formatWmsDate(options.time, 240);
    }
    layers[id]["wms"] = L.tileLayer
      .wms(url, {
        tileSize: 512,
        attribution:
          '&copy; <a href="http://www.sentinel-hub.com/" target="_blank">Sentinel Hub</a>',
        minZoom: 6,
        maxZoom: 16,
        preset: type,
        layers: type,
        time: time,
        gain: 1,
        gamma: 1,
      })
      .addTo(map);
  }
};

const addPoints = async (map, layers, id, options, language, server) => {
  let palette = COLORS[options.displayOptions.paletteName].map((c) => {
    return { color: [c[0], c[1], c[2]], point: c[3] };
  });
  const minDate = new Date();
  minDate.setHours(0, 0, 0, 0);
  const layer = L.layerGroup([]).addTo(map);
  for (let i = 0; i < options.data.features.length; i++) {
    let station = options.data.features[i];
    let time = new Date(station.properties.last_time * 1000);
    var marker;
    var color = getColor(
      station.properties.last_value,
      options.displayOptions.min,
      options.displayOptions.max,
      palette,
    );
    if (station.properties.icon === "river") {
      marker = L.marker(
        [station.geometry.coordinates[1], station.geometry.coordinates[0]],
        {
          icon: L.divIcon({
            className: "custom-square-marker",
            html: `<div style="background-color: rgb(${color[0]},${color[1]},${
              color[2]
            });opacity: ${station.properties.recent ? 1 : 0.2}"></div>`,
            iconSize: [10, 10],
            iconAnchor: [5, 5],
          }),
          value: station.properties.last_value,
        },
      ).addTo(layer);
    } else {
      marker = L.marker(
        [station.geometry.coordinates[1], station.geometry.coordinates[0]],
        {
          icon: L.divIcon({
            className: "custom-circle-marker",
            html: `<div style="background-color: rgb(${color[0]},${color[1]},${
              color[2]
            });opacity: ${station.properties.recent ? 1 : 0.2}"></div>`,
            iconSize: [14, 14],
            iconAnchor: [7, 7],
          }),
          value: station.properties.latest_value,
        },
      ).addTo(layer);
    }
    marker.bindTooltip(
      station.properties.permenant
        ? `<div class="value now">${
            round(station.properties.last_value, 1) + options.unit
          }</div>`
        : `<div class="time">${
            station.properties.recent ? formatTime(time) : formatDatetime(time)
          }</div><div class="value">${
            round(station.properties.last_value, 1) + options.unit
          }</div>`,
      {
        direction: "top",
        permanent: station.properties.permenant,
        className: "current_temperature_tooltip",
        offset: [0, -2],
      },
    );
    var { label, source: dataSource, url, icon } = station.properties;
    marker.bindPopup(
      `<div class=title>${label}</div><table><tr><td>${
        Translate.lastreading[language]
      }</td><td>${
        round(station.properties.last_value, 2) + options.unit
      }</td></tr><tr><td>Time</td><td>${formatDatetime(
        time,
      )}</td></tr><tr><td>${Translate.type[language]}</td><td>${capitalize(
        icon,
      )} station</td></tr><tr><td>${
        Translate.source[language]
      }</td><td>${dataSource}</td></tr></table><a class="external-link" href="${url}" target="_blank">${
        Translate.viewdataset[language]
      }</a>`,
    );
  }
  layers[id]["points"] = layer;
};

const addPlay = (options, addControls) => {
  addControls(options.period, options.datetime, options.timestep, options.data);
};

const genericRemoveLayer = (map, layers, id) => {
  for (let key of Object.keys(layers[id])) {
    if (key.includes("control")) {
      try {
        map.removeControl(layers[id][key]);
      } catch (e) {
        console.error(`Failed to remove layer ${key}`);
      }
    } else {
      try {
        map.removeLayer(layers[id][key]);
      } catch (e) {
        console.error(`Failed to remove layer ${key}`);
      }
    }
  }
  layers[id] = {};

  if (map["satelliteTimeseriesControl"]) {
    let remove = true;
    for (let key of Object.keys(layers)) {
      if (key.includes("satellite") && "tiff" in layers[key]) {
        remove = false;
      }
    }
    if (remove) {
      map.removeControl(map["satelliteTimeseriesControl"]);
      map["satelliteTimeseriesControl"] = null;
    }
  }
};

const setBounds = (map, bounds) => {
  map.fitBounds(L.latLngBounds(L.latLng(bounds[0]), L.latLng(bounds[1])), {
    padding: [20, 20],
  });
};

export const setPlayDatetime = (layers, datetime, period, data) => {
  for (let key of Object.keys(data)) {
    const timestep = (period[1] - period[0]) / data[key].length;
    var i0 = Math.max(
      Math.min(
        Math.floor((datetime - period[0]) / timestep),
        data[key].length - 1,
      ),
      0,
    );
    for (let plot_type of Object.keys(layers[key])) {
      if (plot_type === "data") {
      } else if (plot_type === "raster") {
        if (i0 === data[key].length - 1) {
          i0 = i0 - 1;
        }
        const i1 = i0 + 1;
        const beforeValue = period[0] + i0 * timestep;
        const afterValue = beforeValue + timestep;
        const interpolate =
          (datetime - beforeValue) / (afterValue - beforeValue);
        if ("data" in layers[key]) {
          layers[key]["data"]["data"] = data[key][i0];
        }
        layers[key][plot_type].update([data[key][i0], data[key][i1]], {
          interpolate,
        });
      } else if (plot_type === "labels") {
        updateLabels(layers[key][plot_type], layers[key]["raster"]);
      } else if (plot_type === "particles_control") {
        layers[key][plot_type].update(datetime, false);
      } else if (
        plot_type.includes("transect") ||
        plot_type.includes("profile")
      ) {
      } else {
        if ("data" in layers[key]) {
          layers[key]["data"]["data"] = data[key][i0];
        }
        layers[key][plot_type].update(data[key][i0], false);
      }
    }
  }
};
