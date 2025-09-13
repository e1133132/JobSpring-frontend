import {useState} from "react";
import {register} from "../../services/authService";
import {useNavigate} from "react-router-dom";

export default function Register() {
    const [form, setForm] = useState({fullName: "", email: "", password: ""});
    const [msg, setMsg] = useState(null);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm((f) => ({...f, [e.target.name]: e.target.value}));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = await register(form);
            localStorage.setItem("jobspring_token", data.token);
            localStorage.setItem("jobspring_user", JSON.stringify(data.user));
            navigate("/");
        } catch (error) {
            setMsg(error?.response?.data?.message || "Register failed");
        }
    };

    return (
        <div style={{maxWidth: 400, margin: "2rem auto"}}>
            <h2>Register</h2>
            <form onSubmit={handleSubmit}>
                <input name="fullName" placeholder="Full Name" onChange={handleChange}/>
                <input name="email" type="email" placeholder="Email" onChange={handleChange}/>
                <input name="password" type="password" placeholder="Password" onChange={handleChange}/>
                <button type="submit">Register</button>
            </form>
            {msg && <p>{msg}</p>}
        </div>
    );
}
