import React, { Component } from "react";
import JSZip from "jszip";
import D3LineGraph from "../linegraph/linegraph";
import Translations from "../../../translations.json";
import downloadIcon from "../../../img/download.png";
import RangeSlider from "../../sliders/rangeslider";

class TimeSelector extends Component {
  state = {
    open: false,
  };
  toggleOpen = () => {
    this.setState({ open: !this.state.open });
  };
  formatDateYYYYMMDD = (d) => {
    const date = new Date(d);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };
  render() {
    const { open } = this.state;
    const { xmin, xmax, xbounds, language, setSelectedPeriod } = this.props;
    const start = new Date(xmin);
    const end = new Date(xmax);
    const timestep = 24 * 60 * 60;
    const period = [xbounds[0], Math.max(timestep, xbounds[1])];
    return open ? (
      <div className="satellite-button wide">
        <div className="date-label" onClick={this.toggleOpen}>
          {this.formatDateYYYYMMDD(xbounds[0])}
        </div>
        <div className="range-slider">
          <RangeSlider
            period={period}
            timestep={timestep}
            selectedPeriod={[xmin, xmax]}
            setSelectedPeriod={setSelectedPeriod}
            language={language}
          />
        </div>
        <div className="date-label" onClick={this.toggleOpen}>
          {this.formatDateYYYYMMDD(xbounds[1])}
        </div>
      </div>
    ) : (
      <div className="satellite-button" onClick={this.toggleOpen}>
        {start.getFullYear()} - {end.getFullYear()}
        <div
          className={
            open ? "satellite-time-selector" : "satellite-time-selector hide"
          }
        ></div>
      </div>
    );
  }
}

class SatelliteSummary extends Component {
  state = {
    data: {},
    ymin: 0,
    ymax: 0,
    xmin: 0,
    xmax: 0,
    xbounds: [0, 0],
    coverage: 10,
    legend: {},
    latitude: "",
    longitude: "",
    source: "",
    parameter: "",
    custom_len: 0,
  };
  setImage = (event) => {
    this.props.setImage(event.x);
  };

  setLegend = (id) => {
    var { legend } = this.state;
    legend[id]["hidden"] = !legend[id]["hidden"];
    this.setState({ legend });
  };

  setSelectedPeriod = (period) => {
    this.setState({ xmin: period[0], xmax: period[1] });
  };

