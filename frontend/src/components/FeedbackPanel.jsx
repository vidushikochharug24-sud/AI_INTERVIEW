const SCORE_LABELS = {
  problem_understanding: 'Problem Understanding',
  approach: 'Approach',
  code_quality: 'Code Quality',
  optimization_awareness: 'Optimization Awareness',
  communication: 'Communication',
  overall: 'Overall',
};

function getScoreTone(score) {
  if (score > 7) {
    return 'good';
  }

  if (score >= 5) {
    return 'medium';
  }

  return 'bad';
}

function FeedbackPanel({ feedback, loading }) {
  const scores = feedback?.scores || {};
  const strengths = feedback?.strengths || [];
  const improvements = feedback?.improvements || [];

  return (
    <section className="feedback-section">
      <div className="section-header">
        <h3>Interviewer Feedback</h3>
      </div>

      {loading ? (
        <div className="loading-state compact">
          <span className="spinner" aria-hidden="true" />
          <p>Preparing feedback...</p>
        </div>
      ) : feedback ? (
        <div className="feedback-stack">
          <div className={`hire-badge ${String(feedback.hire_signal || '').toLowerCase().replace(/\s+/g, '-')}`}>
            {feedback.hire_signal || 'No Signal'}
          </div>

          <div className="scorecard-grid">
            {Object.entries(SCORE_LABELS).map(([key, label]) => {
              const score = Number(scores[key] ?? 0);

              return (
                <div className="score-row" key={key}>
                  <div className="score-row-header">
                    <span>{label}</span>
                    <strong>{score || '—'}</strong>
                  </div>
                  <div className="score-track" aria-hidden="true">
                    <div className={`score-fill ${getScoreTone(score)}`} style={{ width: `${Math.max(0, Math.min(score, 10)) * 10}%` }} />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="feedback-card">
            <p className="summary-text">{feedback.summary}</p>
          </div>

          <div className="feedback-columns">
            <div className="feedback-card strengths-card">
              <h4>Strengths</h4>
              <ul>
                {strengths.map((item, index) => (
                  <li key={`${item}-${index}`}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="feedback-card improvements-card">
              <h4>Improvements</h4>
              <ul>
                {improvements.map((item, index) => (
                  <li key={`${item}-${index}`}>{item}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="feedback-card optimal-card">
            <h4>Optimal Approach</h4>
            <p>{feedback.optimal_approach}</p>
          </div>
        </div>
      ) : (
        <p className="muted">Run the solution and request feedback to get an interviewer-style review.</p>
      )}
    </section>
  );
}

export default FeedbackPanel;
