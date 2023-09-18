import Navbar from "./uiux/Navbar";

function Layout({ children }) {
  return (
    <>
      <Navbar />
      <div className="max-w-5xl mx-auto py-6">{children}</div>
    </>
  );
}

export default Layout;
