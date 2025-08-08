"""
Session management service for storing conversation history
"""

import json
import uuid
import os
from typing import Dict, List, Optional
from datetime import datetime, timedelta
from models.schemas import QuestionAnswer

class SessionManager:
    """Manages user sessions and conversation history"""
    
    def __init__(self, storage_dir: str = "data/sessions"):
        """Initialize session manager"""
        self.storage_dir = storage_dir
        self.sessions: Dict[str, Dict] = {}
        self.session_timeout = timedelta(hours=24)  # Sessions expire after 24 hours
        
        # Create storage directory if it doesn't exist
        os.makedirs(storage_dir, exist_ok=True)
        
        # Load existing sessions
        self._load_sessions()
    
    def create_session(self, user_id: Optional[str] = None) -> str:
        """Create a new session"""
        session_id = str(uuid.uuid4())
        
        session_data = {
            "session_id": session_id,
            "user_id": user_id,
            "conversation_history": [],
            "created_at": datetime.now().isoformat(),
            "last_activity": datetime.now().isoformat(),
            "is_completed": False
        }
        
        self.sessions[session_id] = session_data
        self._save_session(session_id)
        
        return session_id
    
    def get_session(self, session_id: str) -> Optional[Dict]:
        """Get session data by session ID"""
        if session_id not in self.sessions:
            self._load_session(session_id)
        
        session = self.sessions.get(session_id)
        
        if session and not self._is_session_expired(session):
            return session
        
        return None
    
    def update_session_history(
        self, 
        session_id: str, 
        conversation_history: List[QuestionAnswer]
    ) -> bool:
        """Update conversation history for a session"""
        session = self.get_session(session_id)
        
        if not session:
            return False
        
        # Convert QuestionAnswer objects to dictionaries for storage
        history_dicts = [qa.dict() for qa in conversation_history]
        
        session["conversation_history"] = history_dicts
        session["last_activity"] = datetime.now().isoformat()
        
        self.sessions[session_id] = session
        self._save_session(session_id)
        
        return True
    
    def complete_session(self, session_id: str) -> bool:
        """Mark a session as completed"""
        session = self.get_session(session_id)
        
        if not session:
            return False
        
        session["is_completed"] = True
        session["completed_at"] = datetime.now().isoformat()
        
        self.sessions[session_id] = session
        self._save_session(session_id)
        
        return True
    
    def get_conversation_history(self, session_id: str) -> List[QuestionAnswer]:
        """Get conversation history as QuestionAnswer objects"""
        session = self.get_session(session_id)
        
        if not session:
            return []
        
        history_dicts = session.get("conversation_history", [])
        
        # Convert dictionaries back to QuestionAnswer objects
        try:
            return [QuestionAnswer(**qa_dict) for qa_dict in history_dicts]
        except Exception:
            return []
    
    def cleanup_expired_sessions(self):
        """Remove expired sessions"""
        current_time = datetime.now()
        expired_sessions = []
        
        for session_id, session in self.sessions.items():
            if self._is_session_expired(session):
                expired_sessions.append(session_id)
        
        for session_id in expired_sessions:
            self._delete_session(session_id)
    
    def _is_session_expired(self, session: Dict) -> bool:
        """Check if a session has expired"""
        try:
            last_activity = datetime.fromisoformat(session["last_activity"])
            return datetime.now() - last_activity > self.session_timeout
        except Exception:
            return True
    
    def _load_sessions(self):
        """Load all sessions from disk"""
        try:
            for filename in os.listdir(self.storage_dir):
                if filename.endswith('.json'):
                    session_id = filename[:-5]  # Remove .json extension
                    self._load_session(session_id)
        except Exception:
            pass
    
    def _load_session(self, session_id: str):
        """Load a specific session from disk"""
        try:
            filepath = os.path.join(self.storage_dir, f"{session_id}.json")
            if os.path.exists(filepath):
                with open(filepath, 'r', encoding='utf-8') as f:
                    session_data = json.load(f)
                    self.sessions[session_id] = session_data
        except Exception:
            pass
    
    def _save_session(self, session_id: str):
        """Save a session to disk"""
        try:
            session_data = self.sessions.get(session_id)
            if session_data:
                filepath = os.path.join(self.storage_dir, f"{session_id}.json")
                with open(filepath, 'w', encoding='utf-8') as f:
                    json.dump(session_data, f, indent=2, ensure_ascii=False)
        except Exception:
            pass
    
    def _delete_session(self, session_id: str):
        """Delete a session from memory and disk"""
        # Remove from memory
        self.sessions.pop(session_id, None)
        
        # Remove from disk
        try:
            filepath = os.path.join(self.storage_dir, f"{session_id}.json")
            if os.path.exists(filepath):
                os.remove(filepath)
        except Exception:
            pass

    def create_chat_session(self, user_id: Optional[str] = None) -> str:
        """Create a new chat session"""
        session_id = str(uuid.uuid4())
        
        session_data = {
            "session_id": session_id,
            "user_id": user_id,
            "session_type": "chat",
            "chat_history": [],
            "created_at": datetime.now().isoformat(),
            "last_activity": datetime.now().isoformat(),
            "is_completed": False
        }
        
        self.sessions[session_id] = session_data
        self._save_session(session_id)
        
        return session_id
    
    def add_chat_message(self, session_id: str, role: str, content: str) -> bool:
        """Add a message to chat history"""
        session = self.get_session(session_id)
        
        if not session:
            return False
        
        # Initialize chat_history if it doesn't exist (for backward compatibility)
        if "chat_history" not in session:
            session["chat_history"] = []
        
        message = {
            "role": role,
            "content": content,
            "timestamp": datetime.now().isoformat()
        }
        
        session["chat_history"].append(message)
        session["last_activity"] = datetime.now().isoformat()
        
        self.sessions[session_id] = session
        self._save_session(session_id)
        
        return True
    
    def get_chat_history(self, session_id: str) -> List[Dict]:
        """Get chat history for a session"""
        session = self.get_session(session_id)
        
        if not session:
            return []
        
        return session.get("chat_history", [])

# Global session manager instance
session_manager = SessionManager()
