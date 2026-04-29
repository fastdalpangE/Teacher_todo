import { useState, useMemo } from 'react';
import { useAppStore } from '../store/app-store';
import { createId } from '../utils/ids';

const AVATAR_COLORS = ['#e8573f', '#2563eb', '#16a34a', '#d97706', '#8b5cf6', '#ec4899', '#0891b2', '#65a30d'];
function avatarColor(name) {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
}

export default function TodoPage() {
  const { state, dispatch } = useAppStore();
  const [openSections, setOpenSections] = useState(
    () => new Set((state.todoSections || []).map(s => s.id))
  );
  const [showExamModal, setShowExamModal] = useState(false);
  const [examForm, setExamForm] = useState({ title: '', date: '', type: '시험', memo: '' });

  const todos = state.todos || [];
  const transfers = state.transfers || [];
  const exams = state.exams || [];
  const sections = state.todoSections || [];

  const toggleSection = (id) => {
    setOpenSections(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // === ADD MEMO SECTION ===
  const addMemoSection = () => {
    dispatch({
      type: 'ADD_TODO_SECTION',
      payload: {
        id: 'sm-' + createId('memo'),
        type: 'memo',
        title: '메모',
        icon: '📝',
        content: ''
      }
    });
  };

  // === EXAM MODAL ===
  const handleAddExam = () => {
    if (!examForm.title || !examForm.date) return alert('제목과 날짜를 입력해주세요');
    dispatch({
      type: 'ADD_EXAM',
      payload: { ...examForm }
    });
    setExamForm({ title: '', date: '', type: '시험', memo: '' });
    setShowExamModal(false);
  };

  // === D-Day CALC ===
  const allDdays = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const custom = exams.map(e => ({ ...e, _src: 'custom' }));
    const schoolExams = (state.schools || []).flatMap(sch =>
      (sch.examSchedules || []).map(ex => ({
        id: ex.id,
        title: `${sch.name} ${ex.grade} ${ex.examType}`,
        date: ex.examDate,
        type: '시험',
        memo: ex.examRange,
        _src: 'school'
      }))
    );

    return [...custom, ...schoolExams]
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(e => {
        const d = new Date(e.date);
        d.setHours(0, 0, 0, 0);
        const diff = Math.round((d - today) / 86400000);
        let badge, badgeClass;
        if (diff === 0) { badge = 'D-Day'; badgeClass = 'db-today'; }
        else if (diff > 0) { badge = `D-${diff}`; badgeClass = diff <= 7 ? 'db-soon' : 'db-later'; }
        else { badge = `+${-diff}일`; badgeClass = 'db-past'; }
        return { ...e, diff, badge, badgeClass };
      });
  }, [exams, state.schools]);

  return (
    <section className="fade-in todo-page">
      <div className="todo-sections-list">
        {sections.map(sec => (
          <SectionRenderer
            key={sec.id}
            sec={sec}
            isOpen={openSections.has(sec.id)}
            onToggle={() => toggleSection(sec.id)}
            todos={todos}
            transfers={transfers}
            allDdays={allDdays}
            students={state.students || []}
            dispatch={dispatch}
            onOpenExamModal={() => setShowExamModal(true)}
          />
        ))}
      </div>

      <button className="todo-add-memo-btn" onClick={addMemoSection}>
        ＋ 메모 추가
      </button>

      {/* Exam Modal */}
      {showExamModal && (
        <div className="modal-backdrop" onClick={() => setShowExamModal(false)}>
          <div className="modal-panel" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>D-Day 추가</h3>
              <button className="close-btn" onClick={() => setShowExamModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-stack">
                <div className="form-group">
                  <label>제목 *</label>
                  <input
                    type="text"
                    placeholder="예: 중간고사, 방학 시작"
                    value={examForm.title}
                    onChange={e => setExamForm({ ...examForm, title: e.target.value })}
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>날짜 *</label>
                    <input
                      type="date"
                      value={examForm.date}
                      onChange={e => setExamForm({ ...examForm, date: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>종류</label>
                    <select
                      value={examForm.type}
                      onChange={e => setExamForm({ ...examForm, type: e.target.value })}
                    >
                      <option>시험</option>
                      <option>이벤트</option>
                      <option>방학</option>
                      <option>기타</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>메모</label>
                  <textarea
                    placeholder="추가 설명..."
                    value={examForm.memo}
                    onChange={e => setExamForm({ ...examForm, memo: e.target.value })}
                    rows={2}
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowExamModal(false)}>취소</button>
              <button className="btn-primary" onClick={handleAddExam}>✅ 추가</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

// ═══════════════════════════════════════════════
// SECTION RENDERER
// ═══════════════════════════════════════════════
function SectionRenderer({ sec, isOpen, onToggle, todos, transfers, allDdays, students, dispatch, onOpenExamModal }) {
  if (sec.type === 'todo') return <TodoSection sec={sec} isOpen={isOpen} onToggle={onToggle} items={todos} dispatch={dispatch} />;
  if (sec.type === 'transfer') return <TransferSection sec={sec} isOpen={isOpen} onToggle={onToggle} items={transfers} dispatch={dispatch} />;
  if (sec.type === 'dday') return <DdaySection sec={sec} isOpen={isOpen} onToggle={onToggle} allDdays={allDdays} dispatch={dispatch} onOpenExamModal={onOpenExamModal} />;
  if (sec.type === 'report') return <ReportSection sec={sec} isOpen={isOpen} onToggle={onToggle} students={students} dispatch={dispatch} />;
  if (sec.type === 'memo') return <MemoSection sec={sec} isOpen={isOpen} onToggle={onToggle} dispatch={dispatch} />;
  return null;
}

// ═══════════════════════════════════════════════
// TODO SECTION
// ═══════════════════════════════════════════════
function TodoSection({ sec, isOpen, onToggle, items, dispatch }) {
  const [input, setInput] = useState('');
  const pending = items.filter(t => !t.done).length;

  const handleAdd = () => {
    const text = input.trim();
    if (!text) return;
    dispatch({ type: 'ADD_TODO', payload: text });
    setInput('');
  };

  return (
    <div className={`todo-section ${isOpen ? 'open' : ''}`}>
      <div className="todo-sec-header" onClick={onToggle}>
        <span className="todo-sec-icon">{sec.icon}</span>
        <span className="todo-sec-title">{sec.title}</span>
        <span className="todo-sec-badge">{pending}</span>
        <span className="todo-sec-chevron">▼</span>
      </div>
      {isOpen && (
        <div className="todo-sec-body">
          <div className="todo-list">
            {items.length === 0 ? (
              <div className="todo-empty">할 일을 추가해보세요</div>
            ) : (
              items.map(t => (
                <div className="todo-item" key={t.id}>
                  <div
                    className={`todo-check ${t.done ? 'done' : ''}`}
                    onClick={() => dispatch({ type: 'TOGGLE_TODO', payload: t.id })}
                  />
                  <span className={`todo-text ${t.done ? 'done' : ''}`}>{t.text}</span>
                  <span className="todo-del" onClick={() => dispatch({ type: 'DELETE_TODO', payload: t.id })}>×</span>
                </div>
              ))
            )}
          </div>
          <div className="todo-add-row">
            <input
              className="todo-input"
              placeholder="할 일 추가..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
            />
            <button className="todo-add-btn" onClick={handleAdd}>추가</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════
// TRANSFER SECTION
// ═══════════════════════════════════════════════
function TransferSection({ sec, isOpen, onToggle, items, dispatch }) {
  const [input, setInput] = useState('');
  const pending = items.filter(t => !t.done).length;

  const handleAdd = () => {
    const text = input.trim();
    if (!text) return;
    dispatch({ type: 'ADD_TRANSFER', payload: text });
    setInput('');
  };

  return (
    <div className={`todo-section ${isOpen ? 'open' : ''}`}>
      <div className="todo-sec-header" onClick={onToggle}>
        <span className="todo-sec-icon">{sec.icon}</span>
        <span className="todo-sec-title">{sec.title}</span>
        <span className="todo-sec-badge">{pending}</span>
        <span className="todo-sec-chevron">▼</span>
      </div>
      {isOpen && (
        <div className="todo-sec-body">
          <div className="todo-list">
            {items.length === 0 ? (
              <div className="todo-empty">전달사항을 추가해보세요</div>
            ) : (
              items.map(t => (
                <div className="todo-item" key={t.id}>
                  <div
                    className={`todo-check ${t.done ? 'done' : ''}`}
                    onClick={() => dispatch({ type: 'TOGGLE_TRANSFER', payload: t.id })}
                  />
                  <span className={`todo-text ${t.done ? 'done' : ''}`}>{t.text}</span>
                  <span className="todo-del" onClick={() => dispatch({ type: 'DELETE_TRANSFER', payload: t.id })}>×</span>
                </div>
              ))
            )}
          </div>
          <div className="todo-add-row">
            <input
              className="todo-input"
              placeholder="전달사항 추가..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
            />
            <button className="todo-add-btn" onClick={handleAdd}>추가</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════
// D-DAY SECTION
// ═══════════════════════════════════════════════
function DdaySection({ sec, isOpen, onToggle, allDdays, dispatch, onOpenExamModal }) {
  return (
    <div className={`todo-section ${isOpen ? 'open' : ''}`}>
      <div className="todo-sec-header" onClick={onToggle}>
        <span className="todo-sec-icon">{sec.icon}</span>
        <span className="todo-sec-title">{sec.title}</span>
        <span className="todo-sec-badge">{allDdays.length}</span>
        <span className="todo-sec-chevron">▼</span>
      </div>
      {isOpen && (
        <div className="todo-sec-body">
          <div className="dday-list">
            {allDdays.length === 0 ? (
              <div className="todo-empty">시험 일정이 없어요</div>
            ) : (
              allDdays.map(e => (
                <div className="dday-item" key={e.id}>
                  <div className={`dday-badge ${e.badgeClass}`}>
                    <span className="dday-badge-text">{e.badge}</span>
                    <span className="dday-badge-date">
                      {e.date.slice(5).replace('-', '/')}
                    </span>
                  </div>
                  <div className="dday-info">
                    <div className="dday-title">{e.title}</div>
                    {e.memo && <div className="dday-memo">범위: {e.memo}</div>}
                    {e._src === 'school' && (
                      <span className="dday-src-badge">🏫 학교</span>
                    )}
                  </div>
                  {e._src === 'custom' && (
                    <span
                      className="dday-del"
                      onClick={() => dispatch({ type: 'DELETE_EXAM', payload: e.id })}
                    >×</span>
                  )}
                </div>
              ))
            )}
          </div>
          <div className="todo-add-row">
            <button className="todo-add-btn" style={{ width: '100%' }} onClick={onOpenExamModal}>
              ＋ D-Day 추가
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════
// REPORT SECTION
// ═══════════════════════════════════════════════
function ReportSection({ sec, isOpen, onToggle, students, dispatch }) {
  const [search, setSearch] = useState('');

  const filtered = students.filter(s =>
    !search || s.name.includes(search) || s.grade.includes(search) || (s.schoolName || '').includes(search)
  );

  // Group by grade
  const grouped = {};
  filtered.forEach(s => {
    const key = s.grade || '미지정';
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(s);
  });

  // Sort grade keys
  const gradeOrder = Object.keys(grouped).sort((a, b) => {
    const order = (g) => {
      if (g.startsWith('초')) return 10 + parseInt(g.replace(/\D/g, '') || '0');
      if (g.startsWith('중')) return 20 + parseInt(g.replace(/\D/g, '') || '0');
      if (g.startsWith('고')) return 30 + parseInt(g.replace(/\D/g, '') || '0');
      return 99;
    };
    return order(a) - order(b);
  });

  return (
    <div className={`todo-section ${isOpen ? 'open' : ''}`}>
      <div className="todo-sec-header" onClick={onToggle}>
        <span className="todo-sec-icon">{sec.icon}</span>
        <span className="todo-sec-title">{sec.title}</span>
        <span className="todo-sec-badge">{students.length}명</span>
        <span className="todo-sec-chevron">▼</span>
      </div>
      {isOpen && (
        <div className="todo-sec-body">
          <div className="report-toolbar">
            <span className="report-desc">학생을 눌러 프로필/코멘트를 확인하세요</span>
            <div className="report-search">
              <span className="report-search-icon">🔍</span>
              <input
                className="report-search-input"
                placeholder="학생 검색..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              {search && (
                <button className="report-search-clear" onClick={() => setSearch('')}>×</button>
              )}
            </div>
          </div>

          {gradeOrder.length === 0 ? (
            <div className="todo-empty">검색 결과가 없습니다</div>
          ) : (
            gradeOrder.map(grade => (
              <div className="report-grade-group" key={grade}>
                <div className="report-grade-label">
                  <span className="report-grade-text">{grade}</span>
                  <span className="report-grade-count">{grouped[grade].length}명</span>
                </div>
                <div className="report-chips">
                  {grouped[grade].map(s => (
                    <span
                      className="report-chip clickable"
                      key={s.id}
                      onClick={() => dispatch({ type: 'OPEN_STUDENT_PROFILE', payload: s.id })}
                    >
                      <span className="report-chip-avatar" style={{ background: avatarColor(s.name) }}>
                        {s.name[0]}
                      </span>
                      {s.name}
                      <span className="report-chip-school">{s.schoolName || ''}</span>
                    </span>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════
// MEMO SECTION
// ═══════════════════════════════════════════════
function MemoSection({ sec, isOpen, onToggle, dispatch }) {
  const handleDelete = (e) => {
    e.stopPropagation();
    if (confirm('이 메모를 삭제할까요?')) {
      dispatch({ type: 'DELETE_TODO_SECTION', payload: sec.id });
    }
  };

  return (
    <div className={`todo-section ${isOpen ? 'open' : ''}`}>
      <div className="todo-sec-header" onClick={onToggle}>
        <span className="todo-sec-icon">{sec.icon}</span>
        <input
          className="memo-title-input"
          value={sec.title}
          onClick={e => e.stopPropagation()}
          onChange={e => dispatch({
            type: 'UPDATE_TODO_SECTION',
            payload: { id: sec.id, updates: { title: e.target.value } }
          })}
        />
        <span className="memo-del" onClick={handleDelete}>×</span>
        <span className="todo-sec-chevron">▼</span>
      </div>
      {isOpen && (
        <div className="todo-sec-body">
          <div className="memo-area">
            <textarea
              className="memo-textarea"
              placeholder="자유 메모..."
              value={sec.content || ''}
              onChange={e => dispatch({
                type: 'UPDATE_TODO_SECTION',
                payload: { id: sec.id, updates: { content: e.target.value } }
              })}
            />
          </div>
        </div>
      )}
    </div>
  );
}
