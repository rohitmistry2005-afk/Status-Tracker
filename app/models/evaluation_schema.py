# app/models/evaluation_schema.py

from typing import (
    Any,
    Dict,
    List,
    Optional,
)

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    field_validator,
)

# =========================================================
# 🔹 CONSTANTS
# =========================================================

VALID_STATUSES = {

    "SELECTED",

    "STRONG",

    "REVIEW",

    "REJECTED",
}

VALID_LOCATIONS = {

    "same",

    "nearby",

    "remote",
}

# =========================================================
# 🔹 BASE MODEL
# =========================================================

class BaseSchema(
    BaseModel
):

    model_config = ConfigDict(

        extra="allow",

        validate_assignment=True,

        populate_by_name=True,
    )

# =========================================================
# 🔹 SAFE HELPERS
# =========================================================

def safe_string(
    value: Any
) -> str:

    if value is None:

        return ""

    return str(value).strip()


def safe_skill_list(
    value: Any
) -> List[str]:

    if not isinstance(
        value,
        list,
    ):

        return []

    cleaned = []

    for skill in value:

        normalized = (
            str(skill)
            .strip()
            .lower()
        )

        if normalized:

            cleaned.append(
                normalized
            )

    return cleaned


def safe_float(
    value: Any,
    default: float = 0.0
) -> float:

    try:

        if value is None:

            return default

        return float(value)

    except Exception:

        return default

# =========================================================
# 🔹 BASIC MODELS
# =========================================================

class Resume(
    BaseSchema
):

    score: float = Field(
        default=0,
        ge=0,
        le=100,
    )


class Certificate(
    BaseSchema
):

    score: float = Field(
        default=0,
        ge=0,
        le=100,
    )


class Communication(
    BaseSchema
):

    score: float = Field(
        default=7,
        ge=0,
        le=10,
    )


class Tech(
    BaseSchema
):

    score: float = Field(
        default=7,
        ge=0,
        le=10,
    )

    skills: List[str] = Field(
        default_factory=list
    )

    @field_validator(
        "skills"
    )
    @classmethod
    def normalize_skills(
        cls,
        v
    ):

        return safe_skill_list(v)


class StudentFeedback(
    BaseSchema
):

    rating: float = Field(
        default=7,
        ge=0,
        le=10,
    )

# =========================================================
# 🔹 EDUCATION
# =========================================================

class Education(
    BaseSchema
):

    degree: str = ""

    field: str = ""

    domain: str = ""

# =========================================================
# 🔹 FLAGS
# =========================================================

class SkipFlags(
    BaseSchema
):

    domain_mismatch: bool = False

    low_communication: bool = False

# =========================================================
# 🔹 MAIN INPUT
# =========================================================

