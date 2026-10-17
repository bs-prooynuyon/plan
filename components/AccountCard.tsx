import React, { useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { Card, Field, PrimaryButton, styles } from '@/components/PlanimUI';
import { usePlanim } from '@/context/PlanimContext';
import { useColors } from '@/hooks/useColors';
import { cloudConfigured, requestCode, requestEmailChange, verifyCode, verifyEmailChange } from '@/lib/cloud';

const validEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

/**
 * E-posta ile giriş / kayıt. Aynı e-postayla başka telefondan girilince hesap ve veriler açılır.
 * Giriş yapılmışsa: hesabı gösterir, e-posta değiştirme ve çıkış sunar.
 */
export function AccountCard({ onDone }: { onDone?: () => void }) {
  const colors = useColors();
  const { settings, cloudLogin, signOut } = usePlanim();
  const [email, setEmail] = useState(settings.email);
  const [code, setCode] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [changing, setChanging] = useState(false);

  if (!cloudConfigured()) {
    return <Card><Text style={{ color: colors.mutedForeground, fontSize: 13, lineHeight: 19 }}>Hesap sistemi henüz kurulmadı; bu yüzden veriler şimdilik yalnızca bu telefonda saklanıyor. Kurulum için SUPABASE_KURULUM.md dosyasına bak.</Text></Card>;
  }

  const send = async () => {
    if (!validEmail(email)) return Alert.alert('E-posta hatalı', 'Geçerli bir e-posta adresi yaz.');
    setBusy(true);
    try { if (changing) await requestEmailChange(email.trim()); else await requestCode(email.trim()); setSent(true); }
    catch (e) { Alert.alert('Kod gönderilemedi', e instanceof Error ? e.message : 'Tekrar dener misin?'); }
    finally { setBusy(false); }
  };

  const verify = async () => {
    if (code.trim().length < 6) return Alert.alert('Kod eksik', 'E-postana gelen kodu yaz.');
    setBusy(true);
    try {
      const session = changing ? await verifyEmailChange(email.trim(), code.trim()) : await verifyCode(email.trim(), code.trim());
      const result = await cloudLogin(session);
      setSent(false); setCode(''); setChanging(false);
      if (result === 'restored') Alert.alert('Hesabın açıldı', 'Kayıtlı bilgilerin bu telefona yüklendi.');
      onDone?.();
    } catch (e) { Alert.alert('Kod olmadı', e instanceof Error ? e.message : 'Kodu kontrol edip tekrar dene.'); }
    finally { setBusy(false); }
  };

  if (settings.signedIn && !changing) {
    return <Card>
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Hesap</Text>
      <Text style={{ color: colors.mutedForeground, fontSize: 13, lineHeight: 19 }}>{settings.email} ile giriş yapıldı. Başka telefondan aynı e-postayla girersen her şeyin orada da görünür.</Text>
      <PrimaryButton label="E-postayı değiştir" onPress={() => { setChanging(true); setEmail(''); setSent(false); }} icon="mail" secondary />
      <PrimaryButton label="Çıkış yap" onPress={() => Alert.alert('Çıkış yapılsın mı?', 'Veriler bulutta kalır; tekrar girince geri gelir.', [{ text: 'Vazgeç', style: 'cancel' }, { text: 'Çıkış yap', onPress: () => { signOut(); } }])} icon="log-out" secondary />
    </Card>;
  }

  return <Card>
    {changing ? <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Yeni e-posta</Text> : null}
    <Field label={changing ? 'Yeni e-posta adresin' : 'E-posta adresin'} value={email} onChangeText={setEmail} placeholder="ornek@mail.com" keyboardType="email" />
    {sent ? <>
      <Field label="E-postana gelen kod" value={code} onChangeText={setCode} placeholder="6 haneli kod" keyboardType="numeric" />
      <PrimaryButton label={busy ? 'Kontrol ediliyor…' : 'Giriş yap'} onPress={verify} icon="check" disabled={busy} />
      <PrimaryButton label="Kodu yeniden gönder" onPress={send} icon="refresh-cw" secondary disabled={busy} />
    </> : <PrimaryButton label={busy ? 'Gönderiliyor…' : 'Giriş kodu gönder'} onPress={send} icon="send" disabled={busy} />}
    {changing ? <PrimaryButton label="Vazgeç" onPress={() => { setChanging(false); setSent(false); setEmail(settings.email); }} secondary /> : null}
    <View><Text style={{ color: colors.mutedForeground, fontSize: 12, lineHeight: 18 }}>Şifre yok: e-postana gelen kodla girersin. Hesabın yoksa otomatik oluşur.</Text></View>
  </Card>;
}
