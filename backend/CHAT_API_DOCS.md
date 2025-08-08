# Chat API Documentation

The Talkify backend now includes a chat functionality that allows users to have conversations with an AI assistant powered by Groq. The chat system maintains conversation history and provides career guidance and educational support.

## New Endpoints

### 1. POST `/chat`
Start or continue a chat conversation with the AI assistant.

**Request Body:**
```json
{
  "message": "Hello! I'm interested in learning web development",
  "session_id": "optional-session-id", 
  "user_id": "optional-user-id"
}
```

**Response:**
```json
{
  "response": "Hello! That's great to hear! Web development is an exciting field...",
  "session_id": "uuid-session-id",
  "conversation_history": [
    {
      "role": "user",
      "content": "Hello! I'm interested in learning web development",
      "timestamp": "2025-08-08T10:30:00"
    },
    {
      "role": "assistant", 
      "content": "Hello! That's great to hear! Web development is an exciting field...",
      "timestamp": "2025-08-08T10:30:05"
    }
  ]
}
```

### 2. GET `/chat/{session_id}/history`
Retrieve the chat history for a specific session.

**Response:**
```json
{
  "session_id": "uuid-session-id",
  "chat_history": [
    {
      "role": "user",
      "content": "Hello! I'm interested in learning web development",
      "timestamp": "2025-08-08T10:30:00"
    },
    {
      "role": "assistant",
      "content": "Hello! That's great to hear! Web development is an exciting field...", 
      "timestamp": "2025-08-08T10:30:05"
    }
  ],
  "message_count": 2
}
```

## Data Models

### ChatMessage
```python
{
  "role": "user|assistant",
  "content": "message content",
  "timestamp": "ISO timestamp (optional)"
}
```

### ChatRequest
```python
{
  "message": "user message (required, min 1 character)",
  "session_id": "session ID (optional)",
  "user_id": "user identifier (optional)"
}
```

### ChatResponse
```python
{
  "response": "AI response message",
  "session_id": "session identifier",
  "conversation_history": [ChatMessage, ...]
}
```

## Features

1. **Session Management**: Each chat conversation is associated with a session that persists conversation history
2. **Groq Integration**: Uses Groq's API to generate intelligent responses
3. **Career Focus**: The AI is specifically prompted to provide career guidance and educational support
4. **History Persistence**: Chat histories are saved to disk and survive server restarts
5. **Flexible Sessions**: Users can start new sessions or continue existing ones

## Usage Examples

### Starting a New Chat
```javascript
const response = await fetch('/chat', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    message: "I want to learn programming but don't know where to start",
    user_id: "user123"
  })
});
const data = await response.json();
console.log(data.response); // AI response
console.log(data.session_id); // Save this for future messages
```

### Continuing a Chat
```javascript
const response = await fetch('/chat', {
  method: 'POST', 
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    message: "What about Python vs JavaScript?",
    session_id: "existing-session-id"
  })
});
```

### Getting Chat History
```javascript
const response = await fetch(`/chat/${sessionId}/history`);
const data = await response.json();
console.log(data.chat_history); // Array of all messages
```

## Integration with Frontend

The chat endpoint is designed to be easily integrated with a frontend chat interface. Key considerations:

1. **Session Persistence**: Store the `session_id` in localStorage or state management
2. **Real-time Updates**: The conversation history is returned with each response
3. **Error Handling**: Handle HTTP errors gracefully
4. **UI State**: Show loading states while waiting for AI responses

## AI Capabilities

The AI assistant is configured to help with:
- Career advice and recommendations
- Course suggestions and educational paths  
- Study tips and learning strategies
- Technology and programming questions
- General educational guidance

The AI is trained to provide conversational, helpful, and encouraging responses while keeping them concise (2-3 paragraphs maximum).

## Testing

Use the provided `test_chat_api.py` script to test the chat functionality:

```bash
cd backend
python test_chat_api.py
```

Make sure your backend server is running on `localhost:8000` before running the test.
