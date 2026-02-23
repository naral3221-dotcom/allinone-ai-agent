# Implementation Roadmap

> **마지막 수정**: 2026-02-23
> **현재 단계**: Sprint 5 완료 — 전체 MVP 완성

---

## Overall Timeline

```
Sprint 0: Project Setup ─────────────────────── ✅ DONE
Sprint 1: MVP Chat Interface ────────────────── ✅ DONE
Sprint 2: Agent System ──────────────────────── ✅ DONE
Sprint 3: Knowledge & RAG ──────────────────── ✅ DONE
Sprint 4: Content & Automation ─────────────── ✅ DONE
Sprint 5: Poemora Integration ─────────────── ✅ DONE
```

---

## Sprint 0: Project Setup ✅ DONE

### 목표
프로젝트 기반 환경 구축 — Next.js, Clean Architecture, DB, Auth, 테스트, CI/CD

### Tasks

| # | Task | Status | Agent | Commit |
|---|------|--------|-------|--------|
| 0.1 | Next.js 16 프로젝트 초기화 (App Router, TS strict) | ✅ Done | implementer | 92bc678 |
| 0.2 | Clean Architecture 폴더 구조 생성 | ✅ Done | architect | 92bc678 |
| 0.3 | Prisma + PostgreSQL 설정 (pgvector 포함) | ✅ Done | db-designer | 92bc678 |
| 0.4 | Clerk 인증 설정 (로그인/회원가입) | ✅ Done | implementer | |
| 0.5 | Vitest + 기본 테스트 환경 구성 | ✅ Done | test-writer | |
| 0.6 | CI/CD 파이프라인 (GitHub Actions) | ✅ Done | implementer | |
| 0.7 | Vercel AI SDK 멀티 프로바이더 설정 | ✅ Done | ai-integrator | |
| 0.8 | Upstash Redis 캐시 레이어 | ✅ Done | implementer | |
| 0.9 | shadcn/ui + 레이아웃 쉘 | ✅ Done | implementer | |
| 0.10 | 기본 채팅 프로토타입 | ✅ Done | implementer | |

---

## Sprint 1: MVP Chat Interface ✅ DONE

### 목표
기본 채팅 인터페이스 — 멀티 LLM 라우팅, 스트리밍 응답, 대화 CRUD

### Tasks

| # | Task | Status | Agent | Commit |
|---|------|--------|-------|--------|
| 1.1 | Prisma 클라이언트 싱글톤 | ✅ Done | implementer | 70c94db |
| 1.2 | ConversationService CRUD | ✅ Done | implementer | 70c94db |
| 1.3 | LLM 인터페이스 + VercelAI 어댑터 | ✅ Done | architect | 70c94db |
| 1.4 | 대화 CRUD API | ✅ Done | implementer | 70c94db |
| 1.5 | SendMessage 유스케이스 | ✅ Done | implementer | 70c94db |
| 1.6 | Auth 헬퍼 (Clerk → DB 동기화) | ✅ Done | implementer | 70c94db |
| 1.7 | ConversationList + MarkdownMessage UI | ✅ Done | implementer | 70c94db |

---

## Sprint 2: Agent System ✅ DONE

### 목표
LangGraph 기반 AI 에이전트 — 오케스트레이터, 리서치, 코드 에이전트, MCP, Tool Call UI

### Tasks

| # | Task | Status | Agent | Commit |
|---|------|--------|-------|--------|
| 2.1 | Agent 도메인 엔티티 + 타입 | ✅ Done | architect | f2d9e53 |
| 2.2 | LangGraph 오케스트레이터 | ✅ Done | implementer | f2d9e53 |
| 2.3 | Research Agent (Tavily 웹 검색) | ✅ Done | implementer | f2d9e53 |
| 2.4 | Code Agent (분류 + 실행) | ✅ Done | implementer | f2d9e53 |
| 2.5 | MCP Tool Registry | ✅ Done | ai-integrator | f2d9e53 |
| 2.6 | AgentRunService + API | ✅ Done | implementer | f2d9e53 |
| 2.7 | AgentStepCard + ToolCallCard UI | ✅ Done | implementer | f2d9e53 |

---

## Sprint 3: Knowledge & RAG ✅ DONE

### 목표
RAG 파이프라인 — 임베딩, 벡터 스토어, 지식 베이스, 채팅 RAG 통합

### Tasks

| # | Task | Status | Agent | Commit |
|---|------|--------|-------|--------|
| 3.1 | EmbeddingService (text-embedding-3-small) | ✅ Done | ai-integrator | 5464ab2 |
| 3.2 | 텍스트 청킹 (재귀 분할기) | ✅ Done | implementer | 5464ab2 |
| 3.3 | VectorStore (pgvector 코사인 유사도) | ✅ Done | db-designer | 5464ab2 |
| 3.4 | KnowledgeBaseService (CRUD + 인제스트) | ✅ Done | implementer | 5464ab2 |
| 3.5 | RAG Pipeline (retrieve → generate) | ✅ Done | ai-integrator | 5464ab2 |
| 3.6 | Knowledge Base API (6 endpoints) | ✅ Done | implementer | 5464ab2 |
| 3.7 | 채팅 RAG 통합 (knowledgeBaseId) | ✅ Done | implementer | 5464ab2 |

---

## Sprint 4: Content & Automation ✅ DONE

### 목표
AI 콘텐츠 도구 — Content/Data Agent, 프롬프트 템플릿, 워크플로우 엔진, AI 문서 에디터

### Tasks

| # | Task | Status | Agent | Commit |
|---|------|--------|-------|--------|
| 4.1 | Content Agent (document/email/report/summary/blog) | ✅ Done | ai-integrator | 4f49f21 |
| 4.2 | Data Agent (summarize/statistics/visualize/transform/compare) | ✅ Done | ai-integrator | 4f49f21 |
| 4.3 | 프롬프트 템플릿 관리 (CRUD + {{var}} 치환) | ✅ Done | implementer | 4f49f21 |
| 4.4 | 워크플로우 엔진 (순차 실행 + 컨텍스트 전달) | ✅ Done | architect+implementer | 4f49f21 |
| 4.5 | AI 문서 에디터 (CRUD + AI Assist 6 액션) | ✅ Done | implementer | 4f49f21 |

---

## Sprint 5: Poemora Integration ✅ DONE

### 목표
Poemora 마케팅 데이터 연동 — API 브릿지, 마케팅 에이전트, 대시보드, 인사이트 생성

### Tasks

| # | Task | Status | Agent | Commit |
|---|------|--------|-------|--------|
| 5.1 | Poemora API 브릿지 (PlatformProvider + Client) | ✅ Done | implementer | eac964f |
| 5.2 | Marketing Agent (LangGraph, 5 분석 타입) | ✅ Done | ai-integrator | eac964f |
| 5.3 | Dashboard Service (summary, comparison, top) | ✅ Done | implementer | eac964f |
| 5.4 | Marketing Insight Generator (AI 분석 → 추천) | ✅ Done | ai-integrator | eac964f |
| 5.5 | Marketing API (campaigns, dashboard, metrics, insights) | ✅ Done | implementer | eac964f |

---

## Changelog

### 2026-02-23 (프로젝트 시작)
- Sprint 0: Project Setup 완료
- Sprint 1: MVP Chat Interface 완료 (70c94db)
- Sprint 2: Agent System 완료 (f2d9e53)
- Sprint 3: Knowledge & RAG 완료 (5464ab2)
- Sprint 4: Content & Automation 완료 (4f49f21)
- Sprint 5: Poemora Integration 완료 (eac964f)
- **전체 63 test files, 452 tests 통과**
