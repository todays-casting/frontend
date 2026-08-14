import client from "./client";

const getCastingByRecordId = async (recordId) => {
  const response = await client.get(`/castings/${recordId}`);
  return response.data.result;
};

const castingsApi = {
  getCastingByRecordId,
};

export default castingsApi;
