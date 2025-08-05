# 롤백 계획 - Pure Supabase Auth 마이그레이션

**마이그레이션 실패 시 안전한 시스템 복구를 위한 완전한 롤백 계획**

## 🚨 개요

Pure Supabase Auth 마이그레이션 중 예상치 못한 문제가 발생할 경우, 이 롤백 계획을 통해 안전하고 신속하게 원래 Clerk 시스템으로 복구할 수 있습니다.

## ⚠️ 롤백 시나리오

### 🔴 즉시 롤백 필요 상황
- **데이터 손실 감지**: 사용자 데이터 또는 추천 관계 손실
- **인증 시스템 완전 장애**: 로그인/로그아웃 불가
- **보안 취약점 발견**: 권한 우회 또는 데이터 노출
- **성능 심각한 저하**: 응답시간 >10초 또는 시스템 다운

### 🟡 단계별 롤백 상황
- **특정 기능 오류**: 일부 기능만 문제
- **성능 저하**: 허용 범위 초과하지만 사용 가능
- **UI/UX 문제**: 기능은 정상이나 사용성 저하

## 🎯 롤백 전략

### A. 즉시 롤백 (Emergency Rollback)
- **소요 시간**: 5-15분
- **데이터 손실**: 최소화 (최근 백업으로 복구)
- **서비스 중단**: 5-10분

### B. 단계별 롤백 (Gradual Rollback)
- **소요 시간**: 30-60분
- **데이터 손실**: 없음
- **서비스 중단**: 없음 또는 최소

## 📊 롤백 포인트 매트릭스

| Phase | 롤백 포인트 | 복구 난이도 | 예상 시간 | 데이터 위험 |
|-------|-------------|-------------|-----------|-------------|
| **Phase 1** | 환경 설정 후 | 🟢 Easy | 5분 | None |
| **Phase 2** | Supabase Auth 설정 후 | 🟢 Easy | 10분 | None |
| **Phase 3** | 컴포넌트 개발 후 | 🟡 Medium | 15분 | Low |
| **Phase 4** | DB 스키마 변경 후 | 🟡 Medium | 30분 | Medium |
| **Phase 5** | 미들웨어 전환 후 | 🔴 Hard | 45분 | High |
| **Phase 6** | UI 전환 후 | 🔴 Hard | 60분 | High |
| **Phase 7** | 테스트 완료 후 | 🟡 Medium | 20분 | Low |
| **Phase 8** | 배포 완료 후 | 🟢 Easy | 10분 | None |

## 🛠️ 롤백 도구 및 스크립트

### 1. 즉시 롤백 스크립트

```bash
#!/bin/bash
# scripts/emergency-rollback.sh

set -e

echo "🚨 EMERGENCY ROLLBACK INITIATED"
echo "현재 시간: $(date)"

# 1. 트래픽 차단 (프록시 레벨)
echo "📡 트래픽 차단 중..."
./scripts/block-traffic.sh

# 2. 데이터베이스 백업에서 복구
echo "💾 데이터베이스 복구 중..."
./scripts/restore-database.sh

# 3. Clerk 설정 복원
echo "🔑 Clerk 설정 복원 중..."
./scripts/restore-clerk-config.sh

# 4. 애플리케이션 재시작
echo "🔄 애플리케이션 재시작 중..."
pm2 restart voosting-app

# 5. 트래픽 복원
echo "✅ 트래픽 복원 중..."
./scripts/restore-traffic.sh

echo "🎉 Emergency rollback completed successfully!"
echo "완료 시간: $(date)"
```

### 2. 데이터베이스 복구 스크립트

```bash
#!/bin/bash
# scripts/restore-database.sh

BACKUP_FILE="backups/pre-migration-$(date +%Y%m%d).sql"

if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ 백업 파일을 찾을 수 없습니다: $BACKUP_FILE"
    exit 1
fi

echo "📊 데이터베이스 복구 시작..."

# 현재 데이터베이스 백업 (롤백 전 상태 보존)
pg_dump $DATABASE_URL > "backups/rollback-point-$(date +%Y%m%d_%H%M%S).sql"

# 기존 연결 종료
psql $DATABASE_URL -c "SELECT pg_terminate_backend(pg_stat_activity.pid) FROM pg_stat_activity WHERE pg_stat_activity.datname = current_database() AND pid <> pg_backend_pid();"

# 스키마 삭제 및 복원
psql $DATABASE_URL -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
psql $DATABASE_URL < "$BACKUP_FILE"

echo "✅ 데이터베이스 복구 완료"
```

