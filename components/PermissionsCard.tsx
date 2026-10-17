import { Feather } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import { AppState, Linking, Platform, Pressable, Switch, Text, View } from 'react-native';
import { Card, PrimaryButton } from '@/components/PlanimUI';
import { usePlanim } from '@/context/PlanimContext';
import { useColors } from '@/hooks/useColors';
import { lockAvailable, PlanimLock } from '@/modules/planim-lock';
import { getNotificationPermission, PermissionState, requestNotificationPermission } from '@/lib/notifications';

function Row({ icon, title, text, status, action, onPress }: { icon: keyof typeof Feather.glyphMap; title: string; text: string; status?: 'ok' | 'todo'; action: string; onPress: () => void }) {
  const colors = useColors();
  return <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
    <View style={{ width: 40, height: 40, borderRadius: 13, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' }}>
      <Feather name={icon} size={18} color={status === 'ok' ? colors.success : colors.primary} />
    </View>
    <View style={{ flex: 1 }}>
      <Text style={{ color: colors.foreground, fontWeight: '800', fontSize: 14 }}>{title}</Text>
      <Text style={{ color: colors.mutedForeground, fontSize: 12, lineHeight: 17, marginTop: 2 }}>{text}</Text>
    </View>
    {status === 'ok'
      ? <Feather name="check-circle" size={22} color={colors.success} />
      : <Pressable onPress={onPress} hitSlop={8} style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, backgroundColor: colors.primary }}><Text style={{ color: colors.primaryForeground, fontWeight: '800', fontSize: 12 }}>{action}</Text></Pressable>}
  </View>;
}

export function PermissionsCard() {
  const colors = useColors();
  const { settings, updateSettings } = usePlanim();
  const [notifications, setNotifications] = useState<PermissionState>('undetermined');
  const [usageOk, setUsageOk] = useState(false);
  const [overlayOk, setOverlayOk] = useState(false);
  const [fsiOk, setFsiOk] = useState(false);

  const refresh = useCallback(() => {
    getNotificationPermission().then(setNotifications).catch(() => undefined);
    setUsageOk(PlanimLock.hasUsageAccess());
    setOverlayOk(PlanimLock.hasOverlayAccess());
    setFsiOk(PlanimLock.canUseFullScreenIntent());
  }, []);
  useEffect(() => {
    refresh();
    const sub = AppState.addEventListener('change', (state) => { if (state === 'active') refresh(); });
    return () => sub.remove();
  }, [refresh]);

  const askNotifications = async () => {
    const result = await requestNotificationPermission();
    setNotifications(result);
    if (result !== 'granted') Linking.openSettings();
  };

  return <Card tone="lavender">
    <Row icon="bell" title="Bildirimler" text="Ders başlayınca alarm ve ders öncesi hatırlatma için." status={notifications === 'granted' ? 'ok' : 'todo'} action="İzin ver" onPress={askNotifications} />
    {Platform.OS === 'android' ? <>
      {lockAvailable ? <>
        <Row icon="maximize" title="Tam ekran alarm" text="Ders alarmı kilitli ekranda bile tüm ekranı kaplasın." status={fsiOk ? 'ok' : 'todo'} action="Aç" onPress={() => PlanimLock.openFullScreenIntentSettings()} />
        <Row icon="eye" title="Kullanım erişimi" text="Ders sırasında hangi uygulamanın açık olduğunu görebilmek için. Mesaj veya içerik okunmaz." status={usageOk ? 'ok' : 'todo'} action="Aç" onPress={() => PlanimLock.openUsageAccessSettings()} />
        <Row icon="layers" title="Diğer uygulamaların üzerinde göster" text="Kilitli bir uygulama açılırsa üstüne kilit ekranını koymak için." status={overlayOk ? 'ok' : 'todo'} action="Aç" onPress={() => PlanimLock.openOverlaySettings()} />
      </> : <Row icon="clock" title="Tam zamanlı alarm" text='Açılan ekranda "Alarmlar ve hatırlatıcılar" iznini aç; ders tam saatinde çalsın.' action="Aç" onPress={() => Linking.openSettings()} />}
      <Row icon="battery-charging" title="Pil kısıtlaması yok" text='Uygulamayı "Kısıtlanmamış" yap; telefon arka planda alarmı ve kilidi engellemesin.' action="Aç" onPress={() => Linking.sendIntent('android.settings.IGNORE_BATTERY_OPTIMIZATION_SETTINGS').catch(() => Linking.openSettings())} />
    </> : null}
    <View style={{ height: 1, backgroundColor: colors.border }} />
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <View style={{ width: 40, height: 40, borderRadius: 13, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' }}>
        <Feather name="lock" size={18} color={colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: colors.foreground, fontWeight: '800', fontSize: 14 }}>Çalışma modu kilidi</Text>
        <Text style={{ color: colors.mutedForeground, fontSize: 12, lineHeight: 17, marginTop: 2 }}>Ders saatinde "Başladım" dediğinde seçtiğin uygulamalar ders bitene kadar açılmaz. Telefon, mesaj ve rehber her zaman açık kalır. Erken bitirmek için basılı tutman gerekir.</Text>
      </View>
      <Switch value={settings.studyLockEnabled} onValueChange={(value) => updateSettings({ studyLockEnabled: value })} trackColor={{ true: colors.primary }} />
    </View>
    <Text style={{ color: colors.mutedForeground, fontSize: 11, lineHeight: 16 }}>Hangi uygulamaların kilitleneceğini Ayarlar → Kilitli uygulamalar bölümünden seçersin.</Text>
  </Card>;
}
