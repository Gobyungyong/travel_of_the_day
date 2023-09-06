import axios from "axios";

class AuthFunc {
  setUserInLocalStorage(access, refresh) {
    localStorage.setItem("access_token", access);
    localStorage.setItem("refresh_token", refresh);
  }

  async login(username, password) {
    const response = await axios.post(
      "http://localhost:8000/api/v1/users/login/",
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
    const refresh = localStorage.getItem("refresh_token");
    const access_token = localStorage.getItem("access_token");
    const response = await axios.post(
      "http://localhost:8000/api/v1/users/logout/",
      {
        refresh,
      },
      { headers: { Authorization: `Bearer ${access_token}` } }
    );
    localStorage.clear();
    return response;
  }

  getCurrentUser() {
    return localStorage.getItem("access_token");
  }
}

export default new AuthFunc();
