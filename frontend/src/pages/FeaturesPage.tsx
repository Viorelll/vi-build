import { useEffect, useState } from "react";
import { getFeatures, createFeature, deleteFeature } from "../services/api";
import type { FeatureDto } from "../types/api";
import { useAuth } from "../contexts/AuthContext";

export default function FeaturesPage() {
  const { isAdmin } = useAuth();
  const [features, setFeatures] = useState<FeatureDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const load = () => {
    setLoading(true);
    getFeatures()
      .then(setFeatures)
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const f = await createFeature({ name: newName.trim() });
      setFeatures((prev) => [...prev, f]);
      setNewName("");
    } finally {
      setCreating(false);
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
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Features</h1>

      {/* Add feature */}
      {isAdmin && (
        <form onSubmit={handleCreate} className="flex gap-2">
          <input
            type="text"
            className="input input-bordered flex-1"
            placeholder="New feature name..."
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            maxLength={100}
          />
          <button
            type="submit"
            className="btn btn-primary"
            disabled={creating || !newName.trim()}
          >
            {creating ? (
              <span className="loading loading-spinner loading-sm" />
            ) : (
              "Add"
            )}
          </button>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <span className="loading loading-spinner loading-lg text-primary" />
        </div>
      ) : features.length === 0 ? (
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body items-center py-12">
            <span className="text-4xl">🔧</span>
            <p className="text-base-content/60 mt-2">
              No features defined yet.
            </p>
          </div>
        </div>
      ) : (
        <div className="card bg-base-100 shadow-sm">
          <ul className="divide-y divide-base-200">
            {features.map((f) => (
              <li
                key={f.id}
                className="flex items-center justify-between px-6 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className="badge badge-ghost badge-sm">#{f.id}</span>
                  <span className="font-medium">{f.name}</span>
                </div>
                {isAdmin && (
                  <button
                    className="btn btn-ghost btn-xs text-error"
                    onClick={() => handleDelete(f.id)}
                    disabled={deletingId === f.id}
                  >
                    {deletingId === f.id ? (
                      <span className="loading loading-spinner loading-xs" />
                    ) : (
                      "Delete"
                    )}
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
