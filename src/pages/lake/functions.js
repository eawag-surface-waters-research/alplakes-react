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

export const closestIndex = (num, arr) => {
  let curr = arr[0],
    diff = Math.abs(num - curr);
  let index = 0;
  for (let val = 0; val < arr.length; val++) {
    let newdiff = Math.abs(num - arr[val]);
    if (newdiff < diff) {
      diff = newdiff;
      curr = arr[val];
      index = val;
    }
  }
  return index;
};

export const interpolateData = (value, data) => {
  if (value <= data.x[0]) {
    return data.y[0];
  } else if (value >= data.x[data.x.length - 1]) {
    return data.y[data.y.length - 1];
  } else {
    for (let i = 0; i < data.x.length - 1; i++) {
      if (value === data.x[i]) {
        return data.y[i];
      } else if (data.x[i] < value && value < data.x[i + 1]) {
        return (
          ((value - data.x[i]) / (data.x[i + 1] - data.x[i])) *
            (data.y[i + 1] - data.y[i]) +
          data.y[i]
        );
      }
    }
    return "--";
  }
};

export const relativeDate = (days) => {
  var result = new Date();
  result.setHours(0, 0, 0, 0);
  result.setDate(result.getDate() + days);
  return result;
};

export const setCustomPeriod = async (
  customPeriod,
  period,
  minDate,
  maxDate,
  depth,
  depths
) => {
  if (customPeriod.type === "alplakes_hydrodynamic") {
    var start = relativeDate(customPeriod.start).getTime();
    var { data } = await axios.get(CONFIG.alplakes_api + customPeriod.end);
    minDate = stringToDate(data.start_date).getTime();
    maxDate = stringToDate(data.end_date).getTime();
    if ("depths" in data) {
      depths = data.depths;
      let index = closestIndex(depth, depths);
      depth = depths[index];
    }
    return { period: [start, maxDate], minDate, maxDate, depths, depth };
  } else {
    console.error("Custom period type not recognised.");
    return { period, minDate, maxDate, depths, depth };
  }
};
