import React, { Component } from "react";
import DatePicker from "react-datepicker";
import ColorRamp from "../../components/colors/colorramp";
import Translate from "../../translations.json";
import CONFIG from "../../config.json";
import { formatAPIDate, formatDateLong } from "./functions";
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

  downloadFile = (event) => {
    var data = event.target.value.split("?");
    const link = document.createElement("a");
    link.href = data[0];
    link.setAttribute("download", data[1]);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
  };

  downloadDates = (model, lake, minDate, maxDate, months) => {
    var dates = [];
    var url = `${CONFIG.alplakes_api}/simulations/file/${model}/${lake}`;
    const targetDate = new Date(minDate);
    const endDate = new Date(maxDate);
    const daysToSubtract = (targetDate.getDay() + 7) % 7;
    targetDate.setDate(targetDate.getDate() - daysToSubtract);
    while (targetDate <= endDate) {
      dates.push({
        url: `${url}/${formatAPIDate(
          targetDate
        )}?${model}_${lake}_${formatAPIDate(targetDate)}.nc`,
        date: formatDateLong(targetDate, months),
      });
      targetDate.setDate(targetDate.getDate() + 7);
    }
    return dates;
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
    var { minDate, maxDate, language, layer } = this.props;
    var { palette, paletteName, opacity } = this.props.options;

    var downloadDates = this.downloadDates(
      layer.properties.model,
      layer.properties.lake,
      minDate,
      maxDate,
      Translate.axis[language].months
    );
    return (
      <div className="layer-settings">
        <div className="layer-section">{Translate.settings[language]}</div>
        <div className="setting half">
          <div className="label">Min</div>
          <div>
            <input
              type="number"
              className="with-button"
              value={_min}
              step="0.1"
              onChange={this.setMin}
              id="raster_min"
            />
            <button onClick={this.resetMin} className="reset">
              Reset
            </button>
          </div>
        </div>
        <div className="setting half">
          <div className="label">Max</div>
          <div>
            <input
              type="number"
              className="with-button"
              value={_max}
              step="0.1"
              onChange={this.setMax}
              id="raster_max"
            />
            <button onClick={this.resetMax} className="reset">
              Reset
            </button>
          </div>
        </div>
        <div className="setting">
          <div className="label">Opacity</div>
          <div className="value">{opacity}</div>
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
          <div className="value">{paletteName}</div>
          <ColorRamp onChange={this.setPalette} value={palette} />
        </div>
        <div className="layer-section">{Translate.downloads[language]}</div>
        <div className="setting half">
          <div className="label">Results</div>
          <div className="value"></div>
          <select defaultValue="" onChange={this.downloadFile}>
            <option disabled value="">
              Select week
            </option>
            {downloadDates.reverse().map((d) => (
              <option key={d.url} value={d.url}>
                {d.date}
              </option>
            ))}
          </select>
        </div>
      </div>
    );
  }
}

class Current extends Component {
  state = {
    minVelocityScale: 0.0001,
    maxVelocityScale: 0.2,
    _paths: this.props.options.paths,
  };

  setPalette = (event) => {
    var { id, updateOptions, options } = this.props;
    options["paletteName"] = event.name;
    options["palette"] = event.palette;
    updateOptions(id, options);
  };

  setStreamlinesColor = (event) => {
    var { id, updateOptions, options } = this.props;
    var value = event.target.value;
    options["streamlinesColor"] = value;
    updateOptions(id, options);
  };

  setArrowsColor = (event) => {
    var { id, updateOptions, options } = this.props;
    var value = event.target.value;
    options["arrowsColor"] = value;
    updateOptions(id, options);
  };

