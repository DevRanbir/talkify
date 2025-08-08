#!/usr/bin/env python3
"""
Test script for the new chat API endpoint
"""

import requests
import json
import sys
import os

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def test_chat_api():
    """Test the chat API endpoint"""
    base_url = "http://localhost:8000"  # Adjust if your server runs on a different port
    
    # Test data
    test_messages = [
        "Hello! I'm interested in learning about web development.",
        "What programming languages should I start with?",
        "Can you recommend some good courses for beginners?",
        "Thank you for the help!"
    ]
    
    session_id = None
    
    print("Testing Chat API Endpoints")
    print("=" * 50)
    
    for i, message in enumerate(test_messages, 1):
        print(f"\n--- Test {i}: Sending message ---")
        print(f"Message: {message}")
        
        # Prepare request
        chat_request = {
            "message": message,
            "session_id": session_id,
            "user_id": "test_user_123"
        }
        
        try:
            # Send chat request
            response = requests.post(
                f"{base_url}/chat",
                json=chat_request,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                data = response.json()
                session_id = data["session_id"]  # Store session ID for subsequent requests
                
                print(f"✅ Success! Session ID: {session_id}")
                print(f"AI Response: {data['response']}")
                print(f"Conversation length: {len(data['conversation_history'])} messages")
                
            else:
                print(f"❌ Error: {response.status_code}")
                print(f"Response: {response.text}")
                
        except requests.exceptions.ConnectionError:
            print("❌ Connection error. Make sure the server is running on localhost:8000")
            return
        except Exception as e:
            print(f"❌ Unexpected error: {e}")
            return
    
    # Test getting chat history
    if session_id:
        print(f"\n--- Testing Chat History Retrieval ---")
        try:
            history_response = requests.get(f"{base_url}/chat/{session_id}/history")
            
            if history_response.status_code == 200:
                history_data = history_response.json()
                print(f"✅ Retrieved chat history successfully")
                print(f"Session ID: {history_data['session_id']}")
                print(f"Total messages: {history_data['message_count']}")
                
                # Print conversation
                print("\nFull Conversation:")
                for msg in history_data['chat_history']:
                    role_emoji = "🤖" if msg['role'] == 'assistant' else "👤"
                    print(f"{role_emoji} {msg['role'].title()}: {msg['content'][:100]}...")
            else:
                print(f"❌ Error retrieving history: {history_response.status_code}")
                print(f"Response: {history_response.text}")
                
        except Exception as e:
            print(f"❌ Error retrieving chat history: {e}")
    
    print("\n" + "=" * 50)
    print("Chat API testing completed!")

if __name__ == "__main__":
    test_chat_api()
