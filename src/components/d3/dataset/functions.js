export const deepCopy = (obj) => {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj);
  }

  if (Array.isArray(obj)) {
    const arrCopy = [];
    for (let i = 0; i < obj.length; i++) {
      arrCopy[i] = deepCopy(obj[i]);
    }
    return arrCopy;
  }

  const objCopy = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      objCopy[key] = deepCopy(obj[key]);
    }
  }
  return objCopy;
};
