import {BrowserRouter as Router, Routes, Route,Navigate} from "react-router-dom";
import Home from "./components/job_seeker/home";
import Profile from "./components/job_seeker/profile";
import React from "react";
import AdminDashboard from "./components/admin/dashboard";
import Register from "./pages/auth/Register";
import Login from "./pages/auth/Login";
import JobDetail from "./components/job_seeker/jobDetail.jsx";

function App() {
    return (
        <Router>
            <Routes>
                 <Route path="/" element={<Navigate to="/auth/login" replace />} />
                 <Route path="/auth/login" element={<Login/>}/>
                <Route path="/home" element={<Home/>}/>
                <Route path="/profile" element={<Profile/>}/>
                <Route path="/admin" element={<AdminDashboard/>}/>
                <Route path="/auth/register" element={<Register/>}/>
                <Route path="/jobs/:id" element={<JobDetail/>} />
            </Routes>
        </Router>
    );
}

export default App;
