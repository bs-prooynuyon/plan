import { Feather } from '@expo/vector-icons';
import { useKeepAwake } from 'expo-keep-awake';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, BackHandler, Pressable, Text, View } from 'react-native';
import { usePlanim } from '@/context/PlanimContext';
import { useSpotify } from '@/context/SpotifyContext';
import { useColors } from '@/hooks/useColors';
import { CONFIG } from '@/config';
import { playUri } from '@/lib/spotify';
import { lockAvailable, PlanimLock } from '@/modules/planim-lock';

function endTimestamp(endTime: string) {
  const [hours, minutes] = endTime.split(':').map(Number);
  const end = new Date();
  end.setHours(hours || 0, minutes || 0, 0, 0);
  return end.getTime();
}

export default function StudyModeScreen() {
  useKeepAwake();
  const colors = useColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { lessons, addFocusSession, settings } = usePlanim();
  const spotify = useSpotify();
  const lesson = lessons.find((item) => item.id === id);
  const startedAt = useMemo(() => Date.now(), []);
  const [now, setNow] = useState(Date.now());
  const [lockOk, setLockOk] = useState(true);
  const [missing, setMissing] = useState<string[]>([]);

  const target = lesson ? Math.max(endTimestamp(lesson.endTime), startedAt + 60000) : startedAt;
  const remaining = Math.max(0, Math.ceil((target - now) / 1000));

  const finish = (save: boolean) => {
    if (lockAvailable) PlanimLock.stopLock();
    if (save) {
      const minutes = Math.round((Date.now() - startedAt) / 60000);
      if (minutes >= 1) addFocusSession(minutes);
    }
    if (save && lesson) router.replace(`/lesson-summary?id=${lesson.id}` as never);
    else router.replace('/');
  };

  useEffect(() => {
    if (!lockAvailable || !lesson) return;
    const absent: string[] = [];
    if (!PlanimLock.hasUsageAccess()) absent.push('Kullanım erişimi');
    if (!PlanimLock.hasOverlayAccess()) absent.push('Diğer uygulamaların üzerinde göster');
    setMissing(absent);
    if (absent.length) { setLockOk(false); return; }
    PlanimLock.startLock({
      blocked: settings.lockedApps,
      allowed: Array.from(new Set([...settings.alwaysAllowedApps, ...PlanimLock.getEmergencyPackages(), ...CONFIG.musicApps])),
      friend: settings.friendApps.length ? settings.friendApps : CONFIG.friendStudyDefaults,
      endAt: target,
      lessonName: lesson.name,
    });
    const check = setInterval(() => setLockOk(PlanimLock.isLockRunning()), 3000);
    return () => clearInterval(check);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => sub.remove();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (lesson && remaining === 0) finish(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining]);

  const display = `${String(Math.floor(remaining / 3600)).padStart(2, '0')}:${String(Math.floor((remaining % 3600) / 60)).padStart(2, '0')}:${String(remaining % 60).padStart(2, '0')}`;

  return <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', padding: 28, gap: 14 }}>
    <StatusBar hidden />
    <Feather name="lock" size={30} color={colors.primary} />
    <Text style={{ color: colors.primary, fontWeight: '800', letterSpacing: 1.4, fontSize: 12 }}>ÇALIŞMA MODU</Text>
    <Text style={{ color: colors.foreground, fontSize: 32, fontFamily: 'Georgia', fontWeight: '700', textAlign: 'center' }}>{lesson?.name ?? 'Ders'}</Text>
    <Text style={{ color: colors.foreground, fontSize: 56, fontWeight: '800', letterSpacing: 2 }}>{display}</Text>
    <Text style={{ color: colors.mutedForeground, textAlign: 'center', lineHeight: 20 }}>Sadece şu ana odaklan. Ders bitince kilit kendiliğinden kalkar.</Text>
    {lockAvailable && !lockOk ? <View style={{ padding: 12, borderRadius: 14, backgroundColor: colors.secondary }}><Text style={{ color: colors.destructive, fontWeight: '800', textAlign: 'center' }}>Uygulama kilidi şu an çalışmıyor</Text><Text style={{ color: colors.mutedForeground, fontSize: 12, textAlign: 'center', marginTop: 4, lineHeight: 17 }}>{missing.length ? `Eksik izin: ${missing.join(', ')}. Ayarlar > İzinler bölümünden aç.` : 'Telefon uygulamayı arka planda durdurmuş olabilir. Pil kısıtlamasını kapatıp dersi yeniden başlat.'}</Text></View> : null}
    {lesson?.spotifyTrackUri && spotify.connected ? <Pressable onPress={() => playUri(lesson.spotifyTrackUri!).catch(() => undefined)} style={{ flexDirection: 'row', gap: 8, alignItems: 'center', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 14, backgroundColor: colors.card }}><Feather name="music" size={16} color={colors.success} /><Text style={{ color: colors.success, fontWeight: '800' }}>Müziği tekrar çal</Text></Pressable> : null}
    {lockAvailable ? <Pressable onPress={() => { PlanimLock.setFriendWindow(Date.now() + 30 * 60000); Alert.alert('Arkadaşınla çalışma açık', 'Seçtiğin arkadaş uygulamaları 30 dakika açık. Diğerleri kilitli kalır.'); }} style={{ flexDirection: 'row', gap: 8, alignItems: 'center', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 14, backgroundColor: colors.secondary }}><Feather name="users" size={16} color={colors.primary} /><Text style={{ color: colors.primary, fontWeight: '800' }}>Arkadaşımla çalışıyorum</Text></Pressable> : null}
    <Pressable
      delayLongPress={CONFIG.earlyFinishHoldMs}
      onLongPress={() => Alert.alert('Erken bitirelim mi?', 'Çalışma modundan çıkılacak.', [{ text: 'Devam et', style: 'cancel' }, { text: 'Bitir', style: 'destructive', onPress: () => finish(true) }])}
      style={{ position: 'absolute', bottom: 40, paddingVertical: 12, paddingHorizontal: 20 }}
    >
      <Text style={{ color: colors.mutedForeground, fontSize: 12, fontWeight: '700' }}>Erken bitirmek için basılı tut</Text>
    </Pressable>
  </View>;
}
