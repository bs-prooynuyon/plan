import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Field, styles } from '@/components/PlanimUI';
import { usePlanim } from '@/context/PlanimContext';
import { useColors } from '@/hooks/useColors';
import { WEEKDAYS } from '@/types/planim';

/** Veli numarası, haftalık rapor günü/saati ve aylık rapor günü. */
export function ReportSettings() {
  const colors = useColors();
  const { settings, updateSettings } = usePlanim();
  const [time, setTime] = useState(settings.reportTime);
  const chip = (active: boolean) => ({ alignItems: 'center' as const, paddingVertical: 10, borderRadius: 12, backgroundColor: active ? colors.primary : colors.secondary });
  const label = (active: boolean) => ({ color: active ? colors.primaryForeground : colors.secondaryForeground, fontSize: 11, fontWeight: '800' as const });
  return <View style={{ gap: 12 }}>
    <Field label="Velinin telefon numarası (örn. 5xx xxx xx xx)" value={settings.parentPhone} onChangeText={(v) => updateSettings({ parentPhone: v })} placeholder="5xx xxx xx xx" keyboardType="numeric" />
    <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Haftalık özet günü</Text>
    <View style={{ flexDirection: 'row', gap: 6 }}>{WEEKDAYS.map((day, index) => <Pressable key={day} onPress={() => updateSettings({ reportDay: index })} style={[{ flex: 1 }, chip(settings.reportDay === index)]}><Text style={label(settings.reportDay === index)}>{day}</Text></Pressable>)}</View>
    <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Aylık özet günü (ayın kaçı)</Text>
    <View style={{ flexDirection: 'row', gap: 6 }}>{[1, 5, 10, 15, 20, 25, 28].map((day) => <Pressable key={day} onPress={() => updateSettings({ monthlyDay: day })} style={[{ flex: 1 }, chip(settings.monthlyDay === day)]}><Text style={label(settings.monthlyDay === day)}>{day}</Text></Pressable>)}</View>
    <Field label="Bildirim saati (SS:DD)" value={time} onChangeText={(v) => { setTime(v); if (/^([01]\d|2[0-3]):[0-5]\d$/.test(v)) updateSettings({ reportTime: v }); }} placeholder="20:00" />
  </View>;
}
