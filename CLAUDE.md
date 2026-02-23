# All-in-One AI Super Agent Workspace - Project Guidelines

## Project Overview
AI 슈퍼 에이전트 워크스페이스 개발 프로젝트 (Genspark.ai 스타일)
- **목표**: 개인용 올인원 AI 에이전트 워크스페이스 (리서치, 코딩, 문서작성, 데이터분석)
- **기술 스택**: Next.js 16, TypeScript, React 19, Vercel AI SDK, LangGraph.js, MCP, PostgreSQL, Prisma, pgvector
- **아키텍처**: Clean Architecture (AI Agent 특화) + TDD

---

## Work Principles

### 1. Orchestrator Pattern
- **Main Agent (Opus)**: 오케스트레이터 역할, 직접 코딩 최소화
- **Sub-Agents**: 실제 구현 담당, 각 도메인별 전문화
- 모든 작업은 Task 분해 -> Sub-Agent 위임 -> 결과 검증 순서

### 2. TDD (Test-Driven Development)
```
1. RED: 실패하는 테스트 먼저 작성
2. GREEN: 테스트를 통과하는 최소 코드 작성
3. REFACTOR: 코드 개선 (테스트는 계속 통과)
```
- 테스트 없는 코드는 머지 불가
- 커버리지 목표: 80% 이상
- 테스트 파일: `*.test.ts` 또는 `*.spec.ts`

### 3. AI Agent Architecture
- **에이전트 시스템은 제품 기능**: 워크스페이스의 AI 에이전트들은 `src/agents/`에 정의
- **개발 워크플로우 에이전트와 구분**: `.claude/` 하위의 개발용 Sub-Agent와 제품 내 AI 에이전트는 별개
- **LLM 라우팅**: 작업 복잡도에 따라 Claude/GPT/Gemini 자동 선택
- **MCP 프로토콜**: 외부 도구 연동은 MCP 표준 준수

---

## Architecture Layers

### 프로젝트 폴더 구조
```
src/
├── app/                    # Next.js App Router (Presentation Layer)
│   ├── (auth)/             # 인증 라우트 (로그인, 회원가입)
│   ├── (workspace)/        # 메인 워크스페이스
│   │   ├── chat/           # 채팅 인터페이스 (AI 대화)
│   │   ├── research/       # 딥 리서치 (멀티스텝 탐색)
│   │   ├── documents/      # AI 문서 에디터
│   │   ├── canvas/         # 슬라이드/비주얼 캔버스
│   │   ├── knowledge/      # 지식 베이스 (RAG)
│   │   └── settings/       # 설정 (API 키, 프로필)
│   └── api/                # API 라우트 (서버 액션, 스트리밍)
│
├── agents/                 # AI 에이전트 정의 (핵심 비즈니스 로직)
│   ├── orchestrator/       # 메인 오케스트레이터 (작업 분배, 라우팅)
│   ├── research/           # 리서치 에이전트 (웹 검색, 요약, 분석)
│   ├── code/               # 코드 에이전트 (코드 생성, 리뷰, 디버깅)
│   ├── data/               # 데이터 분석 에이전트 (차트, 통계, 시각화)
│   ├── content/            # 콘텐츠 생성 에이전트 (문서, 슬라이드, 이메일)
│   └── _shared/            # 공유 에이전트 유틸리티 (메모리, 도구, 프롬프트)
│
├── lib/                    # 공유 라이브러리 (Infrastructure Layer)
│   ├── ai/                 # LLM 프로바이더, 모델 라우팅, 스트리밍
│   ├── mcp/                # MCP 클라이언트/서버 연동
│   ├── rag/                # 임베딩, 벡터 스토어 (pgvector)
│   ├── db/                 # Prisma 클라이언트, DB 유틸리티
│   ├── cache/              # Upstash Redis 캐시 레이어
│   └── utils/              # 공통 유틸리티
│
├── components/             # UI 컴포넌트 (Presentation Layer)
│   ├── ui/                 # shadcn/ui 기반 공통 컴포넌트
│   ├── chat/               # 채팅 관련 컴포넌트
│   ├── editor/             # 문서 에디터 컴포넌트
│   ├── canvas/             # 캔버스 컴포넌트
│   └── layout/             # 레이아웃 컴포넌트
│
├── hooks/                  # Custom React Hooks
│   ├── useChat.ts          # AI 채팅 훅
│   ├── useAgent.ts         # 에이전트 상태 관리 훅
│   ├── useStream.ts        # 스트리밍 응답 훅
│   └── useKnowledge.ts     # 지식 베이스 훅
│
└── types/                  # 글로벌 타입 정의
    ├── agent.ts            # 에이전트 관련 타입
    ├── chat.ts             # 채팅/메시지 타입
    ├── knowledge.ts        # 지식 베이스 타입
    └── index.ts            # barrel exports
```

