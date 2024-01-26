import React, { Component } from "react";
import axios from "axios";
import { NavLink } from "react-router-dom";
import NavBar from "../../components/navbar/navbar";
import SummaryGraph from "../../components/d3/summarygraph/summarygraph";
import Translations from "../../translations.json";
import swiss from "../../img/swiss.png";
import italian from "../../img/italian.png";
import french from "../../img/french.png";
import german from "../../img/german.png";
import austrian from "../../img/austrian.png";
import icon from "../../img/icon.png";
import depth_icon from "../../img/depth.png";
import area_icon from "../../img/area.png";
import elevation_icon from "../../img/elevation.png";
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
import Footer from "../../components/footer/footer";

class PlaceHolder extends Component {
  render() {
    return (
      <React.Fragment>
        {[...Array(12).keys()].map((a) => (
          <div className="list-item-placeholder" key={a}></div>
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

class ListItem extends Component {
  render() {
    var { lake, language } = this.props;
    var flags = {
      swiss: swiss,
      italian: italian,
      french: french,
      german: german,
      austrian: austrian,
    };
    return (
      <NavLink to={`/${lake.key}`}>
        <div
          className={lake.display ? "list-item" : "list-item hidden"}
          id={"list-" + lake.key}
          onMouseOver={onMouseOver}
          onMouseOut={onMouseOut}
          title={"Click for more..."}
        >
          <div className="properties">
            <div className="left">
              {lake.name[language]}
              {lake.frozen && (
                <div className="frozen">({Translations.frozen[language]})</div>
              )}

              <div className="label">
                <div className="icon">
                  <img src={depth_icon} alt="depth" />
                </div>
                <div className="text">{lake.max_depth} m</div>
                <div className="icon">
                  <img src={area_icon} alt="area" />
                </div>
                <div className="text"> {lake.area} km&#178;</div>
                <div className="icon">
                  <img src={elevation_icon} alt="elevation" />
                </div>
                <div className="text">{lake.elevation} m.a.s.l.</div>
                <div className="header">
                  {Translations.surfacetemperature[language]}
                </div>
              </div>
            </div>
            <div className="right">
              {lake.flags.map((f) => (
                <img src={flags[f]} alt={f} key={f} />
              ))}
            </div>
          </div>
          <div className="summary">
            {!lake.forecast.available && (
              <div className="offline">{Translations.offline[language]}</div>
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
      return l;
    });
    this.setState({ list });
  }
  render() {
    document.title = "Alplakes";
    var { language, dark } = this.props;
    var { list, search } = this.state;
    var sortedList = this.sortList(list);
    var results = list.filter((l) => l.display).length;
    return (
      <React.Fragment>
        <NavBar {...this.props} small={true} />
        <div className="content">
          <div className="home-list">
            <div className="intro">{Translations.summary[language]}</div>
            <div className="search">
              <input
                type="search"
                placeholder={
                  Translations.search[language] +
                  " " +
                  Translations.lakes[language].toLowerCase()
                }
                value={search}
                onChange={this.setSearch}
              />

              <img src={icon} alt="Alplakes logo" />
            </div>
            <div className="product-wrapper">
              <div className="product-list">
                {list.length === 0 ? (
                  <PlaceHolder />
                ) : results === 0 ? (
                  <div className="empty">{Translations.results[language]}</div>
                ) : (
                  sortedList.map((lake) => (
                    <ListItem lake={lake} language={language} key={lake.key} />
                  ))
                )}
              </div>
            </div>
          </div>
          <div className="shadow" />
          <div className="home-map">
            <HomeMap
              list={list}
              dark={dark}
              language={language}
              setBounds={this.setBounds}
            />
          </div>
        </div>
        <Footer {...this.props} small={true} />
      </React.Fragment>
    );
  }
}

export default Home;
