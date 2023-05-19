import React, { Component } from "react";
import D3HeatMap from "../../components/d3/heatmap/heatmap";
import { parseAPITime } from "./functions";
import COLORS from "../../components/colors/colors.json";
import "./lake.css";

class Graphs extends Component {
  state = {
    data: false,
    ylabel: "Depth",
    xlabel: "Time",
    zlabel: "Temperature",
    yunits: "m",
    zunits: "°C",
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
  };
  componentDidMount() {
    console.log("Here", this.props.data);
    var z = this.props.data.temperature.data;
    z = z[0].map((_, colIndex) => z.map((row) => row[colIndex]));
    var y = this.props.data.depth.data;
    var x = this.props.data.time.map((t) => parseAPITime(t));
    this.setState({ data: { x, y, z } });
  }
  render() {
    var {
      data,
      ylabel,
      xlabel,
      zlabel,
      yunits,
      zunits,
      colors,
      thresholdStep,
      yReverse,
      xReverse,
      display,
    } = this.state;
    console.log(data);
    return (
      <div className="graph">
        {data && (
          <D3HeatMap
            data={data}
            ylabel={ylabel}
            xlabel={xlabel}
            zlabel={zlabel}
            yunits={yunits}
            zunits={zunits}
            colors={colors}
            thresholdStep={thresholdStep}
            yReverse={yReverse}
            xReverse={xReverse}
            display={display}
          />
        )}
      </div>
    );
  }
}

export default Graphs;
