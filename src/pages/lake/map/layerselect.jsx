import React, { Component } from "react";
import Translations from "../../../translations.json";

class LayerSelection extends Component {
    removeLayer = (event) => {
      event.stopPropagation();
      this.props.removeLayer(event.target.getAttribute("id"));
    };
    render() {
      var { layers, setSelection, selection, images, toggleActiveAdd, language } =
        this.props;
      var extra = Math.max(0, 4 - layers.filter((l) => l.active).length);
      return (
        <React.Fragment>
          <div className="active-apps">
            <div className="app-area">
              {layers
                .filter((l) => l.active)
                .sort((a, b) =>
                  a.displayOptions["zIndex"] > b.displayOptions["zIndex"]
                    ? -1
                    : b.displayOptions["zIndex"] > a.displayOptions["zIndex"]
                    ? 1
                    : 0
                )
                .map((layer, index) => (
                  <div
                    className={
                      "app filled " +
                      layer.type +
                      (selection === layer.id ? " active" : "")
                    }
                    key={layer.id}
                    onClick={() => setSelection(layer.id)}
                    title="Edit settings"
                  >
                    <div
                      className="remove"
                      title="Remove layer"
                      id={layer.id}
                      onClick={this.removeLayer}
                    >
                      -
                    </div>
                    <img src={images[layer.parameter]} alt={layer.parameter} />
                    <div className="label">
                      {Translations[layer.parameter][language]}
                      <div className="under">
                        {Translations[layer.type][language]}
                      </div>
                    </div>
                  </div>
                ))}
              {[...Array(extra).keys()].map((p) => (
                <div
                  className="app"
                  title="Add layer"
                  key={p}
                  onClick={toggleActiveAdd}
                >
                  +
                </div>
              ))}
            </div>
          </div>
        </React.Fragment>
      );
    }
  }

  export default LayerSelection;