"""
Core data models for Lanfinitas AI platform.

This module defines Pydantic models for type-safe data validation
and serialization across the platform.
"""

from typing import List, Dict, Optional, Any, Tuple
from datetime import datetime
from pydantic import BaseModel, Field, validator, ConfigDict
import numpy as np

from lanfinitas_core.types.core_enums import (
    GarmentStyle,
    MeasurementUnit,
    CADFormat,
    FabricType,
    Gender,
    SizeCategory,
    PatternPieceType,
    SeamType,
    DartType,
    LayoutStrategy,
    OptimizationObjective,
    TaskStatus,
    ErrorSeverity,
    MaterialSustainability,
)


class Point2D(BaseModel):
    """Represents a 2D point in pattern space."""

    model_config = ConfigDict(arbitrary_types_allowed=True)

    x: float = Field(..., description="X coordinate")
    y: float = Field(..., description="Y coordinate")

    def to_tuple(self) -> Tuple[float, float]:
        """Convert to tuple format."""
        return (self.x, self.y)

    def distance_to(self, other: "Point2D") -> float:
        """Calculate distance to another point."""
        return ((self.x - other.x) ** 2 + (self.y - other.y) ** 2) ** 0.5


class Measurement(BaseModel):
    """Body or garment measurements."""

    model_config = ConfigDict(arbitrary_types_allowed=True)

    # Basic measurements (all in the same unit)
    chest: Optional[float] = Field(None, description="Chest circumference", gt=0)
    waist: Optional[float] = Field(None, description="Waist circumference", gt=0)
    hip: Optional[float] = Field(None, description="Hip circumference", gt=0)
    shoulder_width: Optional[float] = Field(None, description="Shoulder width", gt=0)
    sleeve_length: Optional[float] = Field(None, description="Sleeve length", gt=0)
    body_length: Optional[float] = Field(None, description="Body length", gt=0)
    inseam: Optional[float] = Field(None, description="Inseam length", gt=0)
    neck: Optional[float] = Field(None, description="Neck circumference", gt=0)

    # Additional measurements
    bust: Optional[float] = Field(None, description="Bust circumference", gt=0)
    under_bust: Optional[float] = Field(None, description="Under-bust circumference", gt=0)
    arm_length: Optional[float] = Field(None, description="Full arm length", gt=0)
    bicep: Optional[float] = Field(None, description="Bicep circumference", gt=0)
    wrist: Optional[float] = Field(None, description="Wrist circumference", gt=0)
    thigh: Optional[float] = Field(None, description="Thigh circumference", gt=0)
    calf: Optional[float] = Field(None, description="Calf circumference", gt=0)
    ankle: Optional[float] = Field(None, description="Ankle circumference", gt=0)

    # Metadata
    unit: MeasurementUnit = Field(
        default=MeasurementUnit.CENTIMETERS,
        description="Unit of measurement"
    )
    gender: Optional[Gender] = Field(None, description="Gender category")
    size_category: Optional[SizeCategory] = Field(None, description="Size category")

    # Custom measurements
    custom: Dict[str, float] = Field(
        default_factory=dict,
        description="Custom measurements"
    )

    def convert_to(self, target_unit: MeasurementUnit) -> "Measurement":
        """Convert all measurements to a different unit."""
        if self.unit == target_unit:
            return self

        # Conversion factors to centimeters
        to_cm = {
            MeasurementUnit.CENTIMETERS: 1.0,
            MeasurementUnit.MILLIMETERS: 0.1,
            MeasurementUnit.METERS: 100.0,
            MeasurementUnit.INCHES: 2.54,
        }

        # Convert to cm first, then to target
        factor = to_cm[self.unit] / to_cm[target_unit]

        converted = self.model_copy(deep=True)
        for field_name in self.model_fields:
            value = getattr(self, field_name)
            if isinstance(value, (int, float)) and value is not None:
                setattr(converted, field_name, value * factor)

        # Convert custom measurements
        converted.custom = {k: v * factor for k, v in self.custom.items()}
        converted.unit = target_unit

        return converted


class Dart(BaseModel):
    """Represents a dart in a pattern."""

    model_config = ConfigDict(arbitrary_types_allowed=True)

    dart_type: DartType = Field(..., description="Type of dart")
    apex: Point2D = Field(..., description="Dart apex/point")
    leg1_start: Point2D = Field(..., description="First leg start point")
    leg2_start: Point2D = Field(..., description="Second leg start point")
    width: float = Field(..., description="Dart width in cm", gt=0)
    length: float = Field(..., description="Dart length in cm", gt=0)

    # Metadata
    label: Optional[str] = Field(None, description="Dart label/name")
    notes: Optional[str] = Field(None, description="Additional notes")


