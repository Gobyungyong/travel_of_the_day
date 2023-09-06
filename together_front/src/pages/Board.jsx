import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";

function Board() {
  const { authAxios } = useContext(AuthContext);
  const { boardId } = useParams();
  const [board, setBoard] = useState();

  async function getBoardDetail(board_id) {
    const res = await authAxios.get(`api/v1/boards/${boardId}/`);
    setBoard(res.data);
    console.log(board);
  }

  useEffect(() => {
    getBoardDetail(boardId);
  }, [boardId]);

  if (!board) {
    return <div>loading...</div>;
  }

  return (
    <>
      <div>제목:{board.subject}</div>
      <div>작성자:{board.writer.name}</div>
      <div>내용:{board.content}</div>
    </>
  );
}

export default Board;
