import React, { useState, useRef, useEffect } from 'react';
import './VoiceBot.css';

const VoiceBot = () => {
  const [isListening, setIsListening] = useState(false);
  const [conversation, setConversation] = useState([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);
  const timeoutRef = useRef(null);
  const latestTranscriptRef = useRef('');
  
  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser doesn't support speech recognition. Please use Chrome or Edge.");
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'en-US';

    recognitionRef.current.onresult = (event) => {
    const transcript = Array.from(event.results)
      .map(result => result[0].transcript)
      .join('');
  
    latestTranscriptRef.current = transcript;
  
    setConversation(prev => {
      const newConvo = [...prev];
      const lastIndex = newConvo.length - 1;
  
      if (lastIndex >= 0 && newConvo[lastIndex].speaker === 'user') {
        newConvo[lastIndex].text = transcript;
      } else {
        newConvo.push({ speaker: 'user', text: transcript });
      }
  
      return newConvo;
    });
  };


    recognitionRef.current.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };

    recognitionRef.current.onspeechend = async () => {
      stopListening();
    
      const userText = latestTranscriptRef.current.trim();
    
      if (userText) {
        await getAIResponse(userText);
      }
    };


    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // Define stopListening function
  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const startListening = () => {
    if (isSpeaking || isListening) return;
    
    try {
      // Clear previous state
      setConversation([]);
      
      recognitionRef.current.start();
      setIsListening(true);
      
      // Add timeout to automatically stop after 15 seconds
      timeoutRef.current = setTimeout(() => {
        if (isListening) {
          stopListening();
          setConversation(prev => [...prev, { 
            speaker: 'bot', 
            text: "I didn't hear anything. Please try again." 
          }]);
        }
      }, 15000);
    } catch (error) {
      console.error('Error starting recognition:', error);
      setIsListening(false);
    }
  };

  const getAIResponse = async (userMessage) => {
    try {
      // REPLACE WITH YOUR ACTUAL BACKEND URL
      const backendUrl = "https://interview-voice-bot.onrender.com";
      const apiUrl = `${backendUrl}/api/chat`;
      
      console.log("Sending to API:", apiUrl, "Message:", userMessage);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage })
      });
      
      console.log("Response status:", response.status);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("API response:", data);
      
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
          onClick={isListening ? stopListening : startListening}
          disabled={isSpeaking}
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
