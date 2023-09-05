import { BrowserRouter, Route, Routes } from "react-router-dom";

import { AuthContextProvider } from "./contexts/AuthContext";
import Navbar from "./components/Navbar";
import Chattings from "./pages/Chattings";
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
          <Route path="" element={<Chattings />} />
          <Route path={routes.login} element={<Login />} />
          <Route path={routes.signup} element={<Signup />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
