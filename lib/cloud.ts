import AsyncStorage from '@react-native-async-storage/async-storage';
import { CONFIG } from '@/config';

/**
 * E-posta kodu ile giriş + verinin bulutta saklanması (Supabase REST, ek paket gerekmez).
 * Aynı e-postayla başka telefondan girilince aynı hesap ve veriler açılır.
 */
const SESSION_KEY = 'planim-session-v1';

export interface Session { accessToken: string; refreshToken: string; expiresAt: number; userId: string; email: string }

export const cloudConfigured = () => !!CONFIG.supabaseUrl && !!CONFIG.supabaseAnonKey;

const base = () => CONFIG.supabaseUrl.replace(/\/$/, '');
const baseHeaders = (token?: string) => ({ apikey: CONFIG.supabaseAnonKey, 'Content-Type': 'application/json', Authorization: `Bearer ${token ?? CONFIG.supabaseAnonKey}` });

async function json(res: Response) {
  const text = await res.text();
  let body: unknown = null;
  try { body = text ? JSON.parse(text) : null; } catch { body = text; }
  if (!res.ok) {
    const msg = (body as { msg?: string; message?: string; error_description?: string } | null);
    throw new Error(msg?.msg || msg?.message || msg?.error_description || `HTTP ${res.status}`);
  }
  return body;
}

const toSession = (data: any, email: string): Session => ({
  accessToken: data.access_token,
  refreshToken: data.refresh_token,
  expiresAt: Date.now() + (Number(data.expires_in) || 3600) * 1000,
  userId: data.user?.id ?? '',
  email: data.user?.email ?? email,
});

/** E-postaya 6 haneli giriş kodu yollar. Hesap yoksa kendiliğinden oluşturulur. */
export async function requestCode(email: string) {
  await json(await fetch(`${base()}/auth/v1/otp`, { method: 'POST', headers: baseHeaders(), body: JSON.stringify({ email, create_user: true }) }));
}

export async function verifyCode(email: string, token: string): Promise<Session> {
  const data = await json(await fetch(`${base()}/auth/v1/verify`, { method: 'POST', headers: baseHeaders(), body: JSON.stringify({ type: 'email', email, token }) }));
  const session = toSession(data, email);
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export async function loadSession(): Promise<Session | null> {
  try {
    const raw = await AsyncStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch { return null; }
}

export async function clearSession() { try { await AsyncStorage.removeItem(SESSION_KEY); } catch { /* yoksay */ } }

/** Süresi dolmak üzere ise yeniler. Başaramazsa null (kullanıcı yeniden giriş yapmalı). */
export async function freshSession(): Promise<Session | null> {
  const session = await loadSession();
  if (!session) return null;
  if (session.expiresAt - Date.now() > 60_000) return session;
  try {
    const data = await json(await fetch(`${base()}/auth/v1/token?grant_type=refresh_token`, { method: 'POST', headers: baseHeaders(), body: JSON.stringify({ refresh_token: session.refreshToken }) }));
    const next = toSession(data, session.email);
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(next));
    return next;
  } catch { return null; }
}

export async function pullState<T>(): Promise<T | null> {
  const session = await freshSession();
  if (!session) throw new Error('no-session');
  const rows = (await json(await fetch(`${base()}/rest/v1/planim_state?user_id=eq.${session.userId}&select=data`, { headers: baseHeaders(session.accessToken) }))) as Array<{ data: T }>;
  return rows[0]?.data ?? null;
}

export async function pushState(data: unknown) {
  const session = await freshSession();
  if (!session) throw new Error('no-session');
  await json(await fetch(`${base()}/rest/v1/planim_state`, {
    method: 'POST',
    headers: { ...baseHeaders(session.accessToken), Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify({ user_id: session.userId, data, updated_at: new Date().toISOString() }),
  }));
}

/** E-posta değiştirme: yeni adrese kod gider, kod doğrulanınca hesap yeni e-postaya taşınır (veriler korunur). */
export async function requestEmailChange(newEmail: string) {
  const session = await freshSession();
  if (!session) throw new Error('no-session');
  await json(await fetch(`${base()}/auth/v1/user`, { method: 'PUT', headers: baseHeaders(session.accessToken), body: JSON.stringify({ email: newEmail }) }));
}

export async function verifyEmailChange(newEmail: string, token: string): Promise<Session> {
  const data = await json(await fetch(`${base()}/auth/v1/verify`, { method: 'POST', headers: baseHeaders(), body: JSON.stringify({ type: 'email_change', email: newEmail, token }) }));
  const session = toSession(data, newEmail);
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}
