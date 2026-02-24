import { auth } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function Home() {
  const session = await auth();

  if (session) {
    redirect('/chat');
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950">
      <main className="flex flex-col items-center gap-8 text-center px-4">
        <h1 className="text-5xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          AI Workspace
        </h1>
        <p className="max-w-lg text-lg text-zinc-600 dark:text-zinc-400">
          All-in-one AI super agent workspace. Research, code, write documents,
          analyze data, and manage marketing — all powered by AI.
        </p>
        <div className="flex gap-4">
          <Link
            href="/sign-in"
            className="inline-flex h-11 items-center justify-center rounded-md bg-zinc-900 px-8 text-sm font-medium text-zinc-50 shadow transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
            data-testid="sign-in-link"
          >
            Sign In
          </Link>
          <Link
            href="/sign-up"
            className="inline-flex h-11 items-center justify-center rounded-md border border-zinc-200 bg-white px-8 text-sm font-medium shadow-sm transition-colors hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-800"
            data-testid="sign-up-link"
          >
            Sign Up
          </Link>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-3 max-w-2xl">
          {[
            { title: 'AI Agents', desc: '6 specialized agents for research, code, content, data, and marketing' },
            { title: 'Knowledge Base', desc: 'RAG-powered knowledge with vector search and document ingestion' },
            { title: 'Workflows', desc: 'Automated multi-step workflows with sequential agent execution' },
          ].map((feature) => (
            <div key={feature.title} className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">{feature.title}</h3>
              <p className="mt-1 text-sm text-zinc-500">{feature.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
