import { useEffect, useRef, useState } from 'react';
import axios from 'axios';

function InterviewerChat({
  apiBaseUrl,
  problem,
  code,
  feedback,
  conversationHistory,
  setConversationHistory,
}) {
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollAnchorRef = useRef(null);
  const initializedRef = useRef(false);

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      scrollAnchorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    });
  };

  const sendMessage = async (userMessage, isInitialMessage = false) => {
    if (!problem || !code) {
      return;
    }

    setIsTyping(true);

    try {
      const historyForRequest = conversationHistory;

      const response = await axios.post(`${apiBaseUrl}/api/chat`, {
        problem: {
          title: problem.title,
          description: problem.description,
        },
        code,
        conversation_history: historyForRequest,
        user_message: userMessage,
      });

      const assistantMessage = response.data?.response || '';
      const nextHistory = [];

      if (!isInitialMessage && userMessage) {
        nextHistory.push({ role: 'user', content: userMessage });
      }

      nextHistory.push({ role: 'assistant', content: assistantMessage });

      setConversationHistory((previous) => [...previous, ...nextHistory]);
    } catch (error) {
      setConversationHistory((previous) => [
        ...previous,
        {
          role: 'assistant',
          content: error?.response?.data?.error || error?.message || 'Failed to load interviewer response.',
        },
      ]);
    } finally {
      setIsTyping(false);
      scrollToBottom();
    }
  };

  useEffect(() => {
    if (!feedback) {
      initializedRef.current = false;
      setInputValue('');
      return;
    }

    if (conversationHistory.length === 0 && !initializedRef.current) {
      initializedRef.current = true;
      void sendMessage('', true);
    }
  }, [feedback, conversationHistory.length]);

  useEffect(() => {
    scrollToBottom();
  }, [conversationHistory, isTyping]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const message = inputValue.trim();

    if (!message || isTyping) {
      return;
    }

    setInputValue('');
    await sendMessage(message, false);
  };

  return (
    <section className="interviewer-chat-section">
      <div className="section-header chat-header">
        <h3>
          <span className="chat-title-icon" aria-hidden="true">
            👨‍💼
          </span>
          Follow-up Discussion
        </h3>
      </div>

      <div className="chat-window">
        {conversationHistory.map((message, index) => (
          <div
            className={`chat-row ${message.role === 'user' ? 'user' : 'assistant'}`}
            key={`${message.role}-${index}`}
          >
            {message.role === 'assistant' ? (
              <>
                <div className="chat-avatar" aria-hidden="true">
                  👨‍💼
                </div>
                <div className="chat-bubble assistant-bubble">{message.content}</div>
              </>
            ) : (
              <div className="chat-bubble user-bubble">{message.content}</div>
            )}
          </div>
        ))}

        {isTyping ? (
          <div className="chat-row assistant typing-row">
            <div className="chat-avatar" aria-hidden="true">
              👨‍💼
            </div>
            <div className="chat-bubble assistant-bubble typing-bubble">
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
            </div>
          </div>
        ) : null}

        <div ref={scrollAnchorRef} />
      </div>

      <form className="chat-input-row" onSubmit={handleSubmit}>
        <input
          type="text"
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          placeholder="Respond to the interviewer..."
          disabled={isTyping}
        />
        <button className="primary-button" type="submit" disabled={isTyping || !inputValue.trim()}>
          <span>{isTyping ? 'Sending' : 'Send'}</span>
        </button>
      </form>
    </section>
  );
}

export default InterviewerChat;
