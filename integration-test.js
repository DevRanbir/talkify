// Quick test to verify the integration works
// Add your Groq API key to backend/.env file as GROQ_API_KEY=your_key_here
// Then run this in your browser console on the Explore page

async function testTalkifyIntegration() {
  console.log("🚀 Testing Talkify Frontend-Backend Integration...");
  
  const API_BASE_URL = 'http://localhost:8000/api/v1';
  
  try {
    // Test 1: Health Check
    console.log("1. Testing health check...");
    const healthResponse = await fetch('http://localhost:8000/health');
    const healthData = await healthResponse.json();
    console.log("✅ Health Check:", healthData);
    
    // Test 2: Get first question
    console.log("2. Testing first question...");
    const questionResponse = await fetch(`${API_BASE_URL}/next-question`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        conversation_history: [],
        user_id: 'test_user_123'
      })
    });
    
    if (!questionResponse.ok) {
      throw new Error(`Question API failed: ${questionResponse.status}`);
    }
    
    const questionData = await questionResponse.json();
    console.log("✅ First Question:", questionData);
    
    // Test 3: Submit answer and get next question
    console.log("3. Testing answer submission...");
    const answerResponse = await fetch(`${API_BASE_URL}/next-question`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        conversation_history: [{
          question: questionData.question.question,
          answer: "I'm interested in technology and programming",
          question_type: questionData.question.question_type,
          options: questionData.question.options
        }],
        user_id: 'test_user_123'
      })
    });
    
    if (!answerResponse.ok) {
      throw new Error(`Answer API failed: ${answerResponse.status}`);
    }
    
    const nextQuestionData = await answerResponse.json();
    console.log("✅ Next Question:", nextQuestionData);
    
    // Test 4: Get courses
    console.log("4. Testing courses endpoint...");
    const coursesResponse = await fetch(`${API_BASE_URL}/courses`);
    const coursesData = await coursesResponse.json();
    console.log("✅ Courses:", `${coursesData.courses.length} courses loaded`);
    
    console.log("🎉 All tests passed! The integration is working correctly.");
    console.log("📝 Next steps:");
    console.log("   1. Add your Groq API key to backend/.env");
    console.log("   2. Click 'Career Guidance' in the Explore page");
    console.log("   3. Answer the questions to get your recommendation");
    
    return true;
    
  } catch (error) {
    console.error("❌ Integration test failed:", error);
    console.log("🔧 Troubleshooting:");
    console.log("   1. Make sure backend is running on http://localhost:8000");
    console.log("   2. Check if Groq API key is set in backend/.env");
    console.log("   3. Ensure CORS is enabled for your frontend domain");
    return false;
  }
}

// Run the test
testTalkifyIntegration();
