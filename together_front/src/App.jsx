import { BrowserRouter, Route, Routes } from "react-router-dom";

import { AuthContextProvider } from "./contexts/AuthContext";
import { NotificationContextProvider } from "./contexts/NotificationContext";
import { ProtectedRoute } from "./utils/ProtectedRoute";
import Navbar from "./components/Navbar";
import Chatting from "./pages/Chatting";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import routes from "./routes";
import Together from "./pages/Together";
import Conversations from "./pages/Conversations";
import BoardEditer from "./pages/BoardEditer";
import Board from "./pages/Board";
import BoardModifier from "./pages/BoardModifier";
import MyPage from "./pages/MyPage";
import MyInfo from "./pages/MyInfo";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path={routes.index}
          element={
            <AuthContextProvider>
              <NotificationContextProvider>
                <Navbar />
              </NotificationContextProvider>
            </AuthContextProvider>
          }
        >
          <Route
            path={routes.newBoard}
            element={
              <ProtectedRoute>
                <BoardEditer />
              </ProtectedRoute>
            }
          />
          <Route
            path={routes.boardModifier}
            element={
              <ProtectedRoute>
                <BoardModifier />
              </ProtectedRoute>
            }
          />
          <Route path={routes.homepage} element={<Together />} />
          <Route path={routes.boardDetail} element={<Board />} />
          <Route path={routes.notfound} element={<NotFound />} />
          <Route
            path={routes.chatting}
            element={
              <ProtectedRoute>
                <Chatting />
              </ProtectedRoute>
            }
          />
          <Route
            path={routes.conversations}
            element={
              <ProtectedRoute>
                <Conversations />
              </ProtectedRoute>
            }
          />
          <Route
            path={routes.mypage}
            element={
              <ProtectedRoute>
                <MyPage />
              </ProtectedRoute>
            }
          />
          <Route
            path={routes.myinfo}
            element={
              <ProtectedRoute>
                <MyInfo />
              </ProtectedRoute>
            }
          />
          <Route path={routes.login} element={<Login />} />
          <Route path={routes.signup} element={<Signup />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
