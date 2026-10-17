import { Feather } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { Card } from '@/components/PlanimUI';
import { usePlanim } from '@/context/PlanimContext';
import { useColors } from '@/hooks/useColors';
import { AppInfo, lockAvailable, PlanimLock } from '@/modules/planim-lock';

type Tab = 'friendApps' | 'alwaysAllowedApps';
const TABS: Array<{ key: Tab; label: string; hint: string }> = [
  { key: 'alwaysAllowedApps', label: 'Açık kalacak', hint: 'Ders sırasında kilitlenmez. Seçmediğin her uygulama kilitlenir.' },
  { key: 'friendApps', label: 'Arkadaşla', hint: '"Arkadaşımla çalışıyorum" denince geçici açılır.' },
];

export function LockedAppsEditor() {
  const colors = useColors();
  const { settings, updateSettings } = usePlanim();
  const [apps, setApps] = useState<AppInfo[]>([]);
  const [tab, setTab] = useState<Tab>('alwaysAllowedApps');
  const [query, setQuery] = useState('');

  useEffect(() => { setApps(PlanimLock.getLaunchableApps()); }, []);

  const selected = settings[tab];
  const filtered = useMemo(() => apps.filter((app) => app.label.toLowerCase().includes(query.trim().toLowerCase())), [apps, query]);
  const current = TABS.find((item) => item.key === tab)!;

  const toggle = (pkg: string) => {
    const next = selected.includes(pkg) ? selected.filter((item) => item !== pkg) : [...selected, pkg];
    updateSettings({ [tab]: next, lockedAppsConfigured: true } as never);
  };

  if (!lockAvailable) {
    return <Card><Text style={{ color: colors.mutedForeground, fontSize: 13, lineHeight: 19 }}>Uygulama kilidi yalnızca yüklenen Android uygulamasında (APK) çalışır. Bu önizlemede kullanılamıyor.</Text></Card>;
  }

  return <View style={{ gap: 12 }}>
    <Card tone="lavender">
      <Text style={{ color: colors.mutedForeground, fontSize: 12, lineHeight: 18 }}>Ders sırasında açık kalmasını istediğin uygulamaları seç; geri kalan her uygulama kilitlenir. Telefon, mesajlar, rehber ve müzik uygulamaları (Spotify, YouTube Music) her zaman açık kalır. Seçimlerin kaydedilir, her derste yeniden seçmen gerekmez.</Text>
    </Card>
    <View style={{ flexDirection: 'row', gap: 8 }}>
      {TABS.map((item) => <Pressable key={item.key} onPress={() => setTab(item.key)} style={{ flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 12, backgroundColor: tab === item.key ? colors.primary : colors.card, borderWidth: 1, borderColor: tab === item.key ? colors.primary : colors.border }}>
        <Text style={{ color: tab === item.key ? colors.primaryForeground : colors.mutedForeground, fontWeight: '800', fontSize: 12 }}>{item.label} ({settings[item.key].length})</Text>
      </Pressable>)}
    </View>
    <Text style={{ color: colors.mutedForeground, fontSize: 12 }}>{current.hint}</Text>
    <TextInput value={query} onChangeText={setQuery} placeholder="Uygulama ara…" placeholderTextColor={colors.mutedForeground} style={{ height: 46, borderRadius: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, paddingHorizontal: 14, color: colors.foreground }} />
    {filtered.map((app) => {
      const on = selected.includes(app.pkg);
      return <Pressable key={app.pkg} onPress={() => toggle(app.pkg)} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 14, backgroundColor: colors.card, borderWidth: 1, borderColor: on ? colors.primary : colors.border }}>
        <Feather name={on ? 'check-circle' : 'circle'} size={20} color={on ? colors.primary : colors.mutedForeground} />
        <Text style={{ flex: 1, color: colors.foreground, fontWeight: '700' }}>{app.label}</Text>
      </Pressable>;
    })}
  </View>;
}
