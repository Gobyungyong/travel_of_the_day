import { useContext } from "react";
import { Navigate } from "react-router-dom";

import { AuthContext } from "../contexts/AuthContext";
import routes from "../routes";

export function ProtectedRoute({ children }) {
  const { user } = useContext(AuthContext);

  if (!user) {
    alert("로그인 후 이용 가능한 서비스입니다.");
    return <Navigate to={routes.login} replace />;
  }

  return children;
}
