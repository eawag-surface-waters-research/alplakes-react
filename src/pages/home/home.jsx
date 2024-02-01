import React, { Component } from "react";
import axios from "axios";
import { NavLink } from "react-router-dom";
import NavBar from "../../components/navbar/navbar";
import SummaryGraph from "../../components/d3/summarygraph/summarygraph";
import Translations from "../../translations.json";
import searchIcon from "../../img/search.png";
import depth_icon from "../../img/depth.png";
import area_icon from "../../img/area.png";
import elevation_icon from "../../img/elevation.png";
import eawag_logo from "../../img/eawag_logo.png";
import esa_logo from "../../img/esa_logo.png";
import trento_logo from "../../img/trento_logo.png";
import threed_icon from "../../img/threed-icon.png";
import oned_icon from "../../img/oned-icon.png";
import satellite_icon from "../../img/satellite.png";
import live_icon from "../../img/live.png";
import insitu_icon from "../../img/insitu.png";
import minimise_icon from "../../img/normalscreen.png";
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
import PolygonGraph from "../../components/leaflet/polygon";
import NumberIncreaser from "../../components/numberincreaser/numberincreaser";

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
    return (
      <NavLink to={`/${lake.key}`}>
        <div
          className={
            lake.display && !lake.filter ? "list-item" : "list-item hidden"
          }
          id={"list-" + lake.key}
          onMouseOver={onMouseOver}
          onMouseOut={onMouseOut}
          title={"Click for more..."}
        >
          <div className="properties">
            <div className="polygon">
              <PolygonGraph geometry={lake.geometry} />
            </div>
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
              <div className="view">View</div>
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

class Promos extends Component {
  render() {
    var { types } = this.props;
    return (
      <React.Fragment>
        <div className="promos">
          {types.map((t) => (
            <div className="promo" key={t["id"]}>
              <div className="number">
                <NumberIncreaser targetValue={t["value"]} />
              </div>
              <div className="text">
                <div className="upper">lakes with</div>
                <div className="parameter">{t["long_name"]}</div>
                <div className="dates">{t["dates"]}</div>
              </div>
              <img src={t["icon"]} alt={t["long_name"]} />
            </div>
          ))}
        </div>
      </React.Fragment>
    );
  }
}

class Home extends Component {
  state = {
    list: [],
    search: "",
    filters: ["all"],
    boundingBox: false,
    fullscreen: false,
  };
  toggleFullscreen = () => {
    this.setState({ fullscreen: !this.state.fullscreen }, () => {
      window.dispatchEvent(new Event("resize"));
    });
  };
  setBounds = (boundingBox) => {
    this.setState({ boundingBox });
  };
  setFilter = (filter) => {
    var { filters } = this.state;
    if (filter === "all") {
      this.setState({ filters: ["all"] });
    } else if (filters.includes(filter)) {
      filters = filters.filter((f) => f !== filter);
      if (filters.length === 0) {
        this.setState({ filters: ["all"] });
      } else {
        this.setState({ filters });
      }
    } else {
      filters = filters.filter((f) => f !== "all");
      filters.push(filter);
      this.setState({ filters });
    }
  };
  setSearch = (event) => {
    var { list } = this.state;
    var search = event.target.value;
    this.setState({ search });
    list = searchList(search, list);
    this.setState({ list });
  };
  sortList = (list, filters) => {
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
    list = list.map((l) => {
      if (filters.includes("all")) {
        l.filter = false;
      } else {
        l.filter = !filters.every((str) => l.filters.includes(str));
      }
      return l;
    });
    return list;
  };
  processTypes = (types, list) => {
    const year = new Date().getFullYear();
    types = types.map((t) => {
      t["value"] = list.filter((l) => l.filters.includes(t["id"])).length;
      t["dates"] = `${t["start"]} - ${year}`;
      return t;
    });
    return types;
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
    var { list, search, filters, fullscreen } = this.state;
    var sortedList = this.sortList(list, filters);
    var results = sortedList.filter((l) => l.display && !l.filter).length;
    var filterTypes = this.processTypes(
      [
        { id: "all", short_name: "All" },
        {
          id: "3D",
          short_name: "3D",
          long_name: "3D models",
          icon: threed_icon,
          start: "2019",
        },
        {
          id: "1D",
          short_name: "1D",
          long_name: "1D models",
          icon: oned_icon,
          start: "1981",
        },
        {
          id: "satellite",
          short_name: "Satellite",
          long_name: "satellite products",
          icon: satellite_icon,
          start: "2015",
        },
        {
          id: "live",
          short_name: "Live",
          long_name: "live data",
          icon: live_icon,
          start: "2019",
        },
        {
          id: "insitu",
          short_name: "Insitu",
          long_name: "insitu data",
          icon: insitu_icon,
          start: "2019",
        },
      ],
      list
    );
    return (
      <React.Fragment>
        <NavBar {...this.props} small={true} />
        <div className="content">
          <div className="home-list">
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
              <img src={searchIcon} alt="Alplakes logo" />
              <div className="filters">
                {filterTypes.map((f) => (
                  <div
                    className={
                      filters.includes(f.id) ? "filter selected" : "filter"
                    }
                    key={f.id}
                    onClick={() => this.setFilter(f.id)}
                  >
                    {f.short_name}
                  </div>
                ))}
              </div>
            </div>
            <div className="product-wrapper">
              <div className="results">{results} results</div>
              <div className="product-list">
                {list.length === 0 ? (
                  <PlaceHolder />
                ) : (
                  results === 0 && (
                    <div className="empty">
                      {Translations.results[language]}
                    </div>
                  )
                )}
                {sortedList.map((lake) => (
                  <ListItem lake={lake} language={language} key={lake.key} />
                ))}
              </div>
            </div>
          </div>
          <div className="logos">
            <img src={eawag_logo} alt="Eawag" />
            <img src={esa_logo} alt="Esa" />
            <img src={trento_logo} alt="Trento" />
          </div>
          <div className={fullscreen ? "home-map" : "home-map mini"}>
            <div className="fullscreen" onClick={this.toggleFullscreen}>
              {fullscreen ? (
                <div className="label">
                  <img src={minimise_icon} alt="Minimise" />
                </div>
              ) : (
                <div className="label">
                  View map
                </div>
              )}
            </div>
            <HomeMap
              list={list}
              dark={dark}
              language={language}
              setBounds={this.setBounds}
            />
          </div>
          <Promos types={filterTypes.filter((f) => f.id !== "all")} />
        </div>
        <Footer {...this.props} small={true} />
      </React.Fragment>
    );
  }
}

export default Home;
