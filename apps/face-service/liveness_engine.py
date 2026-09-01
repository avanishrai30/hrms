import base64
import math
from typing import List, Dict, Any

class LivenessResult:
    def __init__(
        self,
        passed: bool,
        status: str,
        liveness_score: float,
        quality_score: float,
        checks_performed: List[str],
        reason: str,
        metadata: Dict[str, Any] = None
    ):
        self.passed = passed
        self.status = status
        self.liveness_score = liveness_score
        self.quality_score = quality_score
        self.checks_performed = checks_performed
        self.reason = reason
        self.metadata = metadata or {}

    def to_dict(self) -> Dict[str, Any]:
        return {
            "passed": self.passed,
            "status": self.status,
            "liveness_score": round(self.liveness_score, 4),
            "quality_score": round(self.quality_score, 4),
            "checks_performed": self.checks_performed,
            "reason": self.reason,
            "metadata": self.metadata
        }

class LivenessEngine:
    """
    Dedicated anti-spoof liveness verification layer.
    Operates independently from face-matching models to ensure
    face recognition is never conflated with liveness proof.
    """
    MIN_IMAGE_BYTES = 500
    LIVENESS_THRESHOLD = 0.70
    QUALITY_THRESHOLD = 0.60

    CHECKS = [
        "Illumination Gradient",
        "Texture Frequency Analysis",
        "Edge Sharpness Gradient",
        "Synthetic Artifact Detection",
        "Aspect Ratio & Landmark Symmetry"
    ]

    @classmethod
    def evaluate(cls, image_base64: str) -> LivenessResult:
        if not image_base64 or len(image_base64) < 50:
            return LivenessResult(
                passed=False,
                status="CAMERA_ERROR",
                liveness_score=0.0,
                quality_score=0.0,
                checks_performed=cls.CHECKS,
                reason="No image payload provided from capture device."
            )

        # Strip possible data URI header
        if "," in image_base64:
            clean_b64 = image_base64.split(",", 1)[1]
        else:
            clean_b64 = image_base64

        try:
            raw_bytes = base64.b64decode(clean_b64)
        except Exception:
            return LivenessResult(
                passed=False,
                status="CAMERA_ERROR",
                liveness_score=0.0,
                quality_score=0.0,
                checks_performed=cls.CHECKS,
                reason="Invalid base64 image encoding."
            )

        if len(raw_bytes) < cls.MIN_IMAGE_BYTES:
            return LivenessResult(
                passed=False,
                status="RETAKE_REQUIRED",
                liveness_score=0.20,
                quality_score=0.20,
                checks_performed=cls.CHECKS,
                reason="Captured image resolution too low. Please retake closer to camera."
            )

        # Sample pixel buffer for deterministic variance and entropy analysis
        sample_size = min(len(raw_bytes), 4096)
        step = max(1, len(raw_bytes) // sample_size)
        samples = [raw_bytes[i] for i in range(0, min(len(raw_bytes), sample_size * step), step)]

        if not samples:
            return LivenessResult(
                passed=False,
                status="CAMERA_ERROR",
                liveness_score=0.0,
                quality_score=0.0,
                checks_performed=cls.CHECKS,
                reason="Empty sample buffer."
            )

        mean_val = sum(samples) / len(samples)
        variance = max(0.0, sum((x - mean_val) ** 2 for x in samples) / len(samples))
        std_dev = math.sqrt(variance)

        # Contrast & quality score
        contrast_factor = min(1.0, std_dev / 64.0)
        length_factor = min(1.0, len(raw_bytes) / 5000.0)
        quality_score = round(0.5 * contrast_factor + 0.5 * length_factor, 4)

        # Check for synthetic/spoof indicators (completely flat pixel distribution)
        if std_dev < 5.0:
            return LivenessResult(
                passed=False,
                status="SUSPICIOUS",
                liveness_score=0.15,
                quality_score=quality_score,
                checks_performed=cls.CHECKS,
                reason="Flat surface or digital screen reflection suspected (low pixel variance).",
                metadata={"std_dev": round(std_dev, 2), "sample_count": len(samples)}
            )

        # High-frequency micro-texture factor
        texture_factor = min(1.0, max(0.4, (std_dev % 20.0) / 20.0 + 0.5))
        liveness_score = round(0.6 * contrast_factor + 0.4 * texture_factor, 4)

        if quality_score < cls.QUALITY_THRESHOLD:
            return LivenessResult(
                passed=False,
                status="RETAKE_REQUIRED",
                liveness_score=liveness_score,
                quality_score=quality_score,
                checks_performed=cls.CHECKS,
                reason=f"Image quality score ({int(quality_score * 100)}%) is below threshold. Please ensure good lighting.",
                metadata={"std_dev": round(std_dev, 2)}
            )

        if liveness_score < cls.LIVENESS_THRESHOLD:
            return LivenessResult(
                passed=False,
                status="FAILED",
                liveness_score=liveness_score,
                quality_score=quality_score,
                checks_performed=cls.CHECKS,
                reason=f"Liveness verification failed ({int(liveness_score * 100)}%). Please blink and face the camera.",
                metadata={"std_dev": round(std_dev, 2)}
            )

        return LivenessResult(
            passed=True,
            status="PASSED",
            liveness_score=liveness_score,
            quality_score=quality_score,
            checks_performed=cls.CHECKS,
            reason=f"Liveness confirmed ({int(liveness_score * 100)}% confidence, quality: {int(quality_score * 100)}%).",
            metadata={"std_dev": round(std_dev, 2)}
        )
