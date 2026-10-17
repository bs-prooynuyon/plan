// Supabase Edge Function: Planım yapay zeka (deneme PDF analizi + soru-cevap).
// Anahtar uygulamada DEĞİL, burada gizli kalır:  supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
// Supabase varsayılan olarak çağıranın giriş yapmış olmasını (JWT) zorunlu tutar.

const MODEL = Deno.env.get('ANTHROPIC_MODEL') ?? 'claude-sonnet-5-5';
const KEY = Deno.env.get('ANTHROPIC_API_KEY') ?? '';
const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' };
const reply = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (!KEY) return reply({ error: 'ANTHROPIC_API_KEY tanımlı değil' }, 500);
  let input: any;
  try { input = await req.json(); } catch { return reply({ error: 'Geçersiz istek' }, 400); }

  const pdf = input.pdfBase64 ? [{ type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: input.pdfBase64 } }] : [];
  let system = CHAT;
  let messages: any[];
  if (input.mode === 'analyze') {
    system = 'Sen dikkatli bir sınav analiz asistanısın.';
    messages = [{ role: 'user', content: [...pdf, { type: 'text', text: ANALYZE }] }];
  } else {
    const history: Array<{ role: string; text: string }> = Array.isArray(input.messages) ? input.messages.slice(-20) : [];
    if (!history.length) return reply({ error: 'Mesaj yok' }, 400);
    messages = history.map((m, i) => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: i === 0 && m.role !== 'assistant' ? [...pdf, { type: 'text', text: (input.context ? `Bağlam: ${input.context}\n\n` : '') + m.text }] : m.text,
    }));
  }

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': KEY, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({ model: MODEL, max_tokens: 2000, system, messages }),
  });
  const data = await res.json();
  if (!res.ok) return reply({ error: data?.error?.message ?? 'AI hatası' }, 502);
  const text: string = (data.content ?? []).filter((b: any) => b.type === 'text').map((b: any) => b.text).join('\n');

  if (input.mode === 'analyze') {
    const match = text.match(/\{[\s\S]*\}/);
    try { return reply(JSON.parse(match ? match[0] : text)); } catch { return reply({ error: 'Analiz okunamadı' }, 502); }
  }
  return reply({ text });
});
