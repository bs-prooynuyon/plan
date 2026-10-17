import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Card, Header, PrimaryButton, Screen } from '@/components/PlanimUI';
import { usePlanim } from '@/context/PlanimContext';
import { useColors } from '@/hooks/useColors';

function Counter({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  const colors = useColors();
  const btn = (text: string, delta: number) => <Pressable onPress={() => onChange(Math.max(0, value + delta))} style={{ paddingVertical: 10, paddingHorizontal: 12, borderRadius: 12, backgroundColor: colors.secondary }}><Text style={{ color: colors.secondaryForeground, fontWeight: '800' }}>{text}</Text></Pressable>;
  return <View style={{ gap: 8 }}>
    <Text style={{ color: colors.mutedForeground, fontSize: 12, fontWeight: '700' }}>{label}</Text>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      {btn('−1', -1)}<Text style={{ flex: 1, textAlign: 'center', color: colors.foreground, fontSize: 28, fontWeight: '800' }}>{value}</Text>{btn('+1', 1)}{btn('+5', 5)}{btn('+10', 10)}
    </View>
  </View>;
}

/** Ders bitince: kaç soru çözüldü, kaç doğru, kaç yanlış. */
export default function LessonSummaryScreen() {
  const colors = useColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { lessons, addQuestionLog } = usePlanim();
  const lesson = lessons.find((item) => item.id === id);
  const [solved, setSolved] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const save = (addWrongs: boolean) => {
    if (lesson && solved + correct + wrong > 0) addQuestionLog({ lessonId: lesson.id, subject: lesson.name, solved: Math.max(solved, correct + wrong), correct, wrong, topicIds: lesson.topicIds ?? [] });
    if (addWrongs) router.replace(`/wrongs?add=1&subject=${encodeURIComponent(lesson?.name ?? '')}` as never);
    else router.replace('/');
  };
  return <Screen>
    <Header eyebrow="Ders bitti" title={lesson?.name ?? 'Ders'} subtitle="Bu derste kaç soru çözdüğünü yaz. Hızlı geçebilirsin." />
    <Card><Counter label="ÇÖZÜLEN SORU" value={solved} onChange={setSolved} /><Counter label="DOĞRU" value={correct} onChange={setCorrect} /><Counter label="YANLIŞ" value={wrong} onChange={setWrong} /></Card>
    <PrimaryButton label="Yanlışlarımı ekle" onPress={() => save(true)} icon="camera" disabled={wrong === 0} />
    <PrimaryButton label="Kaydet ve bitir" onPress={() => save(false)} icon="check" secondary />
    <Text style={{ color: colors.mutedForeground, fontSize: 12, textAlign: 'center' }}>Atlamak istersen hiçbir şey yazmadan “Kaydet ve bitir”e basabilirsin.</Text>
  </Screen>;
}
