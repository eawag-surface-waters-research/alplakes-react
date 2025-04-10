import React, { Component, createRef } from "react";
import axios from "axios";
import CONFIG from "../../../config.json";
import { hour, round, timeAgo } from "../functions/general";
import Translations from "../../../translations.json";
import Basemap from "../../../components/leaflet/basemap";
import Information from "../../../components/information/information";
import MapButton from "../../../components/mapbutton/mapbutton";
import LandCoverMap from "../../../components/leaflet/landcover";

class LandCover extends Component {
  state = {
    hasBeenVisible: false,
    mapId: "map_" + Math.round(Math.random() * 100000),
  };

  ref = createRef();

  updated = () => {
    this.setState({ updates: [] });
  };

  componentDidMount() {
    this.observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !this.state.hasBeenVisible) {
          this.setState({ hasBeenVisible: true }, this.onVisible);
          this.observer.disconnect();
        }
      },
      { threshold: 0.0 }
    );

    if (this.ref.current) {
      this.observer.observe(this.ref.current);
    }
  }

  componentWillUnmount() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  onVisible = async () => {
    
    console.log()
  };

  render() {
    var { mapId } = this.state;
    var { dark, bounds, language } = this.props;
    return (
      <div className="water-temperature subsection" ref={this.ref}>
        <h3>
          {Translations.landcover[language]}
          <Information
            information={Translations.landcoverText[language]}
          />
        </h3>
        <div className="map-sidebar">
          <div className="map-sidebar-left">
            <LandCoverMap dark={dark} mapId={mapId} bounds={bounds}/>
          </div>
            <div className="map-sidebar-right">
              
            </div>
        </div>
      </div>
    );
  }
}

export default LandCover;
