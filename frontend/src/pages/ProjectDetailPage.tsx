import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import {
  getProjectById,
  getLLMLogsByProject,
  getProjectMDFiles,
  deleteProject,
  downloadProject,
} from "../services/api";
import type {
  ProjectDto,
  LLMLogDto,
  ProjectMDFileDto,
  LLMLogStatus,
} from "../types/api";
import StatusBadge from "../components/StatusBadge";
import { useAuth } from "../contexts/AuthContext";

// ─── Step status icon ─────────────────────────────────────────────────────────
function StepIcon({
  status,
  isRunning,
}: {
  status: LLMLogStatus | "Pending";
  isRunning: boolean;
}) {
  if (isRunning)
    return (
      <div className="w-9 h-9 rounded-full bg-info flex items-center justify-center shrink-0">
        <span className="loading loading-spinner loading-xs text-info-content" />
      </div>
    );
  if (status === "Success")
    return (
      <div className="w-9 h-9 rounded-full bg-success flex items-center justify-center shrink-0 text-success-content font-bold text-base">
        ✓
      </div>
    );
  if (status === "Failed")
    return (
      <div className="w-9 h-9 rounded-full bg-error flex items-center justify-center shrink-0 text-error-content font-bold text-base">
        ✗
      </div>
    );
  return (
    <div className="w-9 h-9 rounded-full border-2 border-base-300 bg-base-200 flex items-center justify-center shrink-0 text-base-content/30 text-base">
      ○
    </div>
  );
}

