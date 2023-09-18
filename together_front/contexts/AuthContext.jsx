import axios from "axios";
import React, { createContext, useEffect, useState } from "react";
import { useRouter } from "next/router";

import AuthFunc from "../utils/AuthFunc";
import routes from "../routes";

const DefaultProps = {
  signup: () => null,
  login: () => null,
  logout: () => null,
  authAxios: axios,
  user: null,
};

export const AuthContext = createContext(DefaultProps);

export const AuthContextProvider = ({ children }) => {
  const router = useRouter();
  // user === access_token
  const [user, setUser] = useState(null);

  useEffect(() => {
    setUser(() => AuthFunc.getCurrentUser());
  }, []);

  function signup(access, refresh) {
    AuthFunc.setUserInLocalStorage(access, refresh);
    setUser(access);
  }

  async function login(username, password) {
    const data = await AuthFunc.login(username, password); // return access_token
    setUser(data);
    return data; // === access_token
  }

  async function logout() {
    await AuthFunc.logout();
    setUser(null);
  }

  const authAxios = axios.create({
    headers: {
      "Content-Type": "application/json",
    },
    baseURL: "http://127.0.0.1:8000", //로컬
    // baseURL: "/",
    withCredentials: true,
  });

  authAxios.interceptors.request.use((config) => {
    const access_token = localStorage.getItem("access_token");
    if (access_token) {
      config.headers["Authorization"] = `Bearer ${access_token}`;
    }
    return config;
  });

  let refresh = false;
  authAxios.interceptors.response.use(
    (resp) => resp,
    async (error) => {
      if (error.response.status === 401 && !refresh) {
        refresh = true;
        const refresh_token = localStorage.getItem("refresh_token");
        const response = await authAxios.post("/api/v1/users/refresh/", {
          refresh: refresh_token,
        });

        if (response.status === 200) {
          error.config.headers["Authorization"] = `Bearer
       ${response.data["access"]}`;
          setUser(response.data.access);
          localStorage.setItem("access_token", response.data.access);
          localStorage.setItem("refresh_token", response.data.refresh);
          return authAxios(error.config);
        }

        if (
          response.response?.status === 400 ||
          response.response?.status === 401
        ) {
          localStorage.clear();
          setUser(null);
          // alert("로그인 후 이용 가능한 서비스입니다.");
          // router.push(routes.login);
        }
      }

      refresh = false;

      return error;
    }
  );

  return (
    <AuthContext.Provider value={{ user, login, logout, authAxios, signup }}>
      {children}
    </AuthContext.Provider>
  );
};
