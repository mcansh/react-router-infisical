import clsx from "clsx";
import { NavLink, Outlet } from "react-router";

export default function Layout() {
  return (
    <div>
      <nav>
        <ul className="flex justify-center space-x-4">
          <li>
            <NavLink
              to="/"
              className={({ isActive }) => {
                return clsx("font-bold", isActive ? "text-pink-400" : "");
              }}
            >
              Home
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/page-2"
              className={({ isActive }) => {
                return clsx("font-bold", isActive ? "text-pink-400" : "");
              }}
            >
              Page 2
            </NavLink>
          </li>
        </ul>
      </nav>

      <div className="pt-4">
        <Outlet />
      </div>
    </div>
  );
}
