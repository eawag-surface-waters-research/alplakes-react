import React, { Component } from "react";
import SimpleLine from "../../components/d3/simpleline";
import Translate from "../../translations.json";
import { formatTime, formatDateLong, formatDate } from "./functions";
import temperature_icon from "../../img/temperature.png";
import velocity_icon from "../../img/velocity.png";
import "./lake.css";

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
    } = this.props;
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
          <div className="loaded">
            <div className="app filled">
              <div className="remove" title="Remove layer">
                -
              </div>
              <img src={temperature_icon} alt="temperature" />
              <span>Temperature</span>
            </div>
            <div className="app filled">
              <div className="remove" title="Remove layer">
                -
              </div>
              <img src={velocity_icon} alt="velocity" />
              <span>Velocity</span>
            </div>
            <div className="app" title="Add layer">
              +
            </div>
            <div className="app" title="Add layer">
              +
            </div>
          </div>
        </div>
        <div className="selection"></div>
      </React.Fragment>
    );
  }
}

export default Sidebar;
