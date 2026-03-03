'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleCredentialSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError('로그인에 실패했습니다. 인증 정보를 확인해주세요.');
    } else {
      window.location.href = '/chat';
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
      <div className="w-full max-w-sm space-y-6 rounded-lg border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">로그인</h1>
          <p className="mt-1 text-sm text-zinc-500">AI 워크스페이스</p>
        </div>

        <div className="space-y-3">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => signIn('github', { callbackUrl: '/chat' })}
            data-testid="github-signin"
          >
            GitHub로 계속하기
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => signIn('google', { callbackUrl: '/chat' })}
            data-testid="google-signin"
          >
            Google로 계속하기
          </Button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-200 dark:border-zinc-700" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white px-2 text-zinc-400 dark:bg-zinc-900">또는</span>
          </div>
        </div>

        <form onSubmit={handleCredentialSignIn} className="space-y-3">
          <input
            type="email"
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full h-9 rounded-md border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-800 dark:bg-zinc-950"
            data-testid="email-input"
          />
          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full h-9 rounded-md border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-800 dark:bg-zinc-950"
            data-testid="password-input"
          />
          {error && <p className="text-sm text-red-500" data-testid="signin-error">{error}</p>}
          <Button type="submit" className="w-full" data-testid="credential-signin">
            이메일로 로그인
          </Button>
        </form>

        <p className="text-center text-sm text-zinc-500">
          계정이 없으신가요?{' '}
          <Link href="/sign-up" className="font-medium text-zinc-900 dark:text-zinc-100">
            회원가입
          </Link>
        </p>
      </div>
    </div>
  );
}
