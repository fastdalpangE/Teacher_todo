# Project Structure

Teacher Daily 프로젝트의 디렉토리 및 파일 구조 안내입니다.

```txt
teacher-daily/
├─ document/                 # 프로젝트 문서 및 작업 로그
│  ├─ project_summary.md     # 프로젝트 개요 및 완료 작업 내역
│  ├─ structure.md           # 이 문서 (디렉토리 구조)
│  └─ progress_report.md     # 구현 진행 현황 보고서
├─ src/
│  ├─ App.jsx                # 메인 앱 엔트리 (탭 전환 + 수업 모달)
│  ├─ main.jsx               # DOM 렌더링 및 AppProvider 설정
│  ├─ components/
│  │  ├─ import/
│  │  │  ├─ CsvImportButton.jsx   # CSV 업로드 트리거 버튼
│  │  │  └─ CsvPreviewModal.jsx   # CSV 미리보기 + 확인 모달
│  │  ├─ layout/
│  │  │  ├─ AppShell.jsx          # 상단 Nav + 콘텐츠 래퍼
│  │  │  └─ TopNav.jsx            # 브랜드, 메인 탭 3개, CSV 버튼
│  │  ├─ manage/
│  │  │  ├─ SchoolList.jsx        # 학교 CRUD + 시험 일정 관리
│  │  │  ├─ StudentList.jsx       # 학생 CRUD + 히스토리 모달
│  │  │  └─ TimetableGrid.jsx     # ⭐ 9~18시 전체 시간표 + 학생별 필터
│  │  └─ schedule/
│  │     ├─ ClassCard.jsx         # 수업 카드 + 학생별 출석/단어/코멘트
│  │     ├─ DailyView.jsx        # 일간 수업 목록
│  │     ├─ MonthlyView.jsx      # 월간 달력 그리드
│  │     └─ WeeklyView.jsx       # 주간 수업 목록
│  ├─ data/
│  │  └─ seed.js             # 초기 데이터 (18명 학생, 12수업, 3학교)
│  ├─ pages/
│  │  ├─ ManagePage.jsx      # 학생·학교 탭 (시간표/학생/학교 서브탭)
│  │  ├─ SchedulePage.jsx    # 수업일지 탭 (주간/월간/일간 뷰 + 필터)
│  │  └─ TodoPage.jsx        # ⭐ 할일·전달 탭 (5개 섹션 완전 구현)
│  ├─ store/
│  │  └─ app-store.jsx       # 전역 상태 (Context + useReducer + localStorage)
│  ├─ styles/
│  │  └─ globals.css         # 프리미엄 디자인 시스템 (2700+ lines)
│  └─ utils/
│     ├─ csv.js              # CSV 파싱 로직
│     ├─ date.js             # 날짜 계산 유틸
│     └─ ids.js              # 고유 ID 생성기
├─ index.html
├─ package.json
└─ vite.config.js
```

## 주요 파일 설명

### 상태 관리 (`app-store.jsx`)
- **22개 reducer 액션** 지원
- localStorage 자동 저장 + 신규 필드 자동 머지
- UI 상태, 수업/학생/학교 CRUD, 할일/전달/시험/메모 CRUD

### 디자인 시스템 (`globals.css`)
- Noto Sans KR 폰트 기반
- Glassmorphism + 반응형 (4단계 브레이크포인트)
- 다크 네비게이션 + 카드 레이아웃
- 2754줄 규모의 완전한 CSS

### 데이터 시드 (`seed.js`)
- 학교 3곳 (서동초, 대구중, 성광고)
- 학생 18명 (각각 학교/학년/수강수업 매핑)
- 주간 수업 12개 (월~금, 14:00~16:00)
- 시험 일정 5건 (각 학교별)
- 할일/전달/D-Day/메모 섹션 기본값
