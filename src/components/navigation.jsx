// navigation.jsx
import React, { useState } from "react";
//import "./navigation.css"; // 可选，单独抽离样式

export default function Navigation() {
  const [active, setActive] = useState("home");

  const navItems = [
    { key: "home", label: "Home" },
    { key: "community", label: "Community" },
    { key: "profile", label: "Profile" },
  ];

  return (
    <nav className="nav">
      <div className="nav-inner">
        {/* Logo */}
        <div className="logo">
          <div className="logo-mark">∞</div>
          <span className="brand">MySite</span>
        </div>

        {/* 导航按钮 */}
        <div className="tabs">
          {navItems.map((item) => (
            <button
              key={item.key}
              className={`tab-btn ${active === item.key ? "active" : ""}`}
              onClick={() => setActive(item.key)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
