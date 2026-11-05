import { SubjectType, ALL_SUBJECTS } from './supabase';

export interface TestAttemptRecord {
  id: string; // unique id for this attempt
  testId: string; // topic id or subdomain
  title: string;
  subject: SubjectType;
  topicName: string;
  subtopicName?: string;
  timestamp: number; // Date.now()
  durationSeconds: number; // Time spent on the test
  totalQuestions: number;
  attempted: number;
  correct: number;
  wrong: number;
  unattempted: number;
  accuracy: number; // percentage (0-100)
  score: number;
}

export interface TopicPerformanceGroup {
  key: string;
  subject: SubjectType;
  topicName: string;
  subtopicName: string;
  title: string;
  testId: string;
  attemptCount: number;
  attempts: TestAttemptRecord[]; // sorted oldest to newest
  firstAttempt: TestAttemptRecord;
  latestAttempt: TestAttemptRecord;
  bestScore: number;
  bestAccuracy: number;
  improvementPercentage: number; // latest - first
  recentImprovement: number; // latest - previous (if >= 2 attempts)
  status: 'improved' | 'flop' | 'consistent' | 'baseline';
  totalTimeSeconds: number;
  averageTimeSeconds: number;
}

export interface SubjectAnalyticsSummary {
  subject: SubjectType;
  testsCount: number;
  uniqueTopicsCount: number;
  totalQuestionsAttempted: number;
  totalCorrect: number;
  totalWrong: number;
  accuracy: number;
  totalTimeSeconds: number;
}

export interface GrandAnalyticsSummary {
  grandTotalQuestions: number;
  grandTotalTests: number;
  grandTotalTimeSeconds: number;
  overallAccuracy: number;
  subjectStats: Record<SubjectType, SubjectAnalyticsSummary>;
  topicGroups: TopicPerformanceGroup[];
}

const STORAGE_KEY = 'topictest_analytics_history_v1';

export function getStoredAttempts(): TestAttemptRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed reading analytics from localStorage:', err);
  }
  return [];
}

export function saveTestAttempt(
  attempt: Omit<TestAttemptRecord, 'id' | 'timestamp'>
): TestAttemptRecord {
  const newRecord: TestAttemptRecord = {
    ...attempt,
    id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: Date.now(),
  };

  try {
    const existing = getStoredAttempts();
    const updated = [newRecord, ...existing];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Failed saving analytics to localStorage:', err);
  }

  return newRecord;
}

export function clearAllAttempts(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.warn('Failed clearing analytics:', err);
  }
}

export function formatTimeSeconds(seconds: number): string {
  if (!seconds || seconds <= 0) return '0s';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hrs > 0) {
    return `${hrs}h ${mins}m ${secs}s`;
  }
  if (mins > 0) {
    return `${mins}m ${secs}s`;
  }
  return `${secs}s`;
}

