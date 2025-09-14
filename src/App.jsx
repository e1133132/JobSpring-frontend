import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import Home from "./components/job_seeker/home";
import Profile from "./components/job_seeker/profile";
import React from "react";
import AdminDashboard from "./components/admin/dashboard";
import Navigation from "./components/navigation";
import Register from "./pages/auth/Register";
import Login from "./pages/auth/Login";

function App() {
    return (
        <Router>
            <Navigation/>
            <Routes>
                <Route path="/" element={<Home/>}/>
                <Route path="/profile" element={<Profile/>}/>
                <Route path="/admin" element={<AdminDashboard/>}/>
                <Route path="/" element={<Home/>}/>
                <Route path="/auth/register" element={<Register/>}/>
                <Route path="/auth/login" element={<Login/>}/>
            </Routes>
        </Router>
    );
}

export default App;
