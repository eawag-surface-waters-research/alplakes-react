import React, { Component } from "react";
import axios from "axios";
import L from "leaflet";
import "./leaflet_geotiff";
import "./leaflet_floatgeotiff";
import "./leaflet_colorpicker";
import "./leaflet_streamlines";
import "./leaflet_vectorfield";
import "./css/leaflet.css";

class Basemap extends Component {
  addGeotiff = async (url) => {
    var { data } = await axios.get(url, {
      responseType: "arraybuffer",
    });
    return L.geotiff(data, {});
  };

  addFloatGeotiff = async (url, options) => {
    var { data } = await axios.get(url, {
      responseType: "arraybuffer",
    });
    var map = this.map;
    var floatgeotiff = L.floatgeotiff(data, options);
    var floatgeotifftooltip = floatgeotiff.bindTooltip("my tooltip text", {
      permanent: false,
      direction: "top",
      className: "basic-tooltip",
      opacity: 1,
    });
    floatgeotiff.on("mousemove", function (e) {
      let value = e.value;
      if (value) {
        value = Math.round(value * 1000) / 1000;
        let html = `${value}${options.unit}`;
        floatgeotifftooltip._tooltip._content = html;
        floatgeotifftooltip.openTooltip(e.latlng);
      } else {
        floatgeotifftooltip.closeTooltip();
      }
    });
    floatgeotiff.on("click", function (e) {
      floatgeotifftooltip.closeTooltip();
      let value = e.value;
      if (value) {
        value = Math.round(value * 1000) / 1000;
        let inner = `${value}${options.unit}`;
        let html = `<div>${String(inner)}</div>`;
        L.popup({ className: "leaflet-popup" })
          .setLatLng(e.latlng)
          .setContent(html)
          .openOn(map);
      }
    });
    return floatgeotiff;
  };

  addStreamlines = async (url) => {
    var { data } = await axios.get(url);
    var map = this.map;
    var streamlines = L.streamlines(data, {
      xMin: 6.153,
      xMax: 6.93,
      yMin: 46.206,
      yMax: 46.519,
      paths: 5000,
    });
    var streamlinestooltip = streamlines.bindTooltip("", {
      permanent: false,
      direction: "top",
      className: "basic-tooltip",
      opacity: 1,
    });
    streamlines.on("mousemove", function (e) {
      let { u, v } = e.value;
      if (u && v) {
        let mag = Math.round(Math.sqrt(u ** 2 + v ** 2) * 1000) / 1000;
        let deg = Math.round((Math.atan2(u / mag, v / mag) * 180) / Math.PI);
        if (deg < 0) deg = 360 + deg;
        let html = `${mag}m/s ${deg}°`;
        streamlinestooltip._tooltip._content = html;
        streamlinestooltip.openTooltip(e.latlng);
      } else {
        streamlinestooltip.closeTooltip();
      }
    });
    streamlines.on("click", function (e) {
      streamlinestooltip.closeTooltip();
      if (e.value !== null && e.value.u !== null) {
        let { u, v } = e.value;
        let { lat, lng } = e.latlng;
        lat = Math.round(lat * 1000) / 1000;
        lng = Math.round(lng * 1000) / 1000;
        console.log(lat, lng);
        let mag = Math.round(Math.sqrt(u ** 2 + v ** 2) * 1000) / 1000;
        let deg = Math.round((Math.atan2(u / mag, v / mag) * 180) / Math.PI);
        if (deg < 0) deg = 360 + deg;
        let value = Math.round(mag * 1000) / 1000;
        let inner = `${value}m/s ${deg}°`;
        let html = `<div>${String(inner)} </div>`;
        L.popup({ className: "leaflet-popup" })
          .setLatLng(e.latlng)
          .setContent(html)
          .openOn(map);
      }
    });
    return streamlines;
  };

  addVectorfield = async (url) => {
    var { data } = await axios.get(url);
    var map = this.map;
    var vectorfield = L.vectorfield(data, { vectorArrowColor: true });
    var vectorfieldtooltip = vectorfield.bindTooltip("my tooltip text", {
      permanent: false,
      direction: "top",
      className: "basic-tooltip",
      opacity: 1,
    });
    vectorfield.on("mousemove", function (e) {
      let { u, v } = e.value;
      if (u && v) {
        let mag = Math.round(Math.sqrt(u ** 2 + v ** 2) * 1000) / 1000;
        let deg = Math.round((Math.atan2(u / mag, v / mag) * 180) / Math.PI);
        if (deg < 0) deg = 360 + deg;
        let html = `${mag}m/s ${deg}°`;
        vectorfieldtooltip._tooltip._content = html;
        vectorfieldtooltip.openTooltip(e.latlng);
      } else {
        vectorfieldtooltip.closeTooltip();
      }
    });
    vectorfield.on("click", function (e) {
      vectorfieldtooltip.closeTooltip();
      if (e.value !== null && e.value.u !== null) {
        let { u, v } = e.value;
        let { lat, lng } = e.latlng;
        lat = Math.round(lat * 1000) / 1000;
        lng = Math.round(lng * 1000) / 1000;
        console.log(lat, lng);
        let mag = Math.round(Math.sqrt(u ** 2 + v ** 2) * 1000) / 1000;
        let deg = Math.round((Math.atan2(u / mag, v / mag) * 180) / Math.PI);
        if (deg < 0) deg = 360 + deg;
        let value = Math.round(mag * 1000) / 1000;
        let inner = `${value}m/s ${deg}°`;
        let html = `<div>${String(inner)}</div>`;
        L.popup({ className: "leaflet-popup" })
          .setLatLng(e.latlng)
          .setContent(html)
          .openOn(map);
      }
    });
    return vectorfield;
  };

