import { ChatPanel } from '@/components/chat/chat-panel';

export default async function ChatPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const { conversationId } = await params;

  return <ChatPanel conversationId={conversationId} />;
}