class Seam(BaseModel):
    """Represents a seam in a pattern."""

    model_config = ConfigDict(arbitrary_types_allowed=True)

    seam_type: SeamType = Field(..., description="Type of seam")
    points: List[Point2D] = Field(..., description="Seam line points", min_length=2)
    seam_allowance: float = Field(
        default=1.0,
        description="Seam allowance in cm",
        ge=0
    )
    stitch_length: Optional[float] = Field(
        None,
        description="Stitch length in mm",
        gt=0
    )

    # Metadata
    label: Optional[str] = Field(None, description="Seam label/name")
    notes: Optional[str] = Field(None, description="Additional notes")

    def get_length(self) -> float:
        """Calculate total seam length."""
        total = 0.0
        for i in range(len(self.points) - 1):
            total += self.points[i].distance_to(self.points[i + 1])
        return total


class PatternPiece(BaseModel):
    """Represents a single pattern piece."""

    model_config = ConfigDict(arbitrary_types_allowed=True)

    # Identity
    piece_id: str = Field(..., description="Unique piece identifier")
    piece_type: PatternPieceType = Field(..., description="Type of pattern piece")
    label: str = Field(..., description="Pattern piece label/name")

    # Geometry
    outline: List[Point2D] = Field(
        ...,
        description="Outline points (closed polygon)",
        min_length=3
    )
    seams: List[Seam] = Field(
        default_factory=list,
        description="Seam lines"
    )
    darts: List[Dart] = Field(
        default_factory=list,
        description="Darts"
    )
    grain_line: Optional[Tuple[Point2D, Point2D]] = Field(
        None,
        description="Grain line (start, end)"
    )

    # Metadata
    mirror: bool = Field(
        default=False,
        description="Whether this piece should be mirrored"
    )
    quantity: int = Field(
        default=1,
        description="Number of pieces to cut",
        gt=0
    )
    notes: Optional[str] = Field(None, description="Additional notes")

    @validator('outline')
    def validate_closed_outline(cls, v):
        """Ensure outline forms a closed polygon."""
        if len(v) >= 3:
            # Optionally check if first and last points are close
            if v[0].distance_to(v[-1]) > 0.01:  # 0.1mm tolerance
                # Auto-close if needed
                pass
        return v

    def get_area(self) -> float:
        """Calculate pattern piece area using shoelace formula."""
        if len(self.outline) < 3:
            return 0.0

        points = [p.to_tuple() for p in self.outline]
        x = [p[0] for p in points]
        y = [p[1] for p in points]

        return 0.5 * abs(
            sum(x[i] * y[i + 1] - x[i + 1] * y[i] for i in range(len(points) - 1))
        )

    def get_bounding_box(self) -> Tuple[Point2D, Point2D]:
        """Get bounding box (min_point, max_point)."""
        xs = [p.x for p in self.outline]
        ys = [p.y for p in self.outline]
        return (
            Point2D(x=min(xs), y=min(ys)),
            Point2D(x=max(xs), y=max(ys))
        )


class Pattern(BaseModel):
    """Represents a complete garment pattern."""

    model_config = ConfigDict(arbitrary_types_allowed=True)

    # Identity
    pattern_id: str = Field(..., description="Unique pattern identifier")
    name: str = Field(..., description="Pattern name")
    style: GarmentStyle = Field(..., description="Garment style")
    version: str = Field(default="1.0", description="Pattern version")

    # Pattern pieces
    pieces: List[PatternPiece] = Field(
        ...,
        description="Pattern pieces",
        min_length=1
    )

    # Measurements used
    measurements: Optional[Measurement] = Field(
        None,
        description="Measurements used for this pattern"
    )

    # Metadata
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        description="Creation timestamp"
    )
    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        description="Last update timestamp"
    )
    designer: Optional[str] = Field(None, description="Designer name")
    description: Optional[str] = Field(None, description="Pattern description")
    tags: List[str] = Field(default_factory=list, description="Pattern tags")

    # Additional options
    options: Dict[str, Any] = Field(
        default_factory=dict,
        description="Additional pattern options"
    )

    def get_total_area(self) -> float:
        """Calculate total area of all pattern pieces."""
        return sum(piece.get_area() * piece.quantity for piece in self.pieces)

    def get_piece_by_id(self, piece_id: str) -> Optional[PatternPiece]:
        """Get a pattern piece by ID."""
        for piece in self.pieces:
            if piece.piece_id == piece_id:
                return piece
        return None


class Fabric(BaseModel):
    """Represents fabric properties."""

    model_config = ConfigDict(arbitrary_types_allowed=True)

    # Identity
    fabric_id: str = Field(..., description="Unique fabric identifier")
    name: str = Field(..., description="Fabric name")
    fabric_type: FabricType = Field(..., description="Fabric type")

    # Physical properties
    width: float = Field(..., description="Fabric width in cm", gt=0)
    length: Optional[float] = Field(None, description="Available length in cm", gt=0)
    weight: Optional[float] = Field(
        None,
        description="Fabric weight in g/m²",
        gt=0
    )
    thickness: Optional[float] = Field(
        None,
        description="Fabric thickness in mm",
        gt=0
    )
    stretch_horizontal: float = Field(
        default=0.0,
        description="Horizontal stretch percentage",
        ge=0,
        le=100
    )
    stretch_vertical: float = Field(
        default=0.0,
        description="Vertical stretch percentage",
        ge=0,
        le=100
    )

    # Cost & Sustainability
    cost_per_meter: Optional[float] = Field(
        None,
        description="Cost per meter",
        ge=0
    )
    sustainability_rating: MaterialSustainability = Field(
        default=MaterialSustainability.UNKNOWN,
        description="Sustainability rating"
    )

    # Metadata
    color: Optional[str] = Field(None, description="Fabric color")
    pattern: Optional[str] = Field(None, description="Fabric pattern/print")
    supplier: Optional[str] = Field(None, description="Fabric supplier")
    notes: Optional[str] = Field(None, description="Additional notes")


