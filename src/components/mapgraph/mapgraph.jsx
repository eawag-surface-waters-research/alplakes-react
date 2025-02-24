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

class Graph extends Component {
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
  state = {
    hide: window.innerWidth > 500 ? false : true,
    selected: false,
  };
  toggleHide = () => {
    this.setState({ hide: !this.state.hide });
  };
  render() {
    var { layers, language, graphSelection, dark, datetime, selectMapGraph } =
      this.props;
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
    console.log(labels);
    const { hide } = this.state;
    if (graphSelection) {
      var layer = layers.find((l) => l.id === graphSelection.id);
      var data = layer.graph[graphSelection.type];
      return hide ? (
        <div className="map-graph-icon" onClick={this.toggleHide}>
          <img src={icon} alt="Graph icon" />
        </div>
      ) : (
        <div className="map-graph">
          <div className="map-graph-header">
            <div className="map-graph-close" onClick={this.toggleHide}>
              &#10005;
            </div>
            <div className="map-graph-title">
              {labels.map((label) => (
                <div
                  className={
                    label.active ? "map-graph-label active" : "map-graph-label"
                  }
                  onClick={() => selectMapGraph(label)}
                >
                  <img src={icons[label.type]} alt={label.type} />
                  {label.name}
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
            />
          </div>
        </div>
      );
    }
  }
}

export default MapGraph;
