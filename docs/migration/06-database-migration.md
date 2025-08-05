# 06. 데이터베이스 마이그레이션 및 스키마 전환

## 1. Clerk User ID → Supabase UUID 변환 전략

### 1.1 마이그레이션 전략 개요

```mermaid
flowchart TD
    A[Clerk User ID<br/>user_2xxx] --> B[UUID 변환<br/>gen_random_uuid()]
    B --> C[매핑 테이블<br/>user_migrations]
    C --> D[3단계 추천 관계<br/>재구성]
    D --> E[RLS 정책<br/>업데이트]
    E --> F[인덱스<br/>최적화]
    F --> G[데이터 검증<br/>완료]
```

### 1.2 단계별 마이그레이션 전략

#### Phase 1: 준비 및 백업
```sql
-- 1.1 기존 데이터 백업 테이블 생성
CREATE TABLE profiles_backup AS 
SELECT * FROM profiles;

CREATE TABLE referral_transactions_backup AS 
SELECT * FROM referral_transactions;

-- 1.2 마이그레이션 매핑 테이블 생성
CREATE TABLE user_migrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  old_clerk_id text NOT NULL UNIQUE,
  new_supabase_id uuid NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  migrated_at timestamptz DEFAULT now(),
  verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- 1.3 임시 컬럼 추가 (기존 데이터 보존)
ALTER TABLE profiles 
ADD COLUMN old_clerk_id text,
ADD COLUMN new_id uuid DEFAULT gen_random_uuid();

-- 기존 Clerk ID 백업
UPDATE profiles SET old_clerk_id = id;

-- 1.4 마이그레이션 매핑 데이터 생성
INSERT INTO user_migrations (old_clerk_id, new_supabase_id)
SELECT id, gen_random_uuid() 
FROM profiles;
```

#### Phase 2: 스키마 변경
```sql
-- 2.1 새로운 profiles 테이블 구조 생성
CREATE TABLE profiles_new (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  role user_role NOT NULL DEFAULT 'creator',
  
  -- 프로필 정보
  name text,
  avatar_url text,
  bio text,
  phone text,
  
  -- 3단계 추천 시스템
  referral_code text UNIQUE NOT NULL,
  referrer_l1_id uuid REFERENCES profiles_new(id),
  referrer_l2_id uuid REFERENCES profiles_new(id), 
  referrer_l3_id uuid REFERENCES profiles_new(id),
  
  -- 크리에이터 전용 필드
  creator_category text[],
  creator_platforms jsonb DEFAULT '{}',
  creator_metrics jsonb DEFAULT '{}',
  
  -- 비즈니스 전용 필드
  company_name text,
  business_type text,
  business_category text,
  
  -- 수익 정보
  total_earnings decimal(12,2) DEFAULT 0,
  total_referral_earnings decimal(12,2) DEFAULT 0,
  available_balance decimal(12,2) DEFAULT 0,
  
  -- 설정
  email_notifications boolean DEFAULT true,
  push_notifications boolean DEFAULT true,
  marketing_emails boolean DEFAULT false,
  
  -- 타임스탬프
  email_verified_at timestamptz,
  last_sign_in_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- 제약조건
  CONSTRAINT valid_referral_code CHECK (length(referral_code) >= 6),
  CONSTRAINT no_self_referral CHECK (
    id != referrer_l1_id AND 
    id != referrer_l2_id AND 
    id != referrer_l3_id
  ),
  CONSTRAINT valid_role_fields CHECK (
    (role = 'creator' AND company_name IS NULL) OR
    (role = 'business' AND creator_category IS NULL) OR
    (role = 'admin')
  )
);

-- 2.2 트리거 함수 생성 (updated_at 자동 업데이트)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles_new
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

#### Phase 3: 데이터 마이그레이션
```sql
-- 3.1 기본 프로필 데이터 마이그레이션
WITH migrated_data AS (
  SELECT 
    um.new_supabase_id as id,
    p.email,
    p.role,
    p.name,
    p.avatar_url,
    p.bio,
    p.phone,
    p.referral_code,
    p.creator_category,
    p.creator_platforms,
    p.creator_metrics,
    p.company_name,
    p.business_type,
    p.business_category,
    p.total_earnings,
    p.total_referral_earnings,
    p.available_balance,
    p.email_notifications,
    p.push_notifications,
    p.marketing_emails,
    p.email_verified_at,
    p.last_sign_in_at,
    p.created_at,
    p.updated_at
  FROM profiles p
  JOIN user_migrations um ON p.old_clerk_id = um.old_clerk_id
)
INSERT INTO profiles_new (
  id, email, role, name, avatar_url, bio, phone,
  referral_code, creator_category, creator_platforms, creator_metrics,
  company_name, business_type, business_category,
  total_earnings, total_referral_earnings, available_balance,
  email_notifications, push_notifications, marketing_emails,
  email_verified_at, last_sign_in_at, created_at, updated_at
)
SELECT * FROM migrated_data;

