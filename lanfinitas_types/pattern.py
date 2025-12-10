"""
Pattern Types - 2D pattern and garment construction structures

2D纸样类型模块 - 提供纸样和服装构造相关的数据结构
"""

from dataclasses import dataclass, field, asdict
from typing import List, Dict, Optional, Any, Tuple
from enum import Enum
import json

from .common import Point2D, BoundingBox2D, Transform2D


class PatternPieceType(str, Enum):
    """
    Pattern piece classification

    纸样片类型
    """
    FRONT = "front"  # Front panel
    BACK = "back"  # Back panel
    SLEEVE = "sleeve"  # Sleeve
    COLLAR = "collar"  # Collar
    CUFF = "cuff"  # Cuff
    POCKET = "pocket"  # Pocket
    FACING = "facing"  # Facing
    LINING = "lining"  # Lining
    INTERFACING = "interfacing"  # Interfacing
    CUSTOM = "custom"  # Custom piece


class SeamType(str, Enum):
    """
    Seam connection type

    缝合类型
    """
    PLAIN = "plain"  # Plain seam
    FRENCH = "french"  # French seam
    FLAT_FELL = "flat_fell"  # Flat-fell seam
    OVERLOCK = "overlock"  # Overlock seam
    TOPSTITCH = "topstitch"  # Topstitch
    ZIGZAG = "zigzag"  # Zigzag
    BLIND = "blind"  # Blind stitch


class NotchType(str, Enum):
    """
    Pattern notch/mark type

    记号类型
    """
    SINGLE = "single"  # Single notch
    DOUBLE = "double"  # Double notch
    TRIPLE = "triple"  # Triple notch
    DOT = "dot"  # Dot mark
    CROSS = "cross"  # Cross mark
    BUTTONHOLE = "buttonhole"  # Buttonhole mark
    BUTTON = "button"  # Button mark
    PLEAT = "pleat"  # Pleat mark


