import React, { Component } from "react";
import L from "leaflet";
import COLORS from "../colors/colors.json";
import { dayName } from "./functions";
import Translations from "../../translations.json";
import "./css/leaflet.css";

class HomeMap extends Component {
  state = {
    days: [],
    day: "",
    min: 0,
    max: 30,
  };
  setDay = (event) => {
    var day = event.target.id;
    this.updatePlot(day, this.state.min, this.state.max);
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
  updatePlot = (day, min, max) => {
    var { list, language } = this.props;
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
      L.marker([lake.latitude, lake.longitude], {
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
            opacity: 1
          }
        )
        .on("click", function () {
          window.location.href = "/" + lake.key;
        })
        .addTo(this.polygons);
    }
    this.map.fitBounds(this.polygons.getBounds());
  };
  componentDidUpdate(prevProps) {
    if (this.plot && this.props.list.length > 0) {
      var { list } = this.props;
      const days = Object.keys(list[0].forecast.summary);
      const day = days[0];
      const { min, max } = this.getBounds(list);
      this.updatePlot(day, min, max);
      this.setState({ day, days, min, max });
      this.plot = false;
    } else if (prevProps.language !== this.props.language) {
      this.updatePlot(this.state.day, this.state.min, this.state.max);
    }
  }
  async componentDidMount() {
    var center = [46.9, 8.2];
    var zoom = 8;
    this.map = L.map("map", {
      preferCanvas: true,
      center: center,
      zoom: zoom,
      minZoom: 7,
      maxZoom: 13,
      maxBoundsViscosity: 0.5,
    });
    L.tileLayer(
      "https://api.mapbox.com/styles/v1/jamesrunnalls/clg4u62lq009a01oa5z336xn7/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiamFtZXNydW5uYWxscyIsImEiOiJjazk0ZG9zd2kwM3M5M2hvYmk3YW0wdW9yIn0.uIJUZoDgaC2LfdGtgMz0cQ",
      {
        maxZoom: 19,
        attribution: "&copy; <a href='https://www.mapbox.com/'>mapbox</a>",
      }
    ).addTo(this.map);
    this.polygons = L.featureGroup().addTo(this.map);
    this.plot = true;
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
