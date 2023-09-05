import axios from "axios";
import React, { createContext, useState } from "react";
import { useNavigate } from "react-router-dom";

import AuthHeader from "../utils/AuthHeader";
import AuthFunc from "../utils/AuthFunc";

const DefaultProps = {
  login: () => null,
  logout: () => null,
  authAxios: axios,
  user: null,
};

export const AuthContext = createContext(DefaultProps);

export const AuthContextProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => AuthFunc.getCurrentUser());

  async function login(username, password) {
    const data = await AuthFunc.login(username, password);
    setUser(data);
    return data;
  }

  function logout() {
    AuthFunc.logout();
    setUser(null);
    navigate("/login");
  }

  // axios instance for making requests
  const authAxios = axios.create();

  // request interceptor for adding token
  authAxios.interceptors.request.use((config) => {
    // add token to request headers
    config.headers = AuthHeader();
    return config;
  });

  authAxios.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      if (error.response.status === 401) {
        logout();
      }
      return Promise.reject(error);
    }
  );

  return (
    <AuthContext.Provider value={{ user, login, logout, authAxios }}>
      {children}
    </AuthContext.Provider>
  );
};
