import React, { Component } from "react";
import Translate from "../../translations.json";
import NavBar from "../../components/navbar/navbar";
import Basemap from "../../components/leaflet/basemap";
import graph from "../../img/graph.png";
import notification from "../../img/notification.png";
import "./lake.css";

class Lake extends Component {
  state = {
    depth: 0.6,
    datetime: Date.now(),
    temperature: 17.6,
  };
  formatDate = (datetime) => {
    var a = new Date(datetime);
    var year = a.getFullYear();
    var month = a.getMonth() + 1;
    var date = a.getDate();
    return `${date < 10 ? "0" + date : date}.${
      month < 10 ? "0" + month : month
    }.${String(year).slice(-2)}`;
  };
  formatTime = (datetime) => {
    var a = new Date(datetime);
    var hour = a.getHours();
    var minute = a.getMinutes();
    return `${hour < 10 ? "0" + hour : hour}:${
      minute < 10 ? "0" + minute : minute
    }`;
  };
  render() {
    var { language } = this.props;
    document.title = Translate.title[language];
    return (
      <div className="main">
        <NavBar language={language} />
        <div className="primary">
          <div className="content">
            <div className="map-component">
              <div className="viewport">
                <Basemap />
              </div>
              <div className="controls">
                <div className="legend"></div>
                <div className="playback"></div>
              </div>
            </div>
          </div>
        </div>
        <div className="secondary">
          <div className="notification">
            <img src={notification} alt="Notification" />
          </div>
          <div className="info">
            <div className="name">LAKE GENEVA</div>
            <div className="temperature">
              <div className="value">{this.state.temperature}</div>
              <div className="unit">
                <div>°C</div>
                <div>AVE</div>
              </div>
            </div>
            <div className="datetime">
              <div className="date">{this.formatDate(this.state.datetime)}</div>
              <div className="time">{this.formatTime(this.state.datetime)}</div>
            </div>
          </div>
          <div className="info-graph">
            <img src={graph} alt="Graph" />
          </div>
        </div>
      </div>
    );
  }
}

export default Lake;
