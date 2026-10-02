import { useState } from "react";
import { Link } from "react-router-dom";
import { Sparkles, Sun, Moon, ArrowLeft, Mail } from "lucide-react";
import { useTheme } from "../context/ThemeContext.jsx";
import api from "../api/axios.js";

export default function ForgotPassword() {
  const { theme, toggle } = useTheme();

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();

    setMessage("");
    setErr("");

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setErr("Please enter your email address.");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(cleanEmail)) {
      setErr("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      const res = await api.post("/auth/forgot-password", {
        email: cleanEmail,
      });

      setMessage(
        res.data?.message ||
          "If an account exists with that email, a reset link has been sent.",
      );
    } catch (e) {
      setErr(
        e.response?.data?.message ||
          "Unable to process your request. Please try again.",
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
          <h1 className="text-2xl font-semibold">Forgot your password?</h1>

          <p className="text-sm text-muted mt-1">
            Enter your email and we'll send you a link to reset your password.
          </p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            {/* Email */}
            <div>
              <label className="label" htmlFor="forgot-password-email">
                Email
              </label>

              <div className="relative">
                <input
                  id="forgot-password-email"
                  className="input pr-11"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);

                    if (err) setErr("");
                    if (message) setMessage("");
                  }}
                  placeholder="you@example.com"
                  autoComplete="email"
                  autoFocus
                />

                <Mail
                  size={18}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
                />
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
              {loading ? "Sending..." : "Send reset link"}
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
