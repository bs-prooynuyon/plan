import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { Card, Field, PrimaryButton, Screen, styles } from '@/components/PlanimUI';
import { LockedAppsEditor } from '@/components/LockedAppsEditor';
import { PermissionsCard } from '@/components/PermissionsCard';
import { ReportSettings } from '@/components/ReportSettings';
import { SpotifyCard } from '@/components/SpotifyCard';
import { ThemePicker } from '@/components/ThemePicker';
import { usePlanim } from '@/context/PlanimContext';
import { useColors } from '@/hooks/useColors';

const STEPS = [
  { eyebrow: "PLANIM'A HOŞ GELDİN", title: 'Hedeflerini birlikte planlayalım.', text: 'Sana uygun bir çalışma alanı hazırlamak için birkaç bilgi yeterli.' },
  { eyebrow: 'MÜZİK', title: 'Derse müzikle başla.', text: 'Spotify hesabını bağla; ders başlayınca seçtiğin playlist veya şarkı açılsın. İstersen sonra da bağlayabilirsin.' },
  { eyebrow: 'İZİNLER', title: 'Alarm ve çalışma modu.', text: 'Dersin tam vaktinde çalması ve kilidin çalışması için birkaç izne ihtiyacımız var.' },
  { eyebrow: 'KİLİT', title: 'Ders sırasında hangi uygulamalar kapalı olsun?', text: 'Bir kere seç, her derste yeniden sormayız. Sonra Ayarlar\'dan değiştirebilirsin.' },
  { eyebrow: 'ÖZETLER', title: 'Özetler ne zaman gelsin?', text: 'Haftalık ve aylık özet için gün seç, istersen velinin numarasını ekle. Hepsini sonra da değiştirebilirsin.' },
];

export function Onboarding() {
  const colors = useColors();
  const { settings, updateSettings } = usePlanim();
  const [step, setStep] = useState(0);
  const [name, setName] = useState(settings.studentName);
  const [examDate, setExamDate] = useState(settings.examDate || '2027-06-06');
  const [school, setSchool] = useState(settings.targetSchool);
  const [targetNet, setTargetNet] = useState(settings.targetNet ? String(settings.targetNet) : '85');

  const saveProfile = () => {
    updateSettings({
      studentName: name.trim() || 'Arkadaşım',
      examDate: examDate.trim(),
      targetSchool: school.trim() || 'Hayalimdeki lise',
      targetNet: Number(targetNet) || 85,
    });
    setStep(1);
  };

  const finish = () => updateSettings({ onboardingComplete: true });
  const info = STEPS[step];

  return <Screen>
    <View style={{ flex: 1, justifyContent: 'center', paddingVertical: 28 }}>
      <View style={{ alignItems: 'center', marginBottom: 24 }}>
        <View style={{ width: 68, height: 68, borderRadius: 25, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
          <Text style={{ fontSize: 31 }}>✦</Text>
        </View>
        <Text style={[styles.eyebrow, { color: colors.primary }]}>{info.eyebrow}</Text>
        <Text style={[styles.title, { color: colors.foreground, textAlign: 'center' }]}>{info.title}</Text>
        <Text style={{ color: colors.mutedForeground, fontSize: 14, lineHeight: 20, textAlign: 'center', marginTop: 8 }}>{info.text}</Text>
        <Text style={{ color: colors.mutedForeground, fontSize: 12, marginTop: 8 }}>Adım {step + 1} / {STEPS.length}</Text>
      </View>

      {step === 0 ? <Card tone="pink">
        <Field label="Adın" value={name} onChangeText={setName} placeholder="Örn. Elif" />
        <Field label="LGS sınav tarihi (YYYY-AA-GG)" value={examDate} onChangeText={setExamDate} placeholder="2027-06-06" />
        <Field label="Hedeflediğin lise" value={school} onChangeText={setSchool} placeholder="Örn. Kabataş Erkek Lisesi" />
        <Field label="Hedef netin" value={targetNet} onChangeText={setTargetNet} placeholder="85" keyboardType="numeric" />
        <Text style={{ color: colors.mutedForeground, fontSize: 12, fontWeight: '700' }}>Tema ve renk</Text>
        <ThemePicker />
        <PrimaryButton label="Devam" onPress={saveProfile} icon="arrow-right" />
      </Card> : null}

      {step === 1 ? <View style={{ gap: 12 }}>
        <SpotifyCard />
        <PrimaryButton label="Devam" onPress={() => setStep(2)} icon="arrow-right" />
        <PrimaryButton label="Şimdilik atla" onPress={() => setStep(2)} secondary />
      </View> : null}

      {step === 2 ? <View style={{ gap: 12 }}>
        <PermissionsCard />
        <PrimaryButton label="Devam" onPress={() => setStep(3)} icon="arrow-right" />
      </View> : null}

      {step === 3 ? <View style={{ gap: 12 }}>
        <LockedAppsEditor />
        <PrimaryButton label="Devam" onPress={() => setStep(4)} icon="arrow-right" />
      </View> : null}

      {step === 4 ? <View style={{ gap: 12 }}>
        <Card><ReportSettings /></Card>
        <PrimaryButton label="Planımı oluşturalım" onPress={finish} icon="check" />
      </View> : null}

      <Text style={{ color: colors.mutedForeground, fontSize: 12, lineHeight: 18, textAlign: 'center', marginTop: 15 }}>Bilgilerin yalnızca bu telefonda saklanır.</Text>
    </View>
  </Screen>;
}
