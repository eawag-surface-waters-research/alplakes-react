import React, { Component } from "react";
import Translations from "../../../translations.json";

class LayerSelection extends Component {
  state = {
    draggedId: null,
    dragOverId: null,
  };
  removeLayer = (event) => {
    event.stopPropagation();
    this.props.removeLayer(event.target.getAttribute("id"));
  };
  onDragStart = (event, id) => {
    this.setState({ draggedId: id });
    event.dataTransfer.effectAllowed = "move";
    // Firefox (and some others) won't fire drag/drop events unless data is set.
    event.dataTransfer.setData("text/plain", id);
  };
  onDragEnd = () => {
    this.setState({ draggedId: null, dragOverId: null });
  };
  // Returns the id of the chip the cursor is currently before (insertion point),
  // or null to append at the end. Driven by cursor X against each chip's midpoint
  // so dropping in the gaps between chips still resolves to a position.
  insertionTargetId = (container, clientX) => {
    var chips = Array.from(container.querySelectorAll(".app.filled"));
    for (let chip of chips) {
      var box = chip.getBoundingClientRect();
      if (clientX < box.left + box.width / 2) {
        return chip.getAttribute("data-id");
      }
    }
    return null;
  };
  onContainerDragOver = (event) => {
    if (!this.state.draggedId) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    var beforeId = this.insertionTargetId(event.currentTarget, event.clientX);
    if (beforeId !== this.state.dragOverId) {
      this.setState({ dragOverId: beforeId });
    }
  };
  onContainerDrop = (event, activeLayers) => {
    event.preventDefault();
    var { draggedId } = this.state;
    this.setState({ draggedId: null, dragOverId: null });
    if (!draggedId) return;
    var beforeId = this.insertionTargetId(event.currentTarget, event.clientX);
    var orderedIds = activeLayers
      .map((l) => l.id)
      .filter((id) => id !== draggedId);
    if (beforeId === null || beforeId === draggedId) {
      orderedIds.push(draggedId);
    } else {
      orderedIds.splice(orderedIds.indexOf(beforeId), 0, draggedId);
    }
    this.props.reorderLayers(orderedIds);
  };
  render() {
    var {
      layers,
      setSelection,
      selection,
      images,
      toggleAddLayersModal,
      language,
    } = this.props;
    var { draggedId, dragOverId } = this.state;
    var activeLayers = layers
      .filter((l) => l.active)
      .sort((a, b) =>
        a.displayOptions["zIndex"] > b.displayOptions["zIndex"]
          ? -1
          : b.displayOptions["zIndex"] > a.displayOptions["zIndex"]
            ? 1
            : 0,
      );
    var extra = Math.max(0, 4 - activeLayers.length);
    return (
      <React.Fragment>
        <div className="active-apps">
          <div
            className="app-area"
            onDragOver={this.onContainerDragOver}
            onDrop={(e) => this.onContainerDrop(e, activeLayers)}
          >
            {activeLayers.map((layer) => (
              <div
                className={
                  "app filled " +
                  layer.type +
                  (selection === layer.id ? " active" : "") +
                  (draggedId === layer.id ? " dragging" : "") +
                  (dragOverId === layer.id && draggedId !== layer.id
                    ? " drag-over"
                    : "")
                }
                key={layer.id}
                data-id={layer.id}
                onClick={() => setSelection(layer.id)}
                title="Edit settings"
                draggable
                onDragStart={(e) => this.onDragStart(e, layer.id)}
                onDragEnd={this.onDragEnd}
              >
                <div
                  className="remove"
                  title="Remove layer"
                  id={layer.id}
                  onClick={this.removeLayer}
                >
                  -
                </div>
                <img src={images[layer.name]} alt={layer.name} />
                <div className="label">
                  <div className="over">
                    {Translations[layer.name][language]}
                  </div>
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
                onClick={toggleAddLayersModal}
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