export function computeAnalyticsSummary(attempts: TestAttemptRecord[]): GrandAnalyticsSummary {
  let grandTotalQuestions = 0;
  let grandTotalCorrect = 0;
  let grandTotalTimeSeconds = 0;

  const subjectStats: Record<SubjectType, SubjectAnalyticsSummary> = {
    Math: { subject: 'Math', testsCount: 0, uniqueTopicsCount: 0, totalQuestionsAttempted: 0, totalCorrect: 0, totalWrong: 0, accuracy: 0, totalTimeSeconds: 0 },
    Reasoning: { subject: 'Reasoning', testsCount: 0, uniqueTopicsCount: 0, totalQuestionsAttempted: 0, totalCorrect: 0, totalWrong: 0, accuracy: 0, totalTimeSeconds: 0 },
    GK: { subject: 'GK', testsCount: 0, uniqueTopicsCount: 0, totalQuestionsAttempted: 0, totalCorrect: 0, totalWrong: 0, accuracy: 0, totalTimeSeconds: 0 },
    English: { subject: 'English', testsCount: 0, uniqueTopicsCount: 0, totalQuestionsAttempted: 0, totalCorrect: 0, totalWrong: 0, accuracy: 0, totalTimeSeconds: 0 },
    Computer: { subject: 'Computer', testsCount: 0, uniqueTopicsCount: 0, totalQuestionsAttempted: 0, totalCorrect: 0, totalWrong: 0, accuracy: 0, totalTimeSeconds: 0 },
  };

  const subjectTopicSets: Record<SubjectType, Set<string>> = {
    Math: new Set(),
    Reasoning: new Set(),
    GK: new Set(),
    English: new Set(),
    Computer: new Set(),
  };

  // Group attempts by topic/subtopic key
  const topicMap: Record<string, TestAttemptRecord[]> = {};

  attempts.forEach(att => {
    grandTotalQuestions += (att.attempted || att.totalQuestions || 0);
    grandTotalCorrect += (att.correct || 0);
    grandTotalTimeSeconds += (att.durationSeconds || 0);

    const s = att.subject;
    if (subjectStats[s]) {
      subjectStats[s].testsCount += 1;
      subjectStats[s].totalQuestionsAttempted += (att.attempted || att.totalQuestions || 0);
      subjectStats[s].totalCorrect += (att.correct || 0);
      subjectStats[s].totalWrong += (att.wrong || 0);
      subjectStats[s].totalTimeSeconds += (att.durationSeconds || 0);

      subjectTopicSets[s].add(att.topicName.trim().toLowerCase());
    }

    const key = `${att.subject}::${att.topicName.trim().toLowerCase()}::${(att.subtopicName || '').trim().toLowerCase()}`;
    if (!topicMap[key]) {
      topicMap[key] = [];
    }
    topicMap[key].push(att);
  });

  // Calculate subject-level unique topics and accuracy
  ALL_SUBJECTS.forEach(s => {
    subjectStats[s].uniqueTopicsCount = subjectTopicSets[s].size;
    const attCount = subjectStats[s].totalQuestionsAttempted;
    subjectStats[s].accuracy = attCount > 0
      ? Math.round((subjectStats[s].totalCorrect / attCount) * 100)
      : 0;
  });

  const overallAccuracy = grandTotalQuestions > 0
    ? Math.round((grandTotalCorrect / grandTotalQuestions) * 100)
    : 0;

  // Process each topic group for attempt counts & improvement tracking
  const topicGroups: TopicPerformanceGroup[] = Object.keys(topicMap).map(key => {
    const list = topicMap[key].sort((a, b) => a.timestamp - b.timestamp); // oldest to newest
    const first = list[0];
    const latest = list[list.length - 1];
    const prev = list.length > 1 ? list[list.length - 2] : null;

    const bestScore = Math.max(...list.map(l => l.score || 0));
    const bestAccuracy = Math.max(...list.map(l => l.accuracy || 0));
    const totalTimeSeconds = list.reduce((sum, l) => sum + (l.durationSeconds || 0), 0);
    const averageTimeSeconds = Math.round(totalTimeSeconds / list.length);

    // Improvement from first attempt to latest
    const improvementPercentage = latest.accuracy - first.accuracy;
    // Recent change from previous attempt
    const recentImprovement = prev ? (latest.accuracy - prev.accuracy) : 0;

    let status: 'improved' | 'flop' | 'consistent' | 'baseline' = 'baseline';
    if (list.length > 1) {
      if (recentImprovement > 0) {
        status = 'improved';
      } else if (recentImprovement < 0) {
        status = 'flop';
      } else {
        status = 'consistent';
      }
    }

    return {
      key,
      subject: latest.subject,
      topicName: latest.topicName,
      subtopicName: latest.subtopicName || '',
      title: latest.title,
      testId: latest.testId,
      attemptCount: list.length,
      attempts: list,
      firstAttempt: first,
      latestAttempt: latest,
      bestScore,
      bestAccuracy,
      improvementPercentage,
      recentImprovement,
      status,
      totalTimeSeconds,
      averageTimeSeconds,
    };
  });

  // Sort topics by most recently practiced
  topicGroups.sort((a, b) => b.latestAttempt.timestamp - a.latestAttempt.timestamp);

  return {
    grandTotalQuestions,
    grandTotalTests: attempts.length,
    grandTotalTimeSeconds,
    overallAccuracy,
    subjectStats,
    topicGroups,
  };
}
