import client from "./client";

const getCastingByRecordId = async (recordId) => {
  const response = await client.get(`/castings/${recordId}`);
  return response.data.result;
};

const toggleFavorite = async (recordId) => {
  const response = await client.patch(`/castings/${recordId}/favorite`);
  return response.data.result;
};

const castingsApi = {
  getCastingByRecordId,
  toggleFavorite,
};

export default castingsApi;
