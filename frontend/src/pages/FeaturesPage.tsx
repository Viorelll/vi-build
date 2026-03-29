import { useEffect, useState } from "react";
import {
  getFeatures,
  createFeature,
  updateFeature,
  deleteFeature,
} from "../services/api";
import type { FeatureDto, UpdateFeatureDto } from "../types/api";
import { useAuth } from "../contexts/AuthContext";

function IconPlus() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 4v16m8-8H4"
      />
    </svg>
  );
}

function IconPencil() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-3.5 w-3.5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
      />
    </svg>
  );
}

function IconTrash() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-3.5 w-3.5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
      />
    </svg>
  );
}

export default function FeaturesPage() {
  const { isAdmin } = useAuth();
  const [features, setFeatures] = useState<FeatureDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editing, setEditing] = useState<FeatureDto | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const load = () => {
    setLoading(true);
    getFeatures()
      .then(setFeatures)
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const closeCreateForm = () => {
    setShowCreateForm(false);
    setNewName("");
    setNewDescription("");
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const f = await createFeature({
        name: newName.trim(),
        description: newDescription.trim() || undefined,
      });
      setFeatures((prev) => [...prev, f]);
      closeCreateForm();
    } finally {
      setCreating(false);
    }
  };

  const startEdit = (f: FeatureDto) => {
    setEditing(f);
    setEditName(f.name);
    setEditDescription(f.description ?? "");
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing || !editName.trim()) return;
    setSaving(true);
    try {
      const dto: UpdateFeatureDto = {
        name: editName.trim(),
        description: editDescription.trim() || undefined,
      };
      const updated = await updateFeature(editing.id, dto);
      setFeatures((prev) =>
        prev.map((f) => (f.id === editing.id ? updated : f)),
      );
      setEditing(null);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this feature?")) return;
    setDeletingId(id);
    try {
      await deleteFeature(id);
      setFeatures((prev) => prev.filter((f) => f.id !== id));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            Features
            {!loading && (
              <span className="badge badge-neutral badge-lg">
                {features.length}
              </span>
            )}
          </h1>
          <p className="text-base-content/50 text-sm mt-1">
            Manage the features used in your AI generation pipeline.
          </p>
        </div>
        {isAdmin && !showCreateForm && (
          <button
            className="btn btn-primary gap-2 shrink-0"
            onClick={() => setShowCreateForm(true)}
          >
            <IconPlus />
            New Feature
          </button>
        )}
      </div>

      {/* Create form */}
      {isAdmin && showCreateForm && (
        <form
          onSubmit={handleCreate}
          className="card bg-base-100 shadow border border-primary/20"
        >
          <div className="card-body gap-4">
            <div className="flex items-center justify-between">
              <h2 className="card-title text-lg">New Feature</h2>
              <button
                type="button"
                className="btn btn-ghost btn-sm btn-circle"
                onClick={closeCreateForm}
              >
                ✕
              </button>
            </div>

            <div className="form-control gap-1">
              <label className="label pb-0">
                <span className="label-text font-medium">
                  Name <span className="text-error">*</span>
                </span>
              </label>
              <input
                type="text"
                autoFocus
                className="input input-bordered"
                placeholder="e.g. User Authentication"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                maxLength={100}
              />
            </div>

            <div className="form-control gap-1">
              <label className="label pb-0">
                <span className="label-text font-medium">Description</span>
                <span className="label-text-alt text-base-content/40">
                  optional
                </span>
              </label>
              <textarea
                className="textarea textarea-bordered resize-y min-h-20"
                placeholder="Describe what this feature does and how it fits into your project..."
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
              />
            </div>

            <div className="card-actions justify-end gap-2">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={closeCreateForm}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={creating || !newName.trim()}
              >
                {creating ? (
                  <span className="loading loading-spinner loading-sm" />
                ) : (
                  "Create Feature"
                )}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-16">
          <span className="loading loading-spinner loading-lg text-primary" />
        </div>
      ) : features.length === 0 ? (
        <div className="card bg-base-100 shadow-sm border border-base-200">
          <div className="card-body items-center py-16 gap-3">
            <div className="text-5xl opacity-20">🔧</div>
            <p className="text-xl font-semibold text-base-content/40">
              No features yet
            </p>
            <p className="text-sm text-base-content/40">
              {isAdmin
                ? 'Click "New Feature" to get started.'
                : "No features have been added."}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {features.map((f) => (
            <div
              key={f.id}
              className="card bg-base-100 shadow-sm border border-base-200 hover:shadow-md transition-shadow"
            >
              <div className="card-body p-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="badge badge-ghost badge-sm shrink-0">
                      #{f.id}
                    </span>
                    <h3 className="font-semibold truncate">{f.name}</h3>
                  </div>
                  {isAdmin && (
                    <div className="flex gap-1 shrink-0">
                      <button
                        className="btn btn-ghost btn-xs"
                        onClick={() => startEdit(f)}
                        title="Edit feature"
                      >
                        <IconPencil />
                      </button>
                      <button
                        className="btn btn-ghost btn-xs text-error"
                        onClick={() => handleDelete(f.id)}
                        disabled={deletingId === f.id}
                        title="Delete feature"
                      >
                        {deletingId === f.id ? (
                          <span className="loading loading-spinner loading-xs" />
                        ) : (
                          <IconTrash />
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {f.description ? (
                  <p className="text-sm text-base-content/60 mt-1 leading-relaxed line-clamp-3">
                    {f.description}
                  </p>
                ) : (
                  <p className="text-sm text-base-content/30 mt-1 italic">
                    No description
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit modal */}
      {editing && (
        <dialog open className="modal modal-open">
          <div className="modal-box">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-lg">Edit Feature</h3>
              <button
                type="button"
                className="btn btn-ghost btn-sm btn-circle"
                onClick={() => setEditing(null)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="form-control gap-1">
                <label className="label pb-0">
                  <span className="label-text font-medium">
                    Name <span className="text-error">*</span>
                  </span>
                </label>
                <input
                  type="text"
                  autoFocus
                  className="input input-bordered"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  maxLength={100}
                  required
                />
              </div>

              <div className="form-control gap-1">
                <label className="label pb-0">
                  <span className="label-text font-medium">Description</span>
                  <span className="label-text-alt text-base-content/40">
                    optional
                  </span>
                </label>
                <textarea
                  className="textarea textarea-bordered resize-y min-h-24"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Describe what this feature does..."
                />
              </div>

              <div className="modal-action pt-2">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setEditing(null)}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving || !editName.trim()}
                >
                  {saving ? (
                    <span className="loading loading-spinner loading-sm" />
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </form>
          </div>
          <div className="modal-backdrop" onClick={() => setEditing(null)} />
        </dialog>
      )}
    </div>
  );
}
