export default function authHeader() {
  const token = localStorage.getItem("access_token");
  if (!token) {
    return {};
  }

  const access_token = JSON.parse(token);
  if (access_token) {
    return { Authorization: `Bearer ${access_token}` };
  }

  return {};
}
