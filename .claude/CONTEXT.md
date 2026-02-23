# Current Context (실시간 업데이트)

> **이 파일은 세션이 끊겼을 때 컨텍스트를 복원하기 위해 사용됩니다.**

---

## Last Updated
- **날짜**: 2026-02-23
- **작업 상태**: Sprint 0 - Project Setup 완료
- **현재 작업**: Sprint 1 준비 중

---

## Current Sprint
**Sprint 0: Project Setup** — ✅ 완료

### 완료 항목
1. ✅ **Next.js 16 프로젝트 초기화** — App Router, TypeScript strict mode
2. ✅ **Clean Architecture 폴더 구조 생성** — agents/, lib/, components/, hooks/, types/
3. ✅ **Prisma + PostgreSQL + pgvector 설정** — 스키마 정의 완료 (6 모델)
4. ✅ **Clerk 인증 설정** — 미들웨어, sign-in/up 페이지, 라우트 보호
5. ✅ **Vitest + 테스트 환경 구성** — 13 파일 55 테스트 통과
6. ✅ **Vercel AI SDK 기본 설정** — 멀티 프로바이더, 모델 라우터
7. ✅ **Upstash Redis 캐시 레이어** — cache, rate-limit 유틸리티
8. ✅ **shadcn/ui + 레이아웃 쉘** — Sidebar, Header, Button
9. ✅ **기본 채팅 프로토타입** — API route, ChatPanel, MessageList, ChatInput, ModelSelector
10. ✅ **CI/CD 파이프라인** — GitHub Actions (lint, type-check, test, build)

---

## State
```
Sprint 0 완료 → Sprint 1 진입 가능
- 13 test files, 55 tests 모두 통과
- 기본 채팅 UI 프로토타입 동작
- Clerk 인증 설정 완료 (env 키 필요)
- CI/CD 워크플로우 작성 완료
```

---

## Key Files
```
src/middleware.ts                              — Clerk 라우트 보호
src/app/layout.tsx                             — ClerkProvider 래핑
src/app/(workspace)/layout.tsx                 — Sidebar + Header 레이아웃
src/app/api/chat/route.ts                      — 스트리밍 채팅 API
src/lib/ai/providers.ts                        — LLM 프로바이더 (Anthropic/OpenAI/Google)
src/lib/ai/models.ts                           — 모델 레지스트리 + 메타데이터
src/lib/ai/router.ts                           — 복잡도 기반 모델 라우팅
src/lib/cache/cache.ts                         — Redis 캐시 유틸리티
src/lib/cache/rate-limit.ts                    — 레이트 리미터
src/components/chat/chat-panel.tsx             — 채팅 패널 (useChat 연동)
src/components/layout/sidebar.tsx              — 네비게이션 사이드바
prisma/schema.prisma                           — DB 스키마 (6 모델 + pgvector)
.github/workflows/ci.yml                       — CI 파이프라인
```

---

## Important Decisions Made
```
1. UI는 Sprint 0에서 최소한의 레이아웃 쉘만 구현, 세부 UI는 Sprint 1에서
2. 모델 라우팅은 복잡도 기반 (simple→fast, moderate→balanced, complex→powerful)
3. 캐시 레이어는 Upstash Redis + sliding window rate limiter
4. Clerk 인증은 미들웨어 기반 라우트 보호 (/, /sign-in, /sign-up, /api/webhooks 공개)
```

---

## Active Blockers
```
없음
```

---

## Session Handoff Notes
1. `CLAUDE.md` — 프로젝트 규칙
2. `.claude/CONTEXT.md` — 현재 상태 (이 파일)
3. `.claude/ROADMAP.md` — 로드맵
4. `.claude/logs/2026-02-23.md` — 오늘 작업 로그
