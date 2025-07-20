import React, { useState } from 'react';
import '../styles/Chatbot.css';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hi there! How can I assist you today?' }
  ]);
  const [input, setInput] = useState('');

  const handleToggle = () => setIsOpen(!isOpen);

  const handleSend = () => {
    if (input.trim() === '') return;

    const newMessages = [...messages, { sender: 'user', text: input }];

    // Hardcoded bot responses
    let botReply = "I'm not sure how to respond to that.";
    if (/course|enroll/i.test(input)) botReply = 'You can check out available courses from the "Courses" page!';
    else if (/task/i.test(input)) botReply = 'Tasks are assigned per course. Check your dashboard for progress.';
    else if (/certificate/i.test(input)) botReply = 'Certificates will be available after all tasks are completed.';

    newMessages.push({ sender: 'bot', text: botReply });

    setMessages(newMessages);
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <div className="chatbot-container">
      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">🛰 FlightBot</div>
          <div className="chatbot-body">
            {messages.map((msg, idx) => (
              <div key={idx} className={`chatbot-msg ${msg.sender}`}>
                {msg.text}
              </div>
            ))}
          </div>
          <div className="chatbot-input">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
            />
            <button onClick={handleSend}>➤</button>
          </div>
        </div>
      )}

      <button className="chatbot-toggle" onClick={handleToggle}>
        💬
      </button>
    </div>
  );
};

export default Chatbot;
