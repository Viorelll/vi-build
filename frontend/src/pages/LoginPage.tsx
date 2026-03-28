import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { googleLogin } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { useEffect } from "react";

export default function LoginPage() {
  const { auth, login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (auth) navigate("/", { replace: true });
  }, [auth, navigate]);

  const handleCredential = async (credential: string) => {
    try {
      const result = await googleLogin(credential);
      login(result);
      navigate("/");
    } catch {
      alert("Login failed. Please try again.");
    }
  };

  return (
    <div className="hero min-h-[calc(100vh-4rem)] bg-base-200">
      <div className="hero-content flex-col gap-8 text-center">
        {/* Brand */}
        <div>
          <h1 className="text-6xl font-extrabold text-primary tracking-tight">
            ViBuild
          </h1>
          <p className="mt-3 text-xl text-base-content/70 max-w-md">
            AI-powered platform to generate full-stack project scaffolding in
            seconds.
          </p>
        </div>

        {/* Card */}
        <div className="card bg-base-100 shadow-xl w-full max-w-sm">
          <div className="card-body items-center gap-6">
            <div className="text-center">
              <h2 className="card-title justify-center text-2xl">
                Welcome back
              </h2>
              <p className="text-sm text-base-content/60 mt-1">
                Sign in to start building
              </p>
            </div>

            <GoogleLogin
              onSuccess={(res) => {
                if (res.credential) handleCredential(res.credential);
              }}
              onError={() => alert("Google login failed.")}
              width="100%"
              text="continue_with"
              shape="rectangular"
              theme="outline"
            />

            <p className="text-xs text-base-content/40">
              By signing in you agree to our terms of service.
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-4 mt-4 max-w-lg text-center">
          {[
            { icon: "⚡", label: "Fast generation" },
            { icon: "🤖", label: "AI-powered" },
            { icon: "📦", label: "Ready to download" },
          ].map(({ icon, label }) => (
            <div key={label} className="flex flex-col items-center gap-1">
              <span className="text-2xl">{icon}</span>
              <span className="text-xs text-base-content/60">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