class PlacedPiece(BaseModel):
    """Represents a placed pattern piece in a layout."""

    model_config = ConfigDict(arbitrary_types_allowed=True)

    piece: PatternPiece = Field(..., description="Pattern piece")
    position: Point2D = Field(..., description="Position (bottom-left corner)")
    rotation: float = Field(
        default=0.0,
        description="Rotation angle in degrees",
        ge=0,
        lt=360
    )
    mirrored: bool = Field(
        default=False,
        description="Whether piece is mirrored"
    )


class LayoutResult(BaseModel):
    """Represents a layout optimization result."""

    model_config = ConfigDict(arbitrary_types_allowed=True)

    # Identity
    layout_id: str = Field(..., description="Unique layout identifier")
    pattern: Pattern = Field(..., description="Pattern used")
    fabric: Fabric = Field(..., description="Fabric used")

    # Layout
    placed_pieces: List[PlacedPiece] = Field(
        ...,
        description="Placed pattern pieces"
    )
    fabric_length_used: float = Field(
        ...,
        description="Total fabric length used in cm",
        gt=0
    )

    # Optimization metrics
    utilization_rate: float = Field(
        ...,
        description="Fabric utilization rate (0-1)",
        ge=0,
        le=1
    )
    waste_percentage: float = Field(
        ...,
        description="Waste percentage (0-100)",
        ge=0,
        le=100
    )
    total_area_used: float = Field(
        ...,
        description="Total pattern area in cm²",
        gt=0
    )
    total_area_available: float = Field(
        ...,
        description="Total fabric area in cm²",
        gt=0
    )

    # Strategy & metadata
    strategy: LayoutStrategy = Field(
        ...,
        description="Layout strategy used"
    )
    objective: OptimizationObjective = Field(
        ...,
        description="Optimization objective"
    )
    computation_time: float = Field(
        ...,
        description="Computation time in seconds",
        ge=0
    )
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        description="Creation timestamp"
    )

    @validator('waste_percentage', always=True)
    def calculate_waste(cls, v, values):
        """Calculate waste percentage from utilization."""
        if 'utilization_rate' in values:
            return (1 - values['utilization_rate']) * 100
        return v


class ExportOptions(BaseModel):
    """Options for exporting patterns to CAD formats."""

    model_config = ConfigDict(arbitrary_types_allowed=True)

    format: CADFormat = Field(..., description="Export format")
    include_seam_allowance: bool = Field(
        default=True,
        description="Include seam allowance"
    )
    include_grain_lines: bool = Field(
        default=True,
        description="Include grain lines"
    )
    include_labels: bool = Field(
        default=True,
        description="Include piece labels"
    )
    include_notches: bool = Field(
        default=True,
        description="Include notches"
    )
    layer_by_piece_type: bool = Field(
        default=False,
        description="Separate layers by piece type"
    )
    unit: MeasurementUnit = Field(
        default=MeasurementUnit.CENTIMETERS,
        description="Export unit"
    )
    scale: float = Field(
        default=1.0,
        description="Export scale factor",
        gt=0
    )

    # Additional metadata
    metadata: Dict[str, Any] = Field(
        default_factory=dict,
        description="Additional export metadata"
    )


class TaskResult(BaseModel):
    """Represents the result of an async task."""

    model_config = ConfigDict(arbitrary_types_allowed=True)

    task_id: str = Field(..., description="Unique task identifier")
    status: TaskStatus = Field(..., description="Task status")
    result: Optional[Any] = Field(None, description="Task result")
    error: Optional[str] = Field(None, description="Error message if failed")
    error_severity: Optional[ErrorSeverity] = Field(
        None,
        description="Error severity"
    )

    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        description="Task creation time"
    )
    started_at: Optional[datetime] = Field(
        None,
        description="Task start time"
    )
    completed_at: Optional[datetime] = Field(
        None,
        description="Task completion time"
    )

    progress: float = Field(
        default=0.0,
        description="Task progress (0-100)",
        ge=0,
        le=100
    )
    metadata: Dict[str, Any] = Field(
        default_factory=dict,
        description="Additional task metadata"
    )

    def get_duration(self) -> Optional[float]:
        """Get task duration in seconds."""
        if self.started_at and self.completed_at:
            return (self.completed_at - self.started_at).total_seconds()
        return None
