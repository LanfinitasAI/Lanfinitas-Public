"""
Mock Fabric API - Demo Implementation

Provides example JSON responses for fabric simulation endpoints.
NO proprietary physics algorithms are included.
"""

from typing import Dict, Any
from lanfinitas_fabric import FakeFabricSimulator


class MockFabricAPI:
    """
    Mock Fabric API for public demos

    Returns structured JSON examples that demonstrate the API interface
    but contain NO real fabric simulation logic.
    """

    def __init__(self):
        self.simulator = FakeFabricSimulator()

    async def simulate_draping(self, request_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Mock endpoint: POST /api/v1/fabric/simulate/draping

        Example response structure for draping simulation.
        """
        pattern = request_data.get("pattern", {})
        design = request_data.get("design", {})
        fabric = request_data.get("fabric", {})

        mesh = await self.simulator.simulate_draping(pattern, design, fabric)

        return {
            "success": True,
            "data": {
                "draped_mesh": mesh,
                "metrics": await self.simulator.get_simulation_metrics()
            },
            "message": "DEMO: Simulation completed with placeholder physics",
            "meta": {
                "version": "1.0.0-demo",
                "warning": "This is demonstration data only - no real physics simulation"
            }
        }

    async def calculate_fit(self, request_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Mock endpoint: POST /api/v1/fabric/fit/calculate

        Example response for fit calculation.
        """
        fabric_mesh = request_data.get("fabric_mesh", {})
        body_mesh = request_data.get("body_mesh", {})

        fit_metrics = await self.simulator.calculate_fit(fabric_mesh, body_mesh)

        return {
            "success": True,
            "data": fit_metrics,
            "message": "DEMO: Fit calculated with placeholder metrics",
            "meta": {
                "version": "1.0.0-demo",
                "warning": "This is demonstration data only"
            }
        }

    async def get_fabric_properties(self, fabric_id: str) -> Dict[str, Any]:
        """
        Mock endpoint: GET /api/v1/fabric/properties/{fabric_id}

        Example response for fabric properties.
        """
        return {
            "success": True,
            "data": {
                "id": fabric_id,
                "name": "Cotton Poplin (Demo)",
                "type": "cotton",
                "weight": "light",
                "width": 150,
                "physical_properties": {
                    "elasticity": 0.1,
                    "shear": 0.05,
                    "bend": 0.02,
                    "note": "Placeholder values for demo"
                }
            },
            "meta": {
                "version": "1.0.0-demo"
            }
        }
