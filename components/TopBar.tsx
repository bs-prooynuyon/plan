import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Avatar } from '@/components/Avatar';
import { usePlanim } from '@/context/PlanimContext';
import { useColors } from '@/hooks/useColors';
import { minutesToday, streakDays } from '@/lib/stats';

/** Sayfa kaydırılsa ya da sekme değişse de üstte duran profil, seri ve günlük odak şeridi. */
export function TopBar() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { sessions, settings } = usePlanim();
  return <View style={{ paddingTop: insets.top + 8, paddingBottom: 10, paddingHorizontal: 18, backgroundColor: colors.background, flexDirection: 'row', alignItems: 'center', gap: 12, borderBottomWidth: 1, borderBottomColor: colors.border }}>
    <Pressable onPress={() => router.push('/profile' as never)}><Avatar size={38} /></Pressable>
    <View style={{ flex: 1 }}>
      <Text style={{ color: colors.foreground, fontWeight: '800', fontSize: 14 }} numberOfLines={1}>{settings.studentName || 'Planım'}</Text>
      <View style={{ flexDirection: 'row', gap: 14, marginTop: 2 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}><Feather name="zap" size={13} color={colors.warning} /><Text style={{ color: colors.mutedForeground, fontSize: 12, fontWeight: '700' }}>{streakDays(sessions)} gün seri</Text></View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}><Feather name="clock" size={13} color={colors.primary} /><Text style={{ color: colors.mutedForeground, fontSize: 12, fontWeight: '700' }}>Bugün {minutesToday(sessions)} dk</Text></View>
      </View>
    </View>
    <Pressable onPress={() => router.push('/study-mode?minutes=45' as never)} hitSlop={10}><Feather name="lock" size={20} color={colors.primary} /></Pressable>
    <Pressable onPress={() => router.push('/settings')} hitSlop={10}><Feather name="settings" size={20} color={colors.mutedForeground} /></Pressable>
  </View>;
}
