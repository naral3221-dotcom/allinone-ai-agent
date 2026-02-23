# Implementation Roadmap

> **마지막 수정**: 2026-02-23
> **현재 단계**: Sprint 0 - Project Setup

---

## Overall Timeline

```
Sprint 0: Project Setup ─────────────────────── <-- CURRENT
Sprint 1: MVP Chat Interface ────────────────── Next
Sprint 2: Agent System ──────────────────────── Planned
Sprint 3: Knowledge & RAG ──────────────────── Planned
Sprint 4: Content & Automation ─────────────── Planned
Sprint 5: Poemora Integration ──────────────── Planned
```

---

## Sprint 0: Project Setup <-- CURRENT

### 목표
프로젝트 기반 환경 구축 — Next.js, Clean Architecture, DB, Auth, 테스트, CI/CD

### Tasks

| # | Task | Status | Agent | Commit |
|---|------|--------|-------|--------|
| 0.1 | Next.js 15 프로젝트 초기화 (App Router, TS strict) | ⬜ Todo | implementer | |
| 0.2 | Clean Architecture 폴더 구조 생성 | ⬜ Todo | architect | |
| 0.3 | Prisma + PostgreSQL 설정 (pgvector 포함) | ⬜ Todo | db-designer | |
| 0.4 | Clerk 인증 설정 (로그인/회원가입) | ⬜ Todo | implementer | |
| 0.5 | Vitest + 기본 테스트 환경 구성 | ⬜ Todo | test-writer | |
| 0.6 | CI/CD 파이프라인 (GitHub Actions) | ⬜ Todo | implementer | |

### Deliverables
- [ ] Next.js 앱 실행 가능
- [ ] Clean Architecture 4개 레이어 폴더
- [ ] Prisma 스키마 + 마이그레이션
- [ ] Clerk 인증 동작
- [ ] Vitest 설정 + 샘플 테스트
- [ ] GitHub Actions CI 워크플로우

---

## Sprint 1: MVP Chat Interface

### 목표
기본 채팅 인터페이스 — 멀티 LLM 라우팅, 스트리밍 응답, 대화 CRUD

### Tasks

| # | Task | Status | Agent | Commit |
|---|------|--------|-------|--------|
| 1.1 | Conversation/Message 도메인 엔티티 | ⬜ Todo | architect | |
| 1.2 | LLM Provider 인터페이스 (domain layer) | ⬜ Todo | architect | |
| 1.3 | Anthropic/OpenAI/Google Provider 구현 | ⬜ Todo | ai-integrator | |
| 1.4 | SendMessage 유스케이스 | ⬜ Todo | implementer | |
| 1.5 | 스트리밍 응답 처리 (Vercel AI SDK) | ⬜ Todo | ai-integrator | |
| 1.6 | Chat UI 컴포넌트 (채팅 버블, 입력창) | ⬜ Todo | implementer | |
| 1.7 | 대화 목록/생성/삭제 CRUD | ⬜ Todo | implementer | |
| 1.8 | LLM 모델 선택 UI | ⬜ Todo | implementer | |

### Deliverables
- [ ] 멀티 LLM 채팅 가능 (Claude, GPT, Gemini)
- [ ] 실시간 스트리밍 응답
- [ ] 대화 저장/불러오기/삭제
- [ ] 모델 선택 드롭다운

---

## Sprint 2: Agent System

### 목표
LangGraph 기반 AI 에이전트 — 오케스트레이터, 리서치 에이전트, 코드 에이전트, 도구 호출 UI

### Tasks

| # | Task | Status | Agent | Commit |
|---|------|--------|-------|--------|
| 2.1 | Agent 도메인 엔티티 (Agent, Tool, AgentRun) | ⬜ Todo | architect | |
| 2.2 | LangGraph 오케스트레이터 설정 | ⬜ Todo | ai-integrator | |
| 2.3 | Research Agent 구현 (웹 검색, 요약) | ⬜ Todo | ai-integrator | |
| 2.4 | Code Agent 구현 (코드 생성, 리뷰) | ⬜ Todo | ai-integrator | |
| 2.5 | MCP Tool 연동 (파일, 웹 등) | ⬜ Todo | ai-integrator | |
| 2.6 | Tool Call UI (실행 과정 시각화) | ⬜ Todo | implementer | |
| 2.7 | Agent 실행 히스토리 저장 | ⬜ Todo | implementer | |

