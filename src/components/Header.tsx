import { useAuth } from "@/context/AuthContext";
import React from "react";
import { Link } from "react-router-dom";

const Header: React.FC = () => {
  const { profile } = useAuth();
  console.log("Profile in Header:", profile);

  return (
    <header style={{ padding: 16, borderBottom: "1px solid #e5e7eb" }}>
      <nav style={{ display: "flex", gap: 12 }}>
        <h1>{profile?.username}</h1>
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
      </nav>
    </header>
  );
};

export default Header;
