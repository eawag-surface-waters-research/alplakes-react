import React, { Component } from "react";
import L from "leaflet";
import { dayName, formatDateYYYYMMDD } from "./general";
import Translations from "../../translations.json";
import alpinespace from "./alpinespace.json";
import CONFIG from "../../config.json";
import "./leaflet_tileclass";
import "./css/leaflet.css";

class MapLegend extends Component {
  render() {
    return (
      <table>
        <tbody>
          <tr>
            <td>
              <div
                className="legendIcon"
                style={{ backgroundColor: "rgb(184,30,33)" }}
              />
              {"> 25 °C"}
            </td>
            <td>
              <div
                className="legendIcon"
                style={{ backgroundColor: "rgb(196,236,239)" }}
              />
              {"10-15 °C"}
            </td>
          </tr>
          <tr>
            <td>
              <div
                className="legendIcon"
                style={{ backgroundColor: "rgb(223,102,92)" }}
              />
              {"20-25 °C"}
            </td>
            <td>
              <div
                className="legendIcon"
                style={{ backgroundColor: "rgb(128,194,208)" }}
              />
              {"5-10 °C"}
            </td>
          </tr>
          <tr>
            <td>
              <div
                className="legendIcon"
                style={{ backgroundColor: "rgb(239,163,127)" }}
              />
              {"15-20 °C"}
            </td>
            <td>
              <div
                className="legendIcon"
                style={{ backgroundColor: "rgb(52,132,150)" }}
              />
              {"< 5 °C"}
            </td>
          </tr>
        </tbody>
      </table>
    );
  }
}

class HomeMap extends Component {
  state = {
    days: [],
    day: "",
    minZoom: 6,
    maxZoom: 13,
  };
  setDay = (event) => {
    var day = event.target.id;
    this.removeLabels();
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
              fillColor: this.getColor(lake.summary[day]),
              weight: 0.5,
              opacity: 1,
              color: "grey",
              fillOpacity: lake.summary[day] === false ? 0 : 1,
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
    for (let lake of list) {
      let value =
        lake.summary &&
        typeof lake.summary[day] === "number" &&
        !isNaN(lake.summary[day]);
      this.labels[lake.key].marker = L.marker([lake.latitude, lake.longitude], {
        icon: L.divIcon({
          className: "leaflet-mouse-marker",
          iconAnchor: [0, 0],
          iconSize: [0, 0],
        }),
      })
        .bindTooltip(
          `<a class="temperature-label${value ? "" : " empty"}" href="/${
            lake.key
          }" title='${Translations.click[language]}'><div class="name">${
            lake.name[language]
          }</div>${
            value ? `<div class="value">${lake.summary[day]}°</div>` : ""
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
  labelClustering = (list) => {
    const { minZoom, maxZoom } = this.state;
    const levels = {};
    const labels = {};
    for (let z = minZoom; z <= maxZoom; z++) {
      levels[z] = new Set();
    }
    const boxes = {};
    for (let lake of list) {
      boxes[lake.key] = {};
      for (let z = minZoom; z <= maxZoom; z++) {
        boxes[lake.key][z] = this.boxCoords(
          lake.latitude,
          lake.longitude,
          200,
          50,
          z
        );
      }
    }
    for (let z = minZoom; z <= maxZoom; z++) {
      for (let lake of list) {
        if (levels[z].has(lake.key)) continue;
        if (!(lake.key in labels)) {
          labels[lake.key] = { zoom: z };
        }
        for (let other of list) {
          if (lake.key === other.key || levels[z].has(other.key)) continue;
          let lastConflictZoom = null;
          for (let zi = z; zi <= maxZoom; zi++) {
            const boxA = boxes[lake.key][zi];
            const boxB = boxes[other.key][zi];
            const intersects =
              boxB.left < boxA.right &&
              boxB.right > boxA.left &&
              boxB.bottom < boxA.top &&
              boxB.top > boxA.bottom;
            if (intersects) {
              lastConflictZoom = zi;
            } else {
              break;
            }
          }
          if (lastConflictZoom !== null) {
            for (let j = z; j <= lastConflictZoom; j++) {
              levels[j].add(other.key);
            }
          }
        }
      }
    }
    for (let lake of list) {
      if (!(lake.key in labels)) {
        labels[lake.key] = { zoom: 14 };
      }
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
    var { list, days } = this.props;
    if (this.plot && list.length > 0) {
      day = days[0];
      this.plotPolygons(day);
      this.map.fitBounds(this.polygons.getBounds());
      this.setState({ day, days });
      this.labels = this.labelClustering(list);
      this.plotLabels(day);
      var map = this.map;
      map.on("zoomend", this.displayLabels);
      this.plot = false;
    } else if (prevProps.language !== this.props.language) {
      this.removeLabels();
      this.plotLabels(day);
    } else if (prevProps.dark !== this.props.dark) {
      this.map.removeLayer(this.tiles);
      var { url, attribution, lightMap, darkMap, tileClass } =
        CONFIG.basemaps["default"];
      if (url.includes("_bright_"))
        url = url.replace("_bright_", this.props.dark ? darkMap : lightMap);
      this.tiles = L.tileLayer
        .default(url, {
          maxZoom: 19,
          attribution: attribution,
          tileClass: tileClass,
        })
        .addTo(this.map);
    }
  }
  async componentDidMount() {
    var { dark } = this.props;
    var { minZoom, maxZoom } = this.state;
    var center = [46.77, 9.962];
    var zoom = 7;
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

    var { url, attribution, lightMap, darkMap, tileClass } =
      CONFIG.basemaps["default"];
    if (url.includes("_bright_"))
      url = url.replace("_bright_", dark ? darkMap : lightMap);
    this.tiles = L.tileLayer
      .default(url, {
        maxZoom: 19,
        attribution: attribution,
        tileClass: tileClass,
      })
      .addTo(this.map);
    L.control
      .zoom({
        position: "topright",
      })
      .addTo(this.map);
    L.geoJSON(alpinespace, {
      style: function (feature) {
        return {
          color: "#44bca82c",
          weight: 2,
          fillColor: "#44bca7",
          fillOpacity: 0,
        };
      },
    }).addTo(this.map);
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

  componentWillUnmount() {
    this.map.off();
    this.map.remove();
  }

  render() {
    var { days, day } = this.state;
    var { language } = this.props;
    if (day === "") {
      day = formatDateYYYYMMDD(new Date());
    }
    return (
      <React.Fragment>
        <div className="legend">
          <div className="label">
            {Translations["temperature"][language]}
            <MapLegend />
          </div>
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
