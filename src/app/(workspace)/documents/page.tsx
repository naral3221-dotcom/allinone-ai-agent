'use client';

import { useState } from 'react';
import { useDocuments } from '@/hooks/useDocuments';
import { DocumentList } from '@/components/documents/document-list';
import { CreateDialog } from '@/components/documents/create-dialog';

export default function DocumentsPage() {
  const { documents, isLoading, error, createDocument, deleteDocument } =
    useDocuments();
  const [showCreate, setShowCreate] = useState(false);

  if (isLoading)
    return (
      <div
        className="flex items-center justify-center h-full"
        data-testid="docs-loading"
      >
        <span className="text-zinc-400">불러오는 중...</span>
      </div>
    );
  if (error)
    return (
      <div
        className="flex items-center justify-center h-full"
        data-testid="docs-error"
      >
        <span className="text-red-500">오류: {error}</span>
      </div>
    );

  const handleCreate = async (input: { title: string; type: string }) => {
    const doc = await createDocument(input);
    if (doc) {
      setShowCreate(false);
      window.location.href = `/documents/${doc.id}`;
    }
  };

  return (
    <div className="mx-auto max-w-4xl p-8">
      <h1 className="mb-6 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
        문서
      </h1>
      {showCreate && (
        <div className="mb-6">
          <CreateDialog
            onSubmit={handleCreate}
            onCancel={() => setShowCreate(false)}
          />
        </div>
      )}
      <DocumentList
        documents={documents}
        onSelect={(id) => {
          window.location.href = `/documents/${id}`;
        }}
        onDelete={deleteDocument}
        onCreate={() => setShowCreate(true)}
      />
    </div>
  );
}
