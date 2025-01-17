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
  return Math.round((new Date().getTime() + 1800000) / 3600000) * 3600 - 3600;
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

export const formatDateYYYYMMDD = (d) => {
  const date = new Date(d);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
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
