"""
Fake Pattern Generator - Demo Implementation

This is a STUB implementation for demonstration purposes only.
Contains NO proprietary algorithms or confidential IP.

所有专有算法已被占位符逻辑替换 - 仅用于演示
"""

from typing import Dict, Any, List, Optional
import time
import random


class FakePatternGenerator:
    """
    Fake Pattern Generator for public demos

    Returns placeholder pattern data with realistic structure
    but NO proprietary flattening, UV unwrapping, or seam optimization algorithms.

    公开演示用的假纸样生成器 - 不含任何专有算法
    """

    def __init__(self):
        self.last_generation_time = 0
        self.metrics = {}

    async def generate(
        self,
        design: Dict[str, Any],
        params: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Generate fake 2D pattern from 3D design

        Returns placeholder pattern structure for demo purposes.
        DOES NOT contain real pattern generation algorithms.
        """
        start_time = time.time()

        # Placeholder pattern generation - NO REAL ALGORITHM
        pattern = {
            "id": f"pattern_{random.randint(1000, 9999)}",
            "design_id": design.get("id", "unknown"),
            "pieces": [
                {
                    "id": "front_panel",
                    "type": "front",
                    "contour": [
                        {"x": 0, "y": 0},
                        {"x": 50, "y": 0},
                        {"x": 50, "y": 70},
                        {"x": 0, "y": 70}
                    ],
                    "seams": [
                        {"id": "side_seam", "type": "plain", "points": [[50, 0], [50, 70]]}
                    ],
                    "notches": []
                },
                {
                    "id": "back_panel",
                    "type": "back",
                    "contour": [
                        {"x": 0, "y": 0},
                        {"x": 50, "y": 0},
                        {"x": 50, "y": 70},
                        {"x": 0, "y": 70}
                    ],
                    "seams": [
                        {"id": "side_seam", "type": "plain", "points": [[0, 0], [0, 70]]}
                    ],
                    "notches": []
                }
            ],
            "metadata": {
                "version": "1.0.0-demo",
                "generated_by": "FakePatternGenerator",
                "note": "DEMO ONLY - Not real pattern data"
            }
        }

        self.last_generation_time = int((time.time() - start_time) * 1000)
        self.metrics = {
            "generation_time_ms": self.last_generation_time,
            "num_pieces": len(pattern["pieces"]),
            "total_area": 7000.0,  # Placeholder
            "seam_count": 2,
            "complexity_score": 45.0
        }

        return pattern

    async def generate_piece(
        self,
        mesh_id: str,
        design: Dict[str, Any],
        params: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Generate fake single pattern piece

        Returns placeholder piece data.
        DOES NOT contain real UV unwrapping algorithms.
        """
        return {
            "id": mesh_id,
            "type": "generic",
            "contour": [
                {"x": 0, "y": 0},
                {"x": 30, "y": 0},
                {"x": 30, "y": 40},
                {"x": 0, "y": 40}
            ],
            "seams": [],
            "notches": [],
            "metadata": {
                "note": "DEMO ONLY - Placeholder piece"
            }
        }

    async def optimize_seams(
        self,
        pattern: Dict[str, Any],
        fabric: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Fake seam optimization

        Returns pattern unchanged.
        DOES NOT contain real seam optimization algorithms.
        """
        pattern["metadata"]["seam_optimized"] = True
        pattern["metadata"]["note"] = "DEMO - No real optimization performed"
        return pattern

    async def add_seam_allowance(
        self,
        pattern: Dict[str, Any],
        allowance: float
    ) -> Dict[str, Any]:
        """
        Fake seam allowance addition

        Returns pattern with metadata only.
        DOES NOT contain real geometry expansion.
        """
        pattern["metadata"]["seam_allowance"] = allowance
        pattern["metadata"]["note"] = "DEMO - No real seam allowance added"
        return pattern

    async def detect_symmetric_pieces(
        self,
        design: Dict[str, Any]
    ) -> List[str]:
        """
        Fake symmetry detection

        Returns empty list.
        DOES NOT contain real symmetry detection algorithms.
        """
        return []

    async def validate(self, pattern: Dict[str, Any]) -> bool:
        """
        Fake validation

        Always returns True.
        DOES NOT contain real validation logic.
        """
        return True

    async def get_generation_metrics(self) -> Dict[str, Any]:
        """Get placeholder metrics"""
        return self.metrics