### Deliverables
- [ ] LangGraph 오케스트레이터 동작
- [ ] Research Agent (웹 검색 + 요약)
- [ ] Code Agent (코드 생성 + 리뷰)
- [ ] MCP Tool 연동
- [ ] Tool Call 실행 과정 UI

---

## Sprint 3: Knowledge & RAG

### 목표
RAG 파이프라인 — 지식 베이스 UI, 문서 업로드, 벡터 검색

### Tasks

| # | Task | Status | Agent | Commit |
|---|------|--------|-------|--------|
| 3.1 | Knowledge Base 도메인 엔티티 | ⬜ Todo | architect | |
| 3.2 | 문서 업로드 + 파싱 (PDF, MD, TXT) | ⬜ Todo | implementer | |
| 3.3 | 텍스트 청킹 + 임베딩 생성 | ⬜ Todo | ai-integrator | |
| 3.4 | pgvector 벡터 검색 구현 | ⬜ Todo | db-designer | |
| 3.5 | RAG 파이프라인 (검색 → 컨텍스트 → 생성) | ⬜ Todo | ai-integrator | |
| 3.6 | Knowledge Base 관리 UI | ⬜ Todo | implementer | |
| 3.7 | 대화에서 지식 베이스 참조 기능 | ⬜ Todo | implementer | |

### Deliverables
- [ ] 문서 업로드 + 자동 인덱싱
- [ ] 벡터 유사도 검색
- [ ] RAG 기반 답변 생성
- [ ] Knowledge Base CRUD UI

---

## Sprint 4: Content & Automation

### 목표
AI 콘텐츠 도구 — AI 문서 에디터, 이미지 생성, 워크플로우 빌더

### Tasks

| # | Task | Status | Agent | Commit |
|---|------|--------|-------|--------|
| 4.1 | AI 문서 에디터 (Tiptap + AI 어시스턴트) | ⬜ Todo | implementer | |
| 4.2 | 이미지 생성 연동 (DALL-E, Stable Diffusion) | ⬜ Todo | ai-integrator | |
| 4.3 | 프롬프트 템플릿 관리 | ⬜ Todo | implementer | |
| 4.4 | 워크플로우 빌더 (노드 기반 자동화) | ⬜ Todo | architect | |
| 4.5 | 워크플로우 실행 엔진 | ⬜ Todo | ai-integrator | |
| 4.6 | 스케줄러 (Inngest 기반 자동 실행) | ⬜ Todo | implementer | |

### Deliverables
- [ ] AI 문서 에디터
- [ ] 이미지 생성 UI
- [ ] 워크플로우 빌더 + 실행
- [ ] 자동화 스케줄링

---

## Sprint 5: Poemora Integration

### 목표
Poemora 마케팅 데이터 연동 — 마케팅 데이터 에이전트, API 브릿지

### Tasks

| # | Task | Status | Agent | Commit |
|---|------|--------|-------|--------|
| 5.1 | Poemora API 브릿지 인터페이스 | ⬜ Todo | architect | |
| 5.2 | 마케팅 데이터 에이전트 (광고 분석, 보고서) | ⬜ Todo | ai-integrator | |
| 5.3 | 대시보드 위젯 통합 | ⬜ Todo | implementer | |
| 5.4 | 마케팅 인사이트 자동 생성 | ⬜ Todo | ai-integrator | |
| 5.5 | 크로스 플랫폼 데이터 통합 뷰 | ⬜ Todo | implementer | |

### Deliverables
- [ ] Poemora API 연동
- [ ] 마케팅 데이터 에이전트
- [ ] 통합 대시보드 위젯
- [ ] 자동 마케팅 인사이트

---

## Changelog

### 2026-02-23 (프로젝트 시작)
- 프로젝트 초기화
- .claude 폴더 구조 생성
- Sprint 0: Project Setup 시작
