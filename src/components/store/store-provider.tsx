"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

export type CartLine = {
  productId: string;
  slug: string;
  name: string;
  priceCents: number;
  compareAtCents?: number | null;
  image?: string | null;
  stock: number;
  quantity: number;
};

type Toast = {
  id: number;
  message: string;
  type: "success" | "error" | "info";
};

type StoreContextValue = {
  lines: CartLine[];
  count: number;
  subtotal: number;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  add: (line: Omit<CartLine, "quantity"> & { quantity?: number }) => void;
  setQty: (productId: string, qty: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
  toasts: Toast[];
  toast: (message: string, type?: Toast["type"]) => void;
  dismissToast: (id: number) => void;
};

const StoreContext = createContext<StoreContextValue | null>(null);

const STORAGE_KEY = "ruqi_cart";

function loadCart(): CartLine[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (l) =>
        l &&
        typeof l.productId === "string" &&
        typeof l.quantity === "number"
    );
  } catch {
    return [];
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastId = useRef(0);

  useEffect(() => {
    setLines(loadCart());
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      // ignore quota errors
    }
  }, [lines]);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (message: string, type: Toast["type"] = "success") => {
      const id = ++toastId.current;
      setToasts((prev) => [...prev.slice(-2), { id, message, type }]);
      window.setTimeout(() => dismissToast(id), 3200);
    },
    [dismissToast]
  );

  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);

  const add = useCallback(
    (line: Omit<CartLine, "quantity"> & { quantity?: number }) => {
      const qty = Math.max(1, Math.min(line.stock || 999, line.quantity ?? 1));
      setLines((prev) => {
        const existing = prev.find((l) => l.productId === line.productId);
        if (existing) {
          return prev.map((l) =>
            l.productId === line.productId
              ? { ...l, quantity: Math.min(l.stock || 999, l.quantity + qty) }
              : l
          );
        }
        return [...prev, { ...line, quantity: qty }];
      });
      openCart();
    },
    [openCart]
  );

  const setQty = useCallback((productId: string, qty: number) => {
    setLines((prev) =>
      prev
        .map((l) => {
          if (l.productId !== productId) return l;
          const clamped = Math.max(1, Math.min(l.stock || 999, qty));
          return { ...l, quantity: clamped };
        })
        .filter((l) => l.quantity > 0)
    );
  }, []);

  const remove = useCallback((productId: string) => {
    setLines((prev) => prev.filter((l) => l.productId !== productId));
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const { count, subtotal } = useMemo(() => {
    return {
      count: lines.reduce((acc, l) => acc + l.quantity, 0),
      subtotal: lines.reduce((acc, l) => acc + l.priceCents * l.quantity, 0),
    };
  }, [lines]);

  const value = useMemo<StoreContextValue>(
    () => ({
      lines,
      count,
      subtotal,
      isCartOpen,
      openCart,
      closeCart,
      add,
      setQty,
      remove,
      clear,
      toasts,
      toast,
      dismissToast,
    }),
    [
      lines,
      count,
      subtotal,
      isCartOpen,
      openCart,
      closeCart,
      add,
      setQty,
      remove,
      clear,
      toasts,
      toast,
      dismissToast,
    ]
  );

  return (
    <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}