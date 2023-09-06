import { useState, useContext } from "react";
import { useForm } from "react-hook-form";

import { AuthContext } from "../contexts/AuthContext";

function Signup() {
  const [isIdAvailable, setIsIdAvailable] = useState(0);

  const { authAxios } = useContext(AuthContext);

  const {
    register,
    handleSubmit,
    formState: { isSubmitted, errors },
    getValues,
    clearErrors,
  } = useForm();

  const onSignUpSubmit = async (data) => {
    try {
      const response = await authAxios.post("api/v1/users/signup/", {
        username: data.id,
        name: data.name,
        password: data.password,
        email: data.email,
      });
      localStorage.setItem("access_token", response.data.access_token);
      localStorage.setItem("refresh_token", response.data.refresh_token);
    } catch (error) {
      console.error("회원가입 실패:", error);
    }
  };

  //   const checkIdAvailability = async () => {
  //     const id = getValues("id");
  //     try {
  //       const response = await checkIdAvailabilityApi({ username: id });

  //       if (response.status === 200) {
  //         setIsIdAvailable(1);
  //         clearErrors("id");
  //       } else {
  //         setIsIdAvailable(-1);
  //       }
  //     } catch (error) {
  //       console.error("중복확인 실패:", error);
  //     }
  //   };

  return (
    <form onSubmit={handleSubmit(onSignUpSubmit)}>
      <h1>회원 가입</h1>
      <input
        id="id"
        type="text"
        placeholder="아이디"
        aria-invalid={isSubmitted ? (errors.id ? "true" : "false") : undefined}
        {...register("id", {
          required: "아이디는 필수 입력입니다.",
          minLength: {
            value: 3,
            message: "3자리 이상 입력해주세요.",
          },
        })}
        //   onBlur={checkIdAvailability}
      />
      {isIdAvailable === 1 && <span>사용 가능한 아이디입니다.</span>}
      {!(isIdAvailable === -1) || (
        <span role="alert">이미 사용 중인 아이디입니다.</span>
      )}
      {errors.id && <span>{errors.id.message}</span>}

      <input
        id="password"
        type="password"
        placeholder="비밀번호"
        aria-invalid={
          isSubmitted ? (errors.password ? "true" : "false") : undefined
        }
        {...register("password", {
          required: "비밀번호는 필수 입력입니다.",
          minLength: {
            value: 5,
            message: "5자리 이상 비밀번호를 사용하세요.",
          },
        })}
      />

      {errors.password && <div role="alert">{errors.password.message}</div>}

      <input
        id="passwordConfirm"
        type="password"
        placeholder="비밀번호 확인"
        aria-invalid={
          isSubmitted ? (errors.passwordConfirm ? "true" : "false") : undefined
        }
        {...register("passwordConfirm", {
          required: "비밀번호 확인은 필수 입력입니다.",
          minLength: {
            value: 5,
            message: "5자리 이상 비밀번호를 사용하세요.",
          },
          validate: {
            check: (val) => {
              if (getValues("password") !== val) {
                return "비밀번호가 일치하지 않습니다.";
              }
            },
          },
        })}
      />

      {errors.passwordConfirm && (
        <div role="alert">{errors.passwordConfirm.message}</div>
      )}

      <input
        id="name"
        type="text"
        placeholder="이름"
        aria-invalid={
          isSubmitted ? (errors.name ? "true" : "false") : undefined
        }
        {...register("name", {
          required: "이름은 필수 입력입니다.",
          minLength: {
            value: 2,
            message: "2자리 이상 입력해주세요.",
          },
        })}
      />

      {errors.name && <div role="alert">{errors.name.message}</div>}

      <input
        id="email"
        type="text"
        placeholder="test@email.com"
        {...register("email", {
          required: "이메일은 필수 입력입니다.",
          pattern: {
            value:
              /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$/i,
            message: "이메일 형식에 맞지 않습니다.",
          },
        })}
      />

      {errors.email && <div role="alert">{errors.email.message}</div>}

      <button>Sign Up</button>
    </form>
  );
}

export default Signup;
