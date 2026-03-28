import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { getProjectsByUser } from "../services/api";
import type { ProjectDto } from "../types/api";
import StatusBadge from "../components/StatusBadge";

export default function DashboardPage() {
  const { auth } = useAuth();
  const [projects, setProjects] = useState<ProjectDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) return;
    getProjectsByUser(auth.userId)
      .then(setProjects)
      .finally(() => setLoading(false));
  }, [auth]);

  const stats = {
    total: projects.length,
    generated: projects.filter((p) => p.status === "Generated").length,
    generating: projects.filter((p) => p.status === "Generating").length,
    failed: projects.filter((p) => p.status === "Failed").length,
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-base-content">
            Welcome, {auth?.fullName?.split(" ")[0]} 👋
          </h1>
          <p className="text-base-content/60 mt-1">{auth?.email}</p>
        </div>
        <Link to="/projects/new" className="btn btn-primary gap-2">
          <span>+</span> New Project
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Projects",
            value: stats.total,
            cls: "bg-primary/10 text-primary",
          },
          {
            label: "Generated",
            value: stats.generated,
            cls: "bg-success/10 text-success",
          },
          {
            label: "Generating",
            value: stats.generating,
            cls: "bg-warning/10 text-warning",
          },
          {
            label: "Failed",
            value: stats.failed,
            cls: "bg-error/10 text-error",
          },
        ].map(({ label, value, cls }) => (
          <div key={label} className="stat bg-base-100 rounded-2xl shadow-sm">
            <div className={`stat-value text-4xl font-extrabold ${cls}`}>
              {value}
            </div>
            <div className="stat-desc text-base-content/60 text-sm mt-1">
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* Recent Projects */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Recent Projects</h2>
          <Link to="/projects" className="btn btn-ghost btn-sm">
            View all →
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg text-primary" />
          </div>
        ) : projects.length === 0 ? (
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body items-center text-center py-12">
              <span className="text-5xl">🛠️</span>
              <h3 className="card-title mt-4">No projects yet</h3>
              <p className="text-base-content/60">
                Generate your first AI-powered project now.
              </p>
              <Link to="/projects/new" className="btn btn-primary mt-4">
                Create Project
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {projects.slice(0, 6).map((p) => (
              <Link
                key={p.id}
                to={`/projects/${p.id}`}
                className="card bg-base-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="card-body gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="card-title text-base line-clamp-1">
                      {p.name}
                    </h3>
                    <StatusBadge status={p.status} />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="badge badge-ghost badge-sm">
                      {p.siteType}
                    </span>
                    {p.designFramework && (
                      <span className="badge badge-ghost badge-sm">
                        {p.designFramework}
                      </span>
                    )}
                    {p.theme && (
                      <span className="badge badge-ghost badge-sm">
                        {p.theme}
                      </span>
                    )}
                  </div>
                  {p.generatedAt && (
                    <p className="text-xs text-base-content/40">
                      Generated {new Date(p.generatedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
