import React, { Component, createRef } from "react";
import axios from "axios";
import CONFIG from "../../../config.json";
import { round, timeAgo } from "../functions/general";
import { hour } from "../../../global";
import Translations from "../../../translations.json";
import Information from "../../../components/information/information";

class WaterLevel extends Component {
  state = {
    hasBeenVisible: false,
    levels: [],
  };

  ref = createRef();

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
    const { id } = this.props;
    var { levels } = this.state;
    var { data } = await axios.get(
      CONFIG.alplakes_bucket + "/insitu/summary/water_level.geojson" + hour()
    );
    const now = new Date();
    const minDate = new Date(now.getTime() - 48 * 60 * 60 * 1000);
    for (let i = 0; i < data.features.length; i++) {
      let time = new Date(data.features[i].properties.last_time * 1000);
      if (data.features[i].properties.lake === id && time > minDate) {
        let parts = data.features[i].properties.label.split(" - ");
        data.features[i].properties.label = parts[parts.length - 1].trim();
        data.features[i].properties.lat =
          data.features[i]["geometry"]["coordinates"][1];
        data.features[i].properties.lng =
          data.features[i]["geometry"]["coordinates"][0];
        levels.push(data.features[i].properties);
      }
    }
    this.setState({ levels });
  };

  render() {
    var { levels } = this.state;
    var { language } = this.props;
    return (
      <div className="water-levels subsection" ref={this.ref}>
        <h3>
          {Translations.waterlevel[language]}
          <Information information={Translations.waterlevelText[language]} />
        </h3>
        <div className="clickable-box-parent">
          {levels.map((l) => (
            <a
              href={l.url}
              key={l.label}
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="clickable-box">
                <div className="right">
                  {round(l.last_value, 2)} {l.unit}
                  <div className="time">
                    {timeAgo(l.last_time * 1000, language)}
                  </div>
                </div>
                <div className="title">{l.label}</div>
                <div className="subtitle">{`${round(l.lat, 2)}, ${round(
                  l.lng,
                  2
                )}`}</div>
                <div className="link">{l.source}</div>
              </div>
            </a>
          ))}
        </div>
      </div>
    );
  }
}

export default WaterLevel;
