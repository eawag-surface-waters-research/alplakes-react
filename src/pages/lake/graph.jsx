import React, { Component } from "react";
import GraphSettings from "./graphsettings";
import { copy } from "./functions";
import { addDataset, updateDataset, removeDataset } from "./graphfunctions";
//import axios from "axios";

class Graph extends Component {
  state = {
    sidebar: false,
    selection: false,
    updates: [],
    datasets: [],
  };
  openSidebar = () => {
    this.setState({ sidebar: true });
  };
  closeSidebar = () => {
    this.setState({ sidebar: false });
  };
  addDataset = (id) => {
    var { datasets, updates } = this.state;
    var dataset = datasets.find((l) => l.id === id);
    if (!dataset.active) {
      dataset.active = true;
      updates.push({ event: "addDataset", id: id });
      this.setState(
        {
          datasets,
          updates,
          selection: id,
        },
        () => this.processUpdates()
      );
    }
  };
  removeDataset = (id) => {
    var { datasets } = this.state;
    var dataset = datasets.find((l) => l.id === id);
    if (dataset.active) {
      dataset.active = false;
      var updates = [{ event: "removeDataset", id: id }];
      var selection = false;
      let stillActive = datasets.filter((l) => l.active);
      if (stillActive.length > 0) selection = stillActive[0].id;
      this.setState({ datasets, updates, selection }, () =>
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
    var { updates, datasets } = this.state;
    if (updates.length > 0) {
      this.setState({ updates: [] });
      for (var update of updates) {
        var dataset = this.find(datasets, "id", update.id);
        if (update.event === "addDataset") {
          try {
            dataset = await addDataset(dataset);
          } catch (e) {
            console.error("Failed to add dataset", dataset.id);
            console.error(e);
            this.error(`Failed to add layer ${dataset.parameter}.`);
          }
        } else if (update.event === "updateDataset") {
          dataset = await updateDataset(dataset);
        } else if (update.event === "removeDataset") {
          dataset = removeDataset(dataset);
        }
      }
      this.setState({ datasets });
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
    var { metadata, datasets: globalDatasets, module } = this.props;
    var { selection } = this.state;
    var updates = [];
    var datasets = copy(globalDatasets);
    for (let dataset_id of module.defaults) {
      updates.push({ event: "addDataset", id: dataset_id });
      let dataset = datasets.find((l) => l.id === dataset_id);
      dataset.active = true;
      selection = dataset_id;
    }
    this.setState(
      {
        updates,
        datasets,
        selection,
      },
      () => this.processUpdates()
    );
  }
  render() {
    var { language, dark } = this.props;
    var { sidebar, datasets } = this.state;
    return (
      <div className="module-component graph">
        <div className="plot"></div>
        <div className={sidebar ? "sidebar open" : "sidebar"}>
          <div className="close-sidebar" onClick={this.closeSidebar}>
            &times;
          </div>
          <GraphSettings
            {...this.state}
            language={language}
            dark={dark}
            datasets={datasets}
            addDataset={this.addDataset}
            removeDataset={this.removeDataset}
            setSelection={this.setSelection}
          />
        </div>
      </div>
    );
  }
}

export default Graph;
