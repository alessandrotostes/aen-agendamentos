export default function StatsCard({
  title,
  value,
  icon,
  color = "teal",
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color?: "teal" | "indigo" | "emerald" | "cyan" | "purple";
}) {
  const colorClasses = {
    teal: "bg-gradient-to-br from-teal-50 to-teal-200 text-teal-600 border-teal-200",
    indigo:
      "bg-gradient-to-br from-indigo-50 to-indigo-200 text-indigo-600 border-indigo-200",
    emerald:
      "bg-gradient-to-br from-emerald-50 to-emerald-200 text-emerald-600 border-emerald-200",
    cyan: "bg-gradient-to-br from-cyan-50 to-cyan-200 text-cyan-600 border-cyan-200",
    purple:
      "bg-gradient-to-br from-purple-50 to-purple-200 text-purple-600 border-purple-200",
  };
  return (
    <div
      className={`bg-white rounded-xl shadow-sm border p-6 ${colorClasses[color]}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className="w-12 h-12 flex items-center justify-center">{icon}</div>
      </div>
    </div>
  );
}
