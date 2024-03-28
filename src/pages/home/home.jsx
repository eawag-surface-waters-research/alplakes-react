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
import more_icon from "../../img/more.png";
import temperature_icon from "../../img/temperature_simple.png";
import ice_icon from "../../img/ice_simple.png";
import oxygen_icon from "../../img/oxygen_simple.png";
import {
  onMouseOver,
  onMouseOut,
  summariseData,
  dayName,
  searchList,
  inBounds,
} from "./functions";
import CONFIG from "../../config.json";
import "./home.css";
import HomeMap from "../../components/leaflet/homemap";
import Footer from "../../components/footer/footer";
import PolygonGraph from "../../components/leaflet/polygon";

class ListSkeleton extends Component {
  render() {
    return (
      <React.Fragment>
        {[...Array(85).keys()].map((a) => (
          <div className="list-item-skeleton" key={a}>
            <div className="lake-shape-skeleton"></div>
            <div className="text-skeleton">
              <div className="name-skeleton"></div>
              <div className="parameters-skeleton"></div>
            </div>
            <div className="skeleton-click"></div>
            <div className="sketelon-graph">
              <div className="skeleton-block"></div>
              <div className="skeleton-block"></div>
              <div className="skeleton-block"></div>
              <div className="skeleton-block"></div>
              <div className="skeleton-block right"></div>
            </div>
          </div>
        ))}
      </React.Fragment>
    );
  }
}

class Search extends Component {
  render() {
    var { setFilter, setSearch, search, language, filters, filterTypes, results } =
      this.props;

    return (
      <div className="search">
        <input
          type="search"
          placeholder={
            Translations.search[language] +
            " " +
            Translations.lakes[language].toLowerCase()
          }
          value={search}
          onChange={setSearch}
        />
        <img src={searchIcon} alt="Search Icon" />
        <div className="filters">
          {filterTypes.map((f) => (
            <div
              className={filters.includes(f.id) ? "filter selected" : "filter"}
              key={f.id}
              onClick={() => setFilter(f.id)}
            >
              {f.name}
            </div>
          ))}
        </div>
        <div className="results">
            {results} {Translations.results[language]}
          </div>
      </div>
    );
  }
}

class List extends Component {
  render() {
    var { language, sortedList, results, search, parameter, parameters } =
      this.props;
    return (
      <div className="list">
        <div className="product-wrapper">
          
          <div className="product-list">
            {results === 0 &&
              (search.length > 0 ? (
                <div className="empty">{Translations.noresults[language]}</div>
              ) : (
                <ListSkeleton />
              ))}
            {sortedList.map((lake) => (
              <ListItem
                lake={lake}
                language={language}
                key={lake.key}
                parameter={parameter}
                parameters={parameters}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }
}

class ListItem extends Component {
  render() {
    var { lake, language, parameter, parameters } = this.props;
    return (
      <NavLink to={`/${lake.key}`}>
        <div
          className={
            lake.display && !lake.filter ? "list-item" : "list-item hidden"
          }
          id={"list-" + lake.key}
          onMouseOver={onMouseOver}
          onMouseOut={onMouseOut}
          title={Translations.click[language]}
        >
          <div className="properties">
            <div className="polygon">
              <PolygonGraph geometry={lake.geometry} />
            </div>
            <div className="left">
              {lake.name[language]}
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
                  {`${Translations[parameters[parameter].label][language]} (${
                    parameters[parameter].unit
                  })`}
                </div>
              </div>
            </div>
            <div className="right">
              <div className="view">
                <img src={more_icon} alt="More" />
              </div>
            </div>
          </div>
          <div className="summary">
            {(!lake.forecast.available ||
              lake.forecast.value[parameter].length === 0) && (
              <div className="offline">{Translations.offline[language]}</div>
            )}
            <div className="summary-table">
              <SummaryTable
                forecast={lake.forecast}
                language={language}
                parameter={parameter}
                parameters={parameters}
              />
            </div>
          </div>
        </div>
      </NavLink>
    );
  }
}

class SummaryTable extends Component {
  render() {
    var { forecast, language, parameter } = this.props;
    return (
      <React.Fragment>
        {Object.keys(forecast.summary).map((day, i, arr) =>
          forecast.summary[day][parameter] === false ? null : (
            <div key={day} className={i === 0 ? "inner start" : "inner"}>
              <div className="ave">{forecast.summary[day][parameter]}</div>
              <div className="day">{dayName(day, language, Translations)}</div>
            </div>
          )
        )}
        <SummaryGraph dt={forecast.dt} value={forecast.value[parameter]} dtMin={forecast.dtMin} dtMax={forecast.dtMax}/>
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
    parameter: "temperature",
    parameters: {
      temperature: {
        label: "surfacetemperature",
        unit: "°",
        img: temperature_icon,
        beta: false,
      },
      ice: {
        label: "icecover",
        unit: "m",
        img: ice_icon,
        beta: true,
      },
      oxygen: {
        label: "bottomoxygen",
        unit: "%",
        img: oxygen_icon,
        beta: true,
      },
    },
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
  setParameter = (parameter) => {
    this.setState({ parameter });
  };
  async componentDidMount() {
    var { parameter, parameters } = this.state;
    var geometry, forecast;
    const { data: list } = await axios.get(
      CONFIG.alplakes_bucket + "/static/website/metadata/v2/list.json"
    );
    try {
      ({ data: forecast } = await axios.get(
        CONFIG.alplakes_bucket +
          `/simulations/forecast2.json?timestamp=${
            Math.round((new Date().getTime() + 1800000) / 3600000) * 3600 - 3600
          }`
      ));
    } catch (e) {
      forecast = {};
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
    list.map((l) => {
      l.display = true;
      l.geometry = false;
      l.forecast = summariseData(
        forecast[l.key],
        parameter,
        Object.keys(parameters)
      );
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
    var { list, search, filters, fullscreen, parameter, parameters } =
      this.state;
    var sortedList = this.sortList(list, filters);
    var results = sortedList.filter((l) => l.display && !l.filter).length;
    var filterTypes = [
      { id: "all", name: Translations.all[language] },
      {
        id: "3D",
        name: "3D",
      },
      {
        id: "1D",
        name: "1D",
      },
      {
        id: "satellite",
        name: Translations.satellite[language],
      },
      {
        id: "live",
        name: Translations.live[language],
      },
      {
        id: "insitu",
        name: Translations.insitu[language],
      },
    ];
    return (
      <React.Fragment>
        <NavBar {...this.props} small={true} />
        <div
          className={parameters[parameter].beta ? "content beta" : "content"}
        >
          <Search
            setFilter={this.setFilter}
            setSearch={this.setSearch}
            search={search}
            language={language}
            filters={filters}
            filterTypes={filterTypes}
            results={results}
          />
          <List
            language={language}
            sortedList={sortedList}
            search={search}
            parameter={parameter}
            parameters={parameters}
            results={results}
          />
          <div className={fullscreen ? "home-map" : "home-map hide"}>
            <div className="fullscreen" onClick={this.toggleFullscreen}>
              <div className="label">
                <div className="arrow">&#8592;</div>
                <div className="text">Back</div>
              </div>
            </div>
            <HomeMap
              list={list}
              dark={dark}
              language={language}
              setBounds={this.setBounds}
              parameter={parameter}
              parameters={parameters}
              setParameter={this.setParameter}
            />
          </div>
          <div className="map-button" onClick={this.toggleFullscreen}>
            Map
          </div>
        </div>
        <Footer {...this.props} small={true} />
      </React.Fragment>
    );
  }
}

export default Home;
