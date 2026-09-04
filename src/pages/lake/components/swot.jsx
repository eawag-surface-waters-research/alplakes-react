import React, { Component } from "react";
import { downloadSwot } from "../functions/download";
import Translations from "../../../translations.json";
import Information from "../../../components/information/information";
import DatasetLinegraph from "../../../components/d3/dataset/datasetlinegraph";
import Loading from "../../../components/loading/loading";
import { robustOutliers, segmentedFit } from "../functions/smoothing";

const GOOD_COLOR = "#1878b9";
const FLAG_COLOR = "#9d9d9d";
const FIT_COLOR = "#c8442c";
const MIN_OBSERVATIONS = 10;
const MAX_UNCERTAINTY = 0.1;
const MIN_FIT_OBSERVATIONS = 30;
const MIN_FIT_SEGMENT = 10;
const FIT_FRACTION = 0.1;
const FIT_THRESHOLD = 4;
const FIT_MAX_GAP_DAYS = 63;

const number = (value) => (Number.isFinite(value) ? value : false);

const missionFlagged = (row) => row.qa !== "used" || row.quality_f !== 0;

const uncertain = (row) => row.wse_u > MAX_UNCERTAINTY;

const usable = (row) =>
  Number.isFinite(row.wse) && !missionFlagged(row) && !uncertain(row);

class SwotLegend extends Component {
  render() {
    var { fontSize, language, counts, fit } = this.props;
    return (
      <div className="graph-legend" style={{ fontSize: `${fontSize}px` }}>
        <div className="item">
          <div className="dot" style={{ backgroundColor: GOOD_COLOR }}></div>
          <div className="text">
            {Translations.goodQuality[language]} ({counts.good})
          </div>
        </div>
        {counts.flagged > 0 && (
          <div className="item">
            <div className="cross" style={{ color: FLAG_COLOR }}>
              ✕
            </div>
            <div className="text">
              {Translations.flagged[language]} ({counts.flagged})
            </div>
          </div>
        )}
        {fit && (
          <div className="item">
            <div className="line" style={{ borderColor: FIT_COLOR }}></div>
            <div className="text">
              {Translations.trend[language]} (LOWESS)
            </div>
          </div>
        )}
      </div>
    );
  }
}

class Swot extends Component {
  state = {
    data: false,
    error: false,
    datum: false,
    fraction: FIT_FRACTION,
    fontSize: 12,
  };

  setFontSize = (fontSize) => {
    this.setState({ fontSize });
  };

  setDatum = (event) => {
    this.setState({ datum: event.target.value });
  };

  setFraction = (event) => {
    this.setState({ fraction: parseFloat(event.target.value) });
  };

  datumOptions = (data) => {
    const { language } = this.props;
    const options = [];
    for (const country in data.offsets) {
      const offset = data.offsets[country];
      const separation = number(offset.separation_m);
      const constant = number(offset.offset_m);
      if (separation === false && constant === false) continue;
      options.push({
        key: country,
        label: `${offset.datum} (${country})`,
        mode: separation === false ? "constant" : "separation",
        separation,
        constant,
        offset: constant,
        validated: offset.validated,
      });
    }
    options.push({
      key: "geoid",
      label: `${data.datum} (${Translations.geoid[language]})`,
      mode: "geoid",
      offset: false,
      validated: true,
    });
    return options;
  };

  defaultDatum = (data) => {
    const national = this.datumOptions(data).filter(
      (o) => o.mode === "separation" || o.mode === "constant"
    );
    const validated = national.find((o) => o.validated);
    if (validated) return validated.key;
    if (national.length > 0) return national[0].key;
    return "geoid";
  };

  convert = (row, option) => {
    if (option.mode === "geoid") return row.wse;
    if (option.mode === "constant") return row.wse + option.constant;
    return row.wse + row.geoid_hght - option.separation;
  };

