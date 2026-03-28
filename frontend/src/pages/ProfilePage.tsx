import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getUserById, updateUserProfile } from "../services/api";
import type { UserDto, UpdateUserProfileDto } from "../types/api";

export default function ProfilePage() {
  const { auth } = useAuth();
  const [user, setUser] = useState<UserDto | null>(null);
  const [form, setForm] = useState<UpdateUserProfileDto>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!auth) return;
    getUserById(auth.userId)
      .then((u) => {
        setUser(u);
        setForm({
          fullName: u.profile?.fullName ?? "",
          bio: u.profile?.bio ?? "",
          phone: u.profile?.phone ?? "",
          avatarUrl: u.profile?.avatarUrl ?? "",
        });
      })
      .finally(() => setLoading(false));
  }, [auth]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    setSaving(true);
    setSaved(false);
    try {
      const updated = await updateUserProfile(auth.userId, form);
      setUser(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Profile</h1>

      <div className="card bg-base-100 shadow-sm">
        <div className="card-body gap-2">
          <div className="flex items-center gap-4">
            <div className="avatar placeholder">
              <div className="bg-primary text-primary-content rounded-full w-16">
                <span className="text-2xl font-bold">
                  {auth?.fullName?.charAt(0) ?? auth?.email?.charAt(0)}
                </span>
              </div>
            </div>
            <div>
              <p className="font-bold text-lg">{auth?.fullName}</p>
              <p className="text-base-content/60 text-sm">{auth?.email}</p>
              <div className="flex gap-1 mt-1">
                {auth?.roles.map((r) => (
                  <span key={r} className="badge badge-primary badge-sm">
                    {r}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <h2 className="card-title">Edit Profile</h2>
          {saved && (
            <div className="alert alert-success">
              <span>Profile updated successfully!</span>
            </div>
          )}
          <form onSubmit={handleSave} className="space-y-4 mt-2">
            {(
              [
                {
                  key: "fullName",
                  label: "Full Name",
                  type: "text",
                  placeholder: "John Doe",
                },
                {
                  key: "phone",
                  label: "Phone",
                  type: "tel",
                  placeholder: "+1 234 567 890",
                },
                {
                  key: "avatarUrl",
                  label: "Avatar URL",
                  type: "url",
                  placeholder: "https://...",
                },
              ] as const
            ).map(({ key, label, type, placeholder }) => (
              <div key={key} className="form-control gap-1">
                <label className="label">
                  <span className="label-text font-medium">{label}</span>
                </label>
                <input
                  type={type}
                  className="input input-bordered w-full"
                  placeholder={placeholder}
                  value={(form[key] as string) ?? ""}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, [key]: e.target.value }))
                  }
                />
              </div>
            ))}

            <div className="form-control gap-1">
              <label className="label">
                <span className="label-text font-medium">Bio</span>
              </label>
              <textarea
                className="textarea textarea-bordered w-full h-24 resize-none"
                placeholder="Tell us about yourself..."
                value={form.bio ?? ""}
                onChange={(e) =>
                  setForm((p) => ({ ...p, bio: e.target.value }))
                }
              />
            </div>

            <div className="card-actions justify-end">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving}
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
      </div>

      <div className="card bg-base-100 shadow-sm">
        <div className="card-body gap-2">
          <h2 className="card-title text-base">Account Info</h2>
          <div className="text-sm space-y-1">
            <p>
              <span className="text-base-content/50">User ID: </span>
              <span className="font-mono">{user?.id}</span>
            </p>
            <p>
              <span className="text-base-content/50">Joined: </span>
              {user?.createdAt
                ? new Date(user.createdAt).toLocaleDateString()
                : "—"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
