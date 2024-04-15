import React, { Component } from "react";
import Colorbar from "../../components/colors/colorbar";
import Translate from "../../translations.json";

class Legend extends Component {
  render() {
    var { layers, language, setSelection, legend } = this.props;
    return (
      <div className={legend ? "legend" : "legend hide"}>
        <table>
          <tbody>
            {layers
              .filter(
                (l) =>
                  ["min", "max", "palette"].every((key) =>
                    Object.keys(l.properties.options).includes(key)
                  ) &&
                  l.active &&
                  ("raster" in l.properties.options
                    ? l.properties.options.raster
                    : true)
              )
              .map((l) => (
                <Colorbar
                  min={l.properties.options.min}
                  max={l.properties.options.max}
                  palette={l.properties.options.palette}
                  unit={l.properties.unit}
                  onClick={setSelection}
                  key={l.id}
                  id={l.id}
                  text={
                    l.properties.parameter in Translate
                      ? Translate[l.properties.parameter][language]
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
