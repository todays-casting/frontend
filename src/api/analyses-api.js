import client from "./client";

const createAnalysis = async (dailyRecordId) => {
  const response = await client.post("/analyses", { dailyRecordId });

  return response.data.result ?? response.data;
};

const analysesApi = {
  createAnalysis,
};

export default analysesApi;
