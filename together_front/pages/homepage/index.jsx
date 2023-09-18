import { useContext, useEffect, useState } from "react";
import Link from "next/link";
import { ChatBubbleOvalLeftEllipsisIcon } from "@heroicons/react/24/outline";

import { AuthContext } from "../../contexts/AuthContext";
import Loading from "../../components/uiux/Loading";

function Homepage() {
  const [boards, setBoards] = useState(null);
  const [user, setUser] = useState(null);

  const { authAxios, user: loggedinUser } = useContext(AuthContext);

  useEffect(() => {
    getAllBoards();
    if (loggedinUser) {
      getUserInfo();
    }
  }, [loggedinUser]);

  async function getAllBoards() {
    const response = await authAxios.get("/api/v1/boards/");
    setBoards(response.data);
  }

  async function getUserInfo() {
    const res = await authAxios.get("/api/v1/users/myinfo/");
    await setUser(res.data);
  }

  async function SearchBoards(e) {
    e.preventDefault();
    const category = e.target.category.value;
    const keyword = e.target.keyword.value;
    const searchResults = await authAxios.get(
      `/api/v1/boards/search/?category=${category}&keyword=${keyword}`
    );
    await setBoards(searchResults.data || []);
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

  function createConversationName(username) {
    const namesAlph = [user?.username, username].sort();
    return btoa(`${namesAlph[0]}__${namesAlph[1]}`);
  }

  // if (!boards) {
  //   return <div>게시글이 존재하지 않습니다.</div>;
  // }

  function commentsCount(board) {
    let count = board.comments_count;
    board.comment_set.forEach((comment) => {
      count += comment.recomments_count;
    });
    return count;
  }

  return (
    <div className="bg-white ">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <form
          onSubmit={SearchBoards}
          className="flex flex-row-reverse justify-center md:justify-start"
        >
          <div className="flex flex-row-reverse rounded-md shadow-sm  ring-1  ring-gray-300  ">
            <button className="text-gray-600 mr-1 w-16 rounded-md focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-600">
              검색
            </button>
            <div className="rounded-md">
              <input
                type="text"
                name="keyword"
                id="keyword"
                className="h-full rounded-md block w-full  border-0 py-1.5 px-4 text-gray-900 sm:text-sm sm:leading-6 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-600"
                placeholder="검색어를 입력해주세요."
              />
            </div>
            <div className="flex items-center">
              <label htmlFor="category" className="sr-only">
                category
              </label>
              <select
                name="category"
                className="h-full rounded-md border-0 bg-transparent py-0 pl-2 pr-7 text-gray-500 sm:text-sm focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-600"
              >
                <option value={"all"}>전체</option>
                <option value={"boardcomment"}>게시글+댓글</option>
                <option value={"board"}>게시글</option>
                <option value={"comment"}>댓글</option>
                <option value={"writer"}>작성자</option>
              </select>
            </div>
          </div>
        </form>
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
                    <div>{formatMessageTimestamp(board.updated_at).hours}</div>
                  </time>
                </div>
                <div className="group relative w-full">
                  <h3 className="mt-3 text-lg font-semibold leading-6 text-gray-900 w-10/12 lg:w-9/12 group-hover:text-gray-600">
                    <Link href={`/board/${board.id}`}>{board.subject}</Link>
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
                      <Link
                        href={`/chattings/${createConversationName(
                          board.writer.username
                        )}`}
                      >
                        <span className="absolute inset-0" />
                        {board.writer.nickname}
                      </Link>
                    </p>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Homepage;