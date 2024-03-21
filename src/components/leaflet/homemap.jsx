import React, { Component } from "react";
import L from "leaflet";
import { dayName, formatDateYYYYMMDD } from "./functions";
import Translations from "../../translations.json";
import "./css/leaflet.css";

class HomeMap extends Component {
  state = {
    days: [],
    day: "",
    minZoom: 6,
    maxZoom: 13,
    darkMap: "clqz0bzlt017d01qw5xi9ex6x",
    lightMap: "clg4u62lq009a01oa5z336xn7",
    parameter: "temperature",
  };
  setParameter = (parameter) => {
    this.setState({ parameter });
  };
  setDay = (event) => {
    var day = event.target.id;
    this.removeLabels();
    this.plotPolygons(day, this.state.min, this.state.max);
    this.plotLabels(day);
    this.setState({ day });
  };
  getColor = (value, parameter) => {
    if (parameter === "temperature") {
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
    } else if (parameter === "ice") {
      if (value === null || isNaN(value)) {
        return false;
      } else if (value <= 0) {
        return "rgb(196,236,239)";
      } else if (value > 0) {
        return "rgb(223,102,92)";
      }
    } else if (parameter === "oxygen") {
      if (value === null || isNaN(value)) {
        return false;
      } else if (value < 20) {
        return "rgb(184,30,33)";
      } else if (value < 40) {
        return "rrgb(223,102,92)";
      } else if (value < 60) {
        return "rgb(239,163,127)";
      } else if (value < 80) {
        return "rgb(128,194,208)";
      } else {
        return "rgb(52,132,150)";
      }
    }
  };
  plotPolygons = (day) => {
    var { list, parameter } = this.props;
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
                lake.forecast.summary[day][parameter],
                parameter
              ),
              weight: 0.5,
              opacity: 1,
              color: "black",
              fillOpacity:
                lake.forecast.summary[day][parameter] === false ? 0 : 1,
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
    var { list, language, parameter, parameters } = this.props;
    var zoom = this.map.getZoom();
    for (let lake of list) {
      this.labels[lake.key].marker = L.marker([lake.latitude, lake.longitude], {
        icon: L.divIcon({
          className: "leaflet-mouse-marker",
          iconAnchor: [0, 0],
          iconSize: [0, 0],
        }),
      })
        .bindTooltip(
          `<a class="temperature-label" href="/${lake.key}" title='${
            Translations.click[language]
          }'><div class="name">${lake.name[language]}</div>${
            lake.forecast.summary[day][parameter] === false
              ? ""
              : `<div class="value">${lake.forecast.summary[day][parameter]}${parameters[parameter].unit}</div>`
          }</a>`,
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

  boxCoords = (latitude, longitude, width, height, zoom) => {
    var point = this.map.project([latitude, longitude], zoom);
    var box = {
      top: point.y + height,
      bottom: point.y,
      left: point.x - width / 2,
      right: point.x + width / 2,
    };
    return box;
  };

  boxConflictZoomLevel = (pointA, pointB, minZoom, maxZoom) => {
    for (var i = minZoom; i <= maxZoom; i++) {
      let boxA = this.boxCoords(pointA.latitude, pointA.longitude, 200, 50, i);
      let boxB = this.boxCoords(pointB.latitude, pointB.longitude, 200, 50, i);
      if (
        !(
          boxB.left < boxA.right &&
          boxB.right > boxA.left &&
          boxB.bottom < boxA.top &&
          boxB.top > boxA.bottom
        )
      ) {
        break;
      }
    }
    return i - 1;
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
              let zoom = this.boxConflictZoomLevel(
                innerLake,
                lake,
                minZoom,
                maxZoom
              );
              if (zoom >= minZoom && zoom <= maxZoom) {
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
      return m;
    });
  };
  removeLabels = () => {
    Object.values(this.labels).map((m) => {
      if (m.marker) {
        m.marker.remove();
        m.marker = false;
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
    } else if (prevProps.parameter !== this.props.parameter) {
      this.removeLabels();
      this.plotPolygons(day);
      this.plotLabels(day);
    } else if (prevProps.language !== this.props.language) {
      this.removeLabels();
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
        position: "topright",
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
    var { parameter, parameters, setParameter, language } = this.props;
    if (day === "") {
      day = formatDateYYYYMMDD(new Date());
    }
    var label = Translations[parameters[parameter].label][language];
    return (
      <React.Fragment>
        <div className="parameter-selector">
          {Object.keys(parameters).map((p) => (
            <div
              className={parameter === p ? "parameter selected" : "parameter"}
              key={p}
              title={Translations[parameters[p].label][language]}
              onClick={() => setParameter(p)}
            >
              <img
                src={parameters[p].img}
                alt={Translations[parameters[p].label][language]}
              />
            </div>
          ))}
          <div className="label">{label}</div>
        </div>
        <div id="map">
          <div className="day-selector">
            <div className="day-outer">
              {days.map((d) => (
                <div
                  id={d}
                  key={d}
                  onClick={this.setDay}
                  className={day === d ? "day-inner selected" : "day-inner"}
                  title={dayName(d, language, Translations, true)}
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
