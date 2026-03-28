import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { GoogleLogin } from "@react-oauth/google";
import { googleLogin } from "../services/api";

export default function Navbar() {
  const { auth, login, logout } = useAuth();
  const navigate = useNavigate();

  const handleCredential = async (credential: string) => {
    try {
      const result = await googleLogin(credential);
      login(result);
      navigate("/");
    } catch {
      alert("Login failed. Please try again.");
    }
  };

  const navLink = (to: string, label: string) => (
    <li>
      <NavLink
        to={to}
        className={({ isActive }) => (isActive ? "active font-semibold" : "")}
      >
        {label}
      </NavLink>
    </li>
  );

  return (
    <div className="navbar bg-base-100 shadow-sm border-b border-base-200 px-4">
      {/* Logo */}
      <div className="navbar-start">
        <Link to="/" className="btn btn-ghost text-xl font-bold text-primary">
          ViBuild
        </Link>
      </div>

      {/* Center nav */}
      {auth && (
        <div className="navbar-center hidden lg:flex">
          <ul className="menu menu-horizontal px-1 gap-1">
            {navLink("/", "Dashboard")}
            {navLink("/projects", "Projects")}
            {navLink("/features", "Features")}
            {navLink("/mdfiles", "MD Files")}
          </ul>
        </div>
      )}

      {/* End */}
      <div className="navbar-end gap-2">
        {auth ? (
          <div className="dropdown dropdown-end">
            <div
              tabIndex={0}
              role="button"
              className="btn btn-ghost btn-circle avatar"
            >
              <div className="w-9 rounded-full ring ring-primary ring-offset-base-100 ring-offset-1">
                {auth.roles.includes("Admin") ? (
                  <span className="flex items-center justify-center h-full text-base font-bold text-primary-content bg-primary rounded-full">
                    {auth.fullName?.charAt(0).toUpperCase() ?? "A"}
                  </span>
                ) : (
                  <span className="flex items-center justify-center h-full text-base font-bold text-secondary-content bg-secondary rounded-full">
                    {auth.fullName?.charAt(0).toUpperCase() ?? "U"}
                  </span>
                )}
              </div>
            </div>
            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content bg-base-100 rounded-box z-10 mt-3 w-52 p-2 shadow"
            >
              <li className="menu-title px-4 py-2">
                <span className="font-semibold text-base-content">
                  {auth.fullName}
                </span>
                <span className="text-xs text-base-content/60">
                  {auth.email}
                </span>
              </li>
              <li>
                <NavLink to="/profile">Profile</NavLink>
              </li>
              <li>
                <button onClick={logout} className="text-error">
                  Logout
                </button>
              </li>
            </ul>
          </div>
        ) : (
          <GoogleLogin
            onSuccess={(res) => {
              if (res.credential) handleCredential(res.credential);
            }}
            onError={() => alert("Google login failed.")}
            text="signin_with"
            shape="pill"
            size="medium"
          />
        )}
      </div>
    </div>
  );
}
