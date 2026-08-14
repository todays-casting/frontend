import client from "./client";

const getRecordByDate = async (date) => {
  const response = await client.get("/records", {
    params: { date },
  });

  return response.data.result ?? null;
};

const recordsApi = {
  getRecordByDate,
};

export default recordsApi;
