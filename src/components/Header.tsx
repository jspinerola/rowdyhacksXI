import { useAuth } from "@/context/AuthContext";
import React from "react";
import { Link } from "react-router-dom";

const Header: React.FC = () => {
  const { profile } = useAuth();
  console.log("Profile in Header:", profile);
  const { signOut } = useAuth();

  return (
    <header style={{ padding: 16, borderBottom: "1px solid #e5e7eb" }}>
      <nav className="flex justify-between">
        <strong>Budget It</strong>
        <div className="flex gap-8">
          <p style={{ marginRight: 12 }}>
            {profile ? `Hi, ${profile.username}` : "Signed out"}
          </p>

          {profile ? (
            <button onClick={signOut} aria-label="Sign out">
              Sign out
            </button>
          ) : (
            <Link to="/auth">Sign in</Link>
          )}
          <Link to="/">Home</Link>
        </div>
      </nav>
    </header>
  );
};

export default Header;
