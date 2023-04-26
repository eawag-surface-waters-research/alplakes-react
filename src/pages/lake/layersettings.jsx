import React, { Component } from "react";
import ColorRamp from "../../components/colors/colorramp";
import "./lake.css";

class Raster extends Component {
  state = {
    _min: this.props.options.dataMin,
    _max: this.props.options.dataMax,
    dataMin: this.props.options.dataMin,
    dataMax: this.props.options.dataMax,
  };

  setMin = (event) => {
    this.setState({ _min: event.target.value });
  };

  setMax = (event) => {
    this.setState({ _max: event.target.value });
  };

  updateMinMax = () => {
    var { id, updateOptions, options } = this.props;
    var { _min, _max } = this.state;
    options["min"] = parseFloat(_min);
    options["max"] = parseFloat(_max);
    updateOptions(id, options);
  };

  enterMinMax = (event) => {
    if (event.key === "Enter") {
      this.updateMinMax();
    }
  };

  setOpacity = (event) => {
    var { id, updateOptions, options } = this.props;
    var value = event.target.value;
    options["opacity"] = value;
    updateOptions(id, options);
  };

  setPalette = (event) => {
    var { id, updateOptions, options } = this.props;
    options["paletteName"] = event.name;
    options["palette"] = event.palette;
    updateOptions(id, options);
  };

  resetMin = () => {
    this.setState({ _min: this.props.options.dataMin });
  };

  resetMax = () => {
    this.setState({ _max: this.props.options.dataMax });
  };

  componentDidUpdate() {
    if (
      this.state.dataMin !== this.props.options.dataMin ||
      this.state.dataMax !== this.props.options.dataMax
    ) {
      this.setState({
        _min: this.props.options.dataMin,
        _max: this.props.options.dataMax,
        dataMin: this.props.options.dataMin,
        dataMax: this.props.options.dataMax,
      });
    }
  }

  componentDidMount() {
    window.addEventListener("click", this.updateMinMax);
    document
      .getElementById("raster_min")
      .addEventListener("keydown", this.enterMinMax);
    document
      .getElementById("raster_max")
      .addEventListener("keydown", this.enterMinMax);
  }

  componentWillUnmount() {
    window.removeEventListener("click", this.updateMinMax);
    document
      .getElementById("raster_min")
      .removeEventListener("keydown", this.enterMinMax);
    document
      .getElementById("raster_max")
      .removeEventListener("keydown", this.enterMinMax);
  }

  render() {
    var { _min, _max } = this.state;
    var { palette, opacity } = this.props.options;
    return (
      <div className="layer-settings">
        <div className="setting half">
          <div className="label">Min</div>
          <input
            type="number"
            className="with-button"
            value={_min}
            step="0.1"
            onChange={this.setMin}
            id="raster_min"
          />
          <button onClick={this.resetMin}>Reset</button>
        </div>
        <div className="setting half">
          <div className="label">Max</div>
          <input
            type="number"
            className="with-button"
            value={_max}
            step="0.1"
            onChange={this.setMax}
            id="raster_max"
          />
          <button onClick={this.resetMax}>Reset</button>
        </div>
        <div className="setting">
          <div className="label">Opacity</div>
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
          <div className="label">Palette</div>
          <ColorRamp onChange={this.setPalette} value={palette} />
        </div>
      </div>
    );
  }
}

class Streamlines extends Component {
  state = {
    minVelocityScale: 0.0001,
    maxVelocityScale: 0.2,
    _paths: this.props.options.paths,
  };

  setColor = (event) => {
    var { id, updateOptions, options } = this.props;
    var value = event.target.value;
    options["color"] = value;
    updateOptions(id, options);
  };

  setPaths = (event) => {
    this.setState({ _paths: event.target.value });
  };

  updatePaths = () => {
    var { id, updateOptions, options } = this.props;
    var { _paths } = this.state;
    if (parseInt(_paths) !== options.paths) {
      options["paths"] = parseInt(_paths);
      updateOptions(id, options);
    }
  };

  enterPaths = (event) => {
    if (event.key === "Enter") {
      this.updatePaths();
    }
  };

  setOpacity = (event) => {
    var { id, updateOptions, options } = this.props;
    var value = event.target.value;
    options["opacity"] = value;
    updateOptions(id, options);
  };

  setParameter = (event, parameter) => {
    var { id, updateOptions, options } = this.props;
    var value = event.target.value;
    options[parameter] = value;
    updateOptions(id, options);
  };

  convertSpeed = (value) => {
    var { minVelocityScale, maxVelocityScale } = this.state;
    var minlog = Math.log10(minVelocityScale);
    var maxlog = Math.log10(maxVelocityScale);
    var range = maxlog - minlog;
    return (Math.log10(value) - minlog) / range;
  };

  setSpeed = (event) => {
    var { id, updateOptions, options } = this.props;
    var { minVelocityScale, maxVelocityScale } = this.state;
    var value = event.target.value;
    var minlog = Math.log10(minVelocityScale);
    var maxlog = Math.log10(maxVelocityScale);
    var range = maxlog - minlog;
    options["velocityScale"] = 10 ** (range * value + minlog);
    updateOptions(id, options);
  };

  componentDidMount() {
    window.addEventListener("click", this.updatePaths);
    document
      .getElementById("streamlines_paths")
      .addEventListener("keydown", this.enterPaths);
  }

  componentWillUnmount() {
    window.removeEventListener("click", this.updatePaths);
    document
      .getElementById("streamlines_paths")
      .removeEventListener("keydown", this.enterPaths);
  }

  render() {
    var { color, opacity, velocityScale } = this.props.options;
    var { _paths } = this.state;
    return (
      <div className="layer-settings">
        {/*<div className="switch">
          <button>Directional Arrows</button>
        </div>*/}
        <div className="setting half">
          <div className="label">Paths</div>
          <input
            type="number"
            value={_paths}
            onChange={this.setPaths}
            step="100"
            id="streamlines_paths"
          />
        </div>
        <div className="setting half">
          <div className="label">Color</div>
          <input type="color" value={color} onChange={this.setColor}></input>
        </div>
        <div className="setting half">
          <div className="label">Speed</div>
          <input
            type="range"
            min="0"
            step="0.01"
            max="1"
            value={this.convertSpeed(velocityScale)}
            onChange={this.setSpeed}
          ></input>
        </div>
        <div className="setting half">
          <div className="label">Opacity</div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={opacity}
            onChange={this.setOpacity}
          ></input>
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
      return (
        <Streamlines
          id={layer.id}
          options={layer.properties.options}
          updateOptions={updateOptions}
        />
      );
    } else if (type === "vectorfield") {
      return <div className="layer-settings">Vector field settings</div>;
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
