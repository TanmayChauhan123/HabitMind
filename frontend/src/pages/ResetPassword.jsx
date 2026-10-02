import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  Sparkles,
  Sun,
  Moon,
  Eye,
  EyeOff,
  ArrowLeft,
  Lock,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext.jsx";
import api from "../api/axios.js";

export default function ResetPassword() {
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [err, setErr] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();

    setErr("");
    setMessage("");

    if (!token) {
      setErr("This password reset link is invalid.");
      return;
    }

    if (!password) {
      setErr("Please enter a new password.");
      return;
    }

    if (password.length < 6) {
      setErr("Password must be at least 6 characters.");
      return;
    }

    if (password.length > 128) {
      setErr("Password must be 128 characters or less.");
      return;
    }

    if (!/[A-Za-z]/.test(password)) {
      setErr("Password must contain at least one letter.");
      return;
    }

    if (!/[0-9]/.test(password)) {
      setErr("Password must contain at least one number.");
      return;
    }

    if (password !== confirmPassword) {
      setErr("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await api.post(
        `/auth/reset-password?token=${encodeURIComponent(token)}`,
        {
          password,
        },
      );

      setMessage(res.data?.message || "Password reset successfully.");

      setPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 1500);
    } catch (e) {
      setErr(
        e.response?.data?.message ||
          "Unable to reset your password. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Theme toggle */}
      <button
        onClick={toggle}
        className="fixed top-4 right-4 p-2.5 rounded-xl glass"
        aria-label="Toggle theme"
      >
        {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
      </button>

      <div className="w-full max-w-md">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2 mb-6">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white flex items-center justify-center shadow-lg shadow-brand-500/30">
            <Sparkles size={18} />
          </div>

          <span className="font-semibold text-lg">HabitMind</span>
        </Link>

        <div className="card p-7">
          <h1 className="text-2xl font-semibold">Create a new password</h1>

          <p className="text-sm text-muted mt-1">
            Choose a strong password for your HabitMind account.
          </p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            {/* New password */}
            <div>
              <label className="label" htmlFor="reset-password">
                New password
              </label>

              <div className="relative">
                <input
                  id="reset-password"
                  className="input pr-11"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (err) setErr("");
                    if (message) setMessage("");
                  }}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  autoFocus
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-[var(--text)] transition"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm password */}
            <div>
              <label className="label" htmlFor="confirm-password">
                Confirm password
              </label>

              <div className="relative">
                <input
                  id="confirm-password"
                  className="input pr-11"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (err) setErr("");
                    if (message) setMessage("");
                  }}
                  placeholder="••••••••"
                  autoComplete="new-password"
                />

                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-[var(--text)] transition"
                  aria-label={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            {/* Password requirements */}
            <div className="text-xs text-muted space-y-1">
              <p>Password must:</p>
              <p>• Be 6–128 characters</p>
              <p>• Contain at least one letter</p>
              <p>• Contain at least one number</p>
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

            {/* Success */}
            {message && (
              <div
                role="status"
                className="text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2"
              >
                {message}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              className="btn-primary w-full py-3"
              disabled={loading}
            >
              {loading ? "Resetting..." : "Reset password"}
            </button>
          </form>

          {/* Back to login */}
          <div className="text-center mt-5 text-sm text-soft">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-brand-600 dark:text-brand-300 font-medium hover:underline"
            >
              <ArrowLeft size={14} />
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
