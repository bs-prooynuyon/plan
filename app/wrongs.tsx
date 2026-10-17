import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Sharing from 'expo-sharing';
import { useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, Pressable, Text, View } from 'react-native';
import { Card, Field, Header, PrimaryButton, Screen } from '@/components/PlanimUI';
import { usePlanim } from '@/context/PlanimContext';
import { useColors } from '@/hooks/useColors';
import { keepFile } from '@/lib/files';
import { SUBJECTS } from '@/types/planim';

/** Yanlış soru deposu: fotoğraf ekle, hafta sonu tekrar çöz, "anladım / anlamadım" de, arkadaşın cevabı yanında dursun. */
export default function WrongsScreen() {
  const colors = useColors();
  const params = useLocalSearchParams<{ add?: string; subject?: string }>();
  const { wrongs, addWrong, updateWrong, removeWrong } = usePlanim();
  const [subject, setSubject] = useState(params.subject && params.subject !== '' ? params.subject : SUBJECTS[1]);
  const [shown, setShown] = useState<string | null>(null);

  const add = async (camera: boolean) => {
    try {
      const options = { mediaTypes: ['images' as const], quality: 0.6 };
      if (camera) { const perm = await ImagePicker.requestCameraPermissionsAsync(); if (!perm.granted) return Alert.alert('Kamera izni gerekli', 'Telefon ayarlarından kamera iznini açabilirsin.'); }
      const result = camera ? await ImagePicker.launchCameraAsync(options) : await ImagePicker.launchImageLibraryAsync(options);
      const asset = result.canceled ? null : result.assets[0];
      if (!asset) return;
      addWrong({ subject, photo: await keepFile(asset.uri, 'jpg'), friendAnswer: '' });
    } catch { Alert.alert('Fotoğraf eklenemedi', 'Tekrar dener misin?'); }
  };
  const send = async (uri: string) => {
    try { if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(uri, { mimeType: 'image/jpeg', dialogTitle: 'Arkadaşına gönder' }); } catch { /* ignore */ }
  };

  return <Screen>
    <Header eyebrow="Yanlışlarından öğren" title="Yanlış soru deposu" subtitle="Yapamadığın sorunun fotoğrafını ekle, hafta sonu tekrar çöz." />
    <Card tone={params.add ? 'pink' : 'card'}>
      <Text style={{ color: colors.mutedForeground, fontSize: 12, fontWeight: '700' }}>Hangi dersten?</Text>
      <View style={{ flexDirection: 'row', gap: 7, flexWrap: 'wrap' }}>{SUBJECTS.map((item) => <Pressable key={item} onPress={() => setSubject(item)} style={{ paddingVertical: 8, paddingHorizontal: 11, borderRadius: 11, backgroundColor: subject === item ? colors.primary : colors.secondary }}><Text style={{ color: subject === item ? colors.primaryForeground : colors.secondaryForeground, fontSize: 12, fontWeight: '800' }}>{item}</Text></Pressable>)}</View>
      <PrimaryButton label="Fotoğraf çek" onPress={() => add(true)} icon="camera" />
      <PrimaryButton label="Galeriden seç" onPress={() => add(false)} icon="image" secondary />
    </Card>
    {wrongs.length === 0 ? <Text style={{ color: colors.mutedForeground }}>Henüz yanlış soru eklenmedi.</Text> : null}
    {wrongs.map((item) => <Card key={item.id}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={{ color: colors.primary, fontWeight: '800', fontSize: 12 }}>{item.subject.toUpperCase()}{item.failCount > 1 ? ` · ${item.failCount} kez zorlandın` : ''}</Text>
        <Pressable onPress={() => Alert.alert('Soru silinsin mi?', '', [{ text: 'Vazgeç', style: 'cancel' }, { text: 'Sil', style: 'destructive', onPress: () => removeWrong(item.id) }])}><Feather name="trash-2" size={16} color={colors.mutedForeground} /></Pressable>
      </View>
      <Image source={{ uri: item.photo }} style={{ width: '100%', height: 220, borderRadius: 14, backgroundColor: colors.muted }} resizeMode="contain" />
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <View style={{ flex: 1 }}><PrimaryButton label="Anladım" icon="check" onPress={() => { updateWrong(item.id, { understood: true }); setShown(null); }} /></View>
        <View style={{ flex: 1 }}><PrimaryButton label="Anlamadım" icon="help-circle" secondary onPress={() => { updateWrong(item.id, { understood: false, failCount: item.failCount + 1 }); setShown(item.id); }} /></View>
      </View>
      {item.understood === true ? <Text style={{ color: colors.success, fontWeight: '800', fontSize: 12 }}>✓ Anladın olarak işaretli</Text> : null}
      {(shown === item.id || item.understood === false) && item.friendAnswer ? <View style={{ padding: 12, borderRadius: 12, backgroundColor: colors.mintSoft }}><Text style={{ color: colors.mutedForeground, fontSize: 11, fontWeight: '800' }}>ARKADAŞININ CEVABI</Text><Text style={{ color: colors.foreground, fontSize: 14, lineHeight: 20, marginTop: 4 }}>{item.friendAnswer}</Text></View> : null}
      <Field label="Arkadaşının cevabı / çözümü" value={item.friendAnswer} onChangeText={(v) => updateWrong(item.id, { friendAnswer: v })} placeholder="Cevabı buraya yapıştır" />
      <PrimaryButton label="Arkadaşıma gönder" onPress={() => send(item.photo)} icon="send" secondary />
    </Card>)}
  </Screen>;
}
