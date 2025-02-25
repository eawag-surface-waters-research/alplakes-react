import React, { Component } from "react";
import D3LineGraph from "../linegraph/linegraph";
import Translations from "../../../translations.json";
import "react-datepicker/dist/react-datepicker.css";

class SatelliteSummary extends Component {
  state = {
    data: [],
    ymin: 0,
    ymax: 0,
    xmin: new Date(new Date().setMonth(new Date().getMonth() - 4)),
    xmax: new Date(),
    coverage: 10,
  };
  setImage = (event) => {
    this.props.setImage(event.x);
  };

  setData = () => {
    var { xmin, xmax } = this.state;
    var { available, options } = this.props;
    var data = {};
    var ymin = Infinity;
    var ymax = -Infinity;
    for (let date of Object.values(available)) {
      for (let image of date.images) {
        if (image.percent > options.coverage) {
          let tooltip = `<div><div>${image.satellite} ${image.percent}% coverage</div><div></div>Click to view</div>`;
          if (image.time >= xmin && image.time <= xmax) {
            ymin = Math.min(ymin, image.ave);
            ymax = Math.max(ymax, image.ave);
          }
          if (image.satellite in data) {
            data[image.satellite].x.push(image.time);
            data[image.satellite].y.push(image.ave);
            data[image.satellite].tooltip.push(tooltip);
          } else {
            data[image.satellite] = {
              x: [image.time],
              y: [image.ave],
              tooltip: [tooltip],
              symbol: image.satellite.includes("S2") ? "x" : "o",
            };
          }
        }
      }
    }
    data = Object.values(data);
    this.setState({ data, ymin, ymax, coverage: options.coverage });
  };

  componentDidMount() {
    this.setData();
  }

  componentDidUpdate() {
    if (this.props.options.coverage !== this.state.coverage) {
      this.setData();
    }
  }

  render() {
    var { label, unit, dark, language } = this.props;
    var { data, xmin, xmax, ymin, ymax } = this.state;
    return (
      <React.Fragment>
        <div className="graph-title">
          {Translations.satelliteGraph[language]}
        </div>
        <D3LineGraph
          data={data}
          ylabel={label}
          yunits={unit}
          lcolor={new Array(10).fill(dark ? "white" : "black")}
          lweight={[1]}
          bcolor={["white"]}
          simple={false}
          lines={false}
          scatter={true}
          plotdots={true}
          xmax={xmax}
          xmin={xmin}
          ymax={ymax}
          ymin={ymin}
          marginTop={5}
          marginRight={1}
          marginBottom={50}
          xscale={"Time"}
          yscale={""}
          legend={false}
          header={true}
          language={language}
          onClick={this.setImage}
        />
      </React.Fragment>
    );
  }
}

export default SatelliteSummary;
