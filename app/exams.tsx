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
import { aiErrorText, analyzeExamPdf, hasAiKey } from '@/lib/ai';
import { ActivityIndicator } from 'react-native';

export default function ExamsScreen() {
  const colors = useColors();
  const { exams, settings, addExam } = usePlanim();
  const [pdfUri, setPdfUri] = useState<string | undefined>();
  const [analysis, setAnalysis] = useState<string | undefined>();
  const [weak, setWeak] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState('Deneme sınavı');
  const [correct, setCorrect] = useState<Record<Subject, string>>({ Türkçe: '0', Matematik: '0', 'Fen Bilimleri': '0', İnkılap: '0', 'Din Kültürü': '0', İngilizce: '0' });
  const [wrong, setWrong] = useState<Record<Subject, string>>({ Türkçe: '0', Matematik: '0', 'Fen Bilimleri': '0', İnkılap: '0', 'Din Kültürü': '0', İngilizce: '0' });
  const openPdf = async (uri: string) => {
    try { if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'PDF’i aç' }); } catch { Alert.alert('PDF açılamadı', 'Telefonda bir PDF okuyucu uygulaması var mı?'); }
  };
  /** PDF seç → kalıcı kopya → yapay zekaya okut → formu doldur. */
  const pickPdf = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: 'application/pdf', copyToCacheDirectory: true });
      const asset = result.canceled ? null : result.assets[0];
      if (!asset) return;
      if (asset.size && asset.size > 20 * 1024 * 1024) return Alert.alert('PDF çok büyük', 'En fazla 20 MB’lık bir PDF analiz edilebilir.');
      const uri = await keepFile(asset.uri, 'pdf');
      setPdfUri(uri); setAdding(true); setTitle(asset.name.replace(/\.pdf$/i, '')); setAnalysis(undefined); setWeak([]);
      if (!(await hasAiKey())) { Alert.alert('PDF eklendi', 'Yapay zeka için Ayarlar > Yapay zeka bölümüne Gemini anahtarını ekleyebilirsin. Şimdilik netleri elle gir; PDF denemeyle birlikte saklanır.'); return; }
      setBusy(true);
      try {
        const FS = require('expo-file-system/legacy');
        const base64 = await FS.readAsStringAsync(uri, { encoding: 'base64' });
        const found = await analyzeExamPdf(base64);
        if (found.title) setTitle(found.title);
        const nextC: Record<string, string> = {}; const nextW: Record<string, string> = {};
        found.results.forEach((r) => { if (SUBJECTS.includes(r.subject)) { nextC[r.subject] = String(r.correct); nextW[r.subject] = String(r.wrong); } });
        setCorrect((cur) => ({ ...cur, ...nextC } as Record<Subject, string>)); setWrong((cur) => ({ ...cur, ...nextW } as Record<Subject, string>));
        setAnalysis(found.summary); setWeak(found.weakTopics ?? []);
        Alert.alert(found.results.length ? 'Netler okundu' : 'Net bulunamadı', found.results.length ? 'Sayıları kontrol edip denemeyi kaydet.' : 'PDF’te sonuç yok gibi görünüyor; netleri elle girebilirsin. Yine de yapay zekaya soru sorabilirsin.');
      } catch (error) { Alert.alert('PDF analiz edilemedi', aiErrorText(error)); }
      finally { setBusy(false); }
    } catch { Alert.alert('PDF eklenemedi', 'Tekrar dener misin?'); }
  };
  const save = () => { addExam({ pdfUri, analysis, weakTopics: weak.length ? weak : undefined, title, date: new Date().toISOString().slice(0, 10), results: SUBJECTS.map((subject) => { const c = Number(correct[subject]) || 0; const w = Number(wrong[subject]) || 0; return { subject, correct: c, wrong: w, net: c - w / settings.netDivisor }; }) }); setAdding(false); setPdfUri(undefined); setAnalysis(undefined); setWeak([]); };
  return <Screen><Header eyebrow="Gelişimini fark et" title="Deneme sonuçları" subtitle="Her sonuç, nerede olduğunu ve nereye gideceğini gösterir." right={<IconButton name="plus" onPress={() => setAdding((value) => !value)} color={colors.primary} />} />
    <Card>
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>PDF’ten ekle</Text>
      <Text style={{ color: colors.mutedForeground, fontSize: 13, lineHeight: 19 }}>Deneme PDF’ini yükle; yapay zeka okuyup doğru / yanlış sayılarını ve zayıf konularını çıkarır, sonra denemeyle ilgili ona soru sorabilirsin. Dilersen sağ üstteki + ile netleri elle de girebilirsin.</Text>
      <PrimaryButton label={busy ? 'Analiz ediliyor…' : 'PDF yükle ve analiz et'} onPress={pickPdf} icon="upload" disabled={busy} />
      {busy ? <ActivityIndicator color={colors.primary} /> : null}
    </Card>
    {adding ? <Card tone="pink"><Text style={[styles.sectionTitle, { color: colors.foreground }]}>Yeni deneme</Text><Field label="Deneme adı" value={title} onChangeText={setTitle} />{pdfUri ? <Text style={{ color: colors.success, fontSize: 12, fontWeight: '700' }}>PDF eklendi</Text> : null}{analysis ? <Text style={{ color: colors.foreground, fontSize: 13, lineHeight: 19 }}>{analysis}</Text> : null}{weak.length ? <Text style={{ color: colors.mutedForeground, fontSize: 12 }}>Zayıf konular: {weak.join(', ')}</Text> : null}<Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Doğru / yanlış sayılarını gir</Text><View style={{ gap: 8 }}>{SUBJECTS.map((subject) => <View key={subject} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}><Text style={{ color: colors.foreground, fontSize: 13, flex: 1 }}>{subject} <Text style={{ color: colors.mutedForeground, fontSize: 11 }}>/{QUESTION_COUNTS[subject]}</Text></Text><View style={{ width: 62 }}><Field label="" value={correct[subject]} onChangeText={(value) => setCorrect((current) => ({ ...current, [subject]: value }))} keyboardType="numeric" /></View><Text style={{ color: colors.mutedForeground }}>·</Text><View style={{ width: 62 }}><Field label="" value={wrong[subject]} onChangeText={(value) => setWrong((current) => ({ ...current, [subject]: value }))} keyboardType="numeric" /></View></View>)}</View><Text style={{ color: colors.mutedForeground, fontSize: 12 }}>Net = doğru − (yanlış ÷ {settings.netDivisor})</Text><PrimaryButton label="Denemeyi kaydet" onPress={save} icon="check" /></Card> : null}
    {exams.map((exam) => <Card key={exam.id}><View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}><View><Text style={{ color: colors.foreground, fontWeight: '800', fontSize: 16 }}>{exam.title}</Text><Text style={{ color: colors.mutedForeground, fontSize: 12, marginTop: 4 }}>{exam.date}</Text></View><Text style={{ color: colors.success, fontWeight: '800', fontSize: 21 }}>{exam.results.reduce((sum, item) => sum + item.net, 0).toFixed(1)} <Text style={{ fontSize: 11 }}>net</Text></Text></View><View style={{ gap: 8, marginTop: 3 }}>{exam.results.map((result) => <View key={result.subject} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}><View style={{ flex: 1, height: 7, borderRadius: 6, backgroundColor: colors.muted }}><View style={{ height: 7, borderRadius: 6, backgroundColor: colors.primary, width: `${Math.max(0, Math.min(100, (result.net / QUESTION_COUNTS[result.subject]) * 100))}%` }} /></View><Text style={{ width: 84, color: colors.mutedForeground, fontSize: 11 }}>{result.subject}</Text><Text style={{ color: colors.foreground, fontWeight: '800', fontSize: 12, width: 31, textAlign: 'right' }}>{result.net.toFixed(1)}</Text></View>)}</View>{exam.analysis ? <Text style={{ color: colors.mutedForeground, fontSize: 12, lineHeight: 18 }}>{exam.analysis}</Text> : null}{exam.weakTopics?.length ? <Text style={{ color: colors.destructive, fontSize: 12, fontWeight: '700' }}>Çalışılacak konular: {exam.weakTopics.join(' · ')}</Text> : null}<View style={{ flexDirection: 'row', gap: 8 }}>{exam.pdfUri ? <View style={{ flex: 1 }}><PrimaryButton label="PDF’i aç" onPress={() => openPdf(exam.pdfUri!)} icon="file-text" secondary /></View> : null}<View style={{ flex: 1 }}><PrimaryButton label="Yapay zekaya sor" onPress={() => router.push(`/exam-ai?id=${exam.id}` as never)} icon="message-circle" /></View></View></Card>)}
    <Pressable onPress={() => router.back()}><Text style={{ color: colors.primary, fontWeight: '700', textAlign: 'center', marginTop: 2 }}>Geri dön</Text></Pressable>
  </Screen>;
}