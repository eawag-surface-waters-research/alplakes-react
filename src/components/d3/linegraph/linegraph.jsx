import React, { Component } from "react";
import * as d3 from "d3";
import GraphHeader from "../graphheader/graphheader";
import plotlinegraph from "./plotlinegraph";
import "./linegraph.css";

class D3LineGraph extends Component {
  state = {
    graphid: Math.round(Math.random() * 100000),
    fullscreen: false,
    fontSize: this.props.fontSize ? this.props.fontSize : 12,
  };

  editFontSize = (event) => {
    const fontSize = parseInt(event.target.value);
    if (this.props.setFontSize !== undefined) this.props.setFontSize(fontSize);
    this.setState({ fontSize });
  };

  toggleFullscreen = () => {
    this.setState({ fullscreen: !this.state.fullscreen }, () => {
      window.dispatchEvent(new Event("resize"));
    });
  };

  getDomain = (domain) => {
    var minarr = domain.map((d) => d[0]);
    var maxarr = domain.map((d) => d[1]);
    var min = d3.extent(minarr)[0];
    var max = d3.extent(maxarr)[1];
    return [min, max];
  };

  formatDate = (raw) => {
    return new Date(raw * 1000);
  };

  removeErrorWarning = (x) => {
    return;
  };

  downloadCSV = () => {
    function normalparse(value) {
      return value;
    }
    function dateparse(date) {
      let day = ("0" + date.getDate()).slice(-2);
      let month = ("0" + (date.getMonth() + 1)).slice(-2);
      let year = date.getFullYear();
      let hour = ("0" + date.getHours()).slice(-2);
      let minutes = ("0" + date.getMinutes()).slice(-2);
      let seconds =
        date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds();
      return `${year}-${month}-${day} ${hour}:${minutes}:${seconds}`;
    }
    try {
      var { data, xlabel, xunits, ylabel, yunits, title } = this.props;
      var x_units = ` (${xunits})`;
      var y_units = ` (${yunits})`;
      var x_parse = normalparse;
      var y_parse = normalparse;
      if (xlabel === "Time") {
        x_units = "";
        x_parse = dateparse;
      }
      if (ylabel === "Time") {
        y_units = "";
        y_parse = dateparse;
      }
      var csvContent = "";
      if (!Array.isArray(data) || data.length === 1) {
        if (Array.isArray(data)) data = data[0];
        csvContent =
          csvContent +
          `data:text/csv;charset=utf-8,${xlabel}${x_units},${ylabel}${y_units}\n`;
        for (var i = 0; i < data.x.length; i++) {
          csvContent =
            csvContent + `${x_parse(data.x[i])},${y_parse(data.y[i])}\n`;
        }
      } else {
        csvContent = csvContent + "data:text/csv;charset=utf-8";
        var rows = -Infinity;
        for (let i = 0; i < data.length; i++) {
          csvContent = csvContent + `,${xlabel}${x_units},${ylabel}${y_units}`;
          rows = Math.max(rows, data[i].x.length);
        }
        csvContent = csvContent + "\n";
        for (let j = 0; j < rows; j++) {
          csvContent =
            csvContent + `${x_parse(data[0].x[j])},${y_parse(data[0].y[j])}`;
          for (let i = 1; i < data.length; i++) {
            csvContent =
              csvContent + `,${x_parse(data[i].x[j])},${y_parse(data[i].y[j])}`;
          }
          csvContent = csvContent + "\n";
        }
      }
      var name = "linegraph_data.csv";
      if (title) {
        name = title.split(" ").join("_") + ".csv";
      }
      var encodedUri = encodeURI(csvContent);
      var link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", name);
      document.body.appendChild(link);
      link.click();
      this.setState({ download: false });
    } catch (e) {
      console.error(e);
      alert("Failed to convert data to .csv, please download in .json format.");
    }
  };

  downloadJSON = () => {
    var { data, xlabel, xunits, ylabel, yunits, title } = this.props;
    var arr = { ...{ xlabel, xunits, ylabel, yunits, title }, ...data };
    var name = "linegraph_data.json";
    if (title) {
      name = title.split(" ").join("_") + ".json";
    }
    var encodedUri =
      "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(arr));
    var link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", name);
    document.body.appendChild(link);
    link.click();
    this.setState({ download: false });
  };

  removeCommaFromLabels = (gX) => {
    var labels = gX._groups[0][0].children;
    for (var i = 0; i < labels.length; i++) {
      if (labels[i].children.length > 1) {
        labels[i].children[1].innerHTML = labels[
          i
        ].children[1].innerHTML.replace(",", "");
      }
    }
  };

