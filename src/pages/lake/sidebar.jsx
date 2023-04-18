import React, { Component } from "react";
import SimpleLine from "../../components/d3/simpleline";
import Translate from "../../translations.json";
import { formatTime, formatDateLong, formatDate } from "./functions";
import temperature_icon from "../../img/temperature.png";
import velocity_icon from "../../img/velocity.png";
import "./lake.css";

class ActiveApps extends Component {
  state = {};
  render() {
    var { language, layers } = this.props;
    var extra = Math.max(1, 4 - layers.filter((l) => l.active).length);
    var images = { temperature: temperature_icon, velocity: velocity_icon };
    return (
      <React.Fragment>
        <div className="loaded">
          {layers
            .filter((l) => l.active)
            .map((layer) => (
              <div className={"app filled " + layer.type} key={layer.id}>
                <div className="remove" title="Remove layer">
                  -
                </div>
                <img
                  src={images[layer.properties.parameter]}
                  alt="layer.properites.parameter"
                />
                <span>
                  {Translate[layer.properties.parameter][language]}
                  <div className="type">{layer.properties.model}</div>
                </span>
              </div>
            ))}
          {[...Array(extra).keys()].map((p) => (
            <div className="app" title="Add layer" key={p}>
              +
            </div>
          ))}
        </div>
      </React.Fragment>
    );
  }
}

class Selection extends Component {
  render() {
    return <div className="selection-inner"></div>;
  }
}

class Sidebar extends Component {
  state = {};
  render() {
    var {
      metadata,
      language,
      temperature,
      average,
      datetime,
      simpleline,
      dark,
      period,
      layers,
    } = this.props;
    console.log(layers);
    return (
      <React.Fragment>
        <div className="info">
          <div className="data">
            <div className="temperature">
              <div className="value" id="temperature_value">
                {temperature.toFixed(1)}
              </div>
              <div className="details">
                <div className="unit">°C</div>
                <div className="average">{average && "AVE"}</div>
              </div>
            </div>
            <div className="datetime">
              <div className="date" id="date_value">
                {formatDateLong(datetime, Translate.month[language])}
              </div>
              <div className="time" id="time_value">
                {formatTime(datetime)}
              </div>
            </div>
          </div>
          <div className="name">{metadata.name[language]}</div>
          <div className="graph">
            <SimpleLine
              simpleline={simpleline}
              datetime={datetime}
              temperature={temperature}
              formatDate={formatDateLong}
              formatTime={formatTime}
              language={language}
              dark={dark}
            />
            <div className="period">
              <div className="start">
                <div className="date">{formatDate(period[0])}</div>
                <div className="time">{formatTime(period[0])}</div>
              </div>
              <div className="end">
                <div className="date">{formatDate(period[1])}</div>
                <div className="time">{formatTime(period[1])}</div>
              </div>
            </div>
            <div className="graph-parameter">
              {Translate.watertemperature[language]}
            </div>
          </div>
        </div>
        <div className="menu">
          <ActiveApps layers={layers} language={language} />
        </div>
        <div className="selection">
          <Selection />
        </div>
      </React.Fragment>
    );
  }
}

export default Sidebar;
