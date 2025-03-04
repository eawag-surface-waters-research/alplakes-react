import React, { Component } from "react";
import SummaryGraph from "../d3/summarygraph/summarygraph";
import Translations from "../../translations.json";
import "./summarytable.css";

class SummaryTable extends Component {
  formatDateYYYYMMDD = (d) => {
    const date = new Date(d);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}${month}${day}`;
  };
  dayName = (YYYYMMDD, language, Translations, full = false) => {
    if (this.formatDateYYYYMMDD(new Date()) === YYYYMMDD) {
      if (full) {
        return Translations.today[language];
      }
      return Translations.today[language];
    }
    const year = parseInt(YYYYMMDD.substr(0, 4), 10);
    const month = parseInt(YYYYMMDD.substr(4, 2), 10) - 1;
    const day = parseInt(YYYYMMDD.substr(6, 2), 10);
    var daysOfWeekNames = Translations.axis[language].shortDays;
    if (full) {
      daysOfWeekNames = Translations.axis[language].days;
    }
    const date = new Date(year, month, day);
    const dayOfWeekNumber = date.getDay();
    return daysOfWeekNames[dayOfWeekNumber];
  };
  render() {
    var { start, end, dt, value, summary, unit, language } = this.props;
    return (
      <div className="summary-table">
        {Object.keys(summary).map((day, i, arr) => (
          <div key={day} className={i === 0 ? "inner start" : "inner"}>
            <div className="ave">
              {summary[day]}
              <div className="unit full">{unit}</div>
            </div>
            <div className="day">
              {this.dayName(day, language, Translations)}
            </div>
          </div>
        ))}
        <SummaryGraph dt={dt} value={value} dtMin={start} dtMax={end} />
      </div>
    );
  }
}

export default SummaryTable;
