import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { TesterView } from './components/TesterView';
import { UploaderView } from './components/UploaderView';
import { RoleSelectScreen } from './components/RoleSelectScreen';
import { SqlSetupModal } from './components/SqlSetupModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import {
  SubjectType,
  ALL_SUBJECTS,
  TopicItem,
  fetchAllTopics,
  deleteTopicById,
  getVisitedTopicIds,
  markTopicAsVisited,
} from './lib/supabase';

export default function App() {
  // Mode: null (show 2 cards) | 'tester' | 'uploader'
  const [selectedRole, setSelectedRole] = useState<'tester' | 'uploader' | null>(null);
  const [uploaderTab, setUploaderTab] = useState<'form' | 'manage'>('form');

  // Currently selected subject in Top Nav
  const [selectedSubject, setSelectedSubject] = useState<SubjectType>('Math');

  // Topics state
  const [topics, setTopics] = useState<TopicItem[]>([]);
  const [isFromSupabase, setIsFromSupabase] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Visited topic IDs for tester green dot read-tracking
  const [visitedIds, setVisitedIds] = useState<Set<string>>(new Set());

  // Supabase SQL setup modal
  const [isSqlModalOpen, setIsSqlModalOpen] = useState(false);

  // Initial topic if loaded from URL share link
  const [initialTopicSubdomain, setInitialTopicSubdomain] = useState<string | null>(null);

  // Read URL parameters on mount (for direct shareable link loading)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paramMode = params.get('mode');
    const paramSubject = params.get('subject') as SubjectType | null;
    const paramTopic = params.get('topic');

    if (paramTopic) {
      setInitialTopicSubdomain(paramTopic);
      setSelectedRole('tester');
    } else if (paramMode === 'uploader') {
      setSelectedRole('uploader');
    } else if (paramMode === 'tester') {
      setSelectedRole('tester');
    } else {
      // Check if launched as standalone PWA with stored preference
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
      const storedRole = localStorage.getItem('topictest_preferred_role') as 'tester' | 'uploader' | null;
      if (isStandalone && storedRole) {
        setSelectedRole(storedRole);
      } else {
        // Default: show the 2 option cards as requested by user ("Jaise site open ho site mai 2 option dikhe do card ya tester ya uploder")
        setSelectedRole(null);
      }
    }

    if (paramSubject && ALL_SUBJECTS.includes(paramSubject)) {
      setSelectedSubject(paramSubject);
    }

    // Load visited topics from local cache
    setVisitedIds(getVisitedTopicIds());
  }, []);

  // Fetch topics from Supabase
  const loadTopics = async () => {
    setIsLoading(true);
    const res = await fetchAllTopics();
    setTopics(res.topics);
    setIsFromSupabase(res.isFromSupabase);
    setIsLoading(false);
  };

  useEffect(() => {
    loadTopics();
  }, []);

  // Effective topics where is_new is cleared if user has submitted the test (visitedIds)
  const effectiveTopics = useMemo(() => {
    return topics.map((t) => ({
      ...t,
      is_new: Boolean(t.is_new) && !visitedIds.has(t.id),
    }));
  }, [topics, visitedIds]);

  // Calculate new topics count for each of the 5 subjects for top nav green dot
  const subjectNewCounts = useMemo(() => {
    const counts: Record<SubjectType, number> = {
      Math: 0,
      Reasoning: 0,
      GK: 0,
      English: 0,
      Computer: 0,
    };
    effectiveTopics.forEach((t) => {
      if (t.is_new && counts[t.subject] !== undefined) {
        counts[t.subject] += 1;
      }
    });
    return counts;
  }, [effectiveTopics]);

  const newTopicsTotal = useMemo(() => {
    return effectiveTopics.filter((t) => t.is_new).length;
  }, [effectiveTopics]);

  // Handlers
  const handleSelectRole = (role: 'tester' | 'uploader') => {
    setSelectedRole(role);
    const newUrl = `${window.location.origin}${window.location.pathname}?mode=${role}`;
    window.history.pushState({}, '', newUrl);
  };

  const handleOpenRoleSelect = () => {
    setSelectedRole(null);
    const newUrl = `${window.location.origin}${window.location.pathname}`;
    window.history.pushState({}, '', newUrl);
  };

  const handleTopicCreated = (newTopic: TopicItem) => {
    setTopics((prev) => [newTopic, ...prev.filter((t) => t.id !== newTopic.id)]);
  };

  const handleTopicUpdated = (updatedTopic: TopicItem) => {
    setTopics((prev) => prev.map((t) => (t.id === updatedTopic.id ? updatedTopic : t)));
  };

  const handleDeleteTopic = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this topic?')) {
      await deleteTopicById(id);
      setTopics((prev) => prev.filter((t) => t.id !== id));
    }
  };

  const handleOpenTesterWithTopic = (subject: SubjectType, subdomain: string) => {
    setSelectedSubject(subject);
    setInitialTopicSubdomain(subdomain);
    setSelectedRole('tester');
    // Update URL query
    const newUrl = `${window.location.origin}${window.location.pathname}?mode=tester&subject=${encodeURIComponent(subject)}&topic=${encodeURIComponent(subdomain)}`;
    window.history.pushState({}, '', newUrl);
  };

  const handleMarkVisited = (id: string) => {
    markTopicAsVisited(id);
    setVisitedIds((prev) => new Set([...prev, id]));
  };

  const handleSubjectChange = (newSubject: SubjectType) => {
    setSelectedSubject(newSubject);
    setInitialTopicSubdomain(null);
    const newUrl = `${window.location.origin}${window.location.pathname}?mode=tester&subject=${encodeURIComponent(newSubject)}`;
    window.history.pushState({}, '', newUrl);
  };

  const handleModeChange = (newMode: 'tester' | 'uploader') => {
    setSelectedRole(newMode);
    const newUrl = `${window.location.origin}${window.location.pathname}?mode=${newMode}`;
    window.history.pushState({}, '', newUrl);
  };

  // If no role chosen yet, display the 2-Card Welcome Screen ("Jaise site open ho site mai 2 option dikhe do card ya tester ya uploder")
  if (!selectedRole) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
        <OfflineIndicator />
        <RoleSelectScreen
          onSelectRole={handleSelectRole}
          newTopicsTotal={newTopicsTotal}
          totalTopics={topics.length}
        />
        <SqlSetupModal
          isOpen={isSqlModalOpen}
          onClose={() => setIsSqlModalOpen(false)}
          isFromSupabase={isFromSupabase}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <OfflineIndicator />
      {/* FIXED TOP NAVBAR (No logo text, 5 subjects in Tester, action in Uploader, Mode switcher) */}
      <Navbar
        mode={selectedRole}
        onModeChange={handleModeChange}
        onOpenRoleSelect={handleOpenRoleSelect}
        selectedSubject={selectedSubject}
        onSelectSubject={handleSubjectChange}
        onOpenSqlModal={() => setIsSqlModalOpen(true)}
        uploaderTab={uploaderTab}
        onUploaderTabChange={setUploaderTab}
        onNewUploadClick={() => setUploaderTab('form')}
        subjectNewCounts={subjectNewCounts}
      />

      {/* MAIN VIEW */}
      <main className="flex-1">
        {selectedRole === 'tester' ? (
          <TesterView
            topics={effectiveTopics}
            selectedSubject={selectedSubject}
            onSelectSubject={handleSubjectChange}
            initialTopicSubdomain={initialTopicSubdomain}
            visitedIds={visitedIds}
            onMarkVisited={handleMarkVisited}
            onSwitchToUploader={() => handleModeChange('uploader')}
          />
        ) : (
          <UploaderView
            onTopicCreated={handleTopicCreated}
            onTopicUpdated={handleTopicUpdated}
            onOpenTesterWithTopic={handleOpenTesterWithTopic}
            allTopics={topics}
            onDeleteTopic={handleDeleteTopic}
            activeTab={uploaderTab}
            onTabChange={setUploaderTab}
          />
        )}
      </main>

      {/* Supabase SQL Migration Modal */}
      <SqlSetupModal
        isOpen={isSqlModalOpen}
        onClose={() => setIsSqlModalOpen(false)}
        isFromSupabase={isFromSupabase}
      />
    </div>
  );
}
