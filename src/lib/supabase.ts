import { createClient } from '@supabase/supabase-js';
import { UniversalMCQQuestion } from '../types/mcq';

export const SUPABASE_URL = 'https://tnxuklrhfvfgbuvqspop.supabase.co';
export const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_j9dANvEuMEhDy9q1CXC-zw_DaGayT8O';

// Initialize Supabase Client
export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

export type SubjectType = 'Math' | 'Reasoning' | 'GK' | 'English' | 'Computer';

export const ALL_SUBJECTS: SubjectType[] = ['Math', 'Reasoning', 'GK', 'English', 'Computer'];

export interface SubTopicItem {
  id: string;
  title: string;
  slug: string;
  description?: string;
  code: string;
  createdAt: string;
}

export interface TopicItem {
  id: string;
  created_at: string;
  subject: SubjectType;
  topic_name: string;
  subtopic_name?: string;
  link_title?: string;
  subdomain: string;
  description: string;
  code: string;
  content_type?: 'raw_html' | 'parsed_mcq';
  parsed_questions?: UniversalMCQQuestion[];
  raw_source?: string;
  subtopics: SubTopicItem[];
  is_new?: boolean;
}

// SQL Command to set up the table in Supabase
export const SUPABASE_SETUP_SQL = `-- TopicTest Hub - Setup SQL with Universal MCQ Parser
CREATE TABLE IF NOT EXISTS public.topics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  subject TEXT NOT NULL,
  topic_name TEXT NOT NULL,
  subtopic_name TEXT DEFAULT '',
  link_title TEXT DEFAULT '',
  subdomain TEXT NOT NULL UNIQUE,
  description TEXT DEFAULT '',
  code TEXT NOT NULL,
  content_type TEXT DEFAULT 'raw_html',
  parsed_questions JSONB DEFAULT '[]'::jsonb,
  raw_source TEXT DEFAULT '',
  subtopics JSONB DEFAULT '[]'::jsonb,
  is_new BOOLEAN DEFAULT true
);

-- If table already exists, add columns safely
ALTER TABLE public.topics ADD COLUMN IF NOT EXISTS content_type TEXT DEFAULT 'raw_html';
ALTER TABLE public.topics ADD COLUMN IF NOT EXISTS parsed_questions JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.topics ADD COLUMN IF NOT EXISTS raw_source TEXT DEFAULT '';

-- CRITICAL: Grant schema and table access to anon and authenticated roles
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON TABLE public.topics TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public all access" ON public.topics;
CREATE POLICY "Allow public all access"
ON public.topics FOR ALL
USING (true) WITH CHECK (true);
`;

const LOCAL_STORAGE_KEY = 'topictest_local_topics_v4';
const VISITED_TOPICS_KEY = 'topictest_visited_ids_v4';

