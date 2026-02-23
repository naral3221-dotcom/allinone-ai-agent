# All-in-One AI Super Agent Workspace - Development Guide

> **목적**: 개인용 슈퍼에이전트 워크스페이스. Genspark.ai 스타일의 올인원 AI 플랫폼을 자체 구축하여, 추후 Poemora 마케팅 SaaS와 통합 가능하도록 설계한다.

---

## 1. 프로젝트 비전

### 왜 만드는가?
- 개인 슈퍼에이전트: 리서치, 코딩, 콘텐츠 생성, 데이터 분석을 하나의 워크스페이스에서 수행
- 나만의 도구: 상용 서비스에 의존하지 않고, 내 데이터와 워크플로우에 최적화
- Poemora 통합: 마케팅 데이터 분석 에이전트로 확장 가능

### 핵심 컨셉
```
사용자 → [통합 워크스페이스 UI] → [오케스트레이터 에이전트]
                                         │
                    ┌────────────┬────────┼────────┬──────────────┐
                    ▼            ▼        ▼        ▼              ▼
              [리서치 Agent] [코드 Agent] [콘텐츠 Agent] [데이터 Agent] [커뮤니케이션 Agent]
                    │            │        │        │              │
                    ▼            ▼        ▼        ▼              ▼
              웹 검색/크롤링  코드 실행  이미지/문서  DB/분석      이메일/캘린더
```

---

## 2. 핵심 기능 목록

### Phase 1: 기반 시스템 (MVP)
| 기능 | 설명 | 우선순위 |
|------|------|----------|
| **채팅 인터페이스** | 멀티턴 대화, 마크다운 렌더링, 코드 하이라이팅 | P0 |
| **멀티 LLM 라우팅** | Claude, GPT, Gemini 등 상황에 맞는 모델 자동 선택 | P0 |
| **대화 관리** | 대화 히스토리, 검색, 폴더/태그 정리 | P0 |
| **파일 업로드/분석** | PDF, 이미지, CSV 등 파일 업로드 및 AI 분석 | P0 |
| **웹 검색 통합** | 실시간 웹 검색 결과를 AI 답변에 통합 | P1 |

### Phase 2: 에이전트 시스템
| 기능 | 설명 | 우선순위 |
|------|------|----------|
| **Deep Research** | 수백 개 소스를 분석하는 심층 리서치 에이전트 | P0 |
| **코드 에이전트** | 코드 생성, 디버깅, 리뷰 + 샌드박스 실행 | P0 |
| **데이터 분석** | CSV/DB 데이터를 분석하고 차트 생성 | P1 |
| **도구 호출 (MCP)** | Model Context Protocol 기반 외부 도구 연동 | P1 |
| **멀티 에이전트 오케스트레이션** | 복잡한 작업을 여러 에이전트가 분업 처리 | P1 |

### Phase 3: 콘텐츠 & 생산성
| 기능 | 설명 | 우선순위 |
|------|------|----------|
| **AI 문서 에디터** | Notion 스타일 + AI 보조 문서 편집기 | P1 |
| **AI 슬라이드** | 프롬프트 → 프레젠테이션 자동 생성 | P2 |
| **이미지 생성** | DALL-E, Stable Diffusion 등 이미지 생성 | P2 |
| **음성 인터페이스** | STT/TTS 기반 음성 대화 | P2 |

### Phase 4: 자동화 & 통합
| 기능 | 설명 | 우선순위 |
|------|------|----------|
| **워크플로우 자동화** | 반복 작업을 에이전트 체인으로 자동화 | P2 |
| **이메일/캘린더 연동** | AI가 이메일 분석, 일정 관리 | P2 |
| **지식 베이스 (RAG)** | 개인 문서를 벡터화하여 AI 검색 | P1 |
| **Poemora 통합 모듈** | 마케팅 데이터 분석 에이전트 | P3 |

---

## 3. 기술 스택

### 3.1 Frontend

