import { useContext, useState } from "react";
import { Dialog } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { useRouter } from "next/router";

import { AuthContext } from "../../contexts/AuthContext";
import { NotificationContext } from "../../contexts/NotificationContext";
import routes from "../../routes";

function Navbar() {
  const { user, logout: Logout } = useContext(AuthContext);
  const { unreadMessageCount } = useContext(NotificationContext);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  function buttonClickHandler() {
    setIsOpen((prev) => !prev);
  }

  function logout() {
    setIsOpen((prev) => !prev);
    Logout();
    router.replace(routes.homepage);
  }

  return (
    <>
      <header className="bg-white">
        <nav
          className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8"
          aria-label="Global"
        >
          <div className="flex lg:flex-1">
            <Link href={routes.homepage} className="-m-1.5 p-1.5">
              <span className="self-center text-indigo-600 text-2xl md:text-xl font-semibold whitespace-nowrap">
                Travel Of The Day
              </span>
            </Link>
          </div>
          <div className="flex lg:hidden">
            <button
              type="button"
              className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
              onClick={buttonClickHandler}
            >
              <span className="sr-only">Open main menu</span>
              <Bars3Icon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>

          {!user ? (
            <>
              <div className="hidden lg:flex lg:gap-x-12">
                <Link
                  href={routes.homepage}
                  className="text-sm font-semibold leading-6 text-gray-900"
                  onClick={buttonClickHandler}
                >
                  게시글목록
                </Link>
                <Link
                  href={routes.login}
                  className="text-sm font-semibold leading-6 text-gray-900"
                  onClick={buttonClickHandler}
                >
                  로그인
                </Link>

                <Link
                  href={routes.signup}
                  className="text-sm font-semibold leading-6 text-gray-900"
                  onClick={buttonClickHandler}
                >
                  회원가입
                </Link>
              </div>
            </>
          ) : (
            <>
              <div className="hidden lg:flex lg:gap-x-12">
                <Link
                  href={routes.homepage}
                  className="text-sm font-semibold leading-6 text-gray-900"
                  onClick={buttonClickHandler}
                >
                  게시글목록
                </Link>
                <Link
                  href={routes.newBoard}
                  className="text-sm font-semibold leading-6 text-gray-900"
                  aria-current="page"
                  onClick={buttonClickHandler}
                >
                  게시글작성
                </Link>

                <Link
                  href={routes.conversations}
                  className="text-sm font-semibold leading-6 text-gray-900"
                  onClick={buttonClickHandler}
                >
                  <span>채팅목록</span>
                  <span>
                    {unreadMessageCount > 0 && (
                      <span className="ml-2 inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-400">
                        <span className="text-xs font-medium leading-none text-white">
                          {unreadMessageCount}
                        </span>
                      </span>
                    )}
                  </span>
                </Link>
                <Link
                  href={routes.mypage}
                  className="text-sm font-semibold leading-6 text-gray-900"
                  onClick={buttonClickHandler}
                >
                  마이페이지
                </Link>
              </div>
              <div className="hidden lg:flex lg:flex-1 lg:justify-end">
                <button
                  className="text-sm font-semibold leading-6 text-gray-900"
                  onClick={logout}
                >
                  로그아웃
                </button>
                <span aria-hidden="true">&rarr;</span>
              </div>
            </>
          )}
        </nav>
        <Dialog
          as="div"
          className="lg:hidden"
          open={isOpen}
          onClose={setIsOpen}
        >
          <div className="fixed inset-0 z-10" />
          <Dialog.Panel className="fixed inset-y-0 right-0 z-10 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
            <div className="flex items-center justify-between">
              <Link href="/" className="-m-1.5 p-1.5">
                <span className="self-center text-indigo-600 text-2xl md:text-xl font-semibold whitespace-nowrap ">
                  Travel Of The Day
                </span>
              </Link>
              <button
                type="button"
                className="-m-2.5 rounded-md p-2.5 text-gray-700"
                onClick={buttonClickHandler}
              >
                <span className="sr-only">Close menu</span>
                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
            <div className="mt-6 flow-root">
              <div className="-my-6 divide-y divide-gray-500/10">
                <div className="space-y-2 py-6">
                  <Link
                    href={routes.homepage}
                    className="mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                    onClick={buttonClickHandler}
                  >
                    게시글목록
                  </Link>
                  {!user ? (
                    <>
                      <Link
                        href={routes.login}
                        className="mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                        onClick={buttonClickHandler}
                      >
                        로그인
                      </Link>

                      <Link
                        href={routes.signup}
                        className="mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                        onClick={buttonClickHandler}
                      >
                        회원가입
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link
                        href={routes.newBoard}
                        className="mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                        aria-current="page"
                        onClick={buttonClickHandler}
                      >
                        게시글작성
                      </Link>

                      <Link
                        href={routes.conversations}
                        className="mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                        onClick={buttonClickHandler}
                      >
                        <span>채팅목록</span>
                        <span>
                          {unreadMessageCount > 0 && (
                            <span className="ml-2 inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-400">
                              <span className="text-xs font-medium leading-none text-white">
                                {unreadMessageCount}
                              </span>
                            </span>
                          )}
                        </span>
                      </Link>
                      <Link
                        href={routes.mypage}
                        className="mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                        aria-current="page"
                        onClick={buttonClickHandler}
                      >
                        마이페이지
                      </Link>
                    </>
                  )}
                </div>
                {user ? (
                  <div className="py-6">
                    <button
                      className="mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                      onClick={logout}
                    >
                      로그아웃
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </Dialog.Panel>
        </Dialog>
      </header>
    </>
  );
}

export default Navbar;
