import L from "leaflet";
//import * as d3 from "d3";
import axios from "axios";
import COLORS from "../colors/colors.json";
//import CONFIG from "../../config.json";
//import leaflet_marker from "../../img/leaflet_marker.png";
import Translate from "../../translations.json";
import {
  getColor,
  round,
  formatTime,
  formatDatetime,
  capitalize,
} from "./general";
import "./leaflet_raster";
import "./leaflet_streamlines";
import "./leaflet_floatgeotiff";
import "./leaflet_particletracking";
import "./leaflet_polylinedraw";
import "./leaflet_vectorfield";
import "./leaflet_markerdraw";

export const update = async (
  map,
  layers,
  updates,
  language,
  addControls,
  removeControls
) => {
  const functions = {
    addLayer: {
      addTiff: addTiff,
      addGeoJson: addGeoJson,
      addRaster: addRaster,
      addVectorField: addVectorField,
    },
    updateLayer: {},
    removeLayer: {},
  };
  for (let i = 0; i < updates.length; i++) {
    if (
      updates[i].event in functions &&
      updates[i].type in functions[updates[i].event]
    ) {
      await functions[updates[i].event][updates[i].type](
        map,
        layers,
        updates[i].id,
        updates[i].options,
        language
      );
    } else if (updates[i].event === "addPlay") {
      addPlay(updates[i].options, addControls);
    } else if (updates[i].event === "removePlay") {
      removeControls();
    } else {
      console.error(
        `Event ${updates[i].event} has no function ${updates[i].type}`
      );
    }
  }
};

const addRaster = async (map, layers, id, options, language) => {
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
  layers[id] = new L.Raster(
    options.geometry,
    options.data,
    displayOptions
  ).addTo(map);
  if ("labels" in options) {
    const labelLayer = L.layerGroup([]).addTo(map);
    for (let i = 0; i < options.labels.length; i++) {
      let value = options.data[options.labels[i].i][options.labels[i].j];
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
          permanent: true,
          direction: options.labels[i].direction
            ? options.labels[i].direction
            : "top",
          offset: L.point(0, 0),
          interactive: true,
        }
      );
    }
    layers[id + "_labels"] = labelLayer;
  }
};

const addVectorField = async (map, layers, id, options, language) => {
  var defaultOptions = {
    opacity: 1,
    interpolate: false,
  };
  var displayOptions = { ...defaultOptions, ...options.displayOptions };
  layers[id] = new L.vectorfield(
    options.geometry,
    options.data,
    displayOptions
  ).addTo(map);
};

const addTiff = async (map, layers, id, options, language) => {
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
  layers[id] = await L.floatgeotiff(data, displayOptions).addTo(map);
};

const addGeoJson = async (map, layers, id, options, language) => {
  let palette = COLORS["vik"].map((c) => {
    return { color: [c[0], c[1], c[2]], point: c[3] };
  });
  const minDate = new Date();
  minDate.setHours(0, 0, 0, 0);
  layers["water_temperaure"] = L.layerGroup([]).addTo(map);
  for (let i = 0; i < options.data.features.length; i++) {
    let station = options.data.features[i];
    let time = new Date(station.properties.last_time * 1000);
    var marker;
    var color = getColor(
      station.properties.last_value,
      options.displayOptions.min,
      options.displayOptions.max,
      palette
    );
    if (station.properties.icon === "river") {
      marker = L.marker(
        [station.geometry.coordinates[1], station.geometry.coordinates[0]],
        {
          icon: L.divIcon({
            className: "custom-square-marker",
            html: `<div style="background-color: rgb(${color[0]},${color[1]},${
              color[2]
            });opacity: ${station.properties.recent ? 1 : 0.3}"></div>`,
            iconSize: [10, 10],
            iconAnchor: [5, 5],
          }),
          value: station.properties.last_value,
        }
      ).addTo(layers["water_temperaure"]);
    } else {
      marker = L.marker(
        [station.geometry.coordinates[1], station.geometry.coordinates[0]],
        {
          icon: L.divIcon({
            className: "custom-circle-marker",
            html: `<div style="background-color: rgb(${color[0]},${color[1]},${
              color[2]
            });opacity: ${station.properties.recent ? 1 : 0.3}"></div>`,
            iconSize: [14, 14],
            iconAnchor: [7, 7],
          }),
          value: station.properties.latest_value,
        }
      ).addTo(layers["water_temperaure"]);
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
      }
    );
    var { label, source: dataSource, url, icon } = station.properties;
    marker.bindPopup(
      `<div class=title>${label}</div><table><tr><td>${
        Translate.lastreading[language]
      }</td><td>${
        round(station.properties.last_value, 2) + options.unit
      }</td></tr><tr><td>Time</td><td>${formatDatetime(
        time
      )}</td></tr><tr><td>${Translate.type[language]}</td><td>${capitalize(
        icon
      )} station</td></tr><tr><td>${
        Translate.source[language]
      }</td><td>${dataSource}</td></tr></table><a class="external-link" href="${url}" target="_blank">${
        Translate.viewdataset[language]
      }</a>`
    );
  }
};

const addPlay = (options, addControls) => {
  addControls(options.period, options.datetime, options.timestep, options.data);
};

export const setPlayDatetime = (layers, datetime, period, data) => {
  for (let key in data) {
    const timestep = (period[1] - period[0]) / data[key].length;
    var i0 = Math.max(
      Math.min(
        Math.floor((datetime - period[0]) / timestep),
        data[key].length - 1
      ),
      0
    );
    if (key.includes("raster_")) {
      if (i0 === data[key].length - 1) {
        i0 = i0 - 1;
      }
      const i1 = i0 + 1;
      const beforeValue = period[0] + i0 * timestep;
      const afterValue = beforeValue + timestep;
      const interpolate = (datetime - beforeValue) / (afterValue - beforeValue);
      layers[key].update([data[key][i0], data[key][i1]], { interpolate });
    } else {
      layers[key].update(data[key][i0], {});
    }
  }
};