@dataclass
class Contour:
    """
    2D contour/outline

    2D轮廓线

    Attributes:
        points: Ordered list of points forming the contour
        closed: Whether the contour is closed (first point connects to last)
        label: Optional contour label
    """
    points: List[Point2D]
    closed: bool = True
    label: Optional[str] = None

    def __post_init__(self) -> None:
        """Validate contour"""
        if len(self.points) < 2:
            raise ValueError("Contour must have at least 2 points")

    @property
    def num_points(self) -> int:
        """Number of points in the contour"""
        return len(self.points)

    def get_bounding_box(self) -> BoundingBox2D:
        """Calculate axis-aligned bounding box"""
        if not self.points:
            raise ValueError("Cannot compute bounding box of empty contour")

        min_x = min(p.x for p in self.points)
        max_x = max(p.x for p in self.points)
        min_y = min(p.y for p in self.points)
        max_y = max(p.y for p in self.points)

        return BoundingBox2D(
            min_point=Point2D(min_x, min_y),
            max_point=Point2D(max_x, max_y),
        )

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization"""
        return {
            "points": [p.to_dict() for p in self.points],
            "closed": self.closed,
            "label": self.label,
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "Contour":
        """Create Contour from dictionary"""
        return cls(
            points=[Point2D.from_dict(p) for p in data["points"]],
            closed=data.get("closed", True),
            label=data.get("label"),
        )


@dataclass
class Seam:
    """
    Seam connection between pattern pieces

    纸样片之间的缝合线

    Attributes:
        id: Unique seam identifier
        piece1_id: First pattern piece ID
        piece2_id: Second pattern piece ID
        edge1_indices: Vertex indices on first piece
        edge2_indices: Vertex indices on second piece
        type: Seam type
        allowance: Seam allowance in cm
        metadata: Additional seam properties
    """
    id: str
    piece1_id: str
    piece2_id: str
    edge1_indices: List[int]
    edge2_indices: List[int]
    type: SeamType = SeamType.PLAIN
    allowance: float = 1.0  # cm
    metadata: Dict[str, Any] = field(default_factory=dict)

    def __post_init__(self) -> None:
        """Validate seam data"""
        if len(self.edge1_indices) != len(self.edge2_indices):
            raise ValueError("Edge indices must have same length")
        if self.allowance < 0:
            raise ValueError("Seam allowance must be non-negative")

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization"""
        return {
            "id": self.id,
            "piece1_id": self.piece1_id,
            "piece2_id": self.piece2_id,
            "edge1_indices": self.edge1_indices,
            "edge2_indices": self.edge2_indices,
            "type": self.type.value,
            "allowance": self.allowance,
            "metadata": self.metadata,
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "Seam":
        """Create Seam from dictionary"""
        return cls(
            id=data["id"],
            piece1_id=data["piece1_id"],
            piece2_id=data["piece2_id"],
            edge1_indices=data["edge1_indices"],
            edge2_indices=data["edge2_indices"],
            type=SeamType(data.get("type", "plain")),
            allowance=data.get("allowance", 1.0),
            metadata=data.get("metadata", {}),
        )


@dataclass
class Notch:
    """
    Pattern notch/mark for alignment

    对位记号

    Attributes:
        id: Unique notch identifier
        position: Position on the pattern
        type: Notch type
        label: Optional label text
    """
    id: str
    position: Point2D
    type: NotchType
    label: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization"""
        return {
            "id": self.id,
            "position": self.position.to_dict(),
            "type": self.type.value,
            "label": self.label,
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "Notch":
        """Create Notch from dictionary"""
        return cls(
            id=data["id"],
            position=Point2D.from_dict(data["position"]),
            type=NotchType(data["type"]),
            label=data.get("label"),
        )


@dataclass
class GrainLine:
    """
    Fabric grain line direction

    布料经纱方向线

    Attributes:
        start: Start point of grain line
        end: End point of grain line
        label: Optional label (e.g., "GRAIN", "经纱方向")
    """
    start: Point2D
    end: Point2D
    label: str = "GRAIN"

    @property
    def length(self) -> float:
        """Length of the grain line"""
        return self.start.distance_to(self.end)

    @property
    def angle_degrees(self) -> float:
        """Angle of grain line in degrees from horizontal"""
        import math
        dx = self.end.x - self.start.x
        dy = self.end.y - self.start.y
        return math.degrees(math.atan2(dy, dx))

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization"""
        return {
            "start": self.start.to_dict(),
            "end": self.end.to_dict(),
            "label": self.label,
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "GrainLine":
        """Create GrainLine from dictionary"""
        return cls(
            start=Point2D.from_dict(data["start"]),
            end=Point2D.from_dict(data["end"]),
            label=data.get("label", "GRAIN"),
        )


@dataclass
class PatternPiece:
    """
    Individual pattern piece

    单个纸样片

    Attributes:
        id: Unique piece identifier
        name: Piece name (e.g., "Front Left", "Back", "Sleeve")
        type: Pattern piece type
        outer_contour: Outer boundary contour
        inner_contours: List of inner contours (holes, cutouts)
        grain_line: Fabric grain line direction
        notches: List of notches/marks
        transform: Optional transformation applied to piece
        metadata: Additional piece properties (size, cut-on-fold, etc.)
    """
    id: str
    name: str
    type: PatternPieceType
    outer_contour: Contour
    inner_contours: List[Contour] = field(default_factory=list)
    grain_line: Optional[GrainLine] = None
    notches: List[Notch] = field(default_factory=list)
    transform: Transform2D = field(default_factory=Transform2D.identity)
    metadata: Dict[str, Any] = field(default_factory=dict)

    def get_bounding_box(self) -> BoundingBox2D:
        """Calculate bounding box of the pattern piece"""
        return self.outer_contour.get_bounding_box()

    @property
    def is_symmetric(self) -> bool:
        """Check if piece is marked as cut-on-fold (symmetric)"""
        return self.metadata.get("cut_on_fold", False)

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization"""
        return {
            "id": self.id,
            "name": self.name,
            "type": self.type.value,
            "outer_contour": self.outer_contour.to_dict(),
            "inner_contours": [c.to_dict() for c in self.inner_contours],
            "grain_line": self.grain_line.to_dict() if self.grain_line else None,
            "notches": [n.to_dict() for n in self.notches],
            "transform": self.transform.to_dict(),
            "metadata": self.metadata,
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "PatternPiece":
        """Create PatternPiece from dictionary"""
        return cls(
            id=data["id"],
            name=data["name"],
            type=PatternPieceType(data["type"]),
            outer_contour=Contour.from_dict(data["outer_contour"]),
            inner_contours=[Contour.from_dict(c) for c in data.get("inner_contours", [])],
            grain_line=GrainLine.from_dict(data["grain_line"]) if data.get("grain_line") else None,
            notches=[Notch.from_dict(n) for n in data.get("notches", [])],
            transform=Transform2D.from_dict(data.get("transform", {"matrix": [[1, 0, 0], [0, 1, 0], [0, 0, 1]]})),
            metadata=data.get("metadata", {}),
        )


@dataclass
class Pattern2D:
    """
    Complete 2D pattern data structure

    完整的2D纸样数据结构

    Attributes:
        id: Unique pattern identifier
        name: Pattern name
        design_id: Reference to source 3D design
        pieces: List of pattern pieces
        seams: List of seam connections
        format: Original format ("DXF", "PLT", "JSON", etc.)
        metadata: Additional pattern metadata (size, measurements, etc.)
        version: Pattern file format version
    """
    id: str
    name: str
    design_id: Optional[str]
    pieces: List[PatternPiece]
    seams: List[Seam] = field(default_factory=list)
    format: str = "JSON"
    metadata: Dict[str, Any] = field(default_factory=dict)
    version: str = "1.0"

    def __post_init__(self) -> None:
        """Validate pattern data"""
        if not self.pieces:
            raise ValueError("Pattern must have at least one piece")

        # Validate seam references
        piece_ids = {piece.id for piece in self.pieces}
        for seam in self.seams:
            if seam.piece1_id not in piece_ids:
                raise ValueError(f"Seam references unknown piece: {seam.piece1_id}")
            if seam.piece2_id not in piece_ids:
                raise ValueError(f"Seam references unknown piece: {seam.piece2_id}")

    @property
    def num_pieces(self) -> int:
        """Number of pattern pieces"""
        return len(self.pieces)

    @property
    def num_seams(self) -> int:
        """Number of seams"""
        return len(self.seams)

    def get_bounding_box(self) -> BoundingBox2D:
        """Calculate bounding box enclosing all pieces"""
        if not self.pieces:
            raise ValueError("Cannot compute bounding box of empty pattern")

        all_bboxes = [piece.get_bounding_box() for piece in self.pieces]

        min_x = min(bbox.min_point.x for bbox in all_bboxes)
        max_x = max(bbox.max_point.x for bbox in all_bboxes)
        min_y = min(bbox.min_point.y for bbox in all_bboxes)
        max_y = max(bbox.max_point.y for bbox in all_bboxes)

        return BoundingBox2D(
            min_point=Point2D(min_x, min_y),
            max_point=Point2D(max_x, max_y),
        )

    def get_piece_by_id(self, piece_id: str) -> Optional[PatternPiece]:
        """Get pattern piece by ID"""
        for piece in self.pieces:
            if piece.id == piece_id:
                return piece
        return None

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization"""
        return {
            "id": self.id,
            "name": self.name,
            "design_id": self.design_id,
            "pieces": [piece.to_dict() for piece in self.pieces],
            "seams": [seam.to_dict() for seam in self.seams],
            "format": self.format,
            "metadata": self.metadata,
            "version": self.version,
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "Pattern2D":
        """Create Pattern2D from dictionary"""
        return cls(
            id=data["id"],
            name=data["name"],
            design_id=data.get("design_id"),
            pieces=[PatternPiece.from_dict(p) for p in data["pieces"]],
            seams=[Seam.from_dict(s) for s in data.get("seams", [])],
            format=data.get("format", "JSON"),
            metadata=data.get("metadata", {}),
            version=data.get("version", "1.0"),
        )

    def to_json(self, filepath: str, indent: int = 2) -> None:
        """Save pattern to JSON file"""
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(self.to_dict(), f, indent=indent, ensure_ascii=False)

    @classmethod
    def from_json(cls, filepath: str) -> "Pattern2D":
        """Load pattern from JSON file"""
        with open(filepath, "r", encoding="utf-8") as f:
            data = json.load(f)
        return cls.from_dict(data)
