import { Feather } from '@expo/vector-icons';
import { pickProfilePhoto } from '@/lib/photo';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Avatar } from '@/components/Avatar';
import { Card, PrimaryButton, Screen, styles } from '@/components/PlanimUI';
import { ThemePicker } from '@/components/ThemePicker';
import { usePlanim } from '@/context/PlanimContext';
import { useColors } from '@/hooks/useColors';

const daysUntil = (date: string) => Math.max(0, Math.ceil((new Date(`${date}T00:00:00`).getTime() - Date.now()) / 86400000));

function Stat({ label, value }: { label: string; value: string }) {
  const colors = useColors();
  return <Card style={{ flex: 1, alignItems: 'center', paddingVertical: 14 }}>
    <Text style={{ color: colors.foreground, fontSize: 22, fontWeight: '800' }}>{value}</Text>
    <Text style={{ color: colors.mutedForeground, fontSize: 11, fontWeight: '700', marginTop: 2 }}>{label}</Text>
  </Card>;
}

export default function ProfileScreen() {
  const colors = useColors();
  const { settings, updateSettings, sessions, exams, topics } = usePlanim();

  const pickPhoto = async () => { const photo = await pickProfilePhoto(); if (photo) updateSettings({ profilePhoto: photo }); };

  const focusMinutes = sessions.reduce((sum, item) => sum + item.durationMinutes, 0);
  const learned = topics.filter((topic) => topic.status === 'learned').length;

  return <Screen>
    <View style={{ alignItems: 'center', gap: 8 }}>
      <Pressable onPress={pickPhoto}>
        <Avatar size={116} />
        <View style={{ position: 'absolute', right: 0, bottom: 0, width: 34, height: 34, borderRadius: 17, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }}><Feather name="camera" size={16} color={colors.primaryForeground} /></View>
      </Pressable>
      <Text style={[styles.title, { color: colors.foreground, textAlign: 'center' }]}>{settings.studentName || 'Profilim'}</Text>
      <Text style={{ color: colors.mutedForeground, fontSize: 13 }}>{settings.email ? `${settings.email} · ` : ''}{settings.targetSchool || 'Hedef lise belirlenmedi'}{settings.targetNet ? ` · hedef ${settings.targetNet} net` : ''}</Text>
    </View>
    <View style={{ flexDirection: 'row', gap: 10 }}>
      <Stat label="LGS'YE GÜN" value={settings.examDate ? String(daysUntil(settings.examDate)) : '–'} />
      <Stat label="ODAK (DK)" value={String(focusMinutes)} />
    </View>
    <View style={{ flexDirection: 'row', gap: 10 }}>
      <Stat label="DENEME" value={String(exams.length)} />
      <Stat label="ÖĞRENİLEN KONU" value={String(learned)} />
    </View>
    <Card><Text style={[styles.sectionTitle, { color: colors.foreground }]}>Tema ve renk</Text><ThemePicker /></Card>
    <PrimaryButton label="Bilgilerimi düzenle" onPress={() => router.push('/settings')} icon="edit-2" secondary />
    <Pressable onPress={() => router.back()}><Text style={{ color: colors.primary, fontWeight: '700', textAlign: 'center' }}>Geri dön</Text></Pressable>
  </Screen>;
}
