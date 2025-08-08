#!/usr/bin/env python3
"""
Test script for the tree-based quiz system
"""

import requests
import json

# API base URL
BASE_URL = "http://localhost:8000"

def test_tree_quiz():
    """Test the complete tree-based quiz flow"""
    
    print("🌳 Testing Tree-Based Quiz System")
    print("=" * 50)
    
    # Test 1: Get first question
    print("\n1. Getting first question...")
    response = requests.post(f"{BASE_URL}/next-question", json={
        "conversation_history": [],
        "user_id": "test_user_tree"
    })
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ First question: {data['question']['question']}")
        print(f"   Options: {data['question']['options']}")
        
        # Start conversation history
        conversation_history = []
        
        # Test 2: Answer first question - Medical
        print("\n2. Answering: Medical")
        conversation_history.append({
            "question": data['question']['question'],
            "answer": "Medical",
            "question_type": "multiple_choice",
            "options": data['question']['options']
        })
        
        response = requests.post(f"{BASE_URL}/next-question", json={
            "conversation_history": conversation_history,
            "user_id": "test_user_tree"
        })
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Second question: {data['question']['question']}")
            print(f"   Options: {data['question']['options']}")
            
            # Test 3: Answer second question - MBBS
            print("\n3. Answering: MBBS")
            conversation_history.append({
                "question": data['question']['question'],
                "answer": "MBBS",
                "question_type": "multiple_choice",
                "options": data['question']['options']
            })
            
            # This should trigger a recommendation
            response = requests.post(f"{BASE_URL}/next-question", json={
                "conversation_history": conversation_history,
                "user_id": "test_user_tree"
            })
            
            if response.status_code == 400:
                print("✅ Quiz complete message received (as expected)")
                print(f"   Message: {response.json()['detail']}")
                
                # Test 4: Get recommendation
                print("\n4. Getting recommendation...")
                response = requests.post(f"{BASE_URL}/recommend", json={
                    "conversation_history": conversation_history,
                    "user_id": "test_user_tree"
                })
                
                if response.status_code == 200:
                    data = response.json()
                    print(f"✅ Recommendation received!")
                    print(f"   Course: {data['recommended_course']['name']}")
                    print(f"   Confidence: {data['confidence_score']}")
                    print(f"   Reasoning: {data['reasoning']}")
                else:
                    print(f"❌ Error getting recommendation: {response.status_code}")
                    print(response.text)
            else:
                print(f"❌ Expected quiz complete message but got: {response.status_code}")
                print(response.text)
        else:
            print(f"❌ Error getting second question: {response.status_code}")
            print(response.text)
    else:
        print(f"❌ Error getting first question: {response.status_code}")
        print(response.text)
    
    print("\n" + "=" * 50)
    
    # Test CS Engineering path
    print("\n🖥️  Testing CS Engineering Path")
    print("=" * 50)
    
    conversation_history = []
    
    # Step 1: Non-Medical
    print("\n1. Starting with Non-Medical...")
    response = requests.post(f"{BASE_URL}/next-question", json={
        "conversation_history": [],
        "user_id": "test_user_cs"
    })
    
    if response.status_code == 200:
        data = response.json()
        conversation_history.append({
            "question": data['question']['question'],
            "answer": "Non-Medical",
            "question_type": "multiple_choice",
            "options": data['question']['options']
        })
        
        # Step 2: Yes to Engineering
        response = requests.post(f"{BASE_URL}/next-question", json={
            "conversation_history": conversation_history,
            "user_id": "test_user_cs"
        })
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Engineering question: {data['question']['question']}")
            conversation_history.append({
                "question": data['question']['question'],
                "answer": "Yes",
                "question_type": "multiple_choice",
                "options": data['question']['options']
            })
            
            # Step 3: B.Tech
            response = requests.post(f"{BASE_URL}/next-question", json={
                "conversation_history": conversation_history,
                "user_id": "test_user_cs"
            })
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Degree question: {data['question']['question']}")
                conversation_history.append({
                    "question": data['question']['question'],
                    "answer": "B.Tech",
                    "question_type": "multiple_choice",
                    "options": data['question']['options']
                })
                
                # Step 4: Computer Science
                response = requests.post(f"{BASE_URL}/next-question", json={
                    "conversation_history": conversation_history,
                    "user_id": "test_user_cs"
                })
                
                if response.status_code == 200:
                    data = response.json()
                    print(f"✅ Stream question: {data['question']['question']}")
                    conversation_history.append({
                        "question": data['question']['question'],
                        "answer": "Computer Science",
                        "question_type": "multiple_choice",
                        "options": data['question']['options']
                    })
                    
                    # Step 5: Specialization
                    response = requests.post(f"{BASE_URL}/next-question", json={
                        "conversation_history": conversation_history,
                        "user_id": "test_user_cs"
                    })
                    
                    if response.status_code == 200:
                        data = response.json()
                        print(f"✅ General/Specialization question: {data['question']['question']}")
                        conversation_history.append({
                            "question": data['question']['question'],
                            "answer": "Specialization",
                            "question_type": "multiple_choice",
                            "options": data['question']['options']
                        })
                        
                        # Step 6: AI/ML
                        response = requests.post(f"{BASE_URL}/next-question", json={
                            "conversation_history": conversation_history,
                            "user_id": "test_user_cs"
                        })
                        
                        if response.status_code == 200:
                            data = response.json()
                            print(f"✅ Specialization question: {data['question']['question']}")
                            conversation_history.append({
                                "question": data['question']['question'],
                                "answer": "AI/ML",
                                "question_type": "multiple_choice",
                                "options": data['question']['options']
                            })
                            
                            # Should now be ready for recommendation
                            response = requests.post(f"{BASE_URL}/recommend", json={
                                "conversation_history": conversation_history,
                                "user_id": "test_user_cs"
                            })
                            
                            if response.status_code == 200:
                                data = response.json()
                                print(f"✅ AI/ML Recommendation: {data['recommended_course']['name']}")
                                print(f"   Confidence: {data['confidence_score']}")
                            else:
                                print(f"❌ Error getting AI/ML recommendation: {response.status_code}")
    
    print("\n🎉 Tree-based quiz testing complete!")

if __name__ == "__main__":
    test_tree_quiz()