### 의존성 규칙
```
agents/ (핵심 비즈니스 로직)
  ↑
lib/ (인프라스트럭처)
  ↑
app/ + components/ + hooks/ (프레젠테이션)
```
- `agents/`는 `lib/`의 인터페이스만 사용 (구현체 직접 참조 금지)
- `components/`는 `agents/`를 직접 호출하지 않음 (hooks/ 또는 api/ 경유)
- `lib/`는 외부 서비스 연동을 캡슐화 (LLM, DB, MCP, Redis)

---

## Sub-Agent Definitions

> 아래는 **개발 워크플로우용 Sub-Agent** 정의입니다 (`.claude/agents/` 하위).
> 제품 내 AI 에이전트(`src/agents/`)와는 별개입니다.

### Agent: architect
**역할**: 아키텍처 설계 및 검토
**사용 시점**: 새로운 기능 설계, 구조 변경, 에이전트 파이프라인 설계 시
**프롬프트 템플릿**:
```
You are the Architecture Agent for All-in-One AI Super Agent Workspace.
Follow Clean Architecture principles adapted for AI agent systems.
Consider: Agent orchestration patterns, LLM routing, streaming data flow, MCP tool integration.
Task: [TASK_DESCRIPTION]
Output: Design document with folder structure, interfaces, data flow, and agent interaction diagrams.
```

### Agent: test-writer
**역할**: 테스트 코드 작성 (TDD의 RED 단계)
**사용 시점**: 새로운 기능 구현 전
**프롬프트 템플릿**:
```
You are the Test Writer Agent. Write failing tests FIRST.
Follow TDD principles. Use Vitest for unit tests, Playwright for E2E.
For AI agent tests: mock LLM responses, test agent state transitions, verify tool calls.
Task: [FEATURE_DESCRIPTION]
Output: Test files that define expected behavior (should fail initially).
```

### Agent: implementer
**역할**: 테스트를 통과하는 코드 구현 (TDD의 GREEN 단계)
**사용 시점**: 테스트 작성 후
**프롬프트 템플릿**:
```
You are the Implementer Agent. Write minimal code to pass tests.
Do NOT over-engineer. Follow existing patterns in codebase.
For AI features: use Vercel AI SDK for streaming, LangGraph.js for agent graphs.
Task: [IMPLEMENTATION_TASK]
Tests to pass: [TEST_FILE_PATHS]
Output: Implementation code that passes all specified tests.
```

### Agent: refactorer
**역할**: 코드 리팩토링 (TDD의 REFACTOR 단계)
**사용 시점**: 테스트 통과 후
**프롬프트 템플릿**:
```
You are the Refactorer Agent. Improve code quality while keeping tests green.
Focus: Remove duplication, improve naming, apply SOLID principles.
For AI code: optimize prompt templates, reduce token usage, improve streaming performance.
Task: [REFACTOR_TARGET]
Output: Refactored code with all tests still passing.
```

### Agent: reviewer
**역할**: 코드 리뷰 및 품질 검증
**사용 시점**: 구현 완료 후
**프롬프트 템플릿**:
```
You are the Code Reviewer Agent. Review for:
1. Architecture layer violations (agents/ vs lib/ vs app/)
2. Test coverage gaps (especially agent behavior tests)
3. Security vulnerabilities (API key exposure, prompt injection)
4. Performance issues (streaming bottlenecks, unnecessary LLM calls)
5. TypeScript best practices (strict mode compliance)
6. AI-specific: prompt quality, token efficiency, error handling for LLM failures
Task: Review [FILE_PATHS]
Output: Review comments with severity (critical/warning/suggestion).
```

### Agent: ai-integrator
**역할**: LLM 프로바이더, MCP 서버, RAG 파이프라인 연동
**사용 시점**: 새로운 AI 모델 추가, MCP 도구 연동, 벡터 스토어 구성 시
**프롬프트 템플릿**:
```
You are the AI Integration Agent for the Super Agent Workspace.
Implement LLM provider connections, MCP client/server setups, and RAG pipelines.
Always use lib/ layer for infrastructure. Define interfaces in agents/_shared/.
Use Vercel AI SDK for model abstraction, LangGraph.js for agent orchestration.
Task: [AI_INTEGRATION_TASK]
Output: Interface in agents/_shared/, Implementation in lib/ai/ or lib/mcp/ or lib/rag/.
```

