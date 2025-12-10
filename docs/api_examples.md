# Lanfinitas AI - API Examples (Demo)

## ⚠️ Demo Notice

These examples demonstrate the API structure using mock implementations.
All responses are placeholder data for demonstration purposes only.

---

## Pattern Generation API

### Generate Pattern from 3D Design

```python
from api.mock import MockPatternAPI

api = MockPatternAPI()

# Request
design_data = {
    "id": "design_001",
    "meshes": [
        {
            "id": "front_mesh",
            "vertices": [...],
            "faces": [...]
        }
    ]
}

# Response
response = await api.generate_pattern(design_data)

# Example response:
{
    "success": True,
    "data": {
        "pattern": {
            "id": "pattern_1234",
            "design_id": "design_001",
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
                    "seams": [...],
                    "notches": []
                }
            ]
        },
        "metrics": {
            "generation_time_ms": 150,
            "num_pieces": 2,
            "total_area": 7000.0,
            "seam_count": 2,
            "complexity_score": 45.0
        }
    },
    "message": "DEMO: Pattern generated with placeholder data",
    "meta": {
        "version": "1.0.0-demo",
        "warning": "This is demonstration data only"
    }
}
```

---

## Fabric Simulation API

### Simulate Fabric Draping

```python
from api.mock import MockFabricAPI

api = MockFabricAPI()

# Request
request_data = {
    "pattern": { "id": "pattern_001", "pieces": [...] },
    "design": { "id": "design_001", "meshes": [...] },
    "fabric": {
        "id": "fabric_001",
        "name": "Cotton Poplin",
        "type": "cotton",
        "weight": "light",
        "width": 150.0,
        "physical_properties": {
            "elasticity": 0.1,
            "shear": 0.05,
            "bend": 0.02
        }
    }
}

# Response
response = await api.simulate_draping(request_data)

# Example response:
{
    "success": True,
    "data": {
        "draped_mesh": {
            "id": "draped_mesh_5678",
            "vertices": [
                {"x": 0, "y": 0, "z": 0},
                {"x": 10, "y": 0, "z": 0.5},
                ...
            ],
            "faces": [...],
            "normals": [...]
        },
        "metrics": {
            "simulation_time_ms": 250,
            "iterations_completed": 100,
            "convergence_rate": 0.95,
            "energy": 12.5,
            "stability": 0.98
        }
    },
    "message": "DEMO: Simulation completed with placeholder physics",
    "meta": {
        "version": "1.0.0-demo",
        "warning": "This is demonstration data only - no real physics simulation"
    }
}
```

### Calculate Garment Fit

```python
# Request
fit_request = {
    "fabric_mesh": { "id": "mesh_001", ... },
    "body_mesh": { "id": "body_001", ... }
}

# Response
response = await api.calculate_fit(fit_request)

# Example response:
{
    "success": True,
    "data": {
        "ease_distribution": {
            "bust": 5.0,
            "waist": 3.0,
            "hip": 4.5
        },
        "pressure_points": [
            {"location": "shoulder", "pressure": 0.3},
            {"location": "armpit", "pressure": 0.5}
        ],
        "gap_areas": [
            {"location": "waist_back", "gap_cm": 0.8}
        ],
        "overall_fit_score": 0.82
    }
}
```

---

## Layout Optimization API

### Optimize Pattern Layout

```python
from api.mock import MockLayoutAPI

api = MockLayoutAPI()

# Request
request_data = {
    "pattern": {
        "id": "pattern_001",
        "pieces": [...]
    },
    "fabric": {
        "id": "fabric_001",
        "width": 150.0
    },
    "params": {
        "target_efficiency": 0.90,
        "allow_rotation": True,
        "rotation_step": 45,
        "spacing": 1.0
    }
}

# Response
response = await api.optimize_layout(request_data)

# Example response:
{
    "success": True,
    "data": {
        "layout": [
            {
                "piece_id": "front_panel",
                "position": {"x": 0, "y": 0},
                "rotation": 0
            },
            {
                "piece_id": "back_panel",
                "position": {"x": 60, "y": 0},
                "rotation": 0
            }
        ],
        "fabric_length": 150.0,
        "utilization": 0.72,
        "waste_percentage": 28.0,
        "optimization_time_ms": 50
    },
    "message": "DEMO: Layout optimized with placeholder algorithm (no RL)",
    "meta": {
        "version": "1.0.0-demo",
        "warning": "This is demonstration data only - no real RL optimization"
    }
}
```

### Evaluate Layout Quality

```python
# Request
eval_request = {
    "layout": [
        {"piece_id": "front", "position": {"x": 0, "y": 0}, "rotation": 0}
    ],
    "pattern": { "id": "pattern_001", ... },
    "fabric": { "width": 150.0, ... }
}

# Response
response = await api.evaluate_layout(eval_request)

# Example response:
{
    "success": True,
    "data": {
        "metrics": {
            "utilization": 0.72,
            "waste": 2500.0,
            "compactness": 0.68,
            "grain_alignment": 0.85
        },
        "suggestions": [
            "Try rotating piece 1 by 90 degrees",
            "Consider grouping similar pieces together",
            "Review grain line alignment for piece 2"
        ]
    }
}
```

---

## Common Response Format

All API endpoints follow this structure:

```json
{
    "success": true,           // Boolean: operation success
    "data": { ... },           // Object: response payload
    "message": "...",          // String: human-readable message
    "meta": {                  // Object: metadata
        "version": "1.0.0-demo",
        "warning": "..."       // Demo warning if applicable
    }
}
```

---

## Error Responses

```json
{
    "success": false,
    "error": {
        "code": "INVALID_INPUT",
        "message": "Invalid pattern data",
        "details": { ... }
    },
    "meta": {
        "version": "1.0.0-demo"
    }
}
```

---

## Running the Demo

```python
# demo.py
import asyncio
from api.mock import MockPatternAPI, MockFabricAPI, MockLayoutAPI

async def run_demo():
    # Initialize APIs
    pattern_api = MockPatternAPI()
    fabric_api = MockFabricAPI()
    layout_api = MockLayoutAPI()

    # Demo workflow
    design = {"id": "demo_design"}

    # 1. Generate pattern
    pattern_result = await pattern_api.generate_pattern(design)
    print("Pattern generated:", pattern_result)

    # 2. Simulate fabric
    fabric_result = await fabric_api.simulate_draping({
        "pattern": pattern_result["data"]["pattern"],
        "design": design,
        "fabric": {"width": 150}
    })
    print("Fabric simulated:", fabric_result)

    # 3. Optimize layout
    layout_result = await layout_api.optimize_layout({
        "pattern": pattern_result["data"]["pattern"],
        "fabric": {"width": 150}
    })
    print("Layout optimized:", layout_result)

# Run
asyncio.run(run_demo())
```

---

## Note for Developers

These examples demonstrate the API structure but use mock implementations.
The real production system uses proprietary algorithms not included in this public repository.

For production API access, please contact us.
