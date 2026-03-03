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
          AI 워크스페이스
        </h1>
        <p className="max-w-lg text-lg text-zinc-600 dark:text-zinc-400">
          올인원 AI 슈퍼 에이전트 워크스페이스. 리서치, 코딩, 문서 작성,
          데이터 분석, 마케팅 관리까지 — AI가 모두 지원합니다.
        </p>
        <div className="flex gap-4">
          <Link
            href="/sign-in"
            className="inline-flex h-11 items-center justify-center rounded-md bg-zinc-900 px-8 text-sm font-medium text-zinc-50 shadow transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
            data-testid="sign-in-link"
          >
            로그인
          </Link>
          <Link
            href="/sign-up"
            className="inline-flex h-11 items-center justify-center rounded-md border border-zinc-200 bg-white px-8 text-sm font-medium shadow-sm transition-colors hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-800"
            data-testid="sign-up-link"
          >
            회원가입
          </Link>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-3 max-w-2xl">
          {[
            { title: 'AI 에이전트', desc: '리서치, 코드, 콘텐츠, 데이터, 마케팅 전문 에이전트 6종' },
            { title: '지식 베이스', desc: 'RAG 기반 벡터 검색과 문서 임베딩으로 지식을 관리' },
            { title: '워크플로우', desc: '멀티 에이전트 순차 실행으로 복합 작업을 자동화' },
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