  toggleDisplay = (type) => {
    var { id, updateOptions, options } = this.props;
    options[type] = !options[type];
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

  downloadFile = (event) => {
    var data = event.target.value.split("?");
    const link = document.createElement("a");
    link.href = data[0];
    link.setAttribute("download", data[1]);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
  };

  downloadDates = (model, lake, minDate, maxDate, months) => {
    var dates = [];
    var url = `${CONFIG.alplakes_api}/simulations/file/${model}/${lake}`;
    const targetDate = new Date(minDate);
    const endDate = new Date(maxDate);
    const daysToSubtract = (targetDate.getDay() + 7) % 7;
    targetDate.setDate(targetDate.getDate() - daysToSubtract);
    while (targetDate <= endDate) {
      dates.push({
        url: `${url}/${formatAPIDate(
          targetDate
        )}?${model}_${lake}_${formatAPIDate(targetDate)}.nc`,
        date: formatDateLong(targetDate, months),
      });
      targetDate.setDate(targetDate.getDate() + 7);
    }
    return dates;
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

  setBubble = (range, bubble) => {
    const val = range.value;
    const min = range.min ? range.min : 0;
    const max = range.max ? range.max : 100;
    const newVal = Number(((val - min) * 100) / (max - min));
    bubble.innerHTML = val;
    bubble.style.left = `calc(${newVal}% + (${8 - newVal * 0.15}px))`;
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
    var { _paths } = this.state;
    var { minDate, maxDate, language, layer } = this.props;
    var {
      opacity,
      velocityScale,
      palette,
      paletteName,
      arrows,
      streamlines,
      raster,
      arrowsColor,
      streamlinesColor,
    } = this.props.options;

    var downloadDates = this.downloadDates(
      layer.properties.model,
      layer.properties.lake,
      minDate,
      maxDate,
      Translate.axis[language].months
    );
    return (
      <div className="layer-settings">
        <div className="layer-section">{Translate.settings[language]}</div>

        <div className="layer-sub-section">
          Arrows
          <label className="switch">
            <input
              type="checkbox"
              checked={arrows}
              onChange={() => this.toggleDisplay("arrows")}
            />
            <span className="slider round"></span>
          </label>
        </div>
        <div className="setting half">
          <div className="label">Color</div>
          <input
            type="color"
            value={arrowsColor}
            onChange={this.setArrowsColor}
          ></input>
        </div>
        <div className="setting half">
          <div className="label">Opacity</div>
          <div className="value">{opacity}</div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={opacity}
            onChange={this.setOpacity}
          ></input>
        </div>
        <div className="layer-sub-section">
          Streamlines
          <label className="switch">
            <input
              type="checkbox"
              checked={streamlines}
              onChange={() => this.toggleDisplay("streamlines")}
            />
            <span className="slider round"></span>
          </label>
        </div>
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
          <input
            type="color"
            value={streamlinesColor}
            onChange={this.setStreamlinesColor}
          ></input>
        </div>
        <div className="setting half">
          <div className="label">Speed</div>
          <div className="value">
            x {parseInt(Math.round(velocityScale * 10 ** 4) * 1000)}
          </div>
          <input
            type="range"
            min="0"
            step="0.01"
            max="1"
            value={this.convertSpeed(velocityScale)}
            onChange={this.setSpeed}
          />
        </div>
        <div className="setting half">
          <div className="label">Opacity</div>
          <div className="value">{opacity}</div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={opacity}
            onChange={this.setOpacity}
          ></input>
        </div>
        <div className="layer-sub-section">
          Raster
          <label className="switch">
            <input
              type="checkbox"
              checked={raster}
              onChange={() => this.toggleDisplay("raster")}
            />
            <span className="slider round"></span>
          </label>
        </div>
        <div className="setting">
          <div className="label">Palette</div>
          <div className="value">{paletteName}</div>
          <ColorRamp onChange={this.setPalette} value={palette} />
        </div>
        <div className="setting half">
          <div className="label">Opacity</div>
          <div className="value">{opacity}</div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={opacity}
            onChange={this.setOpacity}
          ></input>
        </div>
        <div className="layer-section">{Translate.downloads[language]}</div>
        <div className="setting half">
          <div className="label">Results</div>
          <div className="value"></div>
          <select defaultValue="" onChange={this.downloadFile}>
            <option disabled value="">
              Select week
            </option>
            {downloadDates.reverse().map((d) => (
              <option key={d.url} value={d.url}>
                {d.date}
              </option>
            ))}
          </select>
        </div>
      </div>
    );
  }
}

class Tiff extends Component {
  state = {
    _min: this.props.options.dataMin ? this.props.options.dataMin : 0,
    _max: this.props.options.dataMax ? this.props.options.dataMax : 0,
    dataMin: this.props.options.dataMin ? this.props.options.dataMin : 0,
    dataMax: this.props.options.dataMax ? this.props.options.dataMax : 0,
    style: false,
    updateDatepicker: false,
  };

  setMin = (event) => {
    this.setState({ _min: event.target.value });
  };

  setMax = (event) => {
    this.setState({ _max: event.target.value });
  };

  setDate = (event) => {
    var { id, updateOptions, options } = this.props;
    this.onMonthChange(event);
    options.date = event;
    options.updateDate = true;
    updateOptions(id, options);
  };

  updateMinMax = () => {
    var { id, updateOptions, options } = this.props;
    var { _min, _max } = this.state;
    if (options["min"] !== _min || options["max"] !== _max) {
      options["min"] = parseFloat(_min);
      options["max"] = parseFloat(_max);
      updateOptions(id, options);
    }
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

  setConvolve = (event) => {
    var { id, updateOptions, options } = this.props;
    var value = event.target.value;
    options["convolve"] = value;
    updateOptions(id, options);
  };

  setValidpixelexpression = (event) => {
    var { id, updateOptions, options } = this.props;
    options["validpixelexpression"] = !options.validpixelexpression;
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

  onMonthChange = (event) => {
    var { style } = this.state;
    while (style.sheet.cssRules.length > 0) {
      style.sheet.deleteRule(0);
    }
    this.props.addCssRules(event, style, this.props.options);
  };

  componentDidUpdate() {
    if (
      this.props.options.dataMin !== undefined &&
      (this.state.dataMin !== this.props.options.dataMin ||
        this.state.dataMax !== this.props.options.dataMax)
    ) {
      this.setState({
        _min: this.props.options.dataMin,
        _max: this.props.options.dataMax,
        dataMin: this.props.options.dataMin,
        dataMax: this.props.options.dataMax,
      });
    }
    if (this.state.updateDatepicker && "date" in this.props.options) {
      this.props.addCssRules(
        this.props.options.date,
        this.state.style,
        this.props.options
      );
      this.setState({ updateDatepicker: false });
    }
  }

  componentDidMount() {
    window.addEventListener("click", this.updateMinMax);
    document
      .getElementById("tiff_min")
      .addEventListener("keydown", this.enterMinMax);
    document
      .getElementById("tiff_max")
      .addEventListener("keydown", this.enterMinMax);
    var style = document.createElement("style");
    document.head.appendChild(style);
    if ("date" in this.props.options) {
      this.props.addCssRules(
        this.props.options.date,
        style,
        this.props.options
      );
      this.setState({ style });
    } else {
      this.setState({ style, updateDatepicker: true });
    }
  }

  componentWillUnmount() {
    window.removeEventListener("click", this.updateMinMax);
    document
      .getElementById("tiff_min")
      .removeEventListener("keydown", this.enterMinMax);
    document
      .getElementById("tiff_max")
      .removeEventListener("keydown", this.enterMinMax);
    var { style } = this.state;
    while (style.sheet.cssRules.length > 0) {
      style.sheet.deleteRule(0);
    }
  }

  render() {
    var { _min, _max } = this.state;
    var { language } = this.props;
    var {
      palette,
      paletteName,
      opacity,
      convolve,
      includeDates,
      date,
      validpixelexpression,
      url,
    } = this.props.options;
    const locale = {
      localize: {
        day: (n) => Translate.axis[language].shortDays[n],
        month: (n) => Translate.axis[language].months[n],
      },
      formatLong: {
        date: () => "dd/mm/yyyy",
      },
    };
    var ncUrl = false;
    if (url && url.includes("S3")) {
      let p = url.split("/");
      let f = p[p.length - 1].split("_");
      let n = `${f[0]}_${f[f.length - 3]}_${f[f.length - 2]}.nc`;
      p[p.length - 1] = n;
      ncUrl = p.join("/");
    }
    return (
      <div className="layer-settings">
        <div className="layer-section">{Translate.settings[language]}</div>
        <div className="setting">
          <div className="custom-css-datepicker">
            <DatePicker
              dateFormat="dd/MM/yyyy"
              locale={locale}
              inline={true}
              includeDates={includeDates}
              selected={date ? date : false}
              onChange={(update) => {
                this.setDate(update);
              }}
              onMonthChange={this.onMonthChange}
            />
          </div>
        </div>
        <div className="setting half">
          <div className="label">Min</div>
          <div>
            <input
              type="number"
              className="with-button"
              value={_min}
              step="0.1"
              onChange={this.setMin}
              id="tiff_min"
            />
            <button onClick={this.resetMin} className="reset">
              Reset
            </button>
          </div>
        </div>
        <div className="setting half">
          <div className="label">Max</div>
          <div>
            <input
              type="number"
              className="with-button"
              value={_max}
              step="0.1"
              onChange={this.setMax}
              id="tiff_max"
            />
            <button onClick={this.resetMax} className="reset">
              Reset
            </button>
          </div>
        </div>
        <div className="setting half">
          <div className="label">Opacity</div>
          <div className="value">{opacity}</div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={opacity}
            onChange={this.setOpacity}
          ></input>
        </div>
        <div className="setting half">
          <div className="label">Smoothing</div>
          <div className="value">{convolve}</div>
          <input
            type="range"
            min="0"
            max="5"
            step="1"
            value={convolve}
            onChange={this.setConvolve}
          ></input>
        </div>
        <div className="setting">
          <div className="label">Palette</div>
          <div className="value">{paletteName}</div>
          <ColorRamp onChange={this.setPalette} value={palette} />
        </div>
        <div className="setting half">
          Valid Pixel Expression
          <input
            type="checkbox"
            checked={
              validpixelexpression === undefined ? true : validpixelexpression
            }
            onChange={this.setValidpixelexpression}
          />
        </div>
        <div className="layer-section">{Translate.downloads[language]}</div>
        <div className="setting">
          <a href={url}>
            <button className="tiff">Image (.tif)</button>
          </a>
          {ncUrl && (
            <a href={ncUrl}>
              <button className="tiff">File (.nc)</button>
            </a>
          )}
        </div>
      </div>
    );
  }
}

class WMS extends Component {
  state = {
    style: false,
    updateDatepicker: false,
  };

  setGain = (event) => {
    var { id, updateOptions, options } = this.props;
    var value = event.target.value;
    options["gain"] = value;
    updateOptions(id, options);
  };

  setGamma = (event) => {
    var { id, updateOptions, options } = this.props;
    var value = event.target.value;
    options["gamma"] = value;
    updateOptions(id, options);
  };

  setDate = (event) => {
    var { id, updateOptions, options } = this.props;
    this.onMonthChange(event);
    options.date = event;
    options.updateDate = true;
    updateOptions(id, options);
  };

  onMonthChange = (event) => {
    var { style } = this.state;
    while (style.sheet.cssRules.length > 0) {
      style.sheet.deleteRule(0);
    }
    this.props.addCssRules(event, style, this.props.options);
  };

  componentDidUpdate() {
    if (this.state.updateDatepicker && "date" in this.props.options) {
      this.props.addCssRules(
        this.props.options.date,
        this.state.style,
        this.props.options
      );
      this.setState({ updateDatepicker: false });
    }
  }

  componentDidMount() {
    var style = document.createElement("style");
    document.head.appendChild(style);
    if ("date" in this.props.options) {
      this.props.addCssRules(
        this.props.options.date,
        style,
        this.props.options
      );
      this.setState({ style });
    } else {
      this.setState({ style, updateDatepicker: true });
    }
  }

  componentWillUnmount() {
    var { style } = this.state;
    while (style.sheet.cssRules.length > 0) {
      style.sheet.deleteRule(0);
    }
  }

  render() {
    var { language } = this.props;
    var { includeDates, date, gain, gamma } = this.props.options;
    const locale = {
      localize: {
        day: (n) => Translate.axis[language].shortDays[n],
        month: (n) => Translate.axis[language].months[n],
      },
      formatLong: {
        date: () => "dd/mm/yyyy",
      },
    };
    return (
      <div className="layer-settings">
        <div className="layer-section">{Translate.settings[language]}</div>
        <div className="setting">
          <div className="custom-css-datepicker">
            <DatePicker
              dateFormat="dd/MM/yyyy"
              locale={locale}
              inline={true}
              includeDates={includeDates}
              selected={date ? date : false}
              onChange={(update) => {
                this.setDate(update);
              }}
              onMonthChange={this.onMonthChange}
            />
          </div>
        </div>
        <div className="setting half">
          <div className="label">Gain</div>
          <div className="value">{gain}</div>
          <input
            type="range"
            min="0.5"
            max="3"
            step="0.1"
            value={gain}
            onChange={this.setGain}
          ></input>
        </div>
        <div className="setting half">
          <div className="label">Gamma</div>
          <div className="value">{gamma}</div>
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={gamma}
            onChange={this.setGamma}
          ></input>
        </div>
      </div>
    );
  }
}

class Transect extends Component {
  state = {};

  componentDidMount() {}

  componentWillUnmount() {}

  render() {
    return <div className="layer-settings"></div>;
  }
}

class Profile extends Component {
  state = {};

  componentDidMount() {}

  componentWillUnmount() {}

  render() {
    return <div className="layer-settings"></div>;
  }
}

class Particles extends Component {
  setPaths = (event) => {
    var { id, updateOptions, options } = this.props;
    var value = event.target.value;
    options["paths"] = value;
    updateOptions(id, options);
  };

  setSpread = (event) => {
    var { id, updateOptions, options } = this.props;
    var value = event.target.value;
    options["spread"] = 10 ** value;
    updateOptions(id, options);
  };

  setOpacity = (event) => {
    var { id, updateOptions, options } = this.props;
    var value = event.target.value;
    options["opacity"] = value;
    updateOptions(id, options);
  };

  removeParticles = () => {
    var { id, updateOptions, options } = this.props;
    options["remove"] = true;
    updateOptions(id, options);
  };

  render() {
    var { language } = this.props;
    var { paths, spread, opacity } = this.props.options;
    if (opacity === undefined) opacity = 1;
    return (
      <div className="layer-settings">
        <div className="layer-section">{Translate.settings[language]}</div>
        <div className="setting half">
          <div className="label">Particles</div>
          <div className="value">{paths}</div>
          <input
            type="range"
            min="0"
            max="50"
            step="5"
            value={paths}
            onChange={this.setPaths}
          ></input>
        </div>
        <div className="setting half">
          <div className="label">Spread</div>
          <div className="value">{Math.ceil(spread)}</div>
          <input
            type="range"
            min="0"
            max="4"
            step="0.1"
            value={Math.log10(spread)}
            onChange={this.setSpread}
          ></input>
        </div>
        <div className="setting">
          <div className="label">Opacity</div>
          <div className="value">{opacity}</div>
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
          <button className="remove" onClick={this.removeParticles}>
            Remove Particles
          </button>
        </div>
      </div>
    );
  }
}

class LayerSettings extends Component {
  addCssRules = (date, style, options) => {
    var { includeDates, percentage } = options;
    var month = date.getMonth();
    var rule, className;
    for (let i = 0; i < includeDates.length; i++) {
      let p = percentage[i];
      let day = includeDates[i].getDate();
      let element = [];
      if (includeDates[i].getMonth() === month) {
        className = `.custom-css-datepicker .react-datepicker__day--0${
          day < 10 ? "0" + day : day
        }:not(.react-datepicker__day--outside-month)`;
        rule = `${className} { background: linear-gradient(to right, green ${
          p - 15
        }%, transparent ${p + 15}%); }`;
        style.sheet.insertRule(rule, 0);
        element = document.querySelectorAll(className);
      } else if (
        includeDates[i].getMonth() === month - 1 &&
        includeDates[i].getDate() > 15
      ) {
        className = `.custom-css-datepicker .react-datepicker__day--0${
          day < 10 ? "0" + day : day
        }.react-datepicker__day--outside-month`;
        rule = `${className} { background: linear-gradient(to right, green ${
          p - 15
        }%, transparent ${p + 15}%); }`;
        style.sheet.insertRule(rule, 0);
        element = document.querySelectorAll(className);
      } else if (
        includeDates[i].getMonth() === month + 1 &&
        includeDates[i].getDate() < 15
      ) {
        className = `.custom-css-datepicker .react-datepicker__day--0${
          day < 10 ? "0" + day : day
        }.react-datepicker__day--outside-month`;
        rule = `${className} { background: linear-gradient(to right, green ${
          p - 15
        }%, transparent ${p + 15}%); }`;
        style.sheet.insertRule(rule, 0);
        element = document.querySelectorAll(className);
      }
      if (element.length > 0) {
        element[0].title = `${p}% pixel coverage`;
      }
    }
  };
  render() {
    var { layer, updateOptions, language, minDate, maxDate } = this.props;
    var type = layer.properties.display;
    if (type === "raster") {
      return (
        <Raster
          id={layer.id}
          options={layer.properties.options}
          updateOptions={updateOptions}
          language={language}
          minDate={minDate}
          maxDate={maxDate}
          layer={layer}
        />
      );
    } else if (type === "current") {
      return (
        <Current
          id={layer.id}
          options={layer.properties.options}
          updateOptions={updateOptions}
          language={language}
          minDate={minDate}
          maxDate={maxDate}
          layer={layer}
        />
      );
    } else if (type === "tiff") {
      return (
        <Tiff
          id={layer.id}
          options={layer.properties.options}
          updateOptions={updateOptions}
          language={language}
          addCssRules={this.addCssRules}
          layer={layer}
        />
      );
    } else if (type === "wms") {
      return (
        <WMS
          id={layer.id}
          options={layer.properties.options}
          updateOptions={updateOptions}
          language={language}
          addCssRules={this.addCssRules}
          layer={layer}
        />
      );
    } else if (type === "transect") {
      return (
        <Transect
          id={layer.id}
          options={layer.properties.options}
          updateOptions={updateOptions}
          language={language}
          minDate={minDate}
          maxDate={maxDate}
          layer={layer}
        />
      );
    } else if (type === "profile") {
      return (
        <Profile
          id={layer.id}
          options={layer.properties.options}
          updateOptions={updateOptions}
          language={language}
          minDate={minDate}
          maxDate={maxDate}
          layer={layer}
        />
      );
    } else if (type === "particles") {
      return (
        <Particles
          id={layer.id}
          options={layer.properties.options}
          updateOptions={updateOptions}
          language={language}
          minDate={minDate}
          maxDate={maxDate}
          layer={layer}
        />
      );
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
