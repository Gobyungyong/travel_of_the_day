import axios from "axios";

class AuthFunc {
  setUserInLocalStorage(access, refresh) {
    localStorage.setItem("access_token", access);
    localStorage.setItem("refresh_token", refresh);
  }

  async login(username, password) {
    const response = await axios.post(
      `http://127.0.0.1:8000/api/v1/users/rest_auth/login/`,
      // "/api/v1/users/rest_auth/login/",
      // `http://127.0.0.1:8000/api/v1/users/login/`,
      // "/api/v1/users/login/",
      {
        username,
        password,
      }
    );

    if (response.status !== 200) {
      return;
    }

    this.setUserInLocalStorage(response.data.access, response.data.refresh);

    return response.data.access;
  }

  async logout() {
    try {
      const refresh = localStorage.getItem("refresh_token");
      const response = await axios.post(
        "http://127.0.0.1:8000/api/v1/users/rest_auth/logout/",
        // "/api/v1/users/rest_auth/logout/",
        // "http://127.0.0.1:8000/api/v1/users/logout/",
        // "/api/v1/users/logout/",
        {
          refresh,
        }
      );
      localStorage.clear();
      return response;
    } catch {
      localStorage.clear();
    }
  }

  getCurrentUser() {
    return localStorage.getItem("access_token");
  }
}

export default new AuthFunc();
