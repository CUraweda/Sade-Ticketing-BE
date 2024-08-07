const constant = {
  MAX_LEN_PW: 10,
  // JWT_ACCESS_EXP: 15 * 60, // 15 menit
  JWT_ACCESS_EXP: 7 * 24 * 60 * 60, // 7 hari (temp)
  JWT_REFRESH_EXP: 30 * 24 * 60 * 60, // 30 hari
};

export default constant;
