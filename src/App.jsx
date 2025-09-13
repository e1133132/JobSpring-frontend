import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import Home from "./components/home";
import Navigation from "./components/navigation";
import Register from "./pages/auth/Register";
import Login from "./pages/auth/Login";

function App() {
    return (
        <Router>
            <Navigation/>
            <Routes>
                <Route path="/" element={<Home/>}/>
                <Route path="/auth/register" element={<Register/>}/>
                <Route path="/auth/login" element={<Login/>}/>
            </Routes>
        </Router>
    );
}

export default App;
