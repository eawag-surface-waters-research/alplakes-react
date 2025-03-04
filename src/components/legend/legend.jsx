import React, { Component } from "react";
import Colorbar from "../../components/colors/colorbar";
import Translate from "../../translations.json";

class Legend extends Component {
  render() {
    var { layers, language, show } = this.props;
    if (layers === undefined || layers.length === 0) {
      layers = [];
      show = false;
    }
    var legend_layers = layers.filter(
      (l) =>
        ["min", "max", "paletteName"].every((key) =>
          Object.keys(l.displayOptions).includes(key)
        ) &&
        l.active &&
        ("raster" in l.displayOptions ? l.displayOptions.raster : true)
    );
    return (
      <div className={show ? "legend" : "legend hide"}>
        <div className="legend-inner">
          <table>
            <tbody>
              {legend_layers.map((l) => (
                <Colorbar
                  min={l.displayOptions.min}
                  max={l.displayOptions.max}
                  paletteName={l.displayOptions.paletteName}
                  unit={l.unit}
                  key={l.id}
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
      </div>
    );
  }
}

export default Legend;
