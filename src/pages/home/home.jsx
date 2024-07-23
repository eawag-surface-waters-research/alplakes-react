import React, { Component } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import axios from "axios";
import { NavLink } from "react-router-dom";
import NavBar from "../../components/navbar/navbar";
import HomeGraph from "../../components/d3/homegraph/homegraph";
import Translations from "../../translations.json";
import searchIcon from "../../img/search.png";
import depth_icon from "../../img/depth.png";
import area_icon from "../../img/area.png";
import elevation_icon from "../../img/elevation.png";
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
            <div className="lake-shape-skeleton pulse"></div>
            <div className="text-skeleton">
              <div className="name-skeleton pulse"></div>
              <div className="parameters-skeleton pulse"></div>
              <div className="graph-title-skeleton pulse"></div>
            </div>
            <div className="sketelon-graph">
              <div className="skeleton-block pulse-border"></div>
              <div className="skeleton-block pulse-border"></div>
              <div className="skeleton-block pulse-border"></div>
              <div className="skeleton-block pulse-border"></div>
              <div className="skeleton-block pulse-border right"></div>
            </div>
          </div>
        ))}
      </React.Fragment>
    );
  }
}

class Search extends Component {
  compareDicts = (values) => {
    return function (a, b) {
      let valueA = a.id;
      let valueB = b.id;
      if (values.includes(valueA) && values.includes(valueB)) {
        return values.indexOf(valueA) - values.indexOf(valueB);
      } else if (values.includes(valueA)) {
        return -1;
      } else if (values.includes(valueB)) {
        return 1;
      } else {
        return 0;
      }
    };
  };
  handleKeyDown = (event) => {
    if (event.key === "Enter") {
      var { sortedList } = this.props;
      var visible = sortedList.filter((s) => s.display);
      if (visible.length === 1) {
        this.props.navigate(visible[0].key);
      }
    }
  };
  render() {
    var {
      setFilter,
      setSearch,
      search,
      language,
      filters,
      filterTypes,
      results,
      loaded,
    } = this.props;
    var ft = JSON.parse(JSON.stringify(filterTypes));
    ft.sort(this.compareDicts(filters));
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
          onKeyDown={this.handleKeyDown}
          id="search"
        />
        <img src={searchIcon} alt="Search Icon" />
        <div className="filters">
          {filters.length > 0 && (
            <div
              className="filter remove"
              onClick={() => setFilter(false)}
              title={Translations.removeFilters[language]}
            >
              &#215;
            </div>
          )}
          {ft.map((f) => (
            <div
              className={filters.includes(f.id) ? "filter selected" : "filter"}
              key={f.id}
              onClick={() => setFilter(f.id)}
              title={f.description}
            >
              {f.name}
            </div>
          ))}
        </div>
        <div className="results">
          {loaded
            ? `${results} ${Translations.results[language]}`
            : Translations.loadingLakes[language]}
        </div>
      </div>
    );
  }
}

const withNavigate = (Component) => {
  return (props) => {
    const navigate = useNavigate();
    return <Component {...props} navigate={navigate} />;
  };
};

const SearchWithNavigate = withNavigate(Search);

class List extends Component {
  render() {
    var {
      language,
      sortedList,
      results,
      search,
      parameter,
      parameters,
      filterTypes,
      filters,
      setFavorties,
      favorites,
    } = this.props;
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
                filterTypes={filterTypes}
                filters={filters}
                setFavorties={setFavorties}
                favorites={favorites}
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
    var {
      lake,
      language,
      parameter,
      parameters,
      filterTypes,
      filters,
      setFavorties,
      favorites,
    } = this.props;
    var selected = favorites.includes(lake.key);
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
              {selected ? (
                <div
                  className="favorite full"
                  title="Remove"
                  onClick={(event) => {
                    event.preventDefault();
                    setFavorties(lake.key);
                  }}
                >
                  &#9733;
                </div>
              ) : (
                <div
                  className="favorite"
                  title="Save"
                  onClick={(event) => {
                    event.preventDefault();
                    setFavorties(lake.key);
                  }}
                >
                  &#9734;
                </div>
              )}
              <div className="label">
                <div className="property">
                  <div className="icon">
                    <img src={depth_icon} alt="depth" />
                  </div>
                  <div className="text">{lake.max_depth} m</div>
                </div>
                <div className="property">
                  <div className="icon">
                    <img src={area_icon} alt="area" />
                  </div>
                  <div className="text"> {lake.area} km&#178;</div>
                </div>
                <div className="property">
                  <div className="icon">
                    <img src={elevation_icon} alt="elevation" />
                  </div>
                  <div className="text">{lake.elevation} m.a.s.l.</div>
                </div>
                <div className="header">
                  {`${Translations[parameters[parameter].label][language]}`}
                </div>
              </div>
            </div>
            <div className="right">
              <div className="view">
                {filterTypes
                  .filter((f) => lake.filters.includes(f.id))
                  .map((f) => (
                    <div
                      className={
                        filters.includes(f.id) ? "type select" : "type"
                      }
                      key={f.id}
                    >
                      {f.name}
                    </div>
                  ))}
                <div className="type plus">+</div>
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
    var { forecast, language, parameter, parameters } = this.props;
    return (
      <React.Fragment>
        {Object.keys(forecast.summary).map((day, i, arr) =>
          forecast.summary[day][parameter] === false ? null : (
            <div key={day} className={i === 0 ? "inner start" : "inner"}>
              <div className="ave">
                {forecast.summary[day][parameter]}
                <div
                  className={parameter === "temperature" ? "unit full" : "unit"}
                >
                  {parameters[parameter].unit}
                </div>
              </div>
              <div className="day">{dayName(day, language, Translations)}</div>
            </div>
          )
        )}
        <HomeGraph
          dt={forecast.dt}
          value={forecast.value[parameter]}
          dtMin={forecast.dtMin}
          dtMax={forecast.dtMax}
        />
      </React.Fragment>
    );
  }
}