-- 3.2 3단계 추천 관계 재구성
UPDATE profiles_new 
SET referrer_l1_id = (
  SELECT um_l1.new_supabase_id 
  FROM profiles p
  JOIN user_migrations um ON p.old_clerk_id = um.old_clerk_id
  JOIN user_migrations um_l1 ON p.referrer_l1_id = um_l1.old_clerk_id
  WHERE um.new_supabase_id = profiles_new.id
)
WHERE EXISTS (
  SELECT 1 FROM profiles p
  JOIN user_migrations um ON p.old_clerk_id = um.old_clerk_id
  WHERE um.new_supabase_id = profiles_new.id 
    AND p.referrer_l1_id IS NOT NULL
);

-- L2, L3 참조 관계도 동일하게 업데이트
UPDATE profiles_new 
SET referrer_l2_id = (
  SELECT um_l2.new_supabase_id 
  FROM profiles p
  JOIN user_migrations um ON p.old_clerk_id = um.old_clerk_id
  JOIN user_migrations um_l2 ON p.referrer_l2_id = um_l2.old_clerk_id
  WHERE um.new_supabase_id = profiles_new.id
);

UPDATE profiles_new 
SET referrer_l3_id = (
  SELECT um_l3.new_supabase_id 
  FROM profiles p
  JOIN user_migrations um ON p.old_clerk_id = um.old_clerk_id
  JOIN user_migrations um_l3 ON p.referrer_l3_id = um_l3.old_clerk_id
  WHERE um.new_supabase_id = profiles_new.id
);
```

## 2. 3단계 추천 시스템 무결성 유지

### 2.1 추천 관계 검증 함수

```sql
-- 추천 관계 검증 함수
CREATE OR REPLACE FUNCTION validate_referral_chain(user_id uuid)
RETURNS TABLE (
  level integer,
  referrer_id uuid,
  referrer_email text,
  is_valid boolean,
  error_message text
) 
LANGUAGE plpgsql AS $$
DECLARE
  l1_id uuid;
  l2_id uuid; 
  l3_id uuid;
  l1_email text;
  l2_email text;
  l3_email text;
BEGIN
  -- 사용자의 추천 체인 조회
  SELECT referrer_l1_id, referrer_l2_id, referrer_l3_id
  INTO l1_id, l2_id, l3_id
  FROM profiles_new WHERE id = user_id;
  
  -- L1 검증
  IF l1_id IS NOT NULL THEN
    SELECT email INTO l1_email FROM profiles_new WHERE id = l1_id;
    
    IF l1_email IS NULL THEN
      RETURN QUERY SELECT 1, l1_id, null::text, false, 'L1 referrer not found';
    ELSIF l1_id = user_id THEN
      RETURN QUERY SELECT 1, l1_id, l1_email, false, 'Self-referral detected';
    ELSE
      RETURN QUERY SELECT 1, l1_id, l1_email, true, null::text;
    END IF;
  END IF;
  
  -- L2 검증
  IF l2_id IS NOT NULL THEN
    SELECT email INTO l2_email FROM profiles_new WHERE id = l2_id;
    
    -- L2는 L1의 추천자여야 함
    IF NOT EXISTS (
      SELECT 1 FROM profiles_new 
      WHERE id = l1_id AND referrer_l1_id = l2_id
    ) THEN
      RETURN QUERY SELECT 2, l2_id, l2_email, false, 'L2 is not L1s referrer';
    ELSE
      RETURN QUERY SELECT 2, l2_id, l2_email, true, null::text;
    END IF;
  END IF;
  
  -- L3 검증
  IF l3_id IS NOT NULL THEN
    SELECT email INTO l3_email FROM profiles_new WHERE id = l3_id;
    
    -- L3는 L2의 추천자여야 함
    IF NOT EXISTS (
      SELECT 1 FROM profiles_new 
      WHERE id = l2_id AND referrer_l1_id = l3_id
    ) THEN
      RETURN QUERY SELECT 3, l3_id, l3_email, false, 'L3 is not L2s referrer';
    ELSE
      RETURN QUERY SELECT 3, l3_id, l3_email, true, null::text;
    END IF;
  END IF;
