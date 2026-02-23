# /new-feature Command

새로운 기능 개발을 시작합니다.

## Usage
```
/new-feature [feature-name] [description]
```

## Workflow
1. **요구사항 분석**: 기능 요구사항을 명확히 정의
2. **아키텍처 설계**: architect 에이전트 호출
3. **DB 스키마**: 필요시 db-designer 에이전트 호출
4. **TDD Red**: test-writer 에이전트 → 실패 테스트 작성
5. **TDD Green**: implementer 에이전트 → 테스트 통과 코드
6. **TDD Refactor**: refactorer 에이전트 → 코드 개선
7. **Review**: reviewer 에이전트 → 최종 검토
8. **Integration**: 통합 및 검증 (전체 테스트 통과, 타입 체크, 빌드)
9. **Documentation Update (필수)**: 작업 완료 후 아래 파일들을 반드시 업데이트
   - `.claude/CONTEXT.md` → 현재 작업 상태, 완료된 항목, 다음 작업
   - `.claude/STATUS.md` → 전체 진행 상황 (Progress %, 테스트 수, 버전)
   - `.claude/ROADMAP.md` → 해당 Sprint 태스크 Status를 ✅ Done으로 변경, Changelog 추가
   - `.claude/logs/YYYY-MM-DD.md` → 일별 작업 로그 (변경 파일, 테스트 결과, 다음 작업)
10. **Git Commit & Push (필수)**: 문서 업데이트 후 반드시 커밋 & 푸시

---

## Step 9: Documentation Update 상세

### CONTEXT.md 업데이트 포인트
- `Last Updated` 섹션: 날짜, 시간, 작업 상태
- `Current Sprint` 섹션: 완료된 태스크 체크, 다음 Sprint 정보
- `Key Files` 섹션: 새로 추가된 파일/디렉토리 반영
- `Important Decisions`: 중요한 기술적 결정 추가

### STATUS.md 업데이트 포인트
- `Overall Progress` 테이블: 각 Sprint Status 및 Progress %
- 현재 Sprint Tasks 상태 업데이트
- `Key Metrics`: 총 테스트 수, 완료 태스크 수 갱신
- `Timeline`: 실제 완료 날짜 기록

### ROADMAP.md 업데이트 포인트
- 해당 Sprint 태스크 → `✅ Done` + Commit hash
- `Deliverables` 체크박스 완료
- `Results` 섹션 추가 (테스트 수, 주요 산출물)
- `Changelog` 섹션에 날짜별 변경 내역

### 로그 파일 형식 (.claude/logs/YYYY-MM-DD.md)
```markdown
## [HH:MM] 작업명

### 요청
> 사용자 요청 내용

### 수행 내역
| 단계 | 에이전트 | 결과 |
|------|---------|------|
| 설계 | architect | ✅ 완료 |
| 테스트 | test-writer | ✅ N개 작성 |
| 구현 | implementer | ✅ 완료 |

### 변경 파일
- `src/...` (생성/수정)

### 테스트 결과
- 신규: N tests
- 전체: M tests, ALL PASSED

### 다음 작업
- [ ] 후속 작업 내용
```

---

## Step 10: Git Commit & Push 상세

### 태스크 단위 커밋 (Sprint 진행 중)
Sprint 내 개별 태스크/기능이 완료될 때마다:
```bash
# 1. 검증
npx vitest run          # 테스트 통과 확인
npx tsc --noEmit        # 타입 체크

# 2. 스테이징 (변경된 파일만 명시적으로)
git add src/domain/... src/application/... src/components/... # 구현 파일
git add .claude/CONTEXT.md .claude/STATUS.md .claude/ROADMAP.md .claude/logs/ # 문서

# 3. 커밋
git commit -m "feat(scope): description

- 상세 내용

Co-Authored-By: Claude <noreply@anthropic.com>"
```

### Sprint 완료 커밋 & 배포 (Sprint의 마지막 태스크 완료 시)
Sprint의 모든 태스크가 ✅ Done이면 **Sprint 완료 배포**를 실행:

```bash
# 1. 최종 검증 (3가지 모두 통과해야 함)
npx vitest run          # 전체 테스트 통과
npx tsc --noEmit        # TypeScript 에러 0
npm run build           # 빌드 성공

# 2. 스테이징
git add -A              # Sprint 완료 시에는 전체 스테이징

# 3. Sprint 완료 커밋
git commit -m "feat(sprint-N): complete Sprint N - Sprint Title

## Summary
- Total tests: XXX (YYY new)
- New files: ZZ
- Key deliverables: ...

## Changes
- 주요 변경 사항 나열

Co-Authored-By: Claude <noreply@anthropic.com>"

# 4. 푸시
git push origin main

# 5. 푸시 실패 시
git pull --rebase origin main
# 충돌 해결 후
git push origin main
```

### Sprint 완료 판별 기준
아래 조건을 **모두** 만족하면 Sprint 완료로 판별:
1. 현재 Sprint의 **모든 태스크**가 ✅ Done
2. `npx vitest run` → ALL PASSED
3. `npx tsc --noEmit` → 0 errors
4. `npm run build` → 성공

### 커밋 체크리스트
```
커밋 전 확인:
[ ] 테스트 전체 통과
[ ] TypeScript 에러 없음
[ ] 빌드 성공
[ ] CONTEXT.md 업데이트됨
[ ] STATUS.md 업데이트됨
[ ] ROADMAP.md 업데이트됨
[ ] 로그 파일 업데이트됨
[ ] 민감 정보 없음 (.env, credentials 등)
```

---

## Example
```
/new-feature chat-interface "멀티 LLM 채팅 인터페이스 구현"
```

## Output
- Architecture design document
- Test files
- Implementation files
- Review report
- **Updated documentation** (CONTEXT.md, STATUS.md, ROADMAP.md, logs)
- **Git commit & push** (Sprint 완료 시 자동 배포)
