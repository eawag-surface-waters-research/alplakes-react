import React, { Component } from "react";
import DatasetHeatmap from "../../components/d3/dataset/datasetheatmap";
import Settings from "./settings";
import { copy } from "./functions";
import { addLayer, updateLayer, removeLayer } from "./graphfunctions";


class Graph extends Component {
  state = {
    sidebar: false,
    selection: false,
    updates: [],
    layers: [],
  };
  openSidebar = () => {
    this.setState({ sidebar: true });
  };
  closeSidebar = () => {
    this.setState({ sidebar: false });
  };
  addLayer = (id) => {
    var { layers, updates } = this.state;
    var layer = layers.find((l) => l.id === id);
    if (!layer.active) {
      layer.active = true;
      updates.push({ event: "addLayer", id: id });
      this.setState(
        {
          layers,
          updates,
          selection: id,
        },
        () => this.processUpdates()
      );
    }
  };
  removeLayer = (id) => {
    var { layers } = this.state;
    var layer = layers.find((l) => l.id === id);
    if (layer.active) {
      layer.active = false;
      var updates = [{ event: "removeLayer", id: id }];
      var selection = false;
      let stillActive = layers.filter((l) => l.active);
      if (stillActive.length > 0) selection = stillActive[0].id;
      this.setState({ layers, updates, selection }, () =>
        this.processUpdates()
      );
    }
  };
  setSelection = (selection) => {
    if (selection !== this.state.selection) {
      this.setState({ selection });
    }
  };
  find = (list, parameter, value) => {
    return list.find((l) => l[parameter] === value);
  };
  processUpdates = async () => {
    var { language } = this.props;
    var { updates, layers } = this.state;
    if (updates.length > 0) {
      this.setState({ updates: [] });
      for (var update of updates) {
        var layer = this.find(layers, "id", update.id);
        if (update.event === "addLayer") {
          try {
            layer = await addLayer(layer, language);
          } catch (e) {
            console.error("Failed to add layer", layer.id);
            console.error(e);
            this.error(`Failed to add layer ${layer.parameter}.`);
          }
        } else if (update.event === "updateLayer") {
          layer = await updateLayer(layer);
        } else if (update.event === "removeLayer") {
          layer = removeLayer(layer);
        }
      }
      this.setState({ layers });
    }
  };
  error = (message) => {
    var parent = document.getElementById("error-modal");
    parent.innerHTML = message;
    parent.style.display = "block";
    setTimeout(this.removeError, 3000);
  };
  removeError = () => {
    document.getElementById("error-modal").style.display = "none";
  };
  async componentDidMount() {
    var { datasets, module } = this.props;
    var { selection } = this.state;
    var updates = [];
    var layers = copy(datasets);
    for (let layer_id of module.defaults) {
      updates.push({ event: "addLayer", id: layer_id });
      let layer = layers.find((l) => l.id === layer_id);
      layer.active = true;
      selection = layer_id;
    }
    this.setState(
      {
        updates,
        layers,
        selection,
      },
      () => this.processUpdates()
    );
  }
  render() {
    var { language, dark } = this.props;
    var { sidebar, layers } = this.state;
    var heat_layer = false;
    var heat_layers = layers.filter((d) => d.active && d.display === "heat");
    if (heat_layers.length > 0) {
      heat_layer = heat_layers[0];
    }
    return (
      <div className="module-component graph">
        <div className="plot">
          {heat_layer && (
            <DatasetHeatmap {...heat_layer.displayOptions} dark={dark} />
          )}
        </div>
        <div className={sidebar ? "sidebar open" : "sidebar"}>
          <div className="close-sidebar" onClick={this.closeSidebar}>
            &times;
          </div>
          <Settings
            {...this.state}
            language={language}
            dark={dark}
            layers={layers}
            addLayer={this.addLayer}
            removeLayer={this.removeLayer}
            setSelection={this.setSelection}
          />
        </div>
      </div>
    );
  }
}

export default Graph;
