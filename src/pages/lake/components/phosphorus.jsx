import React, { Component, createRef } from "react";
import { downloadPhosphorus } from "../functions/download";
import Translations from "../../../translations.json";
import Information from "../../../components/information/information";
import DatasetLinegraph from "../../../components/d3/dataset/datasetlinegraph";
import Loading from "../../../components/loading/loading";

class PhosphorusLegend extends Component {
  render() {
    var { fontSize, language, info } = this.props;
    return (
      <div className="graph-legend" style={{ fontSize: `${fontSize}px` }}>
        <div className="item">
          <div className="box" style={{ backgroundColor: "green" }}></div>
          <div className="text">
            {Translations.target[language]}{" "}
            {info && ` (${info.name[language]})`}
          </div>
        </div>
        <div className="item">
          <div className="line" style={{ borderColor: "red" }}></div>
          <div className="text">
            {Translations.measurements[language]}{" "}
            {info && ` (${info.name[language]})`}
          </div>
        </div>
      </div>
    );
  }
}

class Phosphorus extends Component {
  state = {
    hasBeenVisible: false,
    display: false,
    info: false,
    fontSize: 12,
  };

  setFontSize = (fontSize) => {
    this.setState({ fontSize });
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
    const { lake, language, dark } = this.props;
    const { data, yMax, xMin, xMax, info } = await downloadPhosphorus(
      lake,
      dark,
      language
    );
    const display = {
      xlabel: Translations.year[language],
      xunits: "",
      ylabel: Translations["phosphorus"][language],
      yunits: "µg/l",
      data: data,
      yMin: 0,
      yMax: yMax,
      xMin: xMin,
      xMax: xMax,
    };
    this.setState({
      display,
      info,
    });
  };

  render() {
    var { language, dark } = this.props;
    var { display, fontSize, info } = this.state;
    const description = {
      EN: <div className="description">Some text here</div>,
      DE: <div className="description">Some text here</div>,
      FR: <div className="description">Some text here</div>,
      IT: <div className="description">Some text here</div>,
    };
    return (
      <div className="phosphorus subsection" ref={this.ref}>
        <h3>
          {Translations.phosphorus[language]}
          <Information information={Translations.phosphorusText[language]} />
        </h3>
        <div className="map-sidebar">
          <div className="map-sidebar-left">
            {display ? (
              <div className="line-graph-container">
                <DatasetLinegraph
                  {...display}
                  dark={dark}
                  language={language}
                  fontSize={fontSize}
                  setFontSize={this.setFontSize}
                />
                <PhosphorusLegend
                  language={language}
                  fontSize={fontSize}
                  info={info}
                />
              </div>
            ) : (
              <div className="loading-graph">
                <Loading />
              </div>
            )}
          </div>
          <div className="map-sidebar-right">
            {info && (
              <div className="graph-properties">{description[language]}</div>
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default Phosphorus;
