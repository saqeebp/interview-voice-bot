import React, { useState, useRef, useEffect } from 'react';
import './VoiceBot.css';

const VoiceBot = () => {
  const [isListening, setIsListening] = useState(false);
  const [conversation, setConversation] = useState([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser doesn't support speech recognition. Please use Chrome or Edge.");
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;
    recognitionRef.current.lang = 'en-US';

    recognitionRef.current.onresult = async (event) => {
      const transcript = event.results[0][0].transcript;
      setConversation(prev => [...prev, { speaker: 'user', text: transcript }]);
      await getAIResponse(transcript);
    };

    recognitionRef.current.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
    };

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const startListening = () => {
    if (isSpeaking) return;
    
    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch (error) {
      console.error('Error starting recognition:', error);
      setIsListening(false);
    }
  };

  const getAIResponse = async (userMessage) => {
    try {
      const apiUrl = process.env.NODE_ENV === 'development' 
        ? 'http://localhost:5000/api/chat' 
        : 'https://interview-voice-bot.onrender.com/api/chat';
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage })
      });
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      const data = await response.json();
      const botText = data.response;
      setConversation(prev => [...prev, { speaker: 'bot', text: botText }]);
      speak(botText);
    } catch (error) {
      console.error('Error fetching AI response:', error);
      setConversation(prev => [...prev, { 
        speaker: 'bot', 
        text: "Sorry, I'm having trouble connecting to the server." 
      }]);
    }
  };

  const speak = (text) => {
    if (synthRef.current.speaking) {
      synthRef.current.cancel();
    }
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.1;
    utterance.pitch = 0.9;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    synthRef.current.speak(utterance);
  };

  return (
    <div className="voicebot-container">
      <div className="conversation">
        {conversation.length === 0 ? (
          <div className="empty-state">
            <p>Click the microphone and ask an interview question</p>
            <div className="wave">👋</div>
          </div>
        ) : (
          conversation.map((entry, index) => (
            <div key={index} className={`message ${entry.speaker}`}>
              {entry.text}
            </div>
          ))
        )}
      </div>
      
      <div className="controls">
        <button 
          className={`mic-button ${isListening ? 'listening' : ''}`}
          onClick={startListening}
          disabled={isListening || isSpeaking}
        >
          {isListening ? (
            <>
              <span className="pulse"></span>
              <span className="text">Listening...</span>
            </>
          ) : (
            <>
              <span className="icon">🎤</span>
              <span className="text">Speak</span>
            </>
          )}
        </button>
      </div>
      
      <div className="sample-questions">
        <h3>Try asking:</h3>
        <ul>
          <li>What's your life story?</li>
          <li>What's your #1 superpower?</li>
          <li>How do you push your boundaries?</li>
          <li>What misconceptions do coworkers have?</li>
          <li>Where do you want to grow?</li>
        </ul>
      </div>
    </div>
  );
};

export default VoiceBot;
