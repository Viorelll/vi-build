import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { getFeatures, generateProject } from "../services/api";
import type { FeatureDto, GenerateProjectRequestDto } from "../types/api";

const SITE_TYPES = [
  "Landing Page",
  "E-Commerce",
  "Blog",
  "Portfolio",
  "Dashboard",
  "SaaS App",
  "Corporate Website",
  "Documentation",
];

const DESIGN_FRAMEWORKS = [
  "Tailwind CSS",
  "Bootstrap",
  "Material UI",
  "Chakra UI",
  "Ant Design",
  "DaisyUI",
];

const THEMES = [
  "Light",
  "Dark",
  "Minimal",
  "Colorful",
  "Professional",
  "Playful",
];

interface FormState {
  projectName: string;
  siteType: string;
  selectedFeatures: string[];
  designFramework: string;
  theme: string;
  figmaLink: string;
  description: string;
}

const initial: FormState = {
  projectName: "",
  siteType: "",
  selectedFeatures: [],
  designFramework: "",
  theme: "",
  figmaLink: "",
  description: "",
};

type Step = 1 | 2 | 3;

export default function NewProjectPage() {
  const { auth } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<FormState>(initial);
  const [features, setFeatures] = useState<FeatureDto[]>([]);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getFeatures()
      .then(setFeatures)
      .catch(() => {});
  }, []);

  const set = (k: keyof FormState, v: string | string[]) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const toggleFeature = (name: string) => {
    setForm((prev) => ({
      ...prev,
      selectedFeatures: prev.selectedFeatures.includes(name)
        ? prev.selectedFeatures.filter((f) => f !== name)
        : [...prev.selectedFeatures, name],
    }));
  };

  const canNext1 = form.projectName.trim().length > 0 && form.siteType !== "";
  const canNext2 = true; // features are optional

  const handleGenerate = async () => {
    if (!auth) return;
    setGenerating(true);
    setError(null);
    const dto: GenerateProjectRequestDto = {
      userId: auth.userId,
      projectName: form.projectName.trim(),
      siteType: form.siteType,
      features: form.selectedFeatures,
      designFramework: form.designFramework || undefined,
      theme: form.theme || undefined,
      figmaLink: form.figmaLink.trim() || undefined,
      description: form.description.trim() || undefined,
    };
    try {
      const result = await generateProject(dto);
      navigate(`/projects/${result.projectId}`, {
        state: { justGenerated: true },
      });
    } catch (e: unknown) {
      const msg =
        e instanceof Error ? e.message : "Generation failed. Please try again.";
      setError(msg);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">New Project</h1>
        <p className="text-base-content/60 mt-1">
          Fill in the details and let AI generate your project.
        </p>
      </div>

      {/* Step indicator */}
      <ul className="steps steps-horizontal w-full">
        <li className={`step ${step >= 1 ? "step-primary" : ""}`}>Basics</li>
        <li className={`step ${step >= 2 ? "step-primary" : ""}`}>Features</li>
        <li className={`step ${step >= 3 ? "step-primary" : ""}`}>
          Design &amp; Review
        </li>
      </ul>

      {/* Step 1: Basics */}
      {step === 1 && (
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body gap-5">
            <h2 className="card-title text-xl">Project Basics</h2>

            {/* Project Name */}
            <div className="form-control gap-1">
              <label className="label">
                <span className="label-text font-medium">Project Name *</span>
              </label>
              <input
                type="text"
                placeholder="e.g. my-awesome-app"
                className="input input-bordered w-full"
                value={form.projectName}
                onChange={(e) => set("projectName", e.target.value)}
                maxLength={100}
              />
            </div>

            {/* Site Type */}
            <div className="form-control gap-1">
              <label className="label">
                <span className="label-text font-medium">Site Type *</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {SITE_TYPES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    className={`btn btn-sm normal-case ${
                      form.siteType === t
                        ? "btn-primary"
                        : "btn-outline btn-ghost"
                    }`}
                    onClick={() => set("siteType", t)}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="form-control gap-1">
              <label className="label">
                <span className="label-text font-medium">Description</span>
                <span className="label-text-alt text-base-content/40">
                  optional
                </span>
              </label>
              <textarea
                className="textarea textarea-bordered w-full h-28 resize-none"
                placeholder="Describe what this project should do..."
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
              />
            </div>

            <div className="card-actions justify-end">
              <button
                className="btn btn-primary"
                onClick={() => setStep(2)}
                disabled={!canNext1}
              >
                Next →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Features */}
      {step === 2 && (
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body gap-5">
            <h2 className="card-title text-xl">Select Features</h2>
            <p className="text-base-content/60 text-sm">
              Choose the features to include in the generated project.
            </p>

            {features.length === 0 ? (
              <div className="alert alert-info">
                <span>
                  No features available. You can add them in the Features
                  section.
                </span>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {features.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    className={`btn btn-sm normal-case ${
                      form.selectedFeatures.includes(f.name)
                        ? "btn-primary"
                        : "btn-outline"
                    }`}
                    onClick={() => toggleFeature(f.name)}
                  >
                    {form.selectedFeatures.includes(f.name) ? "✓ " : ""}
                    {f.name}
                  </button>
                ))}
              </div>
            )}

            {form.selectedFeatures.length > 0 && (
              <div className="text-sm text-base-content/60">
                Selected:{" "}
                <span className="font-medium text-primary">
                  {form.selectedFeatures.join(", ")}
                </span>
              </div>
            )}

            <div className="card-actions justify-between">
              <button className="btn btn-ghost" onClick={() => setStep(1)}>
                ← Back
              </button>
              <button
                className="btn btn-primary"
                onClick={() => setStep(3)}
                disabled={!canNext2}
              >
                Next →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Design & Review */}
      {step === 3 && (
        <div className="space-y-4">
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body gap-5">
              <h2 className="card-title text-xl">Design Preferences</h2>

              {/* Design Framework */}
              <div className="form-control gap-1">
                <label className="label">
                  <span className="label-text font-medium">
                    Design Framework
                  </span>
                  <span className="label-text-alt text-base-content/40">
                    optional
                  </span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {DESIGN_FRAMEWORKS.map((f) => (
                    <button
                      key={f}
                      type="button"
                      className={`btn btn-sm normal-case ${
                        form.designFramework === f
                          ? "btn-secondary"
                          : "btn-outline btn-ghost"
                      }`}
                      onClick={() =>
                        set(
                          "designFramework",
                          form.designFramework === f ? "" : f,
                        )
                      }
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Theme */}
              <div className="form-control gap-1">
                <label className="label">
                  <span className="label-text font-medium">Theme</span>
                  <span className="label-text-alt text-base-content/40">
                    optional
                  </span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {THEMES.map((t) => (
                    <button
                      key={t}
                      type="button"
                      className={`btn btn-sm normal-case ${
                        form.theme === t
                          ? "btn-accent"
                          : "btn-outline btn-ghost"
                      }`}
                      onClick={() => set("theme", form.theme === t ? "" : t)}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Figma Link */}
              <div className="form-control gap-1">
                <label className="label">
                  <span className="label-text font-medium">Figma Link</span>
                  <span className="label-text-alt text-base-content/40">
                    optional
                  </span>
                </label>
                <input
                  type="url"
                  placeholder="https://figma.com/..."
                  className="input input-bordered w-full"
                  value={form.figmaLink}
                  onChange={(e) => set("figmaLink", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Review Summary */}
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body gap-3">
              <h2 className="card-title text-xl">Review</h2>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="font-medium text-base-content/60">
                    Project
                  </span>
                  <p className="font-semibold">{form.projectName}</p>
                </div>
                <div>
                  <span className="font-medium text-base-content/60">Type</span>
                  <p className="font-semibold">{form.siteType}</p>
                </div>
                <div>
                  <span className="font-medium text-base-content/60">
                    Framework
                  </span>
                  <p className="font-semibold">{form.designFramework || "—"}</p>
                </div>
                <div>
                  <span className="font-medium text-base-content/60">
                    Theme
                  </span>
                  <p className="font-semibold">{form.theme || "—"}</p>
                </div>
                <div className="col-span-2">
                  <span className="font-medium text-base-content/60">
                    Features
                  </span>
                  <p className="font-semibold">
                    {form.selectedFeatures.length > 0
                      ? form.selectedFeatures.join(", ")
                      : "—"}
                  </p>
                </div>
                {form.description && (
                  <div className="col-span-2">
                    <span className="font-medium text-base-content/60">
                      Description
                    </span>
                    <p className="font-semibold">{form.description}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {error && (
            <div className="alert alert-error">
              <span>{error}</span>
            </div>
          )}

          <div className="flex justify-between">
            <button
              className="btn btn-ghost"
              onClick={() => setStep(2)}
              disabled={generating}
            >
              ← Back
            </button>
            <button
              className="btn btn-primary btn-lg gap-2"
              onClick={handleGenerate}
              disabled={generating}
            >
              {generating ? (
                <>
                  <span className="loading loading-spinner loading-sm" />
                  Generating…
                </>
              ) : (
                <>🚀 Generate Project</>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