```
Framework:      Next.js 15 (App Router)
Language:       TypeScript 5.x (strict)
Styling:        TailwindCSS 4 + shadcn/ui
State:          Zustand (경량, Poemora와 동일)
실시간:          Vercel AI SDK (스트리밍 UI)
에디터:          Tiptap (리치 텍스트) 또는 Novel
차트:           Recharts 또는 Tremor
코드 에디터:     Monaco Editor (VS Code 엔진)
마크다운:        react-markdown + rehype/remark 플러그인
```

**왜 Next.js 15?**
- Poemora와 동일 프레임워크 → 통합 시 마찰 최소화
- Server Actions + RSC로 API 레이어 단순화
- Vercel AI SDK와 네이티브 통합

### 3.2 Backend / AI Layer

```
AI 프레임워크:    Vercel AI SDK (메인 AI 라우팅)
에이전트 프레임워크: LangGraph.js (멀티에이전트 오케스트레이션)
MCP 지원:        @modelcontextprotocol/sdk (도구 연동 표준)
LLM 프로바이더:
  - Anthropic Claude (메인 추론)
  - OpenAI GPT-4o (보조/비교)
  - Google Gemini (멀티모달)
  - Groq / Together AI (빠른 추론 필요 시)
임베딩:          OpenAI text-embedding-3-small 또는 Voyage AI
벡터 DB:         Pinecone 또는 Qdrant (RAG용)
코드 실행:       E2B (클라우드 샌드박스) 또는 Judge0
웹 검색:         Tavily API 또는 Serper API
웹 크롤링:       Firecrawl 또는 Crawl4AI
```

**왜 Vercel AI SDK + LangGraph.js?**
- Vercel AI SDK: 스트리밍, 멀티 프로바이더 라우팅, UI 통합이 우수
- LangGraph.js: 복잡한 멀티에이전트 워크플로우를 상태 머신으로 관리
- 둘 다 TypeScript 네이티브 → Poemora와 언어 통일

### 3.3 Database & Storage

```
메인 DB:         PostgreSQL (Neon 또는 Supabase)
ORM:            Prisma (Poemora와 동일)
벡터 DB:         Pinecone / Qdrant / pgvector (PostgreSQL 확장)
캐시:            Upstash Redis (대화 캐시, rate limiting)
파일 스토리지:    Supabase Storage 또는 Cloudflare R2
```

**pgvector 옵션**: PostgreSQL에 벡터 검색을 확장으로 추가하면 별도 벡터 DB 없이 운영 가능. 소규모(개인용)에서는 이것으로 충분.

### 3.4 인증 & 보안

```
인증:            Clerk (Poemora와 동일 → SSO 통합 가능)
API 키 관리:     환경변수 + Vault (LLM API 키 안전 관리)
Rate Limiting:  Upstash Ratelimit
```

### 3.5 인프라 & DevOps

```
호스팅:          Vercel (Frontend + API Routes)
DB 호스팅:       Neon 또는 Supabase
CI/CD:          GitHub Actions
모니터링:        Vercel Analytics + Sentry
AI 모니터링:     Langfuse (LLM 호출 추적, 비용 모니터링)
컨테이너:        Docker (로컬 개발, 코드 샌드박스)
```

---

## 4. 아키텍처 설계

### 4.1 전체 시스템 아키텍처