  plotData = (data, option, fraction) => {
    const { language } = this.props;
    const candidates = data.data
      .filter(usable)
      .sort((a, b) => new Date(a.time) - new Date(b.time));
    const times = candidates.map((d) => new Date(d.time).getTime());
    const values = candidates.map((d) => this.convert(d, option));
    var fit = false;
    var outliers = new Set();
    if (candidates.length >= MIN_FIT_OBSERVATIONS) {
      outliers = robustOutliers(
        times,
        candidates.map((d) => d.wse),
        fraction,
        FIT_THRESHOLD,
        FIT_MAX_GAP_DAYS
      );
      const retained = Array.from(
        { length: times.length },
        (_, index) => index
      ).filter((index) => !outliers.has(index));
      const curve = segmentedFit(
        times,
        values,
        retained,
        fraction,
        FIT_MAX_GAP_DAYS,
        MIN_FIT_SEGMENT
      );
      if (curve.x.length > 0) fit = curve;
    }
    const outlierRows = new Set([...outliers].map((i) => candidates[i]));
    const good = candidates.filter((d) => !outlierRows.has(d));
    const y = values.filter((v, i) => !outliers.has(i));
    const flagged = data.data.filter((d) => !usable(d) || outlierRows.has(d));
    const plot = [
      {
        x: good.map((d) => new Date(d.time)),
        y,
        lines: false,
        name: false,
        lineColor: GOOD_COLOR,
        tooltip: Translations.goodQuality[language],
      },
    ];
    if (flagged.length > 0) {
      plot.push({
        x: flagged.map((d) => new Date(d.time)),
        y: flagged.map((d) => this.convert(d, option)),
        symbol: "cross",
        lines: false,
        name: false,
        lineColor: FLAG_COLOR,
        lineWeight: 1.5,
        tooltip: Translations.flagged[language],
      });
    }
    if (fit) {
      plot.push({
        x: fit.x,
        y: fit.y,
        scatter: false,
        name: false,
        lineColor: FIT_COLOR,
        lineWeight: 3,
        tooltip: Translations.trend[language],
      });
    }
    return {
      plot,
      fit,
      yMin: Math.min(...y),
      yMax: Math.max(...y),
      counts: { good: good.length, flagged: flagged.length },
    };
  };

  async componentDidMount() {
    const { lake, setSwot } = this.props;
    const data = await downloadSwot(lake);
    if (!data || !Array.isArray(data.data)) {
      this.setState({ error: true });
      return;
    }
    if (data.data.filter(usable).length < MIN_OBSERVATIONS) {
      this.setState({ error: true });
      return;
    }
    const datum = this.defaultDatum(data);
    this.setState({ data, datum });
    setSwot(true);
  }

