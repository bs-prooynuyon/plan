import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { ACCENT_LABELS, AccentName, getPalette } from '@/constants/colors';
import { usePlanim } from '@/context/PlanimContext';
import { useColors } from '@/hooks/useColors';

const MODES = [
  { key: 'light', label: 'Beyaz' },
  { key: 'dark', label: 'Siyah' },
  { key: 'system', label: 'Sistem' },
] as const;

/** Tema (beyaz / siyah / sistem) ve vurgu rengi seçimi. Seçim anında uygulanır ve kaydedilir. */
export function ThemePicker() {
  const colors = useColors();
  const { settings, updateSettings } = usePlanim();
  return <View style={{ gap: 12 }}>
    <View style={{ flexDirection: 'row', gap: 8 }}>
      {MODES.map((item) => <Pressable key={item.key} onPress={() => updateSettings({ theme: item.key, themeInit: true })} style={{ flex: 1, alignItems: 'center', paddingVertical: 11, borderRadius: 13, backgroundColor: settings.theme === item.key ? colors.primary : colors.secondary }}>
        <Text style={{ color: settings.theme === item.key ? colors.primaryForeground : colors.secondaryForeground, fontSize: 12, fontWeight: '800' }}>{item.label}</Text>
      </Pressable>)}
    </View>
    <View style={{ flexDirection: 'row', gap: 10, justifyContent: 'space-between' }}>
      {(Object.keys(ACCENT_LABELS) as AccentName[]).map((name) => {
        const selected = settings.accent === name;
        return <Pressable key={name} onPress={() => updateSettings({ accent: name })} style={{ flex: 1, alignItems: 'center', gap: 6 }}>
          <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: getPalette('light', name).primary, borderWidth: selected ? 3 : 0, borderColor: colors.foreground }} />
          <Text style={{ color: selected ? colors.foreground : colors.mutedForeground, fontSize: 12, fontWeight: selected ? '800' : '600' }}>{ACCENT_LABELS[name]}</Text>
        </Pressable>;
      })}
    </View>
  </View>;
}
