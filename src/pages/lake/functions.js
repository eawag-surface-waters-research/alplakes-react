import axios from "axios";
import CONFIG from "../../config.json";

const stringToDate = (date) => {
  var year = parseInt(date.slice(0, 4));
  var month = parseInt(date.slice(5, 7)) - 1;
  var day = parseInt(date.slice(8, 10));
  var hour = parseInt(date.slice(11, 13));
  return new Date(year, month, day, hour);
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
    return [start, end];
  } else {
    console.error("Custom period type not recognised.");
    return period;
  }
};
