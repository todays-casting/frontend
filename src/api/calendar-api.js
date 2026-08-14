import client from "./client";

const getMonthlyMarkers = async (yearMonth) => {
  const response = await client.get(`/records/history/${yearMonth}`);
  return response.data.result ?? [];
};

const calendarApi = {
  getMonthlyMarkers,
};

export default calendarApi;