```
┌─────────────────────────────────────────────────────────┐
│                    Presentation Layer                     │
│  Next.js 15 App Router + Vercel AI SDK UI Components     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │ Chat UI  │ │ Document │ │ Canvas   │ │ Settings │   │
│  │          │ │ Editor   │ │ (Slides) │ │          │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│                   API / Server Layer                      │
│  Next.js Server Actions + API Routes                     │
│  ┌──────────────────────────────────────────────────┐   │
│  │           AI Router (Vercel AI SDK)               │   │
│  │  - Model Selection (Claude/GPT/Gemini)            │   │
│  │  - Streaming Response                             │   │
│  │  - Tool Calling                                   │   │
│  └──────────────────────┬───────────────────────────┘   │
│                         │                                │
│  ┌──────────────────────▼───────────────────────────┐   │
│  │        Agent Orchestrator (LangGraph.js)          │   │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐            │   │
│  │  │Research │ │  Code   │ │  Data   │  ...more    │   │
│  │  │ Agent   │ │ Agent   │ │ Agent   │             │   │
│  │  └────┬────┘ └────┬────┘ └────┬────┘            │   │
│  │       │           │           │                   │   │
│  │  ┌────▼────┐ ┌────▼────┐ ┌────▼────┐            │   │
│  │  │ Tools   │ │ Tools   │ │ Tools   │             │   │
│  │  │(Search, │ │(E2B,    │ │(SQL,    │             │   │
│  │  │ Crawl)  │ │ GitHub) │ │ Charts) │             │   │
│  │  └─────────┘ └─────────┘ └─────────┘            │   │
│  └──────────────────────────────────────────────────┘   │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│                    Data Layer                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │PostgreSQL│ │ Vector   │ │  Redis   │ │  File    │   │
│  │ (Prisma) │ │ Store    │ │ (Cache)  │ │ Storage  │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │
└─────────────────────────────────────────────────────────┘
```

### 4.2 프로젝트 폴더 구조

```
alllinone_AI_agent/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/                   # 인증 관련 라우트
│   │   │   ├── sign-in/
│   │   │   └── sign-up/
│   │   ├── (workspace)/              # 메인 워크스페이스
│   │   │   ├── chat/                 # 채팅 인터페이스
│   │   │   │   └── [conversationId]/
│   │   │   ├── research/             # Deep Research
│   │   │   ├── documents/            # AI 문서 에디터
│   │   │   ├── canvas/               # 슬라이드/시각 작업
│   │   │   ├── knowledge/            # 지식 베이스 관리
│   │   │   └── settings/             # 설정
│   │   ├── api/
│   │   │   ├── chat/                 # AI 채팅 API
│   │   │   ├── agents/               # 에이전트 실행
│   │   │   ├── tools/                # 도구 실행
│   │   │   ├── files/                # 파일 업로드/처리
│   │   │   └── webhooks/             # 외부 웹훅
│   │   ├── layout.tsx
│   │   └── page.tsx
│   │
│   ├── agents/                       # 에이전트 정의
│   │   ├── orchestrator/             # 메인 오케스트레이터
│   │   │   ├── orchestrator.agent.ts
│   │   │   ├── router.ts             # 의도 분류 & 에이전트 라우팅
│   │   │   └── state.ts              # 에이전트 상태 관리
│   │   ├── research/                 # 리서치 에이전트
│   │   │   ├── research.agent.ts
│   │   │   ├── tools/
│   │   │   │   ├── webSearch.tool.ts
│   │   │   │   ├── webCrawl.tool.ts
│   │   │   │   └── summarize.tool.ts
│   │   │   └── prompts.ts
│   │   ├── code/                     # 코드 에이전트
│   │   │   ├── code.agent.ts
│   │   │   ├── tools/
│   │   │   │   ├── execute.tool.ts   # E2B 샌드박스 실행
│   │   │   │   ├── github.tool.ts
│   │   │   │   └── lint.tool.ts
│   │   │   └── prompts.ts
│   │   ├── data/                     # 데이터 분석 에이전트
│   │   │   ├── data.agent.ts
│   │   │   ├── tools/
│   │   │   │   ├── sql.tool.ts
│   │   │   │   ├── chart.tool.ts
│   │   │   │   └── csv.tool.ts
│   │   │   └── prompts.ts
│   │   ├── content/                  # 콘텐츠 생성 에이전트
│   │   │   ├── content.agent.ts
│   │   │   ├── tools/
│   │   │   │   ├── image.tool.ts
│   │   │   │   ├── slides.tool.ts
│   │   │   │   └── document.tool.ts
│   │   │   └── prompts.ts
│   │   └── _shared/                  # 에이전트 공용 유틸
│   │       ├── base.agent.ts         # 에이전트 베이스 클래스
│   │       ├── memory.ts             # 대화 메모리 관리
│   │       └── types.ts              # 공용 타입
│   │
│   ├── lib/                          # 공용 라이브러리
│   │   ├── ai/
│   │   │   ├── providers.ts          # LLM 프로바이더 설정
│   │   │   ├── router.ts             # 모델 라우팅 로직
│   │   │   └── streaming.ts          # 스트리밍 유틸
│   │   ├── mcp/
│   │   │   ├── client.ts             # MCP 클라이언트
│   │   │   └── servers/              # MCP 서버 설정
│   │   ├── rag/
│   │   │   ├── embeddings.ts         # 임베딩 생성
│   │   │   ├── vectorStore.ts        # 벡터 스토어 연동
│   │   │   └── retriever.ts          # 검색 + 리랭킹
│   │   ├── db/
│   │   │   └── prisma.ts             # Prisma 클라이언트
│   │   └── utils/
│   │       ├── tokenCounter.ts       # 토큰 카운팅
│   │       └── rateLimiter.ts        # Rate limiting
│   │
│   ├── components/                   # UI 컴포넌트
│   │   ├── chat/
│   │   │   ├── ChatWindow.tsx
│   │   │   ├── MessageBubble.tsx
│   │   │   ├── InputArea.tsx
│   │   │   ├── ToolCallDisplay.tsx   # 에이전트 도구 실행 표시
│   │   │   └── StreamingText.tsx
│   │   ├── sidebar/
│   │   │   ├── ConversationList.tsx
│   │   │   ├── NavigationMenu.tsx
│   │   │   └── SearchBar.tsx
│   │   ├── editor/
│   │   │   ├── DocumentEditor.tsx
│   │   │   └── CodeEditor.tsx
│   │   ├── data/
│   │   │   ├── ChartRenderer.tsx
│   │   │   └── DataTable.tsx
│   │   └── ui/                       # shadcn/ui 컴포넌트
│   │
│   ├── hooks/                        # Custom React Hooks
│   │   ├── useChat.ts                # AI 채팅 훅
│   │   ├── useAgent.ts               # 에이전트 상태 훅
│   │   ├── useFileUpload.ts
│   │   └── useConversation.ts
│   │
│   └── types/                        # 전역 타입
│       ├── agent.types.ts
│       ├── chat.types.ts
│       ├── tool.types.ts
│       └── index.ts
│
├── prisma/
│   ├── schema.prisma                 # DB 스키마
│   ├── migrations/
│   └── seed.ts
│
├── tests/
│   ├── unit/
│   │   ├── agents/
│   │   └── lib/
│   ├── integration/
│   │   ├── api/
│   │   └── agents/
│   └── e2e/
│       └── chat.spec.ts
│
├── public/
├── .env.example
├── .env.local
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── vitest.config.ts
├── package.json
└── CLAUDE.md                         # 이 프로젝트의 AI 가이드
```

