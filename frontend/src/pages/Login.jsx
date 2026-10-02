
import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import {
  Sparkles,
  Sun,
  Moon,
  Eye,
  EyeOff,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";

export default function Login() {
  const { user, login } = useAuth();
  const { theme, toggle } = useTheme();
  const loc = useLocation();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/dashboard" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setErr("");

    const cleanEmail = email.trim().toLowerCase();

    // Frontend validation
    if (!cleanEmail) {
      setErr("Please enter your email address.");
      return;
    }

    if (!password) {
      setErr("Please enter your password.");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(cleanEmail)) {
      setErr("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      await login(cleanEmail, password);

      navigate(loc.state?.from || "/dashboard", {
        replace: true,
      });
    } catch (e) {
      setErr(
        e.response?.data?.message ||
          "Unable to sign in. Please check your credentials and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <button
        onClick={toggle}
        className="fixed top-4 right-4 p-2.5 rounded-xl glass"
        aria-label="Toggle theme"
      >
        {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
      </button>

      <div className="w-full max-w-md">
        <Link
          to="/"
          className="flex items-center justify-center gap-2 mb-6"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white flex items-center justify-center shadow-lg shadow-brand-500/30">
            <Sparkles size={18} />
          </div>

          <span className="font-semibold text-lg">
            HabitMind
          </span>
        </Link>

        <div className="card p-7">
          <h1 className="text-2xl font-semibold">
            Welcome back
          </h1>

          <p className="text-sm text-muted mt-1">
            Log in to continue your streaks.
          </p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            {/* Email */}
            <div>
              <label className="label" htmlFor="login-email">
                Email
              </label>

              <input
                id="login-email"
                className="input"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (err) setErr("");
                }}
                placeholder="you@example.com"
                autoComplete="email"
                autoFocus
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  className="label !mb-0"
                  htmlFor="login-password"
                >
                  Password
                </label>

                <Link
                  to="/forgot-password"
                  className="text-xs text-brand-600 dark:text-brand-300 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              <div className="relative">
                <input
                  id="login-password"
                  className="input pr-11"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (err) setErr("");
                  }}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword((prev) => !prev)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-[var(--text)] transition"
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {err && (
              <div
                role="alert"
                className="text-sm text-rose-500 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2"
              >
                {err}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              className="btn-primary w-full py-3"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div className="text-center mt-5 text-sm text-soft">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-brand-600 dark:text-brand-300 font-medium hover:underline"
            >
              Create one
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};