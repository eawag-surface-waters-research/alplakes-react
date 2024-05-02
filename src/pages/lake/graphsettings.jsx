import React, { Component } from "react";
import Toggle from "../../components/sliders/toggle";

class GraphSettings extends Component {
  render() {
    return (
      <div className="graph-settings">
        <Toggle left={"Current"} right={"Historic"} />
        <Toggle left={"Heatmap"} right={"Linegraph"} />
      </div>
    );
  }
}

export default GraphSettings;
