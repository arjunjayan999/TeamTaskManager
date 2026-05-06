import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getDashboardStats, getProjects } from '../lib/api';
import { Spinner } from "../components/ui/spinner";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

 useEffect(() => {
    Promise.all([getDashboardStats(), getProjects()])
      .then(([s, p]) => { setStats(s); setProjects(p); })
      .finally(() => setLoading(false));
  }, []);

    if (loading) {
    return (
      <div className="p-8 flex items-center gap-2 text-sm text-gray-400">
        <Spinner /> Loading...
      </div>
    );
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-xl font-medium mb-1">Dashboard</h1>
      <p className="text-sm text-gray-400 mb-8">Welcome back, {user.username}</p>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 mb-10 sm:grid-cols-4">
        <StatCard label="Total tasks" value={stats?.total} />
        <StatCard label="Completed" value={stats?.completed} accent="text-green-600" />
        <StatCard label="Pending" value={stats?.pending} />
        <StatCard label="Overdue" value={stats?.overdue} accent="text-red-500" />
      </div>

      {/* Recent projects */}
      <h2 className="text-sm font-medium mb-3">Projects</h2>
      <div className="space-y-2">
        {projects.slice(0, 5).map(project => {
          const total = project.tasks.length;
          const done = project.tasks.filter(t => t.status === 'DONE').length;
          const pct = total === 0 ? 0 : Math.round((done / total) * 100);

          return (
            <div
              key={project.id}
              onClick={() => navigate(`/projects/${project.id}`)}
              className="flex items-center justify-between border border-gray-200 rounded-lg px-4 py-3 cursor-pointer hover:border-gray-400 transition-colors"
            >
              <div className="flex-1 min-w-0 mr-4">
                <p className="text-sm truncate">{project.title}</p>
                <div className="mt-1.5 h-1 bg-gray-100 rounded-full">
                  <div
                    className="h-1 bg-gray-900 rounded-full"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
              <span className="text-xs text-gray-400 shrink-0">{done}/{total}</span>
            </div>
          );
        })}
        {projects.length === 0 && (
          <p className="text-sm text-gray-300">No projects yet.</p>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, accent = 'text-gray-900' }) {
  return (
    <div className="border border-gray-200 rounded-lg px-4 py-4 bg-white">
      <p className={`text-2xl font-medium ${accent}`}>
        {value ?? '—'}
      </p>
      <p className="text-xs text-gray-400 mt-1">{label}</p>
    </div>
  );
}