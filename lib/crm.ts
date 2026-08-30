import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { getSessionPayload, SESSION_COOKIE_NAME } from "@/lib/auth";

const CRM_URL = "https://rhtplqtsbvhrdkukxdij.supabase.co";
const CRM_PUBLISHABLE_KEY = "sb_publishable_aQkiaEcqYnIzwvx1-tNO-A_n2Cndg1w";
export const CRM_OWNER_EMAIL = "igorpachecotrafego@gmail.com";

export interface CrmBootstrap {
  lists: Record<string, unknown>[];
  contacts: Record<string, unknown>[];
  trash: Record<string, unknown>[];
  tasks: Record<string, unknown>[];
  activities: Record<string, unknown>[];
  settings: Record<string, unknown> | null;
}

function createCrmClient(apiSecret: string) {
  return createClient(CRM_URL, CRM_PUBLISHABLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: {
      headers: {
        "x-crm-owner-email": CRM_OWNER_EMAIL,
        "x-crm-api-secret": apiSecret,
      },
    },
  });
}

function readableError(error: { message?: string } | null): string {
  const message = error?.message ?? "Não foi possível acessar o CRM";
  if (message.includes("Acesso negado")) return "Senha incorreta";
  return message;
}

export async function authenticateCrm(apiSecret: string): Promise<boolean> {
  const client = createCrmClient(apiSecret);
  const { error } = await client.rpc("crm_bootstrap_v2", {
    p_owner_email: CRM_OWNER_EMAIL,
  });
  if (!error) return true;
  if (error.message.includes("Acesso negado")) return false;
  throw new Error(readableError(error));
}

export async function authenticateCrmLogin(
  apiSecret: string,
  fingerprint: string
): Promise<{ valid: boolean; locked: boolean; retry_after_minutes?: number; attempts_remaining?: number }> {
  const client = createCrmClient(apiSecret);
  const { data, error } = await client.rpc("crm_authenticate", {
    p_secret: apiSecret,
    p_fingerprint: fingerprint,
  });
  if (error) throw new Error(readableError(error));
  return data as { valid: boolean; locked: boolean; retry_after_minutes?: number; attempts_remaining?: number };
}

async function getApiSecretFromSession(): Promise<string> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? getSessionPayload(token) : null;
  if (!session?.apiSecret) throw new Error("Sessão inválida ou expirada");
  return session.apiSecret;
}

export async function bootstrapCrm(): Promise<CrmBootstrap> {
  const apiSecret = await getApiSecretFromSession();
  const client = createCrmClient(apiSecret);
  const { data, error } = await client.rpc("crm_bootstrap_v2", {
    p_owner_email: CRM_OWNER_EMAIL,
  });
  if (error) throw new Error(readableError(error));
  return data as CrmBootstrap;
}

export async function mutateCrm<T = Record<string, unknown>>(
  action: string,
  payload: Record<string, unknown> = {}
): Promise<T> {
  const apiSecret = await getApiSecretFromSession();
  const client = createCrmClient(apiSecret);
  const { data, error } = await client.rpc("crm_mutate_v2", {
    p_owner_email: CRM_OWNER_EMAIL,
    p_action: action,
    p_payload: payload,
  });
  if (error) throw new Error(readableError(error));
  return data as T;
}

export async function mutateCrmWithSecret<T = Record<string, unknown>>(
  apiSecret: string,
  action: string,
  payload: Record<string, unknown> = {}
): Promise<T> {
  const client = createCrmClient(apiSecret);
  const { data, error } = await client.rpc("crm_mutate_v2", {
    p_owner_email: CRM_OWNER_EMAIL,
    p_action: action,
    p_payload: payload,
  });
  if (error) throw new Error(readableError(error));
  return data as T;
}
