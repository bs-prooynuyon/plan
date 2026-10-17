import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { ExamPdf, FocusSession, Friend, Lesson, MockExam, QuestionLog, SEED_TOPICS, Topic, UserSettings, WrongQuestion, topicKey } from '@/types/planim';

const STORAGE_KEY = 'planim-store-v1';

interface Store {
  lessons: Lesson[];
  exams: MockExam[];
  topics: Topic[];
  sessions: FocusSession[];
  questionLogs: QuestionLog[];
  wrongs: WrongQuestion[];
  friends: Friend[];
  examPdfs: ExamPdf[];
  settings: UserSettings;
}

const initialStore: Store = {
  lessons: [],
  exams: [],
  topics: SEED_TOPICS,
  sessions: [],
  questionLogs: [],
  wrongs: [],
  friends: [],
  examPdfs: [],
  settings: {
    studentName: '',
    examDate: '',
    targetSchool: '',
    targetNet: 0,
    netDivisor: 3,
    theme: 'light',
    accent: 'pink',
    themeInit: false,
    reportDay: 6,
    reportTime: '20:00',
    parentPhone: '',
    monthlyDay: 1,
    lastQuoteDate: '',
    onboardingComplete: false,
    studyLockEnabled: false,
    spotifyClientId: '',
    spotifyUser: '',
    profilePhoto: '',
    consentAccepted: false,
    consentAt: '',
    lockedApps: [],
    friendApps: [],
    alwaysAllowedApps: [],
    lockedAppsConfigured: false,
  },
};

interface PlanimContextValue extends Store {
  hydrated: boolean;
  addLesson: (lesson: Omit<Lesson, 'id'>) => void;
  removeLesson: (id: string) => void;
  addExam: (exam: Omit<MockExam, 'id'>) => void;
  addTopic: (topic: Omit<Topic, 'id'>) => void;
  toggleTopic: (id: string) => void;
  saveTopicNote: (id: string, note: string) => void;
  addFocusSession: (durationMinutes: number) => void;
  addQuestionLog: (log: Omit<QuestionLog, 'id' | 'date'>) => void;
  addWrong: (wrong: Omit<WrongQuestion, 'id' | 'date' | 'understood' | 'failCount'>) => void;
  updateWrong: (id: string, patch: Partial<WrongQuestion>) => void;
  removeWrong: (id: string) => void;
  addFriend: (friend: Omit<Friend, 'id'>) => void;
  removeFriend: (id: string) => void;
  addExamPdf: (pdf: Omit<ExamPdf, 'id' | 'date'>) => void;
  removeExamPdf: (id: string) => void;
  updateSettings: (settings: Partial<UserSettings>) => void;
  resetAll: () => void;
}

const PlanimContext = createContext<PlanimContextValue | null>(null);

/** Kayıtlı konuları korur (durum + not), müfredattaki yeni konuları ekler. */
function mergeTopics(saved?: Topic[]): Topic[] {
  if (!saved) return SEED_TOPICS;
  const old = new Map(saved.map((item) => [topicKey(item.subject, item.title), item]));
  const seeds = SEED_TOPICS.map((seed) => { const prev = old.get(topicKey(seed.subject, seed.title)); return prev ? { ...seed, status: prev.status, note: prev.note } : seed; });
  return [...saved.filter((item) => item.isCustom), ...seeds];
}

const makeId = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export function PlanimProvider({ children }: { children: React.ReactNode }) {
  const [store, setStore] = useState<Store>(initialStore);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((value) => {
        if (value) {
          const saved = JSON.parse(value) as Partial<Store>;
          const demoLessons = ['lesson-1', 'lesson-2', 'lesson-3'];
          setStore({
            ...initialStore,
            ...saved,
            lessons: (saved.lessons ?? []).filter((item) => !demoLessons.includes(item.id)),
            exams: (saved.exams ?? []).filter((item) => item.id !== 'exam-demo'),
            topics: mergeTopics(saved.topics),
            settings: { ...initialStore.settings, ...(saved.settings ?? {}) },
          });
        }
      })
      .catch(() => undefined)
      .finally(() => setHydrated(true));
  }, []);

  useEffect(() => {
    if (hydrated) AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(store)).catch(() => undefined);
  }, [store, hydrated]);

  const value = useMemo<PlanimContextValue>(() => ({
    ...store,
    hydrated,
    addLesson: (lesson) => setStore((current) => ({ ...current, lessons: [{ ...lesson, id: makeId('lesson') }, ...current.lessons] })),
    removeLesson: (id) => setStore((current) => ({ ...current, lessons: current.lessons.filter((item) => item.id !== id) })),
    addExam: (exam) => setStore((current) => ({ ...current, exams: [{ ...exam, id: makeId('exam') }, ...current.exams] })),
    addTopic: (topic) => setStore((current) => ({ ...current, topics: [{ ...topic, id: makeId('topic') }, ...current.topics] })),
    toggleTopic: (id) => setStore((current) => ({
      ...current,
      topics: current.topics.map((topic) => topic.id === id
        ? { ...topic, status: topic.status === 'learned' ? 'missing' : 'learned' }
        : topic),
    })),
    saveTopicNote: (id, note) => setStore((current) => ({
      ...current,
      topics: current.topics.map((topic) => topic.id === id ? { ...topic, note } : topic),
    })),
    addFocusSession: (durationMinutes) => setStore((current) => ({
      ...current,
      sessions: [{ id: makeId('focus'), date: new Date().toISOString(), durationMinutes }, ...current.sessions],
    })),
    addQuestionLog: (log) => setStore((current) => ({ ...current, questionLogs: [{ ...log, id: makeId('qlog'), date: new Date().toISOString() }, ...current.questionLogs] })),
    addWrong: (wrong) => setStore((current) => ({ ...current, wrongs: [{ ...wrong, id: makeId('wrong'), date: new Date().toISOString(), understood: null, failCount: 0 }, ...current.wrongs] })),
    updateWrong: (id, patch) => setStore((current) => ({ ...current, wrongs: current.wrongs.map((item) => item.id === id ? { ...item, ...patch } : item) })),
    removeWrong: (id) => setStore((current) => ({ ...current, wrongs: current.wrongs.filter((item) => item.id !== id) })),
    addFriend: (friend) => setStore((current) => ({ ...current, friends: [{ ...friend, id: makeId('friend') }, ...current.friends] })),
    removeFriend: (id) => setStore((current) => ({ ...current, friends: current.friends.filter((item) => item.id !== id) })),
    addExamPdf: (pdf) => setStore((current) => ({ ...current, examPdfs: [{ ...pdf, id: makeId('pdf'), date: new Date().toISOString().slice(0, 10) }, ...current.examPdfs] })),
    removeExamPdf: (id) => setStore((current) => ({ ...current, examPdfs: current.examPdfs.filter((item) => item.id !== id) })),
    resetAll: () => setStore({ ...initialStore, settings: { ...initialStore.settings } }),
    updateSettings: (settings) => setStore((current) => ({ ...current, settings: { ...current.settings, ...settings } })),
  }), [store, hydrated]);

  return <PlanimContext.Provider value={value}>{children}</PlanimContext.Provider>;
}

export function useOptionalPlanim() {
  return useContext(PlanimContext);
}

export function usePlanim() {
  const context = useContext(PlanimContext);
  if (!context) throw new Error('usePlanim must be used inside PlanimProvider');
  return context;
}