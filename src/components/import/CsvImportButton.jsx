import { parseCsvText } from '../../utils/csv';
import { useAppStore } from '../../store/app-store';

export default function CsvImportButton() {
  const { dispatch } = useAppStore();

  async function handleFileChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = parseCsvText(text);

      dispatch({
        type: 'OPEN_CSV_PREVIEW',
        payload: parsed
      });
    } catch (err) {
      console.error('File read error:', err);
      alert('파일을 읽는 중 오류가 발생했습니다.');
    }

    event.target.value = '';
  }

  return (
    <label className="csv-upload-button">
      <span className="upload-icon">📥</span>
      <span className="upload-label">CSV 업로드</span>
      <input type="file" accept=".csv,text/csv" hidden onChange={handleFileChange} />
    </label>
  );
}
