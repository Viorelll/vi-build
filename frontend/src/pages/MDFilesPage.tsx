import { useEffect, useState } from "react";
import {
  getMDFiles,
  createMDFile,
  updateMDFile,
  deleteMDFile,
} from "../services/api";
import type {
  MDFileDto,
  CreateMDFileDto,
  UpdateMDFileDto,
  MDFileType,
} from "../types/api";
import { useAuth } from "../contexts/AuthContext";

const FILE_TYPES: MDFileType[] = ["Skills", "Agents", "Templates", "Tools"];

const emptyForm: CreateMDFileDto = {
  fileName: "",
  fileType: undefined,
  content: "",
};

export default function MDFilesPage() {
  const { isAdmin } = useAuth();
  const [files, setFiles] = useState<MDFileDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<MDFileDto | null>(null);
  const [form, setForm] = useState<CreateMDFileDto>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const load = () => {
    setLoading(true);
    getMDFiles()
      .then(setFiles)
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openCreate = () => {
    setForm(emptyForm);
    setIsEditing(false);
    setSelected(null);
    setShowModal(true);
  };

  const openEdit = (f: MDFileDto) => {
    setForm({ fileName: f.fileName, fileType: f.fileType, content: f.content });
    setIsEditing(true);
    setSelected(f);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isEditing && selected) {
        const dto: UpdateMDFileDto = {
          fileName: form.fileName,
          fileType: form.fileType,
          content: form.content,
        };
        const updated = await updateMDFile(selected.id, dto);
        setFiles((prev) =>
          prev.map((f) => (f.id === selected.id ? updated : f)),
        );
      } else {
        const created = await createMDFile(form);
        setFiles((prev) => [...prev, created]);
      }
      setShowModal(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this MD file?")) return;
    setDeletingId(id);
    try {
      await deleteMDFile(id);
      setFiles((prev) => prev.filter((f) => f.id !== id));
      if (selected?.id === id) setSelected(null);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">MD Files</h1>
        {isAdmin && (
          <button className="btn btn-primary gap-2" onClick={openCreate}>
            <span>+</span> New File
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <span className="loading loading-spinner loading-lg text-primary" />
        </div>
      ) : files.length === 0 ? (
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body items-center py-12">
            <span className="text-4xl">📄</span>
            <p className="text-base-content/60 mt-2">No MD files yet.</p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {files.map((f) => (
            <div key={f.id} className="card bg-base-100 shadow-sm">
              <div className="card-body gap-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold line-clamp-1">{f.fileName}</h3>
                  {f.fileType && (
                    <span className="badge badge-primary badge-sm shrink-0">
                      {f.fileType}
                    </span>
                  )}
                </div>
                <p className="text-xs text-base-content/50 line-clamp-3 font-mono bg-base-200 rounded p-2">
                  {f.content}
                </p>
                <div className="text-xs text-base-content/40">
                  Created {new Date(f.createdAt).toLocaleDateString()}
                  {f.updatedAt &&
                    ` · Updated ${new Date(f.updatedAt).toLocaleDateString()}`}
                </div>
                {isAdmin && (
                  <div className="card-actions justify-end gap-1">
                    <button
                      className="btn btn-ghost btn-xs"
                      onClick={() => openEdit(f)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-error btn-xs"
                      onClick={() => handleDelete(f.id)}
                      disabled={deletingId === f.id}
                    >
                      {deletingId === f.id ? (
                        <span className="loading loading-spinner loading-xs" />
                      ) : (
                        "Delete"
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <dialog open className="modal modal-open">
          <div className="modal-box max-w-2xl">
            <h3 className="font-bold text-xl mb-4">
              {isEditing ? "Edit MD File" : "New MD File"}
            </h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="form-control gap-1">
                <label className="label">
                  <span className="label-text font-medium">File Name *</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  placeholder="e.g. react-skills.md"
                  value={form.fileName}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, fileName: e.target.value }))
                  }
                  required
                />
              </div>

              <div className="form-control gap-1">
                <label className="label">
                  <span className="label-text font-medium">File Type</span>
                </label>
                <select
                  className="select select-bordered w-full"
                  value={form.fileType ?? ""}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      fileType: (e.target.value as MDFileType) || undefined,
                    }))
                  }
                >
                  <option value="">— None —</option>
                  {FILE_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-control gap-1">
                <label className="label">
                  <span className="label-text font-medium">Content *</span>
                </label>
                <textarea
                  className="textarea textarea-bordered w-full h-48 font-mono text-xs resize-y"
                  placeholder="Markdown content..."
                  value={form.content}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, content: e.target.value }))
                  }
                  required
                />
              </div>

              <div className="modal-action">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                >
                  {saving ? (
                    <span className="loading loading-spinner loading-sm" />
                  ) : isEditing ? (
                    "Save Changes"
                  ) : (
                    "Create"
                  )}
                </button>
              </div>
            </form>
          </div>
          <div className="modal-backdrop" onClick={() => setShowModal(false)} />
        </dialog>
      )}
    </div>
  );
}
