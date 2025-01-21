import React, { Component } from "react";
import Translations from "../../../translations.json";
import Basemap from "../../../components/leaflet/basemap";
import Information from "../../../components/information/information";
import MapButton from "../../../components/mapbutton/mapbutton";
import { downloadModelMetadata, download3DMap } from "../functions/download";
import { formatDateDDMMYYYY, formatTime } from "../functions/general";

class PlaceholderGraph extends Component {
  render() {
    var { title } = this.props;
    return (
      <div className="clickable-box highlight">
        <div className="title">{title}</div>
        <div>
          <div className="skeleton-block pulse-border" />
          <div className="skeleton-block pulse-border" />
          <div className="skeleton-block pulse-border" />
          <div className="skeleton-block pulse-border" />
          <div className="skeleton-block pulse-border right" />
        </div>
        <div className="skeleton-data" />
      </div>
    );
  }
}

class ThreeDModel extends Component {
  state = {
    updates: [],
    metadata: {},
    data: {},
    date: "",
    time: "",
    current: false,
    mapId: "map_" + Math.round(Math.random() * 100000),
  };

  updated = () => {
    this.setState({ updates: [] });
  };

  async componentDidMount() {
    var { parameters } = this.props;
    var { updates } = this.state;
    let metadata = await downloadModelMetadata(
      parameters.model.toLowerCase(),
      parameters.key
    );
    const data = await download3DMap(
      parameters.model.toLowerCase(),
      parameters.key,
      new Date(metadata.end_date.getTime() - 5 * 24 * 60 * 60 * 1000),
      metadata.end_date,
      0,
      ["geometry", "temperature", "velocity"],
      metadata.height,
      true
    );
    const now = new Date();
    var index = data.temperature.data.length - 1;
    var date = formatDateDDMMYYYY(data.temperature.end);
    var time = formatTime(data.temperature.end);
    if (data.temperature.end > now) {
      const timestep =
        (data.temperature.end - data.temperature.start) /
        (data.temperature.data.length - 1);
      index = Math.ceil((now - data.temperature.start) / timestep);
      date = false;
      time = formatTime(
        new Date(data.temperature.start.getTime() + index * timestep)
      );
    }
    updates.push({
      event: "addLayer",
      type: "addRaster",
      id: "raster_temperature",
      options: {
        data: data.temperature.data[index],
        geometry: data.geometry,
        displayOptions: {
          min: data.temperature.min,
          max: data.temperature.max,
          unit: "°C",
        },
      },
    });
    updates.push({
      event: "addLayer",
      type: "addVectorField",
      id: "vector_currents",
      options: {
        data: data.velocity.data[index],
        geometry: data.geometry,
        displayOptions: {
          min: data.velocity.min,
          max: data.velocity.max,
          unit: "m/s",
        },
      },
    });
    this.setState({ metadata, data, updates, date, time, current: true });
  }
  render() {
    var { updates, mapId, current, date, time } = this.state;
    var { dark, bounds, language, id, parameters } = this.props;
    return (
      <div className="threedmodel">
        <h3>
          {Translations.temperaturecurrent[language]} - 3D{" "}
          <Information information={Translations.threedmodelText[language]} />
        </h3>
        <div className="map-sidebar">
          <div className="map-sidebar-left">
            {current && (
              <div className="current">
                <div>{date ? date : Translations.today[language]}</div>
                <div>{time}</div>
              </div>
            )}
            <MapButton
              link={`/map/${id}?layers=water_temperature`}
              language={language}
            />
            <Basemap
              updates={updates}
              updated={this.updated}
              dark={dark}
              mapId={mapId}
              bounds={bounds}
            />
          </div>
          <div className="map-sidebar-right">
            {parameters.labels.map((l) => (
              <PlaceholderGraph key={l.name} title={l.name} />
            ))}
          </div>
        </div>
      </div>
    );
  }
}

export default ThreeDModel;
