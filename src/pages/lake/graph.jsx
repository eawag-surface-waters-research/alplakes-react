import React, { Component } from "react";
import DatasetHeatmap from "../../components/d3/dataset/datasetheatmap";
import Settings from "./settings";
import { copy } from "./functions";
import { addLayer, updateLayer, removeLayer, loaded } from "./graphfunctions";
import Loading from "../../components/loading/loading";
import DatasetLinegraph from "../../components/d3/dataset/datasetlinegraph";
import InitialLoading from "../../components/loading/initialloading";
import ModuleLabels from "../../components/modulelabels/modulelabels";

class Graph extends Component {
  state = {
    selection: false,
    updates: [],
    layers: [],
    loadingId: "load_" + Math.round(Math.random() * 100000),
    initialLoad: true,
  };
  addLayer = (id) => {
    var { layers, updates } = this.state;
    var layer = layers.find((l) => l.id === id);
    if (!layer.active) {
      for (let l of layers.filter((l) => l.active)) {
        l.active = false;
        updates.push({ event: "removeLayer", id: l.id });
      }

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
  updateOptions = (id, options) => {
    var { layers, updates } = this.state;
    updates.push({ event: "updateLayer", id: id });
    layers.find((l) => l.id === id).displayOptions = options;
    this.setState({ layers, updates }, () => this.processUpdates());
  };
  updateSource = (id, source) => {
    var { layers, updates } = this.state;
    layers.find((l) => l.id === id).source = source;
    updates.push({ event: "removeLayer", id: id });
    updates.push({ event: "addLayer", id: id });
    this.setState({ layers, updates }, () => this.processUpdates());
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
    var { updates, layers, loadingId } = this.state;
    if (updates.length > 0) {
      this.setState({ updates: [] });
      for (var update of updates) {
        var layer = this.find(layers, "id", update.id);
        if (update.event === "addLayer") {
          try {
            layer = await addLayer(layer, language, loadingId);
          } catch (e) {
            console.error("Failed to add layer", layer.id);
            console.error(e);
            this.error(`Failed to add layer ${layer.parameter}.`);
          }
        } else if (update.event === "updateLayer") {
          layer = await updateLayer(layer, loadingId);
        } else if (update.event === "removeLayer") {
          layer = removeLayer(layer);
        }
      }
      this.setState({ layers, initialLoad: false });
    }
    loaded(loadingId);
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
    var { language, dark, module, settings } = this.props;
    var { layers, loadingId, initialLoad, selection } = this.state;
    var heat_layer = false;
    var heat_layers = layers.filter((d) => d.active && d.display === "heat");
    if (heat_layers.length > 0) {
      heat_layer = heat_layers[0];
    }
    var line_layer = false;
    var line_layers = layers.filter(
      (d) => d.active && (d.display === "line" || d.display === "doy")
    );
    if (line_layers.length > 0) {
      line_layer = line_layers[0];
    }
    return (
      <div className="module-component graph">
        <div className="plot">
          <ModuleLabels
            module={module}
            layers={layers}
            selection={selection}
            language={language}
          />
          {heat_layer && (
            <DatasetHeatmap
              {...heat_layer.displayOptions}
              dark={dark}
              language={language}
            />
          )}
          {line_layer && (
            <DatasetLinegraph
              {...line_layer.displayOptions}
              dark={dark}
              language={language}
            />
          )}
          {initialLoad && (
            <div className="initial-load">
              <InitialLoading />
            </div>
          )}
          <div className="layer-loading" id={loadingId}>
            <Loading />
          </div>
        </div>
        <div className={settings ? "sidebar open" : "sidebar"}>
          <Settings
            {...this.state}
            language={language}
            dark={dark}
            layers={layers}
            addLayer={this.addLayer}
            removeLayer={this.removeLayer}
            updateOptions={this.updateOptions}
            updateSource={this.updateSource}
            setSelection={this.setSelection}
          />
        </div>
      </div>
    );
  }
}

export default Graph;
