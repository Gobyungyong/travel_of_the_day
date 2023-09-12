// import { useContext, useState } from "react";
// import { Link, Outlet } from "react-router-dom";

// import { AuthContext } from "../contexts/AuthContext";
// import { NotificationContext } from "../contexts/NotificationContext";
// import routes from "../routes";
// import { cls } from "../utils/ClassUtil";

// function Navbar() {
//   const { user, logout: Logout } = useContext(AuthContext);
//   const { unreadMessageCount, connectionStatus } =
//     useContext(NotificationContext);
//   const [isOpen, setIsOpen] = useState(false);

//   function buttonClickHandler() {
//     setIsOpen((prev) => !prev);
//   }

//   function logout() {
//     setIsOpen((prev) => !prev);
//     Logout();
//   }

//   return (
//     <>
//       <nav
//         className={cls(
//           "bg-white md:border-gray-300 px-4 md:border-b sm:px-6 py-2.5 rounded dark:bg-gray-800",
//           isOpen ? null : "border-gray-300 border-b"
//         )}
//       >
//         <div className="max-w-5xl mx-auto flex flex-wrap justify-between items-center">
//           <Link to="/" className="flex items-center">
//             <span className="self-center text-2xl md:text-xl font-semibold whitespace-nowrap dark:text-white">
//               Travel_Together
//             </span>
//           </Link>
//           <button
//             data-collapse-toggle="mobile-menu"
//             type="button"
//             className="inline-flex items-center p-2 ml-3 text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
//             aria-controls="mobile-menu"
//             aria-expanded="false"
//             onClick={buttonClickHandler}
//           >
//             <span className="sr-only">Open main menu</span>
//             <svg
//               className="w-7 h-7"
//               fill="currentColor"
//               viewBox="0 0 20 20"
//               xmlns="http://www.w3.org/2000/svg"
//             >
//               <path
//                 fillRule="evenodd"
//                 d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
//                 clipRule="evenodd"
//               ></path>
//             </svg>
//             <svg
//               className="hidden w-6 h-6"
//               fill="currentColor"
//               viewBox="0 0 20 20"
//               xmlns="http://www.w3.org/2000/svg"
//             >
//               <path
//                 fillRule="evenodd"
//                 d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
//                 clipRule="evenodd"
//               ></path>
//             </svg>
//           </button>
//           <div
//             className={cls(
//               "w-full md:block md:w-auto",
//               isOpen ? null : "hidden"
//             )}
//             id="mobile-menu"
//           >
//             <ul className="divide-y-2 flex flex-col mt-4 border-solid border-2 md:border-0 text-center md:divide-y-0 md:flex-row md:space-x-8 md:mt-0 md:text-sm md:font-medium">
//               <li>
//                 <Link
//                   to={routes.homepage}
//                   className="block py-2 pr-4 pl-3 text-black md:p-0 dark:text-white"
//                   onClick={buttonClickHandler}
//                 >
//                   게시글목록
//                 </Link>
//               </li>
//               {!user ? (
//                 <>
//                   <li>
//                     <Link
//                       to={routes.login}
//                       className="block py-2 pr-4 pl-3 text-black md:p-0 dark:text-white"
//                       onClick={buttonClickHandler}
//                     >
//                       로그인
//                     </Link>
//                   </li>
//                   <li>
//                     <Link
//                       to={routes.signup}
//                       className="block py-2 pr-4 pl-3 text-black md:p-0 dark:text-white"
//                       onClick={buttonClickHandler}
//                     >
//                       회원가입
//                     </Link>
//                   </li>
//                 </>
//               ) : (
//                 <>
//                   <li>
//                     <Link
//                       to={routes.newBoard}
//                       className="block py-2 pr-4 pl-3 text-black md:p-0 dark:text-white"
//                       aria-current="page"
//                       onClick={buttonClickHandler}
//                     >
//                       게시글작성
//                     </Link>
//                   </li>
//                   <li>
//                     <Link
//                       to={routes.conversations}
//                       className="block py-2 pr-4 pl-3 text-black md:p-0 dark:text-white"
//                       onClick={buttonClickHandler}
//                     >
//                       <span>채팅목록</span>
//                       <span>
//                         {unreadMessageCount > 0 && (
//                           <span className="ml-2 inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-400">
//                             <span className="text-xs font-medium leading-none text-white">
//                               {unreadMessageCount}
//                             </span>
//                           </span>
//                         )}
//                       </span>
//                     </Link>
//                   </li>

