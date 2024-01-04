import React, { Component } from "react";
import L, { point } from "leaflet";
import { dayName, dateName, formatDateYYYYMMDD } from "./functions";
import Translations from "../../translations.json";
import "./css/leaflet.css";

class HomeMap extends Component {
  state = {
    days: [],
    day: "",
    minZoom: 7,
    maxZoom: 13,
    darkMap: "clqz0bzlt017d01qw5xi9ex6x",
    lightMap: "clg4u62lq009a01oa5z336xn7",
  };
  setDay = (event) => {
    var day = event.target.id;
    this.plotPolygons(day, this.state.min, this.state.max);
    this.plotLabels(day);
    this.setState({ day });
  };
  getColor = (value) => {
    if (value === null || isNaN(value)) {
      return false;
    } else if (value < 5) {
      return "rgb(52,132,150)";
    } else if (value < 10) {
      return "rgb(128,194,208)";
    } else if (value < 15) {
      return "rgb(196,236,239)";
    } else if (value < 20) {
      return "rgb(239,163,127)";
    } else if (value < 25) {
      return "rgb(223,102,92)";
    } else {
      return "rgb(184,30,33)";
    }
  };
  plotPolygons = (day) => {
    var { list } = this.props;
    this.polygons.clearLayers();
    for (let lake of list) {
      if (lake.geometry !== false) {
        L.geoJSON(
          {
            type: "Polygon",
            coordinates: lake.geometry,
          },
          {
            style: {
              fillColor: this.getColor(lake.forecast.summary[day]),
              weight: 0.5,
              opacity: 1,
              color: "black",
              fillOpacity: lake.forecast.summary[day] === false ? 0 : 1,
            },
          }
        )
          .on("click", function () {
            window.location.href = "/" + lake.key;
          })
          .addTo(this.polygons);
      }
    }
  };
  plotLabels = (day) => {
    var { list, language } = this.props;
    var zoom = this.map.getZoom();
    Object.values(this.labels).map((m) => {
      if (m.marker) {
        m.marker.remove();
        m.marker = false;
      }
      return m;
    });
    for (let lake of list) {
      this.labels[lake.key].marker = L.marker([lake.latitude, lake.longitude], {
        icon: L.divIcon({
          className: "leaflet-mouse-marker",
          iconAnchor: [0, 0],
          iconSize: [0, 0],
        }),
      })
        .bindTooltip(
          `<div class="temperature-label" title='Click for more details'><div class="name">${
            lake.name[language]
          }</div>${
            lake.forecast.summary[day] === false
              ? `<div class="value">25.8°</div>`
              : `<div class="value">${lake.forecast.summary[day]}°</div>`
          }</div>`,
          {
            id: lake.key,
            permanent: true,
            direction: "top",
            offset: L.point(0, 0),
            opacity: 1,
          }
        )
        .on("click", function () {
          window.location.href = "/" + lake.key;
        });

      if (zoom >= this.labels[lake.key].zoom) {
        this.labels[lake.key].marker.addTo(this.map);
      }
    }
  };

  haversine = (pointA, pointB) => {
    const R = 6371; // Radius of the Earth in kilometers
    const toRadians = (angle) => (angle * Math.PI) / 180;
    const lat1 = toRadians(pointA.latitude);
    const lat2 = toRadians(pointB.latitude);
    const dLat = lat2 - lat1;
    const dLon = toRadians(pointB.longitude - pointA.longitude);
    const sin_dLat_2 = Math.sin(dLat / 2);
    const sin_dLon_2 = Math.sin(dLon / 2);
    const cos_lat1 = Math.cos(lat1);
    const cos_lat2 = Math.cos(lat2);
    const a =
      sin_dLat_2 * sin_dLat_2 + sin_dLon_2 * sin_dLon_2 * cos_lat1 * cos_lat2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 1000;
  };

  distance = (pointA, pointB) => {
    var height = this.haversine(
      {
        latitude: pointA.latitude,
        longitude: pointA.longitude,
      },
      {
        latitude: pointB.latitude,
        longitude: pointA.longitude,
      }
    );
    var width = this.haversine(
      {
        latitude: pointA.latitude,
        longitude: pointA.longitude,
      },
      {
        latitude: pointA.latitude,
        longitude: pointB.longitude,
      }
    );
    return { width, height, distance: this.haversine(pointA, pointB) };
  };

  zoomLevelCluster = (width, height, distance, characters) => {
    var maxWidth = 1200; // Max width at zoom level 13 in meters
    var maxHeight = 600; // Max height at zoom level 13 in meters
    var maxDistance = 800;
    return Math.min(
      Math.ceil(
        Math.log((maxWidth * Math.exp(13 * Math.log(2))) / width) / Math.log(2)
      ),
      Math.ceil(
        Math.log((maxHeight * Math.exp(13 * Math.log(2))) / height) /
          Math.log(2)
      )
    );
  };