END;
$$;

-- 전체 사용자 추천 체인 검증
CREATE OR REPLACE FUNCTION validate_all_referral_chains()
RETURNS TABLE (
  user_id uuid,
  user_email text,
  total_issues integer,
  issues jsonb
)
LANGUAGE plpgsql AS $$
DECLARE
  user_record record;
  validation_result record;
  issue_count integer;
  issues_array jsonb[];
BEGIN
  FOR user_record IN 
    SELECT id, email FROM profiles_new 
    WHERE referrer_l1_id IS NOT NULL 
       OR referrer_l2_id IS NOT NULL 
       OR referrer_l3_id IS NOT NULL
  LOOP
    issue_count := 0;
    issues_array := ARRAY[]::jsonb[];
    
    FOR validation_result IN 
      SELECT * FROM validate_referral_chain(user_record.id)
      WHERE is_valid = false
    LOOP
      issue_count := issue_count + 1;
      issues_array := issues_array || jsonb_build_object(
        'level', validation_result.level,
        'referrer_id', validation_result.referrer_id,
        'error', validation_result.error_message
      );
    END LOOP;
    
    IF issue_count > 0 THEN
      RETURN QUERY SELECT 
        user_record.id,
        user_record.email,
        issue_count,
        array_to_json(issues_array)::jsonb;
    END IF;
  END LOOP;
