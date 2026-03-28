import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import {
  getProjectById,
  getLLMLogsByProject,
  deleteProject,
  downloadProject,
} from "../services/api";
import type { ProjectDto, LLMLogDto } from "../types/api";
import StatusBadge from "../components/StatusBadge";
import { useAuth } from "../contexts/AuthContext";

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { auth, isAdmin } = useAuth();
  const [project, setProject] = useState<ProjectDto | null>(null);
  const [logs, setLogs] = useState<LLMLogDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "logs">("overview");

  const justGenerated = (location.state as { justGenerated?: boolean } | null)
    ?.justGenerated;

  useEffect(() => {
    if (!id) return;
    const numId = Number(id);
    Promise.all([getProjectById(numId), getLLMLogsByProject(numId)])
      .then(([p, l]) => {
        setProject(p);
        setLogs(l);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!project) return;
    if (!confirm("Delete this project? This cannot be undone.")) return;
    await deleteProject(project.id);
    navigate("/projects");
  };

  const handleDownload = async () => {
    if (!project) return;
    setDownloading(true);
    try {
      const blob = await downloadProject(project.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${project.name}.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Download failed.");
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="card bg-base-100 shadow text-center py-16">
        <p className="text-2xl font-bold">Project not found</p>
        <Link to="/projects" className="btn btn-primary mt-4">
          Back to projects
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {justGenerated && (
        <div className="alert alert-success shadow">
          <span>
            🎉 Project generated successfully! You can download the archive
            below.
          </span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl font-bold">{project.name}</h1>
            <StatusBadge status={project.status} />
          </div>
          <p className="text-base-content/50 mt-1 text-sm">
            Project #{project.id} · User #{project.userId}
            {project.generatedAt &&
              ` · Generated ${new Date(project.generatedAt).toLocaleString()}`}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {project.status === "Generated" && (
            <button
              className="btn btn-success gap-2"
              onClick={handleDownload}
              disabled={downloading}
            >
              {downloading ? (
                <span className="loading loading-spinner loading-sm" />
              ) : (
                "⬇"
              )}
              Download ZIP
            </button>
          )}
          {(isAdmin || auth?.userId === project.userId) && (
            <button
              className="btn btn-error btn-outline"
              onClick={handleDelete}
            >
              Delete
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs tabs-bordered">
        <button
          className={`tab ${activeTab === "overview" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          Overview
        </button>
        <button
          className={`tab ${activeTab === "logs" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("logs")}
        >
          LLM Logs
          {logs.length > 0 && (
            <span className="badge badge-sm badge-primary ml-2">
              {logs.length}
            </span>
          )}
        </button>
      </div>

      {/* Overview */}
      {activeTab === "overview" && (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body gap-4">
              <h2 className="card-title">Details</h2>
              <dl className="grid grid-cols-2 gap-y-3 text-sm">
                {(
                  [
                    ["Site Type", project.siteType],
                    ["Design Framework", project.designFramework ?? "—"],
                    ["Theme", project.theme ?? "—"],
                    ["Figma Link", project.figmaLink ?? "—"],
                    ["Status", project.status],
                  ] as [string, string][]
                ).map(([label, value]) => (
                  <div key={label} className="col-span-1">
                    <dt className="text-base-content/50 font-medium">
                      {label}
                    </dt>
                    <dd className="font-semibold break-all">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          {project.jsonInput && (
            <div className="card bg-base-100 shadow-sm">
              <div className="card-body gap-2">
                <h2 className="card-title">JSON Input</h2>
                <pre className="text-xs bg-base-200 rounded-lg p-3 overflow-auto max-h-56">
                  {(() => {
                    try {
                      return JSON.stringify(
                        JSON.parse(project.jsonInput),
                        null,
                        2,
                      );
                    } catch {
                      return project.jsonInput;
                    }
                  })()}
                </pre>
              </div>
            </div>
          )}
        </div>
      )}

      {/* LLM Logs */}
      {activeTab === "logs" && (
        <div className="space-y-4">
          {logs.length === 0 ? (
            <div className="card bg-base-100 shadow-sm">
              <div className="card-body items-center py-12">
                <span className="text-4xl">🤖</span>
                <p className="text-base-content/60 mt-2">
                  No LLM logs for this project.
                </p>
              </div>
            </div>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="card bg-base-100 shadow-sm">
                <div className="card-body gap-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-base-content/40">
                        #{log.id}
                      </span>
                      <span
                        className={`badge badge-sm ${
                          log.status === "Success"
                            ? "badge-success"
                            : log.status === "Failed"
                              ? "badge-error"
                              : "badge-warning"
                        }`}
                      >
                        {log.status}
                      </span>
                    </div>
                    <div className="text-xs text-base-content/40">
                      {log.tokensUsed.toLocaleString()} tokens ·{" "}
                      {new Date(log.createdAt).toLocaleString()}
                    </div>
                  </div>

                  {log.prompt && (
                    <details className="collapse collapse-arrow bg-base-200 rounded-lg">
                      <summary className="collapse-title text-sm font-medium py-2 min-h-0">
                        Prompt
                      </summary>
                      <div className="collapse-content">
                        <pre className="text-xs whitespace-pre-wrap break-all pt-2">
                          {log.prompt}
                        </pre>
                      </div>
                    </details>
                  )}

                  {log.response && (
                    <details className="collapse collapse-arrow bg-base-200 rounded-lg">
                      <summary className="collapse-title text-sm font-medium py-2 min-h-0">
                        Response
                      </summary>
                      <div className="collapse-content">
                        <pre className="text-xs whitespace-pre-wrap break-all pt-2">
                          {log.response}
                        </pre>
                      </div>
                    </details>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