### Agent: db-designer
**역할**: 데이터베이스 스키마 설계 및 마이그레이션
**사용 시점**: 스키마 변경 시
**프롬프트 템플릿**:
```
You are the Database Designer Agent. Design PostgreSQL schemas with Prisma.
Consider: User workspaces, conversation history, knowledge base (pgvector embeddings),
agent session state, document storage, user preferences.
Use pgvector extension for embedding columns. Design efficient indexes for similarity search.
Task: [SCHEMA_TASK]
Output: Prisma schema changes + migration strategy + pgvector index recommendations.
```

---

## Work Flow (Standard Process)

### Feature Development Flow
```
1. [Orchestrator] 요구사항 분석 및 Task 분해
2. [architect] 아키텍처 설계 문서 작성 (에이전트 파이프라인 포함)
3. [db-designer] 필요시 스키마 설계 (pgvector 포함)
4. [ai-integrator] 필요시 LLM/MCP 연동 설계
5. [test-writer] 실패하는 테스트 작성 (RED)
6. [implementer] 테스트 통과 코드 작성 (GREEN)
7. [refactorer] 코드 개선 (REFACTOR)
8. [reviewer] 최종 리뷰
9. [Orchestrator] 통합 및 검증
```

### Bug Fix Flow
```
1. [Orchestrator] 버그 분석 (LLM 응답 오류, 스트리밍 중단 등 포함)
2. [test-writer] 버그 재현 테스트 작성
3. [implementer] 버그 수정
4. [reviewer] 리뷰
```

### AI Agent Development Flow
```
1. [Orchestrator] 에이전트 요구사항 정의 (입력/출력/도구/모델)
2. [architect] LangGraph 상태 머신 설계
3. [test-writer] 에이전트 행동 테스트 작성 (모킹된 LLM 응답)
4. [ai-integrator] LLM 프로바이더 + MCP 도구 연동
5. [implementer] 에이전트 그래프 구현
6. [refactorer] 프롬프트 최적화, 토큰 효율 개선
7. [reviewer] 에이전트 품질 리뷰 (환각, 보안, 성능)
8. [Orchestrator] 통합 테스트 및 검증
```

---

## Work Log Rules (필수)

**모든 작업 완료 시 반드시 로그 기록**

### 로그 위치
```
.claude/logs/
├── YYYY-MM-DD.md         # 일별 작업 로그 (기본)
├── features/             # 기능별 상세 이력
│   └── feature-name.md
└── TEMPLATE.md           # 로그 템플릿
```

### 기록 시점
1. **작업 시작**: 요청 사항, 계획 기록
2. **각 단계 완료**: 에이전트별 수행 내용, 변경 파일
3. **작업 종료**: 최종 결과, 다음 작업

### 로그 형식 (간소화)
```markdown
## [HH:MM] 작업명

### 요청
> 사용자 요청 내용

### 수행 내역
| 단계 | 에이전트 | 결과 |
|------|---------|------|
| 설계 | architect | 완료 |
| 테스트 | test-writer | 3개 작성 |
| AI 연동 | ai-integrator | Claude + MCP 연동 |
| 구현 | implementer | 완료 |

### 변경 파일
- `src/agents/research/graph.ts` (생성)
- `src/lib/ai/providers.ts` (수정)
- `src/agents/research/graph.test.ts` (생성)

### 다음 작업
- [ ] 후속 작업 내용
```

### 오케스트레이터 의무
- **작업 시작 전**: 오늘 날짜 로그 파일 확인/생성
- **작업 완료 후**: 즉시 로그 기록 (지연 금지)
- **긴 작업**: 중간 진행 상황도 기록

---

## Tech Stack Details

### Core
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5.x (strict mode)
- **UI Library**: React 19
- **Runtime**: Node.js 22 LTS

### AI / Agent
- **AI SDK**: Vercel AI SDK (모델 추상화, 스트리밍, 도구 호출)
- **Agent Framework**: LangGraph.js (상태 머신 기반 에이전트 그래프)
- **Tool Protocol**: MCP SDK (Model Context Protocol)
- **LLM Providers**: Claude (Anthropic), GPT (OpenAI), Gemini (Google)

### Frontend
- **Styling**: TailwindCSS 4 + shadcn/ui
- **Charts**: Recharts
- **State**: Zustand (필요시)
- **Forms**: React Hook Form + Zod
- **Editor**: TipTap 또는 Plate (리치 텍스트)

### Backend
- **ORM**: Prisma
- **Database**: PostgreSQL 16+ with pgvector extension
- **Auth**: Clerk
- **Cache**: Upstash Redis (세션, 레이트리밋, 에이전트 상태 캐시)
- **Background Jobs**: Inngest (장시간 에이전트 작업)

