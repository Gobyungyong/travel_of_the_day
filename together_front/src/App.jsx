import { BrowserRouter, Route, Routes } from "react-router-dom";

import { AuthContextProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./utils/ProtectedRoute";
import Navbar from "./components/Navbar";
import Chatting from "./pages/Chatting";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import routes from "./routes";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path={routes.index}
          element={
            <AuthContextProvider>
              <Navbar />
            </AuthContextProvider>
          }
        >
          <Route
            path={routes.chatting}
            element={
              <ProtectedRoute>
                <Chatting />
              </ProtectedRoute>
            }
          />
          {/* <Route
            path={routes.conversations}
            element={
              <ProtectedRoute>
                <Conversations />
              </ProtectedRoute>
            }
          /> */}
          <Route path={routes.login} element={<Login />} />
          <Route path={routes.signup} element={<Signup />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
