"""
Mock Layout API - Demo Implementation

Provides example JSON responses for layout optimization endpoints.
NO proprietary RL or optimization algorithms are included.
"""

from typing import Dict, Any
from lanfinitas_layout import FakeLayoutOptimizer


class MockLayoutAPI:
    """
    Mock Layout API for public demos

    Returns structured JSON examples that demonstrate the API interface
    but contain NO real optimization algorithms.
    """

    def __init__(self):
        self.optimizer = FakeLayoutOptimizer()

    async def optimize_layout(self, request_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Mock endpoint: POST /api/v1/layout/optimize

        Example response structure for layout optimization.
        """
        pattern = request_data.get("pattern", {})
        fabric = request_data.get("fabric", {})
        params = request_data.get("params", {})

        result = await self.optimizer.optimize(pattern, fabric, params)

        return {
            "success": True,
            "data": result,
            "message": "DEMO: Layout optimized with placeholder algorithm (no RL)",
            "meta": {
                "version": "1.0.0-demo",
                "warning": "This is demonstration data only - no real RL optimization"
            }
        }

    async def evaluate_layout(self, request_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Mock endpoint: POST /api/v1/layout/evaluate

        Example response for layout evaluation.
        """
        layout = request_data.get("layout", [])
        pattern = request_data.get("pattern", {})
        fabric = request_data.get("fabric", {})

        metrics = await self.optimizer.evaluate_layout(layout, pattern, fabric)

        return {
            "success": True,
            "data": {
                "metrics": metrics,
                "suggestions": await self.optimizer.suggest_improvements({}, pattern)
            },
            "message": "DEMO: Layout evaluated with placeholder metrics",
            "meta": {
                "version": "1.0.0-demo",
                "warning": "This is demonstration data only"
            }
        }

    async def get_optimization_history(self) -> Dict[str, Any]:
        """
        Mock endpoint: GET /api/v1/layout/optimization/history

        Example response for optimization history.
        """
        history = await self.optimizer.get_optimization_history()

        return {
            "success": True,
            "data": {
                "history": history,
                "count": len(history)
            },
            "meta": {
                "version": "1.0.0-demo"
            }
        }
