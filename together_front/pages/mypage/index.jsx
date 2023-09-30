import { useContext, useEffect, useState } from "react";
import Link from "next/link";
import { Avatar } from "@chakra-ui/react";
import { ChatBubbleOvalLeftEllipsisIcon } from "@heroicons/react/24/outline";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/20/solid";
import Image from "next/image";

import { AuthContext } from "../../contexts/AuthContext";
import Loading from "../../components/uiux/Loading";
import routes from "../../routes";
import { ProtectedRoute } from "../../utils/ProtectedRoute";
import { cls } from "../../utils/ClassUtil";
import {
  formatTimestamp,
  commentsCount,
  removeHtmlTags,
} from "../../utils/Funcs";

function MyPage() {
  const [boards, setBoards] = useState(null);
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const { authAxios, user: loggedinUser } = useContext(AuthContext);

  useEffect(() => {
    getMyBoards();
    if (loggedinUser) {
      getUserInfo();
    }
  }, [loggedinUser]);
  useEffect(() => {
    getMyBoards();
  }, [currentPage]);

  async function getMyBoards() {
    const response = await authAxios.get("/api/v1/boards/my_boards/", {
      params: { page: currentPage },
    });
    setBoards(response.data.boards);
    setTotalPages(response.data.total_pages);
  }

  async function getUserInfo() {
    // const res = await authAxios.get("/api/v1/users/myinfo/");
    const res = await authAxios.get("/api/v1/users/rest_auth/user/");
    await setUser(res.data);
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
    <ProtectedRoute>
      <div className="bg-white ">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          {user ? (
            <div className="relative flex items-center gap-x-4">
              <Avatar src={user?.avatar} size="2xl" />
              <div className="text-xl leading-6">
                <p className="font-semibold text-gray-900">{user?.nickname}</p>
                <Link href={routes.myinfo}>
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
                      dateTime={formatTimestamp(board.updated_at).date}
                      className="text-gray-500 flex justify-between w-full"
                    >
                      <div>{formatTimestamp(board.updated_at).date}</div>
                      <div>{formatTimestamp(board.updated_at).hours}</div>
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
                    <Image
                      width={40}
                      height={40}
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
    </ProtectedRoute>
  );
}

export default MyPage;
