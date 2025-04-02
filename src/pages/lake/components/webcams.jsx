import React, { Component, createRef } from "react";
import axios from "axios";
import CONFIG from "../../../config.json";
import Translations from "../../../translations.json";
import Information from "../../../components/information/information";

class Webcams extends Component {
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

  onVisible = async () => {};

  render() {
    var { language } = this.props;
    return (
      <div className="webcams subsection" ref={this.ref}>
        <h3>
          {Translations.webcams[language]}
          <Information information={Translations.webcamsText[language]} />
        </h3>
        <img src="https://images-webcams.windy.com/47/1252954747/current/full/1252954747.jpg" />
      </div>
    );
  }
}

export default Webcams;
