import { useState, useContext, useEffect } from "react";
import { useForm } from "react-hook-form";
import AWS from "aws-sdk";
import { Link, useNavigate } from "react-router-dom";

import { AuthContext } from "../contexts/AuthContext";
import routes from "../routes";

function MyInfo() {
  const [isNicknameAvailable, setIsNicknameAvailable] = useState(0);
  const [imageSrc, setImageSrc] = useState(
    "https://kr.object.ncloudstorage.com/travel-together/profile/basic_profile/basic.png"
  );
  const [imageFile, setImageFile] = useState(null);
  const [user, setUser] = useState(null);

  const navigate = useNavigate();

  const { authAxios, logout, user: loggedinUser } = useContext(AuthContext);

  const {
    register,
    handleSubmit,
    formState: { isSubmitted, errors },
    getValues,
    setValue,
    clearErrors,
  } = useForm();

  useEffect(() => {
    if (loggedinUser) {
      getUserInfo();
    }
  }, [loggedinUser]);

  async function getUserInfo() {
    const res = await authAxios.get("api/v1/users/myinfo/");
    await setUser(res.data);
    await setImageSrc(res.data.avatar);
    setValue("username", res.data.username);
    setValue("name", res.data.name);
    setValue("nickname", res.data.nickname);
  }

  async function onUpdateUserSubmit(data) {
    if (!imageFile) {
      const response = await authAxios.put("api/v1/users/myinfo/", {
        password: data.password,
        nickname: data.nickname,
        avatar: user.avatar,
      });
      navigate(routes.homepage, { replace: true });
      return;
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
          const response = await authAxios.put("api/v1/users/myinfo/", {
            password: data.password,
            nickname: data.nickname,
            avatar: `https://kr.object.ncloudstorage.com/travel-together/profile/${data.username}/${data.username}`,
          });
          if (response.status === 202) {
            navigate(routes.homepage, { replace: true });
          }
        } catch (error) {
          console.error("회원정보수정 실패:", error);
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

  async function checkNicknameAvailability() {
    const nickname = getValues("nickname");
    if (nickname === user.nickname) {
      setIsNicknameAvailable(2);
      return;
    }
    try {
      const response = await authAxios.post("api/v1/users/check_nickname/", {
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

  async function deleteUser() {
    if (window.confirm("정말 탈퇴하시겠습니까?")) {
      const res = await authAxios.delete(`api/v1/users/myinfo/`);
      if (res?.status === 204) {
        logout();
      }
    }
  }

  return (
    <>
      <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
            회원정보수정
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <form
            className="space-y-6"
            onSubmit={handleSubmit(onUpdateUserSubmit)}
          >
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
                  className="bg-gray-300 px-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 "
                  id="username"
                  type="text"
                  aria-invalid={
                    isSubmitted ? (errors.id ? "true" : "false") : undefined
                  }
                  {...register("username")}
                  disabled={true}
                />
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
                  className="bg-gray-300 px-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  type="text"
                  disabled={true}
                  {...register("name")}
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
                  className="px-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
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
                  className="px-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
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
                회원정보수정
              </button>
            </div>
          </form>

          <p className="mt-10 text-center text-sm text-gray-500">
            <button
              onClick={deleteUser}
              className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500"
            >
              회원탈퇴
            </button>
          </p>
        </div>
      </div>
    </>
  );
}

export default MyInfo;
