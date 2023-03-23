import React, { Component } from "react";
import L from "leaflet";
import "./css/leaflet.css";

class LakeMap extends Component {
  componentDidUpdate() {
    var { lakes } = this.props;
    const markers = L.featureGroup(
      lakes.map((lake) =>
        L.marker([lake.latitude, lake.longitude], {
          id: lake.key,
          icon: L.divIcon({
            className: "map-marker",
            html:
              `<div style="padding:10px;transform:translate(2px, -21px);position: absolute;">` +
              `<div class="pin bounce" id="${
                "pin-" + lake.key
              }" style="background-color:#24251D" />` +
              `</div> `,
          }),
        }).on("click", (event) => {
          window.location.href = `/lake/${event.target.options.id}`;
        })
      )
    ).addTo(this.map);
    this.map.flyToBounds(markers.getBounds());
  }
  async componentDidMount() {
    var center = [46.9, 8.2];
    var zoom = 7;
    this.map = L.map("lake-map", {
      preferCanvas: true,
      zoomControl: false,
      center: center,
      zoom: zoom,
      minZoom: 5,
      maxZoom: 15,
      maxBoundsViscosity: 0.5,
    });
    L.tileLayer(
      "https://api.mapbox.com/styles/v1/jamesrunnalls/clf4ao087000201qr00bsj1f1/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiamFtZXNydW5uYWxscyIsImEiOiJjazk0ZG9zd2kwM3M5M2hvYmk3YW0wdW9yIn0.uIJUZoDgaC2LfdGtgMz0cQ",
      {
        maxZoom: 19,
        attribution: "&copy; <a href='https://www.mapbox.com/'>mapbox</a>",
      }
    ).addTo(this.map);
  }

  render() {
    return (
      <React.Fragment>
        <div id="lake-map"></div>
      </React.Fragment>
    );
  }
}

export default LakeMap;
