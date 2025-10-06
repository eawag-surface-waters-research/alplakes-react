import React, { Component } from "react";
import D3LineGraph from "../linegraph/linegraph";
import Translations from "../../../translations.json";
import { deepCopy } from "./functions";

class DatasetLinegraph extends Component {
  render() {
    var {
      dark,
      data,
      ylabel,
      yunits,
      xlabel,
      xunits,
      curve,
      language,
      padding,
      grid,
      noYear,
      noData,
      fontSize,
      setFontSize,
      yMin,
      yMax,
      xMin,
      xMax
    } = this.props;
    var inputData = [];
    if (data !== undefined) {
      inputData = deepCopy(data);
    }
    return (
      <div
        className={
          padding === true ? "dataset-linegraph padding" : "dataset-linegraph"
        }
      >
        {noData && (
          <div className="dataset-linegraph-label">
            {Translations.notAvail[language]}
          </div>
        )}
        {data && (
          <D3LineGraph
            data={inputData}
            xlabel={xlabel}
            ylabel={ylabel}
            xunits={xunits}
            yunits={yunits}
            ymin={yMin}
            ymax={yMax}
            xmin={xMin}
            xmax={xMax}
            dark={dark}
            marginTop={1}
            marginRight={1}
            marginBottom={xlabel === "time" ? 20 : 35}
            lcolor={[]}
            lweight={[]}
            curve={curve}
            language={language}
            grid={grid}
            noYear={noYear}
            fontSize={fontSize}
            setFontSize={setFontSize}
          />
        )}
      </div>
    );
  }
}

export default DatasetLinegraph;
