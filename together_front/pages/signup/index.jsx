import { useState, useContext, useEffect } from "react";
import { useForm } from "react-hook-form";
import AWS from "aws-sdk";
import { useRouter } from "next/router";
import Link from "next/link";
import Image from "next/image";

import { AuthContext } from "../../contexts/AuthContext";
import routes from "../../routes";

function Signup() {
  const [isIdAvailable, setIsIdAvailable] = useState(0);
  const [isNicknameAvailable, setIsNicknameAvailable] = useState(0);
  const [imageSrc, setImageSrc] = useState(
    "https://kr.object.ncloudstorage.com/travel-together/profile/basic_profile/basic.png"
  );
  const [imageFile, setImageFile] = useState(null);

  const router = useRouter();

  const { authAxios, signup, user } = useContext(AuthContext);

  useEffect(() => {
    if (user) {
      router.replace(routes.homepage);
    }
  }, [user]);

  const {
    register,
    handleSubmit,
    formState: { isSubmitted, errors },
    getValues,
    setError,
    clearErrors,
  } = useForm();

  async function onSignUpSubmit(data) {
    if (
      imageSrc ===
      "https://kr.object.ncloudstorage.com/travel-together/profile/basic_profile/basic.png"
    ) {
      try {
        const response = await authAxios.post(
          "/api/v1/users/rest_auth_registration/",
          {
            username: data.username,
            email: data.email,
            name: data.name,
            password1: data.password1,
            password2: data.password2,
            nickname: data.nickname,
            avatar:
              "https://kr.object.ncloudstorage.com/travel-together/profile/basic_profile/basic.png",
          }
        );
        if (response.status === 201) {
          // signup(response.data.access, response.data.refresh);
          alert("입력하신 이메일로 인증 메일이 발송되었습니다.");
          router.replace(routes.login);
          return;
        } else {
          for (const key in response.response?.data) {
            for (const fieldName in data) {
              if (key === fieldName) {
                console.log(
                  `${fieldName}type`,
                  typeof response.response?.data[key]
                );
                setError(fieldName, {
                  type: "server",
                  message:
                    typeof response.response?.data[key] === "object"
                      ? response.response?.data[key][0]
                      : response.response?.data[key],
                });
              }
            }
          }
          return;
        }
      } catch (error) {
        console.error("회원가입 실패:", error);
        return;
      }
    }
    const endpoint = new AWS.Endpoint("https://kr.object.ncloudstorage.com");
    const region = process.env.REACT_APP_REGION;
    const access_key = process.env.REACT_APP_ACCESS_KEY;
    const secret_key = process.env.REACT_APP_SECRET_ACCESS_KEY;
    const bucket_name = process.env.REACT_APP_BUCKET_NAME;

    const S3 = new AWS.S3({
      endpoint: endpoint,
      region: region,
      credentials: {
        accessKeyId: access_key,
        secretAccessKey: secret_key,
      },
    });

    await S3.putObject({
      Bucket: bucket_name,
      Key: `profile/${data.username}/${data.username}`,
      ACL: "public-read",
      Body: imageFile,
    })
      .promise()
      .then(async () => {
        try {
          const response = await authAxios.post(
            "/api/v1/users/rest_auth_registration/",
            {
              username: data.username,
              email: data.email,
              name: data.name,
              password1: data.password1,
              password2: data.password2,
              nickname: data.nickname,
              avatar: `https://kr.object.ncloudstorage.com/travel-together/profile/${data.username}/${data.username}`,
            }
          );
          if (response.status === 201) {
            alert("입력하신 이메일로 인증 메일이 발송되었습니다.");
            router.replace(routes.login);
            return;
          } else {
            console.log("else문", response.response?.data);
            console.log("데이터", data);
            for (const key in response.response?.data) {
              for (const fieldName in data) {
                if (key === fieldName) {
                  console.log(
                    `${fieldName}type`,
                    typeof response.response?.data[key]
                  );
                  setError(fieldName, {
                    type: "server",
                    message:
                      typeof response.response?.data[key] === "object"
                        ? response.response?.data[key][0]
                        : response.response?.data[key],
                  });
                }
              }
            }
            return;
          }
        } catch (error) {
          console.error("회원가입 실패:", error);
        }
      });
  }

  function onUpload(e) {
    const file = e.target.files[0];
    const fileExt = file.name.split(".").pop();

    if (!["jpeg", "png", "jpg", "JPG", "PNG", "JPEG"].includes(fileExt)) {
      alert("jpg, png, jpg 파일만 업로드가 가능합니다.");
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);

    return new Promise((resolve) => {
      reader.onload = () => {
        setImageSrc(reader.result || null); // 파일의 컨텐츠
        setImageFile(file);
        resolve();
      };
    });
  }

  async function checkIdAvailability() {
    const username = getValues("username");
    try {
      const response = await authAxios.post("/api/v1/users/check_username/", {
        username,
      });

      if (response.status === 200) {
        setIsIdAvailable(1);
        clearErrors("username");
      } else {
        setIsIdAvailable(-1);
      }
    } catch (error) {
      console.error("중복확인 실패:", error);
    }
  }

  async function checkNicknameAvailability() {
    const nickname = getValues("nickname");
    try {
      const response = await authAxios.post("/api/v1/users/check_nickname/", {
        nickname,
      });

      if (response.status === 200) {
        setIsNicknameAvailable(2);
        clearErrors("nickname");
      } else {
        setIsNicknameAvailable(-2);
      }
    } catch (error) {
      console.error("중복확인 실패:", error);
    }
  }

  return (
    <>
      <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
            회원가입
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <form className="space-y-6" onSubmit={handleSubmit(onSignUpSubmit)}>
            <div className="flex justify-center items-center w-full space-x-2">
              <Image
                width={56}
                height={56}
                src={imageSrc}
                className="w-14 h-14 rounded-full bg-slate-500"
              />
              <label
                htmlFor="picture"
                className="cursor-pointer py-2 px-3 border hover:bg-gray-50 border-gray-300 rounded-md shadow-sm text-sm font-medium focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 text-gray-700"
              >
                사진선택
                <input
                  id="picture"
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={onUpload}
                />
              </label>
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-bold leading-6 text-gray-900"
              >
                아이디
              </label>
              <div className="mt-2">
                <input
                  className="focus:outline-none pl-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  id="username"
                  type="text"
                  placeholder="아이디를 입력해주세요."
                  aria-invalid={
                    isSubmitted ? (errors.id ? "true" : "false") : undefined
                  }
                  {...register("username", {
                    required: "아이디는 필수 입력입니다.",
                    minLength: {
                      value: 3,
                      message: "3자리 이상 입력해주세요.",
                    },
                    pattern: {
                      value: /^[A-za-z0-9]{3,}$/,
                      message:
                        "영문 대소문자와 숫자 조합의 아이디만 사용 가능합니다.", // 에러 메세지
                    },
                  })}
                  onBlur={checkIdAvailability}
                />
                {isIdAvailable === 1 && (
                  <small className="text-green-500 font-semibold">
                    사용 가능한 아이디입니다.
                  </small>
                )}
                {!(isIdAvailable === -1) || (
                  <small role="alert" className="text-red-500 font-semibold">
                    이미 사용 중인 아이디입니다.
                  </small>
                )}
                {errors.username && (
                  <small role="alert" className="text-red-500 font-semibold">
                    {errors.username.message}
                  </small>
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="name"
                  className="block text-sm font-bold leading-6 text-gray-900"
                >
                  이메일
                </label>
              </div>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  className="focus:outline-none pl-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  type="text"
                  placeholder="이메일을 입력해주세요."
                  aria-invalid={
                    isSubmitted ? (errors.email ? "true" : "false") : undefined
                  }
                  {...register("email", {
                    required: "이메일은 필수 입력 항목입니다.",
                    pattern: {
                      value:
                        /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$/i,
                      message: "이메일 형식에 맞지 않습니다.",
                    },
                  })}
                />

                {errors.email && (
                  <small className="text-red-500 font-semibold" role="alert">
                    {errors.email.message}
                  </small>
                )}
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="name"
                  className="block text-sm font-bold leading-6 text-gray-900"
                >
                  이름
                </label>
              </div>
              <div className="mt-2">
                <input
                  id="name"
                  name="name"
                  className="focus:outline-none pl-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  type="text"
                  placeholder="이름을 입력해주세요."
                  aria-invalid={
                    isSubmitted
                      ? errors.nickname
                        ? "true"
                        : "false"
                      : undefined
                  }
                  {...register("name", {
                    required: "이름은 필수 입력입니다.",
                    minLength: {
                      value: 2,
                      message: "2자리 이상 입력해주세요.",
                    },
                    pattern: {
                      value: /^[가-힣]{2,}$/,
                      message: "이름은 한글로 입력해주세요.",
                    },
                  })}
                />

                {errors.name && (
                  <small className="text-red-500 font-semibold" role="alert">
                    {errors.name.message}
                  </small>
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="nickname"
                  className="block text-sm font-bold leading-6 text-gray-900"
                >
                  닉네임
                </label>
              </div>
              <div className="mt-2">
                <input
                  className="focus:outline-none pl-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  id="nickname"
                  type="text"
                  placeholder="닉네임을 입력해주세요."
                  aria-invalid={
                    isSubmitted
                      ? errors.nickname
                        ? "true"
                        : "false"
                      : undefined
                  }
                  {...register("nickname", {
                    required: "닉네임은 필수 입력입니다.",
                    minLength: {
                      value: 2,
                      message: "2자리 이상 입력해주세요.",
                    },
                    maxLength: {
                      value: 10,
                      message: "11자리 이하로 입력해주세요.",
                    },
                    pattern: {
                      value: /^[A-za-z0-9가-힣]{2,10}$/,
                      message:
                        "영문 대소문자, 한글, 숫자 조합의 닉네임만 사용 가능합니다.",
                    },
                  })}
                  onBlur={checkNicknameAvailability}
                />
                {isNicknameAvailable === 2 && (
                  <small className="text-green-500 font-semibold">
                    사용 가능한 닉네임입니다.
                  </small>
                )}
                {!(isNicknameAvailable === -2) || (
                  <small role="alert" className="text-red-500 font-semibold">
                    이미 사용 중인 닉네임입니다.
                  </small>
                )}
                {errors.nickname && (
                  <small className="text-red-500 font-semibold" role="alert">
                    {errors.nickname.message}
                  </small>
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm font-bold leading-6 text-gray-900"
                >
                  비밀번호
                </label>
              </div>
              <div className="mt-2">
                <input
                  className="focus:outline-none pl-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  id="password1"
                  type="password"
                  placeholder="비밀번호를 입력해주세요."
                  aria-invalid={
                    isSubmitted
                      ? errors.password1
                        ? "true"
                        : "false"
                      : undefined
                  }
                  {...register("password1", {
                    required: "비밀번호는 필수 입력입니다.",
                    minLength: {
                      value: 8,
                      message: "8자리 이상 비밀번호를 사용하세요.",
                    },
                  })}
                />

                {errors.password1 && (
                  <small className="text-red-500 font-semibold" role="alert">
                    {errors.password1.message}
                  </small>
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password2"
                  className="block text-sm font-bold leading-6 text-gray-900"
                >
                  비밀번호확인
                </label>
              </div>
              <div className="mt-2">
                <input
                  className="focus:outline-none pl-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  id="password2"
                  type="password"
                  placeholder="비밀번호를 재입력해주세요."
                  aria-invalid={
                    isSubmitted
                      ? errors.password2
                        ? "true"
                        : "false"
                      : undefined
                  }
                  {...register("password2", {
                    required: "비밀번호 확인은 필수 입력입니다.",
                    minLength: {
                      value: 8,
                      message: "8자리 이상 비밀번호를 사용하세요.",
                    },
                    validate: {
                      check: (val) => {
                        if (getValues("password1") !== val) {
                          return "비밀번호가 일치하지 않습니다.";
                        }
                      },
                    },
                  })}
                />

                {errors.password2 && (
                  <small className="text-red-500 font-semibold" role="alert">
                    {errors.password2.message}
                  </small>
                )}
              </div>
            </div>

            <div>
              <button className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                회원가입
              </button>
            </div>
          </form>

          <p className="mt-10 text-center text-sm text-gray-500">
            이미 아이디가 있으신가요?{" "}
            <Link
              href={routes.login}
              className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500"
            >
              로그인
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}

export default Signup;
