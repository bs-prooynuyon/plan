import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Card, Header, Screen } from '@/components/PlanimUI';
import { useColors } from '@/hooks/useColors';

type MoreRoute = '/profile' | '/exams' | '/wrongs' | '/friends' | '/weekly' | '/settings';

const items: { title: string; subtitle: string; icon: keyof typeof Feather.glyphMap; route: MoreRoute }[] = [
  { title: 'Profilim', subtitle: 'Fotoğrafın, hedefin ve özetin', icon: 'user', route: '/profile' },
  { title: 'Deneme sonuçları', subtitle: 'Netlerini kaydet ve gelişimini gör', icon: 'edit-3', route: '/exams' },
  { title: 'Yanlış soru deposu', subtitle: 'Yanlışlarını ekle, hafta sonu tekrar çöz', icon: 'layers', route: '/wrongs' },
  { title: 'Arkadaşlarım', subtitle: 'WhatsApp ile birlikte çalış', icon: 'users', route: '/friends' },
  { title: 'Haftalık özet', subtitle: 'Bu haftaki emeğine birlikte bakalım', icon: 'trending-up', route: '/weekly' },
  { title: 'Ayarlar', subtitle: 'LGS tarihi, hedefin ve bildirimler', icon: 'settings', route: '/settings' },
];

export default function MoreScreen() {
  const colors = useColors();
  return <Screen topBar><Header eyebrow="Kendine göre düzenle" title="Daha fazlası" subtitle="Planım senin çalışma alışkanlıklarına uyum sağlar." /><View style={{ gap: 10 }}>{items.map((item) => <Pressable key={item.route} onPress={() => router.push(item.route)}><Card><View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}><View style={{ width: 45, height: 45, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.accent }}><Feather name={item.icon} size={20} color={colors.primary} /></View><View style={{ flex: 1 }}><Text style={{ color: colors.foreground, fontSize: 16, fontWeight: '800' }}>{item.title}</Text><Text style={{ color: colors.mutedForeground, fontSize: 13, marginTop: 4 }}>{item.subtitle}</Text></View><Feather name="chevron-right" size={18} color={colors.mutedForeground} /></View></Card></Pressable>)}</View></Screen>;
}