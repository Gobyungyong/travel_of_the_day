import { useContext, useEffect, useState, Fragment } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { CalendarIcon, LinkIcon, PencilIcon } from "@heroicons/react/20/solid";

import { AuthContext } from "../contexts/AuthContext";
import Loading from "../components/uiux/Loading";
import routes from "../routes";
import { cls } from "../utils/ClassUtil";

function Board() {
  const { authAxios, user: loggedinUser } = useContext(AuthContext);
  const { boardId } = useParams();
  const [board, setBoard] = useState();
  const [user, setUser] = useState(null);
  const [isOpen, setIsOpen] = useState(0);
  const [isClicked, setIsClicked] = useState(false);
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
    getBoardDetail();
  }, [user]);

  useEffect(() => {
    if (formState.isSubmitSuccessful) {
      reset({ content: "" });
    }
  }, [formState]);

  async function onValid(data) {
    if (!user) {
      alert("로그인 후 이용 가능한 서비스입니다.");
      navigate(routes.login);
    }
    const content = data.content;
    await authAxios.post("api/v1/comments/new/", {
      content,
      board: boardId,
    });
    getBoardDetail();
  }

  async function recommentOnValid(event, comment_id) {
    event.preventDefault();
    if (!user) {
      alert("로그인 후 이용 가능한 서비스입니다.");
      navigate(routes.login);
    }
    const content = event.target.content.value;
    await authAxios.post("api/v1/recomments/new/", {
      content,
      comment: comment_id,
    });
    getBoardDetail();
    event.target.content.value = "";
  }

  async function getBoardDetail() {
    const res = await authAxios.get(`api/v1/boards/${boardId}/`);
    setBoard(res.data);
  }

  async function getUserInfo() {
    const res = await authAxios.get("api/v1/users/myinfo/");
    await setUser(res.data);
  }

  async function deleteBoard() {
    if (!user) {
      alert("로그인 후 이용 가능한 서비스입니다.");
      navigate(routes.login);
    }
    if (board.is_writer || user.is_staff) {
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

  // if (!user) {
  //   function onClickHandler() {
  //     alert("로그인 후 이용 가능한 서비스입니다.");
  //     navigate(routes.login);
  //   }
  //   return (
  //     <>
  //       <div>제목:{board.subject}</div>
  //       <div>작성자:{board.writer.username}</div>
  //       <div>내용:{board.content}</div>
  //       <button onClick={onClickHandler}>
  //         <div>{board.writer.username}</div>
  //       </button>
  //       <form onSubmit={handleSubmit(onValid)}>
  //         <textarea {...register("content")} />
  //         <button>댓글</button>
  //       </form>
  //       {board.comment_set.map((comment) => (
  //         <div key={comment.id}>
  //           {comment.writer.username} : {comment.content}
  //           <form onSubmit={(e) => recommentOnValid(e, comment.id)}>
  //             <textarea name="content" />
  //             <button>대댓글</button>
  //           </form>
  //           {comment.recomment_set?.map((recomment) => (
  //             <div key={recomment?.id}>
  //               {recomment?.writer.username} : {recomment?.content}
  //             </div>
  //           ))}
  //         </div>
  //       ))}
  //     </>
  //   );
  // }

  function createConversationName(username) {
    const namesAlph = [user?.username, username].sort();
    return btoa(`${namesAlph[0]}__${namesAlph[1]}`);
  }

  function formatMessageTimestamp(timestamp) {
    if (!timestamp) return;

    const date = new Date(timestamp);

    const formattedDate = {
      year: date.getFullYear(),
      month: String(date.getMonth()).padStart(2, "0"),
      day: String(date.getDay()).padStart(2, "0"),
      hour: String(date.getHours()).padStart(2, "0"),
      minute: String(date.getMinutes()).padStart(2, "0"),
    };

    return {
      date: `${formattedDate.year}-${formattedDate.month}-${formattedDate.day}`,
      hours: `${formattedDate.hour}:${formattedDate.minute}`,
    };
  }

  function viewMoreClickHandler(commentId) {
    if (!isClicked) {
      setIsOpen(commentId);
    } else {
      setIsOpen(0);
    }
    setIsClicked((prev) => !prev);
  }

  async function deleteComment(commentId) {
    if (window.confirm("댓글을 삭제하시겠습니까?")) {
      const res = await authAxios.delete(
        `api/v1/comments/delete/${commentId}/`
      );
      if (res?.status === 204) {
        getBoardDetail();
      }
    }
  }

  async function deleteRecomment(recommentId) {
    if (window.confirm("대댓글을 삭제하시겠습니까?")) {
      const res = await authAxios.delete(
        `api/v1/recomments/delete/${recommentId}/`
      );
      if (res?.status === 204) {
        getBoardDetail();
      }
    }
  }

  return (
    <>
      <div className="flex px-3 lg:px-10 ">
        <div className="min-w-0 flex-1 pt-10">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            {board.subject}
          </h2>
        </div>
        <div>
          <div className="mt-1 flex sm:mt-0 flex-wrap justify-end space-x-6 items-center">
            <div className="mt-2 flex items-center text-sm text-gray-500 space-x-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                />
              </svg>
              <span>{board.writer.nickname}</span>
            </div>
            <div className="mt-2 flex items-center text-sm text-gray-500">
              <CalendarIcon
                className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
                aria-hidden="true"
              />
              {formatMessageTimestamp(board.updated_at).date} /{" "}
              {formatMessageTimestamp(board.updated_at).hours}
            </div>
          </div>
          <div className="mt-5 flex justify-end lg:ml-4">
            <span className="block">
              {board.is_writer || user?.is_staff ? (
                <button
                  onClick={() => navigate(`/board/modifier/${boardId}`)}
                  className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                >
                  <PencilIcon
                    className="-ml-0.5 mr-1.5 h-5 w-5 text-gray-400"
                    aria-hidden="true"
                  />
                  수정
                </button>
              ) : null}
            </span>

            <span className="ml-3 block">
              {board.is_writer || user?.is_staff ? (
                <button
                  onClick={deleteBoard}
                  className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                >
                  <LinkIcon
                    className="-ml-0.5 mr-1.5 h-5 w-5 text-gray-400"
                    aria-hidden="true"
                  />
                  삭제
                </button>
              ) : null}
            </span>
            <span className="sm:ml-3">
              {board.is_writer ? null : (
                <Link
                  to={`/chattings/${createConversationName(
                    board.writer.username
                  )}`}
                >
                  <button className="w-28 space-x-2inline-flex items-center rounded-md bg-indigo-600 px-2 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5 inline"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155"
                      />
                    </svg>
                    채팅하기
                  </button>
                </Link>
              )}
            </span>
          </div>
        </div>
      </div>

      <div className="h-[25rem] lg:h-[35rem] overflow-scroll scrollbar-hide mt-5 px-5 py-5 border-y border-gray-300 border-dotted lg:px-12 text-lg">
        {board.content}
      </div>

      <form
        onSubmit={handleSubmit(onValid)}
        className="mt-3 flex flex-col mx-3"
      >
        <div className="w-full">
          <textarea
            {...register("content")}
            className="w-full border border-indigo-300 rounded-md resize-none focus:outline-none focus:border-2 focus:border-indigo-700"
          />
        </div>
        <div className="flex justify-end mt-2">
          <button className="ml-3 w-20 space-x-2inline-flex items-center rounded-md bg-indigo-600 px-2 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
            댓글달기
          </button>
        </div>
      </form>
      <div className="flex flex-col-reverse">
        {board.comment_set.map((comment) => (
          <div key={comment.id} className="space-y-2">
            <div className="md:flex md:flex-col md:items-center md:justify-center">
              <div className="flex justify-between mx-5 mt-3 p-2 rounded-md border md:w-2/3">
                <div className="flex flex-col w-[20rem] lg:w-[30rem]">
                  <div className="font-semibold text-lg flex justify-between w-full">
                    {comment.writer.nickname}
                  </div>
                  <div className="pl-2"> {comment.content}</div>
                </div>
                <div className="flex flex-col items-end justify-around">
                  <span className="text-xs">
                    {formatMessageTimestamp(comment.updated_at).date} /{" "}
                    {formatMessageTimestamp(comment.updated_at).hours}
                  </span>
                  {comment.is_writer ? (
                    <button
                      className="text-xs"
                      onClick={() => deleteComment(comment.id)}
                    >
                      삭제
                    </button>
                  ) : null}
                  <button
                    onClick={() => viewMoreClickHandler(comment.id)}
                    className="text-xs text-gray-400 flex items-center"
                  >
                    <span>더보기</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-3 h-3"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9"
                      />
                    </svg>
                  </button>
                </div>
              </div>
              <form
                onSubmit={(e) => recommentOnValid(e, comment.id)}
                className={cls(
                  isOpen === comment.id ? null : "hidden",
                  "mt-3 flex flex-col mx-8 md:flex-row md:w-3/5"
                )}
              >
                <textarea
                  name="content"
                  className="w-full border border-indigo-300 rounded-md resize-none focus:outline-none focus:border-2 focus:border-indigo-700"
                />
                <div className="flex justify-end mt-2">
                  <button className="ml-3 w-24 space-x-2inline-flex items-center rounded-md bg-indigo-600 px-2 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                    대댓글달기
                  </button>
                </div>
              </form>
              {comment.recomment_set?.map((recomment) => (
                <div className="flex justify-between mx-8 mt-3 p-2 rounded-md border ">
                  <div className="flex flex-col w-[20rem] lg:w-[30rem]">
                    <div className="font-semibold text-lg flex justify-start items-center space-x-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-4 h-4"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 6h.008v.008H6V6z"
                        />
                      </svg>
                      <span>{recomment.writer.nickname}</span>
                    </div>
                    <div className="pl-2"> {recomment.content}</div>
                  </div>
                  <div className="flex flex-col items-end justify-around">
                    <span className="text-xs">
                      {formatMessageTimestamp(recomment.updated_at).date} /{" "}
                      {formatMessageTimestamp(recomment.updated_at).hours}
                    </span>
                    {recomment.is_writer ? (
                      <button
                        className="text-xs"
                        onClick={() => deleteRecomment(recomment.id)}
                      >
                        삭제
                      </button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export default Board;
