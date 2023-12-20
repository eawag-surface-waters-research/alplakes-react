import React, { Component } from "react";
import L from "leaflet";
import "./css/leaflet.css";

class HomeMap extends Component {
  componentDidUpdate(prevProps) {
    var { language, list } = this.props;
    if (this.plot || prevProps.language !== language) {
      this.polygons.clearLayers();
      for (let lake of list) {
        if (lake.geometry !== false) {
          L.geoJSON(
            {
              type: "Polygon",
              coordinates: lake.geometry,
            },
            {
              style: {
                fillColor: "red", // Set the fill color
                weight: 2, // Set the border weight
                opacity: 0, // Set the border opacity
                color: "red", // Set the border color
                fillOpacity: 0.7, // Set the fill opacity
              },
            }
          ).addTo(this.polygons);
        }
      }
      this.map.fitBounds(this.polygons.getBounds());
      this.plot = false;
    }
  }
  async componentDidMount() {
    var center = [46.9, 8.2];
    var zoom = 8;
    this.map = L.map("map", {
      preferCanvas: true,
      center: center,
      zoom: zoom,
      minZoom: 5,
      maxZoom: 15,
      maxBoundsViscosity: 0.5,
    });
    L.tileLayer(
      "https://api.mapbox.com/styles/v1/jamesrunnalls/clg4u62lq009a01oa5z336xn7/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiamFtZXNydW5uYWxscyIsImEiOiJjazk0ZG9zd2kwM3M5M2hvYmk3YW0wdW9yIn0.uIJUZoDgaC2LfdGtgMz0cQ",
      {
        maxZoom: 19,
        attribution: "&copy; <a href='https://www.mapbox.com/'>mapbox</a>",
      }
    ).addTo(this.map);
    this.polygons = L.featureGroup().addTo(this.map);
    this.plot = true;
  }

  render() {
    return (
      <React.Fragment>
        <div id="map"></div>
      </React.Fragment>
    );
  }
}

export default HomeMap;
