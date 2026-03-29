import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { getFeatures, generateProject, getMDFiles } from "../services/api";
import type {
  FeatureDto,
  GenerateProjectRequestDto,
  MDFileDto,
} from "../types/api";

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
  selectedFeatures: number[];
  selectedMDFileIds: number[];
  designFramework: string;
  theme: string;
  figmaLink: string;
  description: string;
}

const initial: FormState = {
  projectName: "",
  siteType: "",
  selectedFeatures: [],
  selectedMDFileIds: [],
  designFramework: "",
  theme: "",
  figmaLink: "",
  description: "",
};

type Step = 1 | 2 | 3 | 4;

export default function NewProjectPage() {
  const { auth } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<FormState>(initial);
  const [features, setFeatures] = useState<FeatureDto[]>([]);
  const [mdFiles, setMdFiles] = useState<MDFileDto[]>([]);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getFeatures()
      .then(setFeatures)
      .catch(() => {});
    getMDFiles()
      .then(setMdFiles)
      .catch(() => {});
  }, []);

  const set = (k: keyof FormState, v: string | string[]) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const toggleFeature = (id: number) => {
    setForm((prev) => ({
      ...prev,
      selectedFeatures: prev.selectedFeatures.includes(id)
        ? prev.selectedFeatures.filter((f) => f !== id)
        : [...prev.selectedFeatures, id],
    }));
  };

  const canNext1 = form.projectName.trim().length > 0 && form.siteType !== "";
  const canNext2 = true; // features are optional
  const canNext3 = true; // md files are optional

  const toggleMDFile = (id: number) => {
    setForm((prev) => ({
      ...prev,
      selectedMDFileIds: prev.selectedMDFileIds.includes(id)
        ? prev.selectedMDFileIds.filter((x) => x !== id)
        : [...prev.selectedMDFileIds, id],
    }));
  };

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
      mdFileIds:
        form.selectedMDFileIds.length > 0 ? form.selectedMDFileIds : undefined,
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
        <li className={`step ${step >= 3 ? "step-primary" : ""}`}>Pipeline</li>
        <li className={`step ${step >= 4 ? "step-primary" : ""}`}>
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
                      form.selectedFeatures.includes(f.id)
                        ? "btn-primary"
                        : "btn-outline"
                    }`}
                    onClick={() => toggleFeature(f.id)}
                  >
                    {form.selectedFeatures.includes(f.id) ? "✓ " : ""}
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

      {/* Step 3: Pipeline / MD File selection */}
      {step === 3 && (
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body gap-5">
            <h2 className="card-title text-xl">Generation Pipeline</h2>
            <p className="text-base-content/60 text-sm">
              Click files to add them to the pipeline. The order you select them
              defines the execution order. Click a selected file again to remove
              it.
            </p>

            {mdFiles.length === 0 ? (
              <div className="alert alert-info">
                <span>
                  No MD files available. You can add them in the MD Files
                  section.
                </span>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {mdFiles.map((f) => {
                  const pos = form.selectedMDFileIds.indexOf(f.id);
                  const selected = pos !== -1;
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => toggleMDFile(f.id)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${
                        selected
                          ? "border-primary bg-primary/5 shadow-sm"
                          : "border-base-300 hover:border-primary/40 hover:bg-base-200"
                      }`}
                    >
                      {/* Order badge / empty circle */}
                      <div
                        className={`flex items-center justify-center w-8 h-8 rounded-full shrink-0 font-bold text-sm transition-colors ${
                          selected
                            ? "bg-primary text-primary-content"
                            : "bg-base-200 text-base-content/30 border-2 border-dashed border-base-300"
                        }`}
                      >
                        {selected ? pos + 1 : "○"}
                      </div>

                      {/* File info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm leading-tight">
                          {f.fileName}
                        </p>
                      </div>

                      {/* Date */}
                      <span className="text-xs text-base-content/40 shrink-0">
                        {f.updatedAt
                          ? new Date(f.updatedAt).toLocaleDateString()
                          : new Date(f.createdAt).toLocaleDateString()}
                      </span>

                      {selected && (
                        <span className="text-xs text-primary font-semibold shrink-0">
                          Step {pos + 1}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Selected pipeline summary */}
            {form.selectedMDFileIds.length > 0 && (
              <div className="bg-base-200 rounded-xl p-3 space-y-1">
                <p className="text-xs font-semibold text-base-content/60 uppercase tracking-wide mb-2">
                  Execution order
                </p>
                {form.selectedMDFileIds.map((id, i) => {
                  const f = mdFiles.find((m) => m.id === id);
                  return (
                    <div key={id} className="flex items-center gap-2 text-sm">
                      <span className="w-5 h-5 rounded-full bg-primary text-primary-content flex items-center justify-center text-xs font-bold shrink-0">
                        {i + 1}
                      </span>
                      <span className="font-medium">{f?.fileName ?? id}</span>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="card-actions justify-between">
              <button className="btn btn-ghost" onClick={() => setStep(2)}>
                ← Back
              </button>
              <button
                className="btn btn-primary"
                onClick={() => setStep(4)}
                disabled={!canNext3}
              >
                Next →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Design & Review */}
      {step === 4 && (
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
                <div className="col-span-2">
                  <span className="font-medium text-base-content/60">
                    Pipeline Files
                  </span>
                  <p className="font-semibold">
                    {form.selectedMDFileIds.length > 0
                      ? mdFiles
                          .filter((f) => form.selectedMDFileIds.includes(f.id))
                          .map((f) => f.fileName)
                          .join(", ")
                      : "All available files"}
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
              onClick={() => setStep(3)}
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
