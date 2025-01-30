import { NavLink, Outlet } from "react-router";

export default function Layout() {
  return (
    <div>
      <h1>Layout</h1>
      <nav>
        <ul className="flex space-x-4">
          <li>
            <NavLink
              to="/"
              className={({ isActive }) => {
                return isActive ? "text-blue-400 underline" : "";
              }}
            >
              Home
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/page-2"
              className={({ isActive }) => {
                return isActive ? "text-blue-400 underline" : "";
              }}
            >
              Page 2
            </NavLink>
          </li>
        </ul>
      </nav>

      <Outlet />
    </div>
  );
}
