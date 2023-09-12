import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { AuthContext } from "../contexts/AuthContext";
import Loading from "../components/uiux/Loading";

function Together() {
  const [boards, setBoards] = useState([]);
  const [user, setUser] = useState(null);

  const { authAxios, user: loggedinUser } = useContext(AuthContext);

  useEffect(() => {
    getAllBoards();
    if (loggedinUser) {
      getUserInfo();
    }
  }, []);

  async function getAllBoards() {
    const response = await authAxios.get("api/v1/boards/");
    setBoards(response.data);
  }

  async function getUserInfo() {
    const res = await authAxios.get("api/v1/users/myinfo/");
    await setUser(res.data);
  }

  async function SearchBoards(e) {
    e.preventDefault();
    const category = e.target.category.value;
    const keyword = e.target.keyword.value;
    const searchResults = await authAxios.get(
      `api/v1/boards/search/?category=${category}&keyword=${keyword}`
    );
    console.log("이벤트타겟", e.target.category.value);
    await setBoards(searchResults.data);
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
    return `${namesAlph[0]}__${namesAlph[1]}`;
  }

  // if (!boards) {
  //   return <div>게시글이 존재하지 않습니다.</div>;
  // }

  return (
    <>
      <div className="bg-white ">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <form
            onSubmit={SearchBoards}
            className="flex flex-row-reverse justify-center md:justify-start"
          >
            <div className="flex flex-row-reverse rounded-md shadow-sm  ring-1  ring-gray-300  ">
              <button className="text-gray-600 mr-1 w-16 focus:ring-1 focus:ring-inset focus:ring-indigo-300">
                검색
              </button>
              <div className="rounded-md">
                <input
                  type="text"
                  name="keyword"
                  id="keyword"
                  className="h-full block w-full  border-0 py-1.5 px-4 text-gray-900 sm:text-sm sm:leading-6 placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-indigo-300"
                  placeholder="검색어를 입력해주세요."
                />
              </div>
              <div className="flex items-center">
                <label htmlFor="category" className="sr-only">
                  category
                </label>
                <select
                  name="category"
                  className="h-full rounded-md border-0 bg-transparent py-0 pl-2 pr-7 text-gray-500 sm:text-sm focus:border-2 focus:border-black"
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
            {boards ? (
              boards.map((board) => (
                <article
                  key={board.id}
                  className="flex px-4 max-w-xl flex-col items-start justify-between lg:border lg:border-s-2 lg:py-4 not:last-child:"
                >
                  <div className="flex items-center gap-x-4 text-xs">
                    <time
                      dateTime={formatMessageTimestamp(board.updated_at).date}
                      className="text-gray-500"
                    >
                      <div>{formatMessageTimestamp(board.updated_at).date}</div>
                      {formatMessageTimestamp(board.updated_at).hours}
                    </time>
                  </div>
                  <div className="group relative w-full">
                    <h3 className="mt-3 text-lg font-semibold leading-6 text-gray-900 group-hover:text-gray-600">
                      <Link to={`/board/${board.id}`}>
                        <span className="absolute inset-0" />
                        {board.subject}
                      </Link>
                    </h3>
                    <p className="mt-5 px-2 line-clamp-3 text-sm leading-6 text-gray-600">
                      {board.content}
                    </p>
                    <p className="mt-3 flex space-x-3 absolute right-0 ">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-6 h-6"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
                        />
                      </svg>
                      <span> {board.comments_count}</span>
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
                          to={`/chattings/${createConversationName(
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
            ) : !(boards?.length() === 0) ? (
              <div className="text-center lg:w-full">
                게시글이 존재하지 않습니다.
              </div>
            ) : (
              <Loading />
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default Together;
