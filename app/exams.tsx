import * as DocumentPicker from 'expo-document-picker';
import { router } from 'expo-router';
import * as Sharing from 'expo-sharing';
import React, { useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { Card, Field, Header, IconButton, PrimaryButton, Screen, styles } from '@/components/PlanimUI';
import { usePlanim } from '@/context/PlanimContext';
import { QUESTION_COUNTS, SUBJECTS, Subject } from '@/types/planim';
import { useColors } from '@/hooks/useColors';
import { keepFile } from '@/lib/files';

export default function ExamsScreen() {
  const colors = useColors();
  const { exams, settings, addExam, examPdfs, addExamPdf, removeExamPdf } = usePlanim();
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState('Deneme sınavı');
  const [correct, setCorrect] = useState<Record<Subject, string>>({ Türkçe: '0', Matematik: '0', 'Fen Bilimleri': '0', İnkılap: '0', 'Din Kültürü': '0', İngilizce: '0' });
  const [wrong, setWrong] = useState<Record<Subject, string>>({ Türkçe: '0', Matematik: '0', 'Fen Bilimleri': '0', İnkılap: '0', 'Din Kültürü': '0', İngilizce: '0' });
  const pickPdf = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: 'application/pdf', copyToCacheDirectory: true });
      const asset = result.canceled ? null : result.assets[0];
      if (!asset) return;
      addExamPdf({ title: asset.name.replace(/\.pdf$/i, ''), uri: await keepFile(asset.uri, 'pdf') });
    } catch { Alert.alert('PDF eklenemedi', 'Tekrar dener misin?'); }
  };
  const openPdf = async (uri: string) => {
    try { if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'PDF’i aç' }); } catch { Alert.alert('PDF açılamadı', 'Telefonda bir PDF okuyucu uygulaması var mı?'); }
  };
  const save = () => { addExam({ title, date: new Date().toISOString().slice(0, 10), results: SUBJECTS.map((subject) => { const c = Number(correct[subject]) || 0; const w = Number(wrong[subject]) || 0; return { subject, correct: c, wrong: w, net: c - w / settings.netDivisor }; }) }); setAdding(false); };
  return <Screen><Header eyebrow="Gelişimini fark et" title="Deneme sonuçları" subtitle="Her sonuç, nerede olduğunu ve nereye gideceğini gösterir." right={<IconButton name="plus" onPress={() => setAdding((value) => !value)} color={colors.primary} />} />
    <Card>
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Deneme PDF’lerim</Text>
      <Text style={{ color: colors.mutedForeground, fontSize: 13, lineHeight: 19 }}>Aldığın ya da internetten indirdiğin deneme PDF’ini buraya yükle, PDF okuyucunda aç ve çözdükten sonra netlerini yukarıdaki + ile gir.</Text>
      <PrimaryButton label="PDF yükle" onPress={pickPdf} icon="upload" />
      {examPdfs.length === 0 ? <Text style={{ color: colors.mutedForeground, fontSize: 12 }}>Henüz PDF yüklenmedi.</Text> : null}
      {examPdfs.map((pdf) => <View key={pdf.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}><Pressable onPress={() => openPdf(pdf.uri)} style={{ flex: 1 }}><Text style={{ color: colors.primary, fontWeight: '800' }} numberOfLines={1}>{pdf.title}</Text><Text style={{ color: colors.mutedForeground, fontSize: 11 }}>{pdf.date} · açmak için dokun</Text></Pressable><Pressable onPress={() => removeExamPdf(pdf.id)}><Text style={{ color: colors.mutedForeground }}>Sil</Text></Pressable></View>)}
    </Card>
    {adding ? <Card tone="pink"><Text style={[styles.sectionTitle, { color: colors.foreground }]}>Yeni deneme</Text><Field label="Deneme adı" value={title} onChangeText={setTitle} /><Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Doğru / yanlış sayılarını gir</Text><View style={{ gap: 8 }}>{SUBJECTS.map((subject) => <View key={subject} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}><Text style={{ color: colors.foreground, fontSize: 13, flex: 1 }}>{subject} <Text style={{ color: colors.mutedForeground, fontSize: 11 }}>/{QUESTION_COUNTS[subject]}</Text></Text><View style={{ width: 62 }}><Field label="" value={correct[subject]} onChangeText={(value) => setCorrect((current) => ({ ...current, [subject]: value }))} keyboardType="numeric" /></View><Text style={{ color: colors.mutedForeground }}>·</Text><View style={{ width: 62 }}><Field label="" value={wrong[subject]} onChangeText={(value) => setWrong((current) => ({ ...current, [subject]: value }))} keyboardType="numeric" /></View></View>)}</View><Text style={{ color: colors.mutedForeground, fontSize: 12 }}>Net = doğru − (yanlış ÷ {settings.netDivisor})</Text><PrimaryButton label="Denemeyi kaydet" onPress={save} icon="check" /></Card> : null}
    {exams.map((exam) => <Card key={exam.id}><View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}><View><Text style={{ color: colors.foreground, fontWeight: '800', fontSize: 16 }}>{exam.title}</Text><Text style={{ color: colors.mutedForeground, fontSize: 12, marginTop: 4 }}>{exam.date}</Text></View><Text style={{ color: colors.success, fontWeight: '800', fontSize: 21 }}>{exam.results.reduce((sum, item) => sum + item.net, 0).toFixed(1)} <Text style={{ fontSize: 11 }}>net</Text></Text></View><View style={{ gap: 8, marginTop: 3 }}>{exam.results.map((result) => <View key={result.subject} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}><View style={{ flex: 1, height: 7, borderRadius: 6, backgroundColor: colors.muted }}><View style={{ height: 7, borderRadius: 6, backgroundColor: colors.primary, width: `${Math.max(0, Math.min(100, (result.net / QUESTION_COUNTS[result.subject]) * 100))}%` }} /></View><Text style={{ width: 84, color: colors.mutedForeground, fontSize: 11 }}>{result.subject}</Text><Text style={{ color: colors.foreground, fontWeight: '800', fontSize: 12, width: 31, textAlign: 'right' }}>{result.net.toFixed(1)}</Text></View>)}</View></Card>)}
    <Pressable onPress={() => router.back()}><Text style={{ color: colors.primary, fontWeight: '700', textAlign: 'center', marginTop: 2 }}>Geri dön</Text></Pressable>
  </Screen>;
}