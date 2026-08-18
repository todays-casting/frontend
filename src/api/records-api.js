import client from "./client";

const createRecord = async (record) => {
  const response = await client.post("/records", record);

  return response.data.result ?? response.data;
};

const getRecordByDate = async (date) => {
  const response = await client.get("/records", {
    params: { date },
  });

  return response.data.result ?? null;
};

const getRecordById = async (recordId) => {
  const response = await client.get(`/records/${recordId}`);

  return response.data.result;
};

const getTodayStatus = async () => {
  const response = await client.get("/records/today-status");

  return response.data.result ?? response.data;
};

const updateRecord = async (recordId, record) => {
  const response = await client.put(`/records/${recordId}`, record);

  return response.data.result ?? response.data;
};

const getRecordTemplate = async () => {
  const response = await client.get("/records/template");

  return response.data.result;
};

const recordsApi = {
  createRecord,
  getRecordByDate,
  getRecordById,
  getTodayStatus,
  updateRecord,
  getRecordTemplate,
};

export default recordsApi;
