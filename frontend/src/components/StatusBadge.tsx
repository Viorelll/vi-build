import type { ProjectStatus } from "../types/api";

const MAP: Record<ProjectStatus, string> = {
  Pending: "badge-warning",
  Generating: "badge-info",
  Generated: "badge-success",
  Failed: "badge-error",
};

export default function StatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <span className={`badge ${MAP[status]} badge-sm whitespace-nowrap`}>
      {status}
    </span>
  );
}
