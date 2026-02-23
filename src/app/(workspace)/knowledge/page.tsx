'use client';
import { useState } from 'react';
import { useKnowledge } from '@/hooks/useKnowledge';
import { KbList } from '@/components/knowledge/kb-list';
import { KbCreateDialog } from '@/components/knowledge/kb-create-dialog';

export default function KnowledgePage() {
  const { knowledgeBases, isLoading, error, createKB, deleteKB } = useKnowledge();
  const [showCreate, setShowCreate] = useState(false);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center" data-testid="kb-loading">
        <span className="text-zinc-400">Loading...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center" data-testid="kb-error">
        <span className="text-red-500">Error: {error}</span>
      </div>
    );
  }

  const handleSelect = (id: string) => {
    window.location.href = `/knowledge/${id}`;
  };

  const handleCreate = async (name: string, description?: string) => {
    const kb = await createKB(name, description);
    if (kb) {
      setShowCreate(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl p-8">
      <h1 className="mb-6 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
        Knowledge Base
      </h1>
      {showCreate && (
        <div className="mb-6">
          <KbCreateDialog onSubmit={handleCreate} onCancel={() => setShowCreate(false)} />
        </div>
      )}
      <KbList
        knowledgeBases={knowledgeBases}
        onSelect={handleSelect}
        onDelete={deleteKB}
        onCreate={() => setShowCreate(true)}
      />
    </div>
  );
}
