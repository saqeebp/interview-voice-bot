require('dotenv').config();
const express = require('express');
const { OpenAI } = require('openai');
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 5000;

// CORS Configuration - UPDATE YOUR FRONTEND URL HERE
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://interview-voice-bot-frontend.onrender.com' // REPLACE WITH YOUR FRONTEND URL
  ],
  methods: ['POST', 'GET'],
  credentials: true
}));

app.use(express.json());

// OpenAI setup
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// YOUR PERSONAL RESPONSES - CUSTOMIZE THESE!
const PERSONAL_PROFILE = `
You are responding as a job candidate. Use these specific responses:

1. Life story: "I'm a passionate developer with 5+ years in fintech. I started coding at 15, studied CS at MIT, and specialize in building scalable APIs."

2. Superpower: "Turning complex problems into elegant solutions. I reduced processing time by 85% at my last role."

3. Growth areas: "1) Cloud architecture 2) Technical leadership 3) AI ethics"

4. Misconception: "That I'm only technical. I actually love mentoring and collaborative design."

5. Pushing boundaries: "I regularly take on stretch projects and seek critical feedback."
`;

// API endpoint with detailed logging
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    console.log('Received question:', message);
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-audio-preview-2025-06-03",
      messages: [
        { 
          role: "system", 
          content: `Respond as the job candidate. Use the following information: ${PERSONAL_PROFILE}` 
        },
        { role: "user", content: message }
      ],
      max_tokens: 150,
      temperature: 0.7
    });

    const response = completion.choices[0].message.content;
    console.log('Generated response:', response);
    
    res.json({ response });
  } catch (error) {
    console.error('OpenAI Error:', error);
    res.status(500).json({ error: "AI processing failed" });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Redirect to frontend in production
if (process.env.NODE_ENV === 'production') {
  app.get('/', (req, res) => {
    res.redirect('https://interview-voice-bot-frontend.onrender.com'); // YOUR FRONTEND URL
  });
}

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
