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
  dayName,
  parseDate,
  searchList,
  inBounds,
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
            <div className="loading-placeholder"></div>
          </div>
        ))}
      </React.Fragment>
    );
  }
}

class SummaryTable extends Component {
  render() {
    var { forecast, language } = this.props;
    return (
      <React.Fragment>
        {Object.keys(forecast.summary).map((day, i, arr) => (
          <div
            key={day}
            className={i === arr.length - 1 ? "inner end" : "inner"}
          >
            <div className="ave">
              {forecast.summary[day]}
              {forecast.summary[day] ? "°" : ""}
            </div>
            <div className="day">{dayName(day, language, Translations)}</div>
          </div>
        ))}
        <SummaryGraph
          dt={forecast.dt}
          value={forecast.value}
          dtMin={forecast.dtMin}
          dtMax={forecast.dtMax}
        />
      </React.Fragment>
    );
  }
}

class Lake extends Component {
  render() {
    var { lake, language } = this.props;
    var flags = { swiss: swiss, italian: italian, french: french };
    return (
      <NavLink to={`/${lake.key}`}>
        <div
          className={lake.display ? "lake" : "lake hidden"}
          id={"list-" + lake.key}
          onMouseOver={onMouseOver}
          onMouseOut={onMouseOut}
          title={"Click for more..."}
        >
          <div className="properties">
            <div className="left">
              {lake.name[language]}
              {lake.frozen && <div className="frozen">(Frozen)</div>}
              <div className="flags">
                {lake.flags.map((f) => (
                  <img src={flags[f]} alt={f} key={f} />
                ))}
              </div>
              <div className="label">
                <div className="icon">&#9660;</div> {lake.max_depth} m
                <div className="icon">&#9632;</div> {lake.area} km&#178;
                <div className="icon">&#9650;</div> {lake.elevation} m.a.s.l.
              </div>
            </div>
            <div className="right">More &#x25BA;</div>
          </div>
          <div className="summary">
            <div className="text">Water Temperature Forecast</div>
            {!lake.forecast.available && (
              <div className="offline">Forecast Offline</div>
            )}
            <div className="summary-table">
              <SummaryTable
                forecast={lake.forecast}
                language={language}
                frozen={lake.frozen}
              />
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
    defaultNumber: 12,
    search: "",
    boundingBox: false,
  };
  setBounds = (boundingBox) => {
    this.setState({ boundingBox });
  };
  setSearch = (event) => {
    var { list } = this.state;
    var search = event.target.value;
    this.setState({ search });
    list = searchList(search, list);
    this.setState({ list });
  };
  sortList = (list) => {
    var { boundingBox } = this.state;
    list.sort((a, b) => {
      // 1. Sort if in map area
      if (boundingBox) {
        if (
          inBounds(a.latitude, a.longitude, boundingBox) &&
          !inBounds(b.latitude, b.longitude, boundingBox)
        ) {
          return -1;
        }
        if (
          !inBounds(a.latitude, a.longitude, boundingBox) &&
          inBounds(b.latitude, b.longitude, boundingBox)
        ) {
          return 1;
        }
      }
      // 2. Sort if forecast available
      if (a.forecast.available && !b.forecast.available) {
        return -1;
      }
      if (!a.forecast.available && b.forecast.available) {
        return 1;
      }
      // 3. Sort by surface area
      if (a.area < b.area) {
        return 1;
      }
      if (a.area > b.area) {
        return -1;
      }
      return 0;
    });
    return list;
  };
  async componentDidMount() {
    var ice, geometry, forecast;
    const { language } = this.props;
    const { data: list } = await axios.get(
      CONFIG.alplakes_bucket + "/static/website/metadata/v2/list.json"
    );
    try {
      ({ data: forecast } = await axios.get(
        CONFIG.alplakes_bucket +
          `/simulations/forecast.json?timestamp=${
            Math.round((new Date().getTime() + 1800000) / 3600000) * 3600 - 3600
          }`
      ));
    } catch (e) {
      forecast = {};
    }
    try {
      ({ data: ice } = await axios.get(
        CONFIG.alplakes_bucket + "/static/website/metadata/v2/ice.json"
      ));
    } catch (e) {
      ice = {};
    }
    try {
      ({ data: geometry } = await axios.get(
        CONFIG.alplakes_bucket + "/static/website/metadata/v2/lakes.geojson"
      ));
      geometry = geometry.features.reduce((obj, item) => {
        obj[item.properties.key] = item.geometry.coordinates;
        return obj;
      }, {});
    } catch (e) {
      geometry = {};
    }
    var today = new Date();
    list.map((l) => {
      l.display = true;
      l.frozen = false;
      l.geometry = false;
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
      l.forecast = summariseData(forecast[l.key], l.frozen);
      if (l.key in geometry) {
        l.geometry = geometry[l.key];
      }
    });
    this.setState({ list });
  }
  render() {
    document.title = "Alplakes";
    var { language } = this.props;
    var { list, defaultNumber, search } = this.state;
    var sortedList = this.sortList(list);
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
              sortedList.map((lake) => (
                <Lake lake={lake} language={language} key={lake.key} />
              ))
            )}
          </div>
          <div className="home-map">
            <HomeMap
              list={list}
              language={language}
              setBounds={this.setBounds}
            />
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
