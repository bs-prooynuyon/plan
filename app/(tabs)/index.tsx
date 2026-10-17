import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useMemo } from 'react';
import { Text, View } from 'react-native';
import { Card, Header, Screen, SectionTitle } from '@/components/PlanimUI';
import { usePlanim } from '@/context/PlanimContext';
import { quoteOfToday } from '@/constants/quotes';
import { Subject } from '@/types/planim';
import { useColors } from '@/hooks/useColors';

function daysUntil(dateString: string) {
  const target = new Date(`${dateString}T00:00:00`).getTime();
  return Math.max(0, Math.ceil((target - Date.now()) / 86400000));
}

export default function HomeScreen() {
  const colors = useColors();
  const { settings, exams, topics, lessons } = usePlanim();
  const latestExam = exams[0];
  const missingTopics = topics.filter((topic) => topic.status === 'missing');
  const averageNet = latestExam ? latestExam.results.reduce((total, item) => total + item.net, 0) : 0;
  const nextLesson = useMemo(() => {
    const day = (new Date().getDay() + 6) % 7;
    return lessons.filter((lesson) => lesson.day === day).sort((a, b) => a.startTime.localeCompare(b.startTime))[0];
  }, [lessons]);
  const quote = quoteOfToday();
  const subjects = [...new Set(missingTopics.map((topic) => topic.subject))] as Subject[];

  return <Screen topBar>
    <Header eyebrow={`Günaydın, ${settings.studentName || 'arkadaşım'}`} title="Bugün senin günün." subtitle="Kendin için ayırdığın her dakika hedeflerine biraz daha yaklaştırıyor." />
    {settings.examDate ? <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start', paddingVertical: 7, paddingHorizontal: 12, borderRadius: 14, backgroundColor: colors.accent }}>
      <Feather name="calendar" size={14} color={colors.accentForeground} />
      <Text style={{ color: colors.accentForeground, fontSize: 13, fontWeight: '700' }}>LGS'ye {daysUntil(settings.examDate)} gün{settings.targetSchool ? ` · ${settings.targetSchool}` : ''}</Text>
    </View> : null}
    {latestExam && settings.targetNet ? <Text style={{ color: colors.mutedForeground, fontSize: 12 }}>Hedef netine {Math.max(0, settings.targetNet - averageNet).toFixed(1)} net kaldı</Text> : null}
    <SectionTitle title="Sıradaki dersin" action="Programı gör" onAction={() => router.push('/schedule')} />
    <Card>{nextLesson ? <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}><View style={{ width: 46, height: 46, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.accent }}><Feather name="book-open" size={21} color={colors.primary} /></View><View style={{ flex: 1 }}><Text style={{ color: colors.foreground, fontSize: 17, fontWeight: '800' }}>{nextLesson.name}</Text><Text style={{ color: colors.mutedForeground, fontSize: 13, marginTop: 3 }}>{nextLesson.startTime} – {nextLesson.endTime}{nextLesson.place ? ` · ${nextLesson.place}` : ''}</Text></View><View style={{ alignItems: 'flex-end' }}><Text style={{ color: colors.primary, fontSize: 12, fontWeight: '800' }}>HAZIR MISIN?</Text><Feather name="arrow-up-right" size={18} color={colors.primary} style={{ marginTop: 6 }} /></View></View> : <Text style={{ color: colors.mutedForeground }}>{lessons.length ? 'Bugün için ders yok.' : 'Henüz ders eklenmedi.'}</Text>}</Card>
    <SectionTitle title="Son denemen" action="Tümünü gör" onAction={() => router.push('/exams')} />
    <Card>{latestExam ? <><View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}><View><Text style={{ color: colors.foreground, fontSize: 16, fontWeight: '800' }}>{latestExam.title}</Text><Text style={{ color: colors.mutedForeground, fontSize: 12, marginTop: 4 }}>{latestExam.date}</Text></View><Text style={{ color: colors.success, fontSize: 24, fontWeight: '800' }}>{averageNet.toFixed(1)} <Text style={{ fontSize: 12, fontWeight: '500' }}>net</Text></Text></View><View style={{ flexDirection: 'row', gap: 7, flexWrap: 'wrap' }}>{latestExam.results.map((result) => <View key={result.subject} style={{ borderRadius: 10, backgroundColor: colors.muted, paddingVertical: 7, paddingHorizontal: 9 }}><Text style={{ color: colors.mutedForeground, fontSize: 11 }}>{result.subject === 'Fen Bilimleri' ? 'Fen' : result.subject}</Text><Text style={{ color: colors.foreground, fontSize: 13, fontWeight: '800', marginTop: 2 }}>{result.net.toFixed(1)}</Text></View>)}</View></> : <Text style={{ color: colors.mutedForeground }}>Henüz deneme sonucu eklemedin. İlkini kaydetmek ister misin?</Text>}</Card>
    <SectionTitle title="Eksik konuların" action="Konulara git" onAction={() => router.push('/topics')} />
    <Card><View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}><View style={{ width: 45, height: 45, borderRadius: 16, backgroundColor: colors.warnSoft, alignItems: 'center', justifyContent: 'center' }}><Feather name="compass" size={21} color={colors.destructive} /></View><View style={{ flex: 1 }}><Text style={{ color: colors.foreground, fontSize: 16, fontWeight: '800' }}>{missingTopics.length} konu üzerinde çalışabilirsin</Text><Text style={{ color: colors.mutedForeground, fontSize: 13, marginTop: 3 }}>{subjects.slice(0, 3).join(' · ') || 'Henüz konu yok'}</Text></View><Feather name="chevron-right" size={19} color={colors.mutedForeground} /></View></Card>
    <Card style={{ marginBottom: 6, gap: 8 }}><Text style={{ color: colors.primary, fontSize: 11, fontWeight: '800', letterSpacing: 1.1 }}>GÜNÜN SÖZÜ</Text><Text style={{ color: colors.foreground, fontSize: 17, lineHeight: 25, fontFamily: 'Georgia', fontWeight: '600' }}>{quote}</Text></Card>
  </Screen>;
}
