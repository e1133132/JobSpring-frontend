import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/job_seeker/home";
import Navigation from "./components/navigation"; 
import AdminDashboard from "./components/admin/dashboard";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
