import React, { Component } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { NavLink } from "react-router-dom";
import NavBar from "../../components/navbar/navbar";
import HomeMap from "../../components/leaflet/homemap";
import SummaryTable from "../../components/summarytable/summarytable";
import Footer from "../../components/footer/footer";
import Translations from "../../translations.json";
import searchIcon from "../../img/search.png";
import mapIcon from "../../img/map.png";
import threedIcon from "../../img/3dicon.png";
import onedIcon from "../../img/1dicon.png";
import satelliteIcon from "../../img/satelliteicon.png";
import insituIcon from "../../img/insituicon.png";
import dropdownIcon from "../../img/sort.png";
import sortIcon from "../../img/sortdesc.png";
import back from "../../img/back.png";
import {
  onMouseOver,
  onMouseOut,
  searchList,
  inBounds,
  fetchDataParallel,
} from "./functions";
import { hour, summariseData } from "../../global";
import CONFIG from "../../config.json";
import "./home.css";

class ListSkeleton extends Component {
  render() {
    return (
      <React.Fragment>
        {[...Array(15).keys()].map((a) => (
          <div className="list-item-skeleton" key={a}>
            <div className="text-skeleton">
              <div className="name-skeleton pulse" />
            </div>
            <div className="logos-skeleton">
              <div className="logo-skeleton" />
              <div className="logo-skeleton" />
              <div className="logo-skeleton" />
            </div>
            <div className="sketelon-graph">
              <div className="skeleton-block pulse-border" />
              <div className="skeleton-block pulse-border" />
              <div className="skeleton-block pulse-border" />
              <div className="skeleton-block pulse-border" />
              <div className="skeleton-block pulse-border right" />
            </div>
            <div className="skeleton-data" />
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
      clearSearch,
      search,
      language,
      filters,
      filterTypes,
      results,
      loaded,
      sort,
      setSort,
      ascending,
      toggleAscending,
    } = this.props;
    return (
      <div className="search">
        <div className="search-bar">
          <input
            type="text"
            placeholder={Translations.searchLakes[language]}
            value={search}
            onChange={setSearch}
            onKeyDown={this.handleKeyDown}
            id="search"
          />
          <div
            className={
              search.length > 0
                ? "search-clear-text active"
                : "search-clear-text"
            }
            onClick={clearSearch}
          >
            &#10005;
          </div>
          <img src={searchIcon} alt="Search Icon" className="search-icon" />
          <div className="description">{Translations.tagline[language]}</div>
        </div>
        <div className="filters">
          {filterTypes.map((f) => (
            <div
              className={filters.includes(f.id) ? "filter selected" : "filter"}
              key={f.id}
              onClick={() => setFilter(f.id)}
              title={f.description}
            >
              <div className="left-filter">
                <img src={f.icon} alt={f.description} />
              </div>
              <div className="right-filter">{f.name}</div>
            </div>
          ))}
        </div>
        <div className="sort">
          {sort !== "" ? (
            <img
              src={sortIcon}
              alt="Sort"
              onClick={toggleAscending}
              className={ascending ? "sort-icon asc" : "sort-icon"}
            />
          ) : (
            <img src={dropdownIcon} alt="Dropdown" className="dropdown-icon" />
          )}
          <select value={sort} onChange={setSort} id="sort-select">
            <option value="" disabled>
              {Translations.sort[language]}
            </option>
            <option value="elevation">
              {Translations.elevation[language]}
            </option>
            <option value="max_depth">{Translations.depth[language]}</option>
            <option value="area">{Translations.surfaceArea[language]}</option>
          </select>
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
      filterTypes,
      filters,
      setFavorties,
      favorites,
      sort,
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
            {sortedList
              .filter((lake) => lake.display && !lake.filter)
              .map((lake) => (
                <ListItem
                  lake={lake}
                  language={language}
                  key={lake.key}
                  filterTypes={filterTypes}
                  filters={filters}
                  setFavorties={setFavorties}
                  favorites={favorites}
                  sort={sort}
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
      filterTypes,
      filters,
      setFavorties,
      favorites,
      sort,
    } = this.props;
    var selected = favorites.includes(lake.key);
    var units = {
      elevation: Translations.elevationUnit[language],
      max_depth: "m",
      area: "km²",
    };
    return (
      <NavLink to={`/${lake.key}`}>
        <div
          className="list-item"
          id={"list-" + lake.key}
          onMouseOver={onMouseOver}
          onMouseOut={onMouseOut}
          title={Translations.click[language]}
        >
          <div className="properties">
            <div className="left">
              {lake.name[language]}
              <div
                className={selected ? "favorite full" : "favorite"}
                title={selected ? "Remove" : "Save"}
                onClick={(event) => {
                  event.preventDefault();
                  setFavorties(lake.key);
                }}
              >
                &#9733;
              </div>
              {sort in lake && (
                <div className="filter-property">
                  {lake[sort]} {units[sort]}
                </div>
              )}
            </div>
            <div className="right">
              <div className="view">
                {filterTypes
                  .filter((f) => lake.filters.includes(f.id))
                  .map((f) => (
                    <img
                      className={filters.includes(f.id) ? "select" : ""}
                      key={f.id}
                      src={f.icon}
                      alt={f.description}
                    />
                  ))}
              </div>
            </div>
          </div>
          <div className="summary">
            {lake.summary && (
              <div className="summary-table">
                <SummaryTable
                  start={lake.start}
                  end={lake.end}
                  dt={lake.time}
                  value={lake.values}
                  summary={lake.summary}
                  unit={"°"}
                  language={language}
                />
              </div>
            )}
          </div>
        </div>
      </NavLink>
    );
  }
}

class Home extends Component {
  state = {
    list: [],
    days: [],
    search: "",
    sort: "",
    ascending: false,
    filters: [],
    boundingBox: false,
    fullscreen: false,
    insitu: false,
    favorites:
      JSON.parse(localStorage.getItem("favorites")) === null
        ? []
        : JSON.parse(localStorage.getItem("favorites")),
  };
  toggleFullscreen = () => {
    if (this.state.fullscreen) {
      window.scroll(0, 0);
    }
    this.setState({ fullscreen: !this.state.fullscreen }, () => {
      window.dispatchEvent(new Event("resize"));
    });
  };
  toggleAscending = () => {
    this.setState({ ascending: !this.state.ascending });
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
  clearSearch = () => {
    var { list } = this.state;
    var search = "";
    this.setState({ search });
    list = searchList(search, list);
    this.setState({ list });
  };
  setSort = (event) => {
    this.setState({ sort: event.target.value });
  };
  sortList = (list, filters, favorites, sort, ascending) => {
    var { boundingBox } = this.state;
    list.sort((a, b) => {
      if (sort !== "") {
        const valA =
          a[sort] === "NA" ? (ascending ? Infinity : -Infinity) : a[sort];
        const valB =
          b[sort] === "NA" ? (ascending ? Infinity : -Infinity) : b[sort];
        if (valA < valB) {
          return ascending ? -1 : 1;
        }
        if (valA > valB) {
          return ascending ? 1 : -1;
        }
        return 0;
      } else {
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
        if (a.summary && !b.summary) {
          return -1;
        }
        if (!a.summary && b.summary) {
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
      }
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
    var urls = {
      list: `${CONFIG.alplakes_bucket}/static/website/metadata/${CONFIG.branch}/list.json`,
      forecast: `${CONFIG.alplakes_bucket}/simulations/forecast.json${hour()}`,
      geometry: `${CONFIG.alplakes_bucket}/static/website/metadata/${CONFIG.branch}/lakes.geojson`,
      insitu: `${
        CONFIG.alplakes_bucket
      }/insitu/summary/water_temperature.geojson${hour()}`,
    };
    var { list, forecast, geometry, insitu } = await fetchDataParallel(urls);
    geometry = geometry.features.reduce((obj, item) => {
      obj[item.properties.key] = item.geometry.coordinates;
      return obj;
    }, {});
    var days = [];
    list.map((l) => {
      l.display = true;
      if (l.key in forecast) {
        l.time = forecast[l.key]["time"];
        l.values = forecast[l.key]["temperature"];
        let { summary, start, end } = summariseData(l.time, l.values);
        if (Object.keys(summary).length > days.length)
          days = Object.keys(summary);
        l.summary = summary;
        l.start = start;
        l.end = end;
      } else {
        l.summary = false;
      }

      if (l.key in geometry) {
        l.geometry = geometry[l.key];
      } else {
        l.geometry = false;
      }
      return l;
    });
    this.setState({ list, days, insitu });
  }
  componentWillUnmount() {
    window.removeEventListener("keydown", this.focusSearchBar);
  }
  render() {
    var { language, dark } = this.props;
    var {
      list,
      insitu,
      search,
      filters,
      fullscreen,
      favorites,
      sort,
      ascending,
      days,
    } = this.state;
    var sortedList = this.sortList(list, filters, favorites, sort, ascending);
    var results = sortedList.filter((l) => l.display && !l.filter).length;
    var filterTypes = [
      {
        id: "3D",
        name: "3D Model",
        description: Translations.threedDescription[language],
        icon: threedIcon,
      },
      {
        id: "1D",
        name: "1D Model",
        description: Translations.onedDescription[language],
        icon: onedIcon,
      },
      {
        id: "satellite",
        name: Translations.satellite[language],
        description: Translations.satelliteDescription[language],
        icon: satelliteIcon,
      },
      {
        id: "insitu",
        name: Translations.insitu[language],
        description: Translations.insituDescription[language],
        icon: insituIcon,
      },
    ];
    return (
      <React.Fragment>
        <Helmet>
          <title>Alplakes</title>
          <meta
            name="description"
            content="Check the latest conditions of hundreds of lakes across the European Alps, with forecasts, measurements, and trends at your fingertips."
          />
        </Helmet>
        <NavBar {...this.props} small={true} />
        <div className="home">
          <div className="mobile-fade-out" />
          <div className="content">
            <SearchWithNavigate
              setFilter={this.setFilter}
              setSearch={this.setSearch}
              clearSearch={this.clearSearch}
              search={search}
              language={language}
              filters={filters}
              filterTypes={filterTypes}
              results={results}
              loaded={list.length > 0}
              sortedList={sortedList}
              sort={sort}
              setSort={this.setSort}
              ascending={ascending}
              toggleAscending={this.toggleAscending}
            />
            <List
              language={language}
              sortedList={sortedList}
              sort={sort}
              search={search}
              results={results}
              filterTypes={filterTypes}
              filters={filters}
              setFavorties={this.setFavorties}
              favorites={favorites}
            />
            <div className={fullscreen ? "home-map" : "home-map hide"}>
              <HomeMap
                list={list}
                insitu={insitu}
                days={days}
                dark={dark}
                language={language}
                setBounds={this.setBounds}
              />
              <div
                className={fullscreen ? "back-button" : "back-button hide"}
                onClick={this.toggleFullscreen}
              >
                <img src={back} alt="Back" />
              </div>
            </div>
            <div
              className={fullscreen ? "map-button hide" : "map-button"}
              onClick={this.toggleFullscreen}
            >
              {Translations.map[language]}
              <img src={mapIcon} alt="Map" />
            </div>
          </div>
          <Footer {...this.props} small={true} />
        </div>
      </React.Fragment>
    );
  }
}

export default Home;
