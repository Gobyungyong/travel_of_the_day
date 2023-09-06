import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { useForm } from "react-hook-form";

function Test() {
  const { user, login, logout, authAxios } = useContext(AuthContext);

  //   const { register, handleSubmit } = useForm();

  //   async function onValid(data) {
  //     const content = data.content;
  //     const subject = data.subject;
  //     const response = await authAxios.post("api/v1/boards/new/", {
  //       content,
  //       subject,
  //     });
  //   }

  //   return (
  //     <form onSubmit={handleSubmit(onValid)}>
  //       <input {...register("subject")} />
  //       <textarea {...register("content")} />
  //       <button>저장</button>
  //     </form>
  //   );
  const [boards, setBoards] = useState();
  async function getAllBoards() {
    const response = await authAxios.get("api/v1/boards/");
    setBoards(response.data);
  }
  useEffect(() => {
    getAllBoards();
  }, []);

  if (!boards) {
    return <div>loading...</div>;
  }

  return (
    <>
      {boards.map((board) => (
        <div key={board.id}>{board.subject}</div>
      ))}
    </>
  );
}

export default Test;