class CandidateInput(
    BaseSchema
):

    # -----------------------------------------------------
    # BASIC
    # -----------------------------------------------------

    teacher_id: str = ""

    name: str = ""

    location: str = "same"

    # -----------------------------------------------------
    # EDUCATION
    # -----------------------------------------------------

    education: Optional[
        Education
    ] = None

    # -----------------------------------------------------
    # OPTIONAL DOCUMENT SCORES
    # -----------------------------------------------------

    resume: Optional[
        Resume
    ] = None

    certificate: Optional[
        Certificate
    ] = None

    # -----------------------------------------------------
    # CORE SCORING
    # -----------------------------------------------------

    communication: Optional[
        Communication
    ] = Field(
        default_factory=Communication
    )

    # FRONTEND COMPATIBILITY
    tech: Optional[
        Tech
    ] = Field(
        default_factory=Tech
    )

    # BACKEND COMPATIBILITY
    technical: Optional[
        Tech
    ] = None

    student_feedback: Optional[
        StudentFeedback
    ] = Field(
        default_factory=StudentFeedback
    )

    # FRONTEND COMPATIBILITY
    feedback: Optional[
        StudentFeedback
    ] = None

    # -----------------------------------------------------
    # EXPERIENCE
    # -----------------------------------------------------

    experience_years: Optional[
        float
    ] = Field(
        default=0,
        ge=0,
        le=50,
    )

    # -----------------------------------------------------
    # SKILLS
    # -----------------------------------------------------

    skills: List[str] = Field(
        default_factory=list
    )

    required_skills: List[
        str
    ] = Field(
        default_factory=list
    )

    # -----------------------------------------------------
    # ACHIEVEMENTS
    # -----------------------------------------------------

    achievements: Optional[
        int
    ] = Field(
        default=0,
        ge=0,
        le=100,
    )

    # -----------------------------------------------------
    # FLAGS
    # -----------------------------------------------------

    skip_flags: SkipFlags = Field(
        default_factory=SkipFlags
    )

    # =====================================================
    # 🔹 VALIDATORS
    # =====================================================

    @field_validator(
        "teacher_id"
    )
    @classmethod
    def validate_teacher_id(
        cls,
        v
    ):

        return safe_string(v)

    @field_validator(
        "name"
    )
    @classmethod
    def validate_name(
        cls,
        v
    ):

        return safe_string(v)

    @field_validator(
        "location"
    )
    @classmethod
    def validate_location(
        cls,
        v
    ):

        value = (
            safe_string(v)
            .lower()
        )

        if value not in VALID_LOCATIONS:

            return "same"

        return value

    @field_validator(
        "skills"
    )
    @classmethod
    def validate_skills(
        cls,
        v
    ):

        return safe_skill_list(v)

    @field_validator(
        "required_skills"
    )
    @classmethod
    def validate_required_skills(
        cls,
        v
    ):

        return safe_skill_list(v)

    @field_validator(
        "experience_years",
        mode="before",
    )
    @classmethod
    def validate_experience(
        cls,
        v
    ):

        return safe_float(v, 0)

    # =====================================================
    # 🔹 POST INIT NORMALIZATION
    # =====================================================

    def model_post_init(
        self,
        __context
    ):

        # -------------------------------------------------
        # technical → tech
        # -------------------------------------------------

        if (

            self.tech is None

            and

            self.technical is not None

        ):

            self.tech = (
                self.technical
            )

        # -------------------------------------------------
        # feedback → student_feedback
        # -------------------------------------------------

        if (

            self.student_feedback is None

            and

            self.feedback is not None

        ):

            self.student_feedback = (
                self.feedback
            )

        # -------------------------------------------------
        # SAFE DEFAULTS
        # -------------------------------------------------

        if self.communication is None:

            self.communication = (
                Communication()
            )

        if self.tech is None:

            self.tech = (
                Tech()
            )

        if self.student_feedback is None:

            self.student_feedback = (
                StudentFeedback()
            )

# =========================================================
# 🔹 NORMALIZED INTERNAL
# =========================================================

class NormalizedData(
    BaseSchema
):

    communication: float = Field(
        default=0,
        ge=0,
        le=10,
    )

    technical: float = Field(
        default=0,
        ge=0,
        le=10,
    )

    domain_score: float = Field(
        default=0,
        ge=0,
        le=10,
    )

    experience: float = Field(
        default=0,
        ge=0,
        le=10,
    )

    feedback: float = Field(
        default=0,
        ge=0,
        le=10,
    )

    location: float = Field(
        default=0,
        ge=0,
        le=10,
    )

    achievement_bonus: float = Field(
        default=0,
        ge=0,
        le=10,
    )

    skills: List[str] = Field(
        default_factory=list
    )

    required_skills: List[
        str
    ] = Field(
        default_factory=list
    )

# =========================================================
# 🔹 DOMAIN BREAKDOWN
# =========================================================

class DomainBreakdown(
    BaseSchema
):

    knowledge: float = 0

    relevance: float = 0

    final: float = 0

# =========================================================
# 🔹 SCORE BREAKDOWN
# =========================================================

class ScoreBreakdown(
    BaseSchema
):

    communication: float = 0

    technical: float = 0

    domain: float = 0

    experience: float = 0

    location: float = 0

    feedback: float = 0

    achievement: float = 0

# =========================================================
# 🔹 ADJUSTMENTS
# =========================================================

