import { useEffect, useRef, useState } from 'react';

function VoiceExplanationPanel({
  supported,
  transcript,
  setTranscript,
  submitted,
  submitting,
  onSubmitExplanation,
}) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordError, setRecordError] = useState('');
  const recognitionRef = useRef(null);

  const stopRecording = () => {
    const recognition = recognitionRef.current;

    if (recognition) {
      recognition.stop();
    }
  };

  const startRecording = async () => {
    if (!supported) {
      setRecordError('Voice mode requires Chrome browser.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setRecordError('Voice mode requires Chrome browser.');
      return;
    }

    setRecordError('');

    if (!recognitionRef.current) {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onresult = (event) => {
        const nextTranscript = Array.from(event.results)
          .map((result) => result[0]?.transcript || '')
          .join('')
          .trim();

        setTranscript(nextTranscript);
      };

      recognition.onerror = () => {
        setRecordError('Microphone access failed. Please try again.');
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }

    setTranscript('');
    setIsRecording(true);

    try {
      recognitionRef.current.start();
    } catch (error) {
      setIsRecording(false);
      setRecordError(error?.message || 'Could not start voice recording.');
    }
  };

  const toggleRecording = () => {
    if (submitted || submitting) {
      return;
    }

    if (isRecording) {
      stopRecording();
      return;
    }

    void startRecording();
  };

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
      recognitionRef.current = null;
    };
  }, []);

  return (
    <section className="voice-explanation-section">
      <div className="section-header">
        <h3>Explain Your Approach</h3>
      </div>

      {!supported ? <p className="voice-warning">Voice mode requires Chrome browser</p> : null}

      <div className="voice-card">
        <button
          type="button"
          className={`voice-mic-button ${isRecording ? 'recording' : submitted ? 'done' : ''}`}
          onClick={toggleRecording}
          disabled={submitting || submitted || !supported}
          aria-pressed={isRecording}
        >
          <span className="voice-mic-ring" aria-hidden="true" />
          <span className="voice-mic-icon" aria-hidden="true">
            🎤
          </span>
        </button>

        <p className="voice-state-label">
          {submitted
            ? 'Explanation submitted'
            : isRecording
              ? 'Listening...'
              : 'Click to speak'}
        </p>

        {recordError ? <p className="voice-warning error">{recordError}</p> : null}

        <div className="voice-transcript-box">
          {transcript ? (
            <p className="voice-transcript">{transcript}</p>
          ) : (
            <p className="voice-transcript placeholder">
              Your transcript will appear here as you speak.
            </p>
          )}
        </div>

        {!submitted && transcript && !isRecording ? (
          <button
            type="button"
            className="primary-button voice-submit-button"
            onClick={() => onSubmitExplanation(transcript)}
            disabled={submitting}
          >
            {submitting ? <span className="spinner" aria-hidden="true" /> : null}
            <span>{submitting ? 'Submitting' : 'Submit Explanation'}</span>
          </button>
        ) : null}
      </div>
    </section>
  );
}

export default VoiceExplanationPanel;