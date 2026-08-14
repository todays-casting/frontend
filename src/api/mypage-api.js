import client from "./client";

const getMyPage = async () => {
  const response = await client.get("/users/me/mypage");

  return response.data.result;
};

const mypageApi = {
  getMyPage,
};

export default mypageApi;
