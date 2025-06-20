import VoiceBot from './components/VoiceBot';
import './App.css';

function App() {
  return (
    <div className="App">
      <header>
        <h1>Interview Voice Assistant</h1>
        <p>Ask me anything about my professional background</p>
      </header>
      <main>
        <VoiceBot />
      </main>
      <footer>
        <p>Powered by Google • Built for Job Interview</p>
      </footer>
    </div>
  );
}

export default App;
