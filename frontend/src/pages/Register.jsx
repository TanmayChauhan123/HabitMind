import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Sparkles, Sun, Moon, Eye, EyeOff, Check, X } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";

export default function Register() {
  const { user, register } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/dashboard" replace />;

  const set = (k) => (e) => {
    setForm((prev) => ({
      ...prev,
      [k]: e.target.value,
    }));

    if (err) setErr("");
  };

  const passwordChecks = {
    length: form.password.length >= 6,
    letter: /[A-Za-z]/.test(form.password),
    number: /\d/.test(form.password),
  };

  const submit = async (e) => {
    e.preventDefault();
    setErr("");

    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();
    const password = form.password;

    // Name validation
    if (!name) {
      setErr("Please enter your name.");
      return;
    }

    if (name.length < 2) {
      setErr("Name must be at least 2 characters.");
      return;
    }

    // Email validation
    if (!email) {
      setErr("Please enter your email address.");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setErr("Please enter a valid email address.");
      return;
    }

    // Password validation
    if (password.length < 6) {
      setErr("Password must be at least 6 characters.");
      return;
    }

    if (!/[A-Za-z]/.test(password)) {
      setErr("Password must contain at least one letter.");
      return;
    }

    if (!/\d/.test(password)) {
      setErr("Password must contain at least one number.");
      return;
    }

    setLoading(true);

    try {
      await register(name, email, password);

      navigate("/dashboard", {
        replace: true,
      });
    } catch (e) {
      setErr(
        e.response?.data?.message ||
          "Unable to create your account. Please try again.",
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
        <Link to="/" className="flex items-center justify-center gap-2 mb-6">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white flex items-center justify-center shadow-lg shadow-brand-500/30">
            <Sparkles size={18} />
          </div>

          <span className="font-semibold text-lg">HabitMind</span>
        </Link>

        <div className="card p-7">
          <h1 className="text-2xl font-semibold">Create your account</h1>

          <p className="text-sm text-muted mt-1">
            Free forever. Takes 30 seconds.
          </p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            {/* Name */}
            <div>
              <label className="label" htmlFor="register-name">
                Name
              </label>

              <input
                id="register-name"
                className="input"
                value={form.name}
                onChange={set("name")}
                placeholder="Your name"
                autoComplete="name"
                autoFocus
              />
            </div>

            {/* Email */}
            <div>
              <label className="label" htmlFor="register-email">
                Email
              </label>

              <input
                id="register-email"
                className="input"
                type="email"
                value={form.email}
                onChange={set("email")}
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div>
              <label className="label" htmlFor="register-password">
                Password
              </label>

              <div className="relative">
                <input
                  id="register-password"
                  className="input pr-11"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={set("password")}
                  placeholder="At least 6 characters"
                  autoComplete="new-password"
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

              {/* Password requirements */}
              {form.password && (
                <div className="mt-3 space-y-1.5 text-xs">
                  <PasswordCheck
                    valid={passwordChecks.length}
                    text="At least 6 characters"
                  />

                  <PasswordCheck
                    valid={passwordChecks.letter}
                    text="Contains a letter"
                  />

                  <PasswordCheck
                    valid={passwordChecks.number}
                    text="Contains a number"
                  />
                </div>
              )}
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
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <div className="text-center mt-5 text-sm text-soft">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-brand-600 dark:text-brand-300 font-medium hover:underline"
            >
              Log in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function PasswordCheck({ valid, text }) {
  return (
    <div
      className={`flex items-center gap-1.5 ${
        valid ? "text-emerald-500" : "text-[var(--text-muted)]"
      }`}
    >
      {valid ? <Check size={14} /> : <X size={14} />}
      <span>{text}</span>
    </div>
  );
}
