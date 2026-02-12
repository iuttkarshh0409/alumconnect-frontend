import { Users, Award, BookOpen, TrendingUp } from "lucide-react";

const AdminKPIs = ({ stats }) => {
  // Safe fallback if stats is null/undefined
  const safeStats = {
    total_users: stats?.total_users ?? 0,
    total_alumni: stats?.total_alumni ?? 0,
    total_students: stats?.total_students ?? 0,
    total_requests: stats?.total_requests ?? 0,
  };

  return (
    <div className="grid md:grid-cols-4 gap-6 mb-8">
      <KpiCard
        icon={<Users />}
        label="Total Users"
        value={safeStats.total_users}
      />
      <KpiCard
        icon={<Award />}
        label="Alumni Profiles"
        value={safeStats.total_alumni}
      />
      <KpiCard
        icon={<BookOpen />}
        label="Students"
        value={safeStats.total_students}
      />
      <KpiCard
        icon={<TrendingUp />}
        label="Mentorship Requests"
        value={safeStats.total_requests}
      />
    </div>
  );
};

const KpiCard = ({ icon, label, value }) => (
  <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
    <div className="flex items-center justify-between mb-2">
      {icon}
      <span className="text-3xl font-bold text-[#002147]">{value}</span>
    </div>
    <p className="text-slate-600 font-medium">{label}</p>
  </div>
);

export default AdminKPIs;
