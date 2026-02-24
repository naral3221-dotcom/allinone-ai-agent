import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/db/prisma';

export async function getAuthenticatedUser() {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  return user;
}
