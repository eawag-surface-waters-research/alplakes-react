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
      EN: (
        <div className="description">
          Elevated phosphorus levels can cause eutrophication, leading to
          excessive algal growth and oxygen depletion in lakes. This time series
          monitors phosphorus concentrations and compares them against target
          thresholds.
        </div>
      ),
      DE: (
        <div className="description">
          Erhöhte Phosphorwerte können zu Eutrophierung führen, was zu
          übermäßigem Algenwachstum und Sauerstoffmangel in Seen führt. Diese
          Zeitreihe überwacht die Phosphorkonzentrationen und vergleicht sie mit
          den Zielwerten.
        </div>
      ),
      FR: (
        <div className="description">
          Des niveaux élevés de phosphore peuvent provoquer l'eutrophisation,
          entraînant une croissance excessive des algues et un appauvrissement
          en oxygène dans les lacs. Cette série chronologique surveille les
          concentrations de phosphore et les compare aux seuils cibles.
        </div>
      ),
      IT: (
        <div className="description">
          Livelli elevati di fosforo possono causare eutrofizzazione, portando a
          un'eccessiva crescita algale e alla carenza di ossigeno nei laghi.
          Questa serie temporale monitora le concentrazioni di fosforo e le
          confronta con le soglie obiettivo.
        </div>
      ),
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
              <div className="graph-properties">
                {description[language]}
                <div className="indicators">
                  <div className="indicator-outer">
                    <div className="indicator-value">
                      {info["targetString"]}
                      <div className="indicator-unit">µg/l</div>
                    </div>
                    <div className="indicator-type">
                      {Translations.target[language]}
                    </div>
                  </div>
                  <div className="indicator-outer">
                    <div
                      className="indicator-value"
                      style={{ color: info["color"] }}
                    >
                      {info.current["value"]}
                      <div className="indicator-unit">µg/l</div>
                    </div>
                    <div className="indicator-type">
                      {Translations.latest[language]} ({info.current["year"]})
                    </div>
                  </div>
                </div>
                <div className="setting">
                  <div className="label">{Translations.source[language]}</div>
                  <div>
                    <a
                      href="https://www.bafu.admin.ch/bafu/en/home/topics/water/state-of-lakes/water-quality-in-lakes/_jcr_content/par/accordion/items/indikator_phosphorge/accordionpar/externalcontent.bitexternalcontent.exturl.xlsx/aHR0cHM6Ly93d3cuaW5kaWthdG9yZW4uYWRtaW4uY2gvUHVibG/ljL0V4cG9ydD9jaGFydENvbmZpZ3VyYXRpb25JZD0xNTY1NA==/.xlsx"
                      alt="Bafu phosphorus data"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Kantonale Gewässerschutzfachstellen und internationalen
                      Gewässerkommissionen
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default Phosphorus;
