import axios from "axios";
import CONFIG from "../../config.json";

export const copy = (data) => {
  return JSON.parse(JSON.stringify(data));
};

export const parseSubtitle = (title, names) => {
  names = Object.values(names);
  names = [...new Set(names)].filter((n) => n !== title);
  return names.join(" • ");
};

const satelliteStringToDate = (date) => {
  return new Date(
    `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}T${date.slice(
      9,
      11
    )}:${date.slice(11, 13)}:00.000+00:00`
  );
};

export const processSatelliteFiles = (
  files,
  available,
  max_pixels,
  layer_id,
  unit,
  satellite
) => {
  for (let file of files) {
    let time = satelliteStringToDate(file.dt);
    let date = formatDate(time);
    let url = CONFIG.sencast_bucket + "/" + file.k;
    let split = file.k.split("_");
    let tile = split[split.length - 1].split(".")[0];
    let satellite = split[0].split("/")[2];
    let percent = Math.ceil((parseFloat(file.vp) / max_pixels) * 100);
    let { min, max, mean: ave } = file;
    let image = {
      url,
      time,
      tile,
      satellite,
      percent,
      ave,
      min,
      max,
      layer_id,
      unit,
    };
    if (date in available) {
      available[date].images.push(image);
      available[date].max_percent = Math.max(
        available[date].max_percent,
        percent
      );
      available[date].max = Math.max(available[date].max, max);
      let total_percent = available[date].images
        .map((i) => i.percent)
        .reduce((acc, currentValue) => acc + currentValue, 0);
      available[date].ave = weightedAverage(
        available[date].images.map((i) => i.ave),
        available[date].images.map((i) => i.percent / total_percent)
      );
    } else {
      available[date] = {
        images: [image],
        max_percent: percent,
        ave,
        min,
        max,
        time,
      };
    }
  }
  return available;
};

export const filterImages = (
  all_images,
  filterPixelCoverage,
  filterSatellite
) => {
  var available = {};
  for (let date of Object.keys(all_images)) {
    let day = JSON.parse(JSON.stringify(all_images[date]));
    day.time = new Date(day.time);
    day.images = day.images
      .filter((i) => i.percent > filterPixelCoverage)
      .map((i) => {
        i.time = new Date(i.time);
        return i;
      });
    if (filterSatellite) {
      day.images = day.images.filter((i) =>
        i.satellite.includes(filterSatellite)
      );
    }
    if (day.images.length > 0) {
      available[date] = day;
    }
  }
  return available;
};

export const compareDates = (date1, date2) => {
  return date1 - date2;
};

const weightedAverage = (values, weights) => {
  if (
    values.length !== weights.length ||
    values.length === 0 ||
    weights.length === 0
  ) {
    throw new Error(
      "Values and weights arrays must have the same length and cannot be empty."
    );
  }
  const sumOfProducts = values.reduce(
    (acc, value, index) => acc + value * weights[index],
    0
  );
  const sumOfWeights = weights.reduce((acc, weight) => acc + weight, 0);
  return sumOfProducts / sumOfWeights;
};

export const parseAPITime = (date) => {
  return new Date(
    `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}T${date.slice(
      8,
      10
    )}:${date.slice(10, 12)}:00.000+00:00`
  );
};

export const getDoyArray = () => {
  const datesArray = [];
  const startDate = new Date(new Date().getFullYear(), 0, 1);
  for (let i = 0; i < 366; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);
    datesArray.push(currentDate);
  }
  return datesArray;
};

export const removeLeap = (array) => {
  if (array.length === 366) {
    return [...array.slice(0, 58), ...array.slice(59)];
  } else {
    return array
  }
  
}

export const formatSencastDay = (datetime) => {
  var a = new Date(datetime);
  var year = a.getFullYear();
  var month = a.getMonth() + 1;
  var date = a.getDate();
  return `${String(year)}${month < 10 ? "0" + month : month}${
    date < 10 ? "0" + date : date
  }`;
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

export const parseSimstratDatetime = (string) => {};

export const formatTime = (datetime) => {
  var a = new Date(datetime);
  var hour = a.getHours();
  var minute = a.getMinutes();
  return `${hour < 10 ? "0" + hour : hour}:${
    minute < 10 ? "0" + minute : minute
  }`;
};

export const formatDateTime = (datetime, months) => {
  var a = new Date(datetime);
  var hour = a.getHours();
  var minute = a.getMinutes();
  var year = a.getFullYear();
  var month = months[a.getMonth()];
  var date = a.getDate();
  return `${hour < 10 ? "0" + hour : hour}:${
    minute < 10 ? "0" + minute : minute
  } ${date} ${month} ${String(year).slice(-2)}`;
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

export const findClosest = (array, key, value) => {
  let closest = null;
  let minDiff = Infinity;

  for (let i = 0; i < array.length; i++) {
    let diff = Math.abs(array[i][key] - value);
    if (diff < minDiff) {
      minDiff = diff;
      closest = array[i];
    }
  }

  return closest;
};

export const closestValue = (target, arr) => {
  const sortedArr = arr
    .slice()
    .sort((a, b) => Math.abs(a - target) - Math.abs(b - target));
  return sortedArr[0];
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
  latlng.pop();
  const url = `${api}/simulations/transect/${model}/${lake}/${formatAPIDatetime(
    period[0]
  )}/${formatAPIDatetime(period[1])}/${latlng
    .map((l) => l.lat)
    .join(",")}/${latlng.map((l) => l.lng).join(",")}`;
  try {
    const { data } = await axios.get(url);
    data.time = data.time.map((d) => parseDate(d));
    return data;
  } catch (e) {
    console.error(e);
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
