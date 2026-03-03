import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/db/prisma';

const DEV_USER = {
  id: 'dev-user',
  email: 'dev@localhost',
  emailVerified: null,
  name: 'Dev User',
  image: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

export async function getAuthenticatedUser() {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  if (!process.env.DATABASE_URL) {
    return DEV_USER;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  return user;
}
