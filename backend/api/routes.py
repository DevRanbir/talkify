"""
API routes for the course recommendation system
"""

import logging
from fastapi import APIRouter, HTTPException, Depends
from typing import List

from models.schemas import (
    NextQuestionRequest, 
    NextQuestionResponse, 
    RecommendationRequest, 
    RecommendationResponse,
    ChatRequest,
    ChatResponse,
    ChatMessage,
    ErrorResponse,
    Question
)
from services.groq_service import GroqService
from services.session_service import session_manager
from utils.course_data import course_manager
from config.settings import get_settings

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create router
router = APIRouter()

# Dependency to get services
def get_groq_service() -> GroqService:
    """Dependency to get Groq service instance"""
    return GroqService()

def get_settings_dependency():
    """Dependency to get settings"""
    return get_settings()

@router.post("/next-question", response_model=NextQuestionResponse)
async def get_next_question(
    request: NextQuestionRequest,
    groq_service: GroqService = Depends(get_groq_service),
    settings = Depends(get_settings_dependency)
):
    """
    Generate the next question based on tree navigation
    
    Args:
        request: NextQuestionRequest containing conversation history
        
    Returns:
        NextQuestionResponse with the next question
    """
    try:
        # Get or create session
        session_id = request.user_id or session_manager.create_session(request.user_id)
        
        # Update session with current conversation history if provided
        if request.conversation_history:
            session_manager.update_session_history(session_id, request.conversation_history)
        
        # Get conversation history from session
        conversation_history = session_manager.get_conversation_history(session_id)
        
        # Check if we should provide a recommendation instead of another question
        if groq_service.should_recommend(conversation_history):
            raise HTTPException(
                status_code=400,
                detail="Quiz complete! Please proceed to get your course recommendation."
            )
        
        # Determine question number
        question_number = len(conversation_history) + 1
        
        # Check if we've reached the maximum number of questions (hard limit)
        if question_number > settings.max_questions:
            raise HTTPException(
                status_code=400,
                detail=f"Maximum number of questions ({settings.max_questions}) reached. Please proceed to get recommendations."
            )
        
        # Add some processing delay for better UX (simulate AI thinking)
        import asyncio
        await asyncio.sleep(0.5)
        
        # Generate next question using tree navigation
        question = groq_service.generate_next_question(conversation_history, question_number)
        
        # Create response
        response = NextQuestionResponse(
            question=question,
            question_number=question_number,
            total_questions_planned=min(settings.max_questions, question_number + 5),  # Dynamic planning
            session_id=session_id
        )
        
        logger.info(f"Generated question {question_number} for session {session_id}")
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating next question: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error generating question: {str(e)}"
        )

@router.post("/recommend", response_model=RecommendationResponse)
async def get_course_recommendation(
    request: RecommendationRequest,
    groq_service: GroqService = Depends(get_groq_service),
    settings = Depends(get_settings_dependency)
):
    """
    Generate course recommendation based on tree navigation
    
    Args:
        request: RecommendationRequest containing complete Q&A history
        
    Returns:
        RecommendationResponse with course recommendation
    """
    try:
        # Check if we have reached a recommendation point in the tree
        if not groq_service.should_recommend(request.conversation_history):
            raise HTTPException(
                status_code=400,
                detail="Quiz is not complete yet. Please answer more questions before getting a recommendation."
            )
        
        # Validate minimum questions (fallback check)
        if len(request.conversation_history) < 1:
            raise HTTPException(
                status_code=400,
                detail="Need at least 1 question answered before generating recommendation."
            )
        
        # Get available courses
        available_courses = course_manager.get_all_courses()
        
        if not available_courses:
            raise HTTPException(
                status_code=500,
                detail="No courses available for recommendation"
            )
        
        # Generate recommendation using tree navigation
        recommendation_data = groq_service.generate_course_recommendation(
            request.conversation_history, 
            available_courses
        )
        
        # Get session if user_id provided
        if request.user_id:
            session_manager.update_session_history(request.user_id, request.conversation_history)
            session_manager.complete_session(request.user_id)
        
        # Create response
        response = RecommendationResponse(
            recommended_course=recommendation_data["recommended_course"],
            confidence_score=recommendation_data["confidence_score"],
            reasoning=recommendation_data["reasoning"],
            alternative_courses=None  # Could be implemented later
        )
        
        logger.info(f"Generated tree-based recommendation for {len(request.conversation_history)} questions")
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating recommendation: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error generating recommendation: {str(e)}"
        )

@router.get("/courses")
async def get_all_courses():
    """
    Get all available courses
    
    Returns:
        List of all available courses
    """
    try:
        courses = course_manager.get_all_courses()
        return {"courses": courses, "total": len(courses)}
        
    except Exception as e:
        logger.error(f"Error fetching courses: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching courses: {str(e)}"
        )

