import React, { Component } from "react";
import axios from "axios";
import DatasetLinegraph from "../d3/dataset/datasetlinegraph";
import CONFIG from "../../config.json";
import Translations from "../../translations.json";
import "./modelperformance.css";
import Loading from "../loading/loading";

export const hour = () => {
  return `?timestamp=${
    Math.round((new Date().getTime() + 1800000) / 3600000) * 3600 - 3600
  }`;
};

class ModelPerformance extends Component {
  state = {
    data: [],
    plot: false,
    table: false,
    location: false,
    depth: false,
    failed: false,
    fontSize: 12,
  };
  setFontSize = (fontSize) => {
    this.setState({ fontSize });
  };
  setLocation = (event) => {
    var { data } = this.state;
    const location = event.target.value;
    let selected_location = data.find((l) => l.name === location);
    const depth = selected_location.depth[0].name;
    this.prepareData(location, depth);
  };
  setDepth = (event) => {
    const { location } = this.state;
    const depth = event.target.value;
    this.prepareData(location, depth);
  };
  closeModal = (event) => {
    const inner = document.getElementById("model-performance-inner");
    if (!inner.contains(event.target)) {
      this.props.togglePerformance();
    }
  };
  prepareData = (location, depth) => {
    const { data } = this.state;
    const lineColor = {
      simstrat: "	#F2C14E",
      "delft3d-flow": "#00AFD6",
      mitgcm: "	#47D6AC",
    };
    const plot = [];
    const table = [];
    let selected_location = data.find((l) => l.name === location);
    let selected_depth = selected_location.depth.find((l) => l.name === depth);
    for (let i = 0; i < selected_location.models.length; i++) {
      if (
        "data" in selected_location.models[i] &&
        depth in selected_location.models[i].data &&
        "data" in selected_location.models[i].data[depth]
      ) {
        plot.push({
          x: selected_location.models[i].data[depth].data.time.map(
            (t) => new Date(t)
          ),
          y: selected_location.models[i].data[depth].data.values,
          name: false,
          curve: true,
          lineColor: lineColor[selected_location.models[i].type],
        });
        let rmse = selected_location.models[i].data[depth].rmse;
        let rmse_color = "#76b64b";
        if (rmse >= 2) {
          rmse_color = "#f34b3e";
        } else if (rmse >= 1) {
          rmse_color = "#fbd247";
        }
        table.push({
          type: selected_location.models[i].type,
          color: lineColor[selected_location.models[i].type],
          rmse: rmse,
          rmse_color,
        });
      } else {
        window.alert(
          `Failed to collect model data for ${selected_location.models[i].type}`
        );
      }
    }
    plot.push({
      x: selected_depth.data.time.map((t) => new Date(t)),
      y: selected_depth.data.values,
      lineColor: "#FF4F42",
      name: false,
    });
    this.setState({ location, depth, plot, table });
  };
  async componentDidMount() {
    const { lake, togglePerformance } = this.props;
    try {
      const url = `${CONFIG.alplakes_bucket}/performance/${lake}.json${hour()}`;
      const response = await axios.get(url);
      if (response.status === 200) {
        const rd = response.data;
        const data = [];
        for (let i = 0; i < rd.length; i++) {
          rd[i].depth = rd[i].depth.filter((d) => "data" in d);
          if (rd[i].depth.length > 0) {
            data.push(rd[i]);
          }
        }
        if (data.length > 0) {
          var location = data[0].name;
          var depth = data[0].depth[0].name;
          this.setState({ data }, () => this.prepareData(location, depth));
        } else {
          togglePerformance();
        }
      }
    } catch (e) {
      console.error(e);
      togglePerformance();
    }
  }
  render() {
    var { language, dark, togglePerformance } = this.props;
    var { location, depth, fontSize, plot, table, data } = this.state;
    const location_metadata = data.find((d) => d.name === location);
    return (
      <div className="model-performance" onClick={this.closeModal}>
        <div className="model-performance-inner" id="model-performance-inner">
          <div className="close" onClick={togglePerformance}>
            &#10005;
          </div>
          <div className="model-performance-title">
            {Translations.modelPerformance[language]}
          </div>
          <div className="model-performance-left">
            {plot ? (
              <div className="model-performance-left-inner">
                <DatasetLinegraph
                  xlabel="time"
                  xunits=""
                  ylabel={Translations.watertemperature[language]}
                  yunits="°C"
                  data={plot}
                  dark={dark}
                  language={language}
                  noYear={true}
                  fontSize={fontSize}
                  setFontSize={this.setFontSize}
                />
                <div
                  className="model-performance-legend"
                  style={{ fontSize: `${fontSize}px` }}
                >
                  <div className="item">
                    <div
                      className="line"
                      style={{ borderColor: "#f34b3e" }}
                    ></div>
                    <div className="text">
                      {Translations.measurements[language]}
                    </div>
                  </div>
                  {table.map((t) => (
                    <div className="item" key={"legend_" + t.type}>
                      <div
                        className="line"
                        style={{ borderColor: t.color }}
                      ></div>
                      <div className="text">{t.type}</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <Loading />
            )}
          </div>
          <div className="model-performance-right">
            {location && (
              <div>
                <div className="section-title">
                  {Translations.performance[language]}
                </div>
                <div className="settings-inner">
                  <table>
                    <tbody>
                      {table.map((t) => (
                        <tr key={t.type}>
                          <td>
                            <div
                              className="line"
                              style={{ borderColor: t.color }}
                            ></div>
                          </td>
                          <td style={{ paddingRight: "20px" }}>{t.type}</td>
                          <td>
                            <div
                              className="circle"
                              style={{ backgroundColor: t.rmse_color }}
                            />
                          </td>
                          <td>± {t.rmse} °C</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="section-title">
                  {Translations.settings[language]}
                </div>
                <div className="settings-inner">
                  <div className="setting">
                    <div className="label">
                      {Translations.location[language]}
                    </div>
                    <select value={location} onChange={this.setLocation}>
                      {data.map((d) => (
                        <option key={d.name} value={d.name}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="setting">
                    <div className="label">{Translations.depth[language]}</div>
                    <select value={depth} onChange={this.setDepth}>
                      {location_metadata.depth.map((d) => (
                        <option key={d.name} value={d.name}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="setting">
                    <div className="label">{Translations.source[language]}</div>
                    {"url" in location_metadata ? (
                      <a
                        href={location_metadata.url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <div>{location_metadata.source}</div>
                      </a>
                    ) : (
                      <div>{location_metadata.source}</div>
                    )}
                  </div>
                  <div className="setting">
                    <div className="label">
                      {Translations.coordinates[language]}
                    </div>
                    <a
                      href={`https://www.google.com/maps?q=${location_metadata.lat},${location_metadata.lng}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <div>
                        {location_metadata.lat}, {location_metadata.lng}
                      </div>
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default ModelPerformance;
