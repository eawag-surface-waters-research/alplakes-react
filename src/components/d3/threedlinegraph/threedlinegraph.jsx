import React, { Component } from "react";
import D3LineGraph from "../linegraph/linegraph";
import Translations from "../../../translations.json";

class ThreedLinegraph extends Component {
  render() {
    var { data, parameter, unit, language, dark, clearPlot } = this.props;
    var lcolor = [
      dark ? "white" : "black",
      "#e6194B",
      "#3cb44b",
      "#4363d8",
      "#f58231",
      "#911eb4",
      "#42d4f4",
      "#f032e6",
      "#fabed4",
      "#469990",
      "#dcbeff",
      "#9A6324",
      "#fffac8",
      "#800000",
      "#aaffc3",
      "#808000",
      "#ffd8b1",
      "#000075",
    ];
    return (
      <React.Fragment>
        <div className="graph-title">{data[0].title}</div>
        <D3LineGraph
          data={data}
          ylabel={Translations[parameter][language]}
          yunits={unit}
          fontSize={12}
          xReverse={false}
          yReverse={false}
          lcolor={lcolor}
          lweight={[1]}
          bcolor={["white"]}
          scatter={false}
          xscale={"Time"}
          yscale={""}
          simple={false}
          header={true}
          curve={true}
          marginLeft={60}
          marginTop={1}
          marginRight={1}
          clearPlot={clearPlot}
        />
      </React.Fragment>
    );
  }
}

export default ThreedLinegraph;