// Initial default seeds matching the comprehensive syllabus data exactly
export const INITIAL_DEFAULT_TOPICS: TopicItem[] = [
  {
    id: 'seed-hcf-link-1',
    created_at: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    subject: 'Math',
    topic_name: '1. Number System',
    subtopic_name: 'HCF and LCM (Basic and Word Problems)',
    link_title: 'Link 1: Basic Formulas & Prime Factorization Set',
    subdomain: 'hcf-basic-formulas-set-1',
    description: 'Direct evaluation of HCF/LCM using prime factorization.',
    is_new: true,
    code: `<!DOCTYPE html><html><body style="font-family:system-ui;background:#0f172a;color:#f8fafc;padding:24px;">
    <div style="max-width:580px;margin:auto;background:#1e293b;padding:22px;border-radius:12px;">
      <h3 style="color:#38bdf8;margin-top:0;">HCF & LCM - Link 1: Basic Formulas</h3>
      <div style="background:#0f172a;padding:14px;border-radius:8px;margin-bottom:14px;">
        <strong>Q: What is the HCF of 72, 108 and 180?</strong>
      </div>
      <button style="display:block;width:100%;margin:6px 0;padding:10px;background:#334155;color:#fff;border:none;border-radius:6px;cursor:pointer;" onclick="this.style.background='#991b1b'">A) 18</button>
      <button style="display:block;width:100%;margin:6px 0;padding:10px;background:#059669;color:#fff;border:none;border-radius:6px;cursor:pointer;" onclick="this.style.background='#047857';alert('Correct! 72=2³×3², 108=2²×3³, 180=2²×3²×5. Common = 2²×3² = 36')">B) 36 (Correct! ✓)</button>
      <button style="display:block;width:100%;margin:6px 0;padding:10px;background:#334155;color:#fff;border:none;border-radius:6px;cursor:pointer;" onclick="this.style.background='#991b1b'">C) 24</button>
    </div></body></html>`,
    subtopics: []
  },
  {
    id: 'seed-hcf-link-2',
    created_at: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
    subject: 'Math',
    topic_name: '1. Number System',
    subtopic_name: 'HCF and LCM (Basic and Word Problems)',
    link_title: 'Link 2: Word Problems (Bells & Traffic Lights Interval)',
    subdomain: 'hcf-bells-interval-word-problems',
    description: 'Classic recurring interval LCM word problems.',
    is_new: true,
    code: `<!DOCTYPE html><html><body style="font-family:system-ui;background:#0f172a;color:#f8fafc;padding:24px;">
    <div style="max-width:580px;margin:auto;background:#1e293b;padding:22px;border-radius:12px;">
      <h3 style="color:#38bdf8;margin-top:0;">HCF & LCM - Link 2: Bell Intervals Word Problems</h3>
      <div style="background:#0f172a;padding:14px;border-radius:8px;margin-bottom:14px;">
        <strong>Q: 4 bells toll at intervals of 6, 8, 12 and 18 seconds respectively. In 6 minutes, how many times will they toll together?</strong>
      </div>
      <button style="display:block;width:100%;margin:6px 0;padding:10px;background:#059669;color:#fff;border:none;border-radius:6px;cursor:pointer;" onclick="this.style.background='#047857';alert('Correct! LCM = 72s. In 360 seconds (6 min): (360/72) + 1 = 6 times')">A) 6 times (LCM 72s ✓)</button>
      <button style="display:block;width:100%;margin:6px 0;padding:10px;background:#334155;color:#fff;border:none;border-radius:6px;cursor:pointer;" onclick="this.style.background='#991b1b'">B) 5 times</button>
    </div></body></html>`,
    subtopics: []
  },
  {
    id: 'seed-hcf-link-3',
    created_at: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    subject: 'Math',
    topic_name: '1. Number System',
    subtopic_name: 'HCF and LCM (Basic and Word Problems)',
    link_title: 'Link 3: Advanced Remainder Conditions Test',
    subdomain: 'hcf-remainder-conditions-test',
    description: 'Find greatest number which divides x, y, z leaving same remainder.',
    is_new: true,
    code: `<!DOCTYPE html><html><body style="font-family:system-ui;background:#0f172a;color:#f8fafc;padding:24px;">
    <div style="max-width:580px;margin:auto;background:#1e293b;padding:22px;border-radius:12px;">
      <h3 style="color:#38bdf8;margin-top:0;">HCF & LCM - Link 3: Remainder Conditions</h3>
      <div style="background:#0f172a;padding:14px;border-radius:8px;margin-bottom:14px;">
        <strong>Q: Find the greatest number that will divide 43, 91 and 183 leaving the same remainder in each case:</strong>
      </div>
      <button style="display:block;width:100%;margin:6px 0;padding:10px;background:#059669;color:#fff;border:none;border-radius:6px;cursor:pointer;" onclick="this.style.background='#047857';alert('Correct! HCF of (91-43), (183-91), (183-43) = HCF(48, 92, 140) = 4')">A) 4 (Difference HCF method ✓)</button>
      <button style="display:block;width:100%;margin:6px 0;padding:10px;background:#334155;color:#fff;border:none;border-radius:6px;cursor:pointer;" onclick="this.style.background='#991b1b'">B) 7</button>
      <button style="display:block;width:100%;margin:6px 0;padding:10px;background:#334155;color:#fff;border:none;border-radius:6px;cursor:pointer;" onclick="this.style.background='#991b1b'">C) 9</button>
    </div></body></html>`,
    subtopics: []
  },
  {
    id: 'seed-percent-link-1',
    created_at: new Date(Date.now() - 1000 * 60 * 50).toISOString(),
    subject: 'Math',
    topic_name: '3. Percentage',
    subtopic_name: 'Basic Percentage and Fraction Equivalents',
    link_title: 'Link 1: Standard Fraction Equivalents Drill',
    subdomain: 'percent-fraction-drill-1',
    description: 'Drill on 1/2 to 1/20 fraction equivalents.',
    is_new: true,
    code: `<!DOCTYPE html><html><body style="font-family:system-ui;background:#0f172a;color:#f8fafc;padding:24px;">
    <div style="max-width:580px;margin:auto;background:#1e293b;padding:22px;border-radius:12px;">
      <h3 style="color:#38bdf8;margin-top:0;">Percentage - Link 1: Fraction Equivalents</h3>
      <p>What is 1/14 expressed in percentage?</p>
      <button style="display:block;width:100%;margin:6px 0;padding:10px;background:#059669;color:#fff;border:none;border-radius:6px;cursor:pointer;" onclick="alert('Correct! 1/14 = 7.14%')">A) 7.14% ✓</button>
      <button style="display:block;width:100%;margin:6px 0;padding:10px;background:#334155;color:#fff;border:none;border-radius:6px;cursor:pointer;" onclick="this.style.background='#991b1b'">B) 6.25%</button>
    </div></body></html>`,
    subtopics: []
  },
  {
    id: 'seed-syll-link-1',
    created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    subject: 'Reasoning',
    topic_name: '8. Syllogism',
    subtopic_name: 'Statements and Conclusions (All, Some, No)',
    link_title: 'Link 1: 2-Statement Standard Deductions',
    subdomain: 'syllogism-2-statement-drill',
    description: 'Rapid deduction tests.',
    is_new: true,
    code: `<!DOCTYPE html><html><body style="font-family:system-ui;background:#090d16;color:#f1f5f9;padding:20px;">
    <div style="max-width:550px;margin:auto;background:#131d2f;padding:20px;border-radius:10px;">
      <h3 style="color:#818cf8">8. Syllogism - Link 1: 2 Statements</h3>
      <p>Statements: All cats are dogs. All dogs are birds.</p>
      <button style="display:block;width:100%;padding:10px;margin:6px 0;background:#059669;color:#fff;border:none;border-radius:6px;cursor:pointer" onclick="alert('Correct! All cats are birds follows definitely.')">Conclusion: All cats are birds (Follows ✓)</button>
    </div></body></html>`,
    subtopics: []
  }
];