### 4.3 데이터 모델 (Prisma Schema 초안)

```prisma
// 사용자 (Clerk 연동)
model User {
  id            String         @id @default(cuid())
  clerkId       String         @unique
  email         String         @unique
  name          String?
  conversations Conversation[]
  documents     Document[]
  knowledgeBases KnowledgeBase[]
  settings      UserSettings?
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
}

// 대화
model Conversation {
  id        String    @id @default(cuid())
  userId    String
  user      User      @relation(fields: [userId], references: [id])
  title     String?
  messages  Message[]
  tags      String[]
  pinned    Boolean   @default(false)
  archived  Boolean   @default(false)
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  @@index([userId, updatedAt])
}

// 메시지
model Message {
  id             String       @id @default(cuid())
  conversationId String
  conversation   Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  role           MessageRole  // user, assistant, system, tool
  content        String
  model          String?      // 사용된 LLM 모델
  toolCalls      Json?        // 도구 호출 기록
  toolResults    Json?        // 도구 실행 결과
  metadata       Json?        // 토큰 수, 비용 등
  createdAt      DateTime     @default(now())

  @@index([conversationId, createdAt])
}

enum MessageRole {
  user
  assistant
  system
  tool
}

// 문서
model Document {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  title     String
  content   Json     // Tiptap JSON 포맷
  type      String   // note, research, slides
  tags      String[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([userId])
}

// 지식 베이스
model KnowledgeBase {
  id          String              @id @default(cuid())
  userId      String
  user        User                @relation(fields: [userId], references: [id])
  name        String
  description String?
  entries     KnowledgeEntry[]
  createdAt   DateTime            @default(now())
  updatedAt   DateTime            @updatedAt
}

// 지식 베이스 항목 (RAG용)
model KnowledgeEntry {
  id              String        @id @default(cuid())
  knowledgeBaseId String
  knowledgeBase   KnowledgeBase @relation(fields: [knowledgeBaseId], references: [id], onDelete: Cascade)
  title           String
  content         String
  sourceType      String        // file, url, text
  sourceUrl       String?
  embedding       Unsupported("vector(1536)")?  // pgvector
  metadata        Json?
  createdAt       DateTime      @default(now())

  @@index([knowledgeBaseId])
}

// 사용자 설정
model UserSettings {
  id              String  @id @default(cuid())
  userId          String  @unique
  user            User    @relation(fields: [userId], references: [id])
  defaultModel    String  @default("claude-sonnet-4-6")
  theme           String  @default("system")
  apiKeys         Json?   // 암호화된 사용자 API 키
  mcpServers      Json?   // 커스텀 MCP 서버 설정
  agentPreferences Json?  // 에이전트별 설정
}

// AI 사용량 추적
model UsageLog {
  id        String   @id @default(cuid())
  userId    String
  model     String
  inputTokens  Int
  outputTokens Int
  cost      Float
  agentType String?
  createdAt DateTime @default(now())

  @@index([userId, createdAt])
}
```

