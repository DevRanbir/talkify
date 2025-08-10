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
        
        # Define the 6-step quiz tree structure following the specific path:
        # 1. Stream Selection -> 2. User Interest -> 3. Skills -> 4. Preferences -> 5. Analysis -> 6. Recommend
        self.quiz_tree = {
            "step": 1,
            "question": "Which stream are you most interested in?",
            "options": {
                "Engineering & Technology": {
                    "step": 2,
                    "question": "What aspect of technology interests you most?",
                    "options": {
                        "Software Development & Programming": {
                            "step": 3,
                            "question": "What technical skills do you currently have or want to develop?",
                            "options": {
                                "Beginner - Want to learn programming basics": {
                                    "step": 4,
                                    "question": "What type of learning environment do you prefer?",
                                    "options": {
                                        "Hands-on coding projects": {
                                            "step": 5,
                                            "analysis": "programming_beginner_hands_on",
                                            "courses": ["B.E. Computer Science & Engineering", "Bachelor of Engineering (Computer Science and Engineering) with Specialization in Full Stack Development", "Computing (BCA/MCA)"]
                                        },
                                        "Structured theoretical learning": {
                                            "step": 5,
                                            "analysis": "programming_beginner_theoretical",
                                            "courses": ["B.E. Computer Science & Engineering", "B.E. Information Technology Engineering"]
                                        }
                                    }
                                },
                                "Intermediate - Know programming, want specialization": {
                                    "step": 4,
                                    "question": "Which specialization area excites you most?",
                                    "options": {
                                        "Artificial Intelligence & Machine Learning": {
                                            "step": 5,
                                            "analysis": "programming_intermediate_ai",
                                            "courses": ["Bachelor of Engineering (Hons.) Computer Science & Engineering (Artificial Intelligence) with Microsoft", "M.E. Artificial Intelligence Engineering", "M.E. CSE Artificial Intelligence and Machine Learning Engineering"]
                                        },
                                        "Data Science & Analytics": {
                                            "step": 5,
                                            "analysis": "programming_intermediate_data",
                                            "courses": ["M.E. CSE Data Science Engineering", "Data Science", "MCA Data Science with Intel"]
                                        },
                                        "Cloud Computing & DevOps": {
                                            "step": 5,
                                            "analysis": "programming_intermediate_cloud",
                                            "courses": ["ME CSE Cloud Computing with Virtusa", "CSE with IBM", "CSE with TCS"]
                                        }
                                    }
                                },
                                "Advanced - Ready for industry collaboration": {
                                    "step": 4,
                                    "question": "What industry partnership appeals to you?",
                                    "options": {
                                        "Global tech giants (Microsoft, IBM)": {
                                            "step": 5,
                                            "analysis": "programming_advanced_global",
                                            "courses": ["Bachelor of Engineering (Hons.) Computer Science & Engineering (Artificial Intelligence) with Microsoft", "CSE with IBM"]
                                        },
                                        "Indian IT leaders (TCS, Virtusa)": {
                                            "step": 5,
                                            "analysis": "programming_advanced_indian",
                                            "courses": ["CSE with TCS", "ME CSE Cloud Computing with Virtusa"]
                                        }
                                    }
                                }
                            }
                        },
                        "Hardware & Electronics": {
                            "step": 3,
                            "question": "What technical skills interest you in hardware?",
                            "options": {
                                "Circuit design and electronics": {
                                    "step": 4,
                                    "question": "Do you prefer practical work or research?",
                                    "options": {
                                        "Practical applications": {
                                            "step": 5,
                                            "analysis": "hardware_practical",
                                            "courses": ["B.E. Electronics and Communication Engineering", "B.E. Electrical Engineering"]
                                        },
                                        "Research and development": {
                                            "step": 5,
                                            "analysis": "hardware_research",
                                            "courses": ["M.E. Electronics and Communication Engineering", "M.E. Electrical Engineering"]
                                        }
                                    }
                                },
                                "Mechanical systems and robotics": {
                                    "step": 4,
                                    "question": "Which mechanical field excites you?",
                                    "options": {
                                        "Automotive and transportation": {
                                            "step": 5,
                                            "analysis": "mechanical_automotive",
                                            "courses": ["B.E. Automobile Engineering", "M.E. Automobile Engineering", "B.E. Aerospace Engineering"]
                                        },
                                        "Robotics and automation": {
                                            "step": 5,
                                            "analysis": "mechanical_robotics",
                                            "courses": ["M.E. Robotics and Automation Engineering", "B.E. Mechatronics Engineering"]
                                        }
                                    }
                                }
                            }
                        },
                        "Civil & Environmental Engineering": {
                            "step": 3,
                            "question": "What construction or environmental skills interest you?",
                            "options": {
                                "Building design and construction": {
                                    "step": 4,
                                    "question": "Do you prefer design or management?",
                                    "options": {
                                        "Structural design and analysis": {
                                            "step": 5,
                                            "analysis": "civil_design",
                                            "courses": ["B.E. Civil Engineering", "M.E. Civil - Structural Engineering"]
                                        },
                                        "Construction project management": {
                                            "step": 5,
                                            "analysis": "civil_management",
                                            "courses": ["M.E. Civil - Construction Technology and Management Engineering"]
                                        }
                                    }
                                },
                                "Environmental protection": {
                                    "step": 4,
                                    "question": "What environmental focus interests you?",
                                    "options": {
                                        "Environmental engineering": {
                                            "step": 5,
                                            "analysis": "environmental_engineering",
                                            "courses": ["M.E. Civil - Environment Engineering"]
                                        },
                                        "Transportation systems": {
                                            "step": 5,
                                            "analysis": "environmental_transport",
                                            "courses": ["M.E. Civil - Transportation Engineering"]
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                "Medical & Health Sciences": {
                    "step": 2,
                    "question": "What aspect of healthcare interests you most?",
                    "options": {
                        "Direct Patient Care": {
                            "step": 3,
                            "question": "What patient care skills do you want to develop?",
                            "options": {
                                "Physical therapy and rehabilitation": {
                                    "step": 4,
                                    "question": "Do you prefer working with specific patient groups?",
                                    "options": {
                                        "Sports and fitness rehabilitation": {
                                            "step": 5,
                                            "analysis": "healthcare_sports_rehab",
                                            "courses": ["Physiotherapy"]
                                        },
                                        "General physical therapy": {
                                            "step": 5,
                                            "analysis": "healthcare_general_physio",
                                            "courses": ["Physiotherapy", "Allied Health Sciences"]
                                        }
                                    }
                                },
                                "Vision and eye care": {
                                    "step": 4,
                                    "question": "Do you prefer clinical practice or research?",
                                    "options": {
                                        "Clinical eye examination": {
                                            "step": 5,
                                            "analysis": "healthcare_eye_clinical",
                                            "courses": ["Optometry"]
                                        },
                                        "Vision research": {
                                            "step": 5,
                                            "analysis": "healthcare_eye_research",
                                            "courses": ["Optometry", "Allied Health Sciences"]
                                        }
                                    }
                                }
                            }
                        },
                        "Medical Research & Lab Work": {
                            "step": 3,
                            "question": "What research skills interest you most?",
                            "options": {
                                "Laboratory analysis and testing": {
                                    "step": 4,
                                    "question": "Which lab area interests you?",
                                    "options": {
                                        "Clinical diagnostic testing": {
                                            "step": 5,
                                            "analysis": "medical_lab_clinical",
                                            "courses": ["Medical Lab Technology"]
                                        },
                                        "Research and development": {
                                            "step": 5,
                                            "analysis": "medical_lab_research",
                                            "courses": ["Medical Lab Technology", "B.Sc. Medical"]
                                        }
                                    }
                                },
                                "Biotechnology and genetics": {
                                    "step": 4,
                                    "question": "Do you prefer applied research or pure science?",
                                    "options": {
                                        "Applied biotechnology": {
                                            "step": 5,
                                            "analysis": "medical_biotech_applied",
                                            "courses": ["Biotechnology & Biosciences", "B.E. BioTechnology Engineering"]
                                        },
                                        "Pure biological research": {
                                            "step": 5,
                                            "analysis": "medical_biotech_pure",
                                            "courses": ["Microbiology", "M.Sc. Zoology/Botany"]
                                        }
                                    }
                                }
                            }
                        },
                        "Pharmaceutical & Nutrition": {
                            "step": 3,
                            "question": "What health science skills do you want to develop?",
                            "options": {
                                "Drug development and pharmacy": {
                                    "step": 4,
                                    "question": "Do you prefer research or practice?",
                                    "options": {
                                        "Pharmaceutical research": {
                                            "step": 5,
                                            "analysis": "pharma_research",
                                            "courses": ["Pharma Sciences"]
                                        },
                                        "Clinical pharmacy practice": {
                                            "step": 5,
                                            "analysis": "pharma_clinical",
                                            "courses": ["Pharma Sciences"]
                                        }
                                    }
                                },
                                "Nutrition and wellness": {
                                    "step": 4,
                                    "question": "What nutrition focus interests you?",
                                    "options": {
                                        "Clinical nutrition therapy": {
                                            "step": 5,
                                            "analysis": "nutrition_clinical",
                                            "courses": ["Nutrition & Dietetics"]
                                        },
                                        "Public health nutrition": {
                                            "step": 5,
                                            "analysis": "nutrition_public",
                                            "courses": ["Nutrition & Dietetics"]
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                "Business & Management": {
                    "step": 2,
                    "question": "What business area interests you most?",
                    "options": {
                        "Finance & Economics": {
                            "step": 3,
                            "question": "What financial skills do you want to develop?",
                            "options": {
                                "Investment and capital markets": {
                                    "step": 4,
                                    "question": "Do you prefer traditional or modern finance?",
                                    "options": {
                                        "Traditional banking and finance": {
                                            "step": 5,
                                            "analysis": "finance_traditional",
                                            "courses": ["MBA with SBI", "Finance & Accounting", "Commerce (B.Com/M.Com)"]
                                        },
                                        "Modern fintech and digital finance": {
                                            "step": 5,
                                            "analysis": "finance_modern",
                                            "courses": ["MBA Fintech with NSE Academy", "MBA in Capital Markets with NISM"]
                                        }
                                    }
                                },
                                "Accounting and business analysis": {
                                    "step": 4,
                                    "question": "Do you prefer accounting or analytics?",
                                    "options": {
                                        "Professional accounting": {
                                            "step": 5,
                                            "analysis": "business_accounting",
                                            "courses": ["B.Com in Applied Finance & Accounting with Grant Thornton", "Commerce (B.Com/M.Com)"]
                                        },
                                        "Business analytics": {
                                            "step": 5,
                                            "analysis": "business_analytics",
                                            "courses": ["MBA Business Analytics with IBM", "MBA Data Science & AI with SAS"]
                                        }
                                    }
                                }
                            }
                        },
                        "Management & Leadership": {
                            "step": 3,
                            "question": "What management skills interest you?",
                            "options": {
                                "General business management": {
                                    "step": 4,
                                    "question": "Do you prefer academic or industry focus?",
                                    "options": {
                                        "Academic business education": {
                                            "step": 5,
                                            "analysis": "management_academic",
                                            "courses": ["Management (BBA/MBA)"]
                                        },
                                        "Industry-collaborated programs": {
                                            "step": 5,
                                            "analysis": "management_industry",
                                            "courses": ["Industry Collaborated (BBA/MBA)"]
                                        }
                                    }
                                },
                                "Specialized management areas": {
                                    "step": 4,
                                    "question": "Which specialized area interests you?",
                                    "options": {
                                        "Healthcare and HR management": {
                                            "step": 5,
                                            "analysis": "management_healthcare_hr",
                                            "courses": ["MBA Healthcare and Hospital Management", "MBA Strategic HR with AON"]
                                        },
                                        "Marketing and operations": {
                                            "step": 5,
                                            "analysis": "management_marketing_ops",
                                            "courses": ["MBA Digital Marketing", "MBA Logistics and Supply Chain Management with CII"]
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                "Creative Arts & Design": {
                    "step": 2,
                    "question": "What creative field interests you most?",
                    "options": {
                        "Visual Arts & Design": {
                            "step": 3,
                            "question": "What design skills do you want to develop?",
                            "options": {
                                "Fashion and lifestyle design": {
                                    "step": 4,
                                    "question": "Do you prefer design or business aspects?",
                                    "options": {
                                        "Creative fashion design": {
                                            "step": 5,
                                            "analysis": "creative_fashion_design",
                                            "courses": ["Fashion & Design"]
                                        },
                                        "Fashion business and marketing": {
                                            "step": 5,
                                            "analysis": "creative_fashion_business",
                                            "courses": ["Fashion & Design", "MBA Digital Marketing"]
                                        }
                                    }
                                },
                                "Spatial and product design": {
                                    "step": 4,
                                    "question": "Do you prefer interior or product design?",
                                    "options": {
                                        "Interior and space design": {
                                            "step": 5,
                                            "analysis": "creative_interior",
                                            "courses": ["Interior Design", "Architecture"]
                                        },
                                        "Product and industrial design": {
                                            "step": 5,
                                            "analysis": "creative_product",
                                            "courses": ["Product & Industrial Design"]
                                        }
                                    }
                                }
                            }
                        },
                        "Media & Communication": {
                            "step": 3,
                            "question": "What media skills interest you?",
                            "options": {
                                "Digital media and animation": {
                                    "step": 4,
                                    "question": "Do you prefer animation or multimedia?",
                                    "options": {
                                        "2D/3D animation": {
                                            "step": 5,
                                            "analysis": "media_animation",
                                            "courses": ["Animation & Multimedia"]
                                        },
                                        "Multimedia production": {
                                            "step": 5,
                                            "analysis": "media_multimedia",
                                            "courses": ["Animation & Multimedia", "Media Studies"]
                                        }
                                    }
                                },
                                "Traditional arts and communication": {
                                    "step": 4,
                                    "question": "Do you prefer fine arts or media studies?",
                                    "options": {
                                        "Fine arts and painting": {
                                            "step": 5,
                                            "analysis": "creative_fine_arts",
                                            "courses": ["Fine Arts"]
                                        },
                                        "Media studies and journalism": {
                                            "step": 5,
                                            "analysis": "creative_media_studies",
                                            "courses": ["Media Studies"]
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                "Pure Sciences & Research": {
                    "step": 2,
                    "question": "What scientific field interests you most?",
                    "options": {
                        "Mathematics & Data Science": {
                            "step": 3,
                            "question": "What mathematical skills do you want to develop?",
                            "options": {
                                "Pure mathematics and theory": {
                                    "step": 4,
                                    "question": "Do you prefer academic research or applied math?",
                                    "options": {
                                        "Academic mathematics research": {
                                            "step": 5,
                                            "analysis": "math_academic",
                                            "courses": ["Mathematics (B.Sc./M.Sc./Phd)"]
                                        },
                                        "Applied mathematical sciences": {
                                            "step": 5,
                                            "analysis": "math_applied",
                                            "courses": ["Basic Sciences (Physics/Chemistry/Maths)", "Data Science"]
                                        }
                                    }
                                },
                                "Data science and analytics": {
                                    "step": 4,
                                    "question": "Do you prefer technical or business applications?",
                                    "options": {
                                        "Technical data science": {
                                            "step": 5,
                                            "analysis": "data_technical",
                                            "courses": ["Data Science", "M.E. CSE Data Science Engineering"]
                                        },
                                        "Business data analytics": {
                                            "step": 5,
                                            "analysis": "data_business",
                                            "courses": ["MBA Data Science & AI with SAS", "MBA Business Analytics with IBM"]
                                        }
                                    }
                                }
                            }
                        },
                        "Basic Sciences": {
                            "step": 3,
                            "question": "What scientific skills interest you?",
                            "options": {
                                "Physics and chemistry": {
                                    "step": 4,
                                    "question": "Do you prefer experimental or theoretical work?",
                                    "options": {
                                        "Experimental laboratory work": {
                                            "step": 5,
                                            "analysis": "science_experimental",
                                            "courses": ["Basic Sciences (Physics/Chemistry/Maths)"]
                                        },
                                        "Theoretical research": {
                                            "step": 5,
                                            "analysis": "science_theoretical",
                                            "courses": ["Basic Sciences (Physics/Chemistry/Maths)", "Mathematics (B.Sc./M.Sc./Phd)"]
                                        }
                                    }
                                },
                                "Advanced research and PhD": {
                                    "step": 4,
                                    "question": "Which research area interests you for doctoral studies?",
                                    "options": {
                                        "Engineering research": {
                                            "step": 5,
                                            "analysis": "phd_engineering",
                                            "courses": ["Doctorate of Philosophy (Computer Science Engineering)", "Doctorate of Philosophy (Electrical Engineering)", "Doctorate of Philosophy (Mechanical Engineering)"]
                                        },
                                        "General research": {
                                            "step": 5,
                                            "analysis": "phd_general",
                                            "courses": ["Doctor of Philosophy"]
                                        }
                                    }
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
        Generate the next question based on 6-step tree navigation
        
        Args:
            conversation_history: Previous Q&A pairs
            question_number: Current question number (1-based)
            
        Returns:
            Question object with the next question
        """
        try:
            # Navigate the tree based on conversation history
            current_node = self._navigate_tree(conversation_history)
            
            # Check if we've reached step 5 (analysis) - this should be handled by should_recommend
            if current_node.get("step") == 5 or "courses" in current_node:
                # Generate a final confirmation or preference question
                return self._generate_final_question(conversation_history, question_number)
            
            # Extract question and options from current node
            question_text = current_node["question"]
            options = list(current_node["options"].keys())
            
            # Determine if this is the final question based on the step
            current_step = current_node.get("step", 1)
            is_final = current_step >= 4  # Steps 4+ can lead to recommendations
            
            return Question(
                question=question_text,
                question_type=QuestionType.MULTIPLE_CHOICE,
                options=options,
                is_final=is_final
            )
            
        except Exception as e:
            logger.error(f"Error generating question: {str(e)}")
            # Fallback question
            return self._get_fallback_question(question_number)
    
    def _navigate_tree(self, conversation_history: List[QuestionAnswer]) -> Dict[str, Any]:
        """
        Navigate the 6-step quiz tree based on conversation history
        
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
                # Answer not found in current options, return current node
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
        
        # Check if we've reached step 5 (analysis) or have course options
        return current_node.get("step") == 5 or "courses" in current_node
    
    def generate_course_recommendation(
        self, 
        conversation_history: List[QuestionAnswer], 
        available_courses: List[Course]
    ) -> Dict[str, Any]:
        """
        Generate course recommendation based on 6-step tree navigation
        
        Args:
            conversation_history: Complete Q&A history
            available_courses: List of available courses
            
        Returns:
            Dictionary with recommendation details
        """
        try:
            # Navigate to the analysis node
            current_node = self._navigate_tree(conversation_history)
            
            # Get the course recommendations from the analysis
            if "courses" not in current_node:
                logger.warning("No course recommendations found in current tree position")
                return self._get_fallback_recommendation(available_courses)
            
            recommended_course_names = current_node["courses"]
            analysis_type = current_node.get("analysis", "general_analysis")
            
            # Find the best matching course
            recommended_course = None
            for course_name in recommended_course_names:
                for course in available_courses:
                    if course.name.lower() == course_name.lower():
                        recommended_course = course
                        break
                if recommended_course:
                    break
            
            # If exact match not found, try partial matching
            if not recommended_course:
                for course_name in recommended_course_names:
                    for course in available_courses:
                        if any(keyword.lower() in course.name.lower() or 
                              keyword.lower() in ' '.join(course.tags or []).lower()
                              for keyword in course_name.lower().split()):
                            recommended_course = course
                            break
                    if recommended_course:
                        break
            
            # Fallback to first course if no match found
            if not recommended_course and available_courses:
                recommended_course = available_courses[0]
                logger.warning(f"No matching course found for {recommended_course_names}, using fallback")
            
            # Generate reasoning based on the 6-step path
            reasoning = self._generate_6step_reasoning(conversation_history, analysis_type, recommended_course.name if recommended_course else "")
            
            # Extract key factors from the 6-step conversation path
            key_factors = self._extract_6step_factors(conversation_history)
            
            return {
                "recommended_course": recommended_course,
                "confidence_score": 0.95,  # High confidence due to structured 6-step process
                "reasoning": reasoning,
                "key_matching_factors": key_factors
            }
            
        except Exception as e:
            logger.error(f"Error generating recommendation: {str(e)}")
            return self._get_fallback_recommendation(available_courses)
            
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
    def _generate_6step_reasoning(self, conversation_history: List[QuestionAnswer], analysis_type: str, course_name: str) -> str:
        """
        Generate reasoning based on the 6-step path taken through the decision tree
        
        Args:
            conversation_history: Complete Q&A history
            analysis_type: Type of analysis from the tree
            course_name: Recommended course name
            
        Returns:
            Reasoning string explaining the recommendation
        """
        if not conversation_history:
            return f"Based on general assessment, {course_name} appears to be a suitable choice."
        
        # Build reasoning from the 6-step decision path
        step_descriptions = []
        
        for i, qa in enumerate(conversation_history):
            if i == 0:
                step_descriptions.append(f"You selected {qa.answer} as your stream of interest")
            elif i == 1:
                step_descriptions.append(f"showed specific interest in {qa.answer}")
            elif i == 2:
                step_descriptions.append(f"indicated skills/experience in {qa.answer}")
            elif i == 3:
                step_descriptions.append(f"expressed preference for {qa.answer}")
            else:
                step_descriptions.append(f"chose {qa.answer}")
        
        path_text = ", ".join(step_descriptions)
        
        return (f"Following our 6-step career assessment: {path_text}. "
                f"This comprehensive analysis (type: {analysis_type}) shows that {course_name} "
                f"perfectly aligns with your interests, skills, and career preferences.")
    
    def _extract_6step_factors(self, conversation_history: List[QuestionAnswer]) -> List[str]:
        """
        Extract key matching factors from 6-step conversation history
        
        Args:
            conversation_history: Complete Q&A history
            
        Returns:
            List of key factors based on the 6-step process
        """
        factors = []
        
        step_labels = [
            "Stream Selection",
            "Interest Area",
            "Skills Assessment", 
            "Preferences",
            "Learning Style",
            "Career Goals"
        ]
        
        for i, qa in enumerate(conversation_history):
            if i < len(step_labels):
                factors.append(f"{step_labels[i]}: {qa.answer}")
            else:
                factors.append(f"Additional preference: {qa.answer}")
        
        # Add process-based factors
        factors.append("6-step structured assessment")
        factors.append("Comprehensive skill-interest matching")
        
        return factors[:7]  # Return max 7 factors
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
    
    def _generate_final_question(self, conversation_history: List[QuestionAnswer], question_number: int) -> Question:
        """
        Generate final preference questions before recommendation
        
        Args:
            conversation_history: Previous Q&A pairs
            question_number: Current question number
            
        Returns:
            Question object with final preference question
        """
        # Define final preference questions
        final_questions = [
            {
                "question": "What is your preferred learning pace?",
                "options": ["Self-paced", "Structured timeline", "Intensive program", "Flexible schedule"]
            },
            {
                "question": "How important is industry collaboration in your program?",
                "options": ["Very important", "Somewhat important", "Not important", "I prefer academic focus"]
            },
            {
                "question": "What is your primary career goal?",
                "options": ["High-paying job", "Research and innovation", "Entrepreneurship", "Social impact", "Work-life balance"]
            }
        ]
        
        # Select question based on what we haven't asked yet
        used_questions = {qa.question for qa in conversation_history}
        
        for final_q in final_questions:
            if final_q["question"] not in used_questions:
                return Question(
                    question=final_q["question"],
                    question_type=QuestionType.MULTIPLE_CHOICE,
                    options=final_q["options"],
                    is_final=True
                )
        
        # If all final questions are used, create a confirmation question
        return Question(
            question="Are you ready to see your personalized course recommendations?",
            question_type=QuestionType.MULTIPLE_CHOICE,
            options=["Yes, show me the recommendations", "I'd like to review my answers"],
            is_final=True
        )
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
        Check if we should provide a recommendation based on 6-step process
        
        Args:
            conversation_history: List of previous Q&A pairs
            
        Returns:
            True if we should recommend, False if more questions needed
        """
        try:
            # Check if we've reached step 5 (analysis) or have enough questions
            current_node = self._navigate_tree(conversation_history)
            
            # If we've reached step 5 (analysis) with course options, we can recommend
            if current_node.get("step") == 5 and "courses" in current_node:
                return True
                
            # If we have completed the main 4-step assessment, we can recommend
            if len(conversation_history) >= 4:
                return True
                
            # Otherwise, continue with questions
            return False
            
        except Exception as e:
            logger.error(f"Error checking if should recommend: {str(e)}")
            # Fallback: recommend after 4 questions for the 6-step process
            return len(conversation_history) >= 4

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
                    - dont use *emojies*, or symols or punctuation marks expect comma,and dot or interogative marks
                    - never use *,',",`
                    Be conversational, helpful, and encouraging. Keep responses SHORT and CONCISE - aim for 1-2 sentences or 1 short paragraph maximum.
                    Provide direct, actionable advice without lengthy explanations."""
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
                max_tokens=250,  # Reduced from 1000 to 250 for shorter responses
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
