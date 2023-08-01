import React, { Component } from "react";
import D3HeatMap from "../../components/d3/heatmap/heatmap";
import { parseAPITime } from "./functions";
import {
  extent,
} from "d3";

import "./lake.css";

class Graphs extends Component {
  state = {
    data: false,
    parameters: [],
    ylabel: "",
    xlabel: "",
    zlabel: "",
    yunits: "",
    xunits: "",
    zunits: "",
    colors: [
      { color: "#000080", point: 0 },
      { color: "#3366FF", point: 0.142857142857143 },
      { color: "#00B0DC", point: 0.285714285714286 },
      { color: "#009933", point: 0.428571428571429 },
      { color: "#FFFF5B", point: 0.571428571428571 },
      { color: "#E63300", point: 0.714285714285714 },
      { color: "#CC0000", point: 0.857142857142857 },
      { color: "#800000", point: 1 },
    ],
    thresholdStep: 200,
    yReverse: true,
    xReverse: false,
    display: "heatmap",
    minvalue: undefined,
    maxvalue: undefined,
  };
  closestDate = (arr, target) => {
    let minDiff = Infinity;
    let closestIndex = null;
    for (let i = 0; i < arr.length; i++) {
      const diff = Math.abs(target - arr[i]);
      if (diff < minDiff) {
        minDiff = diff;
        closestIndex = i;
      }
    }
    return closestIndex;
  };
  componentDidMount() {
    var { data, datetime } = this.props;
    if (data.type === "profile") {
      let parameters = data.layer.properties.variables;
      let parameter = parameters[0];
      let z = data[parameter].data;
      let zlabel = parameter.charAt(0).toUpperCase() + parameter.slice(1);
      let zunits = data[parameter].unit;
      let y = data.depth.data;
      let ylabel = "Depth";
      let yunits = data.depth.unit;
      let x = data.time.map((t) => parseAPITime(t));
      this.setState({ data: { x, y, z }, zlabel, zunits, ylabel, yunits });
    } else if (data.type === "transect") {
      let parameters = data.layer.properties.variables;
      let parameter = parameters[0];
      let z = data[parameter].data[this.closestDate(data.time, datetime)];
      let bounds = extent(data[parameter].data.flat(2)) 
      let zlabel = parameter.charAt(0).toUpperCase() + parameter.slice(1);
      let zunits = data[parameter].unit;
      let y = data.depth.data;
      let ylabel = "Depth";
      let yunits = data.depth.unit;
      let x = data.distance.map((t) => t / 1000);
      let xlabel = "Distance along transect";
      let xunits = "km";
      this.setState({
        data: { x, y, z },
        zlabel,
        zunits,
        ylabel,
        yunits,
        xlabel,
        xunits,
        maxvalue: bounds[1],
        minvalue: bounds[0],
      });
    } else {
      console.error("Graph type not recognised.");
    }
  }
  componentDidUpdate(prevProps) {
    var { data, datetime } = this.props;
    var { x, y } = this.state.data;
    if (data.type === "transect") {
      if (prevProps.datetime !== datetime) {
        let parameters = data.layer.properties.variables;
        let parameter = parameters[0];
        let z = data[parameter].data[this.closestDate(data.time, datetime)];
        this.setState({ data: { x, y, z } });
      }
    }
  }
  render() {
    var {
      data,
      ylabel,
      xlabel,
      zlabel,
      yunits,
      xunits,
      zunits,
      colors,
      thresholdStep,
      yReverse,
      xReverse,
      display,
      minvalue,
      maxvalue,
    } = this.state;
    return (
      <div className="graph">
        <div className="close" onClick={this.props.close}>
          &#10005;
        </div>
        {data && (
          <D3HeatMap
            data={data}
            ylabel={ylabel}
            xlabel={xlabel}
            zlabel={zlabel}
            yunits={yunits}
            xunits={xunits}
            zunits={zunits}
            colors={colors}
            thresholdStep={thresholdStep}
            yReverse={yReverse}
            xReverse={xReverse}
            display={display}
            minvalue={minvalue}
            maxvalue={maxvalue}
          />
        )}
      </div>
    );
  }
}

export default Graphs;
