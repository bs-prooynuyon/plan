import type { AccentName } from '@/constants/colors';

export type Subject =
  | 'Türkçe'
  | 'Matematik'
  | 'Fen Bilimleri'
  | 'İnkılap'
  | 'Din Kültürü'
  | 'İngilizce';

export type TopicStatus = 'learned' | 'missing';

export interface Lesson {
  id: string;
  day: number;
  name: string;
  startTime: string;
  endTime: string;
  place: string;
  alarmMinutes: number;
  spotifyTrackUri?: string;
  spotifyName?: string;
  topicIds?: string[];
}

/** Bir konuda çözülen soruların dağılımı. */
export interface TopicEntry {
  topicId: string;
  title: string;
  correct: number;
  wrong: number;
  blank: number;
}

export interface QuestionLog {
  id: string;
  date: string;
  lessonId: string;
  subject: string;
  solved: number;
  correct: number;
  wrong: number;
  /** Boş bırakılan soru sayısı (eski kayıtlarda yok). */
  blank?: number;
  topicIds: string[];
  /** Konu bazlı döküm (eski kayıtlarda yok). */
  entries?: TopicEntry[];
}

export interface WrongQuestion {
  id: string;
  date: string;
  subject: string;
  photo: string;
  /** null = henüz tekrar çözülmedi */
  understood: boolean | null;
  /** Tekrarda "anlamadım" ya da yine yanlış denilen sayı */
  failCount: number;
  friendAnswer: string;
}

export interface Friend {
  id: string;
  name: string;
  phone: string;
}

export interface ExamPdf {
  id: string;
  title: string;
  uri: string;
  date: string;
}

export interface SubjectResult {
  subject: Subject;
  correct: number;
  wrong: number;
  net: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
}

export interface MockExam {
  id: string;
  date: string;
  title: string;
  results: SubjectResult[];
  /** Yüklenen deneme PDF'i (varsa). */
  pdfUri?: string;
  /** Yapay zekanın PDF'ten çıkardığı kısa analiz. */
  analysis?: string;
  /** Yapay zekanın tespit ettiği zayıf konular. */
  weakTopics?: string[];
  /** Yapay zeka ile bu deneme hakkındaki sohbet. */
  chat?: ChatMessage[];
}

export interface Topic {
  id: string;
  subject: Subject;
  title: string;
  status: TopicStatus;
  isCustom: boolean;
  note: string;
}

export interface FocusSession {
  id: string;
  date: string;
  durationMinutes: number;
}

export interface UserSettings {
  studentName: string;
  examDate: string;
  targetSchool: string;
  targetNet: number;
  netDivisor: number;
  theme: 'system' | 'light' | 'dark';
  accent: AccentName;
  themeInit: boolean;
  reportDay: number;
  reportTime: string;
  parentPhone: string;
  monthlyDay: number;
  lastQuoteDate: string;
  onboardingComplete: boolean;
  studyLockEnabled: boolean;
  spotifyClientId: string;
  spotifyUser: string;
  profilePhoto: string;
  consentAccepted: boolean;
  consentAt: string;
  lockedApps: string[];
  friendApps: string[];
  alwaysAllowedApps: string[];
  lockedAppsConfigured: boolean;
  /** Hesap e-postası (başka cihazdan girişte aynı hesap açılır). */
  email: string;
  /** Hesap sahibi bulut hesabına giriş yaptı mı? */
  signedIn: boolean;
  /** Ders başlangıç alarmının sesi ('' = telefonun varsayılan alarm sesi). */
  alarmSoundUri: string;
  alarmSoundName: string;
}

export const SUBJECTS: Subject[] = [
  'Türkçe',
  'Matematik',
  'Fen Bilimleri',
  'İnkılap',
  'Din Kültürü',
  'İngilizce',
];

export const QUESTION_COUNTS: Record<Subject, number> = {
  Türkçe: 20,
  Matematik: 20,
  'Fen Bilimleri': 20,
  İnkılap: 10,
  'Din Kültürü': 10,
  İngilizce: 10,
};

export const SUBJECT_COLORS: Record<Subject, string> = {
  Türkçe: '#E85D9E',
  Matematik: '#8E7AC3',
  'Fen Bilimleri': '#22B8A0',
  İnkılap: '#F2A64B',
  'Din Kültürü': '#6CA7D9',
  İngilizce: '#F0654F',
};

export const WEEKDAYS = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

const CURRICULUM: Record<Subject, string[]> = {
  'Türkçe': ['Sözcükte Anlam', 'Cümlede Anlam', 'Paragrafta Anlam', 'Fiilimsiler', 'Cümlenin Ögeleri', 'Cümle Türleri', 'Fiilde Çatı', 'Metin Türleri', 'Söz Sanatları', 'Deyimler ve Atasözleri', 'Yazım Kuralları', 'Noktalama İşaretleri', 'Anlatım Bozuklukları', 'Görsel Okuma ve Sözel Mantık'],
  'Matematik': ['Çarpanlar ve Katlar', 'Üslü İfadeler', 'Kareköklü İfadeler', 'Veri Analizi', 'Basit Olayların Olma Olasılığı', 'Cebirsel İfadeler ve Özdeşlikler', 'Doğrusal Denklemler', 'Eşitsizlikler', 'Üçgenler', 'Eşlik ve Benzerlik', 'Dönüşüm Geometrisi', 'Geometrik Cisimler'],
  'Fen Bilimleri': ['Mevsimler ve İklim', 'DNA ve Genetik Kod', 'Basınç', 'Madde ve Endüstri', 'Basit Makineler', 'Enerji Dönüşümleri ve Çevre Bilimi', 'Elektrik Yükleri ve Elektrik Enerjisi'],
  'İnkılap': ['Bir Kahraman Doğuyor', 'Milli Uyanış: Bağımsızlık Yolunda Atılan Adımlar', 'Milli Bir Destan: Ya İstiklal Ya Ölüm', 'Atatürkçülük ve Çağdaşlaşan Türkiye', 'Demokratikleşme Çabaları', 'Atatürk Dönemi Türk Dış Politikası', 'Atatürk\'ün Ölümü ve Sonrası'],
  'Din Kültürü': ['Kader İnancı', 'Zekât ve Sadaka', 'Din ve Hayat', 'Hz. Muhammed\'in Örnekliği', 'Kur\'an-ı Kerim ve Yorumu'],
  'İngilizce': ['Friendship', 'Teen Life', 'In the Kitchen', 'On the Phone', 'The Internet', 'Adventures', 'Tourism', 'Chores', 'Science', 'Natural Forces'],
};

export const topicKey = (subject: string, title: string) => `${subject}|${title}`;

export const SEED_TOPICS: Topic[] = (Object.keys(CURRICULUM) as Subject[]).flatMap((subject) => CURRICULUM[subject].map((title) => ({
  id: `seed-${subject}-${title}`,
  title,
  subject,
  status: 'missing' as TopicStatus,
  isCustom: false,
  note: '',
})));
