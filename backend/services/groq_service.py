"""
Tree-based quiz service for structured career guidance
"""

import json
import logging
from typing import List, Dict, Any, Optional
from groq import Groq
from config.settings import get_settings
from models.schemas import QuestionAnswer, Question, QuestionType, Course

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class GroqService:
    """Service class for tree-based career guidance quiz"""
    
    def __init__(self):
        """Initialize the service with quiz tree"""
        self.settings = get_settings()
        if not self.settings.groq_api_key:
            raise ValueError("GROQ_API_KEY environment variable is not set")
        
        self.client = Groq(api_key=self.settings.groq_api_key)
        self.model = "meta-llama/llama-4-scout-17b-16e-instruct"  # Using Mixtral model for better reasoning
        
        # Define the quiz tree structure
        self.quiz_tree = {
            "question": "Which stream are you interested in?",
            "options": {
                "Medical": {
                    "question": "Do you want to pursue MBBS or something related to research like BSc?",
                    "options": {
                        "MBBS": {
                            "recommend": "Medicine and Healthcare"
                        },
                        "BSc": {
                            "recommend": "Environmental Science and Sustainability"
                        }
                    }
                },
                "Non-Medical": {
                    "question": "Do you want to pursue Engineering?",
                    "options": {
                        "Yes": {
                            "question": "Which degree do you prefer?",
                            "options": {
                                "B.Tech": {
                                    "question": "Which stream in B.Tech are you interested in?",
                                    "options": {
                                        "Computer Science": {
                                            "question": "Do you want a general CSE course or specialization?",
                                            "options": {
                                                "General CSE": {
                                                    "recommend": "Full Stack Web Development"
                                                },
                                                "Specialization": {
                                                    "question": "Choose a specialization:",
                                                    "options": {
                                                        "AI/ML": {
                                                            "recommend": "Artificial Intelligence Fundamentals"
                                                        },
                                                        "Cybersecurity": {
                                                            "recommend": "Cybersecurity Specialist"
                                                        },
                                                        "Full Stack": {
                                                            "recommend": "Full Stack Web Development"
                                                        },
                                                        "Mobile Development": {
                                                            "recommend": "Mobile App Development"
                                                        }
                                                    }
                                                }
                                            }
                                        },
                                        "Mechanical": {
                                            "recommend": "Environmental Science and Sustainability"
                                        },
                                        "Electrical": {
                                            "recommend": "Cloud Computing with AWS"
                                        },
                                        "Civil": {
                                            "recommend": "Environmental Science and Sustainability"
                                        },
                                        "Other": {
                                            "recommend": "Game Development"
                                        }
                                    }
                                },
                                "M.Tech": {
                                    "recommend": "Cloud Computing with AWS"
                                }
                            }
                        },
                        "No": {
                            "question": "Are you interested in technology fields?",
                            "options": {
                                "Yes": {
                                    "recommend": "Data Science and Machine Learning"
                                },
                                "No": {
                                    "recommend": "Business Analytics"
                                }
                            }
                        }
                    }
                },
                "Commerce": {
                    "question": "Do you prefer finance, management, or business studies?",
                    "options": {
                        "Finance": {
                            "recommend": "Financial Analysis and Investment"
                        },
                        "Management": {
                            "recommend": "Project Management Professional"
                        },
                        "Business": {
                            "recommend": "Business Analytics"
                        }
                    }
                },
                "Arts": {
                    "question": "Are you interested in literature, design, or social sciences?",
                    "options": {
                        "Literature": {
                            "recommend": "Content Writing and Copywriting"
                        },
                        "Design": {
                            "question": "What type of design interests you?",
                            "options": {
                                "Graphic Design": {
                                    "recommend": "Graphic Design Fundamentals"
                                },
                                "UX/UI Design": {
                                    "recommend": "UX/UI Design"
                                },
                                "Video Production": {
                                    "recommend": "Video Production and Editing"
                                }
                            }
                        },
                        "Social Sciences": {
                            "recommend": "Psychology and Mental Health"
                        },
                        "Marketing": {
                            "question": "Which type of marketing interests you?",
                            "options": {
                                "Digital Marketing": {
                                    "recommend": "Digital Marketing Mastery"
                                },
                                "Social Media": {
                                    "recommend": "Social Media Management"
                                }
                            }
                        }
                    }
                }
            }
        }
    
    def generate_next_question(
        self, 
        conversation_history: List[QuestionAnswer], 
        question_number: int
    ) -> Question:
        """
        Generate the next question based on tree navigation
        
        Args:
            conversation_history: Previous Q&A pairs
            question_number: Current question number (1-based)
            
        Returns:
            Question object with the next question
        """
        try:
            # Navigate the tree based on conversation history
            current_node = self._navigate_tree(conversation_history)
            
            # Check if we've reached a recommendation - this should be handled by should_recommend
            if "recommend" in current_node:
                # Generate a deeper follow-up question to gather more information
                return self._generate_follow_up_question(conversation_history, question_number)
            
            # Extract question and options from current node
            question_text = current_node["question"]
            options = list(current_node["options"].keys())
            
            return Question(
                question=question_text,
                question_type=QuestionType.MULTIPLE_CHOICE,
                options=options,
                is_final=False  # Never mark as final, let should_recommend determine completion
            )
            
        except Exception as e:
            logger.error(f"Error generating question: {str(e)}")
            # Fallback question
            return self._get_fallback_question(question_number)
    
    def _navigate_tree(self, conversation_history: List[QuestionAnswer]) -> Dict[str, Any]:
        """
        Navigate the quiz tree based on conversation history
        
        Args:
            conversation_history: List of previous Q&A pairs
            
        Returns:
            Current node in the tree
        """
        current_node = self.quiz_tree
        
        for qa in conversation_history:
            if "options" in current_node and qa.answer in current_node["options"]:
                current_node = current_node["options"][qa.answer]
            else:
                # Answer not found in current options, return root
                logger.warning(f"Answer '{qa.answer}' not found in current node options")
                break
        
        return current_node
    
    def _should_recommend(self, conversation_history: List[QuestionAnswer]) -> bool:
        """
        Check if we should provide a recommendation based on current tree position
        
        Args:
            conversation_history: List of previous Q&A pairs
            
        Returns:
            True if we should recommend, False if more questions needed
        """
        current_node = self._navigate_tree(conversation_history)
        return "recommend" in current_node
    
    def generate_course_recommendation(
        self, 
        conversation_history: List[QuestionAnswer], 
        available_courses: List[Course]
    ) -> Dict[str, Any]:
        """
        Generate course recommendation based on tree navigation
        
        Args:
            conversation_history: Complete Q&A history
            available_courses: List of available courses
            
        Returns:
            Dictionary with recommendation details
        """
        try:
            # Navigate to the recommendation node
            current_node = self._navigate_tree(conversation_history)
            
            # Check if we have a recommendation
            if "recommend" not in current_node:
                logger.warning("No recommendation found in current tree position")
                return self._get_fallback_recommendation(available_courses)
            
            recommended_course_name = current_node["recommend"]
            
            # Find the exact course match
            recommended_course = None
            for course in available_courses:
                if course.name.lower() == recommended_course_name.lower():
                    recommended_course = course
                    break
            
            # If exact match not found, try partial matching
            if not recommended_course:
                for course in available_courses:
                    if any(keyword.lower() in course.name.lower() or 
                          keyword.lower() in ' '.join(course.tags or []).lower()
                          for keyword in recommended_course_name.lower().split()):
                        recommended_course = course
                        break
            
            # Fallback to first course if no match found
            if not recommended_course and available_courses:
                recommended_course = available_courses[0]
                logger.warning(f"No matching course found for '{recommended_course_name}', using fallback")
            
            # Generate reasoning based on the path taken
            reasoning = self._generate_tree_based_reasoning(conversation_history, recommended_course_name)
            
            # Extract key factors from the conversation path
            key_factors = self._extract_key_factors(conversation_history)
            
            return {
                "recommended_course": recommended_course,
                "confidence_score": 0.9,  # High confidence since it's based on structured decision tree
                "reasoning": reasoning,
                "key_matching_factors": key_factors
            }
            
        except Exception as e:
            logger.error(f"Error generating recommendation: {str(e)}")
            return self._get_fallback_recommendation(available_courses)
    
    def _generate_tree_based_reasoning(self, conversation_history: List[QuestionAnswer], course_name: str) -> str:
        """
        Generate reasoning based on the path taken through the decision tree
        
        Args:
            conversation_history: Complete Q&A history
            course_name: Recommended course name
            
        Returns:
            Reasoning string explaining the recommendation
        """
        if not conversation_history:
            return f"Based on general assessment, {course_name} appears to be a suitable choice."
        
        # Build reasoning from the decision path
        path_description = []
        
        for i, qa in enumerate(conversation_history):
            if i == 0:
                path_description.append(f"You expressed interest in {qa.answer}")
            else:
                path_description.append(f"you chose {qa.answer}")
        
        path_text = ", ".join(path_description)
        
        return (f"Based on your responses, {path_text}. "
                f"This decision path led us to recommend {course_name}, "
                f"which aligns perfectly with your expressed interests and career goals.")
    
    def _extract_key_factors(self, conversation_history: List[QuestionAnswer]) -> List[str]:
        """
        Extract key matching factors from conversation history
        
        Args:
            conversation_history: Complete Q&A history
            
        Returns:
            List of key factors
        """
        factors = []
        
        for qa in conversation_history:
            if qa.answer:
                factors.append(f"Interest in {qa.answer}")
        
        # Add some general factors based on the structured approach
        factors.append("Structured career assessment")
        factors.append("Decision tree-based matching")
        
        return factors[:5]  # Return max 5 factors
    
    def _generate_follow_up_question(self, conversation_history: List[QuestionAnswer], question_number: int) -> Question:
        """
        Generate follow-up questions when we've reached a recommendation node
        but want to gather more information for better recommendations
        
        Args:
            conversation_history: Previous Q&A pairs
            question_number: Current question number
            
        Returns:
            Question object with follow-up question
        """
        # Define follow-up questions to gather more detailed preferences
        follow_up_questions = [
            {
                "question": "What is your preferred learning style?",
                "options": ["Hands-on projects", "Video tutorials", "Reading materials", "Interactive coding", "Group discussions"]
            },
            {
                "question": "How much time can you dedicate to learning per week?",
                "options": ["1-5 hours", "5-10 hours", "10-15 hours", "15-20 hours", "20+ hours"]
            },
            {
                "question": "What is your current experience level?",
                "options": ["Complete beginner", "Some basic knowledge", "Intermediate", "Advanced", "Expert"]
            },
            {
                "question": "What motivates you most in your career?",
                "options": ["High salary potential", "Work-life balance", "Creative expression", "Problem solving", "Helping others"]
            },
            {
                "question": "Do you prefer working independently or in teams?",
                "options": ["Independently", "In small teams", "In large teams", "Mix of both", "Leadership roles"]
            },
            {
                "question": "What type of work environment appeals to you?",
                "options": ["Remote work", "Office environment", "Hybrid", "Startup atmosphere", "Corporate setting"]
            },
            {
                "question": "How important is job security to you?",
                "options": ["Very important", "Somewhat important", "Neutral", "Not very important", "I prefer high-risk, high-reward"]
            }
        ]
        
        # Select question based on what we haven't asked yet
        used_questions = {qa.question for qa in conversation_history}
        
        for follow_up in follow_up_questions:
            if follow_up["question"] not in used_questions:
                return Question(
                    question=follow_up["question"],
                    question_type=QuestionType.MULTIPLE_CHOICE,
                    options=follow_up["options"],
                    is_final=False
                )
        
        # If all follow-up questions are used, generate a personalized one
        return Question(
            question="Is there anything specific about your career goals that you'd like to share?",
            question_type=QuestionType.OPEN_ENDED,
            options=["Share your thoughts"],
            is_final=False
        )
    
    def should_recommend(self, conversation_history: List[QuestionAnswer]) -> bool:
        """
        Check if we should provide a recommendation based on current tree position
        
        Args:
            conversation_history: List of previous Q&A pairs
            
        Returns:
            True if we should recommend, False if more questions needed
        """
        try:
            # Only recommend if we've reached a leaf node in the tree (has "recommend" key)
            # OR if we've asked enough questions to make a meaningful recommendation
            current_node = self._navigate_tree(conversation_history)
            
            # If we've reached a recommendation node in the tree, we can recommend
            if "recommend" in current_node:
                return True
                
            # If we have enough conversation history, we can make a recommendation
            # even if we haven't reached a leaf node
            if len(conversation_history) >= 8:  # Increased threshold for better recommendations
                return True
                
            # Otherwise, continue asking questions
            return False
            
        except Exception as e:
            logger.error(f"Error checking if should recommend: {str(e)}")
            # Fallback: recommend after a reasonable number of questions
            return len(conversation_history) >= 8

    def _get_fallback_question(self, question_number: int, is_final: bool = False) -> Question:
        """Get a fallback question if tree navigation fails"""
        
        # Return the root question as fallback
        return Question(
            question=self.quiz_tree["question"],
            question_type=QuestionType.MULTIPLE_CHOICE,
            options=list(self.quiz_tree["options"].keys()),
            is_final=is_final
        )
    
    def _get_fallback_recommendation(self, available_courses: List[Course]) -> Dict[str, Any]:
        """Get a fallback recommendation if tree navigation fails"""
        if not available_courses:
            return {
                "recommended_course": None,
                "confidence_score": 0.0,
                "reasoning": "No courses available for recommendation.",
                "key_matching_factors": []
            }
        
        # Return the first course as fallback
        return {
            "recommended_course": available_courses[0],
            "confidence_score": 0.5,
            "reasoning": "This course was selected as a general recommendation. Please retake the quiz for better results.",
            "key_matching_factors": ["General recommendation"]
        }

    def generate_chat_response(self, conversation_history: List[Dict[str, str]], user_message: str) -> str:
        """
        Generate a chat response using Groq
        
        Args:
            conversation_history: List of previous messages in format [{"role": "user/assistant", "content": "..."}]
            user_message: Current user message
            
        Returns:
            AI-generated response
        """
        try:
            # Build the conversation context
            messages = [
                {
                    "role": "system",
                    "content": """You are Talkify, a helpful AI assistant for career guidance and educational support. You help users with:
                    - Career advice and recommendations
                    - Course suggestions and educational paths
                    - Study tips and learning strategies
                    - Technology and programming questions
                    - General educational guidance
                    
                    Be conversational, helpful, and encouraging. Provide detailed and actionable advice when possible.
                    If users ask about courses, you can reference the courses available in the platform.
                    Keep responses engaging but concise (aim for 2-3 paragraphs maximum)."""
                }
            ]
            
            # Add conversation history
            for msg in conversation_history:
                messages.append({
                    "role": msg["role"],
                    "content": msg["content"]
                })
            
            # Add current user message
            messages.append({
                "role": "user",
                "content": user_message
            })
            
            # Generate response using Groq
            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                max_tokens=1000,
                temperature=0.7,
                stream=False
            )
            
            if response.choices and len(response.choices) > 0:
                return response.choices[0].message.content.strip()
            else:
                return "I'm sorry, I couldn't generate a response at the moment. Please try again."
                
        except Exception as e:
            logger.error(f"Error generating chat response: {str(e)}")
            return "I'm experiencing some technical difficulties. Please try again in a moment."
