import React, { Component } from "react";
import axios from "axios";
import {
  processSatelliteFiles,
  compareDates,
  formatDate,
  formatDateTime,
} from "./functions";
import Translations from "../../translations.json";
import * as d3 from "d3";
import Basemap from "../../components/leaflet/basemap";
import "./lake.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Loading from "../../components/loading/loading";

class Satellite extends Component {
  state = {
    id: Math.round(Math.random() * 100000),
    legend: false,
    basemap: "default",
    datetime: Date.now(),
    fullscreen: false,
    updates: [],
    layers: [],
    bucket: true,
    selection: false,
    graphs: false,
    graphData: false,
    available: false,
    image: false,
    includeDates: [],
    currentDate: new Date(),
    parameters: [],
    parameter: false,
    satellites: [],
  };
  updated = () => {
    this.setState({ updates: [] });
  };
  unlock = () => {
    this.setState({ bucket: false });
  };
  setDatetime = (event) => {
    console.log(event);
  };
  onMonthChange = (event) => {
    var { available } = this.state;
    this.addCssRules(event, available);
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
    var start = new Date(date.getFullYear(), date.getMonth(), 1);
    var end = this.addOneMonth(start);
    var className;
    for (let day_dict of Object.values(available)) {
      let p = day_dict.max_percent;
      let day = day_dict.time.getDate();
      let obs = day_dict.images.length;
      let element = [];
      if (day_dict.time > start && day_dict.time < end) {
        className = `.custom-css-datepicker .react-datepicker__day--0${
          day < 10 ? "0" + day : day
        }:not(.react-datepicker__day--outside-month)`;
        element = document.querySelectorAll(className);
      } else if (
        day_dict.time < start &&
        day_dict.time > this.addDays(start, -15)
      ) {
        className = `.custom-css-datepicker .react-datepicker__day--0${
          day < 10 ? "0" + day : day
        }.react-datepicker__day--outside-month`;
        element = document.querySelectorAll(className);
      } else if (day_dict.time > end && day_dict.time < this.addDays(end, 15)) {
        className = `.custom-css-datepicker .react-datepicker__day--0${
          day < 10 ? "0" + day : day
        }.react-datepicker__day--outside-month`;
        element = document.querySelectorAll(className);
      }
      if (element.length > 0) {
        let deg = Math.ceil((p / 100) * 180) + 180;
        element[0].title = `${p}% (max pixel coverage) from ${obs} images`;
        if (obs > 0) {
          element[0].innerHTML = `<div class="percentage" style="background: conic-gradient(transparent 180deg, var(--e-global-color-subtle-accent) 180deg ${deg}deg, transparent ${deg}deg 360deg);"></div></div><div class="observations">${obs}</div><div class="date">${element[0].innerHTML}</div>`;
        } else {
          element[0].innerHTML = `<div class="percentage" style="background: conic-gradient(transparent 180deg, var(--e-global-color-subtle-accent) 180deg ${deg}deg, transparent ${deg}deg 360deg);"></div></div><div class="date">${element[0].innerHTML}</div>`;
        }
      }
    }
  };
  async componentDidMount() {
    var { layers: base_layers, module } = this.props;
    var { id } = this.state;
    var layers = JSON.parse(JSON.stringify(base_layers));
    var parameters = [
      ...new Set(
        layers.filter((l) => l.type === "sencast_tiff").map((l) => l.parameter)
      ),
    ];
    var satellites = [
      ...new Set(
        layers
          .filter((l) => l.type === "sencast_tiff")
          .map((l) => l.properties.model)
      ),
    ].map((s) => {
      return { name: s, active: true };
    });
    var parameter = module.default;
    var available = {};
    for (let layer of layers.filter(
      (l) => l.type === "sencast_tiff" && l.parameter === parameter
    )) {
      let { data } = await axios.get(layer.properties.metadata);
      let max_pixels = d3.max(data.map((m) => parseFloat(m.p)));
      available = processSatelliteFiles(
        data,
        available,
        max_pixels,
        layer.id,
        layer.properties.unit,
        layer.properties.model
      );
    }
    var includeDates = Object.values(available).map((m) => m.time);
    includeDates.sort(compareDates);
    var currentDate = includeDates[includeDates.length - 1];
    var date = available[formatDate(currentDate)];
    var image = date.images.filter((i) => i.percent === date.max_percent)[0];
    var layer = layers.filter((l) => l.id === image.layer_id)[0];
    layer.properties.url = image.url;
    layer.properties.options.validpixelexpression = true;
    layer.properties.options.min = Math.round(image.min * 100) / 100;
    layer.properties.options.max = Math.round(image.max * 100) / 100;
    layer.properties.options.dataMin = Math.round(image.min * 100) / 100;
    layer.properties.options.dataMax = Math.round(image.max * 100) / 100;
    var updates = [
      { event: "bounds" },
      { event: "addLayer", id: layer.id },
      { event: "initialLoad", id: id },
    ];
    this.setState({
      layers: layers,
      updates,
      available,
      image,
      includeDates,
      currentDate,
      parameters,
      parameter,
      satellites,
    });
  }
  render() {
    var { dark, metadata, language } = this.props;
    var { fullscreen, image, datetime, includeDates, id } = this.state;
    const locale = {
      localize: {
        day: (n) => Translations.axis[language].shortDays[n],
        month: (n) => Translations.axis[language].months[n],
      },
      formatLong: {
        date: () => "dd/mm/yyyy",
      },
    };
    return (
      <div className="module-component">
        <div className="sidebar">
          <DatePicker
            dateFormat="dd/MM/yyyy"
            locale={locale}
            inline={true}
            includeDates={includeDates}
            selected={datetime}
            onChange={this.setDatetime}
            onMonthChange={this.onMonthChange}
          />
        </div>
        <div className="plot">
          <div className="average-value">
            {image && `${Math.round(image.ave * 10) / 10} ${image.unit}`}
          </div>
          <div className="header">
            {image &&
              formatDateTime(image.time, Translations.axis[language].months)}
          </div>
          <div className={fullscreen ? "map fullscreen" : "map"}>
            <div className="initial-load" id={id}>
              <Loading />
            </div>
            <Basemap
              {...this.state}
              dark={dark}
              unlock={this.unlock}
              updated={this.updated}
              metadata={metadata}
            />
          </div>
          <div className="graph"></div>
        </div>
      </div>
    );
  }
}

export default Satellite;