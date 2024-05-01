import React, { Component } from "react";
import SatelliteSummary from "../../components/d3/satellitesummary/satellitesummary";
import Translations from "../../translations.json";
import { formatSencastDay, findClosest } from "./functions";
import ProfileGraph from "../../components/d3/profilegraph/profilegraph";
import TransectGraph from "../../components/d3/transectgraph/transectgraph";
import ThreedLinegraph from "../../components/d3/threedlinegraph/threedlinegraph";

class SummaryGraph extends Component {
  setImage = (event) => {
    var { layers, selection, updateOptions } = this.props;
    var layer = layers.find((l) => l.id === selection);
    var date = layer.displayOptions.availableImages[formatSencastDay(event)];
    var image = findClosest(date.images, "time", event);
    layer.displayOptions.image = image;
    updateOptions(layer.id, layer.displayOptions);
  };
  render() {
    var { layers, selection, active, language, dark, datetime } = this.props;
    var layer = layers.find((l) => l.id === selection);
    var plot = false;
    if (active && layer && "summaryGraph" in layer) plot = layer.summaryGraph;
    switch (plot) {
      default:
        return <React.Fragment></React.Fragment>;
      case "satellite_timeseries":
        var label = layer.parameter
          ? Translations[layer.parameter][language]
          : "";
        return (
          <React.Fragment>
            <SatelliteSummary
              available={layer.displayOptions.availableImages}
              language={language}
              label={label}
              unit={layer.unit}
              dark={dark}
              setImage={this.setImage}
            />
          </React.Fragment>
        );
      case "profile_plot":
        if (layer.displayOptions.data) {
          return (
            <React.Fragment>
              <ProfileGraph
                data={layer.displayOptions.data}
                options={layer.displayOptions}
                dark={dark}
              />
            </React.Fragment>
          );
        } else {
          return <React.Fragment> <div className="graph-temp">
          Add a marker to see the profile plotted here.
        </div></React.Fragment>;
        }
      case "transect_plot":
        if (layer.displayOptions.data) {
          return (
            <React.Fragment>
              <TransectGraph
                data={layer.displayOptions.data}
                options={layer.displayOptions}
                datetime={datetime}
                dark={dark}
              />
            </React.Fragment>
          );
        } else {
          return (
            <React.Fragment>
              <div className="graph-temp">
                Draw a transect to see it plotted here.
              </div>
            </React.Fragment>
          );
        }
      case "threed_linegraph":
        if (layer.displayOptions.data) {
          return (
            <React.Fragment>
              <ThreedLinegraph
                data={layer.displayOptions.data}
                options={layer.displayOptions}
                datetime={datetime}
                parameter={layer.parameter}
                unit={layer.unit}
                language={language}
                dark={dark}
              />
            </React.Fragment>
          );
        } else {
          return <React.Fragment></React.Fragment>;
        }
    }
  }
}

export default SummaryGraph;
