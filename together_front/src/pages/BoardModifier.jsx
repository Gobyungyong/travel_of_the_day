import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";

function BoardModifier() {
  const { authAxios } = useContext(AuthContext);
  const [board, setBoard] = useState({});

  const navigate = useNavigate();
  const { boardId } = useParams();

  useEffect(() => {
    getBoardDetail();
  }, []);

  useEffect(() => {
    if (board) {
      setValue("subject", board.subject);
      setValue("content", board.content);
    }
  }, [board]);

  const { register, handleSubmit, setValue } = useForm({
    defaultValues: { subject: board.subject, content: board.content },
  });

  async function getBoardDetail() {
    const res = await authAxios.get(`api/v1/boards/${boardId}/`);
    setBoard(res.data);
  }

  async function onValid(data) {
    const content = data.content;
    const subject = data.subject;
    const response = await authAxios.put(`api/v1/boards/${boardId}/`, {
      content,
      subject,
    });
    await navigate(`/board/${response.data.id}`);
  }

  return (
    <form onSubmit={handleSubmit(onValid)}>
      <input {...register("subject")} />
      <textarea {...register("content")} />
      <button>저장</button>
    </form>
  );
}

export default BoardModifier;
