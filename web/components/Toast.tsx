"use client";

import { createContext, useCallback, useContext, useState } from "react";

type ToastItem = { id: number; message: string };
const ToastCtx = createContext<(msg: string) => void>(() => {});

export function useToast(): (msg: string) => void {
  return useContext(ToastCtx);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const push = useCallback((message: string) => {
    const id = Date.now() + Math.random();
    setItems((prev) => [...prev, { id, message }]);
    setTimeout(() => setItems((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div aria-live="polite" role="status" style={{ position: "fixed", bottom: 16, right: 16, display: "grid", gap: 8, zIndex: 50 }}>
        {items.map((t) => (
          <div key={t.id} className="card" style={{ padding: "12px 16px" }}>{t.message}</div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