//                   <button
//                     className="block py-2 pr-4 pl-3 text-black md:p-0 dark:text-white"
//                     onClick={logout}
//                   >
//                     로그아웃
//                   </button>
//                 </>
//               )}
//             </ul>
//           </div>
//         </div>
//       </nav>
//       <div className="max-w-5xl mx-auto py-6">
//         <Outlet />
//       </div>
//     </>
//   );
// }

// export default Navbar;

import { useContext, useState, Fragment } from "react";
import { Link, Outlet } from "react-router-dom";
import { Dialog } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

import { AuthContext } from "../contexts/AuthContext";
import { NotificationContext } from "../contexts/NotificationContext";
import routes from "../routes";

function Navbar() {
  const { user, logout: Logout } = useContext(AuthContext);
  const { unreadMessageCount } = useContext(NotificationContext);
  const [isOpen, setIsOpen] = useState(false);

  function buttonClickHandler() {
    setIsOpen((prev) => !prev);
  }

  function logout() {
    setIsOpen((prev) => !prev);
    Logout();
  }

  return (
    <>
      <header className="bg-white">
        <nav
          className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8"
          aria-label="Global"
        >
          <div className="flex lg:flex-1">
            <Link to="/" className="-m-1.5 p-1.5">
              <span className="self-center text-2xl md:text-xl font-semibold whitespace-nowrap dark:text-white">
                Travel_Together
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
                  to={routes.homepage}
                  className="text-sm font-semibold leading-6 text-gray-900"
                  onClick={buttonClickHandler}
                >
                  게시글목록
                </Link>
                <Link
                  to={routes.login}
                  className="text-sm font-semibold leading-6 text-gray-900"
                  onClick={buttonClickHandler}
                >
                  로그인
                </Link>

                <Link
                  to={routes.signup}
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
                  to={routes.homepage}
                  className="text-sm font-semibold leading-6 text-gray-900"
                  onClick={buttonClickHandler}
                >
                  게시글목록
                </Link>
                <Link
                  to={routes.newBoard}
                  className="text-sm font-semibold leading-6 text-gray-900"
                  aria-current="page"
                  onClick={buttonClickHandler}
                >
                  게시글작성
                </Link>

                <Link
                  to={routes.conversations}
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
              <Link to="/" className="-m-1.5 p-1.5">
                <span className="self-center text-2xl md:text-xl font-semibold whitespace-nowrap dark:text-white">
                  Travel_Together
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
                    to={routes.homepage}
                    className="mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                    onClick={buttonClickHandler}
                  >
                    게시글목록
                  </Link>
                  {!user ? (
                    <>
                      <Link
                        to={routes.login}
                        className="mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                        onClick={buttonClickHandler}
                      >
                        로그인
                      </Link>

                      <Link
                        to={routes.signup}
                        className="mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                        onClick={buttonClickHandler}
                      >
                        회원가입
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link
                        to={routes.newBoard}
                        className="mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                        aria-current="page"
                        onClick={buttonClickHandler}
                      >
                        게시글작성
                      </Link>

                      <Link
                        to={routes.conversations}
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
                    </>
                  )}
                </div>
                {user ? (
                  <div className="py-6">
                    <Link
                      className="mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                      onClick={logout}
                    >
                      로그아웃
                    </Link>
                  </div>
                ) : null}
              </div>
            </div>
          </Dialog.Panel>
        </Dialog>
      </header>
      <div className="max-w-5xl mx-auto py-6">
        <Outlet />
      </div>
    </>
  );
}

export default Navbar;
