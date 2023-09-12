import { useState, useContext, useEffect } from "react";
import { useForm } from "react-hook-form";
import AWS from "aws-sdk";
import { Link, useNavigate } from "react-router-dom";

import { AuthContext } from "../contexts/AuthContext";
import routes from "../routes";

function Signup() {
  const [isIdAvailable, setIsIdAvailable] = useState(0);
  const [imageSrc, setImageSrc] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const navigate = useNavigate();

  const { authAxios, signup, user } = useContext(AuthContext);

  useEffect(() => {
    if (user) {
      navigate(routes.homepage, { replace: true });
    }
  }, []);

  const {
    register,
    handleSubmit,
    formState: { isSubmitted, errors },
    getValues,
    clearErrors,
  } = useForm();

  async function onSignUpSubmit(data) {
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
          const response = await authAxios.post("api/v1/users/signup/", {
            username: data.username,
            name: data.name,
            password: data.password,
            nickname: data.nickname,
            avatar: `https://kr.object.ncloudstorage.com/travel-together/profile/${data.username}/${data.username}`,
          });
          signup(response.data.access, response.data.refresh);
          navigate(routes.homepage, { replace: true });
          // localStorage.setItem("access_token", response.data.access_token);
          // localStorage.setItem("refresh_token", response.data.refresh_token);
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

  // async function uploadObjectStorage(e) {
  //   if (!imageSrc) {
  //     alert("이미지를 등록해 주세요.");
  //     return;
  //   }
  //   e.preventDefault();
  //   const endpoint = new AWS.Endpoint("https://kr.object.ncloudstorage.com");
  //   const region = process.env.REACT_APP_REGION;
  //   const access_key = process.env.REACT_APP_ACCESS_KEY;
  //   const secret_key = process.env.REACT_APP_SECRET_ACCESS_KEY;
  //   const bucket_name = process.env.REACT_APP_BUCKET_NAME;

  //   const S3 = new AWS.S3({
  //     endpoint: endpoint,
  //     region: region,
  //     credentials: {
  //       accessKeyId: access_key,
  //       secretAccessKey: secret_key,
  //     },
  //   });

  //   await S3.putObject({
  //     Bucket: bucket_name,
  //     Key: `profile/${imageFile.name}`,
  //     ACL: "public-read",
  //     Body: imageFile,
  //   })
  //     .promise()
  //     .then((res) => console.log(res));
  //   // https://kr.object.ncloudstorage.com/travel-together/profile/20230522_170441.jpg
  // }

  async function checkIdAvailability() {
    const username = getValues("username");
    try {
      const response = await authAxios.post("api/v1/users/check_username/", {
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

  // return (
  //   <>
  //     <form onSubmit={handleSubmit(onSignUpSubmit)}>
  //       <h1>회원 가입</h1>
  //       <div className="w-14 h-14 rounded-full bg-slate-500" />
  //       <label
  //         htmlFor="picture"
  //         className="cursor-pointer py-2 px-3 border hover:bg-gray-50 border-gray-300 rounded-md shadow-sm text-sm font-medium focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 text-gray-700"
  //       >
  //         Change
  //         <input id="picture" type="file" className="hidden" accept="image/*" />
  //       </label>
  //       <img width={"30%"} src={imageSrc} />
  //       <input accept="image/*" type="file" onChange={onUpload} />
  //       <input
  //         id="username"
  //         type="text"
  //         placeholder="아이디"
  //         aria-invalid={
  //           isSubmitted ? (errors.id ? "true" : "false") : undefined
  //         }
  //         {...register("username", {
  //           required: "아이디는 필수 입력입니다.",
  //           minLength: {
  //             value: 3,
  //             message: "3자리 이상 입력해주세요.",
  //           },
  //         })}
  //         onBlur={checkIdAvailability}
  //       />
  //       {isIdAvailable === 1 && (
  //         <small className="text-green-500 font-semibold">
  //           사용 가능한 아이디입니다.
  //         </small>
  //       )}
  //       {!(isIdAvailable === -1) || (
  //         <small role="alert" className="text-red-500 font-semibold">
  //           이미 사용 중인 아이디입니다.
  //         </small>
  //       )}
  //       {errors.username && <span>{errors.username.message}</span>}

  //       <input
  //         id="password"
  //         type="password"
  //         placeholder="비밀번호"
  //         aria-invalid={
  //           isSubmitted ? (errors.password ? "true" : "false") : undefined
  //         }
  //         {...register("password", {
  //           required: "비밀번호는 필수 입력입니다.",
  //           minLength: {
  //             value: 5,
  //             message: "5자리 이상 비밀번호를 사용하세요.",
  //           },
  //         })}
  //       />

  //       {errors.password && <div role="alert">{errors.password.message}</div>}

  //       <input
  //         id="passwordConfirm"
  //         type="password"
  //         placeholder="비밀번호 확인"
  //         aria-invalid={
  //           isSubmitted
  //             ? errors.passwordConfirm
  //               ? "true"
  //               : "false"
  //             : undefined
  //         }
  //         {...register("passwordConfirm", {
  //           required: "비밀번호 확인은 필수 입력입니다.",
  //           minLength: {
  //             value: 5,
  //             message: "5자리 이상 비밀번호를 사용하세요.",
  //           },
  //           validate: {
  //             check: (val) => {
  //               if (getValues("password") !== val) {
  //                 return "비밀번호가 일치하지 않습니다.";
  //               }
  //             },
  //           },
  //         })}
  //       />

  //       {errors.passwordConfirm && (
  //         <div role="alert">{errors.passwordConfirm.message}</div>
  //       )}

  //       <input
  //         id="name"
  //         type="text"
  //         placeholder="이름"
  //         aria-invalid={
  //           isSubmitted ? (errors.name ? "true" : "false") : undefined
  //         }
  //         {...register("name", {
  //           required: "이름은 필수 입력입니다.",
  //           minLength: {
  //             value: 2,
  //             message: "2자리 이상 입력해주세요.",
  //           },
  //         })}
  //       />

  //       {errors.name && <div role="alert">{errors.name.message}</div>}

  //       <input
  //         id="nickname"
  //         type="text"
  //         placeholder="이름"
  //         aria-invalid={
  //           isSubmitted ? (errors.nickname ? "true" : "false") : undefined
  //         }
  //         {...register("nickname", {
  //           required: "닉네임은 필수 입력입니다.",
  //           minLength: {
  //             value: 2,
  //             message: "2자리 이상 입력해주세요.",
  //           },
  //         })}
  //       />

  //       {errors.nickname && <div role="alert">{errors.nickname.message}</div>}

  //       <input
  //         id="email"
  //         type="text"
  //         placeholder="test@email.com"
  //         {...register("email", {
  //           required: "이메일은 필수 입력입니다.",
  //           pattern: {
  //             value:
  //               /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$/i,
  //             message: "이메일 형식에 맞지 않습니다.",
  //           },
  //         })}
  //       />

  //       {errors.email && <div role="alert">{errors.email.message}</div>}

  //       <button>Sign Up</button>
  //     </form>
  //   </>
  // );
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
              <img
                width={"30%"}
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
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
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
                  이름
                </label>
              </div>
              <div className="mt-2">
                <input
                  id="name"
                  name="name"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
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
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
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
                  })}
                />

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
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  id="password"
                  type="password"
                  placeholder="비밀번호를 입력해주세요."
                  aria-invalid={
                    isSubmitted
                      ? errors.password
                        ? "true"
                        : "false"
                      : undefined
                  }
                  {...register("password", {
                    required: "비밀번호는 필수 입력입니다.",
                    minLength: {
                      value: 5,
                      message: "5자리 이상 비밀번호를 사용하세요.",
                    },
                  })}
                />

                {errors.password && (
                  <small className="text-red-500 font-semibold" role="alert">
                    {errors.password.message}
                  </small>
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="passwordConfirm"
                  className="block text-sm font-bold leading-6 text-gray-900"
                >
                  비밀번호확인
                </label>
              </div>
              <div className="mt-2">
                <input
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  id="passwordConfirm"
                  type="password"
                  placeholder="비밀번호를 재입력해주세요."
                  aria-invalid={
                    isSubmitted
                      ? errors.passwordConfirm
                        ? "true"
                        : "false"
                      : undefined
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
                  <small className="text-red-500 font-semibold" role="alert">
                    {errors.passwordConfirm.message}
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
              to={routes.login}
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
