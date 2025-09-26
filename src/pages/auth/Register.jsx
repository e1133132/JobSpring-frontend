import {useState} from "react";
import {register, sendVerificationCode} from "../../services/authService";
import {useNavigate} from "react-router-dom";
import React from "react";
import jobSpringLogo from "../../assets/jobspringt.png";

export default function Register() {
    const [form, setForm] = useState({fullName: "", email: "", password: "", code: ""});
    const [msg, setMsg] = useState(null);
    const [cooldown, setCooldown] = useState(0);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm((f) => ({...f, [e.target.name]: e.target.value}));
    };

    const handleSendCode = async () => {
        if (!form.email) {
            setMsg("Please enter email first");
            return;
        }
        try {
            await sendVerificationCode(form.email);
            setMsg("Verification code sent to your email");
            setCooldown(60);
            const timer = setInterval(() => {
                setCooldown((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } catch (error) {
            setMsg(error?.response?.data?.message || "Failed to send code");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await register(form);
            navigate("/auth/login");
        } catch (error) {
            setMsg(error?.response?.data?.message || "Register failed");
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
                transform: "translateY(-30px)"
            }}>
                <h2 style={{
                    textAlign: "center",
                    marginBottom: "1.5rem",
                    color: "#065f46"
                }}>
                    Register
                </h2>

                <form onSubmit={handleSubmit} style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem"
                }}>
                    <input
                        name="fullName"
                        placeholder="Full Name"
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

                    <div style={{display: "flex", gap: "0.5rem"}}>
                        <input name="code" placeholder="Verification Code" onChange={handleChange} style={{flex: 1}}/>
                        <button type="button"
                                onClick={handleSendCode}
                                disabled={cooldown > 0}
                                style={{
                                    padding: "0.75rem",
                                    background: "#f59e0b",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: "8px",
                                    cursor: cooldown > 0 ? "not-allowed" : "pointer"
                                }}>
                            {cooldown > 0 ? `Resend (${cooldown})` : "Send Code"}
                        </button>
                    </div>

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
                    <button
                        type="submit"
                        style={{
                            padding: "0.75rem",
                            background: "#10b981",
                            color: "#fff",
                            border: "none",
                            borderRadius: "8px",
                            cursor: "pointer",
                            fontWeight: "600",
                            transition: "background 0.2s"
                        }}
                        onMouseEnter={(e) => e.target.style.background = "#059669"}
                        onMouseLeave={(e) => e.target.style.background = "#10b981"}
                    >
                        Register
                    </button>
                </form>

                <button
                    onClick={() => navigate("/auth/login")}
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
                    Back to Login
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
