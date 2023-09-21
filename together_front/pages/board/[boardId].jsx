import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useForm } from "react-hook-form";
import {
  CalendarIcon,
  LinkIcon,
  PencilIcon,
  UserIcon,
  ChatBubbleLeftRightIcon,
  ChevronUpDownIcon,
  TagIcon,
} from "@heroicons/react/20/solid";

import { AuthContext } from "../../contexts/AuthContext";
import Loading from "../../components/uiux/Loading";
import routes from "../../routes";
import { cls } from "../../utils/ClassUtil";
import TextViewer from "../../components/TextViewer";

function Board() {
  const { authAxios, user: loggedinUser } = useContext(AuthContext);
  const [board, setBoard] = useState();
  const [user, setUser] = useState(null);
  const [isOpen, setIsOpen] = useState(0);
  const [isClicked, setIsClicked] = useState(false);
  const router = useRouter();
  const { boardId } = router.query;

  const {
    register,
    handleSubmit,
    formState,
    formState: { isSubmitSuccessful },
    reset,
  } = useForm();

  useEffect(() => {
    if (loggedinUser) {
      getUserInfo();
    }
  }, [loggedinUser]);

  useEffect(() => {
    if (boardId) {
      getBoardDetail();
    }
  }, [user, boardId]);

  useEffect(() => {
    if (formState.isSubmitSuccessful) {
      reset({ content: "" });
    }
  }, [formState]);

  async function onValid(data) {
    if (!user) {
      alert("로그인 후 이용 가능한 서비스입니다.");
      router.replace(routes.login);
    }
    const content = data.content;
    await authAxios.post("/api/v1/comments/new/", {
      content,
      board: boardId,
    });
    getBoardDetail();
  }

  async function recommentOnValid(event, comment_id) {
    event.preventDefault();
    if (!user) {
      alert("로그인 후 이용 가능한 서비스입니다.");
      router.replace(routes.login);
    }
    const content = event.target.content.value;
    await authAxios.post("/api/v1/recomments/new/", {
      content,
      comment: comment_id,
    });
    getBoardDetail();
    event.target.content.value = "";
  }

  async function getBoardDetail() {
    const res = await authAxios.get(`/api/v1/boards/${boardId}/`);
    setBoard(res.data);
  }

  async function getUserInfo() {
    // const res = await authAxios.get("/api/v1/users/myinfo/");
    const res = await authAxios.get("/api/v1/users/rest_auth/user/");
    await setUser(res.data);
  }

  async function deleteBoard() {
    if (!user) {
      alert("로그인 후 이용 가능한 서비스입니다.");
      router.replace(routes.login);
    }
    if (board.is_writer || user.is_staff) {
      if (window.confirm("게시글을 삭제하시겠습니까?")) {
        try {
          await authAxios.delete(`/api/v1/boards/${boardId}/`);
          router.replace("/homepage");
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
        `/api/v1/comments/delete/${commentId}/`
      );
      if (res?.status === 204) {
        getBoardDetail();
      }
    }
  }

  async function deleteRecomment(recommentId) {
    if (window.confirm("대댓글을 삭제하시겠습니까?")) {
      const res = await authAxios.delete(
        `/api/v1/recomments/delete/${recommentId}/`
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
              <UserIcon className="w-5 h-5" />
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
                  onClick={() => router.push(`/board/modifier/${boardId}`)}
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
                  href={`/chattings/${createConversationName(
                    board.writer.username
                  )}`}
                >
                  <button className="w-28 space-x-2 inline-flex items-center rounded-md bg-indigo-600 px-2 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                    <ChatBubbleLeftRightIcon className="w-5 h-5" />
                    <span>채팅하기</span>
                  </button>
                </Link>
              )}
            </span>
          </div>
        </div>
      </div>

      <div className="h-[25rem] lg:h-[35rem] overflow-scroll scrollbar-hide mt-5 px-5 py-5 border-y border-gray-300 border-dotted lg:px-12 text-lg">
        <TextViewer value={board?.content}>{board.content}</TextViewer>
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
                    <ChevronUpDownIcon className="w-3 h-3" />
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
                      <TagIcon className="w-4 h-4" />
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
