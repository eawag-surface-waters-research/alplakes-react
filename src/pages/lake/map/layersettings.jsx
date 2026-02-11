import React, { Component } from "react";
import DatePicker from "react-datepicker";
import ColorRamp from "../../../components/colors/colorramp";
import refreshIcon from "../../../img/refresh.png";
import Translations from "../../../translations.json";
import CONFIG from "../../../config.json";
import {
  filterImages,
  formatAPIDate,
  formatDateLong,
  formatDateTime,
  formatSencastDay,
} from "../functions/general";
import "react-datepicker/dist/react-datepicker.css";
import "./map.css";
import Period from "../../../components/customselect/period";
import Depth from "../../../components/customselect/depth";
import Color from "../../../components/customselect/color";
import ToggleBox from "../../../components/togglebox/togglebox";

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
      updateOptions(id, "raster", options);
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
    updateOptions(id, "raster", options);
  };

  setPalette = (event) => {
    var { id, updateOptions, options } = this.props;
    options["paletteName"] = event.name;
    options["palette"] = event.palette;
    updateOptions(id, "raster", options);
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
          targetDate,
        )}?${model}_${lake}_${formatAPIDate(targetDate)}.nc`,
        date: formatDateLong(targetDate, months),
      });
      targetDate.setDate(targetDate.getDate() + 7);
    }
    return dates;
  };

  resetMin = () => {
    this.setState({ _min: this.props.options.dataMin }, () =>
      this.updateMinMax(),
    );
  };

  resetMax = () => {
    this.setState({ _max: this.props.options.dataMax }, () =>
      this.updateMinMax(),
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
    var { language, layer, period, setPeriod, depth, setDepth, setModel } =
      this.props;
    var { paletteName, opacity } = this.props.options;
    var { model, key } = layer.sources[layer.source];
    var depths = [];
    var missingDates = [];
    var start_date = new Date();
    var end_date = new Date();
    end_date.setDate(start_date.getDate() - 7);
    if ("metadata" in layer.sources[layer.source]) {
      ({
        depth: depths,
        missingDates,
        start_date,
        end_date,
      } = layer.sources[layer.source].metadata);
    }

    if (opacity === undefined) opacity = 1;
    var downloadDates = this.downloadDates(
      model,
      key,
      start_date,
      end_date,
      Translations.axis[language].months,
    );
    return (
      <div className="layer-settings">
        <div className="setting half">
          <div className="label">{Translations.model[language]}</div>
          <select
            value={layer["source"]}
            onChange={(event) => setModel(event, layer.id)}
          >
            {Object.entries(layer["sources"]).map(([key, value]) => (
              <option key={key} value={key}>
                {value.name}
              </option>
            ))}
          </select>
        </div>
        <div className="setting half">
          <div className="label">{Translations.source[language]}</div>
          <div>
            <a
              href="https://www.eawag.ch"
              alt="Eawag"
              target="_blank"
              rel="noopener noreferrer"
            >
              Eawag
            </a>
          </div>
        </div>
        <div className="setting">
          <div className="label">{Translations.period[language]}</div>
          <div className="period-selector">
            <Period
              period={period}
              setPeriod={setPeriod}
              language={language}
              minDate={start_date}
              maxDate={end_date}
              missingDates={missingDates}
            />
          </div>
        </div>
        <Depth
          depth={depth}
          depths={depths}
          onChange={setDepth}
          language={language}
        />
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
        <div className="setting">
          <div className="label">{Translations.opacity[language]}</div>
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
          <ColorRamp onChange={this.setPalette} value={paletteName} />
        </div>
        <div className="setting">
          <div className="label">{Translations.download[language]}</div>
          <select defaultValue="" onChange={this.downloadFile}>
            <option disabled value="">
              {Translations.selectWeek[language]}
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
    updateOptions(id, "raster", options);
  };

  setStreamlinesColor = (event) => {
    var { id, updateOptions, options } = this.props;
    var value = event.target.value;
    options["streamlinesColor"] = value;
    updateOptions(id, "streamlines", options);
  };

  setArrowsColor = (event) => {
    var { id, updateOptions, options } = this.props;
    var value = event.target.value;
    options["arrowsColor"] = value;
    updateOptions(id, "vector", options);
  };

  toggleDisplay = (type) => {
    var { id, updateOptions, options } = this.props;
    options[type] = !options[type];
    updateOptions(id, type, options);
  };

  setPaths = (event) => {
    this.setState({ _paths: event.target.value });
  };

  updatePaths = () => {
    var { id, updateOptions, options } = this.props;
    var { _paths } = this.state;
    if (parseInt(_paths) !== options.paths) {
      options["paths"] = parseInt(_paths);
      updateOptions(id, "streamlines", options);
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
          targetDate,
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
    updateOptions(id, "raster", options);
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
    updateOptions(id, "streamlines", options);
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
    var { language, period, setPeriod, depth, setDepth, setModel, layer } =
      this.props;
    var {
      opacity,
      velocityScale,
      paletteName,
      vector,
      streamlines,
      raster,
      arrowsColor,
      streamlinesColor,
    } = this.props.options;
    var { model, key } = layer.sources[layer.source];
    var depths = [];
    var missingDates = [];
    var start_date = new Date();
    var end_date = new Date();
    end_date.setDate(start_date.getDate() - 7);
    if ("metadata" in layer.sources[layer.source]) {
      ({
        depth: depths,
        missingDates,
        start_date,
        end_date,
      } = layer.sources[layer.source].metadata);
    }

    var downloadDates = this.downloadDates(
      model,
      key,
      start_date,
      end_date,
      Translations.axis[language].months,
    );
    return (
      <div className="layer-settings">
        <div className="setting half">
          <div className="label">{Translations.model[language]}</div>
          <select
            value={layer["source"]}
            onChange={(event) => setModel(event, layer.id)}
          >
            {Object.entries(layer["sources"]).map(([key, value]) => (
              <option key={key} value={key}>
                {value.name}
              </option>
            ))}
          </select>
        </div>
        <div className="setting half">
          <div className="label">{Translations.source[language]}</div>
          <div>
            <a
              href="https://www.eawag.ch"
              alt="Eawag"
              target="_blank"
              rel="noopener noreferrer"
            >
              Eawag
            </a>
          </div>
        </div>
        <div className="setting">
          <div className="label">{Translations.period[language]}</div>
          <div className="period-selector">
            <Period
              period={period}
              setPeriod={setPeriod}
              language={language}
              minDate={start_date}
              maxDate={end_date}
              missingDates={missingDates}
            />
          </div>
        </div>
        <Depth
          depth={depth}
          depths={depths}
          onChange={setDepth}
          language={language}
        />
        <ToggleBox
          open={vector}
          title={Translations.arrows[language]}
          set="vector"
          toggleDisplay={this.toggleDisplay}
          content={
            <div className="setting half">
              <div className="label">{Translations.color[language]}</div>
              <Color value={arrowsColor} onChange={this.setArrowsColor} />
            </div>
          }
        />
        <ToggleBox
          open={streamlines}
          title={Translations.streamlines[language]}
          set="streamlines"
          toggleDisplay={this.toggleDisplay}
          content={
            <React.Fragment>
              <div className="setting half">
                <div className="label">{Translations.paths[language]}</div>
                <input
                  type="number"
                  value={_paths}
                  onChange={this.setPaths}
                  step="100"
                  id={"streamlines_paths_" + id}
                />
              </div>
              <div className="setting half">
                <div className="label">{Translations.color[language]}</div>
                <Color
                  value={streamlinesColor}
                  onChange={this.setStreamlinesColor}
                />
              </div>
              <div className="setting">
                <div className="label">{Translations.speed[language]}</div>
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
            </React.Fragment>
          }
        />
        <ToggleBox
          open={raster}
          title={Translations.raster[language]}
          set="raster"
          toggleDisplay={this.toggleDisplay}
          content={
            <React.Fragment>
              <div className="setting">
                <div className="label">Palette</div>
                <div className="value">{paletteName}</div>
                <ColorRamp onChange={this.setPalette} value={paletteName} />
              </div>
              <div className="setting">
                <div className="label">{Translations.opacity[language]}</div>
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
            </React.Fragment>
          }
        />
        <div className="setting">
          <div className="label">{Translations.download[language]}</div>
          <select defaultValue="" onChange={this.downloadFile}>
            <option disabled value="">
              {Translations.selectWeek[language]}
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
    var { id, updateOptions, options, layer } = this.props;
    var { available } = layer.sources[layer.source].metadata;
    var date = available[formatSencastDay(event)];
    var image = date.images.filter((i) => i.percent === date.max_percent)[0];
    layer.sources[layer.source].metadata.image = image;
    options.url = image.url;
    options.time = image.time;
    updateOptions(id, "tiff", options);
    setTimeout(() => this.onMonthChange(image.time), 100);
  };

  setImage = (event) => {
    var { id, updateOptions, options, layer } = this.props;
    var { available } = layer.sources[layer.source].metadata;
    var date = available[formatSencastDay(event)];
    var image = date.images.filter((i) => i.time === event)[0];
    layer.sources[layer.source].metadata.image = image;
    options.url = image.url;
    options.time = image.time;
    updateOptions(id, "tiff", options);
  };

  updateMinMax = () => {
    var { id, updateOptions, options } = this.props;
    var { _min, _max } = this.state;
    if (options["min"] !== _min || options["max"] !== _max) {
      options["min"] = parseFloat(_min);
      options["max"] = parseFloat(_max);
      updateOptions(id, "tiff", options);
    }
  };

  enterMinMax = (event) => {
    if (event.key === "Enter") {
      this.updateMinMax();
    }
  };

  setWms = () => {
    var { id, updateOptions, options, layer } = this.props;
    var image = layer.sources[layer.source].metadata.image;
    options["wms"] = !options["wms"];
    options["time"] = image.time;
    options["url"] = image.url;
    updateOptions(id, "wms", options);
  };

  setOpacity = (event) => {
    var { id, updateOptions, options } = this.props;
    var value = event.target.value;
    options["opacity"] = value;
    updateOptions(id, "tiff", options);
  };

  setCoverage = (event) => {
    var { id, updateOptions, options } = this.props;
    var value = event.target.value;
    options["coverage"] = value;
    updateOptions(id, "tiff", options);
  };

  setConvolve = (event) => {
    var { id, updateOptions, options } = this.props;
    var value = event.target.value;
    options["convolve"] = value;
    updateOptions(id, "tiff", options);
  };

  setValidpixelexpression = (event) => {
    var { id, updateOptions, options } = this.props;
    options["validpixelexpression"] = !options.validpixelexpression;
    updateOptions(id, "tiff", options);
  };

  setPalette = (event) => {
    var { id, updateOptions, options } = this.props;
    options["paletteName"] = event.name;
    options["palette"] = event.palette;
    updateOptions(id, "tiff", options);
  };

  resetMin = () => {
    this.setState({ _min: this.props.options.dataMin }, () =>
      this.updateMinMax(),
    );
  };

  resetMax = () => {
    this.setState({ _max: this.props.options.dataMax }, () =>
      this.updateMinMax(),
    );
  };

  onMonthChange = (event) => {
    var { layer, options } = this.props;
    var { available } = layer.sources[layer.source].metadata;
    let show = filterImages(available, options.coverage, []);
    this.addCssRules(event, show);
  };

  isSameDay = (date1, date2) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
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

  addCssRules = (date, available) => {
    const { language } = this.props;
    var { id } = this.state;
    var start = new Date(date.getFullYear(), date.getMonth(), 1);
    var end = this.addOneMonth(start);
    var preStart = this.addDays(start, -7);
    var postEnd = this.addDays(end, 7);
    var numberOfDays = Math.ceil(
      Math.abs(postEnd.getTime() - preStart.getTime()) / (1000 * 3600 * 24),
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
            element[0].title = `${p}% ${Translations.lakeCoverage[language]} (${obs} ${Translations.imagesAvailable[language]})`;
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
  }

  render() {
    var { _min, _max, id } = this.state;
    var { language, layer } = this.props;
    var {
      paletteName,
      opacity,
      convolve,
      validpixelexpression,
      coverage,
      wms,
    } = this.props.options;
    var { available, image } = layer.sources[layer.source].metadata;
    var { unit } = this.props.layer;
    const locale = {
      localize: {
        day: (n) => Translations.axis[language].shortDays[n],
        month: (n) => Translations.axis[language].months[n],
      },
      formatLong: {
        date: () => "dd/mm/yyyy",
      },
    };
    var months = Translations.axis[language].months;
    var includeDates = [];
    var images = [];
    if (available && image) {
      let show = filterImages(available, coverage, []);
      setTimeout(() => this.addCssRules(image.time, show), 100);
      includeDates = Object.values(show).map((m) => m.time);
      let day = formatSencastDay(image.time);
      if (day in available) images = available[day].images;
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
              return (
                <div
                  className={i.url === image.url ? "image selected" : "image"}
                  key={i.url}
                  onClick={() => this.setImage(i.time)}
                >
                  <div className="right-buttons">
                    <div className="button">
                      {i.url === image.url ? "✔" : "+"}
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
                      {`${i.percent}% ${Translations.coverage[
                        language
                      ].toLowerCase()}`}{" "}
                      | {`${Math.round(i.ave * 10) / 10} ${unit}`}
                    </div>
                  </div>
                  <div className="under">
                    <a
                      href={i.url}
                      title={Translations.geotiffDownload[language]}
                    >
                      <button className="tiff">
                        {Translations.download[language]}
                      </button>
                    </a>
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
          <div className="label">{Translations.opacity[language]}</div>
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
          <div className="label">{Translations.smoothing[language]}</div>
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
          <div className="label">{Translations.minCoverage[language]}</div>
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
        {layer.id !== "satellite_temperature" && (
          <div className="setting half">
            <div className="label">{Translations.imagery[language]}</div>
            <label className="switch">
              <input
                type="checkbox"
                checked={wms}
                onChange={this.setWms}
              ></input>
              <span className="slider round"></span>
            </label>
          </div>
        )}
        <div className="setting">
          <div className="label">Palette</div>
          <div className="value">{paletteName}</div>
          <ColorRamp onChange={this.setPalette} value={paletteName} />
        </div>
        <div className="setting">
          {Translations.validPixelExpression[language]}
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

class Particles extends Component {
  setPaths = (event) => {
    var { id, updateOptions, options } = this.props;
    var value = event.target.value;
    options["paths"] = value;
    updateOptions(id, "particles", options);
  };

  setSpread = (event) => {
    var { id, updateOptions, options } = this.props;
    var value = event.target.value;
    options["spread"] = 10 ** value;
    updateOptions(id, "particles", options);
  };

  setOpacity = (event) => {
    var { id, updateOptions, options } = this.props;
    var value = event.target.value;
    options["opacity"] = value;
    updateOptions(id, "particles", options);
  };

  setIntegrator = (event) => {
    var { id, updateOptions, options } = this.props;
    options["integrator"] = event.target.value;
    updateOptions(id, "particles", options);
  };

  toggleHeatmap = () => {
    var { id, updateOptions, options } = this.props;
    options["heatmap"] = !options["heatmap"];
    updateOptions(id, "particles", options);
  };

  toggleReverse = () => {
    var { id, updateOptions, options } = this.props;
    options["reverse"] = !options["reverse"];
    updateOptions(id, "particles", options);
  };

  removeParticles = () => {
    var { id, updateOptions, options } = this.props;
    options["remove"] = true;
    updateOptions(id, "particles", options);
  };

  render() {
    var { language, depth, setDepth, layer, period, setPeriod, setModel } =
      this.props;
    var { paths, spread, heatmap, reverse, integrator } = this.props.options;
    var depths = [];
    var missingDates = [];
    var start_date = new Date();
    var end_date = new Date();
    end_date.setDate(start_date.getDate() - 7);
    if ("metadata" in layer.sources[layer.source]) {
      ({
        depth: depths,
        missingDates,
        start_date,
        end_date,
      } = layer.sources[layer.source].metadata);
    }
    return (
      <div className="layer-settings">
        <div className="setting">
          <div className="label">{Translations.model[language]}</div>
          <select
            value={layer["source"]}
            onChange={(event) => setModel(event, layer.id)}
          >
            {Object.entries(layer["sources"]).map(([key, value]) => (
              <option key={key} value={key}>
                {value.name}
              </option>
            ))}
          </select>
        </div>
        <div className="setting">
          <div className="label">{Translations.period[language]}</div>
          <div className="period-selector">
            <Period
              period={period}
              setPeriod={setPeriod}
              language={language}
              minDate={start_date}
              maxDate={end_date}
              missingDates={missingDates}
            />
          </div>
        </div>
        <Depth
          depth={depth}
          depths={depths}
          onChange={setDepth}
          language={language}
        />
        <div className="setting">
          <label className="switch">
            <input
              type="checkbox"
              checked={!!heatmap}
              onChange={this.toggleHeatmap}
            />
            <span className="slider round"></span>
          </label>
          <div className="title">{Translations.heatmap[language]}</div>
        </div>
        <div className="setting">
          <label className="switch">
            <input
              type="checkbox"
              checked={!!reverse}
              onChange={this.toggleReverse}
            />
            <span className="slider round"></span>
          </label>
          <div className="title">{Translations.reverse[language]}</div>
        </div>
        <div className="setting half">
          <div className="label">{Translations.particles[language]}</div>
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
          <div className="label">{Translations.spread[language]}</div>
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
          <div className="label">{Translations.integrator[language]}</div>
          <select value={integrator || "rk4"} onChange={this.setIntegrator}>
            <option value="rk4">Runge-Kutta 4</option>
            <option value="euler">Euler</option>
          </select>
        </div>
        <div className="setting">
          <button className="remove" onClick={this.removeParticles}>
            {Translations.removeParticles[language]}
          </button>
        </div>
      </div>
    );
  }
}

class LayerSettings extends Component {
  render() {
    var { layer, language } = this.props;
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
    } else if (type === "particles") {
      return (
        <Particles
          id={layer.id}
          options={layer.displayOptions}
          {...this.props}
        />
      );
    } else {
      return (
        <div className="layer-settings subtle">
          {Translations.noSettings[language]}
        </div>
      );
    }
  }
}

export default LayerSettings;
