import { useState } from "react";
import { Sparkles, Check, RefreshCw } from "lucide-react";
import Modal from "./Modal.jsx";
import api from "../api/axios.js";
import HabitIcon from "./HabitIcon.jsx";

export default function HabitSuggestionModal({ open, onClose, onAccept }) {
  const [step, setStep] = useState(0);
  const [goals, setGoals] = useState("");
  const [productiveTime, setProductiveTime] = useState("");
  const [struggles, setStruggles] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState({});

  const reset = () => {
    setStep(0);
    setGoals("");
    setProductiveTime("");
    setStruggles("");
    setSuggestions([]);
    setAdded({});
  };

  const close = () => {
    reset();
    onClose();
  };

  const submit = async () => {
    setLoading(true);

    try {
      const res = await api.post("/ai/suggest-habits", {
        goals,
        productiveTime,
        struggles,
      });

      setSuggestions(res.data.suggestions || []);
      setStep(3);
    } finally {
      setLoading(false);
    }
  };

  const accept = async (s, idx) => {
    await onAccept(s);
    setAdded((a) => ({
      ...a,
      [idx]: true,
    }));
  };

  return (
    <Modal
      open={open}
      onClose={close}
      title="AI Habit Suggestions"
      maxWidth="max-w-2xl"
    >
      {/* STEP 0 */}
      {step === 0 && (
        <div className="space-y-4">
          <div className="text-sm text-soft">
            Answer 3 quick questions and I'll suggest 3 personalised habits.
          </div>

          <div>
            <label className="label">What are your goals right now?</label>

            <textarea
              className="input resize-none"
              rows={3}
              placeholder="e.g. Get fitter, read more, reduce phone time..."
              value={goals}
              onChange={(e) => setGoals(e.target.value)}
              autoFocus
            />
          </div>

          <div className="flex justify-end gap-2">
            <button className="btn-secondary" onClick={close}>
              Cancel
            </button>

            <button
              className="btn-primary"
              onClick={() => setStep(1)}
              disabled={!goals.trim()}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* STEP 1 */}
      {step === 1 && (
        <div className="space-y-4">
          <div>
            <label className="label">
              When are you most productive during the day?
            </label>

            <textarea
              className="input resize-none"
              rows={3}
              placeholder="e.g. Early morning, late evenings..."
              value={productiveTime}
              onChange={(e) => setProductiveTime(e.target.value)}
              autoFocus
            />
          </div>

          <div className="flex justify-between gap-2">
            <button className="btn-ghost" onClick={() => setStep(0)}>
              Back
            </button>

            <button
              className="btn-primary"
              onClick={() => setStep(2)}
              disabled={!productiveTime.trim()}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <div className="space-y-4">
          <div>
            <label className="label">
              What habits have you struggled with?
            </label>

            <textarea
              className="input resize-none"
              rows={3}
              placeholder="e.g. Gym in the morning, journaling at night..."
              value={struggles}
              onChange={(e) => setStruggles(e.target.value)}
              autoFocus
            />
          </div>

          <div className="flex justify-between gap-2">
            <button className="btn-ghost" onClick={() => setStep(1)}>
              Back
            </button>

            <button
              className="btn-primary"
              onClick={submit}
              disabled={loading || !struggles.trim()}
            >
              {loading ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  Thinking...
                </>
              ) : (
                <>
                  <Sparkles size={14} />
                  Get suggestions
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STEP 3 */}
      {step === 3 && (
        <div className="space-y-4">
          {suggestions.length === 0 && (
            <div className="text-sm text-muted text-center py-8">
              No suggestions returned. Try again.
            </div>
          )}

          {suggestions.map((s, i) => (
            <div
              key={i}
              className="
                group relative overflow-hidden
                rounded-2xl
                border border-white/10
                bg-gradient-to-br from-white/[0.07] to-white/[0.025]
                p-4
                transition-all duration-300
                hover:-translate-y-1
                hover:border-brand-500/30
                hover:shadow-lg
                hover:shadow-brand-500/10
              "
            >
              {/* Decorative glow */}
              <div
                className="
                  absolute -right-10 -top-10
                  h-24 w-24
                  rounded-full
                  bg-brand-500/10
                  blur-2xl
                  transition-all duration-300
                  group-hover:bg-brand-500/20
                "
              />

              <div className="relative">
                {/* Header */}
                <div className="flex items-start gap-3">
                  {/* Habit icon */}
                  <div
                    className="
                      flex h-12 w-12 shrink-0
                      items-center justify-center
                      rounded-2xl
                      border border-white/10
                      bg-white/[0.08]
                      text-brand-300
                      shadow-inner
                      transition-transform duration-300
                      group-hover:scale-110
                    "
                  >
                    <HabitIcon icon={s.icon} size={25} />
                  </div>

                  {/* Name + badges */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-base font-semibold leading-tight text-white">
                        {s.name}
                      </h3>
                    </div>

                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <span className="chip">{s.category}</span>

                      <span className="chip">{s.frequency}</span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="mt-4 text-sm leading-6 text-soft">
                  {s.description}
                </p>

                {/* Why this habit */}
                {s.reason && (
                  <div
                    className="
                      mt-4 rounded-xl
                      border border-brand-500/10
                      bg-brand-500/[0.07]
                      px-3 py-2.5
                    "
                  >
                    <div
                      className="
                        mb-1 flex items-center gap-1.5
                        text-xs font-semibold
                        text-brand-300
                      "
                    >
                      <Sparkles size={13} />
                      Why this fits you
                    </div>

                    <p className="text-xs leading-5 text-brand-200/80">
                      {s.reason}
                    </p>
                  </div>
                )}

                {/* Bottom action */}
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs text-muted">AI suggested</span>

                  {added[i] ? (
                    <div
                      className="
                        flex items-center gap-1.5
                        rounded-lg
                        bg-emerald-500/10
                        px-3 py-2
                        text-sm font-medium
                        text-emerald-400
                      "
                    >
                      <Check size={15} />
                      Added
                    </div>
                  ) : (
                    <button
                      className="
                        btn-primary
                        flex items-center gap-2
                        transition-all duration-200
                        group-hover:scale-[1.02]
                      "
                      onClick={() => accept(s, i)}
                    >
                      <span>＋</span>
                      Add habit
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Done */}
          <div className="flex justify-end pt-1">
            <button className="btn-secondary" onClick={close}>
              Done
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
