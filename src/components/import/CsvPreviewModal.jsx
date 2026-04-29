import { useAppStore } from '../../store/app-store';

export default function CsvPreviewModal() {
  const { state, dispatch } = useAppStore();

  if (!state.ui.showCsvPreview) {
    return null;
  }

  return (
    <div className="modal-backdrop">
      <div className="modal-panel modal-panel--wide glass">
        <div className="modal-header">
          <h3>CSV 가져오기 미리보기</h3>
          <button className="close-btn" onClick={() => dispatch({ type: 'CLOSE_CSV_PREVIEW' })}>×</button>
        </div>

        <div className="modal-body">
          <div className="preview-summary">
            <div className="summary-item success">
              <span className="summary-count">{state.csvPreviewRows.length}</span>
              <span className="summary-label">정상 데이터</span>
            </div>
            {state.csvPreviewErrors.length > 0 && (
              <div className="summary-item danger">
                <span className="summary-count">{state.csvPreviewErrors.length}</span>
                <span className="summary-label">오류 발생</span>
              </div>
            )}
          </div>

          {state.csvPreviewErrors.length > 0 && (
            <div className="error-scroll-box">
              {state.csvPreviewErrors.map((error, idx) => (
                <div key={idx} className="error-line">{error}</div>
              ))}
            </div>
          )}

          <div className="preview-table-container">
            <table className="preview-table">
              <thead>
                <tr>
                  <th>날짜</th>
                  <th>시간</th>
                  <th>수업명</th>
                  <th>과목</th>
                  <th>학교</th>
                  <th>학생</th>
                </tr>
              </thead>
              <tbody>
                {state.csvPreviewRows.map((row) => (
                  <tr key={row.id}>
                    <td>{row.date}</td>
                    <td><span className="badge-time">{row.startTime}</span></td>
                    <td><strong>{row.className}</strong></td>
                    <td><span className="badge-type">{row.subjectType}</span></td>
                    <td>{row.schoolName} {row.grade}</td>
                    <td>
                      <div className="preview-student-list">
                        {row.studentNames.map((n, i) => (
                          <span key={i} className="preview-student-chip">{n}</span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={() => dispatch({ type: 'CLOSE_CSV_PREVIEW' })}>취소</button>
          <button
            className="btn-primary"
            disabled={state.csvPreviewRows.length === 0}
            onClick={() => dispatch({ type: 'IMPORT_CSV_ROWS', payload: state.csvPreviewRows })}
          >
            데이터 추가하기
          </button>
        </div>
      </div>
    </div>
  );
}
