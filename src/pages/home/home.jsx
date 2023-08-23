import React, { Component } from "react";
import axios from "axios";
import { NavLink } from "react-router-dom";
import NavBar from "../../components/navbar/navbar";
import SummaryGraph from "../../components/d3/summarygraph/summarygraph";
import Translations from "../../translations.json";
import swiss from "../../img/swiss.png";
import italian from "../../img/italian.png";
import french from "../../img/french.png";
import ascending_icon from "../../img/ascending.png";
import descending_icon from "../../img/descending.png";
import ascending_icon_dark from "../../img/ascending_dark.png";
import descending_icon_dark from "../../img/descending_dark.png";
import ice from "../../img/ice.png";
import { onMouseOver, onMouseOut } from "./functions";
import CONFIG from "../../config.json";
import "./home.css";

class PlaceHolder extends Component {
  render() {
    var { number } = this.props;
    return (
      <React.Fragment>
        {[...Array(number).keys()].map((a) => (
          <div className="lake" key={a}>
            <div className="placeholder-image"></div>
            <div className="properties">
              <div className="left">
                <div className="placeholder-flag" />
              </div>
              <div className="right">
                <div className="placeholder-name" />
                <div className="placeholder-location" />
              </div>
            </div>
          </div>
        ))}
      </React.Fragment>
    );
  }
}

class SummaryTable extends Component {
  formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}${month}${day}`;
  };
  dayName = (YYYYMMDD) => {
    var { language } = this.props;
    const year = parseInt(YYYYMMDD.substr(0, 4), 10);
    const month = parseInt(YYYYMMDD.substr(4, 2), 10) - 1; // Subtracting 1 to make it zero-based
    const day = parseInt(YYYYMMDD.substr(6, 2), 10);
    const daysOfWeekNames = Translations.axis[language].shortDays;
    const date = new Date(year, month, day);
    const dayOfWeekNumber = date.getDay();
    return daysOfWeekNames[dayOfWeekNumber];
  };
  mean = (numbers) => {
    if (numbers.length === 0) {
      return 0;
    }
    const sum = numbers.reduce((acc, num) => acc + num, 0);
    const mean = Math.round((sum * 10) / numbers.length) / 10;
    return mean;
  };
  min = (numbers) => {
    return Math.round(Math.min(...numbers) * 10) / 10;
  };
  max = (numbers) => {
    return Math.round(Math.max(...numbers) * 10) / 10;
  };
  render() {
    var { forecast } = this.props;
    var now = new Date();
    now.setHours(0, 0, 0, 0);
    var dt = [];
    var value = [];
    var summary = {};
    if (
      "date" in forecast &&
      Array.isArray(forecast.date) &&
      "value" in forecast &&
      Array.isArray(forecast.value)
    ) {
      for (let i = 0; i < forecast.date.length; i++) {
        let d = new Date(forecast.date[i]);
        if (d > now) {
          let day = this.formatDate(d);
          let v = forecast.value[i];
          dt.push(d);
          value.push(v);
          if (day in summary) {
            summary[day].push(v);
          } else {
            summary[day] = [v];
          }
        }
      }
    }
    return (
      <React.Fragment>
        {Object.keys(summary).map((day, i, arr) => (
          <div
            key={day}
            className={i === arr.length - 1 ? "inner end" : "inner"}
          >
            <div className="max">{this.max(summary[day])}°</div>
            <div className="min">{this.min(summary[day])}°</div>
            <div className="day">{this.dayName(day)}</div>
          </div>
        ))}
        <SummaryGraph dt={dt} value={value} />
      </React.Fragment>
    );
  }
}

class Lake extends Component {
  render() {
    var { lake, language, forecast } = this.props;
    var flags = { swiss: swiss, italian: italian, french: french };
    var desc = Translations.descriptions[language];
    var imgCore = `https://alplakes-eawag.s3.eu-central-1.amazonaws.com/static/website/images/lakes/${lake.key}.png`;
    var frozen = "frozen" in forecast && forecast.frozen;
    return (
      <NavLink to={`/${lake.key}`}>
        <div
          className="lake"
          id={"list-" + lake.key}
          onMouseOver={onMouseOver}
          onMouseOut={onMouseOut}
        >
          <div className="image">
            {frozen && <img src={ice} alt="Ice" className="frozen-image" />}
            <img src={imgCore} alt="Lake" className="core-image" />
            <div className="tags">
              {lake.tags.map((t) => (
                <div className="tag" key={t}>
                  {t}
                </div>
              ))}
            </div>
            {forecast !== undefined && (
              <div className="summary-table">
                <SummaryTable forecast={forecast} language={language} />
              </div>
            )}
          </div>
          <div className="properties">
            <div className="left">
              {lake.flags.map((f) => (
                <img src={flags[f]} alt={f} key={f} />
              ))}
            </div>
            <div className="right">
              <div className="name">
                {lake.name[language]}
                {frozen && <div className="frozen">(Ice Covered)</div>}
              </div>
              <div className="location">
                {lake.latitude}, {lake.longitude}
              </div>
              <div className="parameters">
                {desc[0]} <div className="stats">{lake.elevation} m</div>
                {desc[1]} <div className="stats">{lake.area} km&#178;</div>
                {desc[2]} <div className="stats">{lake.ave_depth} m</div>
                {desc[3]} <div className="stats">{lake.max_depth} m.</div>
              </div>
            </div>
          </div>
        </div>
      </NavLink>
    );
  }
}

