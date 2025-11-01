import axios from "axios";

const API_BASE = "http://localhost:5000/api";

export const fetchDistricts = async () => {
  const res = await axios.get(`${API_BASE}/districts`);
  return res.data;
};

export const fetchDistrictData = async (districtName) => {
  const res = await axios.get(`${API_BASE}/district/${districtName}`);
  return res.data;
};
