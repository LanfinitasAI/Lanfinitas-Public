"""
Mock Pattern API - Demo Implementation

Provides example JSON responses for pattern generation endpoints.
NO proprietary algorithms are included.
"""

from typing import Dict, Any
from lanfinitas_pattern import FakePatternGenerator


class MockPatternAPI:
    """
    Mock Pattern API for public demos

    Returns structured JSON examples that demonstrate the API interface
    but contain NO real pattern generation logic.
    """

    def __init__(self):
        self.generator = FakePatternGenerator()

    async def generate_pattern(self, design_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Mock endpoint: POST /api/v1/patterns/generate

        Example response structure for pattern generation.
        """
        pattern = await self.generator.generate(design_data)

        return {
            "success": True,
            "data": {
                "pattern": pattern,
                "metrics": await self.generator.get_generation_metrics()
            },
            "message": "DEMO: Pattern generated with placeholder data",
            "meta": {
                "version": "1.0.0-demo",
                "warning": "This is demonstration data only"
            }
        }

    async def optimize_pattern(self, pattern_id: str) -> Dict[str, Any]:
        """
        Mock endpoint: POST /api/v1/patterns/{pattern_id}/optimize

        Example response for pattern optimization.
        """
        return {
            "success": True,
            "data": {
                "pattern_id": pattern_id,
                "optimization_applied": False,
                "message": "Demo only - no real optimization"
            },
            "meta": {
                "version": "1.0.0-demo",
                "warning": "This is demonstration data only"
            }
        }

    async def get_pattern(self, pattern_id: str) -> Dict[str, Any]:
        """
        Mock endpoint: GET /api/v1/patterns/{pattern_id}

        Example response for retrieving a pattern.
        """
        return {
            "success": True,
            "data": {
                "id": pattern_id,
                "pieces": [
                    {
                        "id": "front",
                        "type": "front_panel",
                        "contour": [[0, 0], [50, 0], [50, 70], [0, 70]]
                    },
                    {
                        "id": "back",
                        "type": "back_panel",
                        "contour": [[0, 0], [50, 0], [50, 70], [0, 70]]
                    }
                ],
                "metadata": {
                    "note": "DEMO data - placeholder pattern"
                }
            },
            "meta": {
                "version": "1.0.0-demo"
            }
        }