// ─── Workflow pipeline view ───────────────────────────────────────────────────
function WorkflowTab({
  steps,
  logs,
  projectStatus,
}: {
  steps: ProjectMDFileDto[];
  logs: LLMLogDto[];
  projectStatus: string;
}) {
  const activeSteps = steps
    .filter((s) => s.isActive)
    .sort((a, b) => a.stepOrder - b.stepOrder);

  const sortedLogs = [...logs].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );

  const pendingSteps =
    projectStatus === "Generating" ? activeSteps.slice(sortedLogs.length) : [];

  const runningStepOrder =
    projectStatus === "Generating"
      ? (pendingSteps[0]?.stepOrder ?? null)
      : null;

  const totalItems = sortedLogs.length + pendingSteps.length;

  if (totalItems === 0 && activeSteps.length === 0)
    return (
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body items-center py-16">
          <span className="text-5xl">📋</span>
          <p className="text-lg font-semibold mt-3">
            No workflow steps executed yet
          </p>
          <p className="text-base-content/50 text-sm">
            Steps will appear here once generation starts.
          </p>
        </div>
      </div>
    );

  const successCount = sortedLogs.filter((l) => l.status === "Success").length;
  const failedCount = sortedLogs.filter((l) => l.status === "Failed").length;

  return (
    <div className="space-y-4">
      {/* Summary bar */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm text-base-content/60">
          {successCount}/{totalItems} steps completed
        </span>
        {projectStatus === "Generating" && (
          <span className="badge badge-info gap-1">
            <span className="loading loading-spinner loading-xs" />
            Generating
          </span>
        )}
        {failedCount > 0 && (
          <span className="badge badge-error">{failedCount} failed</span>
        )}
        {projectStatus === "Generated" && (
          <span className="badge badge-success">Pipeline complete</span>
        )}
      </div>

      {/* Pipeline */}
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body gap-0 py-6">
          {/* ── Executed steps (from logs) ── */}
          {sortedLogs.map((log, idx) => {
            const stepInfo = activeSteps[idx];
            const stepName = stepInfo?.mdFileName ?? `Step ${idx + 1}`;
            const isLast = idx === totalItems - 1;
            const isRunning =
              projectStatus === "Generating" &&
              log.status !== "Success" &&
              log.status !== "Failed" &&
              idx === sortedLogs.length - 1;

            return (
              <div key={`log-${log.id}`} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <StepIcon status={log.status} isRunning={isRunning} />
                  {!isLast && (
                    <div
                      className={`w-0.5 flex-1 my-1 ${
                        log.status === "Success" ? "bg-success" : "bg-base-300"
                      }`}
                      style={{ minHeight: 28 }}
                    />
                  )}
                </div>

                <div className={`flex-1 ${isLast ? "pb-0" : "pb-5"}`}>
                  <div className="flex items-center gap-2 flex-wrap min-h-9">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-base-300 text-base-content/60 font-bold text-xs shrink-0">
                      {stepInfo?.stepOrder ?? idx + 1}
                    </span>
                    <span className="font-semibold">{stepName}</span>
                    <span
                      className={`badge badge-sm ${
                        isRunning
                          ? "badge-info"
                          : log.status === "Success"
                            ? "badge-success"
                            : log.status === "Failed"
                              ? "badge-error"
                              : "badge-warning"
                      }`}
                    >
                      {isRunning ? "Running…" : log.status}
                    </span>
                    <span className="text-xs text-base-content/40 ml-auto">
                      {log.tokensUsed.toLocaleString()} tokens ·{" "}
                      {new Date(log.createdAt).toLocaleString()}
                    </span>
                  </div>

                  {(log.prompt || log.response) && (
                    <div className="mt-2 space-y-2">
                      {log.prompt && (
                        <details className="collapse collapse-arrow bg-base-200 rounded-lg">
                          <summary className="collapse-title text-xs font-medium py-2 min-h-0 leading-none">
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
                          <summary className="collapse-title text-xs font-medium py-2 min-h-0 leading-none">
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
                  )}
                </div>
              </div>
            );
          })}

          {/* ── Pending steps (configured but not yet run) ── */}
          {pendingSteps.map((step, i) => {
            const isRunning = step.stepOrder === runningStepOrder;
            const isLast = sortedLogs.length + i === totalItems - 1;
            return (
              <div key={`pending-${step.id}`} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <StepIcon status="Pending" isRunning={isRunning} />
                  {!isLast && (
                    <div
                      className="w-0.5 flex-1 my-1 bg-base-300"
                      style={{ minHeight: 28 }}
                    />
                  )}
                </div>
                <div className={`flex-1 ${isLast ? "pb-0" : "pb-5"}`}>
                  <div className="flex items-center gap-2 flex-wrap min-h-9">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-base-300 text-base-content/60 font-bold text-xs shrink-0">
                      {step.stepOrder}
                    </span>
                    <span className="font-semibold">{step.mdFileName}</span>
                    <span className="badge badge-sm badge-ghost">
                      {isRunning ? "Running…" : "Pending"}
                    </span>
                    {isRunning && (
                      <p className="text-xs text-info mt-1 w-full">
                        Waiting for LLM response…
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
type ActiveTab = "workflow" | "overview" | "logs";

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { auth, isAdmin } = useAuth();
  const [project, setProject] = useState<ProjectDto | null>(null);
  const [logs, setLogs] = useState<LLMLogDto[]>([]);
  const [steps, setSteps] = useState<ProjectMDFileDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>("workflow");
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const justGenerated = (location.state as { justGenerated?: boolean } | null)
    ?.justGenerated;

  const fetchAll = useCallback(async (numId: number) => {
    const [p, l, s] = await Promise.all([
      getProjectById(numId),
      getLLMLogsByProject(numId),
      getProjectMDFiles(numId),
    ]);
    setProject(p);
    setLogs(l);
    setSteps(s);
    return p;
  }, []);

  useEffect(() => {
    if (!id) return;
    const numId = Number(id);

    fetchAll(numId).finally(() => setLoading(false));
  }, [id, fetchAll]);

  // Poll every 3 s while project is Generating
  useEffect(() => {
    if (!id) return;
    const numId = Number(id);

    if (project?.status === "Generating") {
      pollingRef.current = setInterval(async () => {
        const p = await fetchAll(numId);
        if (p?.status !== "Generating") {
          clearInterval(pollingRef.current!);
          pollingRef.current = null;
        }
      }, 3000);
    }
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [id, project?.status, fetchAll]);

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
          className={`tab ${activeTab === "workflow" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("workflow")}
        >
          Workflow
          {steps.length > 0 && (
            <span className="badge badge-sm badge-primary ml-2">
              {steps.filter((s) => s.isActive).length}
            </span>
          )}
        </button>
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

      {/* Workflow */}
      {activeTab === "workflow" && (
        <WorkflowTab steps={steps} logs={logs} projectStatus={project.status} />
      )}

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
            (() => {
              const orderedSteps = [...steps]
                .filter((s) => s.isActive)
                .sort((a, b) => a.stepOrder - b.stepOrder);

              const sorted = [...logs].sort(
                (a, b) =>
                  new Date(a.createdAt).getTime() -
                  new Date(b.createdAt).getTime(),
              );

              return sorted.map((log, idx) => {
                const stepInfo = orderedSteps[idx];
                const order = stepInfo?.stepOrder;
                const stepName = stepInfo?.mdFileName;
                return (
                  <div key={log.id} className="card bg-base-100 shadow-sm">
                    <div className="card-body gap-3">
                      {/* Header */}
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          {/* Execution order badge */}
                          <div className="flex items-center justify-center w-7 h-7 rounded-full bg-base-300 text-base-content/60 font-bold text-xs shrink-0">
                            {order ?? idx + 1}
                          </div>
                          {/* Step name */}
                          {stepName && (
                            <span className="font-semibold text-sm">
                              {stepName}
                            </span>
                          )}
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
                        <div className="text-xs text-base-content/40 flex items-center gap-2">
                          <span>{log.tokensUsed.toLocaleString()} tokens</span>
                          <span>·</span>
                          <span>
                            {new Date(log.createdAt).toLocaleString()}
                          </span>
                          <span className="font-mono text-base-content/30">
                            #{log.id}
                          </span>
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
                );
              });
            })()
          )}
        </div>
      )}
    </div>
  );
}
