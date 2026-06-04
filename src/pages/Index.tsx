import { useState } from "react";
import { toast } from "sonner";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import zentroverseLogo from "@/assets/zentroverse-logo.png";
import { useAuth } from "@/context/AuthContext";
import { ApiClientError } from "@/lib/api";

const Index = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await login(email, password);
    } catch (err) {
      toast.error("Sign in failed", {
        description: err instanceof ApiClientError ? err.message : "Check email and password",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-app px-4 py-10 sm:px-6">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-24 -top-40 h-[32rem] w-[32rem] rounded-full bg-gradient-to-br from-primary/20 via-primary/5 to-transparent blur-3xl" />
        <div className="absolute -bottom-32 -left-24 h-[28rem] w-[28rem] rounded-full bg-gradient-to-tr from-accent/18 via-accent/5 to-transparent blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-[400px]">
        <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-lg ring-1 ring-slate-900/[0.04]">
          <div className="border-b border-slate-100 bg-white px-8 pb-7 pt-8 text-center sm:px-10">
            <img
              src={zentroverseLogo}
              alt="ZentroFlow"
              className="mx-auto h-auto w-full max-w-[220px] max-h-[104px] object-contain"
              width={220}
              height={104}
            />
            <div className="mt-7 space-y-1.5">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-display">Welcome back</h1>
              <p className="text-[0.9375rem] text-slate-500">Sign in to your ZentroFlow workspace</p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-5 px-8 py-8 sm:px-10">
            <div className="space-y-2">
              <label htmlFor="login-email" className="text-sm font-semibold text-slate-800">Email</label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-4 top-1/2 h-[1.125rem] w-[1.125rem] -translate-y-1/2 text-slate-400" />
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="input-login pl-12 pr-4"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="login-password" className="text-sm font-semibold text-slate-800">Password</label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-4 top-1/2 h-[1.125rem] w-[1.125rem] -translate-y-1/2 text-slate-400" />
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="input-login pl-12 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="mt-2 w-full rounded-xl py-3.5 text-sm font-semibold text-white gradient-primary disabled:opacity-60"
            >
              {submitting ? "Signing in…" : "Sign in"}
            </button>

            <p className="text-center text-xs text-slate-400">
              Uses API credentials from server <span className="text-slate-500">ADMIN_EMAIL</span>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Index;
