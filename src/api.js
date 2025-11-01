import axios from "axios";

const API_BASE = "https://mgnrega-backend-8tzd.onrender.com";

export const fetchDistricts = async () => {
  const res = await axios.get(`${API_BASE}/districts`);
  return res.data;
};

export const fetchDistrictData = async (districtName) => {
  const res = await axios.get(`${API_BASE}/district/${districtName}`);
  return res.data;
};
