function TestResults({ testResults, loading }) {
  if (loading && !testResults) {
    return (
      <section className="results-section">
        <div className="section-header">
          <h3>Test Results</h3>
        </div>
        <div className="loading-state compact">
          <span className="spinner" aria-hidden="true" />
          <p>Running tests...</p>
        </div>
      </section>
    );
  }

  if (!testResults) {
    return (
      <section className="results-section empty-section">
        <div className="section-header">
          <h3>Test Results</h3>
        </div>
        <p className="muted">Run your code to see pass or fail status for each case.</p>
      </section>
    );
  }

  const { results = [], passed = 0, total = 0 } = testResults;

  return (
    <section className="results-section">
      <div className="section-header">
        <h3>Test Results</h3>
        <span className="result-summary">
          {passed}/{total} passed
        </span>
      </div>

      <div className="result-list">
        {results.map((result, index) => (
          <article className={`result-card ${result.passed ? 'pass' : 'fail'}`} key={`${result.input}-${index}`}>
            <div className="result-card-header">
              <strong>{result.passed ? 'Passed' : 'Failed'}</strong>
              <span>{result.input}</span>
            </div>
            <div className="result-grid">
              <div>
                <label>Expected</label>
                <p>{result.expected}</p>
              </div>
              <div>
                <label>Actual</label>
                <p>{result.actual ?? 'No output'}</p>
              </div>
            </div>
            {result.error ? <p className="result-error">{result.error}</p> : null}
          </article>
        ))}
      </div>
    </section>
  );
}

export default TestResults;