---

## 5. 에이전트 설계 상세

### 5.1 오케스트레이터 패턴

```typescript
// 의사 코드 - 오케스트레이터 흐름
async function handleUserMessage(message: string, context: ConversationContext) {
  // 1. 의도 분류
  const intent = await classifyIntent(message);
  // → "research" | "code" | "data_analysis" | "content" | "general_chat"

  // 2. 복잡도 판단
  const complexity = await assessComplexity(message, intent);
  // → "simple" (단일 에이전트) | "complex" (멀티 에이전트)

  // 3. 에이전트 라우팅
  if (complexity === "simple") {
    return await routeToAgent(intent, message, context);
  } else {
    // 태스크 분해 → 병렬/순차 에이전트 실행
    const plan = await decomposeTasks(message, context);
    return await executeAgentPipeline(plan);
  }
}
```

### 5.2 에이전트별 도구 매핑

| 에이전트 | 도구 | 외부 서비스 |
|---------|------|------------|
| **Research** | webSearch, webCrawl, summarize, factCheck | Tavily, Firecrawl |
| **Code** | executeCode, readFile, writeFile, gitOps | E2B, GitHub API |
| **Data** | querySQL, generateChart, analyzeCSV, pythonExec | E2B (Python), DB |
| **Content** | generateImage, createSlides, editDocument | DALL-E, Tiptap |
| **Communication** | sendEmail, managecalendar, notify | Gmail API, Google Calendar |

### 5.3 메모리 시스템

```
단기 메모리 (Short-term):
  - 현재 대화 컨텍스트 (최근 N개 메시지)
  - Redis에 캐시, TTL 기반 자동 만료

장기 메모리 (Long-term):
  - 사용자 선호도, 반복 패턴
  - PostgreSQL에 구조화 저장

지식 메모리 (Knowledge):
  - 사용자 업로드 문서, 웹 스크랩
  - 벡터 DB에 임베딩 저장 (RAG)
```

---

## 6. 개발 로드맵

### Phase 1: MVP 채팅 (2-3주)
```
Week 1:
  - [ ] Next.js 15 프로젝트 초기화
  - [ ] Prisma + PostgreSQL 스키마 설정
  - [ ] Clerk 인증 연동
  - [ ] 기본 채팅 UI (사이드바 + 채팅 윈도우)

Week 2:
  - [ ] Vercel AI SDK로 멀티 LLM 연동 (Claude, GPT)
  - [ ] 스트리밍 응답 UI
  - [ ] 대화 CRUD (생성, 목록, 삭제)
  - [ ] 파일 업로드 (이미지, PDF)

Week 3:
  - [ ] 모델 선택 UI (드롭다운)
  - [ ] 마크다운 렌더링 + 코드 하이라이팅
  - [ ] 대화 검색
  - [ ] 기본 설정 페이지
```

