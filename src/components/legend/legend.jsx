import React, { Component } from "react";
import Colorbar from "../../components/colors/colorbar";
import Translate from "../../translations.json";

class Legend extends Component {
  render() {
    var { layers, language, setSelection, legend, playControls } = this.props;
    if (layers === undefined || layers.length === 0) {
      layers = [];
      legend = false;
    }
    return (
      <div
        className={
          legend ? (playControls ? "legend play" : "legend") : "legend hide"
        }
      >
        <table>
          <tbody>
            {layers
              .filter(
                (l) =>
                  ["min", "max", "palette"].every((key) =>
                    Object.keys(l.displayOptions).includes(key)
                  ) &&
                  l.active &&
                  ("raster" in l.displayOptions
                    ? l.displayOptions.raster
                    : true)
              )
              .map((l) => (
                <Colorbar
                  min={l.displayOptions.min}
                  max={l.displayOptions.max}
                  palette={l.displayOptions.palette}
                  unit={l.unit}
                  onClick={setSelection}
                  key={l.id}
                  id={l.id}
                  text={
                    l.parameter in Translate
                      ? Translate[l.parameter][language]
                      : ""
                  }
                />
              ))}
          </tbody>
        </table>
      </div>
    );
  }
}

export default Legend;
