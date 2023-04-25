import React, { Component } from "react";
import "./lake.css";
import ColorRamp from "../../components/colors/colorramp";

class Raster extends Component {
  state = {
    min: this.props.options.min,
    max: this.props.options.max,
    opacity: this.props.options.opacity,
    palette: this.props.options.palette,
  };

  setMin = (event) => {
    this.setState({ min: event.target.value });
  };

  setMax = (event) => {
    this.setState({ max: event.target.value });
  };

  setOpacity = (event) => {
    var { id, updateOptions, options } = this.props;
    var value = event.target.value;
    options["opacity"] = value;
    this.setState({ opacity: value });
    updateOptions(id, options);
  };

  setPalette = (event) => {
    console.log(event);
  };

  render() {
    var { min, max, opacity, palette } = this.state;
    return (
      <div className="layer-settings">
        <div className="setting">
          Min <input type="number" value={min} onChange={this.setMin} />
        </div>
        <div className="setting">
          Max <input type="number" value={max} onChange={this.setMax} />
        </div>
        <div className="setting">
          Opacity
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={opacity}
            onChange={this.setOpacity}
          ></input>
        </div>
        <div className="setting">
          Palette
          <ColorRamp />
        </div>
      </div>
    );
  }
}

class LayerSettings extends Component {
  render() {
    var { layer, updateOptions } = this.props;
    var type = layer.properties.display;
    if (type === "raster") {
      return (
        <Raster
          id={layer.id}
          options={layer.properties.options}
          updateOptions={updateOptions}
        />
      );
    } else if (type === "streamlines") {
      return <div className="layer-settings">Streamlines settings</div>;
    } else {
      return (
        <div className="layer-settings">
          No customisable parameters available for this layer.
        </div>
      );
    }
  }
}

export default LayerSettings;
