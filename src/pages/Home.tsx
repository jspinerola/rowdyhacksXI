import Events from "@/components/Events";
import { useAuth } from "@/context/AuthContext";
import React, { useContext } from "react";

function Home() {
  const { profile } = useAuth();
  console.log("Profile in Home:", profile?.organizations?.link);
  return (
    <div>
      {profile ? (
        <h1>
          Welcome back, {profile.username}! Here are{" "}
          {profile.organizations?.name}'s events:
        </h1>
      ) : (
        <h1>Welcome to Budget It! Please sign in.</h1>
      )}

      <Events organizationLink={profile?.organizations?.link} />
    </div>
  );
}

export default Home;
