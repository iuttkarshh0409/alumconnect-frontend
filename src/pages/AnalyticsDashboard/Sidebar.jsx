import { NavLink } from "react-router-dom";

const Sidebar = () => {
  const links = [
    { name: "Overview", path: "/admin/analytics/overview" },
    { name: "Employment", path: "/admin/analytics/employment" },
    { name: "Industry", path: "/admin/analytics/industry" },
    { name: "Progression", path: "/admin/analytics/progression" },
    { name: "Programs", path: "/admin/analytics/programs" },
    { name: "Trends", path: "/admin/analytics/trends" },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 p-4">
      <h3 className="font-serif text-lg font-bold text-[#002147] mb-6">
        Analytics
      </h3>

      <nav className="space-y-2">
        {links.map(link => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) =>
              `block px-3 py-2 rounded-md text-sm font-medium ${
                isActive
                  ? "bg-[#002147] text-white"
                  : "text-slate-700 hover:bg-slate-100"
              }`
            }
          >
            {link.name}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
