# Current Context (실시간 업데이트)

> **이 파일은 세션이 끊겼을 때 컨텍스트를 복원하기 위해 사용됩니다.**

---

## Last Updated
- **날짜**: 2026-02-23
- **작업 상태**: Sprint 2 - Agent System 완료
- **현재 작업**: Sprint 3 준비 중

---

## Completed Sprints

### Sprint 0: Project Setup — ✅ 완료
Next.js 16, Clerk 인증, Vercel AI SDK, Redis 캐시, shadcn/ui, CI/CD

### Sprint 1: MVP Chat Interface — ✅ 완료
Prisma DB, ConversationService, LLM 인터페이스 분리, 대화 CRUD API, 채팅 UI

### Sprint 2: Agent System — ✅ 완료
1. ✅ Agent 도메인 엔티티 + DB 스키마 (AgentRun 모델)
2. ✅ LangGraph 오케스트레이터 (route → execute 파이프라인)
3. ✅ Research Agent (analyze → search → synthesize)
4. ✅ Code Agent (classify → execute)
5. ✅ MCP Tool Registry (MCPClient + MCPToolRegistry)
6. ✅ AgentRunService (CRUD + 히스토리 + 페이지네이션)
7. ✅ Agent 실행 API (POST/GET /api/agent/run, GET /api/agent/run/[id])
8. ✅ Tool Call UI 컴포넌트 (AgentStepCard, ToolCallCard)

---

## State
```
Sprint 2 완료 → Sprint 3 진입 가능
- 30 test files, 176 tests 모두 통과
- Agent 시스템: 오케스트레이터 + Research + Code Agent
- MCP 프로토콜 기반 도구 연동 구조
- Agent 실행 API + 히스토리 저장
```

---

## Key Files (Sprint 2 추가)
```
src/agents/_shared/agent.types.ts            — Agent 도메인 타입
src/agents/orchestrator/{state,nodes,graph}.ts — 오케스트레이터 (LangGraph)
src/agents/research/{state,tools,nodes,graph}.ts — 리서치 에이전트
src/agents/code/{state,nodes,graph}.ts        — 코드 에이전트
src/lib/mcp/{types,client,index}.ts           — MCP 클라이언트/레지스트리
src/lib/db/agent-run.service.ts               — AgentRun DB 서비스
src/app/api/agent/run/route.ts                — Agent 실행 API (POST+GET)
src/app/api/agent/run/[id]/route.ts           — Agent 상세 조회 API
src/components/chat/agent-step-card.tsx        — 에이전트 스텝 시각화
src/components/chat/tool-call-card.tsx         — 도구 호출 시각화
```

---

## Important Decisions Made
```
1. UI는 인프라/도메인 완성 후 마지막에 구현 (인프라 우선)
2. 모델 라우팅: 복잡도 기반 (simple→haiku, moderate→sonnet, complex→opus)
3. LangGraph.js: Vercel AI SDK의 generateText를 노드 내에서 사용
4. Research Agent: SearchProvider 인터페이스 DI (테스트 가능, 교체 가능)
5. Agent 실행: POST /api/agent/run → createRun → invoke orchestrator → completeRun/failRun
6. MCP: HTTP 기반 도구 디스커버리 + 호출 (MCPClient + MCPToolRegistry)
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
