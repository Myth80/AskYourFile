export default function Message({ role, text }) {
  const isUser = role === 'user';
  
  return (
    <div className={`message-row ${isUser ? 'user-row' : 'assistant-row'}`}>
      <div className={`message-bubble ${isUser ? 'user-bubble' : 'assistant-bubble'}`}>
        <div className="message-header">
          {isUser ? 'You' : 'AskYourFile'}
        </div>
        <div className="message-content">
          {text}
        </div>
      </div>
    </div>
  );
}