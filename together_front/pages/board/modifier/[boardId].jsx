import { useContext, useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useRouter } from "next/router";

import { AuthContext } from "../../../contexts/AuthContext";
import { ProtectedRoute } from "../../../utils/ProtectedRoute";
import TextEditer from "../../../components/TextEditer";
import { getBoardDetail, onModifiedBoardValid } from "../../../utils/Funcs";

function BoardModifier() {
  const { authAxios } = useContext(AuthContext);
  const [board, setBoard] = useState(null);

  const router = useRouter();
  const { boardId } = router.query;

  useEffect(() => {
    if (boardId) {
      getBoardDetail(setBoard, authAxios, boardId);
    }
  }, [boardId]);

  useEffect(() => {
    if (board) {
      setValue("subject", board.subject);
      setValue("content", board.content);
    }
  }, [board]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    control,
    setError,
  } = useForm({
    defaultValues: { subject: board?.subject, content: board?.content },
  });

  return (
    <ProtectedRoute>
      <form
        onSubmit={handleSubmit((data) =>
          onModifiedBoardValid(data, boardId, authAxios, router, setError)
        )}
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
          {errors?.subject && (
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
          {errors?.content && (
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

export default BoardModifier;
