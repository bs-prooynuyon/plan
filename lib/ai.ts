import { CONFIG } from '@/config';
import { cloudConfigured, freshSession } from '@/lib/cloud';
import { ChatMessage, Subject } from '@/types/planim';

export interface ExamAnalysis {
  title?: string;
  results: Array<{ subject: Subject; correct: number; wrong: number }>;
  weakTopics: string[];
  summary: string;
}

async function call(body: unknown): Promise<any> {
  if (!cloudConfigured()) throw new Error('AI_NOT_CONFIGURED');
  const session = await freshSession();
  if (!session) throw new Error('NO_SESSION');
  const res = await fetch(`${CONFIG.supabaseUrl.replace(/\/$/, '')}/functions/v1/${CONFIG.aiFunction}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: CONFIG.supabaseAnonKey, Authorization: `Bearer ${session.accessToken}` },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
  return data;
}

/** Deneme PDF'ini okutur; doğru/yanlış sayılarını ve zayıf konuları çıkarır. */
export async function analyzeExamPdf(pdfBase64: string): Promise<ExamAnalysis> {
  const data = await call({ mode: 'analyze', pdfBase64 });
  return data as ExamAnalysis;
}

/** Deneme hakkında soru sorma. PDF her istekte yeniden gönderilir (sunucu bilgi saklamaz). */
export async function askAboutExam(messages: ChatMessage[], pdfBase64?: string, context?: string): Promise<string> {
  const data = await call({ mode: 'chat', messages, pdfBase64, context });
  return String(data.text ?? '');
}

export const aiErrorText = (error: unknown) => {
  const m = error instanceof Error ? error.message : '';
  if (m === 'AI_NOT_CONFIGURED') return 'Yapay zeka henüz kurulmadı (SUPABASE_KURULUM.md).';
  if (m === 'NO_SESSION') return 'Yapay zekayı kullanmak için hesabına giriş yapmalısın (Ayarlar > Hesap).';
  return 'Yapay zeka şu an yanıt veremedi. İnternetini kontrol edip tekrar dene.';
};