  setLanguage = (name) => {
    var lang = {
      de: {
        decimal: ",",
        thousands: ".",
        grouping: [3],
        currency: ["€", ""],
        dateTime: "%a %b %e %X %Y",
        date: "%d.%m.%Y",
        time: "%H:%M:%S",
        periods: ["AM", "PM"],
        days: [
          "Sonntag",
          "Montag",
          "Dienstag",
          "Mittwoch",
          "Donnerstag",
          "Freitag",
          "Samstag",
        ],
        shortDays: ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"],
        months: [
          "Januar",
          "Februar",
          "März",
          "April",
          "Mai",
          "Juni",
          "Juli",
          "August",
          "September",
          "Oktober",
          "November",
          "Dezember",
        ],
        shortMonths: [
          "Jan",
          "Feb",
          "Mär",
          "Apr",
          "Mai",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Okt",
          "Nov",
          "Dez",
        ],
      },
    };
    if (name in lang) {
      d3.timeFormatDefaultLocale(lang[name]);
    }
  };

  plot = async () => {
    var {
      data,
      xlabel,
      xunits,
      ylabel,
      yunits,
      x2label,
      x2units,
      y2label,
      y2units,
      xmax,
      xmin,
      ymax,
      ymin,
      xscale,
      yscale,
      lcolor,
      lweight,
      title,
      legend,
      confidence,
      simple,
      yReverse,
      xReverse,
      scatter,
      lines,
      box,
      grid,
      language,
      onClick,
      curve,
      marginLeft,
      marginTop,
      marginRight,
      marginBottom,
      noYear,
    } = this.props;
    var { graphid, fontSize } = this.state;

    if (this.props.fontSize !== undefined) fontSize = this.props.fontSize;

    var lineColor = "black";
    if ("dark" in this.props && this.props.dark) lineColor = "white";

    if (!Array.isArray(data)) {
      data = [data];
    }

    for (var i = 0; i < data.length; i++) {
      if (!("lineColor" in data[i]))
        data[i]["lineColor"] = lcolor[i] ? lcolor[i] : lineColor;
      if (!("lineWeight" in data[i]))
        data[i]["lineWeight"] = lweight[i] ? lweight[i] : 1;
      if (!("upper" in data[i]))
        data[i]["upper"] =
          confidence && confidence[i] ? confidence[i].CI_upper : "";
      if (!("lower" in data[i]))
        data[i]["lower"] =
          confidence && confidence[i] ? confidence[i].CI_lower : "";
      if (!("confidenceAxis" in data[i]))
        data[i]["confidenceAxis"] = confidence && confidence[i] ? "y" : "";
    }
    var options = {
      language,
      xLog: xscale === "Log",
      yLog: yscale === "Log",
      border: box,
      grid,
      xLabel: xlabel,
      yLabel: ylabel,
      xUnit: xunits,
      yUnit: yunits,
      x2Label: x2label,
      y2Label: y2label,
      x2Unit: x2units,
      y2Unit: y2units,
      title: title,
      zoom: !simple,
      yReverse,
      xReverse,
      fontSize,
      curve: curve,
      scatter: scatter,
      lines: lines,
      tooltip: !simple,
      setDownloadGraphDiv: "png" + graphid,
      onClick: onClick,
      legend: legend,
      noYear,
    };
    if (marginLeft) options["marginLeft"] = marginLeft;
    if (marginTop) options["marginTop"] = marginTop;
    if (marginRight) options["marginRight"] = marginRight;
    if (marginBottom) options["marginBottom"] = marginBottom;
    if (xmax) options["xMax"] = xmax;
    if (xmin) options["xMin"] = xmin;
    if (ymax) options["yMax"] = ymax;
    if (ymin) options["yMin"] = ymin;
    plotlinegraph("vis" + graphid, data, options);
  };

  componentDidMount() {
    var { graphid } = this.state;
    this.plot();
    window.addEventListener("resize", this.plot, false);
    document
      .getElementById("vis" + graphid)
      .addEventListener("resize", this.plot, false);
  }

  componentWillUnmount() {
    var { graphid } = this.state;
    window.removeEventListener("resize", this.plot, false);
    document
      .getElementById("vis" + graphid)
      .removeEventListener("resize", this.plot, false);
  }

  componentDidUpdate(prevProps, prevState) {
    this.plot();
  }

  render() {
    var { graphid, fullscreen, fontSize } = this.state;
    var { title, simple, clearPlot } = this.props;
    return simple ? (
      <div className="linegraph-graph" id={"vis" + graphid} />
    ) : (
      <div className={fullscreen ? "vis-main full" : "vis-main"}>
        <div className="linegraph-main" id="lm">
          {this.props.header !== false && (
            <div className="linegraph-header">
              <GraphHeader
                id={graphid}
                title={title}
                fullscreen={fullscreen}
                fontSize={fontSize}
                toggleFullscreen={this.toggleFullscreen}
                editFontSize={this.editFontSize}
                downloadJSON={this.downloadJSON}
                downloadCSV={this.downloadCSV}
                clearPlot={clearPlot}
              />
            </div>
          )}
          <div
            className={
              this.props.header !== false
                ? "linegraph-graph"
                : "linegraph-graph full"
            }
            id={"vis" + graphid}
          />
        </div>
      </div>
    );
  }
}

export default D3LineGraph;