  labelClustering = (list, language) => {
    var { minZoom, maxZoom } = this.state;
    var levels = {};
    var labels = {};
    for (let i = minZoom; i <= maxZoom; i++) {
      levels[i] = [];
    }
    for (let i = minZoom; i <= maxZoom; i++) {
      for (let lake of list) {
        if (!levels[i].includes(lake.key)) {
          if (!(lake.key in labels)) labels[lake.key] = { zoom: i };
          for (let innerLake of list) {
            if (
              lake.key !== innerLake.key &&
              !levels[i].includes(innerLake.key)
            ) {
              let { width, height, distance } = this.distance(innerLake, lake);
              let zoom = this.zoomLevelCluster(
                width,
                height,
                distance,
                lake.name[language].length
              );
              if (zoom > minZoom && zoom <= maxZoom) {
                for (let j = minZoom; j <= zoom; j++) {
                  if (!levels[j].includes(innerLake.key)) {
                    levels[j].push(innerLake.key);
                  }
                }
              }
            }
          }
        }
      }
    }
    for (let lake of list) {
      if (!(lake.key in labels)) labels[lake.key] = { zoom: 14 };
    }
    console.log(labels);
    return labels;
  };
  displayLabels = () => {
    var zoom = this.map.getZoom();
    Object.values(this.labels).map((m) => {
      if (m.marker) {
        if (zoom < m.zoom) {
          m.marker.remove();
        } else {
          m.marker.addTo(this.map);
        }
      }
      return m;
    });
  };
  componentDidUpdate(prevProps) {
    var { day } = this.state;
    var { list, language } = this.props;
    if (this.plot && this.props.list.length > 0) {
      const days = Object.keys(list[0].forecast.summary);
      day = days[0];
      this.plotPolygons(day);
      this.map.fitBounds(this.polygons.getBounds());
      this.setState({ day, days });
      this.labels = this.labelClustering(list, language);
      this.plotLabels(day);
      var map = this.map;
      map.on("zoomend", this.displayLabels);
      this.plot = false;
    } else if (prevProps.language !== this.props.language) {
      this.labels = this.labelClustering(list, language);
      this.plotLabels(day);
    } else if (prevProps.dark !== this.props.dark) {
      var { darkMap, lightMap } = this.state;
      var mapID = this.props.dark ? darkMap : lightMap;
      this.map.removeLayer(this.tiles);
      this.tiles = L.tileLayer(
        `https://api.mapbox.com/styles/v1/jamesrunnalls/${mapID}/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiamFtZXNydW5uYWxscyIsImEiOiJjazk0ZG9zd2kwM3M5M2hvYmk3YW0wdW9yIn0.uIJUZoDgaC2LfdGtgMz0cQ`,
        {
          maxZoom: 19,
          attribution: "&copy; <a href='https://www.mapbox.com/'>mapbox</a>",
        }
      ).addTo(this.map);
    }
  }
  async componentDidMount() {
    var { dark } = this.props;
    var { minZoom, maxZoom, darkMap, lightMap } = this.state;
    var center = [46.62855, 8.70415];
    var zoom = 8;
    var map = L.map("map", {
      preferCanvas: true,
      center: center,
      zoom: zoom,
      minZoom: minZoom,
      maxZoom: maxZoom,
      maxBoundsViscosity: 0.5,
      zoomControl: false,
    });
    this.map = map;

    var mapID = dark ? darkMap : lightMap;
    this.tiles = L.tileLayer(
      `https://api.mapbox.com/styles/v1/jamesrunnalls/${mapID}/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiamFtZXNydW5uYWxscyIsImEiOiJjazk0ZG9zd2kwM3M5M2hvYmk3YW0wdW9yIn0.uIJUZoDgaC2LfdGtgMz0cQ`,
      {
        maxZoom: 19,
        attribution: "&copy; <a href='https://www.mapbox.com/'>mapbox</a>",
      }
    ).addTo(this.map);
    L.control
      .zoom({
        position: "bottomright",
      })
      .addTo(this.map);
    this.polygons = L.featureGroup().addTo(this.map);
    this.labels = {};
    this.plot = true;
    if ("setBounds" in this.props) {
      var { setBounds } = this.props;
      this.map.on("zoomend", function (e) {
        setBounds(map.getBounds());
      });
      this.map.on("dragend", function (e) {
        setBounds(map.getBounds());
      });
    }
  }

  render() {
    var { days, day } = this.state;
    var { language } = this.props;
    if (day === "") {
      day = formatDateYYYYMMDD(new Date());
    }
    return (
      <React.Fragment>
        <div id="map">
          <div className="title">
            {Translations.forecast[language]} {Translations.for[language]}{" "}
            {dayName(day, language, Translations, true)},{" "}
            {dateName(day, language, Translations)}
          </div>
          <div className="day-selector">
            <div className="day-outer">
              {days.map((d) => (
                <div
                  id={d}
                  key={d}
                  onClick={this.setDay}
                  className={day === d ? "day-inner selected" : "day-inner"}
                >
                  {dayName(d, language, Translations)}
                </div>
              ))}
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default HomeMap;
