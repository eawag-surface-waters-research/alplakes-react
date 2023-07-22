import React, { Component } from "react";
import "./slider.css";

class Slider extends Component {
  inputHover = (e) => {
    var min = parseInt(e.target.getAttribute("min"));
    var max = parseInt(e.target.getAttribute("max"));
    var step = parseInt(e.target.getAttribute("step"));
    var offset = e.offsetX / e.target.clientWidth;
    var valueHover = parseInt(offset * (max - min) + min);
    valueHover = Math.round(valueHover / step) * step;
    offset = (valueHover - min) / (max - min);
    var div = document.getElementById("input-range-label");
    var right = e.target.clientWidth - div.offsetWidth;
    var left = offset * e.target.clientWidth - div.offsetWidth / 2;
    div.style.left = Math.min(Math.max(0, left), right) + "px";
    div.innerHTML =
      this.formatTime(valueHover) + " " + this.formatDate(valueHover);
    e.target.setAttribute("alt", valueHover);
    var arrow = document.getElementById("input-range-label-arrow");
    arrow.style.left =
      Math.min(
        Math.max(4, offset * e.target.clientWidth - 5),
        e.target.clientWidth - 24
      ) + "px";
    document.getElementById("input-range-hover").style.width =
      Math.min(
        Math.max(0, offset * e.target.clientWidth),
        e.target.clientWidth
      ) + "px";
    div.style.visibility = "visible";
    arrow.style.visibility = "visible";
  };

  hideHover = () => {
    document.getElementById("input-range-label").style.visibility = "hidden";
    document.getElementById("input-range-label-arrow").style.visibility =
      "hidden";
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

  componentDidMount() {
    document
      .getElementById("input-range")
      .addEventListener("mousemove", this.inputHover);
    document
      .getElementById("input-range")
      .addEventListener("mouseout", this.hideHover);
  }

  componentWillUnmount() {
    document
      .getElementById("input-range")
      .removeEventListener("mousemove", this.inputHover);
    document
      .getElementById("input-range")
      .removeEventListener("mouseout", this.hideHover);
  }

  componentDidUpdate() {
    var { period } = this.props;
    var d = new Date();
    d.setHours(0);
    d.setMinutes(0);
    d.setSeconds(0);
    var dt = d.getTime();
    var width = document.getElementById("input-range").offsetWidth;
    var divWidth = Math.min(
      Math.max(((dt - period[0]) / (period[1] - period[0])) * width, 0),
      width
    );
    document.getElementById("input-range-hindcast").style.width =
      divWidth + "px";
  }

  render() {
    var { period, timestep, datetime, setDatetime } = this.props;
    return (
      <div className="slider-container">
        <input
          id="input-range"
          type="range"
          min={period[0]}
          max={period[1]}
          step={timestep}
          value={datetime}
          className="slider-component"
          onChange={setDatetime}
          alt={datetime}
        />
        <div className="slider-bar" id="input-range-bar" />
        <div className="slider-hover" id="input-range-hover" />
        <div className="slider-hindcast" id="input-range-hindcast" />
        <div className="slider-label" id="input-range-label" />
        <div className="slider-label-arrow" id="input-range-label-arrow" />
      </div>
    );
  }
}

export default Slider;
