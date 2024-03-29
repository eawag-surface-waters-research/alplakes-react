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

export const parseAPITime = (date) => {
  return new Date(
    `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}T${date.slice(
      8,
      10
    )}:${date.slice(10, 12)}:00.000+00:00`
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

export const formatAPIDate = (datetime) => {
  var a = new Date(datetime);
  var year = a.getFullYear();
  var month = a.getMonth() + 1;
  var date = a.getDate();
  return `${String(year)}${month < 10 ? "0" + month : month}${
    date < 10 ? "0" + date : date
  }`;
};

export const formatAPIDatetime = (datetime) => {
  var a = new Date(datetime);
  var year = a.getFullYear();
  var month = a.getMonth() + 1;
  var date = a.getDate();
  var hour = a.getHours();
  var minute = a.getMinutes();
  return `${String(year)}${month < 10 ? "0" + month : month}${
    date < 10 ? "0" + date : date
  }${hour < 10 ? "0" + hour : hour}${minute < 10 ? "0" + minute : minute}`;
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

const loading = (message) => {
  if (document.getElementById("loading")) {
    document.getElementById("loading-text").innerHTML = message;
    document.getElementById("loading").style.visibility = "visible";
  }
};

const loaded = () => {
  if (document.getElementById("loading")) {
    document.getElementById("loading").style.visibility = "hidden";
  }
};

export const setCustomPeriod = async (
  customPeriod,
  period,
  minDate,
  maxDate,
  depth,
  depths,
  missingDates
) => {
  if (customPeriod.type === "alplakes_hydrodynamic") {
    var data;
    if ("bucket" in customPeriod) {
      try {
        ({ data } = await axios.get(
          CONFIG.alplakes_bucket + customPeriod.bucket
        ));
      } catch (e) {
        ({ data } = await axios.get(CONFIG.alplakes_api + customPeriod.end));
      }
    } else {
      ({ data } = await axios.get(CONFIG.alplakes_api + customPeriod.end));
    }
    minDate = stringToDate(data.start_date).getTime();
    maxDate = stringToDate(data.end_date).getTime();
    var startDate = maxDate + customPeriod.start * 8.64e7;
    if ("depths" in data) {
      depths = data.depths;
      let index = closestIndex(depth, depths);
      depth = depths[index];
    }
    if ("missing_weeks" in data) {
      missingDates = data.missing_weeks;
    }
    return {
      period: [startDate, maxDate],
      minDate,
      maxDate,
      depths,
      depth,
      missingDates,
    };
  } else {
    console.error("Custom period type not recognised.");
    return { period, minDate, maxDate, depths, depth };
  }
};

export const getFrozen = async (lake) => {
  var frozen = false;
  try {
    var { data } = await axios.get(
      CONFIG.alplakes_bucket + "/simulations/ice.json"
    );
    var today = new Date();
    if (lake in data) {
      var ice = data[lake];
      for (var i = 0; i < ice.length; i++) {
        if (ice[i].length === 1) {
          if (today > parseDay(ice[i][0].toString())) frozen = true;
        } else if (ice[i].length === 2) {
          if (
            today > parseDay(ice[i][0].toString()) &&
            today < parseDay(ice[i][1].toString())
          )
            frozen = true;
        }
      }
    }
    return frozen;
  } catch (e) {
    console.log(e);
    return frozen;
  }
};

export const getProfileAlplakesHydrodynamic = async (
  api,
  model,
  lake,
  period,
  latlng
) => {
  const url = `${api}/simulations/depthtime/${model}/${lake}/${formatAPIDate(
    period[0]
  )}0000/${formatAPIDate(period[1])}2359/${latlng.lat}/${latlng.lng}`;
  try {
    const { data } = await axios.get(url);
    if (data.distance > 500) {
      alert("Point outside of lake.");
      return false;
    }
    return data;
  } catch (e) {
    console.error(e);
    return false;
  }
};

export const getTransectAlplakesHydrodynamic = async (
  api,
  model,
  lake,
  period,
  latlng
) => {
  loading("Requesting transect from the server");
  latlng.pop();
  const url = `${api}/simulations/transect/${model}/${lake}/${formatAPIDatetime(
    period[0]
  )}/${formatAPIDatetime(period[1])}/${latlng
    .map((l) => l.lat)
    .join(",")}/${latlng.map((l) => l.lng).join(",")}`;
  try {
    const { data } = await axios.get(url);
    data.time = data.time.map((d) => parseDate(d));
    loaded();
    return data;
  } catch (e) {
    console.error(e);
    loaded();
    return false;
  }
};

const parseDate = (str) => {
  const d = new Date(
    `${str.slice(0, 4)}-${str.slice(4, 6)}-${str.slice(6, 8)}T${str.slice(
      8,
      10
    )}:${str.slice(10, 12)}:00.000+00:00`
  );
  return d.getTime();
};

export const parseDay = (yyyymmdd) => {
  const year = parseInt(yyyymmdd.substring(0, 4), 10);
  const month = parseInt(yyyymmdd.substring(4, 6), 10) - 1;
  const day = parseInt(yyyymmdd.substring(6, 8), 10);
  const date = new Date(year, month, day);
  return date;
};
