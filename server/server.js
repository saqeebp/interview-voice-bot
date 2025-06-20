require('dotenv').config();
const express = require('express');
//const { GoogleGenerativeAI } = require('@google/generative-ai');
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

// Google API Setup
const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);


// YOUR PERSONAL RESPONSES - CUSTOMIZE THESE!
// const PERSONAL_PROFILE = `
// You are responding as a job candidate. Use these specific responses:

// 1. Life story: "I'm a passionate developer with 5+ years in fintech. I started coding at 15, studied CS at MIT, and specialize in building scalable APIs."

// 2. Superpower: "Turning complex problems into elegant solutions. I reduced processing time by 85% at my last role."

// 3. Growth areas: "1) Cloud architecture 2) Technical leadership 3) AI ethics"

// 4. Misconception: "That I'm only technical. I actually love mentoring and collaborative design."

// 5. Pushing boundaries: "I regularly take on stretch projects and seek critical feedback."
// `;

// API endpoint with detailed logging
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    console.log('Received question:', message);

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
You are responding as a job candidate. Use these specific responses:

1. Life story: "I come from a strong academic foundation with a B.Sc. in Data Science, and I've been driven by a passion for applying machine learning to real-world problems. From optimizing NLP pipelines using GPT models to deploying computer vision solutions and automating data workflows in the cloud, I've focused on bridging academic learning with practical impact. My journey has been defined by curiosity, constant learning, and a determination to make data-driven systems more intelligent and accessible."
2. Superpower: "My superpower is adaptability paired with execution. Whether it’s learning how to build and deploy AI models from scratch or integrating complex systems across cloud platforms, I pick up new skills quickly and apply them immediately. This has allowed me to thrive in fast-paced internships where the scope evolved constantly—yet I still delivered optimized, production-ready solutions."
3. Growth areas: "I want to grow into an AI/ML engineer who doesn’t just build models, but designs complete systems—from model training to deployment and user integration. I'm particularly excited about learning more in the realms of MLOps, real-time inference pipelines, and agentic systems using LLMs. I also want to eventually mentor others as I progress."
4. Misconception: "Some people initially think I'm quiet or reserved, but once we're in the flow of solving a problem, they realize I’m a proactive collaborator who thrives in cross-functional teams. I’ve often ended up leading initiatives or becoming the go-to person for critical tasks once trust is established."
5. Pushing boundaries: "I challenge myself by jumping into technically demanding projects that are slightly ahead of my current skillset. For instance, I chose to work on real-time data extraction from over 10K PDFs using AWS Lambda and Tesseract despite having little cloud experience at the time. I committed to learning and executing simultaneously, which helped me push both my technical and problem-solving boundaries."

Question: ${message}
`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();

    console.log("Gemini response:", response);
    res.json({ response });
  } catch (error) {
    console.error("Gemini Error:", error);
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
