import * as SecureStore from 'expo-secure-store';
import { CONFIG } from '@/config';
import { ChatMessage, Subject } from '@/types/planim';

/**
 * Yapay zeka: kullanıcının kendi Gemini API anahtarı ile çalışır (sunucu/hesap gerekmez).
 * Anahtar yalnızca bu telefonda, güvenli depoda saklanır; istekler doğrudan telefondan Google'a gider.
 */
export interface ExamAnalysis {
  title?: string;
  results: Array<{ subject: Subject; correct: number; wrong: number }>;
  weakTopics: string[];
  summary: string;
}

const KEY_NAME = 'planim-gemini-key';

export const getAiKey = async (): Promise<string> => {
  try { return (await SecureStore.getItemAsync(KEY_NAME)) ?? ''; } catch { return ''; }
};
export const setAiKey = async (key: string) => { await SecureStore.setItemAsync(KEY_NAME, key.trim()); };
export const clearAiKey = async () => { try { await SecureStore.deleteItemAsync(KEY_NAME); } catch { /* yoksay */ } };
export const hasAiKey = async () => !!(await getAiKey());

const ANALYZE = `Bu PDF bir LGS (8. sınıf) deneme sınavı, cevap anahtarı veya sonuç karnesidir.
Öğrencinin sonuçlarını bulabiliyorsan ders bazında doğru ve yanlış sayılarını çıkar.
Sonuç yoksa (yalnızca soru kitapçığıysa) results boş dizi olsun; uydurma sayı yazma.
Dersler tam olarak şunlardan biri: Türkçe, Matematik, Fen Bilimleri, İnkılap, Din Kültürü, İngilizce.
weakTopics: sonuçlara ya da sorulara göre öğrencinin çalışması gereken en fazla 8 konu.
summary: 2-3 cümlelik Türkçe, cesaretlendirici özet.
SADECE şu JSON'u döndür, başka metin yazma:
{"title": string|null, "results": [{"subject": string, "correct": number, "wrong": number}], "weakTopics": string[], "summary": string}`;

const CHAT = `Sen Planım uygulamasındaki sabırlı bir LGS (8. sınıf) öğretmenisin. Öğrenciyle Türkçe, kısa ve anlaşılır konuş.
Önce sorunun nasıl çözüldüğünü adım adım anlat, gerekirse benzer bir örnek ver. Emin olmadığın şeyi uydurma; PDF'te göremiyorsan söyle.`;

type Part = { text: string } | { inlineData: { mimeType: string; data: string } };

async function generate(system: string, contents: Array<{ role: 'user' | 'model'; parts: Part[] }>, json = false): Promise<string> {
  const key = await getAiKey();
  if (!key) throw new Error('AI_NO_KEY');
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${CONFIG.geminiModel}:generateContent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents,
      generationConfig: { maxOutputTokens: 4096, ...(json ? { responseMimeType: 'application/json' } : {}) },
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message: string = data?.error?.message ?? `HTTP ${res.status}`;
    if (res.status === 403 || /api key/i.test(message)) throw new Error('AI_BAD_KEY');
    if (res.status === 429) throw new Error('AI_QUOTA');
    throw new Error(message);
  }
  const text = ((data.candidates?.[0]?.content?.parts ?? []) as Array<{ text?: string }>).map((part) => part.text ?? '').join('\n').trim();
  if (!text) throw new Error('AI_EMPTY');
  return text;
}

const pdfPart = (pdfBase64?: string): Part[] => (pdfBase64 ? [{ inlineData: { mimeType: 'application/pdf', data: pdfBase64 } }] : []);

/** Deneme PDF'ini okutur; doğru/yanlış sayılarını ve zayıf konuları çıkarır. */
export async function analyzeExamPdf(pdfBase64: string): Promise<ExamAnalysis> {
  const text = await generate('Sen dikkatli bir sınav analiz asistanısın.', [{ role: 'user', parts: [...pdfPart(pdfBase64), { text: ANALYZE }] }], true);
  const match = text.match(/\{[\s\S]*\}/);
  let parsed: Partial<ExamAnalysis>;
  try { parsed = JSON.parse(match ? match[0] : text); } catch { throw new Error('AI_UNREADABLE'); }
  return {
    title: parsed.title || undefined,
    results: Array.isArray(parsed.results) ? parsed.results : [],
    weakTopics: Array.isArray(parsed.weakTopics) ? parsed.weakTopics : [],
    summary: String(parsed.summary ?? ''),
  };
}

/** Deneme hakkında soru sorma. PDF her istekte yeniden gönderilir. */
export async function askAboutExam(messages: ChatMessage[], pdfBase64?: string, context?: string): Promise<string> {
  const history = messages.slice(-20);
  if (!history.length) throw new Error('AI_EMPTY');
  const contents = history.map((message, index) => ({
    role: (message.role === 'assistant' ? 'model' : 'user') as 'user' | 'model',
    parts: index === 0 && message.role !== 'assistant'
      ? [...pdfPart(pdfBase64), { text: (context ? `Bağlam: ${context}\n\n` : '') + message.text }]
      : [{ text: message.text }],
  }));
  return generate(CHAT, contents);
}

export const aiErrorText = (error: unknown) => {
  const m = error instanceof Error ? error.message : '';
  if (m === 'AI_NO_KEY') return 'Yapay zeka için önce Gemini API anahtarını eklemelisin (Ayarlar > Yapay zeka).';
  if (m === 'AI_BAD_KEY') return 'Gemini API anahtarı kabul edilmedi. Ayarlar > Yapay zeka bölümünden anahtarı kontrol et.';
  if (m === 'AI_QUOTA') return 'Gemini kullanım sınırına ulaşıldı. Biraz bekleyip tekrar dene.';
  if (m === 'AI_UNREADABLE') return 'Yapay zeka PDF’i okuyamadı. Netleri elle girebilirsin.';
  return 'Yapay zeka şu an yanıt veremedi. İnternetini kontrol edip tekrar dene.';
};
