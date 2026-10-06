import { useState } from "react";
import { Check, ChevronRight, Flag } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

const QUICK_REASONS = ["Spam / unsolicited message", "Fake profile", "Harassment", "Low quality service"];

const ReportButton = ({ providerId, conversationId }: { providerId?: string; conversationId?: string }) => {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const submit = async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) return void toast.error("Sign in to report.");
    if (!reason.trim()) return;
    setSending(true);
    await supabase.from("reports").insert({
      reporter_id: data.user.id,
      reported_provider_id: providerId ?? null,
      conversation_id: conversationId ?? null,
      reason: reason.trim(),
    });
    setSending(false);
    setSent(true);
    setOpen(false);
  };

  if (sent)
    return (
      <p className="flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3.5 text-sm font-medium text-muted-foreground" role="status">
        <Check className="h-4 w-4 text-primary" aria-hidden />
        Report submitted. Thank you for keeping Active safe.
      </p>
    );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3.5 text-left text-[15px] font-medium text-foreground/80 transition hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
      >
        <Flag className="h-[18px] w-[18px] text-muted-foreground" aria-hidden />
        <span className="flex-1">Report provider</span>
        <ChevronRight className="h-5 w-5 text-muted-foreground/60" aria-hidden />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-md gap-5 rounded-3xl border-border p-6">
          <div className="space-y-1.5 pr-6">
            <DialogTitle className="text-xl font-extrabold">Report this provider</DialogTitle>
            <DialogDescription className="text-[15px]">Tell us what went wrong. Our team reviews every report.</DialogDescription>
          </div>

          <div className="flex flex-wrap gap-2">
            {QUICK_REASONS.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setReason(r)}
                aria-pressed={reason === r}
                className={`chip ${reason === r ? "border-primary bg-primary/10 text-primary" : "border-input bg-card text-foreground/80 hover:border-primary/50"}`}
              >
                {r}
              </button>
            ))}
          </div>

          <div className="rounded-2xl border border-input bg-card p-4 transition focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/15">
            <label htmlFor="report-reason" className="sr-only">
              What went wrong?
            </label>
            <textarea id="report-reason" className="field-input min-h-[88px] resize-none text-base" rows={3} placeholder="What went wrong?" value={reason} onChange={(e) => setReason(e.target.value)} />
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={() => setOpen(false)} className="btn btn-neutral flex-1">
              Cancel
            </button>
            <button type="button" onClick={submit} disabled={!reason.trim() || sending} className="btn btn-primary flex-1">
              {sending ? "SENDING…" : "SUBMIT"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ReportButton;
