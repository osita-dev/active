import { useEffect, useState } from "react";
import { AlertCircle, Check, Info, Star } from "lucide-react";
import { supabase } from "@/lib/supabase";

const LABELS = ["", "Poor", "Fair", "Good", "Very good", "Excellent"];

const RateProvider = ({ providerId, onRated }: { providerId: string; onRated: () => void }) => {
  const [me, setMe] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [stars, setStars] = useState(5);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [state, setState] = useState<"idle" | "done" | "error">("idle");

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      const uid = data.user?.id;
      setMe(uid ?? null);
      if (!uid) return;
      const { data: convo } = await supabase
        .from("conversations")
        .select("id")
        .eq("seeker_id", uid)
        .eq("provider_id", providerId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      setConversationId(convo?.id ?? null);
    });
  }, [providerId]);

  if (!me || !conversationId) return null; // only seekers who contacted can rate

  if (state === "done")
    return (
      <div className="surface flex flex-col items-center px-6 py-8 text-center" role="status">
        <span className="pop-in flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Check className="h-7 w-7" strokeWidth={3} aria-hidden />
        </span>
        <p className="mt-4 text-lg font-extrabold text-foreground">Thanks for rating</p>
        <p className="mt-1 text-sm text-muted-foreground">Your feedback helps others choose with confidence.</p>
      </div>
    );

  const submit = async () => {
    const { error } = await supabase.from("ratings").insert({
      provider_id: providerId,
      seeker_id: me,
      conversation_id: conversationId,
      stars,
      comment: comment.trim() || null,
    });
    if (error) return setState("error");
    setState("done");
    onRated();
  };

  const shown = hover || stars;

  return (
    <div className="surface space-y-5 p-5 sm:p-6">
      <h2 className="text-center text-lg font-extrabold text-foreground">How was your experience?</h2>

      <div>
        <div role="radiogroup" aria-label="Your rating" className="flex justify-center gap-1.5" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((s) => (
            <button
              key={s}
              type="button"
              role="radio"
              aria-checked={s === stars}
              aria-label={`${s} ${s === 1 ? "star" : "stars"}`}
              onClick={() => setStars(s)}
              onMouseEnter={() => setHover(s)}
              className="rounded-lg p-1 transition active:scale-90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
            >
              <Star className={`h-10 w-10 transition-colors ${s <= shown ? "fill-amber-400 text-amber-400" : "fill-transparent text-border"}`} strokeWidth={1.5} />
            </button>
          ))}
        </div>
        <p className="mt-1 h-5 text-center text-sm font-semibold text-muted-foreground" aria-live="polite">
          {LABELS[shown]}
        </p>
      </div>

      <div className="rounded-2xl border border-input bg-card p-4 transition focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/15">
        <label htmlFor="rate-comment" className="sr-only">
          Comment
        </label>
        <textarea
          id="rate-comment"
          className="field-input min-h-[88px] resize-none text-base"
          rows={3}
          maxLength={500}
          placeholder="Add a comment (optional)…"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <p className="mt-1 text-right text-xs text-muted-foreground">{comment.length}/500</p>
      </div>

      <button type="button" onClick={submit} className="btn btn-primary w-full">
        SUBMIT RATING
      </button>

      {state === "error" && (
        <div role="alert" className="alert-error">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
          Could not submit. You may have already rated via this conversation.
        </div>
      )}

      <p className="flex items-center justify-center gap-2 text-[13px] text-muted-foreground">
        <Info className="h-4 w-4 shrink-0" aria-hidden />
        You can rate after messaging this provider.
      </p>
    </div>
  );
};

export default RateProvider;
