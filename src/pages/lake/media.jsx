import React, { Component } from "react";
import Basemap from "../../components/leaflet/basemap";
import Slider from "../../components/sliders/slider";
import Colorbar from "../../components/colors/colorbar";
import Graphs from "./graphs";
import Translate from "../../translations.json";
import next from "../../img/next.svg";
import settings_icon from "../../img/settings.svg";
//import tools_icon from "../../img/tools.png";
import fullscreen_icon from "../../img/fullscreen.png";
import normalscreen_icon from "../../img/normalscreen.png";
import swiss from "../../img/swiss.png";
import italian from "../../img/italian.png";
import french from "../../img/french.png";
import CONFIG from "../../config.json";
import {
  formatDate,
  formatTime,
  getProfileAlplakesHydrodynamic,
  getTransectAlplakesHydrodynamic,
} from "./functions";
import "./lake.css";

class Loading extends Component {
  render() {
    return (
      <div className="loading" id="loading">
        <div className="loading-symbol">
          <span className="loader" />
        </div>
        <div className="loading-text" id="loading-text">
          Loading
        </div>
      </div>
    );
  }
}

class Legend extends Component {
  render() {
    var { layers, language } = this.props;
    return (
      <div className="legend">
        <table>
          <tbody>
            {layers
              .filter(
                (l) =>
                  ["min", "max", "palette"].every((key) =>
                    Object.keys(l.properties.options).includes(key)
                  ) &&
                  l.active &&
                  ("raster" in l.properties.options
                    ? l.properties.options.raster
                    : true)
              )
              .map((l) => (
                <Colorbar
                  min={l.properties.options.min}
                  max={l.properties.options.max}
                  palette={l.properties.options.palette}
                  unit={l.properties.unit}
                  key={l.id}
                  text={
                    l.properties.parameter in Translate
                      ? Translate[l.properties.parameter][language]
                      : ""
                  }
                />
              ))}
          </tbody>
        </table>
      </div>
    );
  }
}