### Testing
- **Unit/Integration**: Vitest
- **E2E**: Playwright
- **API Mocking**: MSW (Mock Service Worker)
- **AI Mocking**: Vercel AI SDK mock helpers + 커스텀 LLM 목 유틸리티

### DevOps
- **Hosting**: Vercel
- **Database**: Neon 또는 Supabase (pgvector 지원)
- **CI/CD**: GitHub Actions
- **Monitoring**: Vercel Analytics + Langfuse (LLM observability)

---

## File Naming Conventions

```
# Components
ComponentName.tsx        # PascalCase
ComponentName.test.tsx   # 테스트 파일

# Hooks
useHookName.ts          # camelCase with 'use' prefix

# Agents
graph.ts                # 에이전트 그래프 정의
nodes.ts                # 그래프 노드 함수들
tools.ts                # 에이전트 도구 정의
prompts.ts              # 프롬프트 템플릿
state.ts                # 에이전트 상태 타입
graph.test.ts           # 에이전트 테스트

# Lib/Utils
providerName.ts         # camelCase
providerName.test.ts

# Types
types.ts                # 타입 정의
index.ts                # barrel exports

# MCP
serverName.server.ts    # MCP 서버 정의
clientName.client.ts    # MCP 클라이언트 정의
```

---

## Prohibited Patterns

1. **any 타입 사용 금지** - unknown 또는 proper type 사용
2. **console.log 커밋 금지** - proper logging 사용 (pino 또는 구조화된 로거)
3. **테스트 없는 비즈니스 로직 금지** - 에이전트 로직 포함
4. **agents/ 에서 lib/ 구현체 직접 import 금지** - 인터페이스만 사용
5. **하드코딩된 설정값 금지** - 환경변수 사용
6. **eslint-disable 남용 금지**
7. **LLM API 키 하드코딩 절대 금지** - 반드시 환경변수 경유
8. **프롬프트 인젝션 미방어 금지** - 사용자 입력은 반드시 sanitize
9. **무제한 토큰 사용 금지** - maxTokens 항상 설정, 비용 제어 로직 필수
10. **동기 LLM 호출 금지** - 모든 LLM 호출은 스트리밍 또는 비동기 처리

---

## Commit Convention

```
feat: 새로운 기능 추가
fix: 버그 수정
refactor: 리팩토링
test: 테스트 추가/수정
docs: 문서 수정
chore: 빌드, 설정 변경
agent: 에이전트 관련 변경 (새 에이전트, 프롬프트 수정, 도구 추가)
```

예시:
- `feat(chat): add streaming chat interface with model selector`
- `agent(research): implement multi-step web research graph`
- `fix(rag): correct embedding dimension mismatch for pgvector`

---

## Environment Variables

```env
# Database
DATABASE_URL=
DIRECT_URL=

# Clerk Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# LLM Providers
ANTHROPIC_API_KEY=
OPENAI_API_KEY=
GOOGLE_GENERATIVE_AI_API_KEY=

# Upstash Redis
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# MCP
MCP_SERVER_URL=

# Embedding
EMBEDDING_MODEL=text-embedding-3-small
EMBEDDING_DIMENSION=1536

# LLM Observability (optional)
LANGFUSE_PUBLIC_KEY=
LANGFUSE_SECRET_KEY=
LANGFUSE_HOST=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Current Sprint Status

### Sprint 0: Project Setup
- [ ] Next.js 16 프로젝트 초기화 (React 19, TypeScript strict)
- [ ] 프로젝트 폴더 구조 생성 (agents/, lib/, components/, hooks/, types/)
- [ ] Prisma + PostgreSQL + pgvector 설정
- [ ] Clerk 인증 설정 (워크스페이스 라우트 보호)
- [ ] Vercel AI SDK 기본 설정 (멀티 프로바이더)
- [ ] Upstash Redis 캐시 레이어 설정
- [ ] 기본 테스트 환경 구성 (Vitest + MSW)
- [ ] CI/CD 파이프라인 (GitHub Actions)
- [ ] shadcn/ui 초기화 + 기본 레이아웃
- [ ] 기본 채팅 인터페이스 프로토타입 (스트리밍)

---

## References

- [Clean Architecture by Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel AI SDK Documentation](https://sdk.vercel.ai/docs)
- [LangGraph.js Documentation](https://langchain-ai.github.io/langgraphjs/)
- [Model Context Protocol (MCP)](https://modelcontextprotocol.io/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [pgvector Documentation](https://github.com/pgvector/pgvector)
- [Clerk Documentation](https://clerk.com/docs)
- [Upstash Redis Documentation](https://upstash.com/docs/redis/overall/getstarted)
- [shadcn/ui Documentation](https://ui.shadcn.com)
