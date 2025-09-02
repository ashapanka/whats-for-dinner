export const environment = {
  production: false,
  groqApiUrl: 'https://api.groq.com/openai/v1/chat/completions',
  groqApiKey: 'YOUR_GROQ_API_KEY_HERE',
  groqModel: 'openai/gpt-oss-20b',
  
  backendApiUrl: 'http://localhost:3001/api', // Backend proxy URL
  googlePlacesApiKey: 'YOUR_GOOGLE_PLACES_API_KEY_HERE', // Only needed if using Places SDK directly
};
