import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { CheckCheck, Send } from "lucide-react";
import { supabase } from "@/lib/supabase";
import BackButton from "@/components/BackButton";
import ProviderAvatar from "@/components/ProviderAvatar";
import { VerifiedBadge } from "@/components/ProviderBits";

type Message = { id: string; sender_id: string; body: string; created_at: string };

// An empty chat box is intimidating — one tap gives people a good first message.
const STARTERS = ["Hi, are you available today?", "Can I get a quote?", "How soon can you come?"];

const Chat = () => {
  const { conversationId } = useParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [body, setBody] = useState("");
  const [me, setMe] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [provider, setProvider] = useState<{ name: string | null; photo: string | null }>({ name: null, photo: null });
  const bottom = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user && conversationId) window.location.href = `/login?next=/chat/${conversationId}`;
      setMe(data.user?.id ?? null);
    });
  }, [conversationId]);

  useEffect(() => {
    if (!conversationId) return;
    supabase
      .from("conversations")
      .select("provider_id, providers(business_name, photo_url)")
      .eq("id", conversationId)
      .maybeSingle()
      .then(({ data }: any) => setProvider({ name: data?.providers?.business_name ?? null, photo: data?.providers?.photo_url ?? null }));
    supabase
      .from("messages")
      .select("id, sender_id, body, created_at")
      .eq("conversation_id", conversationId)
      .gt("expires_at", new Date().toISOString())
      .order("created_at")
      .then(({ data }) => setMessages(data ?? []));

    const channel = supabase
      .channel(`convo-${conversationId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${conversationId}` },
        (payload) => setMessages((m) => [...m, payload.new as Message]),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    if (!body.trim() || !me || !conversationId) return;
    const text = body.trim();
    setBody("");
    setError(null);
    const { error } = await supabase.from("messages").insert({ conversation_id: conversationId, sender_id: me, body: text });
    if (error) setError(error.message);
  };

  const applyStarter = (text: string) => {
    setBody(text);
    inputRef.current?.focus();
  };

  return (
    <div className="flex h-dvh flex-col bg-background md:py-6">
      <div className="mx-auto flex min-h-0 w-full max-w-3xl flex-1 flex-col bg-card md:overflow-hidden md:rounded-3xl md:border md:border-border/80 md:shadow-card">
        {/* header */}
        <div className="flex items-center gap-3 border-b border-border bg-card px-4 py-3 pt-safe sm:px-5">
          <BackButton />
          <ProviderAvatar name={provider.name ?? "?"} src={provider.photo} size={44} rounded="xl" className="-ml-1" />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="truncate text-[17px] font-extrabold leading-tight text-foreground">{provider.name ?? "Chat"}</p>
              {provider.name && <VerifiedBadge className="h-4 w-4" />}
            </div>
            <p className="flex items-center gap-1.5 text-[13px] font-medium text-primary">
              <span className="h-2 w-2 rounded-full bg-primary" aria-hidden />
              Active
            </p>
          </div>
        </div>

        {/* messages */}
        <div className="min-h-0 flex-1 overflow-y-auto bg-background/60 px-4 py-5 sm:px-6">
          <div className="space-y-3">
            {messages.length === 0 && (
              <div className="mx-auto mt-6 max-w-xs text-center">
                <p className="font-bold text-foreground">Say hello 👋</p>
                <p className="mt-1 text-sm text-muted-foreground">Tell {provider.name ?? "them"} what you need and when.</p>
                <div className="mt-4 flex flex-col gap-2">
                  {STARTERS.map((s) => (
                    <button key={s} type="button" onClick={() => applyStarter(s)} className="chip justify-center border-input bg-card py-2.5 text-foreground/80 hover:border-primary/50 hover:text-primary">
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((m) => {
              const mine = m.sender_id === me;
              const time = new Date(m.created_at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
              return (
                <div key={m.id} className={`bubble-in flex ${mine ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-[15px] leading-snug sm:max-w-[70%] ${
                      mine ? "rounded-br-md bg-primary text-primary-foreground" : "rounded-bl-md bg-secondary text-foreground"
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">{m.body}</p>
                    <div className={`mt-1 flex items-center justify-end gap-1 text-[11px] ${mine ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                      {time}
                      {mine && <CheckCheck className="h-3.5 w-3.5" aria-label="Sent" />}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={bottom} />
          </div>
        </div>

        {error && (
          <p role="alert" className="border-t border-destructive/20 bg-destructive/10 px-5 py-2 text-sm font-medium text-destructive">
            {error}
          </p>
        )}

        {/* composer */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
          className="flex items-center gap-2.5 border-t border-border bg-card px-4 pb-safe pt-3 sm:px-5"
        >
          <input
            ref={inputRef}
            className="min-h-[48px] min-w-0 flex-1 rounded-full border border-input bg-background px-5 text-base outline-none transition placeholder:text-muted-foreground/70 focus:border-primary focus:ring-4 focus:ring-primary/15"
            placeholder="Type a message…"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            enterKeyHint="send"
          />
          <button
            type="submit"
            disabled={!body.trim()}
            aria-label="Send message"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-cta transition hover:bg-primary/90 active:scale-95 disabled:opacity-40 disabled:shadow-none"
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
