import { useContext } from "react";
import { Link, Outlet } from "react-router-dom";

import { AuthContext } from "../contexts/AuthContext";

function Navbar() {
  const { user, logout } = useContext(AuthContext);

  return (
    <>
      <nav className="bg-white border-gray-200 px-4 sm:px-6 py-2.5 rounded dark:bg-gray-800">
        <div className="max-w-5xl mx-auto flex flex-wrap justify-between items-center">
          <Link to="/" className="flex items-center">
            <span className="self-center text-xl font-semibold whitespace-nowrap dark:text-white">
              같이갈래?
            </span>
          </Link>
          <div className="hidden w-full md:block md:w-auto" id="mobile-menu">
            <ul className="flex flex-col mt-4 md:flex-row md:space-x-8 md:mt-0 md:text-sm md:font-medium">
              <li>
                <Link
                  to="/"
                  className="block py-2 pr-4 pl-3 text-white md:p-0 dark:text-white"
                  aria-current="page"
                >
                  Chats
                </Link>
              </li>
              {!user ? (
                <>
                  <li>
                    <Link
                      to="/login"
                      className="block py-2 pr-4 pl-3 text-white md:p-0 dark:text-white"
                    >
                      Login
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/signup"
                      className="block py-2 pr-4 pl-3 text-white md:p-0 dark:text-white"
                    >
                      Signup
                    </Link>
                  </li>
                </>
              ) : (
                <>
                  <span className="text-white">Logged in</span>
                  <button
                    className="block py-2 pr-4 pl-3 text-white md:p-0 dark:text-white"
                    onClick={logout}
                  >
                    Logout
                  </button>
                </>
              )}
            </ul>
          </div>
        </div>
      </nav>
      <div className="max-w-5xl mx-auto py-6">
        <Outlet />
      </div>
    </>
  );
}

export default Navbar;
