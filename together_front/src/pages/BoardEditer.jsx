import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { useForm } from "react-hook-form";

function BoardEditer() {
  const { authAxios } = useContext(AuthContext);

  const { register, handleSubmit } = useForm();

  async function onValid(data) {
    const content = data.content;
    const subject = data.subject;
    const response = await authAxios.post("api/v1/boards/new/", {
      content,
      subject,
    });
  }

  return (
    <form onSubmit={handleSubmit(onValid)}>
      <input {...register("subject")} />
      <textarea {...register("content")} />
      <button>저장</button>
    </form>
  );
}

export default BoardEditer;
