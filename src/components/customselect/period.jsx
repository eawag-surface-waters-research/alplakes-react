import React, { Component } from "react";
import DatePicker from "react-datepicker";
import enGB from "date-fns/locale/en-GB";
import Translations from "../../translations.json";
import "react-datepicker/dist/react-datepicker.css";

const parseDay = (yyyymmdd) => {
  const year = parseInt(yyyymmdd.substring(0, 4), 10);
  const month = parseInt(yyyymmdd.substring(4, 6), 10) - 1;
  const day = parseInt(yyyymmdd.substring(6, 8), 10);
  const date = new Date(year, month, day);
  return date;
};

const isValidDate = (date) => {
  return !isNaN(date.getTime());
};

const daysBetween = (date1, date2) => {
  const oneDay = 1000 * 60 * 60 * 24;
  const diffTime = Math.abs(date2.getTime() - date1.getTime());
  return Math.ceil(diffTime / oneDay);
};

class Period extends Component {
  state = {
    period: this.props.period,
    maxPeriod: this.props.maxPeriod ? this.props.maxPeriod : 14,
    maxPeriodDate: false,
  };
  addDays = (date, days) => {
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  };
  setDateRange = (period) => {
    var { maxPeriod } = this.state;
    var { setPeriod, maxDate } = this.props;
    if (period[0] !== null && period[1] !== null) {
      setPeriod([
        new Date(Math.floor(period[0].getTime())),
        new Date(Math.floor(period[1].getTime() + 75600000)),
      ]);
      this.setState({ period, maxPeriodDate: false });
    } else if (period[0] !== null && period[1] === null) {
      var maxPeriodDate = this.addDays(period[0], maxPeriod);
      this.setState({
        period,
        maxPeriodDate: maxPeriodDate < maxDate ? maxPeriodDate : maxDate,
      });
    }
  };
  componentDidUpdate(prevProps) {
    if (
      prevProps.minDate !== this.props.minDate ||
      prevProps.maxDate !== this.props.maxDate ||
      prevProps.period !== this.props.period
    ) {
      this.setState({
        period: this.props.period,
        minDate: this.props.minDate,
        maxDate: this.props.maxDate,
      });
    }
  }
  render() {
    var { language, minDate, maxDate, missingDates } = this.props;
    missingDates = missingDates ? missingDates : [];
    var { period, maxPeriodDate, maxPeriod } = this.state;
    const locale = {
      ...enGB,
      localize: {
        ...enGB.localize,
        day: (n) => Translations.axis[language].shortDays[n],
        month: (n) => Translations.axis[language].months[n],
      },
      formatLong: {
        ...enGB.formatLong,
        date: () => "dd/mm/yyyy",
      },
    };
    var excludeDateIntervals = missingDates.map((m) => {
      return {
        start: parseDay(m[0].replaceAll("-", "")),
        end: parseDay(m[1].replaceAll("-", "")),
      };
    });
    return (
      <DatePicker
        selectsRange={true}
        startDate={period[0]}
        endDate={period[1]}
        onChange={(update) => {
          this.setDateRange(update);
        }}
        onBlur={(e) => {
          if (e.target.value) {
            let dates = e.target.value.split(" - ").map((input) => {
              const [day, month, year] = input.split("/").map(Number);
              const date = new Date(year, month - 1, day);
              return isValidDate(date) ? date : null;
            });
            let max = new Date(maxDate);
            max.setDate(max.getDate() + 1);
            if (dates[0] !== null && dates[1] !== null) {
              if (
                dates[0].toLocaleDateString("en-GB") ===
                  period[0].toLocaleDateString("en-GB") &&
                dates[1].toLocaleDateString("en-GB") ===
                  period[1].toLocaleDateString("en-GB")
              )
                return;
              if (dates[0] > dates[1]) {
                dates = [dates[1], dates[0]];
              }
              if (dates[0] < minDate) {
                alert(
                  `Start date must be after ${minDate.toLocaleDateString(
                    "en-GB"
                  )}`
                );
              } else if (dates[1] > max) {
                alert(
                  `End date must be before ${maxDate.toLocaleDateString(
                    "en-GB"
                  )}`
                );
              } else if (daysBetween(dates[0], dates[1]) > maxPeriod) {
                alert(`Selected period must be less than ${maxPeriod} days`);
              } else {
                this.setDateRange(dates);
              }
            }
          }
        }}
        excludeDateIntervals={excludeDateIntervals}
        minDate={minDate}
        maxDate={maxPeriodDate ? maxPeriodDate : maxDate}
        dateFormat="dd/MM/yyyy"
        locale={locale}
      />
    );
  }
}

export default Period;
