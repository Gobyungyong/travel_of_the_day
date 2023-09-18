import Navbar from "./uiux/Navbar";
import { NotificationContextProvider } from "../contexts/NotificationContext";

function Layout({ children }) {
  return (
    <NotificationContextProvider>
      <Navbar />
      <div className="max-w-5xl mx-auto py-6">{children}</div>
    </NotificationContextProvider>
  );
}

export default Layout;