export function getLocalStoredTopics(): TopicItem[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed reading localStorage topics', err);
  }
  return INITIAL_DEFAULT_TOPICS;
}

export function saveLocalStoredTopics(topics: TopicItem[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(topics));
  } catch (err) {
    console.warn('Failed writing localStorage topics', err);
  }
}

export function getVisitedTopicIds(): Set<string> {
  try {
    const raw = localStorage.getItem(VISITED_TOPICS_KEY);
    if (raw) {
      return new Set(JSON.parse(raw));
    }
  } catch {
    // ignore
  }
  return new Set();
}

export function markTopicAsVisited(id: string): void {
  try {
    const visited = getVisitedTopicIds();
    visited.add(id);
    localStorage.setItem(VISITED_TOPICS_KEY, JSON.stringify(Array.from(visited)));
  } catch {
    // ignore
  }
}

export async function fetchAllTopics(): Promise<{ topics: TopicItem[]; isFromSupabase: boolean; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('topics')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      if (data.length > 0) {
        const formatted: TopicItem[] = data.map((item: any) => ({
          id: item.id,
          created_at: item.created_at || new Date().toISOString(),
          subject: item.subject,
          topic_name: item.topic_name,
          subtopic_name: item.subtopic_name || '',
          link_title: item.link_title || item.description || '',
          subdomain: item.subdomain,
          description: item.description || '',
          code: item.code,
          content_type: item.content_type || 'raw_html',
          parsed_questions: Array.isArray(item.parsed_questions) ? item.parsed_questions : undefined,
          raw_source: item.raw_source || '',
          subtopics: Array.isArray(item.subtopics) ? item.subtopics : [],
          is_new: item.is_new ?? true
        }));
        saveLocalStoredTopics(formatted);
        return { topics: formatted, isFromSupabase: true };
      }
      return { topics: getLocalStoredTopics(), isFromSupabase: true };
    }

    if (error) {
      console.warn('[Supabase Fetch Error]:', error.message);
      return { topics: getLocalStoredTopics(), isFromSupabase: false, error: error.message };
    }
  } catch (err: any) {
    console.warn('[Supabase Fetch Catch]:', err);
    return { topics: getLocalStoredTopics(), isFromSupabase: false, error: err?.message };
  }

  return { topics: getLocalStoredTopics(), isFromSupabase: false };
}

