import { useContext, useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import Loading from "../components/uiux/Loading";

function Board() {
  const { authAxios } = useContext(AuthContext);
  const { boardId } = useParams();
  const [board, setBoard] = useState();
  const [user, setUser] = useState();
  const navigate = useNavigate();

  async function getBoardDetail(board_id) {
    const res = await authAxios.get(`api/v1/boards/${boardId}/`);
    setBoard(res.data);
  }

  async function getUserInfo() {
    const res = await authAxios.get("api/v1/users/myinfo/");
    await setUser(res.data);
  }

  useEffect(() => {
    getUserInfo();
  }, []);

  useEffect(() => {
    getBoardDetail(boardId);
  }, [boardId]);

  if (!board || !user) {
    return <Loading />;
  }
  // 눈에 보이는 username 닉네임으로 변경
  return (
    <>
      <div>제목:{board.subject}</div>
      <div>작성자:{board.writer.username}</div>
      <div>내용:{board.content}</div>
      <Link to={`/chattings/${board.writer.username}__${user?.username}`}>
        <div>{board.writer.username}</div>
      </Link>
    </>
  );
}

export default Board;
