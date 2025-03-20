import React, { Component } from "react";
import axios from "axios";
import DatasetLinegraph from "../d3/dataset/datasetlinegraph";
import CONFIG from "../../config.json";
import Translations from "../../translations.json";
import "./modelperformance.css";

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
    return response.data;
  }
  return false;
};

class ModelPerformance extends Component {
  state = {
    open: false,
    data: false,
    location: false,
    depth: false,
    fontSize: 12,
  };
  open = async () => {
    var { model, lake } = this.props;
    var { data, location, depth } = this.state;
    if (data === false) {
      data = await downloadPerformance(model.toLowerCase(), lake);
      if (data) {
        for (let l in data) {
          for (let d in data[l].depth) {
            data[l].depth[d].model.time = data[l].depth[d].model.time.map(
              (t) => new Date(t)
            );
            data[l].depth[d].insitu.time = data[l].depth[d].insitu.time.map(
              (t) => new Date(t)
            );
          }
        }
        location = Object.keys(data)[0];
        depth = Object.keys(data[location].depth)[0];
        this.setState({ open: true, data, location, depth });
      }
    } else {
      this.setState({ open: true });
    }
  };
  close = () => {
    this.setState({ open: false });
  };
  setFontSize = (fontSize) => {
    this.setState({ fontSize });
  };
  setLocation = (event) => {
    this.setState({ location: event.target.value });
  };
  setDepth = (event) => {
    this.setState({ depth: event.target.value });
  };
  render() {
    var { rmse, language, dark, model } = this.props;
    var { open, data, location, depth, fontSize } = this.state;
    if (open) {
      var plot = [
        {
          x: data[location].depth[depth].model.time,
          y: data[location].depth[depth].model.values,
          name: false,
          lineColor: "#5594CC",
          fontWeigth: 2,
        },
        {
          x: data[location].depth[depth].insitu.time,
          y: data[location].depth[depth].insitu.values,
          name: false,
          lineColor: "#f34b3e",
        },
      ];
      return (
        <div className="model-performance">
          <div className="close" onClick={this.close}>
            &#10005;
          </div>
          <div className="model-performance-title">
            {Translations.modelPerformance[language]}
          </div>
          <div className="model-performance-selectors">
            <select value={location} onChange={this.setLocation}>
              {Object.keys(data).map((l) => (
                <option key={l}>{data[l].name}</option>
              ))}
            </select>
            <select value={depth} onChange={this.setDepth}>
              {Object.keys(data[location].depth).map((d) => (
                <option key={d}>{data[location].depth[depth].name}</option>
              ))}
            </select>
            <div className="rmse">
              RMSE: <b>{data[location].depth[depth].rmse}°C</b>
            </div>
          </div>
          <div className="model-performance-plot">
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
          </div>
          <div
            className="model-performance-legend"
            style={{ fontSize: `${fontSize}px` }}
          >
            <div className="item">
              <div className="line" style={{ borderColor: "#5594CC" }}></div>
              <div className="text">{model}</div>
            </div>
            <div className="item">
              <div className="line" style={{ borderColor: "#f34b3e" }}></div>
              <div className="text">{data[location].name}</div>
            </div>
          </div>
        </div>
      );
    } else {
      var rmse_color = "#76b64b";
      if (rmse >= 2) {
        rmse_color = "#f34b3e";
      } else if (rmse >= 1) {
        rmse_color = "#fbd247";
      }
      return (
        <div
          className="model-performance-button"
          title={Translations.modelPerformance[language]}
          onClick={this.open}
        >
          <div className="circle" style={{ backgroundColor: rmse_color }} />
          &#177; {rmse}°C
        </div>
      );
    }
  }
}

export default ModelPerformance;
