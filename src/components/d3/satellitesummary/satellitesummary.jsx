import React, { Component } from "react";
import D3LineGraph from "../linegraph/linegraph";
import Translations from "../../../translations.json";
import downloadIcon from "../../../img/download.png";

class SatelliteSummary extends Component {
  state = {
    data: {},
    ymin: 0,
    ymax: 0,
    coverage: 10,
    satellites: {},
    latitude: "",
    longitude: "",
    source: "",
    parameter: "",
  };
  setImage = (event) => {
    this.props.setImage(event.x);
  };

  setSatellites = (satellite) => {
    var { satellites } = this.state;
    satellites[satellite] = !satellites[satellite];
    this.setState({ satellites });
  };

  downloadMetadata = () => {
    const { csv, lake } = this.props.input;
    var name = `${lake}_${this.props.parameter}_satellite_summary.csv`;
    var encodedUri = encodeURI(csv);
    var link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", name);
    document.body.appendChild(link);
    link.click();
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
      };
    } else {
      options = {
        S2: "S2",
        S3: "S3",
        L8: "L8",
        L9: "L9",
        insitu: "In-Situ",
      };
    }
    if (label in options) {
      return options[label];
    }
    return label;
  };

  setData = () => {
    var { latitude, longitude, source } = this.state;
    var { input, options, parameter } = this.props;
    var { available, reference } = input;
    var data = {};
    var satellites = {};
    var ymin = Infinity;
    var ymax = -Infinity;
    for (let date of Object.values(available)) {
      for (let image of date.images) {
        if (image.percent > options.coverage && image.percent > 10) {
          let tooltip = `<div><div>${image.satellite} ${image.percent}% coverage</div><div></div>Click to view</div>`;
          ymin = Math.min(ymin, image.ave);
          ymax = Math.max(ymax, image.ave);
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
    if (reference) {
      latitude = reference.latitude.toFixed(2);
      longitude = reference.longitude.toFixed(2);
      source = reference.source;
      data["insitu"] = {
        x: reference.datetime,
        y: reference.value,
        tooltip: reference.value.map((r) => "Insitu value"),
        lineColor: "#c13c2f",
        symbol: "triangle",
      };
    }

    for (let key of ["S2", "S3", "L8", "L9", "insitu"]) {
      if (Object.keys(data).some((str) => str.includes(key))) {
        satellites[key] = true;
      }
    }

    this.setState({
      data,
      ymin,
      ymax,
      coverage: options.coverage,
      satellites,
      latitude,
      longitude,
      source,
      parameter,
    });
  };

  componentDidMount() {
    this.setData();
  }

  componentDidUpdate() {
    if (
      this.props.options.coverage !== this.state.coverage ||
      this.props.parameter !== this.state.parameter
    ) {
      this.setData();
    }
  }

  render() {
    var { label, unit, dark, language } = this.props;
    var { data, ymin, ymax, satellites, latitude, longitude, source } =
      this.state;
    const graph_data = Object.entries(data)
      .filter(([key, value]) =>
        Object.entries(satellites)
          .filter(([key, value]) => value === true)
          .map(([key]) => key)
          .some((sub) => key.includes(sub))
      )
      .map((g) => g[1]);
    if (graph_data.length === 0) {
      graph_data.push({ x: [], y: [] });
    }
    const no_data = graph_data.length === 1 && graph_data[0].x.length === 0;
    return (
      <React.Fragment>
        <div className="graph-title">
          {Object.keys(satellites).map((s) => (
            <div
              key={s}
              className={
                satellites[s]
                  ? "graph-title-selection"
                  : "graph-title-selection unselect"
              }
              onClick={() => this.setSatellites(s)}
            >
              {s === "insitu" ? (
                <div
                  className="triangle"
                  style={{ borderBottomColor: this.getColor(s) }}
                />
              ) : (
                <div
                  className="circle"
                  style={{ backgroundColor: this.getColor(s) }}
                />
              )}
              {this.getLabel(s)}
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
            </div>
          ))}
        </div>
        <div className="download-metadata" onClick={this.downloadMetadata}>
          <img src={downloadIcon} alt="Download" />{" "}
          {Translations.export[language]} CSV
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
            marginTop={5}
            marginRight={1}
            marginBottom={50}
            xscale={"Time"}
            yscale={""}
            legend={false}
            header={false}
            language={language}
            onClick={this.setImage}
            removeDownload={true}
          />
        </div>
        <div className={no_data ? "no-data" : "no-data hide"}>
          {Translations.noSatelliteData[language]}
        </div>
      </React.Fragment>
    );
  }
}

export default SatelliteSummary;
