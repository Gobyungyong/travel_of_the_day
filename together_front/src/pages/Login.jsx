import React, { useEffect, useState, useContext } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";

import { AuthContext } from "../contexts/AuthContext";

function Login() {
  const [loginIsFault, setLoginIsFault] = useState(false);
  const navigate = useNavigate();

  const { login } = useContext(AuthContext);

  const {
    register: loginRegister,
    handleSubmit: handleLoginSubmit,
    formState: { isSubmitted: isLoginSubmitted, errors: loginErrors },
  } = useForm();

  const onLogInSubmit = async (data) => {
    try {
      await login(data.id, data.password);
      navigate("/", { replace: true });
    } catch (error) {
      console.error("로그인 실패:", error);
      setLoginIsFault(true);
    }
  };

  return (
    <div>
      <form onSubmit={handleLoginSubmit(onLogInSubmit)}>
        <input
          type="text"
          placeholder="아이디"
          aria-invalid={
            isLoginSubmitted ? (loginErrors.id ? "true" : "false") : undefined
          }
          {...loginRegister("id", {
            required: "아이디는 필수 입력입니다.",
            minLength: {
              value: 3,
              message: "3자리 이상 입력해주세요.",
            },
          })}
        />
        {loginErrors.id && <small role="alert">{loginErrors.id.message}</small>}
        <input
          type="password"
          placeholder="비밀번호"
          aria-invalid={
            isLoginSubmitted
              ? loginErrors.password
                ? "true"
                : "false"
              : undefined
          }
          {...loginRegister("password", {
            required: "비밀번호는 필수 입력입니다.",
            minLength: {
              value: 5,
              message: "5자리 이상 비밀번호를 사용하세요.",
            },
          })}
        />
        {loginErrors.password && (
          <small role="alert">{loginErrors.password.message}</small>
        )}
        {loginIsFault && <p>'아이디 혹은 비밀번호를 잘못 입력하셨습니다.'</p>}
        <button>Login</button>
      </form>
    </div>
  );
}

export default Login;