export async function insertTopic(topic: Omit<TopicItem, 'id' | 'created_at'>): Promise<{ success: boolean; data?: TopicItem; error?: string }> {
  const newRecord: TopicItem = {
    ...topic,
    id: 'local-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    created_at: new Date().toISOString(),
    is_new: true
  };

  const localList = getLocalStoredTopics();
  const existingIdx = localList.findIndex(t => t.subdomain.toLowerCase() === topic.subdomain.toLowerCase());
  if (existingIdx >= 0) {
    localList[existingIdx] = { ...newRecord, id: localList[existingIdx].id };
  } else {
    localList.unshift(newRecord);
  }
  saveLocalStoredTopics(localList);

  try {
    const { data, error } = await supabase
      .from('topics')
      .insert([
        {
          subject: topic.subject,
          topic_name: topic.topic_name,
          subtopic_name: topic.subtopic_name || '',
          link_title: topic.link_title || '',
          subdomain: topic.subdomain,
          description: topic.description || '',
          code: topic.code,
          content_type: topic.content_type || 'raw_html',
          parsed_questions: topic.parsed_questions || [],
          raw_source: topic.raw_source || '',
          subtopics: topic.subtopics || [],
          is_new: true
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('[Supabase Insert Error]:', error.message);
      return { success: false, data: newRecord, error: error.message };
    }

    if (data) {
      const saved: TopicItem = {
        id: data.id,
        created_at: data.created_at,
        subject: data.subject,
        topic_name: data.topic_name,
        subtopic_name: data.subtopic_name || '',
        link_title: data.link_title || '',
        subdomain: data.subdomain,
        description: data.description || '',
        code: data.code,
        content_type: data.content_type || 'raw_html',
        parsed_questions: Array.isArray(data.parsed_questions) ? data.parsed_questions : undefined,
        raw_source: data.raw_source || '',
        subtopics: Array.isArray(data.subtopics) ? data.subtopics : [],
        is_new: true
      };
      const updated = localList.map(t => t.subdomain === topic.subdomain ? saved : t);
      saveLocalStoredTopics(updated);
      return { success: true, data: saved };
    }
  } catch (err: any) {
    console.error('[Supabase Insert Catch]:', err);
    return { success: false, data: newRecord, error: err?.message };
  }

  return { success: true, data: newRecord };
}

export async function deleteTopicById(id: string): Promise<boolean> {
  const localList = getLocalStoredTopics().filter(t => t.id !== id);
  saveLocalStoredTopics(localList);

  try {
    await supabase.from('topics').delete().eq('id', id);
  } catch {
    // ignore
  }
  return true;
}

export async function updateTopicById(
  id: string,
  updates: Partial<TopicItem>
): Promise<{ success: boolean; data?: TopicItem; error?: string }> {
  // Update in localStorage first
  const localList = getLocalStoredTopics();
  const idx = localList.findIndex(t => t.id === id);
  let updatedRecord: TopicItem | null = null;
  if (idx >= 0) {
    localList[idx] = { ...localList[idx], ...updates };
    updatedRecord = localList[idx];
    saveLocalStoredTopics(localList);
  }

  // Update in Supabase
  try {
    const payload: any = {};
    if (updates.subject !== undefined) payload.subject = updates.subject;
    if (updates.topic_name !== undefined) payload.topic_name = updates.topic_name;
    if (updates.subtopic_name !== undefined) payload.subtopic_name = updates.subtopic_name;
    if (updates.link_title !== undefined) payload.link_title = updates.link_title;
    if (updates.subdomain !== undefined) payload.subdomain = updates.subdomain;
    if (updates.description !== undefined) payload.description = updates.description;
    if (updates.code !== undefined) payload.code = updates.code;
    if (updates.content_type !== undefined) payload.content_type = updates.content_type;
    if (updates.parsed_questions !== undefined) payload.parsed_questions = updates.parsed_questions;
    if (updates.raw_source !== undefined) payload.raw_source = updates.raw_source;
    if (updates.subtopics !== undefined) payload.subtopics = updates.subtopics;

    const { data, error } = await supabase
      .from('topics')
      .update(payload)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) {
      console.warn('[Supabase Update Error]:', error.message);
      return { success: false, data: updatedRecord || undefined, error: error.message };
    }

    if (data) {
      const saved: TopicItem = {
        id: data.id,
        created_at: data.created_at,
        subject: data.subject,
        topic_name: data.topic_name,
        subtopic_name: data.subtopic_name || '',
        link_title: data.link_title || '',
        subdomain: data.subdomain,
        description: data.description || '',
        code: data.code,
        content_type: data.content_type || 'raw_html',
        parsed_questions: Array.isArray(data.parsed_questions) ? data.parsed_questions : undefined,
        raw_source: data.raw_source || '',
        subtopics: Array.isArray(data.subtopics) ? data.subtopics : [],
        is_new: data.is_new ?? false,
      };
      return { success: true, data: saved };
    }
  } catch (err: any) {
    console.warn('[Supabase Update Catch]:', err);
    return { success: false, data: updatedRecord || undefined, error: err?.message };
  }

  return { success: true, data: updatedRecord || undefined };
}
