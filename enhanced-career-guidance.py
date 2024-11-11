from enum import Enum
from typing import List, Dict, Optional, Tuple
from pydantic import BaseModel
from datetime import datetime
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
import pandas as pd
from sklearn.preprocessing import MinMaxScaler
from collections import defaultdict

# Existing data models remain the same...
# [Previous model definitions for SkillLevel, Skill, CareerGoal, Course, AssessmentResult, StudentProfile]

class CareerGuidanceSystem:
    def __init__(self):
        # Initialize with sample data
        self.courses_db = self._load_courses()
        self.skills_demand_data = self._load_skills_demand()
        self.career_paths_data = self._load_career_paths()
        self.industry_requirements = self._load_industry_requirements()
        
        # Initialize recommendation engine components
        self.skill_vectors = self._build_skill_vectors()
        self.course_similarity_matrix = self._build_course_similarity_matrix()

    def _load_courses(self) -> List[Course]:
        """Load sample course data"""
        return [
            Course(
                id="PY101",
                title="Python Fundamentals",
                skills=["Python", "Programming Basics"],
                difficulty=SkillLevel.BEGINNER,
                duration_weeks=6,
                rating=4.5,
                completion_rate=0.85,
                prerequisites=[]
            ),
            Course(
                id="DA201",
                title="Data Analysis with Python",
                skills=["Python", "Data Analysis", "Pandas"],
                difficulty=SkillLevel.INTERMEDIATE,
                duration_weeks=8,
                rating=4.7,
                completion_rate=0.78,
                prerequisites=["Python"]
            ),
            # Add more sample courses...
        ]

    def _load_skills_demand_data(self) -> Dict[str, Dict]:
        """Load sample skills demand data with temporal trends"""
        return {
            "Python": {
                "current_demand": 0.85,
                "growth_rate": 0.15,
                "industry_distribution": {
                    "Technology": 0.6,
                    "Finance": 0.3,
                    "Healthcare": 0.1
                }
            },
            "Data Analysis": {
                "current_demand": 0.9,
                "growth_rate": 0.2,
                "industry_distribution": {
                    "Technology": 0.4,
                    "Finance": 0.4,
                    "Healthcare": 0.2
                }
            },
            # Add more skills...
        }

    def _build_skill_vectors(self) -> Dict[str, np.ndarray]:
        """Build vector representations of skills based on industry requirements and demand"""
        skill_vectors = {}
        
        for skill in self.skills_demand_data:
            # Create feature vector incorporating:
            # - Current demand
            # - Growth rate
            # - Industry distribution
            # - Related skills
            features = []
            skill_data = self.skills_demand_data[skill]
            
            features.extend([
                skill_data["current_demand"],
                skill_data["growth_rate"]
            ])
            
            # Add industry distribution
            for industry in sorted(skill_data["industry_distribution"].keys()):
                features.append(skill_data["industry_distribution"][industry])
            
            skill_vectors[skill] = np.array(features)
        
        return skill_vectors

    def _build_course_similarity_matrix(self) -> np.ndarray:
        """Build course similarity matrix based on multiple features"""
        n_courses = len(self.courses_db)
        similarity_matrix = np.zeros((n_courses, n_courses))
        
        for i, course1 in enumerate(self.courses_db):
            for j, course2 in enumerate(self.courses_db):
                if i == j:
                    similarity_matrix[i][j] = 1.0
                else:
                    similarity_matrix[i][j] = self._calculate_course_similarity(
                        course1, course2
                    )
        
        return similarity_matrix

    def _calculate_course_similarity(self, course1: Course, course2: Course) -> float:
        """Calculate similarity between courses based on multiple factors"""
        # Skill overlap
        common_skills = set(course1.skills) & set(course2.skills)
        skill_similarity = len(common_skills) / max(
            len(course1.skills), len(course2.skills)
        )
        
        # Difficulty progression
        difficulty_diff = abs(
            course1.difficulty.value - course2.difficulty.value
        )
        difficulty_similarity = 1 - (difficulty_diff / len(SkillLevel))
        
        # Rating and completion rate similarity
        rating_similarity = 1 - abs(course1.rating - course2.rating) / 5
        completion_similarity = 1 - abs(
            course1.completion_rate - course2.completion_rate
        )
        
        # Weighted combination
        weights = {
            "skill": 0.4,
            "difficulty": 0.3,
            "rating": 0.2,
            "completion": 0.1
        }
        
        similarity = (
            weights["skill"] * skill_similarity +
            weights["difficulty"] * difficulty_similarity +
            weights["rating"] * rating_similarity +
            weights["completion"] * completion_similarity
        )
        
        return similarity

    def generate_learning_path(
        self,
        student: StudentProfile,
        career_goal: CareerGoal
    ) -> List[Course]:
        """Enhanced learning path generation with sophisticated optimization"""
        # Calculate skill gaps
        skill_gaps = self._identify_skill_gaps(student, career_goal)
        
        # Get initial course recommendations
        candidate_courses = []
        for skill, gap_score in skill_gaps.items():
            suitable_courses = self._find_suitable_courses(
                skill,
                student.skills.get(skill, None),
                gap_score
            )
            candidate_courses.extend(suitable_courses)
        
        # Calculate course utilities
        course_utilities = self._calculate_course_utilities(
            candidate_courses,
            student,
            career_goal,
            skill_gaps
        )
        
        # Optimize learning path using dynamic programming
        optimized_path = self._optimize_learning_path_dp(
            candidate_courses,
            course_utilities,
            career_goal.timeline_months * 4  # Convert to weeks
        )
        
        return optimized_path

    def _calculate_course_utilities(
        self,
        courses: List[Course],
        student: StudentProfile,
        career_goal: CareerGoal,
        skill_gaps: Dict[str, float]
    ) -> Dict[str, float]:
        """Calculate utility scores for courses based on multiple factors"""
        utilities = {}
        
        for course in courses:
            # Base utility from skill gap coverage
            skill_coverage = sum(
                skill_gaps.get(skill, 0)
                for skill in course.skills
            ) / len(course.skills)
            
            # Adjustment based on course difficulty match
            difficulty_match = self._calculate_difficulty_match(
                course, student
            )
            
            # Adjustment based on career relevance
            career_relevance = self._calculate_career_relevance(
                course, career_goal
            )
            
            # Adjustment based on prerequisite efficiency
            prerequisite_efficiency = self._calculate_prerequisite_efficiency(
                course, student
            )
            
            # Combined utility score
            utility = (
                0.4 * skill_coverage +
                0.2 * difficulty_match +
                0.25 * career_relevance +
                0.15 * prerequisite_efficiency
            )
            
            utilities[course.id] = utility
        
        return utilities

    def _optimize_learning_path_dp(
        self,
        courses: List[Course],
        utilities: Dict[str, float],
        max_weeks: int
    ) -> List[Course]:
        """Optimize learning path using dynamic programming"""
        n = len(courses)
        
        # Create DP table: [weeks][course_subset]
        dp = [{} for _ in range(max_weeks + 1)]
        dp[0][frozenset()] = (0, [])
        
        for weeks in range(max_weeks + 1):
            for subset in dp[weeks].keys():
                for course in courses:
                    if course.id not in subset:
                        new_weeks = weeks + course.duration_weeks
                        if new_weeks <= max_weeks:
                            new_subset = frozenset(list(subset) + [course.id])
                            new_utility = dp[weeks][subset][0] + utilities[course.id]
                            
                            if (
                                new_subset not in dp[new_weeks] or
                                new_utility > dp[new_weeks][new_subset][0]
                            ):
                                dp[new_weeks][new_subset] = (
                                    new_utility,
                                    dp[weeks][subset][1] + [course]
                                )
        
        # Find best path
        best_utility = -1
        best_path = []
        
        for weeks in range(max_weeks + 1):
            for subset, (utility, path) in dp[weeks].items():
                if utility > best_utility:
                    best_utility = utility
                    best_path = path
        
        return best_path

    def provide_interventions(
        self,
        student: StudentProfile
    ) -> Dict[str, List[Dict[str, str]]]:
        """Enhanced intervention system with detailed strategies"""
        interventions = defaultdict(list)
        
        # Analyze learning patterns
        learning_patterns = self._analyze_learning_patterns(student)
        engagement_metrics = self._calculate_engagement_metrics(student)
        progress_indicators = self._analyze_progress_indicators(student)
        
        # Skill building interventions
        if progress_indicators["slow_progress_skills"]:
            interventions["skill_building"].extend([
                {
                    "type": "practice_recommendation",
                    "content": f"Additional practice exercises for {skill}",
                    "urgency": "high" if gap > 0.7 else "medium",
                    "action_items": self._generate_practice_items(skill)
                }
                for skill, gap in progress_indicators["slow_progress_skills"].items()
            ])
        
        # Career preparation interventions
        career_readiness = self._assess_career_readiness(student)
        if career_readiness < 0.7:
            interventions["career_preparation"].extend([
                {
                    "type": "industry_preparation",
                    "content": "Industry-specific project recommendation",
                    "action_items": self._generate_project_recommendations(student)
                },
                {
                    "type": "skill_certification",
                    "content": "Recommended certifications",
                    "action_items": self._recommend_certifications(student)
                }
            ])
        
        # Engagement interventions
        if engagement_metrics["engagement_score"] < 0.8:
            interventions["engagement"].extend([
                {
                    "type": "motivation_boost",
                    "content": self._generate_motivation_message(student),
                    "action_items": self._generate_engagement_activities(student)
                }
            ])
        
        return dict(interventions)

    def _analyze_learning_patterns(self, student: StudentProfile) -> Dict:
        """Analyze student's learning patterns and behaviors"""
        patterns = {
            "completion_rates": {},
            "learning_speed": {},
            "preferred_times": [],
            "struggle_areas": []
        }
        
        # Analyze course completion patterns
        for course_id in student.completed_courses:
            completion_time = self._get_course_completion_time(student, course_id)
            patterns["completion_rates"][course_id] = completion_time
        
        # Identify learning speed for different skills
        for skill_name, skill in student.skills.items():
            progress_rate = self._calculate_skill_progress_rate(student, skill_name)
            patterns["learning_speed"][skill_name] = progress_rate
        
        return patterns

    # Additional helper methods...

# API Endpoints (FastAPI implementation)
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

guidance_system = CareerGuidanceSystem()

@app.post("/api/assess-skills")
async def assess_skills(student_id: str):
    try:
        student = load_student(student_id)  # Implementation needed
        results = guidance_system.assess_student_skills(student)
        return {"status": "success", "results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/generate-learning-path")
async def generate_learning_path(student_id: str, career_goal: CareerGoal):
    try:
        student = load_student(student_id)  # Implementation needed
        path = guidance_system.generate_learning_path(student, career_goal)
        return {"status": "success", "learning_path": path}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/interventions/{student_id}")
async def get_interventions(student_id: str):
    try:
        student = load_student(student_id)  # Implementation needed
        interventions = guidance_system.provide_interventions(student)
        return {"status": "success", "interventions": interventions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/progress/{student_id}")
async def track_progress(student_id: str):
    try:
        student = load_student(student_id)  # Implementation needed
        progress = guidance_system.track_progress(student)
        return {"status": "success", "progress": progress}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
