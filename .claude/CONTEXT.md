# Current Context (실시간 업데이트)

> **이 파일은 세션이 끊겼을 때 컨텍스트를 복원하기 위해 사용됩니다.**

---

## Last Updated
- **날짜**: 2026-02-23
- **작업 상태**: Sprint 3 - Knowledge & RAG 완료
- **현재 작업**: Sprint 4 준비 중

---

## Completed Sprints

### Sprint 0: Project Setup — ✅ 완료
Next.js 16, Clerk 인증, Vercel AI SDK, Redis 캐시, shadcn/ui, CI/CD

### Sprint 1: MVP Chat Interface — ✅ 완료
Prisma DB, ConversationService, LLM 인터페이스 분리, 대화 CRUD API, 채팅 UI

### Sprint 2: Agent System — ✅ 완료
LangGraph 오케스트레이터, Research/Code Agent, MCP Tool Registry, Agent API, UI

### Sprint 3: Knowledge & RAG — ✅ 완료
1. ✅ 임베딩 서비스 (OpenAI text-embedding-3-small, 배치 지원)
2. ✅ 텍스트 청킹 (재귀 분할: 단락→문장→단어→문자)
3. ✅ 벡터 스토어 (pgvector upsert, 코사인 유사도 검색)
4. ✅ KnowledgeBaseService (CRUD + 인제스트 파이프라인)
5. ✅ RAG 파이프라인 (retrieve → generate)
6. ✅ Knowledge Base API (6개 엔드포인트)
7. ✅ 채팅 RAG 통합 (knowledgeBaseId로 컨텍스트 검색)

---

## State
```
Sprint 3 완료 → Sprint 4 진입 가능
- 39 test files, 266 tests 모두 통과
- RAG 파이프라인: 임베딩 → 청킹 → 벡터 저장 → 유사도 검색 → LLM 생성
- Knowledge Base CRUD + 채팅 통합 완료
```

---

## Key Files (Sprint 3 추가)
```
src/lib/rag/embedding.ts                      — 임베딩 서비스
src/lib/rag/chunker.ts                        — 텍스트 청킹 유틸리티
src/lib/rag/vector-store.ts                   — pgvector 벡터 스토어
src/lib/rag/pipeline.ts                       — RAG 파이프라인
src/lib/db/knowledge.service.ts               — 지식 베이스 서비스
src/app/api/knowledge/route.ts                — KB 생성/목록 API
src/app/api/knowledge/[id]/route.ts           — KB 상세/삭제 API
src/app/api/knowledge/[id]/entries/route.ts   — 엔트리 추가 API
src/app/api/knowledge/[id]/search/route.ts    — RAG 검색 API
```

---

## Important Decisions Made
```
1. UI는 인프라/도메인 완성 후 마지막에 구현
2. 모델 라우팅: 복잡도 기반 (simple→haiku, moderate→sonnet, complex→opus)
3. LangGraph.js: Vercel AI SDK의 generateText를 노드 내에서 사용
4. Research Agent: SearchProvider 인터페이스 DI
5. MCP: HTTP 기반 도구 디스커버리 + 호출
6. RAG: text-embedding-3-small (1536차원), 재귀 청킹 (1000/200), pgvector 코사인 유사도
7. 채팅 RAG: knowledgeBaseId 파라미터로 선택적 컨텍스트 주입
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
