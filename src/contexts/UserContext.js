import React, { createContext, useContext, useEffect, useState } from "react";
import mypageApi from "../api/mypage-api";

const UserContext = createContext({ nickname: "" });

export function UserProvider({ children }) {
  const [nickname, setNickname] = useState("");

  useEffect(() => {
    let active = true;

    mypageApi
      .getMyPage()
      .then((profile) => {
        if (active) {
          setNickname(profile?.nickname?.trim() ?? "");
        }
      })
      .catch((error) => {
        console.warn("Failed to load user profile:", error);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <UserContext.Provider value={{ nickname }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
