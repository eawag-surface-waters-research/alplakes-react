import React, { Component, createRef } from "react";
import { downloadPastYear } from "../functions/download";
import Translations from "../../../translations.json";
import Information from "../../../components/information/information";
import DatasetHeatmap from "../../../components/d3/dataset/datasetheatmap";
import COLORS from "../../../components/colors/colors.json";
import Loading from "../../../components/loading/loading";

class PastYear extends Component {
  state = {
    hasBeenVisible: false,
    model: "",
    models: [],
    variable: "",
    variables: [],
    start_date: false,
    end_date: false,
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
    const { data, start_date, end_date, start, end } = await downloadPastYear(
      initial.model,
      initial.key,
      variable.key,
      true
    );
    var options = {
      period: [start, end],
      start_date,
      end_date,
      xlabel: "time",
      xunits: "",
      ylabel: "Depth",
      yunits: "m",
      zlabel: Translations[variable.name][language],
      zunits: variable.unit,
    };
    if ("paletteName" in initial.displayOptions) {
      let palette = COLORS[initial.displayOptions.paletteName].map((c) => {
        return { color: [c[0], c[1], c[2]], point: c[3] };
      });
      options["palette"] = palette;
    }
    const display = { ...initial.displayOptions, ...options, data };
    this.setState({
      model,
      models,
      variable,
      variables,
      start_date,
      end_date,
      display,
    });
  };

  render() {
    var { language, dark } = this.props;
    var { display } = this.state;
    return (
      <div className="past-year" ref={this.ref}>
        <h3>
          {Translations.pastYear[language]}
          <Information information={Translations.pastYearText[language]} />
        </h3>
        <div className="map-sidebar">
          <div className="map-sidebar-left">
            {display ? (
              <div className="graph-container">
                <DatasetHeatmap {...display} dark={dark} language={language} />
              </div>
            ) : (
              <div className="loading-graph">
                <Loading />
              </div>
            )}
          </div>
          <div className="map-sidebar-right"></div>
        </div>
      </div>
    );
  }
}

export default PastYear;
