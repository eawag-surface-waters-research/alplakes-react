import Translations from "../../../translations.json";

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

export const parseAlplakesDate = (str) => {
  const d = new Date(
    `${str.slice(0, 4)}-${str.slice(4, 6)}-${str.slice(6, 8)}T${str.slice(
      8,
      10
    )}:${str.slice(10, 12)}:00.000+00:00`
  );
  return d;
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

export const formatTime = (d) => {
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
};

export const mean = (numbers) => {
  const sum = numbers.reduce((acc, num) => acc + num, 0);
  const mean = Math.round((sum * 10) / numbers.length) / 10;
  return mean;
};

export const summariseData = (timestamps, values) => {
  const ONE_DAY_MS = 86400000;
  const start = new Date().setHours(0, 0, 0, 0);

  const out = Array.from({ length: 10 }, (_, i) =>
    formatDateYYYYMMDD(start + i * ONE_DAY_MS)
  ).reduce((acc, key) => ({ ...acc, [key]: [] }), {});

  timestamps.forEach((ts, i) => {
    const key = formatDateYYYYMMDD(ts);
    if (out[key]) out[key].push(values[i]);
  });

  const summary = Object.fromEntries(
    Object.entries(out)
      .filter(([_, vals]) => vals.length > 0)
      .map(([key, vals]) => [key, mean(vals)])
  );

  const end_string = Object.keys(summary).pop();
  const year = parseInt(end_string.slice(0, 4), 10);
  const month = parseInt(end_string.slice(4, 6), 10) - 1;
  const day = parseInt(end_string.slice(6, 8), 10);
  const end = new Date(year, month, day);
  end.setDate(end.getDate() + 1);

  return { summary, start: new Date(start), end };
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
    l.url = `/map/${lake}?layers=water_temperature&label=${l.name
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
