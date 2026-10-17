import React, { useEffect, useState } from 'react';
import { Alert, Linking, Text, TextInput } from 'react-native';
import { Card, PrimaryButton, styles } from '@/components/PlanimUI';
import { useColors } from '@/hooks/useColors';
import { clearAiKey, getAiKey, setAiKey } from '@/lib/ai';

/**
 * Yapay zeka (Gemini) kurulumu. Kullanıcı kendi API anahtarını ekler; anahtar yalnızca bu telefonda saklanır.
 * Anahtar yoksa uygulama yine çalışır, sadece yapay zeka özellikleri kapalı kalır.
 */
export function AiKeyCard() {
  const colors = useColors();
  const [saved, setSaved] = useState(false);
  const [value, setValue] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => { getAiKey().then((key) => setSaved(!!key)); }, []);

  const save = async () => {
    if (value.trim().length < 20) return Alert.alert('Anahtar eksik', 'Google AI Studio’dan aldığın Gemini API anahtarını yapıştır.');
    setBusy(true);
    try { await setAiKey(value); setSaved(true); setValue(''); Alert.alert('Yapay zeka açıldı', 'Artık deneme PDF’lerini okutabilir ve sorularını sorabilirsin.'); }
    catch { Alert.alert('Kaydedilemedi', 'Tekrar dener misin?'); }
    finally { setBusy(false); }
  };

  const remove = () => Alert.alert('Anahtar silinsin mi?', 'Yapay zeka özellikleri kapanır. İstediğin zaman yeniden ekleyebilirsin.', [
    { text: 'Vazgeç', style: 'cancel' },
    { text: 'Sil', onPress: async () => { await clearAiKey(); setSaved(false); } },
  ]);

  return <Card>
    <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Yapay zeka (isteğe bağlı)</Text>
    <Text style={{ color: colors.mutedForeground, fontSize: 13, lineHeight: 19 }}>
      Yapay zeka, deneme PDF’ini okuyup doğru / yanlış sayılarını ve çalışman gereken konuları çıkarır; ayrıca denemeyle ilgili sorularına öğretmen gibi adım adım cevap verir. Kullanmak istersen kendi Gemini API anahtarını ekle; istemezsen uygulama onsuz da çalışır.
    </Text>
    {saved ? <>
      <Text style={{ color: colors.success, fontSize: 13, fontWeight: '700' }}>Gemini anahtarı ekli, yapay zeka açık.</Text>
      <PrimaryButton label="Anahtarı sil" onPress={remove} icon="trash-2" secondary />
    </> : <>
      <TextInput value={value} onChangeText={setValue} placeholder="Gemini API anahtarı" placeholderTextColor={colors.mutedForeground} secureTextEntry autoCapitalize="none" autoCorrect={false} style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card }]} />
      <PrimaryButton label={busy ? 'Kaydediliyor…' : 'Anahtarı kaydet'} onPress={save} icon="key" disabled={busy} />
      <PrimaryButton label="Anahtarı nereden alırım?" onPress={() => Linking.openURL('https://aistudio.google.com/apikey')} icon="external-link" secondary />
    </>}
    <Text style={{ color: colors.mutedForeground, fontSize: 12, lineHeight: 18 }}>Anahtar yalnızca bu telefonda saklanır. Yapay zekaya sorduğunda, PDF ve sorun doğrudan Google’ın Gemini hizmetine gönderilir.</Text>
  </Card>;
}
