import { DateTime } from "luxon";

export const DateCEST = (input) => {
  let dt;
  if (input === undefined) {
    dt = DateTime.now().setZone("Europe/Paris");
  } else if (input instanceof Date) {
    dt = DateTime.fromJSDate(input).setZone("Europe/Paris");
  } else if (typeof input === 'string') {
    dt = DateTime.fromISO(input, { zone: "Europe/Paris" });
  } else if (typeof input === 'number') {
    dt = DateTime.fromMillis(input, { zone: "Europe/Paris" });
  }
  return dt.toJSDate();
};

export const hour = () => {
  return `?timestamp=${
    Math.round((new Date().getTime() + 1800000) / 3600000) * 3600 - 3600
  }`;
};

export const summariseData = (timestamps, values) => {
  const ONE_DAY_MS = 86400000;
  const start = DateCEST().setHours(0, 0, 0, 0);

  const out = Array.from({ length: 5 }, (_, i) =>
    formatDateYYYYMMDD(start + i * ONE_DAY_MS)
  ).reduce((acc, key) => ({ ...acc, [key]: [] }), {});

  timestamps.forEach((ts, i) => {
    const key = formatDateYYYYMMDD(DateCEST(ts));
    if (out[key]) out[key].push(values[i]);
  });

  const summary = Object.fromEntries(
    Object.entries(out)
      .filter(([_, vals]) => vals.length > 2)
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

export const formatDateYYYYMMDD = (d) => {
  const date = new Date(d);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
};

export const mean = (numbers) => {
  if (numbers.length < 3) return false;
  const sum = numbers.reduce((acc, num) => acc + num, 0);
  const mean = Math.round((sum * 10) / numbers.length) / 10;
  return mean;
};
