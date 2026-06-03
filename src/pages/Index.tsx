import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import zentroverseLogo from "@/assets/zentroverse-logo.png";

const Index = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/dashboard");
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-app px-4 py-10 sm:px-6">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-24 -top-40 h-[32rem] w-[32rem] rounded-full bg-gradient-to-br from-primary/20 via-primary/5 to-transparent blur-3xl" />
        <div className="absolute -bottom-32 -left-24 h-[28rem] w-[28rem] rounded-full bg-gradient-to-tr from-accent/18 via-accent/5 to-transparent blur-3xl" />
        <div className="absolute left-1/2 top-1/2 h-px w-[min(90vw,48rem)] -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-transparent via-border/60 to-transparent opacity-60" />
      </div>

      <div className="relative z-10 w-full max-w-[400px]">
        <div
          className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_4px_6px_-1px_rgba(15,23,42,0.06),0_24px_48px_-12px_rgba(15,23,42,0.12),0_0_0_1px_rgba(255,255,255,0.8)_inset] 
          ring-1 ring-slate-900/[0.04]"
        >
          {/* Top brand strip — same white as logo PNG = no “box in box” */}
          <div className="border-b border-slate-100 bg-white px-8 pb-7 pt-8 text-center sm:px-10 sm:pb-8 sm:pt-9">
            <div className="mx-auto flex max-w-[260px] justify-center">
              <img
                src={zentroverseLogo}
                alt="ZentroFlow"
                className="h-auto w-full max-w-[220px] max-h-[104px] select-none object-contain object-center"
                width={220}
                height={104}
              />
            </div>
            <div className="mt-7 space-y-1.5">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-display sm:text-[1.65rem]">
                Welcome back
              </h1>
              <p className="text-[0.9375rem] leading-snug text-slate-500">Sign in to your ZentroFlow workspace</p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-5 px-8 py-8 sm:px-10 sm:py-9">
            <div className="space-y-2">
              <label htmlFor="login-email" className="text-sm font-semibold text-slate-800">
                Email
              </label>
              <div className="relative">
                <Mail
                  className="pointer-events-none absolute left-4 top-1/2 h-[1.125rem] w-[1.125rem] -translate-y-1/2 text-slate-400"
                  aria-hidden
                />
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="input-login pl-12 pr-4 sm:pl-[3.25rem]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="login-password" className="text-sm font-semibold text-slate-800">
                Password
              </label>
              <div className="relative">
                <Lock
                  className="pointer-events-none absolute left-4 top-1/2 h-[1.125rem] w-[1.125rem] -translate-y-1/2 text-slate-400"
                  aria-hidden
                />
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="input-login pl-12 pr-12 sm:pl-[3.25rem] sm:pr-14"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} strokeWidth={1.75} /> : <Eye size={18} strokeWidth={1.75} />}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-0.5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
              <label className="flex min-w-0 cursor-pointer items-center gap-2.5 text-sm text-slate-600 select-none">
                <input
                  type="checkbox"
                  className="h-4 w-4 shrink-0 rounded border-slate-300 text-primary focus:ring-primary/30 focus:ring-offset-0"
                />
                <span className="truncate">Remember me</span>
              </label>
              <button type="button" className="link-brand self-start sm:self-auto sm:shrink-0">
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              className="group relative mt-2 w-full overflow-hidden rounded-xl py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all duration-200 hover:shadow-xl hover:shadow-primary/30 active:scale-[0.99] gradient-primary"
            >
              <span className="relative z-10">Sign in</span>
              <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/15 to-white/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </button>

            <p className="pt-1 text-center text-xs text-slate-400">
              Protected access ·{" "}
              <span className="text-slate-500">Automotive revenue lifecycle platform</span>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Index;