class Home extends Component {
  state = {
    list: [],
    sort: "sortby",
    ascending: false,
    defaultNumber: 12,
    forecast: {},
  };
  setSort = (event) => {
    this.setState({ sort: event.target.value });
  };
  sortList = (list, property, ascending) => {
    var x = 1;
    var y = -1;
    if (ascending) {
      x = -1;
      y = 1;
    }
    return list.sort((a, b) => (a[property] > b[property] ? y : x));
  };
  toggleSort = () => {
    this.setState({ ascending: !this.state.ascending });
  };
  async componentDidMount() {
    var { forecast } = this.state;
    const { data: list } = await axios.get(
      CONFIG.alplakes_bucket + "/static/website/metadata/list.json"
    );
    try {
      ({ data: forecast } = await axios.get(
        CONFIG.alplakes_bucket +
          `/simulations/forecast.json?timestamp=${new Date().getTime()}`
      ));
    } catch (e) {}
    this.setState({ list, forecast });
  }
  render() {
    document.title = "Alplakes";
    var { language, dark } = this.props;
    var { list, sort, ascending, defaultNumber, forecast } = this.state;
    if (sort !== "sortby") {
      list = this.sortList(list, sort, ascending);
    }
    return (
      <div className={dark ? "home dark" : "home"}>
        <NavBar {...this.props} />
        <div className="content">
          <div className="sorting">
            <select onChange={this.setSort} value={sort}>
              <option disabled value="sortby">
                {Translations.sortby[language]}
              </option>
              <option value="elevation">
                {Translations.elevation[language]}
              </option>
              <option value="area">{Translations.area[language]}</option>
              <option value="depth">{Translations.depth[language]}</option>
              <option value="maxdepth">
                {Translations.maxdepth[language]}
              </option>
              <option value="latitude">Latitude</option>
              <option value="longitude">Longitude</option>
            </select>
            <button onClick={this.toggleSort} title="Sort Order">
              <img
                src={
                  ascending
                    ? dark
                      ? ascending_icon_dark
                      : ascending_icon
                    : dark
                    ? descending_icon_dark
                    : descending_icon
                }
                alt="Sort"
              />
            </button>
          </div>
          <div className="products">
            {list.length === 0 ? (
              <PlaceHolder number={defaultNumber} />
            ) : (
              list.map((lake) => (
                <Lake
                  lake={lake}
                  language={language}
                  key={lake.key}
                  forecast={forecast[lake.key]}
                />
              ))
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default Home;
