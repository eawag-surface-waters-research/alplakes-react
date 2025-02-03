import React, { Component, createRef } from "react";
import { downloadDoy } from "../functions/download";
import Translations from "../../../translations.json";
import Information from "../../../components/information/information";
import DatasetLinegraph from "../../../components/d3/dataset/datasetlinegraph";

class DoyLegend extends Component {
  render() {
    const { min_year, max_year, language } = this.props;
    return (
      <div className="graph-legend">
        {max_year && (
          <div className="date">
            Reference period {`${min_year} - ${max_year}`}
          </div>
        )}
        <div className="item">
          <div className="box" style={{ opacity: 0.3 }}></div>
          <div className="text">
            25-75 p<sup>th</sup>
          </div>
        </div>
        <div className="item">
          <div className="box"></div>
          <div className="text">
            5-95 p<sup>th</sup>
          </div>
        </div>
        <div className="item">
          <div className="line" style={{ borderColor: "#ff7d45" }}></div>
          <div className="text">{new Date().getFullYear()}</div>
        </div>
        <div className="item">
          <div className="line" style={{ borderColor: "#ffc045" }}></div>
          <div className="text">{new Date().getFullYear() - 1}</div>
        </div>
        <div className="item">
          <div className="line" style={{ borderColor: "lightGrey" }}></div>
          <div className="text">Min, Mean, Max</div>
        </div>
      </div>
    );
  }
}

class Doy extends Component {
  state = {
    hasBeenVisible: false,
    model: "",
    models: [],
    variable: "",
    variables: [],
    depth: "",
    depths: [],
    min_year: false,
    max_year: false,
    display: false,
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
    const { parameters, language } = this.props;
    const models = parameters.models.map((m) => {
      return { key: `${m.key}_${m.model}`, label: m.name };
    });
    const model = models[0];
    const initial = parameters.models[0];
    const variables = initial.parameters;
    const variable = variables[0];
    const depths = initial.depths;
    const depth = depths[0];
    const { min_year, max_year, data } = await downloadDoy(
      initial.model,
      initial.key,
      depth,
      variable.key,
      true
    );
    const display = {
      xlabel: "time",
      xunits: "",
      ylabel: Translations[variable.name][language],
      yunits: variable.unit,
      data,
    };
    this.setState({
      model,
      models,
      variable,
      variables,
      depth,
      depths,
      min_year,
      max_year,
      display,
    });
  };

  render() {
    var { language, dark } = this.props;
    var { display, min_year, max_year } = this.state;
    return (
      <div className="doy" ref={this.ref}>
        <h3>
          {Translations.doyStats[language]}
          <Information information={Translations.doyStatsText[language]} />
        </h3>
        <div className="map-sidebar">
          <div className="map-sidebar-left">
            {display && (
              <div className="graph-container">
                <DatasetLinegraph
                  {...display}
                  dark={dark}
                  language={language}
                />
                <DoyLegend
                  min_year={min_year}
                  max_year={max_year}
                  language={language}
                />
              </div>
            )}
          </div>
          <div className="map-sidebar-right"></div>
        </div>
      </div>
    );
  }
}

export default Doy;
