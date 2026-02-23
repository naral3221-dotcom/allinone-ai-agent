import { currentUser } from '@clerk/nextjs/server';
import { conversationService } from '@/lib/db';

export async function getAuthenticatedUser() {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    return null;
  }

  const user = await conversationService.ensureUser(
    clerkUser.id,
    clerkUser.emailAddresses[0]?.emailAddress ?? '',
    clerkUser.firstName ?? undefined
  );

  return user;
}