  addSentinel = (url) => {
    return L.tileLayer.wms(url, {
      tileSize: 512,
      attribution:
        '&copy; <a href="http://www.sentinel-hub.com/" target="_blank">Sentinel Hub</a>',
      urlProcessingApi:
        "https://services.sentinel-hub.com/ogc/wms/1d4de4a3-2f50-493c-abd8-861dec3ae6b2",
      maxcc: 20,
      minZoom: 6,
      maxZoom: 16,
      preset: "TRUE-COLOR",
      layers: "TRUE-COLOR",
      time: "2021-09-06/2021-09-06",
      gain: 3,
    });
  };

  async componentDidMount() {
    this.store = {};
    var center = [46.46, 6.57];
    var zoom = 11;
    this.map = L.map("map", {
      preferCanvas: true,
      center: center,
      zoom: zoom,
      minZoom: 5,
      maxZoom: 15,
      maxBoundsViscosity: 0.5,
    });

    var mapbox = L.tileLayer(
      "https://api.mapbox.com/styles/v1/jamesrunnalls/cleqzfoy7003g01s5napxn7ab/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiamFtZXNydW5uYWxscyIsImEiOiJjazk0ZG9zd2kwM3M5M2hvYmk3YW0wdW9yIn0.uIJUZoDgaC2LfdGtgMz0cQ",
      {
        maxZoom: 19,
        attribution: "&copy; <a href='https://www.mapbox.com/'>mapbox</a>",
      }
    ).addTo(this.map);

    var sentinel2_wms = this.addSentinel(
      "https://services.sentinel-hub.com/ogc/wms/b8bf8b31-9b54-42b5-aad1-ab85ae32020e"
    );

    var sentinel3_geotiff = await this.addGeotiff(
      "https://datalakes-eawag.s3.eu-central-1.amazonaws.com/leaflet-sandbox/sentinel3.tif"
    );

    var tsm_geotiff = await this.addFloatGeotiff(
      "https://datalakes-eawag.s3.eu-central-1.amazonaws.com/leaflet-sandbox/s2_tsm_singleband_float.tiff",
      {
        unit: "g m-3",
        min: 0,
        max: 8,
        palette: [
          { color: [68, 1, 84], point: 0 },
          { color: [59, 82, 139], point: 0.25 },
          { color: [33, 145, 140], point: 0.5 },
          { color: [94, 201, 98], point: 0.75 },
          { color: [253, 231, 37], point: 1 },
        ],
      }
    );

    var secchi_geotiff = await this.addFloatGeotiff(
      "https://datalakes-eawag.s3.eu-central-1.amazonaws.com/leaflet-sandbox/s2_secchi_singleband_float.tiff",
      {
        unit: "m",
        min: 0,
        max: 5,
        palette: [
          { color: [253, 231, 37], point: 0 },
          { color: [94, 201, 98], point: 0.25 },
          { color: [33, 145, 140], point: 0.5 },
          { color: [59, 82, 139], point: 0.75 },
          { color: [68, 1, 84], point: 1 },
        ],
      }
    );

    var s3_secchi_geotiff = await this.addFloatGeotiff(
      "https://datalakes-eawag.s3.eu-central-1.amazonaws.com/leaflet-sandbox/s3_secchi_singleband_float.tiff",
      {
        unit: "m",
        min: 0,
        max: 5,
        palette: [
          { color: [253, 231, 37], point: 0 },
          { color: [94, 201, 98], point: 0.25 },
          { color: [33, 145, 140], point: 0.5 },
          { color: [59, 82, 139], point: 0.75 },
          { color: [68, 1, 84], point: 1 },
        ],
      }
    );

    var streamlines = await this.addStreamlines(
      "https://datalakes-eawag.s3.eu-central-1.amazonaws.com/leaflet-sandbox/streamlines.json"
    );

    var vectorfield = await this.addVectorfield(
      "https://datalakes-eawag.s3.eu-central-1.amazonaws.com/leaflet-sandbox/vectorfield.json"
    );

    var baseMaps = {
      mapbox: mapbox,
    };

    vectorfield.addTo(this.map);

    var overlayMaps = {
      "Sentinel 2 (WMS)": sentinel2_wms,
      "Sentinel 3 (GeoTiff)": sentinel3_geotiff,
      "TSM (S2)": tsm_geotiff,
      "Secchi (S2)": secchi_geotiff,
      "Secchi (S3)": s3_secchi_geotiff,
      "Streamlines (Delft3D)": streamlines,
      "Flow Field (Delft3D)": vectorfield,
    };

    L.control
      .layers(baseMaps, overlayMaps, { collapsed: false })
      .addTo(this.map);
  }

  render() {
    return (
      <React.Fragment>
        <div id="map"></div>
      </React.Fragment>
    );
  }
}

export default Basemap;
