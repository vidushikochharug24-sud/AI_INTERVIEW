import { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import ProblemPanel from './components/ProblemPanel';
import Editor from './components/Editor';
import TestResults from './components/TestResults';
import FeedbackPanel from './components/FeedbackPanel';
import InterviewerChat from './components/InterviewerChat';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const TOPICS = ['arrays', 'linked lists', 'trees', 'graphs', 'dp', 'strings'];
const DIFFICULTIES = ['easy', 'medium', 'hard'];
const COMPANIES = [
  'Google',
  'Amazon',
  'Microsoft',
  'Meta',
  'Apple',
  'Flipkart',
  'Adobe',
  'Goldman Sachs',
];
const STRESS_MODE_LIMITS = {
  easy: 30 * 60,
  medium: 45 * 60,
  hard: 60 * 60,
};

const initialSettings = {
  topic: 'arrays',
  difficulty: 'medium',
  company: 'Google',
};

function getTimeLimitSeconds(difficulty) {
  return STRESS_MODE_LIMITS[difficulty] ?? STRESS_MODE_LIMITS.medium;
}

function formatTime(seconds) {
  const safeSeconds = Math.max(0, seconds);
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = safeSeconds % 60;

  return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`;
}

function getTimerTone(percentRemaining) {
  if (percentRemaining <= 10) {
    return 'critical';
  }

  if (percentRemaining <= 20) {
    return 'danger';
  }

  if (percentRemaining <= 50) {
    return 'warning';
  }

  return 'normal';
}

function App() {
  const [settings, setSettings] = useState(initialSettings);
  const [currentProblem, setCurrentProblem] = useState(null);
  const [code, setCode] = useState('');
  const [testResults, setTestResults] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [problemLoading, setProblemLoading] = useState(false);
  const [runLoading, setRunLoading] = useState(false);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [problemError, setProblemError] = useState('');
  const [runError, setRunError] = useState('');
  const [feedbackError, setFeedbackError] = useState('');
  const [conversationHistory, setConversationHistory] = useState([]);
  const [stressModeEnabled, setStressModeEnabled] = useState(false);
  const [stressSessionActive, setStressSessionActive] = useState(false);
  const [timeLimitSeconds, setTimeLimitSeconds] = useState(getTimeLimitSeconds(initialSettings.difficulty));
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState(
    getTimeLimitSeconds(initialSettings.difficulty),
  );
  const [toasts, setToasts] = useState([]);
  const [timeUpOpen, setTimeUpOpen] = useState(false);

  const timerRef = useRef(null);
  const toastIdRef = useRef(1);
  const toastTimeoutsRef = useRef(new Map());
  const triggeredMilestonesRef = useRef({
    half: false,
    twenty: false,
    ten: false,
    zero: false,
  });

  const hasRunResults = useMemo(() => Boolean(testResults?.results?.length), [testResults]);
  const currentLimitSeconds = currentProblem
    ? getTimeLimitSeconds(currentProblem.difficulty || settings.difficulty)
    : getTimeLimitSeconds(settings.difficulty);
  const remainingForDisplay = stressModeEnabled
    ? stressSessionActive
      ? timeRemainingSeconds
      : currentLimitSeconds
    : 0;
  const progressPercent =
    stressModeEnabled && currentLimitSeconds > 0
      ? Math.max(0, Math.min(100, (remainingForDisplay / currentLimitSeconds) * 100))
      : 0;
  const timerTone = getTimerTone(progressPercent);

  const clearToastTimers = () => {
    toastTimeoutsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
    toastTimeoutsRef.current.clear();
  };

  const resetStressNotifications = () => {
    clearToastTimers();
    setToasts([]);
    triggeredMilestonesRef.current = {
      half: false,
      twenty: false,
      ten: false,
      zero: false,
    };
  };

  const addToast = (message) => {
    const id = toastIdRef.current;
    toastIdRef.current += 1;

    setToasts((previous) => [...previous, { id, message }]);

    const timeoutId = window.setTimeout(() => {
      setToasts((previous) => previous.filter((toast) => toast.id !== id));
      toastTimeoutsRef.current.delete(id);
    }, 6000);

    toastTimeoutsRef.current.set(id, timeoutId);
  };

  const updateSettings = (field, value) => {
    setSettings((previous) => ({ ...previous, [field]: value }));
  };

  const getProblem = async () => {
    setProblemLoading(true);
    setProblemError('');
    setRunError('');
    setFeedbackError('');
    setTestResults(null);
    setFeedback(null);
    setConversationHistory([]);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/problem`, {
        topic: settings.topic,
        difficulty: settings.difficulty,
        company: settings.company,
      });

      setCurrentProblem(response.data);
      setCode(response.data?.starter_code || '');
    } catch (error) {
      setProblemError(
        error?.response?.data?.error || error?.message || 'Failed to fetch problem.',
      );
    } finally {
      setProblemLoading(false);
    }
  };

  const runCode = async () => {
    if (!currentProblem) {
      setRunError('Fetch a problem first.');
      return;
    }

    setRunLoading(true);
    setRunError('');
    setFeedback(null);
    setFeedbackError('');
    setConversationHistory([]);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/run`, {
        code,
        language: 'python',
        test_cases: currentProblem.test_cases || [],
      });

      setTestResults(response.data);
    } catch (error) {
      setRunError(error?.response?.data?.error || error?.message || 'Failed to run code.');
      setTestResults(null);
    } finally {
      setRunLoading(false);
    }
  };

  const getFeedback = async ({ force = false } = {}) => {
    if (!currentProblem || (!hasRunResults && !force)) {
      setFeedbackError('Run the code before requesting feedback.');
      return;
    }

    setFeedbackLoading(true);
    setFeedbackError('');

    try {
      const response = await axios.post(`${API_BASE_URL}/api/feedback`, {
        problem: currentProblem,
        code,
        test_results: testResults?.results || [],
      });

      setFeedback(response.data?.feedback || null);
      setConversationHistory([]);
    } catch (error) {
      setFeedbackError(
        error?.response?.data?.error || error?.message || 'Failed to get feedback.',
      );
    } finally {
      setFeedbackLoading(false);
    }
  };

  const seeFeedbackFromTimeout = async () => {
    setTimeUpOpen(false);
    await getFeedback({ force: true });
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }

      clearToastTimers();
    };
  }, []);

  useEffect(() => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (!currentProblem || !stressModeEnabled) {
      setStressSessionActive(false);
      setTimeUpOpen(false);
      resetStressNotifications();
      return undefined;
    }

    const nextLimitSeconds = getTimeLimitSeconds(currentProblem.difficulty || settings.difficulty);
    setTimeLimitSeconds(nextLimitSeconds);
    setTimeRemainingSeconds(nextLimitSeconds);
    setStressSessionActive(true);
    setTimeUpOpen(false);
    resetStressNotifications();

    timerRef.current = window.setInterval(() => {
      setTimeRemainingSeconds((previous) => Math.max(0, previous - 1));
    }, 1000);

    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [currentProblem, stressModeEnabled]);

  useEffect(() => {
    if (!currentProblem || !stressModeEnabled || !stressSessionActive) {
      return;
    }

    const halfThreshold = Math.ceil(timeLimitSeconds * 0.5);
    const twentyThreshold = Math.ceil(timeLimitSeconds * 0.2);
    const tenThreshold = Math.ceil(timeLimitSeconds * 0.1);

    if (timeRemainingSeconds <= halfThreshold && !triggeredMilestonesRef.current.half) {
      addToast("You're halfway through. Have you identified your approach yet?");
      triggeredMilestonesRef.current.half = true;
    }

    if (timeRemainingSeconds <= twentyThreshold && !triggeredMilestonesRef.current.twenty) {
      const minutesLeft = Math.max(0, Math.ceil(timeRemainingSeconds / 60));
      addToast(
        `Only ${minutesLeft} minutes left. Focus on getting a working solution first, optimize later.`,
      );
      triggeredMilestonesRef.current.twenty = true;
    }

    if (timeRemainingSeconds <= tenThreshold && !triggeredMilestonesRef.current.ten) {
      addToast("Final stretch! If you haven't started coding, write brute force now.");
      triggeredMilestonesRef.current.ten = true;
    }

    if (timeRemainingSeconds === 0 && !triggeredMilestonesRef.current.zero) {
      triggeredMilestonesRef.current.zero = true;
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setStressSessionActive(false);
      setTimeUpOpen(true);
    }
  }, [currentProblem, stressModeEnabled, stressSessionActive, timeLimitSeconds, timeRemainingSeconds]);

  useEffect(() => {
    if (!feedback) {
      setConversationHistory([]);
    }
  }, [feedback]);

  return (
    <div className="app-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <div className={`stress-hud ${stressModeEnabled ? `tone-${timerTone}` : 'inactive'}`}>
        <div className="stress-hud-topline">
          <span>Stress Mode</span>
          <strong>{stressModeEnabled ? formatTime(remainingForDisplay) : 'OFF'}</strong>
        </div>
        <p className="stress-hud-subtext">
          {stressModeEnabled
            ? stressSessionActive
              ? 'Timer running'
              : currentProblem
                ? 'Waiting to resume'
                : 'Enable a problem to begin'
            : 'Disabled'}
        </p>
        <div className="stress-hud-bar">
          <div
            className={`stress-hud-fill ${stressModeEnabled ? `tone-${timerTone}` : 'off'}`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <header className="topbar">
        <div>
          <p className="eyebrow">AI Interview Simulator</p>
          <h1>Practice coding rounds with live evaluation</h1>
          <p className="subtitle">
            Pick a topic and difficulty, solve the problem, run test cases, and review interviewer-style feedback.
          </p>
        </div>
      </header>

      <main className="workspace">
        <section className="control-card">
          <div className="control-row">
            <label>
              <span>Topic</span>
              <select
                value={settings.topic}
                onChange={(event) => updateSettings('topic', event.target.value)}
              >
                {TOPICS.map((topic) => (
                  <option key={topic} value={topic}>
                    {topic}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span>Difficulty</span>
              <select
                value={settings.difficulty}
                onChange={(event) => updateSettings('difficulty', event.target.value)}
              >
                {DIFFICULTIES.map((difficulty) => (
                  <option key={difficulty} value={difficulty}>
                    {difficulty}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span>Company</span>
              <select
                value={settings.company}
                onChange={(event) => updateSettings('company', event.target.value)}
              >
                {COMPANIES.map((company) => (
                  <option key={company} value={company}>
                    {company}
                  </option>
                ))}
              </select>
            </label>

            <button
              type="button"
              className={`toggle-button ${stressModeEnabled ? 'active' : ''}`}
              onClick={() => setStressModeEnabled((previous) => !previous)}
              aria-pressed={stressModeEnabled}
            >
              <span className="toggle-label">Stress Mode</span>
              <strong>{stressModeEnabled ? 'On' : 'Off'}</strong>
            </button>

            <button className="primary-button" onClick={getProblem} disabled={problemLoading}>
              {problemLoading ? <span className="spinner" aria-hidden="true" /> : null}
              <span>{problemLoading ? 'Getting Problem' : 'Get Problem'}</span>
            </button>
          </div>

          {problemError ? <p className="error-banner">{problemError}</p> : null}
        </section>

        <section className="split-layout">
          <div className="panel panel-left">
            <ProblemPanel problem={currentProblem} loading={problemLoading} />
          </div>

          <div className="panel panel-right">
            <Editor
              code={code}
              setCode={setCode}
              loading={problemLoading}
              runLoading={runLoading}
              feedbackLoading={feedbackLoading}
              onRunCode={runCode}
              onGetFeedback={() => getFeedback()}
              feedbackEnabled={hasRunResults}
            />

            {runError ? <p className="error-banner inline-error">{runError}</p> : null}
            {feedbackError ? <p className="error-banner inline-error">{feedbackError}</p> : null}

            <TestResults testResults={testResults} loading={runLoading} />
            <FeedbackPanel feedback={feedback} loading={feedbackLoading} />
            {feedback ? (
              <InterviewerChat
                apiBaseUrl={API_BASE_URL}
                problem={currentProblem}
                code={code}
                feedback={feedback}
                conversationHistory={conversationHistory}
                setConversationHistory={setConversationHistory}
              />
            ) : null}
          </div>
        </section>
      </main>

      {toasts.length > 0 ? (
        <div className="toast-stack" aria-live="polite" aria-label="Stress mode notifications">
          {toasts.map((toast) => (
            <article className="toast-card" key={toast.id}>
              <span className="toast-avatar" aria-hidden="true">
                👨‍💼
              </span>
              <p>{toast.message}</p>
            </article>
          ))}
        </div>
      ) : null}

      {timeUpOpen ? (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="time-up-title">
          <div className="modal-card">
            <div className="modal-icon" aria-hidden="true">
              ⏰
            </div>
            <h2 id="time-up-title">Time's Up!</h2>
            <p>You ran out of time.</p>
            <div className="modal-actions">
              <button className="secondary-button" onClick={() => setTimeUpOpen(false)}>
                Submit Anyway
              </button>
              <button className="primary-button" onClick={seeFeedbackFromTimeout} disabled={feedbackLoading}>
                {feedbackLoading ? <span className="spinner" aria-hidden="true" /> : null}
                <span>{feedbackLoading ? 'Getting Feedback' : 'See Feedback'}</span>
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default App;