### Phase 2: 에이전트 시스템 (3-4주)
```
Week 4-5:
  - [ ] LangGraph.js 오케스트레이터 구축
  - [ ] 리서치 에이전트 (웹 검색 + 요약)
  - [ ] 코드 에이전트 (E2B 샌드박스 실행)
  - [ ] 도구 호출 UI (실행 과정 시각화)

Week 6-7:
  - [ ] 데이터 분석 에이전트 (CSV → 차트)
  - [ ] MCP 클라이언트 통합
  - [ ] 멀티 에이전트 파이프라인 (복합 작업)
  - [ ] 에이전트 실행 상태 실시간 표시
```

### Phase 3: 지식 & 콘텐츠 (3-4주)
```
Week 8-9:
  - [ ] RAG 파이프라인 구축 (임베딩 → 검색)
  - [ ] 지식 베이스 관리 UI
  - [ ] 문서 업로드 → 자동 인덱싱
  - [ ] 대화 시 지식 베이스 참조

Week 10-11:
  - [ ] AI 문서 에디터 (Tiptap 기반)
  - [ ] 이미지 생성 연동
  - [ ] AI 슬라이드 기초
```

### Phase 4: 자동화 & Poemora 통합 (4주+)
```
Week 12+:
  - [ ] 워크플로우 빌더 (에이전트 체인)
  - [ ] 스케줄링 (크론 기반 자동 실행)
  - [ ] Poemora 연동 모듈 (마케팅 데이터 에이전트)
  - [ ] 이메일/캘린더 자동화
```

---

## 7. 핵심 의존성 패키지

```json
{
  "dependencies": {
    // Framework
    "next": "^15.x",
    "react": "^19.x",
    "typescript": "^5.x",

    // AI Core
    "ai": "^4.x",                          // Vercel AI SDK
    "@ai-sdk/anthropic": "latest",          // Claude 프로바이더
    "@ai-sdk/openai": "latest",             // OpenAI 프로바이더
    "@ai-sdk/google": "latest",             // Gemini 프로바이더
    "@langchain/langgraph": "latest",       // 에이전트 오케스트레이션

    // MCP
    "@modelcontextprotocol/sdk": "latest",

    // Database
    "@prisma/client": "^6.x",
    "@upstash/redis": "latest",             // 캐시

    // RAG
    "@pinecone-database/pinecone": "latest", // 또는 pgvector

    // Auth
    "@clerk/nextjs": "latest",

    // UI
    "tailwindcss": "^4.x",
    "@radix-ui/react-*": "latest",          // shadcn 의존성
    "lucide-react": "latest",               // 아이콘
    "react-markdown": "latest",
    "rehype-highlight": "latest",
    "@tiptap/react": "latest",              // 문서 에디터
    "@monaco-editor/react": "latest",       // 코드 에디터
    "recharts": "latest",                   // 차트

    // Utils
    "zod": "latest",                        // 스키마 검증
    "zustand": "latest",                    // 상태 관리
    "date-fns": "latest"
  },
  "devDependencies": {
    "vitest": "latest",
    "@playwright/test": "latest",
    "msw": "latest",                        // API 모킹
    "prisma": "^6.x",
    "eslint": "latest",
    "prettier": "latest"
  }
}
```

---

## 8. 환경 변수

