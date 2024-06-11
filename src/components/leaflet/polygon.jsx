import React, { Component } from "react";
import L from "leaflet";
import "./css/leaflet.css";

class PolygonGraph extends Component {
  state = {
    graphid: Math.round(Math.random() * 100000),
  };
  async componentDidMount() {
    const { graphid } = this.state;
    const { geometry } = this.props;
    var map = L.map(`polygon_${graphid}`, {
      preferCanvas: true,
      zoomControl: false,
      zoomSnap: 0.1
    });
    this.map = map;
    var polygon = L.geoJSON(
      {
        type: "Polygon",
        coordinates: geometry,
      },
      {
        style: {
          fillColor: "rgba(68,188,167,255)",
          weight: 1,
          opacity: 1,
          color: "rgba(68,188,167,255)",
          fillOpacity: 0.2,
        },
      }
    );
    this.map.fitBounds(polygon.getBounds());
    polygon.addTo(this.map);
  }
  componentWillUnmount() {
    this.map.off();
    this.map.remove();
  }

  render() {
    const { graphid } = this.state;
    return (
      <React.Fragment>
        <div id={`polygon_${graphid}`}></div>
      </React.Fragment>
    );
  }
}

export default PolygonGraph;
