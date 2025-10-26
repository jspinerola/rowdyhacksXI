import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom"; // 1. Import useNavigate

export default function Auth() {
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate(); // 2. Get the navigate function
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setNotice(null);

    try {
      if (isRegistering) {
        await signUp(email, password);
        // Show a notice on successful sign up
        setNotice("Success! Please check your email to verify your account.");
      } else {
        await signIn(email, password);
        // 3. Navigate to homepage on successful sign in
        navigate("/");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>{isRegistering ? "Register" : "Sign In"}</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          {loading ? "Loading..." : isRegistering ? "Register" : "Sign In"}
        </button>
      </form>

      {/* Show error or notice messages */}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {notice && <p style={{ color: "green" }}>{notice}</p>}

      <button
        onClick={() => {
          setIsRegistering(!isRegistering);
          setError(null); // Clear messages when switching forms
          setNotice(null);
        }}
        disabled={loading}
      >
        {isRegistering
          ? "Already have an account? Sign In"
          : "Don't have an account? Register"}
      </button>
    </div>
  );
}
