import { useContext, useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";

import { AuthContext } from "../contexts/AuthContext";
import Loading from "../components/uiux/Loading";
import routes from "../routes";

function Board() {
  const { authAxios, user: loggedinUser } = useContext(AuthContext);
  const { boardId } = useParams();
  const [board, setBoard] = useState();
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState,
    formState: { isSubmitSuccessful },
    reset,
  } = useForm();
  // const { register: reRegister, handleSubmit: reHandleSubmit } = useForm();

  useEffect(() => {
    if (loggedinUser) {
      getUserInfo();
    }
  }, []);

  useEffect(() => {
    getBoardDetail(boardId);
  }, [boardId]);

  useEffect(() => {
    if (formState.isSubmitSuccessful) {
      reset({ content: "" });
    }
  }, [formState]);

  async function onValid(data) {
    const content = data.content;
    await authAxios.post("api/v1/comments/new/", {
      content,
      board: boardId,
    });
    getBoardDetail(boardId);
  }

  async function recommentOnValid(event, comment_id) {
    event.preventDefault();
    const content = event.target.content.value;
    await authAxios.post("api/v1/recomments/new/", {
      content,
      comment: comment_id,
    });
    getBoardDetail(boardId);
    event.target.content.value = "";
  }

  async function getBoardDetail(board_id) {
    const res = await authAxios.get(`api/v1/boards/${boardId}/`);
    setBoard(res.data);
  }

  async function getUserInfo() {
    const res = await authAxios.get("api/v1/users/myinfo/");
    await setUser(res.data);
  }

  async function deleteBoard() {
    if (board.writer.id === user.id) {
      if (window.confirm("게시글을 삭제하시겠습니까?")) {
        try {
          await authAxios.delete(`api/v1/boards/${boardId}/`);
          navigate("/homepage", { replace: true });
        } catch {
          return;
        }
      } else {
        return;
      }
    }
  }

  if (!board) {
    return <Loading />;
  }

  if (!user) {
    function onClickHandler() {
      alert("로그인 후 이용 가능한 서비스입니다.");
      navigate(routes.login);
    }
    return (
      <>
        <div>제목:{board.subject}</div>
        <div>작성자:{board.writer.username}</div>
        <div>내용:{board.content}</div>
        <button onClick={onClickHandler}>
          <div>{board.writer.username}</div>
        </button>
        <form onSubmit={handleSubmit(onValid)}>
          <textarea {...register("content")} />
          <button>댓글</button>
        </form>
        {board.comment_set.map((comment) => (
          <div key={comment.id}>
            {comment.writer.username} : {comment.content}
            <form onSubmit={(e) => recommentOnValid(e, comment.id)}>
              <textarea name="content" />
              <button>대댓글</button>
            </form>
            {comment.recomment_set?.map((recomment) => (
              <div key={recomment?.id}>
                {recomment?.writer.username} : {recomment?.content}
              </div>
            ))}
          </div>
        ))}
      </>
    );
  }
  // 눈에 보이는 username 닉네임으로 변경
  return (
    <>
      <div>제목:{board.subject}</div>
      <div>작성자:{board.writer.username}</div>
      <div>내용:{board.content}</div>
      {board.writer.id === user.id ? (
        <button onClick={deleteBoard}>삭제</button>
      ) : null}
      {board.writer.id === user.id ? <button>수정</button> : null}
      <Link to={`/chattings/${board.writer.username}__${user?.username}`}>
        <div>{board.writer.username}</div>
      </Link>
      <form onSubmit={handleSubmit(onValid)}>
        <textarea {...register("content")} />
        <button>댓글</button>
      </form>
      {board.comment_set.map((comment) => (
        <div key={comment.id}>
          {comment.writer.username} : {comment.content}
          <form onSubmit={(e) => recommentOnValid(e, comment.id)}>
            <textarea name="content" />
            <button>대댓글</button>
          </form>
          {comment.recomment_set?.map((recomment) => (
            <div key={recomment?.id}>
              {recomment?.writer.username} : {recomment?.content}
            </div>
          ))}
        </div>
      ))}
    </>
  );
}

export default Board;
