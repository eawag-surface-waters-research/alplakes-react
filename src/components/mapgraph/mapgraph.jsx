import React, { Component } from "react";
import Translations from "../../translations.json";
import icon from "../../img/graph_bar.png";
import "./mapgraph.css";
import SatelliteSummary from "../d3/satellitesummary/satellitesummary";
import ProfileGraph from "../d3/profilegraph/profilegraph";
import TransectGraph from "../d3/transectgraph/transectgraph";
import satelliteIcon from "../../img/satelliteicon.png";
import profileIcon from "../../img/profile.png";
import transectIcon from "../../img/transect.png";

const formatSencastDay = (datetime) => {
  var a = new Date(datetime);
  var year = a.getFullYear();
  var month = a.getMonth() + 1;
  var date = a.getDate();
  return `${String(year)}${month < 10 ? "0" + month : month}${
    date < 10 ? "0" + date : date
  }`;
};

const findClosest = (array, key, value) => {
  let closest = null;
  let minDiff = Infinity;
  for (let i = 0; i < array.length; i++) {
    let diff = Math.abs(array[i][key] - value);
    if (diff < minDiff) {
      minDiff = diff;
      closest = array[i];
    }
  }
  return closest;
};

const round = (value, decimals) => {
  return Math.round(value * 10 ** decimals) / 10 ** decimals;
};

class InputCoordinates extends Component {
  state = {
    lat: 46.5,
    lng: 6.67,
  };
  updateLat = (event) => {
    this.setState({ lat: event.target.value });
  };
  updateLng = (event) => {
    this.setState({ lng: event.target.value });
  };
  componentDidUpdate(prevProps) {
    var { lat, lng } = this.props;
    if (prevProps.lat !== lat || prevProps.lng !== lng) {
      this.setState({ lat, lng });
    }
  }
  setcustomProfileLocation = () => {
    var { lat, lng } = this.state;
    if (lat !== this.props.lat && lng !== this.props.lng) {
      this.props.customProfileLocation(lat, lng);
    }
  };
  componentDidMount() {
    var { lat, lng } = this.props;
    this.setState({ lat, lng });
  }
  render() {
    const { language } = this.props;
    const { lat, lng } = this.state;
    return (
      <div className="input-coordinates">
        Lat: <input value={lat} type="number" onChange={this.updateLat} />
        Lng: <input value={lng} type="number" onChange={this.updateLng} />
        <button onClick={this.setcustomProfileLocation}>
          {Translations.update[language]}
        </button>
      </div>
    );
  }
}

class Graph extends Component {
  setImage = (event) => {
    var { layer, updateOptions } = this.props;
    var { available } = layer.sources[layer.source].metadata;
    var date = available[formatSencastDay(event)];
    var image = findClosest(date.images, "time", event);
    layer.sources[layer.source].metadata.image = image;
    layer.displayOptions.url = image.url;
    layer.displayOptions.time = image.time;
    updateOptions(layer.id, "tiff", layer.displayOptions);
  };
  render() {
    var {
      layer,
      plotType,
      language,
      data,
      dark,
      datetime,
      customProfileLocation,
    } = this.props;
    switch (plotType) {
      default:
        return <React.Fragment></React.Fragment>;
      case "satellite_timeseries":
        return (
          <SatelliteSummary
            input={data}
            language={language}
            label={Translations[layer.parameter][language]}
            options={layer.displayOptions}
            unit={layer.unit}
            dark={dark}
            setImage={this.setImage}
          />
        );
      case "profile_plot":
        return (
          <React.Fragment>
            <InputCoordinates
              lat={round(data.lat, 3)}
              lng={round(data.lng, 3)}
              language={language}
              customProfileLocation={customProfileLocation}
            />
            <ProfileGraph
              data={data}
              options={layer.displayOptions}
              language={language}
              dark={dark}
            />
          </React.Fragment>
        );
      case "transect_plot":
        return (
          <TransectGraph
            data={data}
            options={layer.displayOptions}
            language={language}
            datetime={datetime}
            dark={dark}
          />
        );
    }
  }
}

class MapGraph extends Component {
  render() {
    var {
      layers,
      language,
      graphSelection,
      dark,
      datetime,
      selectMapGraph,
      graphHide,
      toggleGraphHide,
      updateOptions,
      customProfileLocation,
    } = this.props;
    var icons = {
      satellite_timeseries: satelliteIcon,
      profile_plot: profileIcon,
      transect_plot: transectIcon,
    };
    var labels = [];
    for (let l of layers.filter((l) => "graph" in l)) {
      for (let key in l.graph) {
        let active = l.id === graphSelection.id && key === graphSelection.type;
        labels.push({
          id: l.id,
          type: key,
          active,
          name: Translations[l.parameter][language],
        });
      }
    }
    if (graphSelection) {
      var layer = layers.find((l) => l.id === graphSelection.id);
      var data = layer.graph[graphSelection.type];
      return graphHide ? (
        <div className="map-graph-icon" onClick={toggleGraphHide}>
          <img src={icon} alt="Graph icon" />
        </div>
      ) : (
        <div className="map-graph">
          <div className="map-graph-header">
            <div className="map-graph-close" onClick={toggleGraphHide}>
              &#10005;
            </div>
            <div className="map-graph-title">
              {labels.map((label) => (
                <div
                  className={
                    label.active ? "map-graph-label active" : "map-graph-label"
                  }
                  key={`${label.id}_${label.type}`}
                  onClick={() => selectMapGraph(label)}
                >
                  <img src={icons[label.type]} alt={label.type} />
                  <div className="map-graph-label-text">{label.name}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="map-graph-content">
            <Graph
              layer={layer}
              data={data}
              plotType={graphSelection.type}
              language={language}
              dark={dark}
              datetime={datetime}
              updateOptions={updateOptions}
              customProfileLocation={customProfileLocation}
            />
          </div>
        </div>
      );
    }
  }
}

export default MapGraph;
