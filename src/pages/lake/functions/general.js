import Translations from "../../../translations.json";
import { summariseData } from "../../../global";

export const stringToDate = (date) => {
  let time = "00";
  if (date.length > 10) {
    time = date.slice(11, 13);
  }
  return new Date(
    `${date.slice(0, 4)}-${date.slice(5, 7)}-${date.slice(
      8,
      10
    )}T${time}:00:00.000+00:00`
  );
};

export const hour = () => {
  return `?timestamp=${
    Math.round((new Date().getTime() + 1800000) / 3600000) * 3600 - 3600
  }`;
};

export const compareDates = (date1, date2) => {
  return date1 - date2;
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

export const formatAPIDate = (datetime) => {
  var a = new Date(datetime);
  var year = a.getFullYear();
  var month = a.getMonth() + 1;
  var date = a.getDate();
  return `${String(year)}${month < 10 ? "0" + month : month}${
    date < 10 ? "0" + date : date
  }`;
};

export const parseAlplakesDate = (str) => {
  const d = new Date(
    `${str.slice(0, 4)}-${str.slice(4, 6)}-${str.slice(6, 8)}T${str.slice(
      8,
      10
    )}:${str.slice(10, 12)}:00.000+00:00`
  );
  return d;
};

export const formatDateLong = (datetime, months) => {
  var a = new Date(datetime);
  var year = a.getFullYear();
  var month = months[a.getMonth()];
  var date = a.getDate();
  return `${date} ${month} ${String(year)}`;
};

export const formatSencastDay = (datetime) => {
  var a = new Date(datetime);
  var year = a.getFullYear();
  var month = a.getMonth() + 1;
  var date = a.getDate();
  return `${String(year)}${month < 10 ? "0" + month : month}${
    date < 10 ? "0" + date : date
  }`;
};

export const satelliteStringToDate = (date) => {
  return new Date(
    `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}T${date.slice(
      9,
      11
    )}:${date.slice(11, 13)}:00.000+00:00`
  );
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

export const formatDateYYYYMMDD = (d) => {
  const date = new Date(d);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
};

export const formatDateDDMMYYYY = (d) => {
  const date = new Date(d);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${day}.${month}.${year}`;
};

export const formatReadableDate = (d, language) => {
  const inputDate = new Date(d);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const inputDateStripped = new Date(inputDate.setHours(0, 0, 0, 0));
  if (inputDateStripped.getTime() === today.getTime()) {
    return Translations.today[language];
  } else if (inputDateStripped.getTime() > today.getTime()) {
    return Translations.axis[language].shortDays[inputDate.getDay()];
  } else {
    const daysAgo = Math.floor(
      (today - inputDateStripped) / (1000 * 60 * 60 * 24)
    );
    if (daysAgo > 1) {
      return `-${daysAgo} ${Translations.days[language]}`;
    } else {
      return `-1 ${Translations.day[language]}`;
    }
  }
};

export const roundUpToNearestHalfHour = (input) => {
  var date = new Date(input);
  let minutes = date.getMinutes();
  let roundedMinutes = Math.round(minutes / 30) * 30;
  if (roundedMinutes === 60) {
    date.setHours(date.getHours() + 1);
    roundedMinutes = 0;
  }
  date.setMinutes(roundedMinutes, 0, 0);
  return date;
};

export const formatTime = (d) => {
  const date = new Date(d);
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
};

export const mean = (numbers) => {
  const sum = numbers.reduce((acc, num) => acc + num, 0);
  const mean = Math.round((sum * 10) / numbers.length) / 10;
  return mean;
};

export const daysAgo = (time, language) => {
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  const givenDate = new Date(time);
  givenDate.setHours(0, 0, 0, 0);

  const difference = (currentDate - givenDate) / 86400000;

  if (difference % 30 === 0 || difference > 84) {
    let count = Math.ceil(difference / 30);
    return count === 1
      ? Translations["monthAgo"][language]
      : Translations["monthsAgo"][language].replace("#", count);
  } else if (difference % 7 === 0 || difference > 21) {
    let count = Math.ceil(difference / 7);
    return count === 1
      ? Translations["weekAgo"][language]
      : Translations["weeksAgo"][language].replace("#", count);
  } else {
    return difference === 1
      ? Translations["dayAgo"][language]
      : Translations["daysAgo"][language].replace("#", difference);
  }
};

export const timeAgo = (time, language) => {
  const currentDate = new Date();
  const givenDate = new Date(time);
  const difference = Math.round((currentDate - givenDate) / 600000) * 10;

  if (difference % 60 === 0 || difference > 120) {
    let count = Math.ceil(difference / 60);
    return count === 1
      ? Translations["hourAgo"][language]
      : Translations["hoursAgo"][language].replace("#", count);
  } else {
    return difference === 1
      ? Translations["minuteAgo"][language]
      : Translations["minutesAgo"][language].replace("#", difference);
  }
};

export const round = (value, decimals) => {
  return Math.round(value * 10 ** decimals) / 10 ** decimals;
};

export const processLabels = (labels, geometry, data, lake) => {
  var points = [];
  var width = geometry[0].length / 2;
  for (let i = 0; i < geometry.length; i++) {
    for (let j = 0; j < width; j++) {
      if (!isNaN(geometry[i][j])) {
        points.push({
          lat: geometry[i][j],
          lng: geometry[i][j + width],
          i,
          j,
        });
      }
    }
  }
  labels.forEach((l) => {
    let index = getIndexAtPoint(l.latlng[0], l.latlng[1], points);
    let values = [];
    for (let x = 0; x < data.time.length; x++) {
      values.push(data.data[x][index[0]][index[1]]);
    }
    let { summary, start, end } = summariseData(data.time, values);
    l.values = values;
    l.time = data.time;
    l.summary = summary;
    l.start = start;
    l.end = end;
    l.i = index[0];
    l.j = index[1];
    l.url = `/map/${lake}?layers=3D_temperature,3D_currents&label=${l.name
      .toLowerCase()
      .replace(" ", "_")}`;
  });
  return labels;
};

const getIndexAtPoint = (lat, lng, points) => {
  let closestPoint = null;
  let minDistance = Infinity;
  for (const point of points) {
    let distance = (lat - point.lat) ** 2 + (lng - point.lng) ** 2;
    if (distance < minDistance) {
      minDistance = distance;
      closestPoint = point;
    }
  }
  return [closestPoint.i, closestPoint.j];
};

export const getDoyArray = () => {
  const array = [];
  const startDate = new Date(new Date().getFullYear(), 0, 1);
  for (let i = 0; i < 366; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);
    array.push(currentDate);
  }
  if (array.length === 366) {
    return [...array.slice(0, 58), ...array.slice(59)];
  } else {
    return array;
  }
};

export const removeLeap = (array) => {
  if (array.length === 366) {
    return [...array.slice(0, 58), ...array.slice(59)];
  } else {
    return array;
  }
};

export const capitalize = (string) => {
  if (string.length === 0) return string;
  return string.charAt(0).toUpperCase() + string.slice(1);
};

export const closestValue = (target, arr) => {
  const sortedArr = arr
    .slice()
    .sort((a, b) => Math.abs(a - target) - Math.abs(b - target));
  return sortedArr[0];
};

export const parseDay = (yyyymmdd) => {
  const year = parseInt(yyyymmdd.substring(0, 4), 10);
  const month = parseInt(yyyymmdd.substring(4, 6), 10) - 1;
  const day = parseInt(yyyymmdd.substring(6, 8), 10);
  const date = new Date(year, month, day);
  return date;
};

export const componentsFromFilename = (filename) => {
  let parts = filename.replace(".tif", "").replace("_lowres", "").split("_");
  let lake = parts[parts.length - 1];
  let group;
  let satellite;
  if (filename.includes("COLLECTION_")) {
    group = "collection";
    satellite = filename.includes("_L9") ? "L9" : "L8";
  } else if (filename.includes("_S2")) {
    group = "sentinel2";
    satellite = filename.includes("_S2A")
      ? "S2A"
      : filename.includes("_S2B")
      ? "S2B"
      : "S2C";
  } else if (filename.includes("_S3")) {
    group = "sentinel3";
    satellite = filename.includes("_S3A") ? "S3A" : "S3B";
  }
  return { lake, group, satellite };
};

export const weightedAverage = (values, weights) => {
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

export const filterImages = (images, coverage, satellite) => {
  var available = {};
  for (let date of Object.keys(images)) {
    let day = JSON.parse(JSON.stringify(images[date]));
    day.time = new Date(day.time);
    day.images = day.images
      .filter((i) => i.percent > coverage)
      .map((i) => {
        i.time = new Date(i.time);
        return i;
      });
    if (satellite.length > 0) {
      day.images = day.images.filter((i) => satellite.includes(i.model));
    }
    if (day.images.length > 0) {
      available[date] = day;
    }
  }
  return available;
};
