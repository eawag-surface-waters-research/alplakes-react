import React, { Component } from "react";
import L from "leaflet";
import "./css/leaflet.css";

class HomeMap extends Component {
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
