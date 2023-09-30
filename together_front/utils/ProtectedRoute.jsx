import { useContext, useEffect } from "react";
import { useRouter } from "next/router";

import { AuthContext } from "../contexts/AuthContext";
import routes from "../routes";

export function ProtectedRoute({ children }) {
  const { user } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    const access_token = localStorage.getItem("access_token");
    if (!user && !access_token) {
      alert("로그인 후 이용 가능한 서비스입니다.");
      router.replace(routes.login);
    }
  }, [user]);

  return children;
}
