# 비즈니스 대시보드 (Business Dashboard)

부스팅 플랫폼의 비즈니스 사용자를 위한 전문적인 대시보드입니다.

## 주요 기능

### 📊 핵심 지표 카드
- **총 캠페인**: 전체/진행중/완료 캠페인 수
- **총 예산**: 예산 사용률과 남은 금액 표시
- **평균 ROI**: 투자 수익률과 전월 대비 증감률
- **활성 크리에이터**: 현재 활동중인 크리에이터 수

### 📈 성과 분석 차트
- **캠페인 성과 추이**: 최근 7일간 도달률, 참여도, 전환율 변화
- **플랫폼별 크리에이터 분포**: 인스타그램, 유튜브, 틱톡 등 플랫폼별 참여자 현황

### 🎯 캠페인 관리 테이블
4개의 탭으로 구성된 종합 캠페인 관리:

#### 전체 탭
- 모든 캠페인의 종합 현황
- 캠페인명, 상태, 예산, 사용액, 참여자 수, ROI, 기간 정보

#### 진행중 탭
- 현재 활성 캠페인들의 진행률과 관리 기능
- 실시간 예산 사용 현황 모니터링

#### 완료 탭
- 완료된 캠페인들의 최종 성과 리포트
- ROI 성과와 리포트 다운로드 기능

#### 대기중 탭
- 시작 예정 캠페인들의 준비 현황
- 캠페인 시작 버튼 및 설정 관리

## 기술 구현

### 컴포넌트 구조
```
business/dashboard/
├── page.tsx                           # 메인 페이지
├── components/
│   └── business-dashboard-content.tsx # 대시보드 콘텐츠
```

### 사용된 UI 컴포넌트
- **Card**: 지표 카드와 차트 컨테이너
- **Chart**: Recharts 기반 데이터 시각화
- **Table**: 캠페인 관리 테이블
- **Tabs**: 캠페인 상태별 필터링
- **Badge**: 상태 표시
- **Progress**: 예산 사용률 표시
- **Select**: 기간 선택

### 데이터 구조
```typescript
// 비즈니스 메트릭
const businessMetrics = {
  campaigns: { total, active, completed, pending },
  budget: { total, spent, remaining, utilization },
  roi: { average, trend, bestCampaign },
  creators: { total, active, pending, top }
}

// 캠페인 데이터
interface Campaign {
  id: number
  name: string
  status: '진행중' | '완료' | '대기중'
  budget: string
  spent: string
  participants: number
  roi: number
  startDate: string
  endDate: string
}
```

## 디자인 특징

### 한국어 중심 설계
- 모든 UI 텍스트와 라벨이 한국어로 작성
- 한국 비즈니스 환경에 맞는 데이터 형식 (원화 표시 등)

### 반응형 디자인
- 모바일/태블릿/데스크탑 환경 지원
- Grid 레이아웃으로 다양한 화면 크기 대응

### 시각적 계층구조
- 중요 지표는 큰 폰트로 강조
- 색상 코딩으로 상태 구분 (진행중: 파란색, 완료: 녹색, 대기중: 노란색)
- 아이콘으로 직관적인 정보 전달

### 비즈니스 테마 적용
- `data-theme="business"` 속성으로 에메랄드 기반 컬러 스키마
- 전문적이고 신뢰감 있는 시각적 스타일

## 향후 개선 계획

### 실시간 데이터 연동
- Supabase Realtime으로 실시간 지표 업데이트
- WebSocket 기반 알림 시스템

### 고급 분석 기능
- 더 상세한 ROI 분석 차트
- A/B 테스트 결과 비교
- 크리에이터별 성과 분석

### 액션 기능 추가
- 캠페인 일시정지/재개 버튼
- 예산 조정 모달
- 크리에이터 초대 기능

### 데이터 내보내기
- Excel/PDF 리포트 생성
- 일정별 자동 리포트 이메일
- 대시보드 스크린샷 기능

## 접근 URL

로컬 개발환경: `http://business.localhost:3002`  
운영환경: `https://business.voosting.app`
