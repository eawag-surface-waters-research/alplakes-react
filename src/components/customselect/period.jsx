import React, { Component } from "react";
import DatePicker from "react-datepicker";
import enGB from "date-fns/locale/en-GB";
import Translate from "../../translations.json";
import "react-datepicker/dist/react-datepicker.css";

const parseDay = (yyyymmdd) => {
  const year = parseInt(yyyymmdd.substring(0, 4), 10);
  const month = parseInt(yyyymmdd.substring(4, 6), 10) - 1;
  const day = parseInt(yyyymmdd.substring(6, 8), 10);
  const date = new Date(year, month, day);
  return date;
};

const CustomInput = React.forwardRef(({ value, onClick }, ref) => (
  <div ref={ref} onClick={onClick} className="dateperiod">
    {value}
  </div>
));

class Period extends Component {
  state = {
    period: this.props.period,
    maxPeriod: this.props.maxPeriod ? this.props.maxPeriod : 21,
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
        new Date(Math.floor(period[1].getTime() + 86400000)),
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
    var { period, maxPeriodDate } = this.state;
    const locale = {
      ...enGB,
      localize: {
        ...enGB.localize,
        day: (n) => Translate.axis[language].shortDays[n],
        month: (n) => Translate.axis[language].months[n],
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
        excludeDateIntervals={excludeDateIntervals}
        minDate={minDate}
        maxDate={maxPeriodDate ? maxPeriodDate : maxDate}
        dateFormat="dd/MM/yyyy"
        customInput={<CustomInput />}
        locale={locale}
      />
    );
  }
}

export default Period;
