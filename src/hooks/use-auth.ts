import { useCallback, useEffect, useState } from "react";
import { auth, type User } from "@/lib/auth";

const EVT = "tw-auth-changed";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);

  const refresh = useCallback(() => setUser(auth.getCurrentUser()), []);

  useEffect(() => {
    refresh();
    const handler = () => refresh();
    window.addEventListener(EVT, handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener(EVT, handler);
      window.removeEventListener("storage", handler);
    };
  }, [refresh]);

  return { user, refresh };
}

export function notifyAuthChanged() {
  window.dispatchEvent(new Event(EVT));
}
