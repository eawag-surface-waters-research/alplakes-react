import axios from "axios";

export const formatDate = (d) => {
  const date = new Date(d);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
};

export const hour = () => {
  return `?timestamp=${
    Math.round((new Date().getTime() + 1800000) / 3600000) * 3600 - 3600
  }`;
};

export const fetchDataParallel = async (urls) => {
  const requests = Object.entries(urls).map(([key, url]) =>
    axios
      .get(url)
      .then((response) => ({ [key]: response.data }))
      .catch(() => ({ [key]: {} }))
  );
  const responses = await Promise.all(requests);
  const result = Object.assign({}, ...responses);
  return result;
};

export const parseDate = (yyyymmdd) => {
  const year = parseInt(yyyymmdd.substring(0, 4), 10);
  const month = parseInt(yyyymmdd.substring(4, 6), 10) - 1;
  const day = parseInt(yyyymmdd.substring(6, 8), 10);
  const date = new Date(year, month, day);
  return date;
};

export const dayName = (YYYYMMDD, language, Translations, full = false) => {
  if (formatDate(new Date()) === YYYYMMDD) {
    if (full) {
      return Translations.today[language];
    }
    return Translations.today[language];
  }
  const year = parseInt(YYYYMMDD.substr(0, 4), 10);
  const month = parseInt(YYYYMMDD.substr(4, 2), 10) - 1; // Subtracting 1 to make it zero-based
  const day = parseInt(YYYYMMDD.substr(6, 2), 10);
  var daysOfWeekNames = Translations.axis[language].shortDays;
  if (full) {
    daysOfWeekNames = Translations.axis[language].days;
  }
  const date = new Date(year, month, day);
  const dayOfWeekNumber = date.getDay();
  return daysOfWeekNames[dayOfWeekNumber];
};

const isSimilarSubstring = (item, term) => {
  for (let i = 0; i <= item.length - term.length; i++) {
    let differences = 0;
    for (let j = 0; j < term.length; j++) {
      if (item[i + j] !== term[j]) differences++;
      if (differences > 1) break;
    }
    if (differences <= 1) return true;
  }
  return false;
};

export const searchList = (search, list) => {
  list.map((l) => {
    l.display = Object.values(l.name).some((item) =>
      isSimilarSubstring(
        item.toLowerCase().replaceAll(" ", ""),
        search.toLowerCase().replaceAll(" ", "")
      )
    );
    return l;
  });
  return list;
};

export const inBounds = (latitude, longitude, bounds) => {
  if (
    latitude >= bounds._southWest.lat &&
    longitude >= bounds._southWest.lng &&
    latitude <= bounds._northEast.lat &&
    longitude <= bounds._northEast.lng
  ) {
    return true;
  }
  return false;
};

export const formatDateYYYYMMDD = (d) => {
  const date = new Date(d);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
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

export const mean = (numbers) => {
  if (numbers.length < 3) return false;
  const sum = numbers.reduce((acc, num) => acc + num, 0);
  const mean = Math.round((sum * 10) / numbers.length) / 10;
  return mean;
};

export const onMouseOver = (event) => {
  try {
    document.getElementById(
      "pin-" + event.target.id.split("-")[1]
    ).style.border = "2px solid orange";
  } catch (e) {}
};

export const onMouseOut = (event) => {
  try {
    document.getElementById(
      "pin-" + event.target.id.split("-")[1]
    ).style.border = "2px solid transparent";
  } catch (e) {}
};

export const sortList = (list, property, ascending) => {
  var x = 1;
  var y = -1;
  if (ascending) {
    x = -1;
    y = 1;
  }
  return list.sort((a, b) => (a[property] > b[property] ? y : x));
};
