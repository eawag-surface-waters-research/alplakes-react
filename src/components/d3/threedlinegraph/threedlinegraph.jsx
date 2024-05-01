import React, { Component } from "react";
import D3LineGraph from "../linegraph/linegraph";
import Translate from "../../../translations.json";

class ThreedLinegraph extends Component {
  render() {
    var { data, parameter, unit, language, dark } = this.props;
    return (
      <React.Fragment>
        <div className="graph-title">{data.title}</div>
        <D3LineGraph
          data={[data]}
          ylabel={Translate[parameter][language]}
          yunits={unit}
          fontSize={12}
          xReverse={false}
          yReverse={false}
          lcolor={new Array(10).fill(dark ? "white" : "black")}
          lweight={[2]}
          bcolor={["white"]}
          scatter={true}
          xscale={"Time"}
          yscale={""}
          simple={false}
          header={false}
        />
      </React.Fragment>
    );
  }
}

export default ThreedLinegraph;
