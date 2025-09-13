// navigation.jsx
import React from "react";
//import "./navigation.css"; // 可选，单独抽离样式
import { NavLink } from "react-router-dom";

export default function Navigation() {
  //const [active, setActive] = useState("home");

  const navItems = [
    { key: "home", label: "Home", to: "/" },
    { key: "community", label: "Community", to: "/community" },
    { key: "profile", label: "Profile", to: "/profile" },
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
            <NavLink
              key={item.key}
              to={item.to}
              className={({ isActive }) =>
                  `tab-btn ${isActive ? "active" : ""}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}
