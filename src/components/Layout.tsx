import React from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

const Layout: React.FC = () => {
  return (
    <div
      style={{ display: "flex", minHeight: "100vh", flexDirection: "column" }}
    >
      <Header />
      <main style={{ flex: 1, padding: 16 }}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
