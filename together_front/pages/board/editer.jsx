import { useContext } from "react";
import { useForm, Controller } from "react-hook-form";
import { useRouter } from "next/router";

import { AuthContext } from "../../contexts/AuthContext";
import { ProtectedRoute } from "../../utils/ProtectedRoute";
import TextEditer from "../../components/TextEditer";

function BoardEditer() {
  const { authAxios } = useContext(AuthContext);

  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    setError,
  } = useForm();

  async function onValid(data) {
    const content = data.content;
    const subject = data.subject;
    if (content === "<p><br></p>") {
      setError("content", { message: "내용을 입력해주세요." });
      return;
    }

    const response = await authAxios.post("/api/v1/boards/new/", {
      content,
      subject,
    });
    await router.push(`/board/${response.data.id}`, undefined, {
      replace: true,
    });
  }

  return (
    <ProtectedRoute>
      <form
        onSubmit={handleSubmit(onValid)}
        className="flex flex-col space-y-4 px-4 lg:px-48"
      >
        <div className="flex flex-col space-y-4">
          <label className="font-semibold text-2xl text-gray-500">제목</label>
          <input
            placeholder=" 제목을 입력하세요."
            {...register("subject", {
              required: "제목을 입력해주세요.",
              maxLength: {
                value: 50,
                message: "제목은 50자를 넘을 수 없습니다.",
              },
            })}
            className="border border-indigo-400 p-2 rounded-md focus:outline-none focus:border-indigo-700 focus:border-2"
          />
          {errors.subject && (
            <small role="alert" className="pl-2 text-red-500 font-semibold">
              {errors.subject.message}
            </small>
          )}
        </div>
        <div className="flex flex-col space-y-4">
          <label className="font-semibold text-2xl text-gray-500">내용</label>
          <Controller
            name="content"
            control={control}
            defaultValue=""
            rules={{
              required: "내용을 입력해주세요.",
              maxLength: {
                value: 512,
                message: "내용은 512자를 넘을 수 없습니다.",
              },
            }}
            render={({ field }) => (
              <TextEditer
                value={field.value}
                onChange={(value) => field.onChange(value)}
              />
            )}
          />
          {/* <textarea
            {...register("content", {
              required: "내용을 입력해주세요.",
              maxLength: {
                value: 512,
                message: "내용은 512자를 넘을 수 없습니다.",
              },
            })}
            maxLength={150}
            rows={10}
            placeholder="내용을 입력하세요."
            className="border border-indigo-400 resize-none p-4 rounded-md focus:outline-none focus:border-indigo-700 focus:border-2"
          /> */}
          {errors.content && (
            <small role="alert" className="pl-2 text-red-500 font-semibold">
              {errors.content.message}
            </small>
          )}
        </div>
        <div className="flex flex-row-reverse md:px-2">
          <button className="flex w-full lg:w-1/3 justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
            저장하기
          </button>
        </div>
      </form>
    </ProtectedRoute>
  );
}

export default BoardEditer;
