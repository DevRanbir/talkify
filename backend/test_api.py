"""
Test the API endpoints
"""

import requests
import json

# Base URL - update this to your deployed API URL
BASE_URL = "http://localhost:8000/api/v1"

def test_health_check():
    """Test health check endpoint"""
    response = requests.get(f"{BASE_URL.replace('/api/v1', '')}/health")
    print(f"Health Check: {response.status_code} - {response.json()}")

def test_get_courses():
    """Test get all courses endpoint"""
    response = requests.get(f"{BASE_URL}/courses")
    data = response.json()
    print(f"Courses: {response.status_code} - Found {data.get('total', 0)} courses")

def test_next_question():
    """Test next question endpoint"""
    # First question (empty history)
    payload = {
        "conversation_history": [],
        "user_id": "test_user_123"
    }
    
    response = requests.post(f"{BASE_URL}/next-question", json=payload)
    data = response.json()
    print(f"First Question: {response.status_code}")
    print(f"Question: {data.get('question', {}).get('question', 'N/A')}")
    print(f"Type: {data.get('question', {}).get('question_type', 'N/A')}")
    
    return data

def test_recommendation():
    """Test recommendation endpoint"""
    # Sample conversation history
    payload = {
        "conversation_history": [
            {
                "question": "What subjects did you enjoy most in school?",
                "answer": "I really enjoyed computer science and mathematics. I loved solving coding problems.",
                "question_type": "open_ended",
                "options": None
            },
            {
                "question": "Do you prefer working with people or with data/technology?",
                "answer": "Working with data/technology",
                "question_type": "multiple_choice",
                "options": ["Working with people", "Working with data/technology", "Both equally", "Neither specifically"]
            },
            {
                "question": "How important is work-life balance to you?",
                "answer": "4 - Very important",
                "question_type": "rating_scale",
                "options": ["1 - Not important", "2 - Slightly important", "3 - Moderately important", "4 - Very important", "5 - Extremely important"]
            },
            {
                "question": "Are you interested in entrepreneurship or starting your own business?",
                "answer": "Yes",
                "question_type": "yes_no",
                "options": ["Yes", "No"]
            },
            {
                "question": "What type of problems do you enjoy solving?",
                "answer": "I enjoy solving complex technical problems, especially those involving algorithms and data structures.",
                "question_type": "open_ended",
                "options": None
            },
            {
                "question": "Do you prefer creative or analytical tasks?",
                "answer": "Analytical tasks",
                "question_type": "multiple_choice",
                "options": ["Creative tasks", "Analytical tasks", "Both equally", "Neither specifically"]
            }
        ],
        "user_id": "test_user_123"
    }
    
    response = requests.post(f"{BASE_URL}/recommend", json=payload)
    data = response.json()
    print(f"Recommendation: {response.status_code}")
    if response.status_code == 200:
        print(f"Recommended Course: {data.get('recommended_course', {}).get('name', 'N/A')}")
        print(f"Confidence Score: {data.get('confidence_score', 0)}")
        print(f"Reasoning: {data.get('reasoning', 'N/A')}")
    else:
        print(f"Error: {data}")

if __name__ == "__main__":
    print("Testing Talkify Course Recommendation API")
    print("=" * 50)
    
    try:
        test_health_check()
        print()
        
        test_get_courses()
        print()
        
        question_data = test_next_question()
        print()
        
        test_recommendation()
        
    except Exception as e:
        print(f"Error running tests: {e}")
        print("Make sure the API is running on the correct URL")
