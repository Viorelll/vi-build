import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  getProjectsByUser,
  deleteProject,
  downloadProject,
} from "../services/api";
import type { ProjectDto } from "../types/api";
import StatusBadge from "../components/StatusBadge";

export default function ProjectsPage() {
  const { auth, isAdmin } = useAuth();
  const [projects, setProjects] = useState<ProjectDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  const load = () => {
    if (!auth) return;
    setLoading(true);
    getProjectsByUser(auth.userId)
      .then(setProjects)
      .finally(() => setLoading(false));
  };

  useEffect(load, [auth]);

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this project? This action cannot be undone.")) return;
    setDeletingId(id);
    try {
      await deleteProject(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } finally {
      setDeletingId(null);
    }
  };

  const handleDownload = async (project: ProjectDto) => {
    setDownloadingId(project.id);
    try {
      const blob = await downloadProject(project.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${project.name}.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Download failed. The archive may not be ready yet.");
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Projects</h1>
        <Link to="/projects/new" className="btn btn-primary gap-2">
          <span>+</span> New Project
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <span className="loading loading-spinner loading-lg text-primary" />
        </div>
      ) : projects.length === 0 ? (
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body items-center text-center py-16">
            <span className="text-5xl">📁</span>
            <h2 className="card-title mt-4">No projects yet</h2>
            <p className="text-base-content/60">
              Start by generating a new project.
            </p>
            <Link to="/projects/new" className="btn btn-primary mt-4">
              Generate Project
            </Link>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl shadow-sm bg-base-100">
          <table className="table table-zebra">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Type</th>
                <th>Framework</th>
                <th>Theme</th>
                <th>Status</th>
                <th>Generated</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => (
                <tr key={p.id} className="hover">
                  <td className="text-base-content/40 text-xs">{p.id}</td>
                  <td>
                    <Link
                      to={`/projects/${p.id}`}
                      className="font-medium link link-hover link-primary"
                    >
                      {p.name}
                    </Link>
                  </td>
                  <td>
                    <span className="badge badge-ghost badge-sm">
                      {p.siteType}
                    </span>
                  </td>
                  <td className="text-sm">{p.designFramework ?? "—"}</td>
                  <td className="text-sm">{p.theme ?? "—"}</td>
                  <td>
                    <StatusBadge status={p.status} />
                  </td>
                  <td className="text-xs text-base-content/50">
                    {p.generatedAt
                      ? new Date(p.generatedAt).toLocaleDateString()
                      : "—"}
                  </td>
                  <td>
                    <div className="flex justify-end gap-1">
                      <Link
                        to={`/projects/${p.id}`}
                        className="btn btn-ghost btn-xs"
                      >
                        View
                      </Link>
                      {p.status === "Generated" && (
                        <button
                          className="btn btn-success btn-xs gap-1"
                          onClick={() => handleDownload(p)}
                          disabled={downloadingId === p.id}
                        >
                          {downloadingId === p.id ? (
                            <span className="loading loading-spinner loading-xs" />
                          ) : (
                            "⬇"
                          )}
                          Download
                        </button>
                      )}
                      {(isAdmin || auth?.userId === p.userId) && (
                        <button
                          className="btn btn-error btn-xs"
                          onClick={() => handleDelete(p.id)}
                          disabled={deletingId === p.id}
                        >
                          {deletingId === p.id ? (
                            <span className="loading loading-spinner loading-xs" />
                          ) : (
                            "Delete"
                          )}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
