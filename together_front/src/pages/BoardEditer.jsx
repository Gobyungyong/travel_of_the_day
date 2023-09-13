import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

function BoardEditer() {
  const { authAxios } = useContext(AuthContext);

  const navigate = useNavigate();

  const { register, handleSubmit } = useForm();

  async function onValid(data) {
    const content = data.content;
    const subject = data.subject;
    const response = await authAxios.post("api/v1/boards/new/", {
      content,
      subject,
    });
    await navigate(`/board/${response.data.id}`);
  }

  return (
    <form
      onSubmit={handleSubmit(onValid)}
      className="flex flex-col space-y-4 px-4 lg:px-48"
    >
      <div className="flex flex-col space-y-4">
        <label className="font-semibold text-2xl text-gray-500">제목</label>
        <input
          placeholder=" 제목을 입력하세요."
          {...register("subject")}
          className="border border-indigo-400 p-2 rounded-md focus:outline-none focus:border-indigo-700 focus:border-2"
        />
      </div>
      <div className="flex flex-col space-y-4">
        <label className="font-semibold text-2xl text-gray-500">내용</label>
        <textarea
          {...register("content")}
          maxLength={150}
          rows={10}
          placeholder="내용을 입력하세요."
          className="border border-indigo-400 resize-none p-4 rounded-md focus:outline-none focus:border-indigo-700 focus:border-2"
        />
      </div>
      <div className="flex flex-row-reverse md:px-2">
        <button className="flex w-full lg:w-1/3 justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
          저장하기
        </button>
      </div>
    </form>
  );
}

export default BoardEditer;
