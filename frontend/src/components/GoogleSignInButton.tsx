"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: Record<string, unknown>) => void;
          renderButton: (el: HTMLElement, config: Record<string, unknown>) => void;
        };
      };
    };
  }
}

export default function GoogleSignInButton() {
  const btnRef = useRef<HTMLDivElement>(null);
  const { loginWithGoogle } = useAuth();
  const router = useRouter();
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!clientId || !btnRef.current) return;

    const init = () => {
      if (!window.google?.accounts?.id) return;

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response: { credential: string }) => {
          try {
            await loginWithGoogle(response.credential);
            router.push("/dashboard");
          } catch (e) {
            console.error(e);
            alert(e instanceof Error ? e.message : "Google sign-in failed");
          }
        },
      });

      window.google.accounts.id.renderButton(btnRef.current!, {
        theme: "outline",
        size: "large",
        width: 320,
        text: "continue_with",
        shape: "pill",
      });
    };

    if (window.google?.accounts?.id) {
      init();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = init;
    document.body.appendChild(script);

    return () => {
      script.remove();
    };
  }, [clientId, loginWithGoogle, router]);

  if (!clientId) {
    return (
      <p className="text-xs text-muted-foreground text-center font-mono">
        Set NEXT_PUBLIC_GOOGLE_CLIENT_ID in .env.local for Google login
      </p>
    );
  }

  return <div ref={btnRef} className="flex justify-center w-full" />;
}
