import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Avatar } from "@chakra-ui/react";
import { ChatBubbleOvalLeftEllipsisIcon } from "@heroicons/react/24/outline";

import { AuthContext } from "../contexts/AuthContext";
import Loading from "../components/uiux/Loading";
import routes from "../routes";

function MyPage() {
  const [boards, setBoards] = useState(null);
  const [user, setUser] = useState(null);

  const { authAxios, user: loggedinUser } = useContext(AuthContext);

  useEffect(() => {
    getMyBoards();
    if (loggedinUser) {
      getUserInfo();
    }
  }, [loggedinUser]);

  async function getMyBoards() {
    const response = await authAxios.get("api/v1/boards/my_boards/");
    setBoards(response.data);
  }

  async function getUserInfo() {
    const res = await authAxios.get("api/v1/users/myinfo/");
    await setUser(res.data);
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

  function commentsCount(board) {
    console.log("board", board);
    let count = board.comments_count;
    board.comment_set.forEach((comment) => {
      count += comment.recomments_count;
    });
    return count;
  }

  console.log("boards", boards);
  return (
    <>
      <div className="bg-white ">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          {user ? (
            <div className="relative flex items-center gap-x-4">
              <Avatar src={user?.avatar} size="2xl" />
              <div className="text-xl leading-6">
                <p className="font-semibold text-gray-900">{user?.nickname}</p>
                <Link to={routes.myinfo}>
                  <button className="mt-3 flex w-full  justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                    회원정보수정
                  </button>
                </Link>
              </div>
            </div>
          ) : (
            <Loading />
          )}
          <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 border-t border-gray-200 pt-10 mt-6 sm:mt-16 sm:pt-16 lg:mx-0 lg:max-w-none lg:grid-cols-3 lg:my-5 lg:py-8">
            {!boards ? (
              <Loading />
            ) : boards?.length === 0 ? (
              <div className="text-center lg:w-full">
                게시글이 존재하지 않습니다.
              </div>
            ) : (
              boards.map((board) => (
                <article
                  key={board.id}
                  className="flex px-4 max-w-xl flex-col items-start justify-between lg:border lg:border-s-2 lg:py-4"
                >
                  <div className="flex items-center gap-x-4 text-xs w-full">
                    <time
                      dateTime={formatMessageTimestamp(board.updated_at).date}
                      className="text-gray-500 flex justify-between w-full"
                    >
                      <div>{formatMessageTimestamp(board.updated_at).date}</div>
                      <div>
                        {formatMessageTimestamp(board.updated_at).hours}
                      </div>
                    </time>
                  </div>
                  <div className="group relative w-full">
                    <h3 className="mt-3 text-lg font-semibold leading-6 text-gray-900 w-10/12 lg:w-9/12 group-hover:text-gray-600">
                      <Link to={`/board/${board.id}`}>{board.subject}</Link>
                    </h3>
                    <p className="mt-5 px-2 line-clamp-3 text-sm leading-6 text-gray-600">
                      {board.content}
                    </p>
                    <p className="mt-3 flex space-x-3 absolute right-0 top-0">
                      <ChatBubbleOvalLeftEllipsisIcon className="w-6 h-6" />
                      <span> {commentsCount(board)}</span>
                    </p>
                  </div>
                  <div className="relative mt-5 flex items-center gap-x-4">
                    <img
                      src={board.writer.avatar}
                      alt=""
                      className="h-10 w-10 rounded-full bg-gray-50"
                    />
                    <div className="text-sm leading-6">
                      <p className="font-semibold text-gray-900">
                        {board.writer.nickname}
                      </p>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default MyPage;