class AdjustmentBreakdown(
    BaseSchema
):

    bonus: float = 0

    penalty: float = 0

    total_adjustment: float = 0

# =========================================================
# 🔹 INSIGHTS
# =========================================================

class Insights(
    BaseSchema
):

    summary: str = ""

    strengths: List[str] = Field(
        default_factory=list
    )

    weaknesses: List[str] = Field(
        default_factory=list
    )

    recommendations: List[
        str
    ] = Field(
        default_factory=list
    )

    flags: List[str] = Field(
        default_factory=list
    )

# =========================================================
# 🔹 FINAL RESPONSE
# =========================================================

class EvaluationResponse(
    BaseSchema
):

    teacher_id: str = ""

    name: str = ""

    final_score: float = Field(
        default=0,
        ge=0,
        le=100,
    )

    status: str = "REVIEW"

    score_breakdown: ScoreBreakdown = Field(
        default_factory=ScoreBreakdown
    )

    adjustments: AdjustmentBreakdown = Field(
        default_factory=AdjustmentBreakdown
    )

    insights: Insights = Field(
        default_factory=Insights
    )

    domain_breakdown: Optional[
        DomainBreakdown
    ] = None

    metadata: Optional[
        Dict[str, Any]
    ] = None

    @field_validator(
        "status"
    )
    @classmethod
    def validate_status(
        cls,
        v
    ):

        if v not in VALID_STATUSES:

            return "REVIEW"

        return v

# =========================================================
# 🔹 BATCH INPUT
# =========================================================

class BatchEvaluationInput(
    BaseSchema
):

    candidates: List[
        CandidateInput
    ] = Field(
        default_factory=list
    )

# =========================================================
# 🔹 BATCH RESPONSE
# =========================================================

class BatchEvaluationResponse(
    BaseSchema
):

    total_candidates: int = 0

    selected_count: int = 0

    strong_count: int = 0

    review_count: int = 0

    rejected_count: int = 0

    average_score: float = 0

    results: List[
        EvaluationResponse
    ] = Field(
        default_factory=list
    )

# =========================================================
# 🔹 DEBUG TRACE
# =========================================================

class DebugTrace(
    BaseSchema
):

    normalized_data: Optional[
        NormalizedData
    ] = None

    weighted_score: Optional[
        float
    ] = None

    domain_breakdown: Optional[
        DomainBreakdown
    ] = None

    final_score: Optional[
        float
    ] = None

    status: Optional[
        str
    ] = None

# =========================================================
# 🔹 META
# =========================================================

class EvaluationMeta(
    BaseSchema
):

    version: str = "3.0"

    engine_type: str = (
        "rule-based-ai"
    )

    architecture: str = (
        "modular-pipeline"
    )

    explainable: bool = True

# =========================================================
# 🔹 DETAILED RESPONSE
# =========================================================

class DetailedEvaluationResponse(
    EvaluationResponse
):

    debug: Optional[
        DebugTrace
    ] = None

    meta: Optional[
        EvaluationMeta
    ] = None

# =========================================================
# 🔹 HEALTH
# =========================================================

class HealthResponse(
    BaseSchema
):

    success: bool = True

    status: str = "healthy"

    service: str = (
        "Teacher Evaluation Engine"
    )

    version: str = "3.0"

# =========================================================
# 🔹 ERROR
# =========================================================

class ErrorResponse(
    BaseSchema
):

    success: bool = False

    error: str

    details: Optional[
        Any
    ] = None

# =========================================================
# 🔹 WEIGHTS
# =========================================================

class WeightConfig(
    BaseSchema
):

    communication: float = 0.25

    technical: float = 0.20

    domain: float = 0.20

    experience: float = 0.15

    location: float = 0.08

    feedback: float = 0.07

    achievement: float = 0.05

# =========================================================
# 🔹 API RESPONSE
# =========================================================

class APIResponse(
    BaseSchema
):

    success: bool = True

    message: str = ""

    data: Optional[
        Any
    ] = None

# =========================================================
# 🔹 END
# =========================================================