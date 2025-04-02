import React, { Component, createRef } from "react";
import axios from "axios";
import { timeAgo2 } from "../functions/general";
import Translations from "../../../translations.json";
import Information from "../../../components/information/information";

class Webcams extends Component {
  state = {
    hasBeenVisible: false,
    webcams: [],
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
    const { ids } = this.props;
    const { webcams } = this.state;
    const start = "UmLY2Zjwa8B";
    const middle = "UFhykdMdE2p";
    const end = "34JatksktC";
    try {
      var response = await axios.get(
        `https://api.windy.com/webcams/api/v3/webcams?lang=en&limit=10&offset=0&webcamIds=${ids.join(
          ","
        )}&include=images,urls`,
        {
          headers: {
            "x-windy-api-key": start + middle + end,
          },
        }
      );
      if (response.status === 200) {
        for (let webcam of response.data.webcams) {
          try {
            webcams.push({
              id: webcam.webcamId,
              title: webcam.title,
              image: webcam.images.current.preview,
              link: webcam.urls.detail,
              time: new Date(webcam.lastUpdatedOn),
            });
          } catch (e) {}
        }
        this.setState({ webcams });
      }
    } catch (e) {}
  };

  render() {
    const { language } = this.props;
    const { webcams } = this.state;
    return (
      <div className="webcams subsection" ref={this.ref}>
        <h3>
          {Translations.webcams[language]}
          <Information information={Translations.webcamsText[language]} />
        </h3>
        <div className="webcams-outer">
          {webcams.map((w) => (
            <a
              href={w.link}
              target="_blank"
              rel="noopener noreferrer"
              key={w.id}
            >
              <div className="webcams-inner">
                <img src={w.image} alt={w.title} />
                <div className="label">
                  <div className="value">{w.title.split(":")[0]}</div>
                  <div className="time">{timeAgo2(w.time, language)}</div>
                </div>
              </div>
            </a>
          ))}
        </div>

        <div className="windy">
          Webcams provided by{" "}
          <a href="https://www.windy.com/" target="_blank" rel="noreferrer">
            windy.com
          </a>{" "}
          &mdash;{" "}
          <a href="https://www.windy.com/webcams/add" target="_blank" rel="noreferrer">
            add a webcam
          </a>
        </div>
      </div>
    );
  }
}

export default Webcams;
