'use client';

import { Button } from '@/components/ui/button';
import { DocumentCard } from './document-card';

interface DocumentItem {
  id: string;
  title: string;
  type: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

interface DocumentListProps {
  documents: DocumentItem[];
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onCreate: () => void;
}

export function DocumentList({
  documents,
  onSelect,
  onDelete,
  onCreate,
}: DocumentListProps) {
  return (
    <div data-testid="document-list">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Documents
        </h2>
        <Button onClick={onCreate} data-testid="create-doc-button">
          New Document
        </Button>
      </div>
      {documents.length === 0 ? (
        <p data-testid="doc-empty" className="text-zinc-400 text-sm">
          No documents yet.
        </p>
      ) : (
        <div className="space-y-2">
          {documents.map((doc) => (
            <DocumentCard
              key={doc.id}
              document={doc}
              onSelect={onSelect}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
