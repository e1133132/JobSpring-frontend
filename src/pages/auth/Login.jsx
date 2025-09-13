import {useState} from "react";
import {login} from "../../services/authService";
import {useNavigate} from "react-router-dom";

export default function Login() {
    const [form, setForm] = useState({email: "", password: ""});
    const [msg, setMsg] = useState(null);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm((f) => ({...f, [e.target.name]: e.target.value}));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = await login(form);
            localStorage.setItem("jobspring_token", data.token);
            localStorage.setItem("jobspring_user", JSON.stringify(data.user));
            navigate("/");
        } catch (error) {
            setMsg(error?.response?.data?.message || "Login failed");
        }
    };

    return (
        <div style={{maxWidth: 400, margin: "2rem auto"}}>
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                <input name="email" type="email" placeholder="Email" onChange={handleChange}/>
                <input name="password" type="password" placeholder="Password" onChange={handleChange}/>
                <button type="submit">Login</button>
            </form>
            {msg && <p>{msg}</p>}
        </div>
    );
}
