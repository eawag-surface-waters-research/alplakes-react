import React, { Component } from "react";
import D3HeatMap from "../heatmap/heatmap";

class ProfileGraph extends Component {
  render() {
    var { data: input, options, dark } = this.props;
    var { thresholdStep, palette, variable } = options;
    let z = input["variables"][variable].data;
    let zlabel = variable.charAt(0).toUpperCase() + variable.slice(1);
    let zunits = input["variables"][variable].unit;
    let y = input.depth.data;
    let ylabel = "Depth";
    let yunits = input.depth.unit;
    let x = input.time.map((t) => new Date(t));
    var data = { x, y, z };
    return (
      <React.Fragment>
        {data && (
          <D3HeatMap
            data={data}
            ylabel={ylabel}
            zlabel={zlabel}
            xlabel={"time"}
            yunits={yunits}
            zunits={zunits}
            colors={palette}
            thresholdStep={thresholdStep}
            yReverse={true}
            xReverse={false}
            display={"contour"}
            dark={dark}
          />
        )}
      </React.Fragment>
    );
  }
}

export default ProfileGraph;
