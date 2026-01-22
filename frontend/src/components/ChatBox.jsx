import { useState } from 'react';
import { askQuestion } from '../services/api';
import Message from './Message';

export default function ChatBox() {
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState('');

  const sendQuestion = async () => {
    if (!question) return;

    setMessages([...messages, { role: 'user', text: question }]);
    const res = await askQuestion(question);

    setMessages((prev) => [
      ...prev,
      { role: 'assistant', text: res.answer }
    ]);

    setQuestion('');
  };

  return (
    <div className="chat-container">
      {/* Message Display Area */}
      <div className="message-list">
        {messages.length === 0 ? (
          <div className="empty-state">
            <h2>How can I help you today?</h2>
          </div>
        ) : (
          messages.map((m, i) => (
            <Message key={i} role={m.role} text={m.text} />
          ))
        )}
      </div>

      {/* Input Area */}
      <div className="input-wrapper">
        <div className="input-group">
          <input
            className="chat-input"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask something..."
            onKeyDown={(e) => e.key === 'Enter' && sendQuestion()}
          />
          <button className="send-button" onClick={sendQuestion}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}