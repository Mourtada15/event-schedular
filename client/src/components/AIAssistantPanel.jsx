import { useState } from 'react';
import api from '../api/axios.js';
import { useToast } from '../context/ToastContext.jsx';

export default function AIAssistantPanel({ form, setForm }) {
  const toast = useToast();
  const [loadingAction, setLoadingAction] = useState('');
  const [agendaInput, setAgendaInput] = useState({ attendeesCount: '' });
  const [suggestions, setSuggestions] = useState(null);
  const [conflictSummary, setConflictSummary] = useState('');
  const hasTitle = (form.title || '').trim().length >= 2;
  const hasValidDateRange =
    Boolean(form.startAt && form.endAt) && new Date(form.endAt).getTime() > new Date(form.startAt).getTime();

  async function runAction(name, call) {
    setLoadingAction(name);
    try {
      await call();
    } catch (error) {
      const fieldErrors = error.response?.data?.error?.details?.fieldErrors;
      const firstFieldError = fieldErrors
        ? Object.values(fieldErrors).flat().find(Boolean)
        : null;
      toast.error(firstFieldError || error.response?.data?.error?.message || 'AI request failed');
    } finally {
      setLoadingAction('');
    }
  }

  return (
    <aside className="event-ai-panel">
      <div className="event-ai-header">
        <p className="event-ai-eyebrow">ASSISTANT</p>
        <h2>AI Copilot</h2>
        <p>Draft descriptions, agendas, location ideas, and conflict summaries.</p>
      </div>

      <div className="event-ai-body">
        <section className="event-ai-block">
          <p className="event-ai-block-title">Improve Description</p>
          <button
            className="btn event-ai-btn"
            disabled={loadingAction === 'improve' || !hasTitle}
            title={!hasTitle ? 'Enter a title (at least 2 characters) first' : ''}
            onClick={() =>
              runAction('improve', async () => {
                const res = await api.post('/ai/improve-description', {
                  title: form.title,
                  description: form.description
                });
                setForm((prev) => ({ ...prev, description: res.data.data.text }));
                toast.success(`Description improved (${res.data.data.provider})`);
              })
            }
          >
            {loadingAction === 'improve' ? 'Working...' : 'Improve Description'}
          </button>
        </section>

        <section className="event-ai-block">
          <p className="event-ai-block-title">Generate Agenda</p>
          <label className="event-ai-label">Attendees count (optional)</label>
          <input
            className="form-control form-control-sm event-ai-input"
            type="number"
            min="1"
            value={agendaInput.attendeesCount}
            onChange={(e) => setAgendaInput({ attendeesCount: e.target.value })}
          />
          <button
            className="btn event-ai-btn"
            disabled={loadingAction === 'agenda' || !hasTitle || !hasValidDateRange}
            title={!hasTitle ? 'Enter a title first' : !hasValidDateRange ? 'Set a valid start/end time first' : ''}
            onClick={() =>
              runAction('agenda', async () => {
                const res = await api.post('/ai/generate-agenda', {
                  title: form.title,
                  startAt: form.startAt,
                  endAt: form.endAt,
                  attendeesCount: agendaInput.attendeesCount || undefined
                });
                setForm((prev) => ({
                  ...prev,
                  description: `${prev.description || ''}\n\nAgenda:\n${res.data.data.agenda}`.trim()
                }));
                toast.success(`Agenda generated (${res.data.data.provider})`);
              })
            }
          >
            {loadingAction === 'agenda' ? 'Working...' : 'Generate Agenda'}
          </button>
        </section>

        <section className="event-ai-block">
          <p className="event-ai-block-title">Smart Suggestions</p>
          <button
            className="btn event-ai-btn"
            disabled={loadingAction === 'suggest' || !hasTitle}
            title={!hasTitle ? 'Enter a title (at least 2 characters) first' : ''}
            onClick={() =>
              runAction('suggest', async () => {
                const res = await api.post('/ai/smart-suggestions', {
                  title: form.title,
                  location: form.location,
                  description: form.description
                });
                setSuggestions(res.data.data);
                toast.success(`Suggestions ready (${res.data.data.provider})`);
              })
            }
          >
            {loadingAction === 'suggest' ? 'Working...' : 'Smart Suggestions'}
          </button>

          {suggestions && (
            <div className="event-ai-results">
              <div className="event-ai-result-title">Location Ideas</div>
              <ul className="event-ai-list">
                {suggestions.locationIdeas.map((idea) => (
                  <li key={idea}>{idea}</li>
                ))}
              </ul>
              <div className="event-ai-result-title">Reminder Plan</div>
              <ul className="event-ai-list event-ai-list-compact">
                {suggestions.reminders.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </section>

        <section className="event-ai-block">
          <p className="event-ai-block-title">Conflict Check</p>
          <button
            className="btn event-ai-btn"
            disabled={loadingAction === 'conflict' || !hasValidDateRange}
            title={!hasValidDateRange ? 'Set a valid start/end time first' : ''}
            onClick={() =>
              runAction('conflict', async () => {
                const res = await api.post('/ai/conflict-check', {
                  startAt: form.startAt,
                  endAt: form.endAt
                });
                setConflictSummary(res.data.data.summary);
                toast.info(`Conflict check done (${res.data.data.provider})`);
              })
            }
          >
            {loadingAction === 'conflict' ? 'Working...' : 'Conflict Check'}
          </button>
          {!hasTitle || !hasValidDateRange ? (
            <div className="event-ai-note">
              {!hasTitle ? 'AI tools require a title (min 2 characters).' : null}
              {!hasTitle && !hasValidDateRange ? ' ' : null}
              {!hasValidDateRange ? 'Agenda/conflict checks also require a valid start and end time.' : null}
            </div>
          ) : null}
          {conflictSummary ? <pre className="event-ai-summary">{conflictSummary}</pre> : null}
        </section>
      </div>
    </aside>
  );
}
