import React, { Component } from "react";
import axios from "axios";
import { NavLink } from "react-router-dom";
import NavBar from "../../components/navbar/navbar";
import SummaryGraph from "../../components/d3/summarygraph/summarygraph";
import Translations from "../../translations.json";
import swiss from "../../img/swiss.png";
import italian from "../../img/italian.png";
import french from "../../img/french.png";
import icon from "../../img/icon.png";
import eawag_logo from "../../img/eawag_logo.png";
import esa_logo from "../../img/esa_logo.png";
import trento_logo from "../../img/trento_logo.png";
import {
  onMouseOver,
  onMouseOut,
  summariseData,
  meanTemperature,
  dayName,
  parseDate,
  sortList,
} from "./functions";
import CONFIG from "../../config.json";
import "./home.css";
import HomeMap from "../../components/leaflet/homemap";

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
  render() {
    var { forecast, frozen, language } = this.props;
    var { dt, value, summary } = summariseData(forecast, frozen);
    return (
      <React.Fragment>
        {Object.keys(summary).map((day, i, arr) => (
          <div
            key={day}
            className={i === arr.length - 1 ? "inner end" : "inner"}
          >
            <div className="ave">{meanTemperature(summary[day])}</div>
            <div className="day">{dayName(day, language, Translations)}</div>
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
    return (
      <NavLink to={`/${lake.key}`}>
        <div
          className="lake"
          id={"list-" + lake.key}
          onMouseOver={onMouseOver}
          onMouseOut={onMouseOut}
        >
          <div className="properties">
            <div className="left">
              {lake.name[language]}
              {lake.frozen && <div className="frozen">(Ice Covered)</div>}
            </div>
            <div className="right">
              {lake.flags.map((f) => (
                <img src={flags[f]} alt={f} key={f} />
              ))}
            </div>
          </div>
          <div className="summary-table">
            <SummaryTable
              forecast={forecast}
              language={language}
              frozen={lake.frozen}
            />
          </div>
          <div className="right-arrow">{">"}</div>
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
    search: "",
  };
  setSearch = (event) => {
    this.setState({ search: event.target.value });
  };
  setSort = (event) => {
    this.setState({ sort: event.target.value });
  };
  toggleSort = () => {
    this.setState({ ascending: !this.state.ascending });
  };
  async componentDidMount() {
    var { forecast, ice } = this.state;
    const { data: list } = await axios.get(
      CONFIG.alplakes_bucket + "/static/website/metadata/list.json"
    );
    try {
      ({ data: forecast } = await axios.get(
        CONFIG.alplakes_bucket +
          `/simulations/forecast.json?timestamp=${
            Math.round((new Date().getTime() + 1800000) / 3600000) * 3600 - 3600
          }`
      ));
    } catch (e) {}
    try {
      ({ data: ice } = await axios.get(
        CONFIG.alplakes_bucket + "/simulations/ice.json"
      ));
    } catch (e) {}
    var today = new Date();
    list.map((l) => {
      l.frozen = false;
      if (l.key in ice) {
        for (var i = 0; i < ice[l.key].length; i++) {
          if (ice[l.key][i].length === 1) {
            if (today > parseDate(ice[l.key][i][0].toString())) l.frozen = true;
          } else if (ice[l.key][i].length === 2) {
            if (
              today > parseDate(ice[l.key][i][0].toString()) &&
              today < parseDate(ice[l.key][i][1].toString())
            )
              l.frozen = true;
          }
        }
      }
    });
    this.setState({ list, forecast });
  }
  render() {
    document.title = "Alplakes";
    var { language } = this.props;
    var { list, sort, ascending, defaultNumber, forecast, search } = this.state;
    if (sort !== "sortby") {
      list = sortList(list, sort, ascending);
    }
    return (
      <div className="home">
        <NavBar {...this.props} />
        <div className="home-content">
          <div className="home-search">
            <input
              type="search"
              placeholder="Search lakes"
              value={search}
              onChange={this.setSearch}
            />
            <img src={icon} alt="Alplakes logo" />
          </div>
          <div className="home-product-list">
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
          <div className="home-map">
            <HomeMap />
          </div>
          <div className="home-logos">
            <img src={eawag_logo} alt="Eawag" />
            <img src={esa_logo} alt="Esa" />
            <img src={trento_logo} alt="Trento" />
          </div>
        </div>
      </div>
    );
  }
}

export default Home;
