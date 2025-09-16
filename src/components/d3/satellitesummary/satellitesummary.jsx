import React, { Component } from "react";
import D3LineGraph from "../linegraph/linegraph";
import Translations from "../../../translations.json";

class SatelliteSummary extends Component {
  state = {
    data: {},
    ymin: 0,
    ymax: 0,
    xmin: new Date(new Date().setMonth(new Date().getMonth() - 4)),
    xmax: new Date(),
    coverage: 10,
    satellites: {},
    latitude: "",
    longitude: "",
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

  setData = () => {
    var { xmin, xmax, satellites, latitude, longitude } = this.state;
    var { input, options } = this.props;
    var { available, reference } = input;
    var data = {};
    var ymin = Infinity;
    var ymax = -Infinity;
    for (let date of Object.values(available)) {
      for (let image of date.images) {
        if (image.percent > options.coverage) {
          let tooltip = `<div><div>${image.satellite} ${image.percent}% coverage</div><div></div>Click to view</div>`;
          if (image.time >= xmin && image.time <= xmax) {
            ymin = Math.min(ymin, image.ave);
            ymax = Math.max(ymax, image.ave);
          }
          if (image.satellite in data) {
            data[image.satellite].x.push(image.time);
            data[image.satellite].y.push(Math.round(image.ave * 10) / 10);
            data[image.satellite].tooltip.push(tooltip);
          } else {
            data[image.satellite] = {
              x: [image.time],
              y: [Math.round(image.ave * 10) / 10],
              tooltip: [tooltip],
              symbol: ["S2", "L8"].includes(image.satellite.slice(0, 2))
                ? "x"
                : "o",
            };
          }
        }
      }
    }
    if (reference) {
      latitude = reference.latitude.toFixed(2);
      longitude = reference.longitude.toFixed(2);
      data["insitu"] = {
        x: reference.datetime,
        y: reference.value,
        tooltip: reference.value.map((r) => "Insitu value"),
        lineColor: "red",
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
    });
  };

  componentDidMount() {
    this.setData();
  }

  componentDidUpdate() {
    if (this.props.options.coverage !== this.state.coverage) {
      this.setData();
    }
  }

  render() {
    var { label, unit, dark, language } = this.props;
    var { data, xmin, xmax, ymin, ymax, satellites, latitude, longitude } =
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
    var lookup = {
      S2: {
        label: `Sentinel 2 [×] (${Translations.lakeAverage[language]})`,
        class: "",
      },
      S3: {
        label: `Sentinel 3 [o] (${Translations.lakeAverage[language]})`,
        class: "",
      },
      L8: {
        label: `Landsat 8 [x] (${Translations.lakeAverage[language]})`,
        class: "",
      },
      L9: {
        label: `Landsat 9 [o] (${Translations.lakeAverage[language]})`,
        class: "",
      },
      insitu: { label: `Insitu [o] (${latitude}, ${longitude})`, class: "red" },
    };
    const no_data = graph_data.length === 1 && graph_data[0].x.length === 0;
    return (
      <React.Fragment>
        <div className="graph-title">
          {Object.keys(satellites).map((s) => (
            <div key={s} className={"graph-title-selection " + lookup[s].class}>
              <input
                type="checkbox"
                checked={satellites[s]}
                onChange={() => this.setSatellites(s)}
              ></input>
              {lookup[s].label}
            </div>
          ))}
        </div>
        <div className="download-metadata" onClick={this.downloadMetadata}>
          {Translations.downloadData[language]} (CSV)
        </div>
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
          xmax={xmax}
          xmin={xmin}
          ymax={ymax}
          ymin={ymin}
          marginTop={5}
          marginRight={1}
          marginBottom={50}
          xscale={"Time"}
          yscale={""}
          legend={false}
          header={true}
          language={language}
          onClick={this.setImage}
          removeDownload={true}
        />
        <div className={no_data ? "no-data" : "no-data hide"}>
          {Translations.noSatelliteData[language]}
        </div>
      </React.Fragment>
    );
  }
}

export default SatelliteSummary;
