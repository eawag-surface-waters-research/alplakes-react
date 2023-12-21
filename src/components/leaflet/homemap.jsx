import React, { Component } from "react";
import L from "leaflet";
import COLORS from "../colors/colors.json";
import { dayName, toRadians } from "./functions";
import Translations from "../../translations.json";
import "./css/leaflet.css";

class HomeMap extends Component {
  state = {
    days: [],
    day: "",
    min: 0,
    max: 30,
    minZoom: 7,
    maxZoom: 13,
  };
  setDay = (event) => {
    var day = event.target.id;
    this.plotPolygons(day, this.state.min, this.state.max);
    this.plotLabels(day);
    this.setState({ day });
  };
  getColor = (value, min, max, palette) => {
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

    return `rgb(${color1[0] + (color2[0] - color1[0]) * f},${
      color1[1] + (color2[1] - color1[1]) * f
    },${color1[2] + (color2[2] - color1[2]) * f})`;
  };
  getBounds = (list) => {
    var values = [];
    for (let lake of list) {
      values = values.concat(Object.values(lake.forecast.summary));
    }
    return { min: Math.min(...values), max: Math.max(...values) };
  };
  plotPolygons = (day, min, max) => {
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
              fillColor: this.getColor(
                lake.forecast.summary[day],
                min,
                max,
                COLORS["Blue Red"]
              ),
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
    });
    for (let lake of list) {
      this.labels[lake.key].marker = L.marker([lake.latitude, lake.longitude], {
        icon: L.divIcon({
          className: "leaflet-mouse-marker",
          iconAnchor: [20, 20],
          iconSize: [40, 40],
        }),
      })
        .bindTooltip(
          `${lake.name[language]}${
            lake.forecast.summary[day] === false
              ? ""
              : `<br>${lake.forecast.summary[day]}°`
          }${lake.frozen ? " (Frozen)" : ""}`,
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

  distance = (pointA, pointB) => {
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
  radius = (zoom) => {
    return 800 * 2 ** (13 - zoom);
  };

  zoomLevelCluster = (distance) => {
    var radius = 800; // Haversine radius at zoom level 13
    return Math.ceil(
      Math.log((radius * Math.exp(13 * Math.log(2))) / distance) / Math.log(2)
    );
  };

  labelClustering = (list) => {
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
              let distance = this.distance(innerLake, lake);
              let zoom = this.zoomLevelCluster(distance);
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
    });
  };
  componentDidUpdate(prevProps) {
    var { day } = this.state;
    if (this.plot && this.props.list.length > 0) {
      var { list } = this.props;
      const { min, max } = this.getBounds(list);
      const days = Object.keys(list[0].forecast.summary);
      day = days[0];
      this.plotPolygons(day, min, max);
      this.map.fitBounds(this.polygons.getBounds());
      this.setState({ day, days, min, max });
      this.labels = this.labelClustering(list);
      this.plotLabels(day);
      var map = this.map;
      map.on("zoomend", this.displayLabels);
      this.plot = false;
    } else if (prevProps.language !== this.props.language) {
      this.plotLabels(day);
    }
  }
  async componentDidMount() {
    var { minZoom, maxZoom } = this.state;
    var center = [46.62855, 8.70415];
    var zoom = 8;
    var map = L.map("map", {
      preferCanvas: true,
      center: center,
      zoom: zoom,
      minZoom: minZoom,
      maxZoom: maxZoom,
      maxBoundsViscosity: 0.5,
    });
    this.map = map;
    L.tileLayer(
      "https://api.mapbox.com/styles/v1/jamesrunnalls/clg4u62lq009a01oa5z336xn7/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiamFtZXNydW5uYWxscyIsImEiOiJjazk0ZG9zd2kwM3M5M2hvYmk3YW0wdW9yIn0.uIJUZoDgaC2LfdGtgMz0cQ",
      {
        maxZoom: 19,
        attribution: "&copy; <a href='https://www.mapbox.com/'>mapbox</a>",
      }
    ).addTo(this.map);
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
    return (
      <React.Fragment>
        <div id="map">
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
