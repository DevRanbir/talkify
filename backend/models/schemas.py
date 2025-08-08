"""
Pydantic models for request/response validation
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from enum import Enum

class QuestionType(str, Enum):
    """Types of questions that can be generated"""
    MULTIPLE_CHOICE = "multiple_choice"
    RATING_SCALE = "rating_scale"
    YES_NO = "yes_no"
    OPEN_ENDED = "open_ended"

class QuestionAnswer(BaseModel):
    """Model for a question-answer pair"""
    question: str = Field(..., description="The question that was asked")
    answer: str = Field(..., description="The user's answer")
    question_type: QuestionType = Field(..., description="Type of question")
    options: Optional[List[str]] = Field(None, description="Options for multiple choice questions")

class NextQuestionRequest(BaseModel):
    """Request model for getting the next question"""
    conversation_history: List[QuestionAnswer] = Field(
        default=[], 
        description="List of previous question-answer pairs"
    )
    user_id: Optional[str] = Field(None, description="Optional user identifier for session tracking")

class Question(BaseModel):
    """Model for a generated question"""
    question: str = Field(..., description="The question text")
    question_type: QuestionType = Field(..., description="Type of question")
    options: Optional[List[str]] = Field(None, description="Options for multiple choice questions")
    is_final: bool = Field(False, description="Whether this is the final question")

class NextQuestionResponse(BaseModel):
    """Response model for next question endpoint"""
    question: Question
    question_number: int = Field(..., description="Current question number (1-based)")
    total_questions_planned: int = Field(..., description="Total number of questions planned")
    session_id: Optional[str] = Field(None, description="Session identifier")

class RecommendationRequest(BaseModel):
    """Request model for getting course recommendation"""
    conversation_history: List[QuestionAnswer] = Field(
        ..., 
        description="Complete list of question-answer pairs from the quiz",
        min_items=1
    )
    user_id: Optional[str] = Field(None, description="Optional user identifier")

class Course(BaseModel):
    """Model for a course"""
    name: str = Field(..., description="Course name")
    link: str = Field(..., description="Course link/URL")
    tags: Optional[List[str]] = Field(None, description="Course tags/categories")
    description: Optional[str] = Field(None, description="Course description")
    provider: Optional[str] = Field(None, description="Course provider")
    duration: Optional[str] = Field(None, description="Course duration")
    level: Optional[str] = Field(None, description="Course difficulty level")

class RecommendationResponse(BaseModel):
    """Response model for course recommendation"""
    recommended_course: Course
    confidence_score: float = Field(..., description="Confidence score (0-1)", ge=0, le=1)
    reasoning: str = Field(..., description="AI explanation for why this course was recommended")
    alternative_courses: Optional[List[Course]] = Field(None, description="Alternative course suggestions")

class ChatMessage(BaseModel):
    """Model for a chat message"""
    role: str = Field(..., description="Message role: 'user' or 'assistant'")
    content: str = Field(..., description="Message content")
    timestamp: Optional[str] = Field(None, description="Message timestamp")

class ChatRequest(BaseModel):
    """Request model for chat endpoint"""
    message: str = Field(..., description="User message", min_length=1)
    session_id: Optional[str] = Field(None, description="Chat session ID")
    user_id: Optional[str] = Field(None, description="Optional user identifier")

class ChatResponse(BaseModel):
    """Response model for chat endpoint"""
    response: str = Field(..., description="AI response message")
    session_id: str = Field(..., description="Chat session ID")
    conversation_history: List[ChatMessage] = Field(..., description="Current conversation history")

class ErrorResponse(BaseModel):
    """Error response model"""
    error: str = Field(..., description="Error message")
    error_code: str = Field(..., description="Error code")
    details: Optional[Dict[str, Any]] = Field(None, description="Additional error details")