### 3. Clerk 설정 복원

```bash
#!/bin/bash
# scripts/restore-clerk-config.sh

echo "🔧 Clerk 설정 복원 중..."

# 환경 변수 복원
cp .env.clerk.backup .env.local

# Clerk 의존성 재설치
npm install @clerk/nextjs@^6.28.1

# 설정 파일 복원
cp src/lib/clerk.ts.backup src/lib/clerk.ts
cp src/middleware.ts.backup src/middleware.ts
cp src/app/api/webhooks/clerk/route.ts.backup src/app/api/webhooks/clerk/route.ts

# 빌드 재실행
npm run build

echo "✅ Clerk 설정 복원 완료"
```

## 📋 단계별 롤백 가이드

### Phase 1-2 롤백: 설정 복원

**위험도**: 🟢 Low  
**소요시간**: 5-10분

```bash
# 환경 변수 복원
cp .env.backup .env.local

# Supabase 설정 리셋
supabase db reset --db-url $ORIGINAL_DATABASE_URL

# 캐시 클리어
npm run build
```

### Phase 3-4 롤백: 코드 및 스키마 복원

**위험도**: 🟡 Medium  
**소요시간**: 15-30분

```bash
# Git을 사용한 코드 복원
git checkout HEAD~1 -- src/lib/
git checkout HEAD~1 -- src/app/auth/
git checkout HEAD~1 -- src/components/auth/

# 데이터베이스 스키마 복원
./scripts/restore-database.sh

# 의존성 복원
npm install
npm run build
```

### Phase 5-6 롤백: 시스템 완전 복원

**위험도**: 🔴 High  
**소요시간**: 45-60분

```bash
# 완전 시스템 롤백
./scripts/emergency-rollback.sh

# 데이터 무결성 검증
./scripts/verify-data-integrity.sh

# 서비스 헬스체크
./scripts/health-check.sh
```

## 🔍 롤백 검증 체크리스트

### ✅ 기본 기능 검증

- [ ] **사용자 로그인/로그아웃** 정상 작동
- [ ] **역할별 대시보드 접근** 정상
- [ ] **멀티도메인 라우팅** 작동
- [ ] **3단계 추천 시스템** 데이터 무결성
- [ ] **OAuth 로그인** (Google, Kakao) 정상

### ✅ 데이터 무결성 검증

```sql
-- 사용자 데이터 검증 쿼리
SELECT 
    COUNT(*) as total_users,
    COUNT(CASE WHEN role = 'creator' THEN 1 END) as creators,
    COUNT(CASE WHEN role = 'business' THEN 1 END) as businesses,
    COUNT(CASE WHEN role = 'admin' THEN 1 END) as admins
FROM profiles;

-- 추천 관계 무결성 검증
SELECT 
    COUNT(*) as total_referrals,
    COUNT(CASE WHEN referrer_l1_id IS NOT NULL THEN 1 END) as level1,
    COUNT(CASE WHEN referrer_l2_id IS NOT NULL THEN 1 END) as level2,
    COUNT(CASE WHEN referrer_l3_id IS NOT NULL THEN 1 END) as level3
FROM profiles;
```

### ✅ 성능 검증

```bash
# 응답 시간 테스트
curl -w "@curl-format.txt" -s -o /dev/null http://localhost:3002/
curl -w "@curl-format.txt" -s -o /dev/null http://creator.localhost:3002/

# 로드 테스트
ab -n 100 -c 10 http://localhost:3002/api/auth/me
```

## 🚨 긴급 상황 대응

### 24/7 긴급 연락처

**개발팀 Lead**: migration-emergency@voosting.app  
**DevOps**: infrastructure@voosting.app  
**CEO/CTO**: executives@voosting.app

### 긴급 대응 절차

1. **문제 감지** (모니터링 알람 또는 사용자 신고)
2. **영향도 평가** (사용자 수, 데이터 위험도)
3. **롤백 결정** (즉시 vs 단계별)
4. **롤백 실행** (담당자 배정 및 실행)
5. **상황 보고** (이해관계자 알림)
6. **사후 분석** (원인 분석 및 개선점)