```env
# ===== Database =====
DATABASE_URL="postgresql://..."

# ===== Auth (Clerk) =====
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# ===== LLM Providers =====
ANTHROPIC_API_KEY=              # Claude
OPENAI_API_KEY=                 # GPT + DALL-E + Embeddings
GOOGLE_GENERATIVE_AI_API_KEY=   # Gemini
GROQ_API_KEY=                   # 빠른 추론 (선택)

# ===== Tools & Services =====
TAVILY_API_KEY=                 # 웹 검색
E2B_API_KEY=                    # 코드 샌드박스
FIRECRAWL_API_KEY=              # 웹 크롤링

# ===== Vector DB =====
PINECONE_API_KEY=               # Pinecone (또는 pgvector 사용 시 불필요)
PINECONE_INDEX=

# ===== Cache =====
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# ===== File Storage =====
SUPABASE_URL=
SUPABASE_ANON_KEY=

# ===== Monitoring =====
LANGFUSE_SECRET_KEY=            # AI 사용량 모니터링
LANGFUSE_PUBLIC_KEY=
SENTRY_DSN=
```

---

## 9. Poemora 통합 전략

### 단계별 통합 계획

```
Step 1: 공유 인증 (Clerk SSO)
  - 동일 Clerk 앱 사용 또는 Organization 기능으로 연결
  - 한 번 로그인으로 양쪽 접근

Step 2: API 연동
  - Poemora에 마케팅 데이터 API 노출
  - AI Agent에서 Poemora API를 MCP Tool로 등록
  - "지난주 META 광고 성과 분석해줘" → Poemora 데이터 조회 → AI 분석

Step 3: UI 통합 (선택)
  - Poemora 대시보드에 AI 채팅 위젯 임베드
  - 또는 AI 워크스페이스에서 Poemora 대시보드 iframe 로드

Step 4: 모노레포 통합 (최종, 선택)
  - pnpm workspace 또는 Turborepo로 모노레포 전환
  - 공유 패키지: UI 컴포넌트, 타입, 유틸리티
```

### 통합 시 공유되는 기술
| 항목 | Poemora | AI Agent | 공유 가능 |
|------|---------|----------|----------|
| Framework | Next.js 14 | Next.js 15 | 마이그레이션 후 통일 |
| Auth | Clerk | Clerk | SSO로 즉시 연결 |
| DB | PostgreSQL + Prisma | PostgreSQL + Prisma | 스키마 참조 |
| UI | shadcn/ui + Tailwind | shadcn/ui + Tailwind | 컴포넌트 공유 |
| State | Zustand | Zustand | 패턴 공유 |
| Testing | Vitest | Vitest | 설정 공유 |

---

## 10. 개발 원칙

### 반드시 지킬 것
1. **TDD 우선**: 에이전트 로직도 테스트 먼저 작성
2. **스트리밍 기본**: 모든 AI 응답은 스트리밍으로 처리
3. **비용 추적**: 모든 LLM 호출의 토큰 수와 비용 기록 (Langfuse)
4. **에러 graceful 처리**: LLM 실패 시 폴백 모델 자동 전환
5. **보안 최우선**: API 키 노출 금지, 코드 실행은 반드시 샌드박스
6. **타입 안전**: strict TypeScript, Zod로 런타임 검증

### 하지 말 것
1. LLM API 키를 클라이언트에 노출하지 않는다
2. 사용자 입력을 검증 없이 코드 실행하지 않는다
3. 무한 에이전트 루프를 허용하지 않는다 (max iterations 설정)
4. 단일 LLM에 종속되지 않는다 (프로바이더 추상화 필수)

---

## 참고 자료

- [Vercel AI SDK Docs](https://sdk.vercel.ai/docs)
- [LangGraph.js Docs](https://langchain-ai.github.io/langgraphjs/)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [E2B Code Sandbox](https://e2b.dev/docs)
- [Tavily Search API](https://docs.tavily.com/)
- [Firecrawl](https://docs.firecrawl.dev/)
- [Tiptap Editor](https://tiptap.dev/)
- [Genspark AI](https://www.genspark.ai/) - 레퍼런스
- [Genspark AI Review - Lindy](https://www.lindy.ai/blog/genspark-ai-features)
- [Agentic Workflow Architectures 2026](https://www.stack-ai.com/blog/the-2026-guide-to-agentic-workflow-architectures)
- [AI Agent Architecture - Redis](https://redis.io/blog/ai-agent-architecture/)