class Settings extends Component {
  render() {
    var {
      settings,
      timestep,
      setTimestep,
      timeout,
      setSpeed,
      basemap,
      setBasemap,
      legend,
      toggleLegend,
    } = this.props;
    return (
      <div
        className={settings ? "settings-modal" : "settings-modal hidden"}
        id="settings"
      >
        <table>
          <tbody>
            <tr>
              <td></td>
              <td>Step Interval</td>
              <td className="settings-input">
                <select value={timestep} onChange={setTimestep}>
                  <option value={600000}>10 Mins</option>
                  <option value={1800000}>30 Mins</option>
                  <option value={3600000}>1 Hour</option>
                  <option value={10800000}>3 Hours</option>
                  <option value={86400000}>1 Day</option>
                </select>
              </td>
            </tr>
            <tr>
              <td></td>
              <td>Playback Speed</td>
              <td className="settings-input">
                <select value={timeout} onChange={setSpeed}>
                  <option value={1200}>x 0.1</option>
                  <option value={400}>x 0.2</option>
                  <option value={300}>x 0.5</option>
                  <option value={150}>Normal</option>
                  <option value={50}>x 2</option>
                  <option value={1}>x 5</option>
                </select>
              </td>
            </tr>
            <tr>
              <td></td>
              <td>Basemap</td>
              <td className="settings-input">
                <select value={basemap} onChange={setBasemap}>
                  {Object.keys(CONFIG.basemaps).map((b) => (
                    <option value={b} key={b}>
                      {CONFIG.basemaps[b].title}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
            <tr>
              <td></td>
              <td>Legend</td>
              <td className="settings-input">
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={legend}
                    onChange={toggleLegend}
                  />
                  <span className="slider round"></span>
                </label>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
}

class Media extends Component {
  state = {
    settings: false,
    legend: true,
    controls: true,
    cursor: "point",
    graphs: false,
    graphData: false,
  };

  getProfile = async (latlng, layer) => {
    var { graphData } = this.state;
    var { period } = this.props;
    await this.props.lock();
    if (layer.type === "alplakes_profile") {
      graphData = await getProfileAlplakesHydrodynamic(
        CONFIG.alplakes_api,
        layer.properties.model,
        layer.properties.lake,
        period,
        latlng
      );
      if (graphData) {
        graphData["type"] = "profile";
        graphData["layer"] = layer;
      }
    }
    this.props.unlock();
    if (graphData === false) {
      window.alert("Failed to collect profile please try again.");
      this.closeGraph();
    } else {
      this.setState({ graphData, graphs: true });
    }
  };

  closeGraph = () => {
    this.setState({ graphData: false, graphs: false });
    this.props.clearOverlays();
  };

  getTransect = async (latlng, layer) => {
    var { graphData } = this.state;
    var { period } = this.props;
    await this.props.lock();
    if (layer.type === "alplakes_transect") {
      graphData = await getTransectAlplakesHydrodynamic(
        CONFIG.alplakes_api,
        layer.properties.model,
        layer.properties.lake,
        period,
        latlng
      );
      if (graphData) {
        graphData["type"] = "transect";
        graphData["layer"] = layer;
      }
    }
    this.props.unlock();
    if (graphData === false) {
      window.alert("Failed to collect transect please try again.");
      this.closeGraph();
    } else {
      this.setState({ graphData, graphs: true });
    }
  };

  toggleSettings = () => {
    this.setState({ settings: !this.state.settings });
  };
  toggleLegend = () => {
    this.setState({ legend: !this.state.legend });
  };
  escFunction = (event) => {
    if (event.key === "Escape") {
      this.setState({ fullscreen: false }, () => {
        window.dispatchEvent(new Event("resize"));
      });
    }
  };
  closeWindows = (event) => {
    var { settings } = this.state;
    if (settings) {
      if (
        !document.getElementById("settings").contains(event.target) &&
        !document.getElementById("settings-icon").contains(event.target)
      ) {
        this.setState({ settings: false });
      }
    }
  };
  componentDidMount() {
    document.addEventListener("keydown", this.escFunction, false);
    document.addEventListener("click", this.closeWindows);
  }
  componentWillUnmount() {
    document.removeEventListener("keydown", this.escFunction, false);
    document.removeEventListener("click", this.closeWindows);
  }
  render() {
    var {
      period,
      play,
      togglePlay,
      setDatetime,
      datetime,
      timestep,
      nextStep,
      timeout,
      setSpeed,
      setTimestep,
      language,
      basemap,
      metadata,
      setBasemap,
      fullscreen,
      toggleFullscreen,
      layers,
      openSiderbar,
      clickblock,
      frozen,
      closeFrozen,
    } = this.props;
    var { settings, legend, graphData, graphs } = this.state;
    var descriptions = Translate.descriptions[language];
    var flags = { swiss: swiss, italian: italian, french: french };
    return (
      <div className="map-component">
        {frozen && (
          <div className="frozen">
            Lake is currently ice covered, simulations are paused during this
            period and will restart when the ice melts. Historical conditions
            can still be accessed.
            <div className="close" onClick={closeFrozen}>
              &#215;
            </div>
          </div>
        )}
        {legend && <Legend layers={layers} language={language} />}
        {graphs && (
          <Graphs
            data={graphData}
            close={this.closeGraph}
            metadata={metadata}
            datetime={datetime}
          />
        )}
        <div className="viewport">
          <Basemap
            {...this.props}
            getProfile={this.getProfile}
            getTransect={this.getTransect}
            openSiderbar={openSiderbar}
          />
        </div>
        <div className="gradient" />
        <Settings
          settings={settings}
          timestep={timestep}
          setTimestep={setTimestep}
          timeout={timeout}
          setSpeed={setSpeed}
          basemap={basemap}
          setBasemap={setBasemap}
          legend={legend}
          toggleLegend={this.toggleLegend}
        />
        <Loading />
        <div className="playback">
          <div className="slider">
            <Slider
              period={period}
              timestep={timestep}
              datetime={datetime}
              setDatetime={setDatetime}
            />
          </div>
          <div className="play-controls">
            <div className="play-pause clickable-button">
              <span className="tooltip">{Translate.play[language]}</span>
              <button onClick={togglePlay}>
                <div
                  className={
                    play ? "play-pause-icon paused" : "play-pause-icon"
                  }
                ></div>
              </button>
            </div>
            <div className="next-frame clickable-button">
              <span className="tooltip">{Translate.next[language]}</span>
              <button onClick={nextStep}>
                <img src={next} alt="next" />
              </button>
            </div>
            <div className="current-datetime">
              {formatTime(this.props.datetime) + " "}
              {formatDate(this.props.datetime)}
            </div>
            <div className="fullscreen clickable-button">
              <span className="tooltip right">
                {Translate.fullscreen[language]}
              </span>
              <button onClick={toggleFullscreen}>
                <img
                  src={fullscreen ? normalscreen_icon : fullscreen_icon}
                  alt="full screen"
                />
              </button>
            </div>
            <div className="settings clickable-button" id="settings-icon">
              <span className="tooltip">{Translate.settings[language]}</span>
              <button onClick={this.toggleSettings}>
                <img src={settings_icon} alt="settings" />
              </button>
            </div>
            {/**<div className="tools clickable-button">
              <span className="tooltip">Tools</span>
              <button>
                <img src={tools_icon} alt="tools" />
              </button>
            </div>**/}
          </div>
        </div>
        <div className="properties">
          <div className="left">
            {"flags" in metadata ? (
              metadata.flags.map((f) => <img src={flags[f]} alt={f} key={f} />)
            ) : (
              <div className="placeholder-flag" />
            )}
          </div>
          <div className="right">
            <div className="name">
              {"name" in metadata ? metadata.name[language] : "Lake loading..."}
            </div>
            <div className="location">
              {metadata.latitude}, {metadata.longitude}
            </div>
            <div className="parameters">
              {descriptions[0]}{" "}
              <div className="stats">{metadata.elevation} m</div>
              {descriptions[1]}{" "}
              <div className="stats">{metadata.area} km&#178;</div>
              {descriptions[2]}{" "}
              <div className="stats">{metadata.ave_depth} m</div>
              {descriptions[3]}{" "}
              <div className="stats">{metadata.max_depth} m.</div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Media;
