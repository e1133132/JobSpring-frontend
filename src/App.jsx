import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import Home from "./components/job_seeker/home";
import Profile from "./components/job_seeker/profile";
import React from "react";
import AdminDashboard from "./components/admin/dashboard";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home/>}/>
                <Route path="/profile" element={<Profile/>}/>
                <Route path="/admin" element={<AdminDashboard/>}/>
            </Routes>
        </Router>
    );
}

export default App;
