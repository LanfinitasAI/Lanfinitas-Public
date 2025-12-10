#!/usr/bin/env python3
"""
Lanfinitas AI - Public Demo Runner

This script demonstrates the API interfaces using mock implementations.
All outputs are placeholder data for demonstration purposes only.

Run: python demo.py
"""

import asyncio
import json
from api.mock.patterns import MockPatternAPI
from api.mock.fabric import MockFabricAPI
from api.mock.layout import MockLayoutAPI


def print_section(title: str):
    """Print a formatted section header"""
    print("\n" + "=" * 70)
    print(f"  {title}")
    print("=" * 70 + "\n")


def print_json(data: dict, indent: int = 2):
    """Pretty print JSON data"""
    print(json.dumps(data, indent=indent, ensure_ascii=False))


async def demo_pattern_generation():
    """Demonstrate pattern generation API"""
    print_section("DEMO 1: Pattern Generation")

    api = MockPatternAPI()

    # Sample 3D design data
    design_data = {
        "id": "demo_tshirt_001",
        "name": "Basic T-Shirt",
        "meshes": [
            {
                "id": "front_mesh",
                "vertices": [[0, 0, 0], [50, 0, 0], [50, 70, 0], [0, 70, 0]],
                "faces": [[0, 1, 2], [0, 2, 3]]
            },
            {
                "id": "back_mesh",
                "vertices": [[0, 0, 0], [50, 0, 0], [50, 70, 0], [0, 70, 0]],
                "faces": [[0, 1, 2], [0, 2, 3]]
            }
        ]
    }

    print("📐 Generating 2D pattern from 3D design...")
    print(f"Input: {design_data['name']}\n")

    result = await api.generate_pattern(design_data)

    print("✅ Pattern Generated!")
    print_json(result)

    return result["data"]["pattern"]


async def demo_fabric_simulation(pattern: dict):
    """Demonstrate fabric simulation API"""
    print_section("DEMO 2: Fabric Simulation")

    api = MockFabricAPI()

    # Sample fabric properties
    fabric_data = {
        "id": "cotton_poplin_001",
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

    request_data = {
        "pattern": pattern,
        "design": {"id": "demo_tshirt_001"},
        "fabric": fabric_data
    }

    print("🧵 Simulating fabric draping...")
    print(f"Fabric: {fabric_data['name']} ({fabric_data['type']})\n")

    result = await api.simulate_draping(request_data)

    print("✅ Simulation Complete!")
    print_json(result)

    # Also demo fit calculation
    print("\n📏 Calculating garment fit...")

    fit_request = {
        "fabric_mesh": result["data"]["draped_mesh"],
        "body_mesh": {"id": "body_001", "vertices": [], "faces": []}
    }

    fit_result = await api.calculate_fit(fit_request)

    print("✅ Fit Analysis Complete!")
    print_json(fit_result)

    return result["data"]["draped_mesh"]


async def demo_layout_optimization(pattern: dict):
    """Demonstrate layout optimization API"""
    print_section("DEMO 3: Layout Optimization")

    api = MockLayoutAPI()

    # Sample optimization request
    request_data = {
        "pattern": pattern,
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

    print("🎯 Optimizing pattern layout...")
    print(f"Fabric width: {request_data['fabric']['width']} cm")
    print(f"Target efficiency: {request_data['params']['target_efficiency'] * 100}%\n")

    result = await api.optimize_layout(request_data)

    print("✅ Layout Optimized!")
    print_json(result)

    # Evaluate the layout
    print("\n📊 Evaluating layout quality...")

    eval_result = await api.evaluate_layout({
        "layout": result["data"]["layout"],
        "pattern": pattern,
        "fabric": request_data["fabric"]
    })

    print("✅ Evaluation Complete!")
    print_json(eval_result)


async def main():
    """Run the complete demo workflow"""
    print("\n" + "█" * 70)
    print("█" + " " * 68 + "█")
    print("█" + "  🌟 LANFINITAS AI - PUBLIC DEMO 🌟".center(68) + "█")
    print("█" + " " * 68 + "█")
    print("█" + "  AI-Powered Fashion Design Platform".center(68) + "█")
    print("█" + " " * 68 + "█")
    print("█" * 70)

    print("\n⚠️  IMPORTANT NOTICE ⚠️")
    print("-" * 70)
    print("This is a DEMONSTRATION using mock implementations.")
    print("All outputs are placeholder data for demo purposes only.")
    print("This repository does NOT contain:")
    print("  ❌ Proprietary pattern generation algorithms")
    print("  ❌ Physics simulation engines")
    print("  ❌ RL-based optimization algorithms")
    print("  ❌ Production backend infrastructure")
    print("-" * 70)

    try:
        # Run the demo workflow
        pattern = await demo_pattern_generation()
        mesh = await demo_fabric_simulation(pattern)
        await demo_layout_optimization(pattern)

        # Summary
        print_section("DEMO COMPLETE ✨")
        print("📋 Summary:")
        print("  ✅ Generated 2D pattern from 3D design")
        print("  ✅ Simulated fabric draping and fit")
        print("  ✅ Optimized layout for fabric utilization")
        print("\n💡 This demo showcases the API structure and workflow.")
        print("   Real system uses proprietary AI algorithms (not included).")
        print("\n📧 For production access: contact@lanfinitas.ai")
        print("📚 Documentation: see docs/ directory")
        print("\n" + "█" * 70 + "\n")

    except Exception as e:
        print(f"\n❌ Demo Error: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    asyncio.run(main())
