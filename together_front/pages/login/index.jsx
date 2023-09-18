import React, { useEffect, useState, useContext } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/router";
import Link from "next/link";

import { AuthContext } from "../../contexts/AuthContext";
import routes from "../../routes";

function Login() {
  const [loginIsFault, setLoginIsFault] = useState(false);
  const router = useRouter();

  const { login } = useContext(AuthContext);

  const {
    register: loginRegister,
    handleSubmit: handleLoginSubmit,
    formState: { isSubmitted: isLoginSubmitted, errors: loginErrors },
  } = useForm();

  const onLogInSubmit = async (data) => {
    try {
      await login(data.id, data.password);
      router.push(routes.homepage, { replace: true });
    } catch (error) {
      console.error("로그인 실패:", error);
      setLoginIsFault(true);
    }
  };

  return (
    <>
      <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
            Login
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <form
            className="space-y-6"
            onSubmit={handleLoginSubmit(onLogInSubmit)}
          >
            <div>
              <label
                htmlFor="username"
                className="block text-sm leading-6 text-gray-900 font-bold"
              >
                ID
              </label>
              <div className="mt-2">
                <input
                  className="focus:outline-none pl-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  type="text"
                  placeholder="아이디"
                  aria-invalid={
                    isLoginSubmitted
                      ? loginErrors.id
                        ? "true"
                        : "false"
                      : undefined
                  }
                  {...loginRegister("id", {
                    required: "아이디는 필수 입력입니다.",
                    minLength: {
                      value: 3,
                      message: "3자리 이상 입력해주세요.",
                    },
                  })}
                />
                {loginErrors.id && (
                  <small className="text-red-500 font-semibold" role="alert">
                    {loginErrors.id.message}
                  </small>
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm leading-6 text-gray-900 font-bold"
                >
                  Password
                </label>
              </div>
              <div className="mt-2">
                <input
                  className="focus:outline-none pl-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
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
                  <small className="text-red-500 font-semibold" role="alert">
                    {loginErrors.password.message}
                  </small>
                )}
                {loginIsFault && (
                  <p className="font-semibold text-red-500">
                    아이디 혹은 비밀번호가 잘못됐습니다.
                  </p>
                )}
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                로그인
              </button>
            </div>
          </form>

          <p className="mt-10 text-center text-sm text-gray-500">
            아직 아이디가 없으신가요?{" "}
            <Link
              href={routes.signup}
              className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500"
            >
              회원가입
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}

export default Login;