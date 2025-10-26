import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Layout from "./components/Layout";
import Auth from "./pages/Auth";
import { AuthProvider } from "./context/AuthContext";
import Event from "./pages/Event";
import CreateEventPlan from "./pages/CreateEventPlan";
import UpdateEventPlan from "./pages/UpdateEventPlan";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="about" element={<About />} />
            <Route path="auth" element={<Auth />} />
            <Route path="event/:id" element={<Event />} />
            <Route
              path="event/:id/create-event-plan"
              element={<CreateEventPlan />}
            />
            <Route
              path="event/:id/edit-event-plan"
              element={<UpdateEventPlan />}
            />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