class Home extends Component {
  state = {
    list: [],
    search: "",
    filters: [],
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
    favorites:
      JSON.parse(localStorage.getItem("favorites")) === null
        ? []
        : JSON.parse(localStorage.getItem("favorites")),
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
    if (filter === false) {
      filters = [];
    } else if (filters.includes(filter)) {
      filters = filters.filter((f) => f !== filter);
    } else {
      filters.push(filter);
    }
    this.setState({ filters });
  };
  setSearch = (event) => {
    var { list } = this.state;
    var search = event.target.value;
    this.setState({ search });
    list = searchList(search, list);
    this.setState({ list });
  };
  sortList = (list, filters, favorites) => {
    var { boundingBox } = this.state;
    list.sort((a, b) => {
      // 1. Sort by favorites
      if (favorites.includes(a.key) && !favorites.includes(b.key)) {
        return -1;
      }
      if (!favorites.includes(a.key) && favorites.includes(b.key)) {
        return 1;
      }
      // 2. Sort if in map area
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
      // 3. Sort if forecast available
      if (a.forecast.available && !b.forecast.available) {
        return -1;
      }
      if (!a.forecast.available && b.forecast.available) {
        return 1;
      }
      // 4. Sort by surface area
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
  setFavorties = (favorite) => {
    var { favorites } = this.state;
    if (favorites.includes(favorite)) {
      favorites = favorites.filter((f) => f !== favorite);
    } else {
      favorites.push(favorite);
    }
    localStorage.setItem("favorites", JSON.stringify(favorites));
    this.setState({ favorites });
  };
  focusSearchBar = (e) => {
    try {
      if (e.key.length === 1 && e.key.match(/[a-z]/i)) {
        document.getElementById("search").focus();
      }
    } catch (e) {}
  };
  async componentDidMount() {
    window.addEventListener("keydown", this.focusSearchBar);
    var { parameter, parameters } = this.state;
    var geometry, forecast;
    const { data: list } = await axios.get(
      CONFIG.alplakes_bucket +
        `/static/website/metadata/${CONFIG.branch}/list.json`
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
      ({ data: geometry } = await axios.get(
        CONFIG.alplakes_bucket +
          `/static/website/metadata/${CONFIG.branch}/lakes.geojson`
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
  componentWillUnmount() {
    window.removeEventListener("keydown", this.focusSearchBar);
  }
  render() {
    var { language, dark } = this.props;
    var {
      list,
      search,
      filters,
      fullscreen,
      parameter,
      parameters,
      favorites,
    } = this.state;
    var sortedList = this.sortList(list, filters, favorites);
    var results = sortedList.filter((l) => l.display && !l.filter).length;
    var filterTypes = [
      {
        id: "3D",
        name: "3D",
        description: Translations.threedDescription[language],
      },
      {
        id: "satellite",
        name: Translations.satellite[language],
        description: Translations.satelliteDescription[language],
      },
      {
        id: "1D",
        name: "1D",
        description: Translations.onedDescription[language],
      },
      {
        id: "live",
        name: Translations.live[language],
        description: Translations.liveDescription[language],
      },
      {
        id: "insitu",
        name: Translations.insitu[language],
        description: Translations.insituDescription[language],
      },
    ];
    return (
      <div className="home">
        <Helmet>
          <title>Alplakes</title>
          <meta
            name="description"
            content="Monitoring and forecasting of lakes across the European alpine region."
          />
        </Helmet>
        <NavBar {...this.props} small={true} />
        <div
          className={parameters[parameter].beta ? "content beta" : "content"}
        >
          <SearchWithNavigate
            setFilter={this.setFilter}
            setSearch={this.setSearch}
            search={search}
            language={language}
            filters={filters}
            filterTypes={filterTypes}
            results={results}
            loaded={list.length > 0}
            sortedList={sortedList}
          />
          <List
            language={language}
            sortedList={sortedList}
            search={search}
            parameter={parameter}
            parameters={parameters}
            results={results}
            filterTypes={filterTypes}
            filters={filters}
            setFavorties={this.setFavorties}
            favorites={favorites}
          />
          <div className={fullscreen ? "home-map" : "home-map hide"}>
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
          <div
            className={fullscreen ? "map-button map-view" : "map-button"}
            onClick={this.toggleFullscreen}
          >
            {fullscreen ? "Search" : "Map"}
          </div>
        </div>
        <Footer {...this.props} small={true} />
      </div>
    );
  }
}

export default Home;
