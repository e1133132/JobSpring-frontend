import React, { useEffect, useState } from "react";
import "../../App.css";
import jobSpringLogo from "../../assets/jobspringt.png";
import { NavLink } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";
import {logout} from "../../services/authService";

export default function Profile() {
    // input 的 state
    const [form, setForm] = useState({
        summary: "",
        school: "",
        degree: "",
        major: "",
        gpa: "",
        company: "",
        title: "",
        achievements: "",
        skill: "",
    });

    // 日期单独 state（存储为 Date 对象）
    const [startDateSchool, setStartDateSchool] = useState(null);
    const [endDateSchool, setEndDateSchool] = useState(null);
    const [startDateWork, setStartDateWork] = useState(null);
    const [endDateWork, setEndDateWork] = useState(null);
    const [isAuthed, setIsAuthed] = useState(false);
    // select 单独 state
    const [visibility, setVisibility] = useState("2");
    const [level, setLevel] = useState("3");
    const [skillsList, setSkillsList] = useState([]);

    // 初始化时请求后端数据
    useEffect(() => {
        checklogin();
        const fetchProfile = async () => {
            try {
                const response = await axios.get("/api/profile", {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": "Bearer dummy-jwt-token" // 需要换成登录后保存的 token
                    }
                });

                const data = response.data;

                // 填充表单数据
                setForm({
                    summary: data.profile?.summary || "",
                    school: data.education?.[0]?.school || "",
                    degree: data.education?.[0]?.degree || "",
                    major: data.education?.[0]?.major || "",
                    gpa: data.education?.[0]?.gpa?.toString() || "",
                    company: data.experience?.[0]?.company || "",
                    title: data.experience?.[0]?.title || "",
                    achievements: data.experience?.[0]?.achievements || "",
                    skill: data.skills?.[0]?.skill_name || "",
                });

                // 日期转为 Date 对象
                setStartDateSchool(data.education?.[0]?.start_date ? new Date(data.education[0].start_date) : null);
                setEndDateSchool(data.education?.[0]?.end_date ? new Date(data.education[0].end_date) : null);
                setStartDateWork(data.experience?.[0]?.start_date ? new Date(data.experience[0].start_date) : null);
                setEndDateWork(data.experience?.[0]?.end_date ? new Date(data.experience[0].end_date) : null);

                // 下拉选择框
                setVisibility(data.profile?.visibility?.toString() || "2");
                setLevel(data.skills?.[0]?.level?.toString() || "3");
            } catch (error) {
                console.error("Failed to fetch profile:", error);
            }
        };

        fetchProfile();
    }, []);

          const logoutt = async () => {
            logout();
            window.location.reload();
          };
        
            const checklogin = async () => {
            if (!localStorage.getItem("jobspring_token")) {
              setIsAuthed(false);
            }
            else{setIsAuthed(true);}
          };

    useEffect(() => {
        const fetchSkills = async () => {
            try {
                const response = await axios.get("/api/skills", {
                    headers: {
                        "Content-Type": "application/json"
                    }
                });
                setSkillsList(response.data);
            } catch (error) {
                console.error("Failed to fetch skills:", error);
            }
        };

        fetchSkills();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // 构造请求体
        const payload = {
            profile: {
                summary: form.summary,
                visibility: parseInt(visibility, 10),
                file_url: null,
            },
            education: [
                {
                    school: form.school,
                    degree: form.degree,
                    major: form.major,
                    start_date: startDateSchool ? startDateSchool.toISOString().split("T")[0] : null,
                    end_date: endDateSchool ? endDateSchool.toISOString().split("T")[0] : null,
                    gpa: form.gpa ? parseFloat(form.gpa) : null,
                    description: "Focused on software engineering and AI-related courses.",
                },
            ],
            experience: [
                {
                    company: form.company,
                    title: form.title,
                    start_date: startDateWork ? startDateWork.toISOString().split("T")[0] : null,
                    end_date: endDateWork ? endDateWork.toISOString().split("T")[0] : null,
                    description: "Designed and optimized APIs with ASP.NET and SQL Server.",
                    achievements: form.achievements,
                },
            ],
            skills: [
                {
                    skill_id: null,
                    skill_name: form.skill,
                    level: parseInt(level, 10),
                    years: null,
                },
            ],
        };

        try {
            const response = await axios.post("/api/profile", payload, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer dummy-jwt-token"
                },
            });

            console.log("Success:", response.data);
            alert("Profile Submitted Successfully!");
        } catch (error) {
            console.error("Error submitting profile:", error);
            alert("Failed to submit profile, check console for details.");
        }
    };

    return (
        <div className="app-root">
           
            <nav className="nav">
                <div className="nav-inner">
                    <div className="logo">
                        <img
                            src={jobSpringLogo}
                            alt="JobSpring Logo"
                            style={{ width: "260px", height: "auto" }}
                        />
                    </div>
                    <div className="spacer" />
                     <div className="tabs" role="tablist" aria-label="Primary">
                                {(isAuthed
                              ? [
                                  { key: "home", label: "Home", to: "/home" },
                                  { key: "community", label: "Community", to: "/community" },
                                  { key: "profile", label: "Profile", to: "/profile" },
                                  { key: "logout", label: "logout", action: "logoutt" },
                                ]
                              : [
                                  { key: "home", label: "Home", to: "/home" },
                                  { key: "community", label: "Community", to: "/community" },
                                  { key: "login", label: "Login", to: "/auth/login" },
                                  { key: "register", label: "Register", to: "/auth/register" },
                                ]).map((t) =>  t.action === "logoutt" ?(
                                  <button
                                  key={t.key}
                                  type="button"
                                  className="tab-btn"
                                  onClick={() => logoutt()}        
                                >
                                  {t.label}
                                </button>
                              ) : (
                                <NavLink
                                  key={t.key}
                                  to={t.to}
                                  className={({ isActive }) => `tab-btn ${isActive ? "active" : ""}`}
                                >
                                  {t.label}
                                </NavLink>
                              ))}
                              </div>
                </div>
            </nav>

            {/* 表单内容 */}
            <main
                className="section"
                style={{ display: "flex", justifyContent: "center", paddingTop: "40px" }}
            >
                <div style={{ width: "100%", maxWidth: "600px" }}>
                    <form
                        id="profileForm"
                        className="card"
                        onSubmit={handleSubmit}
                        style={{
                            width: "100%",
                            display: "flex",
                            flexDirection: "column",
                            gap: "16px",
                            padding: "20px",
                        }}
                    >
                        <h2 style={{marginBottom: "10px"}}>Profile</h2>

                        {/* Summary */}
                        <label className="muted">Summary</label>
                        <textarea
                            className="search-input"
                            name="summary"
                            rows={4}
                            value={form.summary}
                            onChange={handleChange}
                            placeholder="Please enter your profile summary"
                        />

                        {/* Visibility */}
                        <label className="muted">Visibility</label>
                        <select
                            className="select"
                            value={visibility}
                            onChange={(e) => setVisibility(e.target.value)}
                        >
                            <option value="0">Private</option>
                            <option value="1">Company Only</option>
                            <option value="2">Public</option>
                        </select>

                        {/* Education */}
                        <h3 style={{marginTop: "20px"}}>Education</h3>
                        <label className="muted">School</label>
                        <input
                            className="search-input"
                            name="school"
                            value={form.school}
                            onChange={handleChange}
                            placeholder="School name"
                        />
                        <label className="muted">Degree</label>
                        <input
                            className="search-input"
                            name="degree"
                            value={form.degree}
                            onChange={handleChange}
                            placeholder="Degree"
                        />
                        <label className="muted">Major</label>
                        <input
                            className="search-input"
                            name="major"
                            value={form.major}
                            onChange={handleChange}
                            placeholder="Please fill in the names of your main course"
                        />
                        <label className="muted">Start Date</label>
                        <DatePicker
                            selected={startDateSchool}
                            onChange={(date) => setStartDateSchool(date)}
                            className="search-input"
                            dateFormat="yyyy-MM-dd"
                            placeholderText="Select start date"
                        />
                        <label className="muted">End Date</label>
                        <DatePicker
                            selected={endDateSchool}
                            onChange={(date) => setEndDateSchool(date)}
                            className="search-input"
                            dateFormat="yyyy-MM-dd"
                            placeholderText="Select end date"
                        />
                        <label className="muted">GPA</label>
                        <input
                            type="number"
                            step="0.01"
                            className="search-input"
                            name="gpa"
                            value={form.gpa}
                            onChange={handleChange}
                            placeholder="e.g. 3.80"
                        />

                        {/* Experience */}
                        <h3 style={{marginTop: "20px"}}>Experience</h3>
                        <label className="muted">Company</label>
                        <input
                            className="search-input"
                            name="company"
                            value={form.company}
                            onChange={handleChange}
                            placeholder="Company name"
                        />
                        <label className="muted">Title</label>
                        <input
                            className="search-input"
                            name="title"
                            value={form.title}
                            onChange={handleChange}
                            placeholder="Job Title"
                        />
                        <label className="muted">Start Date</label>
                        <DatePicker
                            selected={startDateWork}
                            onChange={(date) => setStartDateWork(date)}
                            className="search-input"
                            dateFormat="yyyy-MM-dd"
                            placeholderText="Select start date"
                        />
                        <label className="muted">End Date</label>
                        <DatePicker
                            selected={endDateWork}
                            onChange={(date) => setEndDateWork(date)}
                            className="search-input"
                            dateFormat="yyyy-MM-dd"
                            placeholderText="Select end date"
                        />
                        <label className="muted">Achievements</label>
                        <textarea
                            className="search-input"
                            name="achievements"
                            rows={3}
                            value={form.achievements}
                            onChange={handleChange}
                            placeholder="List your key achievements"
                        />

                        {/* Skills */}
                        <h3 style={{marginTop: "20px"}}>Skills</h3>
                        <label className="muted">Skill</label>
                        <select
                            className="select"
                            name="skill"
                            value={form.skill}
                            onChange={handleChange}
                        >
                            <option value="">-- Select a Skill --</option>
                            {["Backend", "Frontend", "Database", "DevOps", "Cloud", "Tools", "CI/CD", "System", "Methodology"].map(cat => (
                                <optgroup key={cat} label={cat}>
                                    {(Array.isArray(skillsList) ? skillsList : [])
                                        .filter(s => s.category === cat)
                                        .map(s => (
                                            <option key={s.name} value={s.name}>{s.name}</option>
                                        ))}
                                </optgroup>
                            ))}
                        </select>
                        <label className="muted">Level</label>
                        <select
                            className="select"
                            value={level}
                            onChange={(e) => setLevel(e.target.value)}
                        >
                            <option value="1">Beginner</option>
                            <option value="2">Intermediate</option>
                            <option value="3">Proficient</option>
                            <option value="4">Advanced</option>
                            <option value="5">Expert</option>
                        </select>
                    </form>

                    {/* Save / Reset buttons 在表单外部 */}
                    <div
                        className="cta"
                        style={{marginTop: "20px", justifyContent: "center"}}
                    >
                        <button type="submit" form="profileForm" className="btn">
                            Save
                        </button>
                        <button
                            type="reset"
                            form="profileForm"
                            className="btn-danger"
                            onClick={() => {
                                setForm({
                                    summary: "",
                                    school: "",
                                    degree: "",
                                    major: "",
                                    gpa: "",
                                    company: "",
                                    title: "",
                                    achievements: "",
                                    skill: "",
                                });
                                setStartDateSchool(null);
                                setEndDateSchool(null);
                                setStartDateWork(null);
                                setEndDateWork(null);
                                setVisibility("2");
                                setLevel("3");
                            }}
                        >
                            Reset
                        </button>
                    </div>
                </div>
            </main>

            <style>{`
        *{box-sizing:border-box}

        /* 顶部导航 */
        .logo{display:flex; align-items:center; gap:10px}
        .logo-mark{width:36px; height:36px; border-radius:10px;
         background:linear-gradient(135deg,var(--accent),var(--accent-2));
          display:grid; place-items:center; box-shadow:var(--shadow)}
        .logo-mark span{font-weight:800; color:#0b1220}
        .brand{font-weight:700; letter-spacing:.3px}
        .spacer{flex:1}
        .tabs{display:flex; gap:10px}
        .tab-btn{
            padding:10px 14px; border-radius:12px;
            border:1px solid var(--border);
            color:#334155; background: transparent; cursor:pointer;
        }
        .tab-btn:hover{
            border-color: rgba(34,197,94,.45); color:#111827;
        }
        .tab-btn.active{
            background: rgba(34,197,94,.12);
            border-color: rgba(34,197,94,.45);
            color:#065f46;
            box-shadow: var(--ring);
        }
        .muted{color:var(--muted); font-size:14px}
        .cta{margin-top:auto; display:flex; gap:12px}

        /* Save 按钮绿色 */
        .btn {
          height: 46px;
          padding: 0 16px;
          border-radius: 12px;
          border: 0;
          background: linear-gradient(135deg, var(--accent), var(--accent-2));
          color: #042f2e;
          font-weight: 800;
          cursor: pointer;
        }
        .btn:hover { filter: brightness(1.05); }

        /* Reset 按钮红色 */
        .btn-danger {
          height: 46px;
          padding: 0 16px;
          border-radius: 12px;
          border: 0;
          background: linear-gradient(135deg, #f87171, #dc2626);
          color: #fff;
          font-weight: 800;
          cursor: pointer;
        }
        .btn-danger:hover { filter: brightness(1.05); }

        /* 表单输入框和下拉框统一宽度 */
        .search-input,
        .select {
            width: 100%;
            max-width: 100%;
            height: 40px;
            padding: 0 12px;
            border: 1px solid var(--border);
            border-radius: 12px;
            box-sizing: border-box;
        }

        textarea.search-input {
            min-height: 100px;
            resize: vertical;
        }
      `}</style>

            <footer
                className="section"
                style={{ paddingBottom: 40, textAlign: "center" }}
            >
                <div className="muted">
                    © {new Date().getFullYear()} MySite. All rights reserved.
                </div>
            </footer>
        </div>
    );
}
