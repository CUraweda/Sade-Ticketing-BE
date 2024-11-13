const parseJson = (data, { keep = [] } = {}) => {
  const json = JSON.parse(data);
  return keep.length
    ? Object.fromEntries(
        Object.entries(json).filter(([key]) => keep.includes(key))
      )
    : json;
};

export { parseJson };