@router.get("/courses/search")
async def search_courses(q: str = ""):
    """
    Search courses by query
    
    Args:
        q: Search query
        
    Returns:
        List of matching courses
    """
    try:
        if not q.strip():
            return {"courses": [], "total": 0, "query": q}
        
        courses = course_manager.search_courses(q)
        return {"courses": courses, "total": len(courses), "query": q}
        
    except Exception as e:
        logger.error(f"Error searching courses: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error searching courses: {str(e)}"
        )

@router.post("/session/create")
async def create_new_session(user_id: str = None):
    """
    Create a new session
    
    Args:
        user_id: Optional user identifier
        
    Returns:
        Session ID
    """
    try:
        session_id = session_manager.create_session(user_id)
        return {"session_id": session_id, "message": "Session created successfully"}
        
    except Exception as e:
        logger.error(f"Error creating session: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error creating session: {str(e)}"
        )

@router.get("/session/{session_id}")
async def get_session_info(session_id: str):
    """
    Get session information
    
    Args:
        session_id: Session identifier
        
    Returns:
        Session information
    """
    try:
        session = session_manager.get_session(session_id)
        
        if not session:
            raise HTTPException(
                status_code=404,
                detail="Session not found or expired"
            )
        
        # Remove sensitive information
        public_session = {
            "session_id": session["session_id"],
            "created_at": session["created_at"],
            "last_activity": session["last_activity"],
            "is_completed": session["is_completed"],
            "question_count": len(session.get("conversation_history", []))
        }
        
        return public_session
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching session: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching session: {str(e)}"
        )

@router.delete("/session/{session_id}")
async def delete_session(session_id: str):
    """
    Delete a session
    
    Args:
        session_id: Session identifier
        
    Returns:
        Success message
    """
    try:
        session = session_manager.get_session(session_id)
        
        if not session:
            raise HTTPException(
                status_code=404,
                detail="Session not found"
            )
        
        # Delete the session
        session_manager._delete_session(session_id)
        
        return {"message": "Session deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting session: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error deleting session: {str(e)}"
        )

@router.post("/cleanup")
async def cleanup_expired_sessions():
    """
    Cleanup expired sessions (admin endpoint)
    
    Returns:
        Cleanup summary
    """
    try:
        session_manager.cleanup_expired_sessions()
        return {"message": "Expired sessions cleaned up successfully"}
        
    except Exception as e:
        logger.error(f"Error during cleanup: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error during cleanup: {str(e)}"
        )

@router.post("/chat", response_model=ChatResponse)
async def chat_with_ai(
    request: ChatRequest,
    groq_service: GroqService = Depends(get_groq_service)
):
    """
    Chat with AI assistant for career guidance and educational support
    
    Args:
        request: ChatRequest containing message and optional session info
        
    Returns:
        ChatResponse with AI response and conversation history
    """
    try:
        # Get or create chat session
        session_id = request.session_id
        if not session_id:
            session_id = session_manager.create_chat_session(request.user_id)
        else:
            # Validate session exists
            session = session_manager.get_session(session_id)
            if not session:
                # Create new session if provided session doesn't exist
                session_id = session_manager.create_chat_session(request.user_id)
        
        # Get current chat history
        chat_history = session_manager.get_chat_history(session_id)
        
        # Add user message to history
        session_manager.add_chat_message(session_id, "user", request.message)
        
        # Generate AI response
        ai_response = groq_service.generate_chat_response(chat_history, request.message)
        
        # Add AI response to history
        session_manager.add_chat_message(session_id, "assistant", ai_response)
        
        # Get updated chat history for response
        updated_history = session_manager.get_chat_history(session_id)
        
        # Convert to ChatMessage objects
        chat_messages = [
            ChatMessage(
                role=msg["role"],
                content=msg["content"],
                timestamp=msg.get("timestamp")
            )
            for msg in updated_history
        ]
        
        # Create response
        response = ChatResponse(
            response=ai_response,
            session_id=session_id,
            conversation_history=chat_messages
        )
        
        logger.info(f"Generated chat response for session {session_id}")
        return response
        
    except Exception as e:
        logger.error(f"Error in chat endpoint: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error generating chat response: {str(e)}"
        )

@router.get("/chat/{session_id}/history")
async def get_chat_history(session_id: str):
    """
    Get chat history for a session
    
    Args:
        session_id: Chat session identifier
        
    Returns:
        Chat history for the session
    """
    try:
        session = session_manager.get_session(session_id)
        
        if not session:
            raise HTTPException(
                status_code=404,
                detail="Chat session not found or expired"
            )
        
        # Get chat history
        chat_history = session_manager.get_chat_history(session_id)
        
        # Convert to ChatMessage objects
        chat_messages = [
            ChatMessage(
                role=msg["role"],
                content=msg["content"],
                timestamp=msg.get("timestamp")
            )
            for msg in chat_history
        ]
        
        return {
            "session_id": session_id,
            "chat_history": chat_messages,
            "message_count": len(chat_messages)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching chat history: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching chat history: {str(e)}"
        )
