import React, { Component } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import NavBar from "../../components/navbar/navbar";
import HomeMap from "../../components/leaflet/homemap";
import List from "./list";
import Footer from "../../components/footer/footer";
import Translations from "../../translations.json";
import searchIcon from "../../img/search.png";
import mapIcon from "../../img/map.png";
import threedIcon from "../../img/3dicon.png";
import waveIcon from "../../img/waveicon.png";
import onedIcon from "../../img/1dicon.png";
import satelliteIcon from "../../img/satelliteicon.png";
import insituIcon from "../../img/insituicon.png";
import back from "../../img/back.png";
import {
  SortFilterControls,
  SortFilterSheet,
} from "../../components/sortfilter/sortfilter";
import {
  searchList,
  inBounds,
  fetchDataParallel,
  matchesSources,
  matchesCountries,
  satelliteTypes,
} from "./functions";
import { hour, summariseData } from "../../global";
import CONFIG from "../../config.json";
import "./home.css";

class Search extends Component {
  handleKeyDown = (event) => {
    if (event.key === "Enter") {
      var { sortedList } = this.props;
      var visible = sortedList.filter((s) => s.display && !s.filter);
      if (visible.length === 1) {
        this.props.navigate(visible[0].key);
      }
    }
  };
  render() {
    var {
      setSearch,
      clearSearch,
      search,
      language,
      results,
      loaded,
      activeCount,
      pills,
      openSortFilter,
      removePill,
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
        <SortFilterControls
          language={language}
          activeCount={activeCount}
          pills={pills}
          onOpen={openSortFilter}
          onRemovePill={removePill}
          ascending={ascending}
          onToggleAscending={toggleAscending}
          right={
            <div className="results">
              {loaded
                ? `${results} ${Translations.results[language]}`
                : Translations.loadingLakes[language]}
            </div>
          }
        />
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

class Home extends Component {
  state = {
    list: [],
    days: [],
    search: "",
    sort: "",
    ascending: false,
    filters: [],
    countries: [],
    sortFilterOpen: false,
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
      filters = [...filters, filter];
    }
    this.setState({ filters });
  };
  setCountry = (country) => {
    var { countries } = this.state;
    if (countries.includes(country)) {
      countries = countries.filter((c) => c !== country);
    } else {
      countries = [...countries, country];
    }
    this.setState({ countries });
  };
  openSortFilter = () => {
    this.setState({ sortFilterOpen: true });
  };
  closeSortFilter = () => {
    this.setState({ sortFilterOpen: false });
  };
  clearAll = () => {
    this.setState({
      filters: [],
      countries: [],
      sort: "",
      ascending: false,
      sortFilterOpen: false,
    });
  };
  removePill = (pill) => {
    if (pill.type === "sort") {
      this.setSort("");
    } else if (pill.type === "country") {
      this.setCountry(pill.id);
    } else {
      this.setFilter(pill.id);
    }
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
  setSort = (sort) => {
    this.setState({ sort, ascending: false });
  };
  toggleAscending = () => {
    this.setState({ ascending: !this.state.ascending });
  };
  firstDayTemperature = (lake) => {
    if (!lake.summary) {
      return null;
    }
    const days = Object.keys(lake.summary).sort();
    return days.length > 0 ? lake.summary[days[0]] : null;
  };
  sortList = (list, filters, countries, favorites, sort, ascending, language) => {
    var { boundingBox } = this.state;
    const direction = ascending ? -1 : 1;
    list.sort((a, b) => {
      if (sort === "warmest" || sort === "coolest") {
        const valA = this.firstDayTemperature(a);
        const valB = this.firstDayTemperature(b);
        if (valA === null && valB === null) {
          return 0;
        }
        if (valA === null) {
          return 1;
        }
        if (valB === null) {
          return -1;
        }
        return (sort === "warmest" ? valB - valA : valA - valB) * direction;
      } else if (sort === "az") {
        return a.name[language].localeCompare(b.name[language]) * direction;
      } else if (sort !== "") {
        const valA =
          a[sort] === "NA" ? (ascending ? Infinity : -Infinity) : a[sort];
        const valB =
          b[sort] === "NA" ? (ascending ? Infinity : -Infinity) : b[sort];
        if (valA < valB) {
          return direction;
        }
        if (valA > valB) {
          return -direction;
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
      l.filter = !(matchesSources(l, filters) && matchesCountries(l, countries));
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
      if (this.state.sortFilterOpen) {
        return;
      }
      if (e.key.length === 1 && e.key.match(/[a-z]/i)) {
        document.getElementById("search").focus();
      }
    } catch (e) {}
  };
  async componentDidMount() {
    window.addEventListener("keydown", this.focusSearchBar);
    this.handleKeyDown = (e) => {
      if (e.key === "Escape") {
        if (this.state.sortFilterOpen) {
          this.closeSortFilter();
        } else if (this.state.fullscreen) {
          this.toggleFullscreen();
        }
      }
    };
    document.addEventListener("keydown", this.handleKeyDown);
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
        try {
          l.time = forecast[l.key]["time"];
          l.values = forecast[l.key]["temperature"];
          let { summary, start, end } = summariseData(l.time, l.values);
          if (Object.keys(summary).length > days.length)
            days = Object.keys(summary);
          l.summary = summary;
          l.start = start;
          l.end = end;
        } catch (e) {
          console.error(`Failed to process forecast for ${l.key}`)
          l.summary = false;
        }
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
    document.removeEventListener("keydown", this.handleKeyDown);
  }
  render() {
    var { language, dark } = this.props;
    var {
      list,
      insitu,
      search,
      filters,
      countries,
      sortFilterOpen,
      fullscreen,
      favorites,
      sort,
      ascending,
      days,
    } = this.state;
    var sortedList = this.sortList(
      list,
      filters,
      countries,
      favorites,
      sort,
      ascending,
      language
    );
    var results = sortedList.filter((l) => l.display && !l.filter).length;
    var filterTypes = [
      {
        id: "3D",
        name: Translations.threedModel[language],
        description: Translations.threedDescription[language],
        icon: threedIcon,
      },
      {
        id: "2D",
        name: Translations.waveModel[language],
        description: Translations.twodDescription[language],
        icon: waveIcon,
      },
      {
        id: "1D",
        name: Translations.onedModel[language],
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
    var sortOptions = [
      { id: "warmest", label: Translations.warmest[language] },
      { id: "coolest", label: Translations.coolest[language] },
      { id: "az", label: Translations.az[language] },
      { id: "elevation", label: Translations.elevation[language] },
      { id: "max_depth", label: Translations.depth[language] },
      { id: "area", label: Translations.surfaceArea[language] },
    ];
    const satelliteNames = {
      sentinel2: "Sentinel-2",
      sentinel3: "Sentinel-3",
      collection: "Landsat",
      swot: "SWOT",
    };
    var availableSatellites = satelliteTypes.filter((type) =>
      list.some(
        (l) => Array.isArray(l.satellites) && l.satellites.includes(type)
      )
    );
    var sourceOptions = [filterTypes[0]];
    if (list.some((l) => Array.isArray(l.filters) && l.filters.includes("2D"))) {
      sourceOptions.push(filterTypes[1]);
    }
    sourceOptions.push(filterTypes[2]);
    if (availableSatellites.length > 0) {
      availableSatellites.forEach((type) => {
        sourceOptions.push({
          id: type,
          name: satelliteNames[type],
          description:
            type === "swot"
              ? Translations.swotDescription[language]
              : Translations.satelliteDescription[language],
          icon: satelliteIcon,
        });
      });
    } else {
      sourceOptions.push(filterTypes[3]);
    }
    sourceOptions.push(filterTypes[4]);
    const countryNames = {
      CH: Translations.switzerland[language],
      IT: Translations.italy[language],
      FR: Translations.france[language],
      AT: Translations.austria[language],
      DE: Translations.germany[language],
      SI: Translations.slovenia[language],
    };
    const countryOrder = ["CH", "IT", "FR", "AT", "DE", "SI"];
    var countryOptions = [
      ...new Set(
        list.flatMap((l) => (Array.isArray(l.countries) ? l.countries : []))
      ),
    ]
      .sort((a, b) => {
        const indexA = countryOrder.indexOf(a);
        const indexB = countryOrder.indexOf(b);
        if (indexA === -1 && indexB === -1) return a.localeCompare(b);
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
      })
      .map((code) => ({ code, label: countryNames[code] || code }));
    var pills = [];
    if (sort !== "") {
      pills.push({
        type: "sort",
        id: sort,
        label: sortOptions.find((o) => o.id === sort).label,
      });
    }
    countries.forEach((code) => {
      pills.push({
        type: "country",
        id: code,
        label: countryNames[code] || code,
      });
    });
    filters.forEach((id) => {
      const option = sourceOptions.find((o) => o.id === id);
      pills.push({
        type: "source",
        id,
        label: option ? option.name : id,
        icon: option ? option.icon : satelliteIcon,
      });
    });
    var activeCount = filters.length + countries.length + (sort !== "" ? 1 : 0);
    var highlightFilters = filters.map((f) =>
      satelliteTypes.includes(f) ? "satellite" : f
    );
    var filterSignature = filters.join(",") + "|" + countries.join(",");
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
              setSearch={this.setSearch}
              clearSearch={this.clearSearch}
              search={search}
              language={language}
              results={results}
              loaded={list.length > 0}
              sortedList={sortedList}
              activeCount={activeCount}
              pills={pills}
              openSortFilter={this.openSortFilter}
              removePill={this.removePill}
              ascending={ascending}
              toggleAscending={this.toggleAscending}
            />
            <SortFilterSheet
              open={sortFilterOpen}
              language={language}
              sort={sort}
              setSort={this.setSort}
              filters={filters}
              setFilter={this.setFilter}
              countries={countries}
              setCountry={this.setCountry}
              sortOptions={sortOptions}
              countryOptions={countryOptions}
              sourceOptions={sourceOptions}
              results={results}
              loaded={list.length > 0}
              onClose={this.closeSortFilter}
              onClearAll={this.clearAll}
            />
            <List
              language={language}
              sortedList={sortedList}
              sort={sort}
              search={search}
              results={results}
              loaded={list.length > 0}
              filterTypes={filterTypes}
              filters={highlightFilters}
              setFavorties={this.setFavorties}
              favorites={favorites}
              pills={pills}
            />
            <div className={`home-map${fullscreen ? " map-fullscreen" : " hide"}`}>
              <HomeMap
                list={list}
                filterSignature={filterSignature}
                insitu={insitu}
                days={days}
                dark={dark}
                language={language}
                setBounds={this.setBounds}
                toggleFullscreen={this.toggleFullscreen}
                fullscreen={fullscreen}
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
