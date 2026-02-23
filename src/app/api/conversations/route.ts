import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/get-user';
import { conversationService } from '@/lib/db';

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const conversations = await conversationService.listConversations(user.id);
  return NextResponse.json(conversations);
}

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const conversation = await conversationService.createConversation(
    user.id,
    body.title
  );

  return NextResponse.json(conversation, { status: 201 });
}
