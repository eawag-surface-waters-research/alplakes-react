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

export const dayName = (YYYYMMDD, language, Translations) => {
  if (formatDate(new Date()) === YYYYMMDD) {
    return Translations.today[language];
  }
  const year = parseInt(YYYYMMDD.substr(0, 4), 10);
  const month = parseInt(YYYYMMDD.substr(4, 2), 10) - 1; // Subtracting 1 to make it zero-based
  const day = parseInt(YYYYMMDD.substr(6, 2), 10);
  const daysOfWeekNames = Translations.axis[language].shortDays;
  const date = new Date(year, month, day);
  const dayOfWeekNumber = date.getDay();
  return daysOfWeekNames[dayOfWeekNumber];
};

export const summariseData = (forecast, frozen) => {
  var now = new Date();
  now.setHours(0, 0, 0, 0);
  now = now.getTime();
  var dt = [];
  var value = [];
  var summary = {};
  for (let i = 0; i < 5; i++) {
    summary[formatDate(now + i * 86400000)] = frozen ? [4] : [];
  }
  if (frozen || forecast === undefined) {
    dt = [now, now + 4 * 86400000];
    value = [4, 4];
  } else {
    for (let i = 0; i < forecast.date.length; i++) {
      if (forecast.date[i] > now) {
        let day = formatDate(forecast.date[i]);
        let v = forecast.value[i];
        if (v !== null) {
          dt.push(new Date(forecast.date[i]));
          value.push(v);
          summary[day].push(v);
        }
      }
    }
  }
  return { dt, value, summary };
};
export const meanTemperature = (numbers) => {
  if (numbers.length === 0) return "";
  const sum = numbers.reduce((acc, num) => acc + num, 0);
  const mean = Math.round((sum * 10) / numbers.length) / 10;
  return mean + "°";
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
