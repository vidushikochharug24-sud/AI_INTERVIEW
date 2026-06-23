function renderList(items, emptyLabel) {
  if (!items || items.length === 0) {
    return <p className="muted">{emptyLabel}</p>;
  }

  return (
    <ul className="info-list">
      {items.map((item, index) => (
        <li key={`${item}-${index}`}>{item}</li>
      ))}
    </ul>
  );
}

function ProblemPanel({ problem, loading }) {
  if (loading && !problem) {
    return (
      <div className="panel-body loading-state">
        <span className="spinner" aria-hidden="true" />
        <p>Loading problem...</p>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="panel-body empty-state">
        <div className="empty-icon">{'</>'}</div>
        <h2>Problem statement</h2>
        <p>Select a topic and difficulty, then fetch a coding interview question.</p>
      </div>
    );
  }

  return (
    <div className="panel-body problem-content">
      <div className="problem-header">
        <div>
          <span className="problem-tag">{problem.topic}</span>
          <span className="problem-tag muted-tag">{problem.difficulty}</span>
        </div>
        <h2>{problem.title}</h2>
      </div>

      <section>
        <h3>Description</h3>
        <p className="description-text">{problem.description}</p>
      </section>

      <section>
        <h3>Examples</h3>
        <div className="example-grid">
          {problem.examples?.map((example, index) => (
            <article className="example-card" key={`${example.input}-${index}`}>
              <div>
                <span className="example-label">Input</span>
                <pre>{example.input}</pre>
              </div>
              <div>
                <span className="example-label">Output</span>
                <pre>{example.output}</pre>
              </div>
              <div>
                <span className="example-label">Explanation</span>
                <p>{example.explanation}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h3>Constraints</h3>
        {renderList(problem.constraints, 'No constraints provided.')}
      </section>

      <section>
        <h3>Hints</h3>
        {renderList(problem.hints, 'No hints available.')}
      </section>

      <section>
        <h3>Test Cases</h3>
        <div className="testcase-list">
          {problem.test_cases?.map((testCase, index) => (
            <div className="testcase-card" key={`${testCase.input}-${index}`}>
              <code>{testCase.input}</code>
              <span>Expected: {testCase.expected}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default ProblemPanel;
