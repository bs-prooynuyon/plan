# Hesap (e-posta ile giriş) ve eşitleme kurulumu (bir kere, ~10 dk)

Bu olmadan uygulama yine çalışır ama hesapsızdır (veri sadece o telefonda). E-posta ile giriş/kayıt, aşağıdaki 4. adımdaki iki değer (`supabaseUrl`, `supabaseAnonKey`) `config.ts`'e yazılmadan hiç açılmaz.
Yapay zeka Supabase'e bağlı değildir: kullanıcı Ayarlar > Yapay zeka bölümüne kendi Gemini API anahtarını ekler.

1. https://supabase.com → ücretsiz proje aç.
2. **SQL Editor**'de çalıştır:
```sql
create table planim_state (
  user_id uuid primary key references auth.users on delete cascade,
  data jsonb not null,
  updated_at timestamptz default now()
);
alter table planim_state enable row level security;
create policy "kendi verisi" on planim_state for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
```
3. **Authentication → Email Templates**'te **iki şablona** da kodu ekle: **Magic Link** (kayıtlı kullanıcı) ve **Confirm signup** (yeni kullanıcı).
   İkisinin içeriğine de `{{ .Token }}` yaz (örn. "Planım giriş kodun: {{ .Token }}"). Giriş 6 haneli kodla yapılır.
   Yalnızca Magic Link'e eklenirse yeni kayıt olanlara giden e-postada kod görünmez ve kayıt tamamlanamaz.
4. **Project Settings → API**: `Project URL` ve `anon public` anahtarı → `config.ts` içindeki `supabaseUrl` ve `supabaseAnonKey`.
5. APK'yı yeniden derle.

Not: Supabase ücretsiz planında günde birkaç e-posta sınırı vardır; çok kullanıcı için kendi SMTP'ni bağla.
