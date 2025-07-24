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

export const downloadPerformance = async (model, lake) => {
  var url;
  if (model === "simstrat") {
    url = `${
      CONFIG.alplakes_bucket
    }/simulations/${model}/cache/${lake}/performance.json${hour()}`;
  } else if (model === "delft3d-flow") {
    url = `${
      CONFIG.alplakes_bucket
    }/simulations/${model}/cache/${lake}/performance.json${hour()}`;
  } else {
    console.error("Model not recognised.");
    return false;
  }
  const response = await axios.get(url);
  if (response.status === 200) {
    const data = response.data;
    for (let l in data) {
      let valid = false;
      for (let d in data[l].depth) {
        try {
          data[l].depth[d].model.time = data[l].depth[d].model.time.map(
            (t) => new Date(t)
          );
          data[l].depth[d].insitu.time = data[l].depth[d].insitu.time.map(
            (t) => new Date(t)
          );
          valid = true;
        } catch (e) {
          delete data[l].depth[d];
        }
      }
      if (!valid) {
        delete data[l];
      }
    }
    if (Object.keys(data).length === 0) {
      return false;
    }
    return response.data;
  }
  return false;
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
    const depth = Object.keys(data[location].depth)[0];
    this.setState({ location, depth });
  };
  setDepth = (event) => {
    this.setState({ depth: event.target.value });
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
      simstrat: "#5594CC",
      "delft3d-flow": "#FFCF56",
      mitgcm: "#698F3F",
    };
    const plot = [];
    const table = [];
    let selected_location = data.find((l) => l.name === location);
    let selected_depth = selected_location.depth.find((l) => l.name === depth);
    plot.push({
      x: selected_depth.data.time.map((t) => new Date(t)),
      y: selected_depth.data.values,
      lineColor: "#f34b3e",
      name: false,
    });
    for (let i = 0; i < selected_location.models.length; i++) {
      if (
        "data" in selected_location.models[i] &&
        depth in selected_location.models[i].data
      ) {
        plot.push({
          x: selected_location.models[i].data[depth].data.time.map(
            (t) => new Date(t)
          ),
          y: selected_location.models[i].data[depth].data.values,
          name: false,
          lineColor: lineColor[selected_location.models[i].type],
        });
        table.push({
          type: selected_location.models[i].type,
          color: lineColor[selected_location.models[i].type],
          rmse: selected_location.models[i].data[depth].rmse,
        });
      }
    }
    this.setState({ location, depth, plot, table });
  };
  async componentDidMount() {
    const { lake } = this.props;
    try {
    } catch (e) {
      console.error(e);
      this.setState({ failed: true });
    }
    const url = `${CONFIG.alplakes_bucket}/performance/${lake}.json${hour()}`;
    const response = await axios.get(url);
    if (response.status === 200) {
      const data = response.data;
      var location = false;
      var depth = false;
      outer: for (let i = 0; i < data.length; i++) {
        for (let j = 0; j < data[i].depth.length; j++) {
          if ("data" in data[i].depth[j]) {
            location = data[i]["name"];
            depth = data[i].depth[j]["name"];
            break outer;
          }
        }
      }
      if (location) {
        this.setState({ data }, () => this.prepareData(location, depth));
      } else {
        this.setState({ failed: true });
      }
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
                <div className="location-title">{location}</div>
                <div className="location-coords">
                  {location_metadata.lat}, {location_metadata.lng}
                </div>
                <div className="location-source">
                  {location_metadata.source}
                </div>
                <table>
                  <tbody>
                    {table.map((t) => (
                      <tr>
                        <td>{t.type}</td>
                        <td>± {t.rmse}°</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default ModelPerformance;
