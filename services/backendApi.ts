import Constants from "expo-constants";
import { Platform } from "react-native";

export type PaymentStatus = "pending" | "paid" | "failed";

export type Payment = {
  id: number;
  amount: number; // cents
  method: string;
  status: PaymentStatus;
  metadata: unknown | null;
  createdAt: string;
  updatedAt: string;
};

type ApiError = {
  error?: string;
  message?: string;
};

function normalizeBaseUrl(url: string) {
  return url.replace(/\/+$/, "");
}

type ApiResolution = { baseUrl: string; demo: boolean };

function isExplicitDemoModeEnabled() {
  return process.env.EXPO_PUBLIC_DEMO_MODE === "true";
}

function isIpAddress(host: string) {
  // IPv4 only is enough for local dev
  return /^\d{1,3}(?:\.\d{1,3}){3}$/.test(host);
}

function demoBaseUrl() {
  return "demo://local";
}

function getDebuggerHost(): string | null {
  const debuggerHost =
    // Classic manifest
    (Constants as any).manifest?.debuggerHost ??
    // Newer manifest format
    (Constants as any).manifest2?.extra?.expoGo?.debuggerHost ??
    // Sometimes present in expoConfig
    (Constants as any).expoConfig?.hostUri;

  if (typeof debuggerHost !== "string" || debuggerHost.length === 0)
    return null;
  return debuggerHost;
}

function resolveApi(): ApiResolution {
  // Highest priority: explicit demo mode
  if (isExplicitDemoModeEnabled())
    return { baseUrl: demoBaseUrl(), demo: true };

  // Second priority: explicit API URL
  const envApiUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envApiUrl) return { baseUrl: normalizeBaseUrl(envApiUrl), demo: false };

  // Expo Go / dev client: try to derive the host from the Metro/dev host.
  const dbg = getDebuggerHost();
  if (dbg) {
    const host = dbg.split(":")[0];

    // LAN mode usually exposes a raw IP. Good: we can reach http://<ip>:4000
    if (host && host !== "localhost" && isIpAddress(host)) {
      return { baseUrl: `http://${host}:4000`, demo: false };
    }

    // Tunnel mode usually exposes a domain (*.exp.direct). Bad: you can't reach
    // your local backend from there. Auto-fallback to demo so Expo Go works.
    if (host && host !== "localhost") {
      return { baseUrl: demoBaseUrl(), demo: true };
    }
  }

  // Defaults that work for common dev setups.
  // - Android emulator: 10.0.2.2 reaches the host machine
  // - iOS simulator + web: localhost reaches the host machine
  if (Platform.OS === "android")
    return { baseUrl: "http://10.0.2.2:4000", demo: false };
  return { baseUrl: "http://localhost:4000", demo: false };
}

export function isDemoMode() {
  return resolveApi().demo;
}

type DemoState = {
  nextId: number;
  payments: Payment[];
};

const DEMO_STORAGE_KEY = "banana_demo_payments_v1";

function loadDemoState(): DemoState {
  const initial: DemoState = { nextId: 1, payments: [] };
  if (Platform.OS !== "web") return initial;
  try {
    const raw = globalThis?.localStorage?.getItem(DEMO_STORAGE_KEY);
    if (!raw) return initial;
    const parsed = JSON.parse(raw) as DemoState;
    if (
      !parsed ||
      typeof parsed.nextId !== "number" ||
      !Array.isArray(parsed.payments)
    ) {
      return initial;
    }
    return parsed;
  } catch {
    return initial;
  }
}

function saveDemoState(state: DemoState) {
  if (Platform.OS !== "web") return;
  try {
    globalThis?.localStorage?.setItem(DEMO_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

let inMemoryDemoState: DemoState | null = null;
function getDemoState(): DemoState {
  if (!inMemoryDemoState) inMemoryDemoState = loadDemoState();
  return inMemoryDemoState;
}

export function getApiBaseUrl() {
  return resolveApi().baseUrl;
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${getApiBaseUrl()}${path}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  const text = await res.text();
  const data = text ? (JSON.parse(text) as unknown) : null;

  if (!res.ok) {
    const err = (data ?? {}) as ApiError;
    throw new Error(err.error || err.message || `HTTP ${res.status}`);
  }

  return data as T;
}

export async function createPayment(input: {
  amount: number;
  method: string;
  metadata?: Record<string, unknown>;
}): Promise<Payment> {
  if (isDemoMode()) {
    const state = getDemoState();
    const now = new Date().toISOString();
    const payment: Payment = {
      id: state.nextId,
      amount: input.amount,
      method: input.method,
      status: "pending",
      metadata: input.metadata ?? null,
      createdAt: now,
      updatedAt: now,
    };
    state.nextId += 1;
    state.payments.unshift(payment);
    saveDemoState(state);
    return payment;
  }

  return requestJson<Payment>("/payments", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function getPayment(id: number): Promise<Payment> {
  if (isDemoMode()) {
    const state = getDemoState();
    const found = state.payments.find((p) => p.id === id);
    if (!found) throw new Error("not found");
    return found;
  }

  return requestJson<Payment>(`/payments/${id}`);
}

export async function confirmPayment(
  id: number,
  status: Exclude<PaymentStatus, "pending">
) {
  if (isDemoMode()) {
    const state = getDemoState();
    const idx = state.payments.findIndex((p) => p.id === id);
    if (idx < 0) throw new Error("not found");

    const existing = state.payments[idx];
    const updated: Payment = {
      ...existing,
      status,
      updatedAt: new Date().toISOString(),
    };
    state.payments[idx] = updated;
    saveDemoState(state);
    return updated;
  }

  return requestJson<Payment>(`/payments/${id}/confirm`, {
    method: "POST",
    body: JSON.stringify({ status }),
  });
}
