"""
Course data management utilities
"""

import json
import os
from typing import List, Dict, Any
from models.schemas import Course

class CourseDataManager:
    """Manages course data loading and operations"""
    
    def __init__(self, data_file: str = "data/courses.json"):
        """Initialize course data manager"""
        self.data_file = data_file
        self.courses: List[Course] = []
        self.load_courses()
    
    def load_courses(self) -> List[Course]:
        """Load courses from JSON file"""
        try:
            if os.path.exists(self.data_file):
                with open(self.data_file, 'r', encoding='utf-8') as f:
                    courses_data = json.load(f)
                    
                # Convert to Course objects
                self.courses = []
                for course_dict in courses_data:
                    try:
                        course = Course(**course_dict)
                        self.courses.append(course)
                    except Exception as e:
                        print(f"Error loading course {course_dict.get('name', 'Unknown')}: {e}")
                        continue
                        
                print(f"Loaded {len(self.courses)} courses")
                return self.courses
            else:
                print(f"Course data file {self.data_file} not found. Using sample data.")
                return self._create_sample_courses()
                
        except Exception as e:
            print(f"Error loading courses: {e}")
            return self._create_sample_courses()
    
    def get_all_courses(self) -> List[Course]:
        """Get all available courses"""
        return self.courses
    
    def get_courses_by_tags(self, tags: List[str]) -> List[Course]:
        """Get courses filtered by tags"""
        if not tags:
            return self.courses
        
        filtered_courses = []
        for course in self.courses:
            if course.tags:
                course_tags = [tag.lower() for tag in course.tags]
                search_tags = [tag.lower() for tag in tags]
                
                # Check if any search tag matches any course tag
                if any(search_tag in course_tags for search_tag in search_tags):
                    filtered_courses.append(course)
        
        return filtered_courses
    
    def search_courses(self, query: str) -> List[Course]:
        """Search courses by name, description, or tags"""
        query = query.lower()
        matching_courses = []
        
        for course in self.courses:
            # Search in name
            if query in course.name.lower():
                matching_courses.append(course)
                continue
            
            # Search in description
            if course.description and query in course.description.lower():
                matching_courses.append(course)
                continue
            
            # Search in tags
            if course.tags:
                for tag in course.tags:
                    if query in tag.lower():
                        matching_courses.append(course)
                        break
        
        return matching_courses
    
    def _create_sample_courses(self) -> List[Course]:
        """Create sample course data if file doesn't exist"""
        sample_courses = [
            {
                "name": "Full Stack Web Development",
                "link": "https://example.com/fullstack",
                "tags": ["web development", "javascript", "react", "node.js", "programming"],
                "description": "Comprehensive course covering front-end and back-end web development",
                "provider": "TechEd",
                "duration": "6 months",
                "level": "Beginner to Intermediate"
            },
            {
                "name": "Data Science and Machine Learning",
                "link": "https://example.com/datascience",
                "tags": ["data science", "machine learning", "python", "statistics", "AI"],
                "description": "Learn data analysis, visualization, and machine learning techniques",
                "provider": "DataLearn",
                "duration": "8 months",
                "level": "Intermediate"
            },
            {
                "name": "Digital Marketing Mastery",
                "link": "https://example.com/digitalmarketing",
                "tags": ["marketing", "social media", "SEO", "content marketing", "business"],
                "description": "Complete digital marketing course covering all major channels",
                "provider": "MarketPro",
                "duration": "4 months",
                "level": "Beginner"
            },
            {
                "name": "Graphic Design Fundamentals",
                "link": "https://example.com/graphicdesign",
                "tags": ["design", "photoshop", "illustrator", "creative", "visual arts"],
                "description": "Master the principles of graphic design and industry-standard tools",
                "provider": "DesignAcademy",
                "duration": "5 months",
                "level": "Beginner"
            },
            {
                "name": "Cybersecurity Specialist",
                "link": "https://example.com/cybersecurity",
                "tags": ["cybersecurity", "security", "networking", "ethical hacking", "IT"],
                "description": "Comprehensive cybersecurity training with hands-on labs",
                "provider": "SecureLearn",
                "duration": "10 months",
                "level": "Intermediate to Advanced"
            },
            {
                "name": "Business Analytics",
                "link": "https://example.com/businessanalytics",
                "tags": ["business", "analytics", "data analysis", "excel", "tableau"],
                "description": "Learn to make data-driven business decisions",
                "provider": "BizAnalytics",
                "duration": "6 months",
                "level": "Beginner to Intermediate"
            },
            {
                "name": "Mobile App Development",
                "link": "https://example.com/mobiledev",
                "tags": ["mobile development", "android", "iOS", "react native", "programming"],
                "description": "Build mobile apps for Android and iOS platforms",
                "provider": "MobileDev Pro",
                "duration": "7 months",
                "level": "Intermediate"
            },
            {
                "name": "Project Management Professional",
                "link": "https://example.com/projectmanagement",
                "tags": ["project management", "PMP", "agile", "scrum", "leadership"],
                "description": "Comprehensive project management training with PMP certification prep",
                "provider": "PMInstitute",
                "duration": "4 months",
                "level": "Intermediate"
            },
            {
                "name": "Content Writing and Copywriting",
                "link": "https://example.com/contentwriting",
                "tags": ["writing", "content creation", "copywriting", "communication", "marketing"],
                "description": "Master the art of persuasive and engaging content creation",
                "provider": "WriteAcademy",
                "duration": "3 months",
                "level": "Beginner"
            },
            {
                "name": "Financial Analysis and Investment",
                "link": "https://example.com/finance",
                "tags": ["finance", "investment", "analysis", "accounting", "business"],
                "description": "Learn financial modeling, analysis, and investment strategies",
                "provider": "FinanceEd",
                "duration": "6 months",
                "level": "Intermediate"
            }
        ]
        
        # Convert to Course objects
        courses = []
        for course_dict in sample_courses:
            try:
                course = Course(**course_dict)
                courses.append(course)
            except Exception as e:
                print(f"Error creating sample course: {e}")
                continue
        
        self.courses = courses
        
        # Save sample data to file
        self._save_courses_to_file()
        
        return courses
    
    def _save_courses_to_file(self):
        """Save current courses to JSON file"""
        try:
            # Ensure data directory exists
            os.makedirs(os.path.dirname(self.data_file), exist_ok=True)
            
            # Convert Course objects to dictionaries
            courses_data = [course.dict() for course in self.courses]
            
            with open(self.data_file, 'w', encoding='utf-8') as f:
                json.dump(courses_data, f, indent=2, ensure_ascii=False)
                
            print(f"Saved {len(self.courses)} courses to {self.data_file}")
            
        except Exception as e:
            print(f"Error saving courses to file: {e}")

# Global course data manager instance
course_manager = CourseDataManager()