### 에스컬레이션 매트릭스

| 상황 심각도 | 담당자 | 알림 방식 | 대응 시간 |
|-------------|--------|-----------|-----------|
| **P0 - Critical** | CTO + Lead Dev | 즉시 전화 + Slack | 15분 이내 |
| **P1 - High** | Lead Dev + DevOps | Slack + Email | 30분 이내 |
| **P2 - Medium** | 담당 개발자 | Slack | 1시간 이내 |
| **P3 - Low** | 담당 개발자 | Email | 24시간 이내 |

## 📊 모니터링 및 알림

### 실시간 모니터링 지표

```javascript
// monitoring/rollback-alerts.js
const alertingConfig = {
  // 인증 실패율 모니터링
  authFailureRate: {
    threshold: 5, // 5% 이상 실패
    window: '5m',
    action: 'immediate_rollback'
  },
  
  // 응답 시간 모니터링
  responseTime: {
    threshold: 5000, // 5초 이상
    window: '2m',
    action: 'investigate_rollback'
  },
  
  // 데이터베이스 연결 모니터링
  dbConnections: {
    threshold: 90, // 90% 이상 사용
    window: '1m',
    action: 'prepare_rollback'
  }
};
```

### 알림 설정

```yaml
# monitoring/alerts.yml
alerts:
  - name: "Migration Failure Detection"
    condition: "auth_failure_rate > 0.05"
    severity: "critical"
    notification:
      - slack: "#migration-alerts"
      - email: "migration-team@voosting.app"
      - webhook: "https://api.voosting.app/webhooks/emergency"
      
  - name: "Performance Degradation"
    condition: "response_time_p95 > 5000"
    severity: "warning"
    notification:
      - slack: "#performance-alerts"
```

## 📝 롤백 후 점검 사항

### 1. 시스템 안정성 확인

- **24시간 모니터링**: 롤백 후 24시간 집중 모니터링
- **사용자 피드백**: 고객지원팀과 연계하여 이슈 수집
- **성능 메트릭**: 기존 성능 수준 회복 확인

### 2. 데이터 검증

- **일관성 검사**: 데이터베이스 무결성 재검증
- **백업 검증**: 롤백 시점 데이터 백업 생성
- **로그 분석**: 롤백 과정에서 발생한 이슈 분석

### 3. 문서화

- **롤백 보고서**: 원인, 과정, 결과 문서화
- **교훈 정리**: 향후 방지책 및 개선사항
- **프로세스 업데이트**: 롤백 절차 개선

## 📈 사후 분석 및 개선

### 롤백 원인 분석 템플릿

```markdown
# 마이그레이션 롤백 보고서

## 기본 정보
- **롤백 실행 시간**: 2024-XX-XX XX:XX
- **롤백 완료 시간**: 2024-XX-XX XX:XX
- **영향받은 사용자 수**: XXX명
- **서비스 중단 시간**: XX분

## 롤백 원인
- **직접 원인**: 
- **근본 원인**: 
- **발견 경로**: 

## 롤백 과정
- **실행한 단계**: 
- **성공/실패**: 
- **예상외 문제**: 

## 영향도 분석
- **사용자 영향**: 
- **비즈니스 영향**: 
- **데이터 손실**: 

## 개선사항
- **즉시 개선**: 
- **중장기 개선**: 
- **프로세스 개선**: 
```

### 향후 방지책

1. **더 철저한 테스트**: 스테이징 환경에서 완전한 마이그레이션 시뮬레이션
2. **점진적 배포**: 카나리 배포를 통한 단계별 위험 최소화
3. **모니터링 강화**: 더 민감한 알림 설정 및 자동 롤백 트리거
4. **팀 교육**: 롤백 절차에 대한 정기적인 팀 교육 및 드릴

---

**📅 최종 업데이트**: 2024년 8월 5일  
**✅ 문서 상태**: 작성 완료  
**👥 검토자**: DevOps팀, 개발팀, QA팀

> 🚨 **중요**: 이 롤백 계획은 정기적으로 테스트하고 업데이트해야 합니다. 최소 분기별 1회 롤백 시뮬레이션을 권장합니다.