  downloadMetadata = async () => {
    const { csv, lake } = this.props.input;
    const zip = new JSZip();
    Object.entries(csv).forEach(([key, data]) => {
      const fileName = `${lake}_${this.props.parameter}_${key}.csv`;
      zip.file(fileName, data);
    });
    const content = await zip.generateAsync({ type: "blob" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(content);
    link.download = `${lake}_${this.props.parameter}_satellite_data.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  getColor = (satellite) => {
    const options = {
      S2: "#eb8630",
      S3: "#559c3d",
      L8: "#61bbcd",
      L9: "#8d6bb8",
    };
    if (satellite in options) {
      return options[satellite];
    }
    return "#c13c2f";
  };

  getLabel = (label) => {
    var options;
    if (window.innerWidth > 500) {
      options = {
        S2: "Sentinel 2",
        S3: "Sentinel 3",
        L8: "Landsat 8",
        L9: "Landsat 9",
        insitu: "In-Situ",
        collection: "Landsat 8&9",
        sentinel2: "Sentinel 2",
        sentinel3: "Sentinel 3",
      };
    } else {
      options = {
        S2: "S2",
        S3: "S3",
        L8: "L8",
        L9: "L9",
        insitu: "In-Situ",
        collection: "L",
        sentinel2: "S2",
        sentinel3: "S3",
      };
    }
    if (label in options) {
      return options[label];
    }
    return label;
  };

  roundToNearestDay = (timestamp) => {
    const date = new Date(timestamp);
    date.setHours(0, 0, 0, 0);
    return date.getTime();
  };

  setData = () => {
    var { latitude, longitude, source, custom_len } = this.state;
    var { input, options, parameter } = this.props;
    var { available, reference, custom } = input;
    var data = {};
    var legend = {};
    var ymin = Infinity;
    var ymax = -Infinity;
    var xmin = Infinity;
    var xmax = -Infinity;
    var satellites = [];
    for (let date of Object.values(available)) {
      for (let image of date.images) {
        if (!satellites.includes(image.satellite.slice(0, 2)))
          satellites.push(image.satellite.slice(0, 2));
        if (image.percent > options.coverage && image.percent > 10) {
          let tooltip = `<div><div>${image.satellite} ${image.percent}% coverage</div><div></div>Click to view</div>`;
          ymin = Math.min(ymin, image.ave);
          ymax = Math.max(ymax, image.ave);
          xmin = Math.min(xmin, image.time);
          xmax = Math.max(xmax, image.time);
          if (image.satellite in data) {
            data[image.satellite].x.push(image.time);
            data[image.satellite].y.push(Math.round(image.ave * 10) / 10);
            data[image.satellite].tooltip.push(tooltip);
          } else {
            data[image.satellite] = {
              x: [image.time],
              y: [Math.round(image.ave * 10) / 10],
              tooltip: [tooltip],
              lineColor: this.getColor(image.satellite.slice(0, 2)),
              symbol: "o",
            };
          }
        }
      }
    }
    for (let satellite of satellites) {
      legend[satellite] = {
        hidden: false,
        text: this.getLabel(satellite.slice(0, 2)),
        color: this.getColor(satellite.slice(0, 2)),
        shape: "circle",
      };
    }
    if (reference) {
      latitude = reference.latitude;
      longitude = reference.longitude;
      source = reference.source;
      data["insitu"] = {
        x: reference.datetime,
        y: reference.value,
        tooltip: reference.value.map((r) => "Insitu value"),
        lineColor: "#c13c2f",
        symbol: "triangle",
      };
      legend["insitu"] = {
        hidden: false,
        text: "Insitu",
        color: "#c13c2f",
        shape: "triangle",
      };
    }

    if (custom) {
      custom_len = custom.length;
      for (let c of custom) {
        data[c["id"]] = {
          x: c["dataset"].map((d) => new Date(d["time"])),
          y: c["dataset"].map((d) => d["value"][c["statistic"]]),
          tooltip: c["dataset"].map(
            (d) => `${this.getLabel(c.satellite)} (${c.lat}, ${c.lng})`,
          ),
          lineColor: c["color"],
          symbol: "square",
        };
        ymin = Math.min(
          ymin,
          Math.min(...data[c["id"]]["y"].filter((n) => !isNaN(n))),
        );
        ymax = Math.max(
          ymax,
          Math.max(...data[c["id"]]["y"].filter((n) => !isNaN(n))),
        );
        legend[c["id"]] = {
          hidden: false,
          text: c["name"],
          color: c["color"],
          shape: "square",
          extra: c,
        };
      }
    }

    const fiveYears = 5 * 365.25 * 24 * 60 * 60 * 1000;
    xmin = this.roundToNearestDay(xmin);
    xmax = this.roundToNearestDay(xmax);
    var xbounds = [xmin, xmax];
    if (xmax - xmin > fiveYears) xmin = xmax - fiveYears;

    this.setState({
      data,
      ymin,
      ymax,
      xmin,
      xmax,
      xbounds,
      coverage: options.coverage,
      legend,
      latitude,
      longitude,
      source,
      parameter,
      custom_len,
    });
  };

  componentDidMount() {
    this.setData();
  }

  componentDidUpdate() {
    if (
      this.props.options.coverage !== this.state.coverage ||
      this.props.parameter !== this.state.parameter ||
      (this.props.input.custom &&
        this.state.custom_len !== this.props.input.custom.length)
    ) {
      this.setData();
    }
  }

  render() {
    var { label, unit, dark, language } = this.props;
    var {
      data,
      ymin,
      ymax,
      xmin,
      xmax,
      xbounds,
      legend,
      latitude,
      longitude,
      source,
    } = this.state;
    const graph_data = Object.entries(data)
      .filter(([key, value]) =>
        Object.entries(legend)
          .filter(([key, value]) => value["hidden"] === false)
          .map(([key]) => key)
          .some((sub) => key.includes(sub)),
      )
      .map((g) => g[1]);
    if (graph_data.length === 0) {
      graph_data.push({ x: [], y: [] });
    }

    const no_data = graph_data.length === 1 && graph_data[0].x.length === 0;

    return (
      <div className="satellite-summary">
        <div className="satellite-settings">
          <TimeSelector
            xmin={xmin}
            xmax={xmax}
            xbounds={xbounds}
            language={language}
            setSelectedPeriod={this.setSelectedPeriod}
          />
          <div className="satellite-button" onClick={this.downloadMetadata}>
            <img src={downloadIcon} alt="Download" />{" "}
            {Translations.exportData[language]}
          </div>
        </div>
        <div className="satellite-graph">
          <D3LineGraph
            data={graph_data}
            ylabel={label}
            yunits={unit}
            lcolor={new Array(10).fill(dark ? "white" : "black")}
            lweight={[1]}
            bcolor={["white"]}
            simple={false}
            lines={false}
            scatter={true}
            plotdots={true}
            ymax={ymax}
            ymin={ymin}
            xmax={xmax}
            xmin={xmin}
            marginTop={5}
            marginRight={1}
            marginBottom={25}
            xscale={"Time"}
            yscale={""}
            legend={false}
            header={false}
            language={language}
            onClick={this.setImage}
            removeDownload={true}
          />
          <div className={no_data ? "no-data" : "no-data hide"}>
            {Translations.noSatelliteData[language]}
          </div>
        </div>
        <div className="satellite-legend">
          {Object.keys(legend).map((s) => (
            <div
              key={s}
              className={
                legend[s]["hidden"]
                  ? "graph-title-selection unselect"
                  : "graph-title-selection"
              }
              onClick={() => this.setLegend(s)}
            >
              {legend[s].shape === "triangle" && (
                <div
                  className="triangle"
                  style={{ borderBottomColor: legend[s]["color"] }}
                />
              )}
              {legend[s].shape === "circle" && (
                <div
                  className="circle"
                  style={{ backgroundColor: legend[s]["color"] }}
                />
              )}
              {legend[s].shape === "square" && (
                <div
                  className="square"
                  style={{ backgroundColor: legend[s]["color"] }}
                />
              )}
              {legend[s]["text"]}
              {s === "insitu" && (
                <div className="question">
                  <div className="question-hover">
                    {Translations.satelliteInsitu[language]}
                    <div className="space">
                      <b>{Translations.source[language]}</b>: {source}
                    </div>
                    <div className="space">
                      <b>{Translations.location[language]}</b>: {latitude},{" "}
                      {longitude}
                    </div>
                  </div>
                  ?
                </div>
              )}
              {"extra" in legend[s] && (
                <div className="question">
                  <div className="question-hover">
                    <div className="space">
                      <b>{Translations.satellite[language]}</b>:{" "}
                      {this.getLabel(legend[s]["extra"]["satellite"])}
                    </div>
                    <div className="space">
                      <b>{Translations.location[language]}</b>:{" "}
                      {legend[s]["extra"]["lat"]}, {legend[s]["extra"]["lng"]}
                    </div>
                    <div className="space">
                      <b>{Translations.statistic[language]}</b>:{" "}
                      {legend[s]["extra"]["statistic"]}
                    </div>
                    <div className="space">
                      <b>{Translations.extractionWindow[language]}</b>:{" "}
                      {legend[s]["extra"]["window_radius"]}
                    </div>
                    <div className="space">
                      <b>{Translations.validPixels[language]}</b>:{" "}
                      {legend[s]["extra"]["valid_pixels"]}
                    </div>
                  </div>
                  ?
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }
}

export default SatelliteSummary;
