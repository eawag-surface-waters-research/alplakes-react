import React, { Component } from "react";
import D3LineGraph from "../linegraph/linegraph";

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
    console.log(satellite);
    var { satellites } = this.state;
    satellites[satellite] = !satellites[satellite];
    this.setState({ satellites });
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
            data[image.satellite].y.push(image.ave);
            data[image.satellite].tooltip.push(tooltip);
          } else {
            data[image.satellite] = {
              x: [image.time],
              y: [image.ave],
              tooltip: [tooltip],
              symbol: image.satellite.includes("S2") ? "x" : "o",
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

    for (let key of ["S2", "S3", "insitu"]) {
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
    var lookup = {
      S2: "Sentinel 2 (lake average)",
      S3: "Sentinel 3 (lake average)",
      insitu: `Insitu (${latitude}, ${longitude})`,
    };
    return (
      <React.Fragment>
        <div className="graph-title">
          {Object.keys(satellites).map((s) => (
            <div key={s} className="graph-title-selection">
              <input
                type="checkbox"
                checked={satellites[s]}
                onChange={() => this.setSatellites(s)}
              ></input>
              {lookup[s]}
            </div>
          ))}
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
        />
      </React.Fragment>
    );
  }
}

export default SatelliteSummary;
