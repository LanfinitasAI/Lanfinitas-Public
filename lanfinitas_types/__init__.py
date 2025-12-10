"""
Lanfinitas Core Types - Comprehensive type definitions for all modules

Lanfinitas 核心类型系统 - 所有模块共享的完整类型定义

This module provides a complete type system for the Lanfinitas AI platform,
including geometric types, 3D designs, 2D patterns, fabric properties, and
export formats.

该模块为 Lanfinitas AI 平台提供完整的类型系统，包括几何类型、3D设计、
2D纸样、面料属性和导出格式。

Usage:
    from lanfinitas_core.types import Point2D, Point3D, Design3D, Pattern2D
    from lanfinitas_core.types import FabricProperties, ExportOptions

    # Create a 2D point
    point = Point2D(10.0, 20.0)

    # Create fabric properties
    fabric = FabricProperties(
        id="fabric_001",
        name="Cotton Poplin",
        type=FabricType.COTTON,
        weight_category=FabricWeight.LIGHT,
        stretch_type=FabricStretch.NO_STRETCH,
        weaving_pattern=WeavingPattern.PLAIN,
        width=150.0
    )

Modules:
    common: Basic geometric and transformation types
    design: 3D design and mesh structures
    pattern: 2D pattern and garment construction structures
    fabric: Fabric properties and physical parameters
    export: CAD file formats and export metadata
"""

# Common types
from .common import (
    Point2D,
    Point3D,
    BoundingBox2D,
    BoundingBox3D,
    Transform2D,
    Transform3D,
)

# Design types
from .design import (
    MeshTopology,
    MaterialType,
    Color,
    Material,
    Mesh,
    Design3D,
)

# Pattern types
from .pattern import (
    PatternPieceType,
    SeamType,
    NotchType,
    Contour,
    Seam,
    Notch,
    GrainLine,
    PatternPiece,
    Pattern2D,
)

# Fabric types
from .fabric import (
    FabricType,
    FabricWeight,
    FabricStretch,
    WeavingPattern,
    PhysicalParams,
    FabricProperties,
    FabricUsage,
)

# Export types
from .export import (
    ExportFormat,
    DXFVersion,
    UnitSystem,
    LayerType,
    CADLayer,
    ExportOptions,
    ExportMetadata,
    CADFile,
)

# Version
__version__ = "1.0.0"

# Public API
__all__ = [
    # Common types
    "Point2D",
    "Point3D",
    "BoundingBox2D",
    "BoundingBox3D",
    "Transform2D",
    "Transform3D",
    # Design types
    "MeshTopology",
    "MaterialType",
    "Color",
    "Material",
    "Mesh",
    "Design3D",
    # Pattern types
    "PatternPieceType",
    "SeamType",
    "NotchType",
    "Contour",
    "Seam",
    "Notch",
    "GrainLine",
    "PatternPiece",
    "Pattern2D",
    # Fabric types
    "FabricType",
    "FabricWeight",
    "FabricStretch",
    "WeavingPattern",
    "PhysicalParams",
    "FabricProperties",
    "FabricUsage",
    # Export types
    "ExportFormat",
    "DXFVersion",
    "UnitSystem",
    "LayerType",
    "CADLayer",
    "ExportOptions",
    "ExportMetadata",
    "CADFile",
]

from lanfinitas_core.types.core_enums import (
    # Garment & Style
    GarmentStyle,
    Gender,
    SizeCategory,
    PatternPieceType,
    # Measurements & Units
    MeasurementUnit,
    # Fabric & Materials
    FabricType,
    MaterialSustainability,
    # Construction
    SeamType,
    DartType,
    # CAD & Export
    CADFormat,
    # Optimization
    LayoutStrategy,
    OptimizationObjective,
    # System & Tasks
    TaskStatus,
    ErrorSeverity,
)

from lanfinitas_core.types.data_models import (
    # Geometry
    Point2D,
    # Measurements
    Measurement,
    # Pattern Components
    Dart,
    Seam,
    PatternPiece,
    Pattern,
    # Fabric
    Fabric,
    # Layout
    PlacedPiece,
    LayoutResult,
    # Export
    ExportOptions,
    # Tasks
    TaskResult,
)

__all__ = [
    # Enums - Garment & Style
    "GarmentStyle",
    "Gender",
    "SizeCategory",
    "PatternPieceType",
    # Enums - Measurements & Units
    "MeasurementUnit",
    # Enums - Fabric & Materials
    "FabricType",
    "MaterialSustainability",
    # Enums - Construction
    "SeamType",
    "DartType",
    # Enums - CAD & Export
    "CADFormat",
    # Enums - Optimization
    "LayoutStrategy",
    "OptimizationObjective",
    # Enums - System & Tasks
    "TaskStatus",
    "ErrorSeverity",
    # Models - Geometry
    "Point2D",
    # Models - Measurements
    "Measurement",
    # Models - Pattern Components
    "Dart",
    "Seam",
    "PatternPiece",
    "Pattern",
    # Models - Fabric
    "Fabric",
    # Models - Layout
    "PlacedPiece",
    "LayoutResult",
    # Models - Export
    "ExportOptions",
    # Models - Tasks
    "TaskResult",
]

__version__ = "0.1.0"
