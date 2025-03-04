import React, { Component } from "react";
import Translations from "../../translations.json";
import icon from "../../img/graph_bar.png";
import "./mapgraph.css";
import SatelliteSummary from "../d3/satellitesummary/satellitesummary";
import ProfileGraph from "../d3/profilegraph/profilegraph";
import TransectGraph from "../d3/transectgraph/transectgraph";
import satelliteIcon from "../../img/satelliteicon.png";
import profileIcon from "../../img/profile.png";
import transectIcon from "../../img/transect.png";

const formatSencastDay = (datetime) => {
  var a = new Date(datetime);
  var year = a.getFullYear();
  var month = a.getMonth() + 1;
  var date = a.getDate();
  return `${String(year)}${month < 10 ? "0" + month : month}${
    date < 10 ? "0" + date : date
  }`;
};

const findClosest = (array, key, value) => {
  let closest = null;
  let minDiff = Infinity;
  for (let i = 0; i < array.length; i++) {
    let diff = Math.abs(array[i][key] - value);
    if (diff < minDiff) {
      minDiff = diff;
      closest = array[i];
    }
  }
  return closest;
};

class Graph extends Component {
  setImage = (event) => {
    var { layer, updateOptions } = this.props;
    var { available } = layer.sources[layer.source].metadata;
    var date = available[formatSencastDay(event)];
    var image = findClosest(date.images, "time", event);
    layer.sources[layer.source].metadata.image = image;
    layer.displayOptions.url = image.url;
    layer.displayOptions.time = image.time;
    updateOptions(layer.id, "tiff", layer.displayOptions);
  };
  render() {
    var { layer, plotType, language, data, dark, datetime } = this.props;
    switch (plotType) {
      default:
        return <React.Fragment></React.Fragment>;
      case "satellite_timeseries":
        return (
          <SatelliteSummary
            available={data}
            language={language}
            label={Translations[layer.parameter][language]}
            options={layer.displayOptions}
            unit={layer.unit}
            dark={dark}
            setImage={this.setImage}
          />
        );
      case "profile_plot":
        return (
          <ProfileGraph
            data={data}
            options={layer.displayOptions}
            language={language}
            dark={dark}
          />
        );
      case "transect_plot":
        return (
          <TransectGraph
            data={data}
            options={layer.displayOptions}
            language={language}
            datetime={datetime}
            dark={dark}
          />
        );
    }
  }
}

class MapGraph extends Component {
  render() {
    var {
      layers,
      language,
      graphSelection,
      dark,
      datetime,
      selectMapGraph,
      graphHide,
      toggleGraphHide,
      updateOptions,
    } = this.props;
    var icons = {
      satellite_timeseries: satelliteIcon,
      profile_plot: profileIcon,
      transect_plot: transectIcon,
    };
    var labels = [];
    for (let l of layers.filter((l) => "graph" in l)) {
      for (let key in l.graph) {
        let active = l.id === graphSelection.id && key === graphSelection.type;
        labels.push({
          id: l.id,
          type: key,
          active,
          name: Translations[l.parameter][language],
        });
      }
    }
    if (graphSelection) {
      var layer = layers.find((l) => l.id === graphSelection.id);
      var data = layer.graph[graphSelection.type];
      return graphHide ? (
        <div className="map-graph-icon" onClick={toggleGraphHide}>
          <img src={icon} alt="Graph icon" />
        </div>
      ) : (
        <div className="map-graph">
          <div className="map-graph-header">
            <div className="map-graph-close" onClick={toggleGraphHide}>
              &#10005;
            </div>
            <div className="map-graph-title">
              {labels.map((label) => (
                <div
                  className={
                    label.active ? "map-graph-label active" : "map-graph-label"
                  }
                  key={`${label.id}_${label.type}`}
                  onClick={() => selectMapGraph(label)}
                >
                  <img src={icons[label.type]} alt={label.type} />
                  <div className="map-graph-label-text">{label.name}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="map-graph-content">
            <Graph
              layer={layer}
              data={data}
              plotType={graphSelection.type}
              language={language}
              dark={dark}
              datetime={datetime}
              updateOptions={updateOptions}
            />
          </div>
        </div>
      );
    }
  }
}

export default MapGraph;
