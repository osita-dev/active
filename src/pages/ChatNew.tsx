import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

const ChatNew = () => {
  const { providerId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return navigate(`/login?next=/chat/new/${providerId}`);
      const uid = userData.user.id;
      if (!providerId) return navigate("/");

      // Find existing active conversation between this seeker and provider
      const { data: existing } = await supabase
        .from("conversations")
        .select("id")
        .eq("seeker_id", uid)
        .eq("provider_id", providerId)
        .eq("status", "active")
        .maybeSingle();

      if (existing) return navigate(`/chat/${existing.id}`);

      const { data: created, error } = await supabase
        .from("conversations")
        .insert({ seeker_id: uid, provider_id: providerId })
        .select("id")
        .single();

      if (error || !created) return navigate("/");
      navigate(`/chat/${created.id}`);
    })();
  }, [providerId, navigate]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-background text-muted-foreground" role="status">
      <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden />
      <p className="font-medium">Opening chat…</p>
    </div>
  );
};

export default ChatNew;