  render() {
    var { language, dark } = this.props;
    var { data, error, datum, fraction, fontSize } = this.state;
    if (error) return null;
    const description = {
      EN: (
        <div className="description">
          Lake surface elevation measured by the SWOT satellite mission. SWOT
          maps the full lake surface every few days, providing water levels for
          lakes without a gauging station. Observations that the mission flags,
          that are too uncertain, or that are rejected as outliers are marked
          with a cross and left out of the axis scaling, so they may fall
          outside the plot.
        </div>
      ),
      DE: (
        <div className="description">
          Seespiegelhöhe, gemessen von der Satellitenmission SWOT. SWOT erfasst
          die gesamte Seeoberfläche alle paar Tage und liefert damit Wasserstände
          für Seen ohne Messstation. Messungen, die von der Mission
          gekennzeichnet werden, zu unsicher sind oder als Ausreisser verworfen
          werden, sind mit einem Kreuz markiert und fliessen nicht in die
          Achsenskalierung ein, sie können daher ausserhalb des Diagramms
          liegen.
        </div>
      ),
      FR: (
        <div className="description">
          Altitude de la surface du lac mesurée par la mission satellitaire
          SWOT. SWOT cartographie l'ensemble de la surface du lac tous les
          quelques jours et fournit ainsi des niveaux d'eau pour les lacs sans
          station de mesure. Les observations signalées par la mission, trop
          incertaines ou rejetées comme aberrantes sont marquées d'une croix et
          exclues de l'échelle de l'axe, elles peuvent donc sortir du graphique.
        </div>
      ),
      IT: (
        <div className="description">
          Quota della superficie del lago misurata dalla missione satellitare
          SWOT. SWOT rileva l'intera superficie del lago ogni pochi giorni,
          fornendo livelli dell'acqua anche per i laghi senza stazione di
          misura. Le osservazioni segnalate dalla missione, troppo incerte o
          rifiutate come anomale sono contrassegnate da una croce ed escluse
          dalla scala dell'asse, quindi possono cadere fuori dal grafico.
        </div>
      ),
    };
    var display = false;
    var option = false;
    var counts = false;
    var fit = false;
    if (data && datum) {
      const options = this.datumOptions(data);
      option = options.find((o) => o.key === datum);
      const plotted = this.plotData(data, option, fraction);
      counts = plotted.counts;
      fit = plotted.fit;
      display = {
        xlabel: "time",
        xunits: "",
        ylabel: Translations.waterlevel[language],
        yunits: `m (${option.label})`,
        data: plotted.plot,
        yMin: plotted.yMin,
        yMax: plotted.yMax,
      };
    }
    return (
      <div className="swot subsection">
        <h3>
          {Translations.swot[language]}
          <Information information={Translations.swotText[language]} />
        </h3>
        <div className="map-sidebar">
          <div className="map-sidebar-left">
            {display ? (
              <div className="line-graph-container">
                <DatasetLinegraph
                  {...display}
                  scatter={true}
                  lines={true}
                  dark={dark}
                  language={language}
                  fontSize={fontSize}
                  setFontSize={this.setFontSize}
                />
                <SwotLegend
                  language={language}
                  fontSize={fontSize}
                  counts={counts}
                  fit={fit}
                />
              </div>
            ) : (
              <div className="loading-graph">
                <Loading />
              </div>
            )}
          </div>
          <div className="map-sidebar-right">
            {data && (
              <div className="graph-properties">
                {description[language]}
                <div className="setting">
                  <div className="label">{Translations.datum[language]}</div>
                  {option.offset !== false && option.offset !== 0 && (
                    <div className="value">
                      {option.offset > 0 ? "+" : ""}
                      {option.offset.toFixed(2)} m ({data.datum})
                    </div>
                  )}
                  <select value={datum} onChange={this.setDatum}>
                    {this.datumOptions(data).map((o) => (
                      <option value={o.key} key={o.key}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
                {!option.validated && (
                  <div className="setting-warning">
                    {Translations.unvalidatedDatum[language]}
                  </div>
                )}
                <div className="setting">
                  <div className="label">
                    {Translations.smoothness[language]}
                    <Information
                      above={true}
                      small={true}
                      information={Translations.smoothnessText[language]}
                    />
                  </div>
                  <div className="value">{fraction.toFixed(2)}</div>
                  <input
                    type="range"
                    min="0.01"
                    max="0.8"
                    step="0.01"
                    value={fraction}
                    onChange={this.setFraction}
                  ></input>
                </div>
                <div className="setting">
                  <div className="label">
                    {Translations.dataSource[language]}
                  </div>
                  {data.last_updated && (
                    <div className="value">
                      {Translations.lastUpdated[language]}:{" "}
                      {new Date(data.last_updated).toLocaleDateString()}
                    </div>
                  )}
                  <div>
                    <a
                      href="https://podaac.jpl.nasa.gov/dataset/SWOT_L2_HR_LakeSP_D"
                      alt="SWOT lake single pass product"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      SWOT L2 HR LakeSP ({data.lake_id})
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

export default Swot;
