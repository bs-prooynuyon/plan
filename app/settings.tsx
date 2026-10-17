import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { Card, Field, Header, PrimaryButton, Screen, styles } from '@/components/PlanimUI';
import { PermissionsCard } from '@/components/PermissionsCard';
import { SpotifyCard } from '@/components/SpotifyCard';
import { ThemePicker } from '@/components/ThemePicker';
import { PlanimLock } from '@/modules/planim-lock';
import { usePlanim } from '@/context/PlanimContext';
import { useColors } from '@/hooks/useColors';

export default function SettingsScreen() {
  const colors = useColors();
  const { settings, updateSettings, resetAll } = usePlanim();
  const [name, setName] = useState(settings.studentName);
  const [examDate, setExamDate] = useState(settings.examDate);
  const [school, setSchool] = useState(settings.targetSchool);
  const [targetNet, setTargetNet] = useState(String(settings.targetNet));
  const [divisor, setDivisor] = useState(String(settings.netDivisor));
  const save = () => { updateSettings({ studentName: name, examDate, targetSchool: school, targetNet: Number(targetNet) || 0, netDivisor: Number(divisor) || 3 }); Alert.alert('Kaydedildi', 'Hedeflerin güncellendi.'); };
  const wipe = () => Alert.alert('Tüm veriler silinsin mi?', 'Ders programın, denemelerin, hedeflerin ve ayarların bu cihazdan silinir. Geri alınamaz.', [{ text: 'Vazgeç', style: 'cancel' }, { text: 'Sil', style: 'destructive', onPress: () => { PlanimLock.stopLock(); PlanimLock.getUsage(true); resetAll(); } }]);
  return <Screen><Header eyebrow="Planım seninle" title="Ayarlar" subtitle="Hedeflerini ve uygulama deneyimini güncel tut." /><Card><Text style={[styles.sectionTitle, { color: colors.foreground }]}>LGS hedefin</Text><Field label="Adın" value={name} onChangeText={setName} placeholder="Adın" /><Field label="Sınav tarihi (YYYY-AA-GG)" value={examDate} onChangeText={setExamDate} placeholder="2027-06-06" /><Field label="Hedef lise" value={school} onChangeText={setSchool} placeholder="Bir hedef belirle" /><Field label="Hedef net" value={targetNet} onChangeText={setTargetNet} keyboardType="numeric" /></Card><Card><Text style={[styles.sectionTitle, { color: colors.foreground }]}>Deneme hesaplama</Text><Text style={{ color: colors.mutedForeground, fontSize: 13, lineHeight: 19 }}>Net = doğru − (yanlış ÷ katsayı). Sınav kuralı değişirse buradan güncelleyebilirsin.</Text><Field label="Yanlış başına götürülen doğru katsayısı" value={divisor} onChangeText={setDivisor} keyboardType="numeric" /></Card><Card><Text style={[styles.sectionTitle, { color: colors.foreground }]}>Görünüm</Text><ThemePicker /></Card><SpotifyCard /><PermissionsCard /><Card><Text style={[styles.sectionTitle, { color: colors.foreground }]}>Kilit ve gizlilik</Text><PrimaryButton label="Kilitli uygulamalar" onPress={() => router.push('/locked-apps' as never)} icon="lock" secondary /><PrimaryButton label="Hangi bilgiler toplanıyor?" onPress={() => router.push('/privacy' as never)} icon="shield" secondary /><PrimaryButton label="Tüm verilerimi sil" onPress={wipe} icon="trash-2" secondary /></Card><PrimaryButton label="Ayarları kaydet" onPress={save} icon="check" /><Pressable onPress={() => router.back()}><Text style={{ color: colors.primary, fontWeight: '700', textAlign: 'center' }}>Geri dön</Text></Pressable></Screen>;
}