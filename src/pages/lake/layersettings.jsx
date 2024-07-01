import React, { Component } from "react";
import DatePicker from "react-datepicker";
import ColorRamp from "../../components/colors/colorramp";
import Translate from "../../translations.json";
import CONFIG from "../../config.json";
import {
  formatAPIDate,
  formatDateLong,
  formatDateTime,
  parseDay,
  closestValue,
  formatSencastDay,
} from "./functions";
import "react-datepicker/dist/react-datepicker.css";
import "./lake.css";
import refreshIcon from "../../img/refresh.png";

class Depth extends Component {
  state = {
    depth: 0,
    depths: [],
    step: 0.1,
    min: 0,
    max: 1,
  };
  updateDepth = (event) => {
    var { depths } = this.props;
    var depth = closestValue(parseFloat(event.target.value), depths);
    this.setState({ depth });
  };
  setDepth = () => {
    var { onChange } = this.props;
    var { depth } = this.state;
    onChange(depth);
  };
  componentDidMount() {
    var { depth, depths } = this.props;
    if (depths && depths.length > 0) {
      var min = Math.min(...depths);
      var max = Math.max(...depths);
      this.setState({ depth, min, max, depths });
    } else {
      this.setState({ depth });
    }
  }
  componentDidUpdate() {
    var { depths } = this.props;
    if (depths && this.state.depths.length !== depths.length) {
      var min = Math.min(...depths);
      var max = Math.max(...depths);
      this.setState({ min, max, depths });
    }
  }
  render() {
    var { depth, step, min, max, depths } = this.state;
    return (
      <React.Fragment>
        <div className="setting twothird">
          <div className="label">Depth (m)</div>
          <div className="value">
            <select
              value={depth}
              onChange={this.updateDepth}
              className="subtle"
            >
              {depths.map((d) => (
                <option value={d} key={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={depth}
            onChange={this.updateDepth}
          ></input>
        </div>
        <div className="setting third">
          <button className="set" onClick={this.setDepth}>
            Set depth
          </button>
        </div>
      </React.Fragment>
    );
  }
}

class Period extends Component {
  state = {
    period: this.props.period,
    maxPeriod: this.props.maxPeriod ? this.props.maxPeriod : 21,
    maxPeriodDate: false,
  };
  addDays = (date, days) => {
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  };
  setDateRange = (period) => {
    var { maxPeriod } = this.state;
    var { setPeriod, maxDate } = this.props;
    if (period[0] !== null && period[1] !== null) {
      setPeriod([
        Math.floor(period[0].getTime()),
        Math.floor(period[1].getTime() + 86400000),
      ]);
      this.setState({ period, maxPeriodDate: false });
    } else if (period[0] !== null && period[1] === null) {
      var maxPeriodDate = this.addDays(period[0], maxPeriod);
      this.setState({
        period,
        maxPeriodDate: maxPeriodDate < maxDate ? maxPeriodDate : maxDate,
      });
    }
  };
  render() {
    var { language, minDate, maxDate, missingDates } = this.props;
    missingDates = missingDates ? missingDates : [];
    var { period, maxPeriodDate } = this.state;
    const locale = {
      localize: {
        day: (n) => Translate.axis[language].shortDays[n],
        month: (n) => Translate.axis[language].months[n],
      },
      formatLong: {
        date: () => "dd/mm/yyyy",
      },
    };
    var excludeDateIntervals = missingDates.map((m) => {
      return {
        start: parseDay(m[0].replaceAll("-", "")),
        end: parseDay(m[1].replaceAll("-", "")),
      };
    });
    return (
      <DatePicker
        selectsRange={true}
        startDate={period[0]}
        endDate={period[1]}
        onChange={(update) => {
          this.setDateRange(update);
        }}
        excludeDateIntervals={excludeDateIntervals}
        minDate={minDate}
        maxDate={maxPeriodDate ? maxPeriodDate : maxDate}
        dateFormat="dd/MM/yyyy"
        locale={locale}
      />
    );
  }
}

class Raster extends Component {
  state = {
    id: Math.round(Math.random() * 100000),
    _min:
      this.props.options.dataMin === undefined
        ? ""
        : this.props.options.dataMin,
    _max:
      this.props.options.dataMax === undefined
        ? ""
        : this.props.options.dataMax,
    dataMin:
      this.props.options.dataMin === undefined
        ? false
        : this.props.options.dataMin,
    dataMax:
      this.props.options.dataMax === undefined
        ? false
        : this.props.options.dataMax,
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
    if (options.min !== _min || options.max !== _max) {
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

  setLabels = () => {
    var { id, updateOptions, options } = this.props;
    options["labels"] = !options["labels"];
    updateOptions(id, options);
  };

  setPalette = (event) => {
    var { id, updateOptions, options } = this.props;
    options["paletteName"] = event.name;
    options["palette"] = event.palette;
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

  resetMin = () => {
    this.setState({ _min: this.props.options.dataMin }, () =>
      this.updateMinMax()
    );
  };

  resetMax = () => {
    this.setState({ _max: this.props.options.dataMax }, () =>
      this.updateMinMax()
    );
  };

  componentDidUpdate() {
    if (
      (this.state.dataMin !== this.props.options.dataMin ||
        this.state.dataMax !== this.props.options.dataMax) &&
      this.props.options.dataMin !== undefined &&
      this.props.options.dataMax !== undefined
    ) {
      this.setState({
        _min: this.props.options.dataMin,
        _max: this.props.options.dataMax,
        dataMin: this.props.options.dataMin,
        dataMax: this.props.options.dataMax,
      });
    }
  }

  render() {
    var { _min, _max, id } = this.state;
    var { language, layer, period, setPeriod, depth, setDepth } = this.props;
    var { palette, paletteName, opacity, labels } = this.props.options;
    var { depths, missingDates, minDate, maxDate, model } =
      layer.sources[layer.source];
    if (opacity === undefined) opacity = 1;
    var downloadDates = this.downloadDates(
      model,
      layer.lake,
      minDate,
      maxDate,
      Translate.axis[language].months
    );
    return (
      <div className="layer-settings">
        <div className="setting">
          <div className="label">Period</div>
          <div className="period-selector">
            <Period
              period={period}
              setPeriod={setPeriod}
              language={language}
              minDate={minDate}
              maxDate={maxDate}
              missingDates={missingDates}
            />
          </div>
        </div>
        <Depth depth={depth} depths={depths} onChange={setDepth} />
        <div className="setting half">
          <div className="label">Min</div>
          <div className="minmax">
            <input
              type="number"
              className="with-button"
              value={_min}
              step="0.1"
              onChange={this.setMin}
              onBlur={this.updateMinMax}
              onKeyDown={this.enterMinMax}
              id={"raster_min_" + id}
            />
            <img
              src={refreshIcon}
              alt="Reset"
              onClick={this.resetMin}
              className="reset"
              title="Reset"
            />
          </div>
        </div>
        <div className="setting half">
          <div className="label">Max</div>
          <div className="minmax">
            <input
              type="number"
              className="with-button"
              value={_max}
              step="0.1"
              onChange={this.setMax}
              onBlur={this.updateMinMax}
              onKeyDown={this.enterMinMax}
              id={"raster_max_" + id}
            />
            <img
              src={refreshIcon}
              alt="Reset"
              onClick={this.resetMax}
              className="reset"
              title="Reset"
            />
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
        {layer.labels && (
          <div className="setting half">
            <div className="label">Labels</div>
            <label className="switch">
              <input
                type="checkbox"
                checked={labels}
                onChange={this.setLabels}
              ></input>
              <span className="slider round"></span>
            </label>
          </div>
        )}
        <div className="setting">
          <div className="label">Palette</div>
          <div className="value">{paletteName}</div>
          <ColorRamp onChange={this.setPalette} value={palette} />
        </div>
        <div className="setting">
          <div className="label">Download</div>
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
    id: Math.round(Math.random() * 100000),
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
    var { id } = this.state;
    window.addEventListener("click", this.updatePaths);
    document
      .getElementById("streamlines_paths_" + id)
      .addEventListener("keydown", this.enterPaths);
  }

  componentWillUnmount() {
    var { id } = this.state;
    window.removeEventListener("click", this.updatePaths);
    document
      .getElementById("streamlines_paths_" + id)
      .removeEventListener("keydown", this.enterPaths);
  }

  render() {
    var { _paths, id } = this.state;
    var { language, period, setPeriod, depth, setDepth, layer } = this.props;
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
    var { depths, missingDates, minDate, maxDate, model } =
      layer.sources[layer.source];
    depths = depths ? depths : [];
    missingDates = missingDates ? missingDates : [];
    var downloadDates = this.downloadDates(
      model,
      layer.lake,
      minDate,
      maxDate,
      Translate.axis[language].months
    );
    return (
      <div className="layer-settings">
        <div className="setting">
          <div className="label">Period</div>
          <div className="period-selector">
            <Period
              period={period}
              setPeriod={setPeriod}
              language={language}
              minDate={minDate}
              maxDate={maxDate}
              missingDates={missingDates}
            />
          </div>
        </div>
        <Depth depth={depth} depths={depths} onChange={setDepth} />
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
            id={"streamlines_paths_" + id}
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
          <div className="label">Download</div>
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
    id: "tiff_" + Math.round(Math.random() * 100000),
    _min: this.props.options.dataMin ? this.props.options.dataMin : 0,
    _max: this.props.options.dataMax ? this.props.options.dataMax : 0,
    dataMin: this.props.options.dataMin ? this.props.options.dataMin : 0,
    dataMax: this.props.options.dataMax ? this.props.options.dataMax : 0,
    firstLoad: true,
  };

  setMin = (event) => {
    this.setState({ _min: event.target.value });
  };

  setMax = (event) => {
    this.setState({ _max: event.target.value });
  };

  setDate = (event) => {
    var { id, updateOptions, options } = this.props;
    var date = options.availableImages[formatSencastDay(event)];
    var image = date.images.filter((i) => i.percent === date.max_percent)[0];
    options.image = image;
    updateOptions(id, options);
    setTimeout(() => this.onMonthChange(image.time), 100);
  };

  setImage = (event) => {
    var { id, updateOptions, options } = this.props;
    var date = options.availableImages[formatSencastDay(event)];
    var image = date.images.filter((i) => i.time === event)[0];
    options.image = image;
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

  setWms = () => {
    var { id, updateOptions, options } = this.props;
    options["wms"] = !options["wms"];
    updateOptions(id, options);
  };

  setOpacity = (event) => {
    var { id, updateOptions, options } = this.props;
    var value = event.target.value;
    options["opacity"] = value;
    updateOptions(id, options);
  };

  setCoverage = (event) => {
    var { id, updateOptions, options } = this.props;
    var value = event.target.value;
    options["coverage"] = value;
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
    this.setState({ _min: this.props.options.dataMin }, () =>
      this.updateMinMax()
    );
  };

  resetMax = () => {
    this.setState({ _max: this.props.options.dataMax }, () =>
      this.updateMinMax()
    );
  };

  onMonthChange = (event) => {
    var { availableImages } = this.props.options;
    this.addCssRules(event, availableImages);
  };

  isSameDay = (date1, date2) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  formatDateToCustomString = (date) => {
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Month is 0-based
    const year = date.getFullYear();
    return `${hours}:${minutes} ${day}-${month}-${year}`;
  };

  addDays = (inputDate, daysToAdd) => {
    if (!(inputDate instanceof Date)) {
      throw new Error("Input must be a Date object");
    }
    const timestamp = inputDate.getTime() + daysToAdd * 24 * 60 * 60 * 1000;
    const resultDate = new Date(timestamp);
    return resultDate;
  };
  addOneMonth = (inputDate) => {
    if (!(inputDate instanceof Date)) {
      throw new Error("Input must be a Date object");
    }
    const currentMonth = inputDate.getMonth();
    const currentYear = inputDate.getFullYear();
    const nextMonth = (currentMonth + 1) % 12;
    const nextYear = nextMonth === 0 ? currentYear + 1 : currentYear;
    const resultDate = new Date(nextYear, nextMonth, inputDate.getDate());
    return resultDate;
  };

  netcdfUrl = (url) => {
    var ncUrl = false;
    if (url.includes("S3")) {
      let p = url.split("/");
      let f = p[p.length - 1].split("_");
      let n = `${f[0]}_${f[f.length - 3]}_${f[f.length - 2]}.nc`;
      p[p.length - 1] = n;
      ncUrl = p.join("/");
    }
    return ncUrl;
  };

  addCssRules = (date, available) => {
    var { id } = this.state;
    var start = new Date(date.getFullYear(), date.getMonth(), 1);
    var end = this.addOneMonth(start);
    var preStart = this.addDays(start, -7);
    var postEnd = this.addDays(end, 7);
    var numberOfDays = Math.ceil(
      Math.abs(postEnd.getTime() - preStart.getTime()) / (1000 * 3600 * 24)
    );
    for (var i = 0; i <= numberOfDays; i++) {
      let time = this.addDays(preStart, i);
      let key = formatSencastDay(time);
      if (key in available) {
        let element = [];
        let day = time.getDate();
        let p = available[key].max_percent;
        let obs = available[key].images.length;
        var className;
        if (time >= start && time <= end) {
          className = `.setting.${id} .custom-css-datepicker .react-datepicker__day--0${
            day < 10 ? "0" + day : day
          }:not(.react-datepicker__day--outside-month)`;
          element = document.querySelectorAll(className);
        } else if (time < start) {
          className = `.setting.${id} .custom-css-datepicker .react-datepicker__day--0${
            day < 10 ? "0" + day : day
          }.react-datepicker__day--outside-month`;
          element = document.querySelectorAll(className);
        } else if (time > end) {
          className = `.setting.${id} .custom-css-datepicker .react-datepicker__day--0${
            day < 10 ? "0" + day : day
          }.react-datepicker__day--outside-month`;
          element = document.querySelectorAll(className);
        }
        if (element.length > 0) {
          if (element[0].querySelector("div") === null) {
            let deg = Math.ceil((p / 100) * 180) + 180;
            element[0].title = `${p}% lake coverage (${obs} images available)`;
            if (obs > 0) {
              element[0].innerHTML = `<div class="percentage" style="background: conic-gradient(transparent 180deg, var(--highlight-color) 180deg ${deg}deg, transparent ${deg}deg 360deg);"></div></div><div class="observations">${obs}</div><div class="date">${day}</div>`;
            } else {
              element[0].innerHTML = `<div class="percentage" style="background: conic-gradient(transparent 180deg, var(--highlight-color) 180deg ${deg}deg, transparent ${deg}deg 360deg);"></div></div><div class="date">${day}</div>`;
            }
          }
        }
      }
    }
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
    if (
      this.props.active &&
      this.state.firstLoad &&
      this.props.options.availableImages
    ) {
      this.addCssRules(
        this.props.options.image.time,
        this.props.options.availableImages
      );
      this.setState({ firstLoad: false });
    }
  }

  render() {
    var { _min, _max, id } = this.state;
    var { language } = this.props;
    var {
      palette,
      paletteName,
      opacity,
      convolve,
      includeDates,
      validpixelexpression,
      image,
      coverage,
      availableImages,
      wms,
    } = this.props.options;
    var { unit } = this.props.layer;
    const locale = {
      localize: {
        day: (n) => Translate.axis[language].shortDays[n],
        month: (n) => Translate.axis[language].months[n],
      },
      formatLong: {
        date: () => "dd/mm/yyyy",
      },
    };
    var months = Translate.axis[language].months;
    includeDates = includeDates ? includeDates : [];
    var images = [];
    if (availableImages && image) {
      let day = formatSencastDay(image.time);
      if (day in availableImages) images = availableImages[day].images;
    }

    return (
      <div className="layer-settings">
        <div className={"setting " + id}>
          <div className="custom-css-datepicker">
            <DatePicker
              dateFormat="dd/MM/yyyy"
              locale={locale}
              inline={true}
              includeDates={includeDates}
              selected={image ? image.time : false}
              onChange={(update) => {
                this.setDate(update);
              }}
              onMonthChange={this.onMonthChange}
            />
          </div>
          <div className="images">
            {images.map((i) => {
              var ncUrl = this.netcdfUrl(i.url);
              return (
                <div
                  className={i.url === image.url ? "image selected" : "image"}
                  key={i.url}
                  onClick={() => this.setImage(i.time)}
                >
                  <div className="right-buttons">
                    <div className="button">
                      {i.url === image.url ? "Selected" : "Select"}
                    </div>
                  </div>
                  <div className="left">
                    <div className="sat">{i.satellite}</div>
                    <div className="res">
                      {i.satellite.includes("S3") ? 300 : 20}m
                    </div>
                  </div>
                  <div className="right">
                    <div>{formatDateTime(i.time, months)}</div>
                    <div>
                      {`${i.percent}% coverage`} |{" "}
                      {`${Math.round(i.ave * 10) / 10} ${unit}`}
                    </div>
                  </div>
                  <div className="under">
                    <a href={i.url} title="Download image as GeoTIFF">
                      <button className="tiff">GeoTIFF</button>
                    </a>
                    {ncUrl && (
                      <a href={ncUrl} title="Download image as NetCDF">
                        <button className="tiff">netCDF4</button>
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="setting half">
          <div className="label">Min</div>
          <div className="minmax">
            <input
              type="number"
              className="with-button"
              value={_min}
              step="0.1"
              onChange={this.setMin}
              onBlur={this.updateMinMax}
              onKeyDown={this.enterMinMax}
              id={"tiff_min_" + id}
            />
            <img
              src={refreshIcon}
              alt="Reset"
              onClick={this.resetMin}
              className="reset"
              title="Reset"
            />
          </div>
        </div>
        <div className="setting half">
          <div className="label">Max</div>
          <div className="minmax">
            <input
              type="number"
              className="with-button"
              value={_max}
              step="0.1"
              onChange={this.setMax}
              onBlur={this.updateMinMax}
              onKeyDown={this.enterMinMax}
              id={"tiff_max_" + id}
            />
            <img
              src={refreshIcon}
              alt="Reset"
              onClick={this.resetMax}
              className="reset"
              title="Reset"
            />
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
        <div className="setting half">
          <div className="label">Min Coverage</div>
          <div className="value">{coverage} %</div>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={coverage}
            onChange={this.setCoverage}
          ></input>
        </div>
        <div className="setting half">
          <div className="label">Imagery</div>
          <label className="switch">
            <input type="checkbox" checked={wms} onChange={this.setWms}></input>
            <span className="slider round"></span>
          </label>
        </div>
        <div className="setting">
          <div className="label">Palette</div>
          <div className="value">{paletteName}</div>
          <ColorRamp onChange={this.setPalette} value={palette} />
        </div>
        <div className="setting">
          Valid Pixel Expression
          <input
            type="checkbox"
            checked={
              validpixelexpression === undefined ? true : validpixelexpression
            }
            onChange={this.setValidpixelexpression}
          />
        </div>
      </div>
    );
  }
}

class Transect extends Component {
  setPalette = (event) => {
    var { id, updateOptions, options } = this.props;
    options["paletteName"] = event.name;
    options["palette"] = event.palette;
    updateOptions(id, options);
  };

  render() {
    var { palette, paletteName } = this.props.options;
    return (
      <div className="layer-settings">
        <div className="setting">
          <div className="label">Palette</div>
          <div className="value">{paletteName}</div>
          <ColorRamp onChange={this.setPalette} value={palette} />
        </div>
      </div>
    );
  }
}

class Profile extends Component {
  setPalette = (event) => {
    var { id, updateOptions, options } = this.props;
    options["paletteName"] = event.name;
    options["palette"] = event.palette;
    updateOptions(id, options);
  };

  render() {
    var { palette, paletteName } = this.props.options;
    return (
      <div className="layer-settings">
        <div className="setting">
          <div className="label">Palette</div>
          <div className="value">{paletteName}</div>
          <ColorRamp onChange={this.setPalette} value={palette} />
        </div>
      </div>
    );
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
    var { language, depth, setDepth, layer, period, setPeriod } = this.props;
    var { paths, spread, opacity } = this.props.options;
    var { depths, missingDates, minDate, maxDate } =
      layer.sources[layer.source];
    depths = depths ? depths : [];
    opacity = opacity ? opacity : 1;
    missingDates = missingDates ? missingDates : [];
    return (
      <div className="layer-settings">
        <div className="setting">
          <div className="label">Period</div>
          <div className="period-selector">
            <Period
              period={period}
              setPeriod={setPeriod}
              language={language}
              minDate={minDate}
              maxDate={maxDate}
              missingDates={missingDates}
            />
          </div>
        </div>
        <Depth depth={depth} depths={depths} onChange={setDepth} />
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
        <div className="setting">
          <button className="remove" onClick={this.removeParticles}>
            Remove Particles
          </button>
        </div>
      </div>
    );
  }
}

class Heat extends Component {
  state = {
    id: Math.round(Math.random() * 100000),
  };

  setPalette = (event) => {
    var { id, updateOptions, options } = this.props;
    options["paletteName"] = event.name;
    options["palette"] = event.palette;
    updateOptions(id, options);
  };

  setPeriod = (period) => {
    var { id, updateOptions, options } = this.props;
    options["period"] = period;
    options["updatePeriod"] = true;
    updateOptions(id, options);
  };

  setSource = (event) => {
    var { layer, updateSource } = this.props;
    var source = event.target.value;
    if (layer.source !== source) {
      updateSource(layer.id, source);
    }
  };

  render() {
    var { language, layer } = this.props;
    var { palette, paletteName, period, minDate, maxDate } = this.props.options;
    return (
      <div className="layer-settings">
        <div className="setting">
          <div className="label">Simulation</div>
          <select value={layer.source} onChange={this.setSource}>
            {Object.keys(layer.sources).map((s) => (
              <option value={s} key={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        {period && (
          <div className="setting">
            <div className="label">Period</div>
            <div className="period-selector">
              <Period
                period={period}
                setPeriod={this.setPeriod}
                language={language}
                minDate={minDate}
                maxDate={maxDate}
                maxPeriod={365}
              />
            </div>
          </div>
        )}
        <div className="setting">
          <div className="label">Palette</div>
          <div className="value">{paletteName}</div>
          <ColorRamp onChange={this.setPalette} value={palette} />
        </div>
      </div>
    );
  }
}

class Line extends Component {
  state = {
    id: Math.round(Math.random() * 100000),
  };

  setPeriod = (period) => {
    var { id, updateOptions, options } = this.props;
    options["period"] = period;
    options["update"] = true;
    updateOptions(id, options);
  };

  setDepth = (depth) => {
    var { id, updateOptions, options } = this.props;
    options["depth"] = depth;
    options["update"] = true;
    updateOptions(id, options);
  };

  setSource = (event) => {
    var { layer, updateSource } = this.props;
    var source = event.target.value;
    if (layer.source !== source) {
      updateSource(layer.id, source);
    }
  };

  render() {
    var { language, layer } = this.props;
    var { period, minDate, maxDate, depth, depths } = this.props.options;
    return (
      <div className="layer-settings">
        <div className="setting">
          <div className="label">Simulation</div>
          <select value={layer.source} onChange={this.setSource}>
            {Object.keys(layer.sources).map((s) => (
              <option value={s} key={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        {period && (
          <div className="setting">
            <div className="label">Period</div>
            <div className="period-selector">
              <Period
                period={period}
                setPeriod={this.setPeriod}
                language={language}
                minDate={minDate}
                maxDate={maxDate}
                maxPeriod={365}
              />
            </div>
          </div>
        )}
        {depth && (
          <Depth depth={depth} depths={depths} onChange={this.setDepth} />
        )}
      </div>
    );
  }
}

class Doy extends Component {
  state = {
    id: Math.round(Math.random() * 100000),
  };

  setSource = (event) => {
    var { layer, updateSource } = this.props;
    var source = event.target.value;
    if (layer.source !== source) {
      updateSource(layer.id, source);
    }
  };

  render() {
    var { layer } = this.props;
    return (
      <div className="layer-settings">
        <div className="setting">
          <div className="label">Simulation</div>
          <select value={layer.source} onChange={this.setSource}>
            {Object.keys(layer.sources).map((s) => (
              <option value={s} key={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>
    );
  }
}

class LayerSettings extends Component {
  render() {
    var { layer } = this.props;
    var type = layer.display;
    if (type === "raster") {
      return (
        <Raster id={layer.id} options={layer.displayOptions} {...this.props} />
      );
    } else if (type === "current") {
      return (
        <Current id={layer.id} options={layer.displayOptions} {...this.props} />
      );
    } else if (type === "tiff") {
      return (
        <Tiff id={layer.id} options={layer.displayOptions} {...this.props} />
      );
    } else if (type === "transect") {
      return (
        <Transect
          id={layer.id}
          options={layer.displayOptions}
          {...this.props}
        />
      );
    } else if (type === "profile") {
      return (
        <Profile id={layer.id} options={layer.displayOptions} {...this.props} />
      );
    } else if (type === "particles") {
      return (
        <Particles
          id={layer.id}
          options={layer.displayOptions}
          {...this.props}
        />
      );
    } else if (type === "heat") {
      return (
        <Heat id={layer.id} options={layer.displayOptions} {...this.props} />
      );
    } else if (type === "line") {
      return (
        <Line id={layer.id} options={layer.displayOptions} {...this.props} />
      );
    } else if (type === "doy") {
      return (
        <Doy id={layer.id} options={layer.displayOptions} {...this.props} />
      );
    }else {
      return <div className="layer-settings"></div>;
    }
  }
}

export default LayerSettings;
