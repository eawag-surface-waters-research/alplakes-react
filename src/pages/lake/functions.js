import axios from "axios";
import CONFIG from "../../config.json";

const stringToDate = (date) => {
  return new Date(
    `${date.slice(0, 4)}-${date.slice(5, 7)}-${date.slice(8, 10)}T${date.slice(
      11,
      13
    )}:00:00.000+00:00`
  );
};

export const formatDate = (datetime) => {
  var a = new Date(datetime);
  var year = a.getFullYear();
  var month = a.getMonth() + 1;
  var date = a.getDate();
  return `${date < 10 ? "0" + date : date}.${
    month < 10 ? "0" + month : month
  }.${String(year).slice(-2)}`;
};

export const formatDateLong = (datetime, months) => {
  var a = new Date(datetime);
  var year = a.getFullYear();
  console.log(a.getMonth())
  var month = months[a.getMonth()];
  var date = a.getDate();
  return `${date} ${month} ${String(year)}`;
};

export const formatTime = (datetime) => {
  var a = new Date(datetime);
  var hour = a.getHours();
  var minute = a.getMinutes();
  return `${hour < 10 ? "0" + hour : hour}:${
    minute < 10 ? "0" + minute : minute
  }`;
};

export const relativeDate = (days) => {
  var result = new Date();
  result.setHours(0, 0, 0, 0);
  result.setDate(result.getDate() + days);
  return result;
};

export const setCustomPeriod = async (customPeriod, period) => {
  if (customPeriod.type === "alplakes_hydrodynamic") {
    var start = relativeDate(customPeriod.start);
    var { data } = await axios.get(CONFIG.alplakes_api + customPeriod.end);
    var end = stringToDate(data.end_date);
    return [start.getTime(), end.getTime()];
  } else {
    console.error("Custom period type not recognised.");
    return period;
  }
};
