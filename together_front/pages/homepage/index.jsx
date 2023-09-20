import { useContext, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { ChatBubbleOvalLeftEllipsisIcon } from "@heroicons/react/24/outline";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/20/solid";

import { AuthContext } from "../../contexts/AuthContext";
import Loading from "../../components/uiux/Loading";
import { cls } from "../../utils/ClassUtil";

function Homepage() {
  const router = useRouter();
  const [boards, setBoards] = useState(null);
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const { authAxios, user: loggedinUser } = useContext(AuthContext);

  console.log("router", router.query.category);

  useEffect(() => {
    getBoards();
  }, [currentPage, router.query]);

  useEffect(() => {
    if (loggedinUser) {
      getUserInfo();
    }
  }, [loggedinUser]);

  async function getUserInfo() {
    const res = await authAxios.get("/api/v1/users/myinfo/");
    await setUser(res.data);
  }

  async function getBoards() {
    let response;
    if (router.query.category && router.query.keyword) {
      response = await authAxios.get(`/api/v1/boards/search/`, {
        params: {
          category: router.query.category,
          keyword: router.query.keyword,
          page: currentPage,
        },
      });
    } else {
      response = await authAxios.get("/api/v1/boards/", {
        params: { page: currentPage },
      });
    }
    setBoards(response.data.boards);
    setTotalPages(response.data.total_pages);
  }

  async function SearchBoards(e) {
    e.preventDefault();
    const category = e.target.category.value;
    const keyword = e.target.keyword.value;
    if (!(category && keyword)) return;
    await setCurrentPage(1);
    router.push(`?category=${category}&keyword=${keyword}`);
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

  function commentsCount(board) {
    let count = board.comments_count;
    board.comment_set.forEach((comment) => {
      count += comment.recomments_count;
    });
    return count;
  }

  function removeHtmlTags(str) {
    if (str && typeof str === "string") {
      return str.replace(/<[^>]*>/g, "");
    } else {
      return "";
    }
  }

  const pageNumbers = Array.from(
    { length: totalPages },
    (_, index) => index + 1
  );

  let startIndex;

  if (currentPage > totalPages - 5) {
    startIndex = Math.max(0, totalPages - 5);
  } else {
    startIndex = Math.max(0, currentPage - 1);
  }

  const endIndex = Math.min(startIndex + 5, pageNumbers.length);

  const visiblePageNumbers = pageNumbers.slice(startIndex, endIndex);

  function handlePageChange(page) {
    setCurrentPage(page);
  }

  function previousPage() {
    setCurrentPage((prev) => prev - 1);
  }

  function nextPage() {
    setCurrentPage((prev) => prev + 1);
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
                    {removeHtmlTags(board.content)}
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
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={previousPage}
              disabled={currentPage === 1}
              className={cls(
                "relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50",
                currentPage === 1 ? "bg-gray-200 hover:bg-gray-200" : null
              )}
            >
              Previous
            </button>
            <button
              onClick={nextPage}
              disabled={currentPage === totalPages}
              className={cls(
                "relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50",
                currentPage === totalPages
                  ? "bg-gray-200 hover:bg-gray-200"
                  : null
              )}
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-center">
            <div>
              <nav
                className="isolate inline-flex -space-x-px rounded-md shadow-sm"
                aria-label="Pagination"
              >
                <button
                  onClick={previousPage}
                  disabled={currentPage === 1}
                  className={cls(
                    "relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0",
                    currentPage === 1 ? "bg-gray-200 hover:bg-gray-200" : null
                  )}
                >
                  <span className="sr-only">Previous</span>
                  <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                </button>

                {visiblePageNumbers.map((v, index) => (
                  <button
                    key={index}
                    onClick={() => handlePageChange(v)}
                    className={
                      currentPage === v
                        ? "relative z-10 inline-flex items-center bg-indigo-600 px-4 py-2 text-sm font-semibold text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                        : "relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                    }
                  >
                    {v}
                  </button>
                ))}

                <button
                  onClick={nextPage}
                  disabled={currentPage === totalPages}
                  className={cls(
                    "relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0",
                    currentPage === totalPages
                      ? "bg-gray-200 hover:bg-gray-200"
                      : null
                  )}
                >
                  <span className="sr-only">Next</span>
                  <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Homepage;