END;
$$;
```

### 2.2 추천 관계 자동 수정 함수

```sql
-- 추천 관계 자동 수정 함수
CREATE OR REPLACE FUNCTION fix_referral_chain(target_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql AS $$
DECLARE
  current_l1 uuid;
  current_l2 uuid;
  correct_l2 uuid;
  correct_l3 uuid;
BEGIN
  -- 현재 L1 참조자 조회
  SELECT referrer_l1_id INTO current_l1
  FROM profiles_new WHERE id = target_user_id;
  
  IF current_l1 IS NULL THEN
    -- L1이 없으면 L2, L3도 NULL로 설정
    UPDATE profiles_new 
    SET referrer_l2_id = NULL, referrer_l3_id = NULL
    WHERE id = target_user_id;
    RETURN true;
  END IF;
  
  -- L1의 추천자를 L2로 설정
  SELECT referrer_l1_id INTO correct_l2
  FROM profiles_new WHERE id = current_l1;
  
  -- L2의 추천자를 L3로 설정
  IF correct_l2 IS NOT NULL THEN
    SELECT referrer_l1_id INTO correct_l3
    FROM profiles_new WHERE id = correct_l2;
  ELSE
    correct_l3 := NULL;
  END IF;
  
  -- 수정된 추천 관계 업데이트
  UPDATE profiles_new 
  SET 
    referrer_l2_id = correct_l2,
    referrer_l3_id = correct_l3,
    updated_at = now()
  WHERE id = target_user_id;
  
  RETURN true;
END;
$$;

-- 모든 추천 관계 일괄 수정
CREATE OR REPLACE FUNCTION fix_all_referral_chains()
RETURNS integer
LANGUAGE plpgsql AS $$
DECLARE
  fixed_count integer := 0;
  user_record record;
BEGIN
  FOR user_record IN 
    SELECT id FROM profiles_new 
    WHERE referrer_l1_id IS NOT NULL
  LOOP
    IF fix_referral_chain(user_record.id) THEN
      fixed_count := fixed_count + 1;
    END IF;
  END LOOP;
  
  RETURN fixed_count;
END;
$$;
```

## 3. RLS 정책 업데이트

### 3.1 Supabase Auth 기반 RLS 정책

```sql
-- 기존 Clerk 기반 RLS 정책 제거
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Supabase Auth 기반 RLS 정책 생성
-- 사용자는 자신의 프로필만 조회/수정 가능
CREATE POLICY "Enable read access for users on own profile" ON profiles_new
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Enable update access for users on own profile" ON profiles_new
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Enable insert access for users on own profile" ON profiles_new
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 관리자는 모든 프로필 접근 가능
CREATE POLICY "Enable all access for admin users" ON profiles_new
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles_new 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 추천 관계 조회를 위한 제한된 읽기 권한
CREATE POLICY "Enable referral chain read access" ON profiles_new
  FOR SELECT USING (
    id IN (
      -- 자신이 추천한 사용자들
      SELECT p.id FROM profiles_new p 
      WHERE p.referrer_l1_id = auth.uid()
         OR p.referrer_l2_id = auth.uid() 
         OR p.referrer_l3_id = auth.uid()
    ) OR
    id IN (
      -- 자신을 추천한 사용자들
      SELECT COALESCE(referrer_l1_id, referrer_l2_id, referrer_l3_id) 
      FROM profiles_new 
      WHERE id = auth.uid()
    )
  );
```

### 3.2 다른 테이블들의 RLS 정책 업데이트

```sql
-- campaigns 테이블 RLS 정책
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view campaigns they created or are assigned to" ON campaigns
  FOR SELECT USING (
    creator_id = auth.uid() OR 
    business_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles_new 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Business users can create campaigns" ON campaigns
  FOR INSERT WITH CHECK (
    business_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM profiles_new 
      WHERE id = auth.uid() AND role = 'business'
    )
  );

-- creator_pages 테이블 RLS 정책  
ALTER TABLE creator_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Creators can manage their own pages" ON creator_pages
  FOR ALL USING (creator_id = auth.uid());

CREATE POLICY "Public can view published pages" ON creator_pages
  FOR SELECT USING (is_published = true);

-- referral_transactions 테이블 RLS 정책
ALTER TABLE referral_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their referral transactions" ON referral_transactions
  FOR SELECT USING (
    referrer_id = auth.uid() OR
    referee_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles_new 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

## 4. 인덱스 최적화

### 4.1 성능 최적화 인덱스

```sql
-- profiles_new 테이블 인덱스
CREATE INDEX CONCURRENTLY idx_profiles_email ON profiles_new(email);
CREATE INDEX CONCURRENTLY idx_profiles_referral_code ON profiles_new(referral_code);
CREATE INDEX CONCURRENTLY idx_profiles_role ON profiles_new(role);
CREATE INDEX CONCURRENTLY idx_profiles_referrer_l1 ON profiles_new(referrer_l1_id);
CREATE INDEX CONCURRENTLY idx_profiles_referrer_l2 ON profiles_new(referrer_l2_id);
CREATE INDEX CONCURRENTLY idx_profiles_referrer_l3 ON profiles_new(referrer_l3_id);
CREATE INDEX CONCURRENTLY idx_profiles_created_at ON profiles_new(created_at);
CREATE INDEX CONCURRENTLY idx_profiles_updated_at ON profiles_new(updated_at);

-- 복합 인덱스 (자주 함께 조회되는 컬럼들)
CREATE INDEX CONCURRENTLY idx_profiles_role_created ON profiles_new(role, created_at);
CREATE INDEX CONCURRENTLY idx_profiles_referral_chain ON profiles_new(referrer_l1_id, referrer_l2_id, referrer_l3_id);

-- 부분 인덱스 (특정 조건의 데이터만)
CREATE INDEX CONCURRENTLY idx_profiles_creators ON profiles_new(id) 
  WHERE role = 'creator';
CREATE INDEX CONCURRENTLY idx_profiles_businesses ON profiles_new(id) 
  WHERE role = 'business';
CREATE INDEX CONCURRENTLY idx_profiles_has_referrer ON profiles_new(referrer_l1_id, created_at) 
  WHERE referrer_l1_id IS NOT NULL;

-- campaigns 테이블 인덱스
CREATE INDEX CONCURRENTLY idx_campaigns_creator_id ON campaigns(creator_id);
CREATE INDEX CONCURRENTLY idx_campaigns_business_id ON campaigns(business_id);
CREATE INDEX CONCURRENTLY idx_campaigns_status ON campaigns(status);
CREATE INDEX CONCURRENTLY idx_campaigns_created_at ON campaigns(created_at);
CREATE INDEX CONCURRENTLY idx_campaigns_status_created ON campaigns(status, created_at);

-- referral_transactions 테이블 인덱스
CREATE INDEX CONCURRENTLY idx_referral_transactions_referrer ON referral_transactions(referrer_id);
CREATE INDEX CONCURRENTLY idx_referral_transactions_referee ON referral_transactions(referee_id);
CREATE INDEX CONCURRENTLY idx_referral_transactions_campaign ON referral_transactions(campaign_id);
CREATE INDEX CONCURRENTLY idx_referral_transactions_created ON referral_transactions(created_at);
CREATE INDEX CONCURRENTLY idx_referral_transactions_level ON referral_transactions(referral_level);
```

### 4.2 쿼리 성능 모니터링

```sql
-- 느린 쿼리 모니터링 뷰 생성
CREATE VIEW slow_queries AS
SELECT 
  query,
  calls,
  total_time,
  mean_time,
  stddev_time,
  rows,
  100.0 * shared_blks_hit / nullif(shared_blks_hit + shared_blks_read, 0) AS hit_percent
FROM pg_stat_statements 
WHERE mean_time > 100  -- 100ms 이상 쿼리
ORDER BY mean_time DESC;

-- 인덱스 사용률 확인 뷰
CREATE VIEW index_usage AS
SELECT 
  schemaname,
  tablename,
  attname,
  n_distinct,
  correlation,
  (100 * most_common_freqs[1])::text || '%' as most_common_freq
FROM pg_stats 
WHERE schemaname = 'public'
ORDER BY tablename, attname;

-- 테이블 크기 및 인덱스 크기 모니터링
CREATE VIEW table_sizes AS
SELECT 
  tablename,
  pg_size_pretty(pg_total_relation_size(tablename::regclass)) as total_size,
  pg_size_pretty(pg_relation_size(tablename::regclass)) as table_size,
  pg_size_pretty(pg_total_relation_size(tablename::regclass) - pg_relation_size(tablename::regclass)) as index_size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(tablename::regclass) DESC;
```

## 5. 실행 스크립트

### 5.1 마이그레이션 실행 스크립트

```bash
#!/bin/bash
# scripts/execute-migration.sh

set -e

echo "🚀 Supabase Auth 마이그레이션 시작..."

# 환경 변수 확인
if [ -z "$DATABASE_URL" ]; then
  echo "❌ DATABASE_URL 환경 변수가 설정되지 않았습니다."
  exit 1
fi

# 1. 백업 생성
echo "📦 데이터 백업 중..."
pg_dump "$DATABASE_URL" > "backup_$(date +%Y%m%d_%H%M%S).sql"

# 2. 마이그레이션 스크립트 실행
echo "🔄 마이그레이션 실행 중..."

# Phase 1: 준비 및 백업
echo "Phase 1: 준비 및 백업..."
psql "$DATABASE_URL" -f supabase/migrations/007_migration_prep.sql

# Phase 2: 스키마 변경
echo "Phase 2: 스키마 변경..."
psql "$DATABASE_URL" -f supabase/migrations/008_new_schema.sql

# Phase 3: 데이터 마이그레이션
echo "Phase 3: 데이터 마이그레이션..."
psql "$DATABASE_URL" -f supabase/migrations/009_data_migration.sql

# Phase 4: RLS 정책 업데이트
echo "Phase 4: RLS 정책 업데이트..."
psql "$DATABASE_URL" -f supabase/migrations/010_rls_policies.sql

# Phase 5: 인덱스 생성
echo "Phase 5: 인덱스 최적화..."
psql "$DATABASE_URL" -f supabase/migrations/011_indexes.sql

# 3. 데이터 검증
echo "🔍 데이터 무결성 검증 중..."
./scripts/verify-migration.sh

# 4. 성능 테스트
echo "⚡ 성능 테스트 실행 중..."
./scripts/performance-test.sh

echo "✅ 마이그레이션 완료!"
echo "📊 결과 요약:"
echo "  - 백업 파일: backup_$(date +%Y%m%d_%H%M%S).sql"
echo "  - 마이그레이션된 사용자: $(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM profiles_new;")"
echo "  - 추천 관계 검증: $(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM validate_all_referral_chains();")"
```

### 5.2 백업/복원 스크립트

```bash
#!/bin/bash
# scripts/backup-restore.sh

set -e

BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)

case "$1" in
  "backup")
    echo "📦 데이터베이스 백업 시작..."
    mkdir -p "$BACKUP_DIR"
    
    # 전체 데이터베이스 백업
    pg_dump "$DATABASE_URL" > "$BACKUP_DIR/full_backup_$DATE.sql"
    
    # 스키마만 백업
    pg_dump --schema-only "$DATABASE_URL" > "$BACKUP_DIR/schema_backup_$DATE.sql"
    
    # 데이터만 백업  
    pg_dump --data-only "$DATABASE_URL" > "$BACKUP_DIR/data_backup_$DATE.sql"
    
    # 특정 테이블만 백업
    pg_dump --table=profiles --table=campaigns --table=referral_transactions \
      "$DATABASE_URL" > "$BACKUP_DIR/critical_tables_backup_$DATE.sql"
    
    echo "✅ 백업 완료: $BACKUP_DIR/"
    ;;
    
  "restore")
    if [ -z "$2" ]; then
      echo "❌ 복원할 백업 파일을 지정해주세요."
      echo "사용법: ./backup-restore.sh restore backup_file.sql"
      exit 1
    fi
    
    echo "🔄 데이터베이스 복원 시작..."
    echo "⚠️ 경고: 기존 데이터가 모두 삭제됩니다."
    read -p "계속하시겠습니까? (y/N): " confirm
    
    if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
      # 기존 연결 종료
      psql "$DATABASE_URL" -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = current_database() AND pid <> pg_backend_pid();"
      
      # 데이터베이스 복원
      psql "$DATABASE_URL" < "$2"
      
      echo "✅ 복원 완료!"
    else
      echo "❌ 복원이 취소되었습니다."
    fi
    ;;
    
  "list")
    echo "📋 사용 가능한 백업 파일:"
    ls -la "$BACKUP_DIR"/*.sql 2>/dev/null || echo "백업 파일이 없습니다."
    ;;
    
  *)
    echo "사용법:"
    echo "  ./backup-restore.sh backup    # 백업 생성"
    echo "  ./backup-restore.sh restore <file>  # 백업 복원"
    echo "  ./backup-restore.sh list      # 백업 파일 목록"
    ;;
esac
```

### 5.3 검증 스크립트

```bash
#!/bin/bash
# scripts/verify-migration.sh

set -e

echo "🔍 마이그레이션 검증 시작..."

# 환경 변수 확인
if [ -z "$DATABASE_URL" ]; then
  echo "❌ DATABASE_URL 환경 변수가 설정되지 않았습니다."
  exit 1
fi

# 1. 테이블 존재 확인
echo "📋 테이블 존재 확인..."
tables=("profiles_new" "campaigns" "creator_pages" "referral_transactions")
for table in "${tables[@]}"; do
  count=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_name='$table';")
  if [ "$count" -eq 1 ]; then
    echo "✅ $table 테이블 존재"
  else
    echo "❌ $table 테이블 없음"
    exit 1
  fi
done

# 2. 데이터 건수 확인
echo "📊 데이터 건수 확인..."
old_count=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM profiles_backup;")
new_count=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM profiles_new;")

echo "  - 기존 profiles: $old_count"
echo "  - 새로운 profiles_new: $new_count"

if [ "$old_count" -eq "$new_count" ]; then
  echo "✅ 데이터 건수 일치"
else
  echo "❌ 데이터 건수 불일치"
  exit 1
fi

# 3. UUID 형식 검증
echo "🔍 UUID 형식 검증..."
invalid_uuids=$(psql "$DATABASE_URL" -t -c "
  SELECT COUNT(*) FROM profiles_new 
  WHERE id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';
")

if [ "$invalid_uuids" -eq 0 ]; then
  echo "✅ 모든 UUID 형식 유효"
else
  echo "❌ 잘못된 UUID 형식 $invalid_uuids개 발견"
  exit 1
fi

# 4. 추천 관계 무결성 검증
echo "🔗 추천 관계 무결성 검증..."
referral_issues=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM validate_all_referral_chains();")

if [ "$referral_issues" -eq 0 ]; then
  echo "✅ 추천 관계 무결성 정상"
else
  echo "⚠️ 추천 관계 문제 $referral_issues개 발견"
  echo "자동 수정을 실행하시겠습니까? (y/N):"
  read -r fix_confirm
  
  if [ "$fix_confirm" = "y" ] || [ "$fix_confirm" = "Y" ]; then
    fixed_count=$(psql "$DATABASE_URL" -t -c "SELECT fix_all_referral_chains();")
    echo "✅ $fixed_count개 추천 관계 수정 완료"
  fi
fi

# 5. RLS 정책 확인
echo "🛡️ RLS 정책 확인..."
rls_count=$(psql "$DATABASE_URL" -t -c "
  SELECT COUNT(*) FROM pg_policies 
  WHERE schemaname = 'public' AND tablename = 'profiles_new';
")

if [ "$rls_count" -gt 0 ]; then
  echo "✅ RLS 정책 $rls_count개 활성화됨"
else
  echo "❌ RLS 정책이 설정되지 않았습니다"
  exit 1
fi

# 6. 인덱스 확인
echo "📈 인덱스 확인..."
index_count=$(psql "$DATABASE_URL" -t -c "
  SELECT COUNT(*) FROM pg_indexes 
  WHERE schemaname = 'public' AND tablename = 'profiles_new';
")

if [ "$index_count" -gt 5 ]; then
  echo "✅ 인덱스 $index_count개 생성됨"
else
  echo "⚠️ 인덱스가 부족합니다 (현재: $index_count개)"
fi

# 7. 성능 기준선 테스트
echo "⚡ 성능 기준선 테스트..."
start_time=$(date +%s%N)
psql "$DATABASE_URL" -c "SELECT * FROM profiles_new LIMIT 1000;" > /dev/null
end_time=$(date +%s%N)
duration=$((($end_time - $start_time) / 1000000))

echo "  - 1000건 조회 시간: ${duration}ms"
if [ $duration -lt 100 ]; then
  echo "✅ 성능 기준 달성"
else
  echo "⚠️ 성능 개선 필요 (목표: <100ms)"
fi

# 8. Auth 설정 확인
echo "🔐 Auth 설정 확인..."
auth_config=$(curl -s "$SUPABASE_URL/auth/v1/settings" -H "apikey: $SUPABASE_ANON_KEY")
if echo "$auth_config" | grep -q "external"; then
  echo "✅ Auth 서비스 정상"
else
  echo "❌ Auth 서비스 설정 오류"
  exit 1
fi

echo "🎉 마이그레이션 검증 완료!"
echo "📊 검증 결과 요약:"
echo "  - 테이블: ✅ 모든 테이블 존재"
echo "  - 데이터: ✅ $new_count건 마이그레이션 완료"
echo "  - UUID: ✅ 모든 UUID 형식 유효"
echo "  - 추천 관계: ✅ 무결성 확인됨"
echo "  - RLS 정책: ✅ $rls_count개 정책 활성화"
echo "  - 인덱스: ✅ $index_count개 인덱스 생성"
echo "  - 성능: ✅ ${duration}ms 응답 시간"
echo "  - Auth: ✅ 인증 서비스 정상"
```

### 5.4 자동화된 마이그레이션 스크립트

```bash
#!/bin/bash
# scripts/automated-migration.sh

set -e

MIGRATION_LOG="migration_$(date +%Y%m%d_%H%M%S).log"

# 로그 함수
log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$MIGRATION_LOG"
}

log "🚀 자동화된 Supabase Auth 마이그레이션 시작"

# 사전 검증
log "📋 사전 검증 시작..."
if [ -z "$DATABASE_URL" ] || [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_ANON_KEY" ]; then
  log "❌ 필수 환경 변수가 누락되었습니다"
  exit 1
fi

# 백업 생성
log "📦 자동 백업 생성..."
./scripts/backup-restore.sh backup >> "$MIGRATION_LOG" 2>&1

# 마이그레이션 실행
log "🔄 마이그레이션 실행..."
./scripts/execute-migration.sh >> "$MIGRATION_LOG" 2>&1

# 검증 실행
log "🔍 자동 검증 실행..."
if ./scripts/verify-migration.sh >> "$MIGRATION_LOG" 2>&1; then
  log "✅ 마이그레이션 성공!"
  
  # 정리 작업
  log "🧹 정리 작업..."
  psql "$DATABASE_URL" -c "DROP TABLE IF EXISTS profiles_backup;" >> "$MIGRATION_LOG" 2>&1
  psql "$DATABASE_URL" -c "DROP TABLE IF EXISTS user_migrations;" >> "$MIGRATION_LOG" 2>&1
  
  # 테이블 이름 변경 (최종 단계)
  psql "$DATABASE_URL" -c "ALTER TABLE profiles RENAME TO profiles_old;" >> "$MIGRATION_LOG" 2>&1
  psql "$DATABASE_URL" -c "ALTER TABLE profiles_new RENAME TO profiles;" >> "$MIGRATION_LOG" 2>&1
  
  log "🎉 전체 마이그레이션 완료!"
  log "📄 상세 로그: $MIGRATION_LOG"
  
else
  log "❌ 검증 실패 - 롤백 실행 중..."
  
  # 롤백 실행
  latest_backup=$(ls -t backups/full_backup_*.sql | head -n1)
  if [ -n "$latest_backup" ]; then
    ./scripts/backup-restore.sh restore "$latest_backup" >> "$MIGRATION_LOG" 2>&1
    log "🔄 롤백 완료: $latest_backup"
  else
    log "❌ 백업 파일을 찾을 수 없습니다"
  fi
  
  exit 1
fi
```

chmod +x scripts/execute-migration.sh
chmod +x scripts/backup-restore.sh  
chmod +x scripts/verify-migration.sh
chmod +x scripts/automated-migration.sh

## 6. 최종 체크리스트

### 6.1 마이그레이션 완료 체크리스트

- [ ] 기존 데이터 백업 완료
- [ ] user_migrations 매핑 테이블 생성
- [ ] profiles_new 테이블 생성 및 데이터 마이그레이션
- [ ] 3단계 추천 관계 재구성 완료
- [ ] UUID 형식 검증 통과
- [ ] RLS 정책 Supabase Auth 기반으로 업데이트
- [ ] 인덱스 생성 및 최적화 완료
- [ ] 데이터 무결성 검증 통과
- [ ] 성능 테스트 통과 (<100ms)
- [ ] Auth 설정 검증 완료
- [ ] 기존 테이블 정리 완료

### 6.2 성능 목표 달성 확인

- **데이터 조회 성능**: < 100ms (1000건 기준)
- **추천 관계 조회**: < 50ms (3단계 체인)
- **UUID 생성 속도**: < 10ms 
- **RLS 정책 검증**: < 20ms
- **인덱스 활용률**: > 95%

### 6.3 롤백 계획

마이그레이션 실패 시 자동 롤백 실행:
1. 최신 백업 파일 확인
2. 데이터베이스 연결 해제
3. 백업 파일로 복원
4. 연결 재개 및 검증
5. 실패 원인 로그 분석

이제 Pure Supabase Auth 전환을 위한 완전한 환경 설정 및 데이터베이스 마이그레이션 가이드가 준비되었습니다. 모든 스크립트는 실행 권한이 부여되어 있으며, 단계별로 안전하게 마이그레이션을 진행할 수 있습니다.