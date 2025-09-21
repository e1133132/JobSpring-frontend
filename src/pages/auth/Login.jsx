import {useState} from "react";
import {login} from "../../services/authService";
import {useNavigate} from "react-router-dom";
import React from "react";
import jobSpringLogo from "../../assets/jobspringt.png";

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
            switch (data.user.role) {
                case 0: // Candidate
                    navigate("/home");
                    break;
                case 1: // HR
                    navigate("/hr");
                    break;
                case 2: // Admin
                    navigate("/admin");
                    break;
                default:
                    navigate("/home");
            }
        } catch (error) {
            setMsg(error?.response?.data?.message || "Login failed");
        }
    };

    return (
        <div style={{marginTop: "-20px"}}>
            <div className="logo">
                <img
                    src={jobSpringLogo}
                    alt="JobSpring Logo"
                    style={{width: "260px", height: "auto"}}
                />
            </div>
            <div style={{
                maxWidth: 400,
                margin: "4rem auto",
                padding: "2rem",
                background: "#fafafa",
                borderRadius: "12px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                fontFamily: "Segoe UI, sans-serif",
                transform: "translateY(-25px)"
            }}>

                <h2 style={{
                    textAlign: "center",
                    marginBottom: "1.5rem",
                    color: "#065f46"
                }}>
                    Login
                </h2>

                <form onSubmit={handleSubmit} style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem"
                }}>
                    <input
                        name="email"
                        type="email"
                        placeholder="Email"
                        onChange={handleChange}
                        style={{
                            padding: "0.75rem 1rem",
                            border: "1px solid #d1d5db",
                            borderRadius: "8px",
                            outline: "none",
                            transition: "border-color 0.2s",
                        }}
                        onFocus={(e) => e.target.style.borderColor = "#10b981"}
                        onBlur={(e) => e.target.style.borderColor = "#d1d5db"}
                    />
                    <input
                        name="password"
                        type="password"
                        placeholder="Password"
                        onChange={handleChange}
                        style={{
                            padding: "0.75rem 1rem",
                            border: "1px solid #d1d5db",
                            borderRadius: "8px",
                            outline: "none",
                            transition: "border-color 0.2s",
                        }}
                        onFocus={(e) => e.target.style.borderColor = "#10b981"}
                        onBlur={(e) => e.target.style.borderColor = "#d1d5db"}
                    />
                    <button type="submit" style={{
                        padding: "0.75rem",
                        background: "#10b981",
                        color: "#fff",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontWeight: "600",
                        transition: "background 0.2s"
                    }}
                            onMouseEnter={(e) => e.target.style.background = "#059669"} // hover 深绿
                            onMouseLeave={(e) => e.target.style.background = "#10b981"}
                    >
                        Login
                    </button>
                </form>

                <button
                    onClick={() => navigate("/auth/register")}
                    style={{
                        marginTop: "1rem",
                        width: "100%",
                        padding: "0.75rem",
                        background: "#3b82f6",
                        color: "#fff",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontWeight: "600",
                        transition: "background 0.2s"
                    }}
                    onMouseEnter={(e) => e.target.style.background = "#2563eb"}
                    onMouseLeave={(e) => e.target.style.background = "#3b82f6"}
                >
                    Register
                </button>

                {msg && <p style={{
                    marginTop: "1rem",
                    textAlign: "center",
                    color: msg.includes("success") ? "#065f46" : "#b91c1c"
                }}>{msg}</p>}
            </div>
        </div>
    );

}
