// Simple test script to verify backend API
const API_BASE_URL = 'http://localhost:8000';

async function testBackend() {
  console.log('🧪 Testing Talkify Backend API...\n');
  
  try {
    // Test 1: Health check
    console.log('1️⃣ Testing health endpoint...');
    const healthResponse = await fetch(`${API_BASE_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData);
    
    // Test 2: Root endpoint
    console.log('\n2️⃣ Testing root endpoint...');
    const rootResponse = await fetch(`${API_BASE_URL}/`);
    const rootData = await rootResponse.json();
    console.log('✅ Root endpoint:', rootData);
    
    // Test 3: Next question endpoint
    console.log('\n3️⃣ Testing next-question endpoint...');
    const questionResponse = await fetch(`${API_BASE_URL}/api/v1/next-question`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        conversation_history: [],
        user_id: 'test_user_123'
      })
    });
    
    if (!questionResponse.ok) {
      const errorText = await questionResponse.text();
      console.log('❌ Question endpoint error:', questionResponse.status, errorText);
      return;
    }
    
    const questionData = await questionResponse.json();
    console.log('✅ Next question response:', JSON.stringify(questionData, null, 2));
    
    // Test 4: Test with a follow-up question
    console.log('\n4️⃣ Testing follow-up question...');
    const followUpResponse = await fetch(`${API_BASE_URL}/api/v1/next-question`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        conversation_history: [
          {
            question: "What type of work environment energizes you most?",
            answer: "Collaborative team setting",
            question_type: "multiple_choice",
            options: ["Collaborative team setting", "Independent workspace", "Dynamic, fast-paced", "Structured and organized"]
          }
        ],
        user_id: 'test_user_123'
      })
    });
    
    if (!followUpResponse.ok) {
      const errorText = await followUpResponse.text();
      console.log('❌ Follow-up question error:', followUpResponse.status, errorText);
      return;
    }
    
    const followUpData = await followUpResponse.json();
    console.log('✅ Follow-up question response:', JSON.stringify(followUpData, null, 2));
    
    console.log('\n🎉 All tests passed! Backend is working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.cause) {
      console.error('Cause:', error.cause);
    }
  }
}

// Run the test
testBackend();
