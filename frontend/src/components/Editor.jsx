import EditorPane from '@monaco-editor/react';

function Editor({
  code,
  setCode,
  loading,
  runLoading,
  feedbackLoading,
  onRunCode,
  onGetFeedback,
  feedbackEnabled,
  locked,
}) {
  return (
    <div className="editor-section">
      <div className="editor-toolbar">
        <div>
          <p className="eyebrow small">Python editor</p>
          <h2>Write your solution</h2>
        </div>
        <div className="toolbar-actions">
          <button
            className="secondary-button"
            onClick={onRunCode}
            disabled={loading || runLoading || locked}
          >
            {runLoading ? <span className="spinner" aria-hidden="true" /> : null}
            <span>{runLoading ? 'Running' : 'Run Code'}</span>
          </button>
          <button
            className="primary-button"
            onClick={onGetFeedback}
            disabled={loading || feedbackLoading || !feedbackEnabled || locked}
          >
            {feedbackLoading ? <span className="spinner" aria-hidden="true" /> : null}
            <span>{feedbackLoading ? 'Getting Feedback' : 'Get Feedback'}</span>
          </button>
        </div>
      </div>

      {locked ? <p className="voice-lock-note">Explain your approach verbally to unlock coding.</p> : null}

      <div className="editor-frame">
        <EditorPane
          height="460px"
          theme="vs-dark"
          language="python"
          value={code}
          onChange={(value) => setCode(value ?? '')}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            wordWrap: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            padding: { top: 16, bottom: 16 },
            tabSize: 4,
            readOnly: loading || locked,
          }}
          loading={<div className="editor-loading">Loading editor...</div>}
        />
      </div>
    </div>
  );
}

export default Editor;
