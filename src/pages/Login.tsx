import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { AlertCircle, Loader2, Mail } from "lucide-react";
import { supabase } from "@/lib/supabase";
import Logo from "@/components/Logo";
import BackButton from "@/components/BackButton";
import { GoogleIcon } from "@/components/icons";

const Login = () => {
  const [searchParams] = useSearchParams();
  const next = searchParams.get("next");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    setMsg(null);
    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({ email, password });
      setLoading(false);
      if (error) return setMsg(error.message);
      // If "Confirm email" is off in Supabase, this signs the user in immediately.
      window.location.href = next ?? "/provider/dashboard";
      return;
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return setMsg(error.message);
    window.location.href = next ?? "/provider/dashboard";
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!loading && email && password) submit();
  };

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <div className="mx-auto w-full max-w-md px-5 pt-5">
        <BackButton />
      </div>

      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-5 pb-16 pt-2 md:pb-24">
        <div className="md:surface md:rounded-[2rem] md:p-10">
          <div className="space-y-3 text-center">
            <div className="flex justify-center">
              <Logo variant="pin" className="text-[1.9rem]" />
            </div>
            <h1 className="pt-5 text-[1.75rem] font-extrabold leading-tight text-foreground">Sign in to Active</h1>
            <p className="mx-auto max-w-xs text-[15px] leading-relaxed text-muted-foreground">
              Your trusted platform for local service providers in Nigeria.
            </p>
          </div>

          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <label className="field">
              <Mail className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden />
              <span className="sr-only">Email address</span>
              <input
                type="email"
                inputMode="email"
                autoComplete="email"
                className="field-input py-4"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>

            <label className="field">
              <span className="sr-only">Password</span>
              <input
                type="password"
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                className="field-input py-4"
                placeholder="Password (min 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>

            <button type="submit" disabled={loading || !email || password.length < 6} className="btn btn-primary w-full">
              {loading && <Loader2 className="h-5 w-5 animate-spin" aria-hidden />}
              {loading ? "PLEASE WAIT…" : mode === "signup" ? "CREATE ACCOUNT" : "SIGN IN"}
            </button>

            <button
              type="button"
              className="block w-full text-center text-[15px] font-semibold text-primary"
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            >
              {mode === "signin" ? "New here? Create an account" : "Already have an account? Sign in"}
            </button>

            <div className="flex items-center gap-4 py-1" role="separator">
              <span className="h-px flex-1 bg-border" />
              <span className="text-sm font-medium text-muted-foreground">OR</span>
              <span className="h-px flex-1 bg-border" />
            </div>

            <button
              type="button"
              onClick={async () => {
                await supabase.auth.signInWithOAuth({
                  provider: "google",
                  options: { redirectTo: `${window.location.origin}${next ?? "/provider/dashboard"}` },
                });
              }}
              className="btn btn-neutral w-full gap-3 font-semibold tracking-normal"
            >
              <GoogleIcon className="h-5 w-5" />
              Continue with Google
            </button>
          </form>

          {msg && (
            <div role="alert" className="alert-error mt-5">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
              {msg}
            </div>
          )}
        </div>

        <Link to="/" className="mt-8 block text-center text-sm font-medium text-muted-foreground transition hover:text-foreground">
          Back to search
        </Link>
      </div>
    </div>
  );
};

export default Login;
