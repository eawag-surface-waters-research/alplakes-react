export const formatDate = (d) => {
  const date = new Date(d);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
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

export const summariseData = (forecast, parameter, parameters) => {
  var dtMin = new Date();
  dtMin.setHours(0, 0, 0, 0);
  dtMin = dtMin.getTime();
  var dtMax = dtMin + 5 * 86400000 - 10800000;

  var dt = [];
  var value = parameters.reduce((obj, item) => ({ ...obj, [item]: [] }), {});
  var summary = {};
  for (let i = 0; i < 5; i++) {
    summary[formatDate(dtMin + i * 86400000)] = parameters.reduce(
      (obj, item) => ({ ...obj, [item]: [] }),
      {}
    );
  }
  var available = true;
  if (forecast === undefined || !("time" in forecast)) {
    dt = [dtMin, dtMax];
    value = parameters.reduce((obj, item) => ({ ...obj, [item]: [0, 0] }), {});
    available = false;
  } else {
    for (let i = 0; i < forecast.time.length; i++) {
      let day = formatDate(forecast.time[i]);
      if (forecast[parameter][i] !== null) {
        dt.push(new Date(forecast.time[i]));
        for (let p of parameters) {
          if (p in forecast && forecast[p][i] !== null) {
            value[p].push(forecast[p][i]);
            if (day in summary) {
              summary[day][p].push(forecast[p][i]);
            }
          }
        }
      }
    }
  }

  for (let key in summary) {
    for (let p in summary[key]) {
      summary[key][p] = mean(summary[key][p]);
    }
  }
  if (available) {
    dtMax = parseDate(
      Math.max(
        ...Object.entries(summary)
          .filter(([key, value]) => value.temperature !== false)
          .map(([key, _]) => key)
      ).toString()
    );
    dtMax.setDate(dtMax.getDate() + 1);
  }

  return {
    dt,
    value,
    summary,
    dtMin: new Date(dtMin),
    dtMax: new Date(dtMax),
    available,
  };
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
