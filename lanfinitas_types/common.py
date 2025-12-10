"""
Common Types - Basic geometric and transformation types for Lanfinitas AI.

This module provides fundamental data structures for geometric operations,
transformations, colors, and textures. All types support JSON serialization
and avoid complex algorithmic logic.

基础类型模块 - 提供几何和变换相关的基础数据结构
"""

from __future__ import annotations
from dataclasses import dataclass, field
from typing import Dict, Any, Optional, List, Tuple
from pathlib import Path


@dataclass
class Point2D:
    """
    2D Point in Cartesian coordinates.

    Represents a point in 2D space with X and Y coordinates.

    Attributes:
        x: X-coordinate (float)
        y: Y-coordinate (float)

    Example:
        >>> point = Point2D(x=10.5, y=20.3)
        >>> point.to_dict()
        {'x': 10.5, 'y': 20.3}
    """

    x: float
    y: float

    def to_dict(self) -> Dict[str, float]:
        """
        Convert to dictionary for JSON serialization.

        Returns:
            Dictionary with 'x' and 'y' keys

        Example:
            >>> Point2D(1.0, 2.0).to_dict()
            {'x': 1.0, 'y': 2.0}
        """
        return {"x": self.x, "y": self.y}

    @classmethod
    def from_dict(cls, data: Dict[str, float]) -> Point2D:
        """
        Create Point2D from dictionary.

        Args:
            data: Dictionary containing 'x' and 'y' keys

        Returns:
            Point2D instance

        Raises:
            KeyError: If 'x' or 'y' is missing from data

        Example:
            >>> Point2D.from_dict({'x': 1.0, 'y': 2.0})
            Point2D(x=1.0, y=2.0)
        """
        return cls(x=data["x"], y=data["y"])


@dataclass
class Point3D:
    """
    3D Point in Cartesian coordinates.

    Represents a point in 3D space with X, Y, and Z coordinates.

    Attributes:
        x: X-coordinate (float)
        y: Y-coordinate (float)
        z: Z-coordinate (float)

    Example:
        >>> point = Point3D(x=10.5, y=20.3, z=5.0)
        >>> point.to_dict()
        {'x': 10.5, 'y': 20.3, 'z': 5.0}
    """

    x: float
    y: float
    z: float

    def to_dict(self) -> Dict[str, float]:
        """
        Convert to dictionary for JSON serialization.

        Returns:
            Dictionary with 'x', 'y', and 'z' keys

        Example:
            >>> Point3D(1.0, 2.0, 3.0).to_dict()
            {'x': 1.0, 'y': 2.0, 'z': 3.0}
        """
        return {"x": self.x, "y": self.y, "z": self.z}

    @classmethod
    def from_dict(cls, data: Dict[str, float]) -> Point3D:
        """
        Create Point3D from dictionary.

        Args:
            data: Dictionary containing 'x', 'y', and 'z' keys

        Returns:
            Point3D instance

        Raises:
            KeyError: If any required key is missing from data

        Example:
            >>> Point3D.from_dict({'x': 1.0, 'y': 2.0, 'z': 3.0})
            Point3D(x=1.0, y=2.0, z=3.0)
        """
        return cls(x=data["x"], y=data["y"], z=data["z"])


@dataclass
class BoundingBox2D:
    """
    Axis-Aligned Bounding Box in 2D space.

    Represents a rectangular box defined by minimum and maximum corner points in 2D.
    Useful for pattern pieces, layout optimization, and collision detection.

    Attributes:
        min_point: Minimum corner point (bottom-left)
        max_point: Maximum corner point (top-right)

    Example:
        >>> bbox = BoundingBox2D(
        ...     min_point=Point2D(0.0, 0.0),
        ...     max_point=Point2D(10.0, 20.0)
        ... )
        >>> bbox.area()
        200.0
        >>> bbox.width()
        10.0
    """

    min_point: Point2D
    max_point: Point2D

    def width(self) -> float:
        """
        Calculate the width of the bounding box.

        Returns:
            Width (max_x - min_x)

        Example:
            >>> bbox = BoundingBox2D(Point2D(0, 0), Point2D(10, 5))
            >>> bbox.width()
            10.0
        """
        return self.max_point.x - self.min_point.x

    def height(self) -> float:
        """
        Calculate the height of the bounding box.

        Returns:
            Height (max_y - min_y)

        Example:
            >>> bbox = BoundingBox2D(Point2D(0, 0), Point2D(10, 5))
            >>> bbox.height()
            5.0
        """
        return self.max_point.y - self.min_point.y

    def area(self) -> float:
        """
        Calculate the area of the bounding box.

        Returns:
            Area (width * height)

        Example:
            >>> bbox = BoundingBox2D(Point2D(0, 0), Point2D(10, 5))
            >>> bbox.area()
            50.0
        """
        return self.width() * self.height()

    def center(self) -> Point2D:
        """
        Calculate the center point of the bounding box.

        Returns:
            Center point as Point2D

        Example:
            >>> bbox = BoundingBox2D(Point2D(0, 0), Point2D(10, 20))
            >>> bbox.center()
            Point2D(x=5.0, y=10.0)
        """
        return Point2D(
            x=(self.min_point.x + self.max_point.x) / 2.0,
            y=(self.min_point.y + self.max_point.y) / 2.0,
        )

    def intersects(self, other: "BoundingBox2D") -> bool:
        """
        Check if this bounding box intersects with another.

        Args:
            other: Another BoundingBox2D to check intersection with

        Returns:
            True if boxes intersect, False otherwise

        Example:
            >>> bbox1 = BoundingBox2D(Point2D(0, 0), Point2D(10, 10))
            >>> bbox2 = BoundingBox2D(Point2D(5, 5), Point2D(15, 15))
            >>> bbox1.intersects(bbox2)
            True
        """
        return not (
            self.max_point.x < other.min_point.x
            or self.min_point.x > other.max_point.x
            or self.max_point.y < other.min_point.y
            or self.min_point.y > other.max_point.y
        )

    def intersection(self, other: "BoundingBox2D") -> Optional["BoundingBox2D"]:
        """
        Calculate the intersection of two bounding boxes.

        Args:
            other: Another BoundingBox2D to intersect with

        Returns:
            BoundingBox2D of intersection, or None if no intersection

        Example:
            >>> bbox1 = BoundingBox2D(Point2D(0, 0), Point2D(10, 10))
            >>> bbox2 = BoundingBox2D(Point2D(5, 5), Point2D(15, 15))
            >>> intersection = bbox1.intersection(bbox2)
            >>> intersection.min_point
            Point2D(x=5.0, y=5.0)
        """
        if not self.intersects(other):
            return None

        min_x = max(self.min_point.x, other.min_point.x)
        min_y = max(self.min_point.y, other.min_point.y)
        max_x = min(self.max_point.x, other.max_point.x)
        max_y = min(self.max_point.y, other.max_point.y)

        return BoundingBox2D(
            min_point=Point2D(min_x, min_y),
            max_point=Point2D(max_x, max_y),
        )

    def iou(self, other: "BoundingBox2D") -> float:
        """
        Calculate Intersection over Union (IoU) with another bounding box.

        IoU is a metric commonly used in computer vision and layout optimization
        to measure the overlap between two bounding boxes.

        Args:
            other: Another BoundingBox2D to calculate IoU with

        Returns:
            IoU value in range [0.0, 1.0], where:
            - 0.0 means no overlap
            - 1.0 means perfect overlap

        Example:
            >>> bbox1 = BoundingBox2D(Point2D(0, 0), Point2D(10, 10))
            >>> bbox2 = BoundingBox2D(Point2D(5, 5), Point2D(15, 15))
            >>> bbox1.iou(bbox2)
            0.14285714285714285  # approximately 1/7
        """
        intersection_box = self.intersection(other)

        if intersection_box is None:
            return 0.0

        intersection_area = intersection_box.area()
        union_area = self.area() + other.area() - intersection_area

        if union_area == 0.0:
            return 0.0

        return intersection_area / union_area

    def to_dict(self) -> Dict[str, Any]:
        """
        Convert to dictionary for JSON serialization.

        Returns:
            Dictionary with 'min_point' and 'max_point' keys

        Example:
            >>> bbox = BoundingBox2D(Point2D(0, 0), Point2D(1, 1))
            >>> bbox.to_dict()
            {'min_point': {'x': 0, 'y': 0}, 'max_point': {'x': 1, 'y': 1}}
        """
        return {
            "min_point": self.min_point.to_dict(),
            "max_point": self.max_point.to_dict(),
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "BoundingBox2D":
        """
        Create BoundingBox2D from dictionary.

        Args:
            data: Dictionary containing 'min_point' and 'max_point' dicts

        Returns:
            BoundingBox2D instance

        Raises:
            KeyError: If required keys are missing

        Example:
            >>> data = {
            ...     'min_point': {'x': 0, 'y': 0},
            ...     'max_point': {'x': 10, 'y': 20}
            ... }
            >>> BoundingBox2D.from_dict(data)
            BoundingBox2D(min_point=Point2D(...), max_point=Point2D(...))
        """
        return cls(
            min_point=Point2D.from_dict(data["min_point"]),
            max_point=Point2D.from_dict(data["max_point"]),
        )


@dataclass
class BoundingBox3D:
    """
    Axis-Aligned Bounding Box in 3D space.

    Represents a rectangular box defined by minimum and maximum corner points.
    Used for 3D mesh bounds, collision detection, and spatial queries.

    Attributes:
        min_point: Minimum corner point (bottom-front-left)
        max_point: Maximum corner point (top-back-right)

    Example:
        >>> bbox = BoundingBox3D(
        ...     min_point=Point3D(0.0, 0.0, 0.0),
        ...     max_point=Point3D(10.0, 20.0, 5.0)
        ... )
        >>> bbox.to_dict()
        {'min_point': {'x': 0.0, 'y': 0.0, 'z': 0.0}, ...}
    """

    min_point: Point3D
    max_point: Point3D

    def to_dict(self) -> Dict[str, Any]:
        """
        Convert to dictionary for JSON serialization.

        Returns:
            Dictionary with 'min_point' and 'max_point' keys

        Example:
            >>> bbox = BoundingBox3D(Point3D(0, 0, 0), Point3D(1, 1, 1))
            >>> bbox.to_dict()
            {'min_point': {'x': 0, 'y': 0, 'z': 0}, 'max_point': ...}
        """
        return {
            "min_point": self.min_point.to_dict(),
            "max_point": self.max_point.to_dict(),
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "BoundingBox3D":
        """
        Create BoundingBox3D from dictionary.

        Args:
            data: Dictionary containing 'min_point' and 'max_point' dicts

        Returns:
            BoundingBox3D instance

        Raises:
            KeyError: If required keys are missing

        Example:
            >>> data = {
            ...     'min_point': {'x': 0, 'y': 0, 'z': 0},
            ...     'max_point': {'x': 1, 'y': 1, 'z': 1}
            ... }
            >>> BoundingBox3D.from_dict(data)
            BoundingBox3D(min_point=Point3D(...), max_point=Point3D(...))
        """
        return cls(
            min_point=Point3D.from_dict(data["min_point"]),
            max_point=Point3D.from_dict(data["max_point"]),
        )


# Backward compatibility alias
BoundingBox = BoundingBox3D


@dataclass
class Transform2D:
    """
    2D Transformation with translation, rotation, and scale.

    Represents a complete 2D transformation for pattern pieces and layouts.
    Uses separate components rather than a matrix for easier manipulation.

    Attributes:
        translation: Translation vector as Point2D (default: 0, 0)
        rotation: Rotation in degrees (default: 0.0)
        scale: Scale factors as Point2D (default: 1, 1)

    Example:
        >>> transform = Transform2D(
        ...     translation=Point2D(10.0, 0.0),
        ...     rotation=45.0,
        ...     scale=Point2D(2.0, 2.0)
        ... )
        >>> transform.to_dict()
        {'translation': {'x': 10.0, 'y': 0.0}, 'rotation': 45.0, ...}

    Notes:
        - Rotation is in degrees (not radians)
        - Positive rotation is counter-clockwise
        - Scale values should be positive; use negative for reflection
    """

    translation: Point2D = field(default_factory=lambda: Point2D(0.0, 0.0))
    rotation: float = 0.0
    scale: Point2D = field(default_factory=lambda: Point2D(1.0, 1.0))

    def to_dict(self) -> Dict[str, Any]:
        """
        Convert to dictionary for JSON serialization.

        Returns:
            Dictionary with 'translation', 'rotation', and 'scale' keys

        Example:
            >>> transform = Transform2D()
            >>> transform.to_dict()
            {'translation': {'x': 0.0, 'y': 0.0}, 'rotation': 0.0, ...}
        """
        return {
            "translation": self.translation.to_dict(),
            "rotation": self.rotation,
            "scale": self.scale.to_dict(),
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "Transform2D":
        """
        Create Transform2D from dictionary.

        Args:
            data: Dictionary with 'translation', 'rotation', 'scale' dicts

        Returns:
            Transform2D instance

        Raises:
            KeyError: If required keys are missing

        Example:
            >>> data = {
            ...     'translation': {'x': 10, 'y': 0},
            ...     'rotation': 45.0,
            ...     'scale': {'x': 2, 'y': 2}
            ... }
            >>> Transform2D.from_dict(data)
            Transform2D(translation=Point2D(...), rotation=45.0, scale=...)
        """
        return cls(
            translation=Point2D.from_dict(data["translation"]),
            rotation=data["rotation"],
            scale=Point2D.from_dict(data["scale"]),
        )

    @classmethod
    def identity(cls) -> "Transform2D":
        """
        Create an identity transform (no transformation).

        Returns:
            Transform2D with zero translation, zero rotation, and unit scale

        Example:
            >>> identity = Transform2D.identity()
            >>> identity.scale
            Point2D(x=1.0, y=1.0)
        """
        return cls()


@dataclass
class Transform3D:
    """
    3D Transformation with translation, rotation, and scale.

    Represents a complete 3D transformation as separate components rather
    than a matrix. This makes it easier to modify individual aspects.

    Attributes:
        translation: Translation vector as Point3D (default: 0, 0, 0)
        rotation: Rotation in degrees as Point3D (Euler angles: X, Y, Z) (default: 0, 0, 0)
        scale: Scale factors as Point3D (default: 1, 1, 1)

    Example:
        >>> transform = Transform3D(
        ...     translation=Point3D(10.0, 0.0, 0.0),
        ...     rotation=Point3D(0.0, 90.0, 0.0),
        ...     scale=Point3D(2.0, 2.0, 2.0)
        ... )
        >>> transform.to_dict()
        {'translation': {'x': 10.0, ...}, 'rotation': ..., 'scale': ...}

    Notes:
        - Rotation uses Euler angles in degrees (not radians)
        - Rotation order is typically X -> Y -> Z (application-dependent)
        - Scale values should be positive; use negative for reflection
    """

    translation: Point3D = field(default_factory=lambda: Point3D(0.0, 0.0, 0.0))
    rotation: Point3D = field(default_factory=lambda: Point3D(0.0, 0.0, 0.0))
    scale: Point3D = field(default_factory=lambda: Point3D(1.0, 1.0, 1.0))

    def to_dict(self) -> Dict[str, Any]:
        """
        Convert to dictionary for JSON serialization.

        Returns:
            Dictionary with 'translation', 'rotation', and 'scale' keys

        Example:
            >>> transform = Transform3D()
            >>> transform.to_dict()
            {'translation': {'x': 0.0, 'y': 0.0, 'z': 0.0}, ...}
        """
        return {
            "translation": self.translation.to_dict(),
            "rotation": self.rotation.to_dict(),
            "scale": self.scale.to_dict(),
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "Transform3D":
        """
        Create Transform3D from dictionary.

        Args:
            data: Dictionary with 'translation', 'rotation', 'scale' dicts

        Returns:
            Transform3D instance

        Raises:
            KeyError: If required keys are missing

        Example:
            >>> data = {
            ...     'translation': {'x': 10, 'y': 0, 'z': 0},
            ...     'rotation': {'x': 0, 'y': 90, 'z': 0},
            ...     'scale': {'x': 2, 'y': 2, 'z': 2}
            ... }
            >>> Transform3D.from_dict(data)
            Transform3D(translation=Point3D(...), rotation=..., scale=...)
        """
        return cls(
            translation=Point3D.from_dict(data["translation"]),
            rotation=Point3D.from_dict(data["rotation"]),
            scale=Point3D.from_dict(data["scale"]),
        )

    @classmethod
    def identity(cls) -> "Transform3D":
        """
        Create an identity transform (no transformation).

        Returns:
            Transform3D with zero translation, zero rotation, and unit scale

        Example:
            >>> identity = Transform3D.identity()
            >>> identity.scale
            Point3D(x=1.0, y=1.0, z=1.0)
        """
        return cls()


# Backward compatibility alias
Transform = Transform3D


@dataclass
class Color:
    """
    RGBA Color representation.

    Represents a color with red, green, blue, and alpha (transparency) channels.
    Values are normalized to [0.0, 1.0] range. Also supports HEX string conversion.

    Attributes:
        r: Red channel (0.0 to 1.0)
        g: Green channel (0.0 to 1.0)
        b: Blue channel (0.0 to 1.0)
        a: Alpha channel for transparency (0.0 = transparent, 1.0 = opaque)

    Example:
        >>> red = Color(r=1.0, g=0.0, b=0.0, a=1.0)
        >>> red.to_hex()
        '#FF0000FF'
        >>> Color.from_hex('#FF0000')
        Color(r=1.0, g=0.0, b=0.0, a=1.0)

    Notes:
        - All color channels should be in [0.0, 1.0] range
        - HEX format supports both #RRGGBB and #RRGGBBAA formats
    """

    r: float
    g: float
    b: float
    a: float = 1.0

    def __post_init__(self) -> None:
        """
        Validate color channel values.

        Raises:
            ValueError: If any channel is outside [0.0, 1.0] range
        """
        for channel, value in [("r", self.r), ("g", self.g), ("b", self.b), ("a", self.a)]:
            if not 0.0 <= value <= 1.0:
                raise ValueError(
                    f"Color channel '{channel}' must be in [0.0, 1.0] range, got {value}"
                )

    def to_dict(self) -> Dict[str, float]:
        """
        Convert to dictionary for JSON serialization.

        Returns:
            Dictionary with 'r', 'g', 'b', 'a' keys

        Example:
            >>> Color(1.0, 0.5, 0.0).to_dict()
            {'r': 1.0, 'g': 0.5, 'b': 0.0, 'a': 1.0}
        """
        return {"r": self.r, "g": self.g, "b": self.b, "a": self.a}

    @classmethod
    def from_dict(cls, data: Dict[str, float]) -> Color:
        """
        Create Color from dictionary.

        Args:
            data: Dictionary with 'r', 'g', 'b', and optional 'a' keys

        Returns:
            Color instance

        Raises:
            KeyError: If required keys are missing
            ValueError: If color values are out of range

        Example:
            >>> Color.from_dict({'r': 1.0, 'g': 0.0, 'b': 0.0, 'a': 1.0})
            Color(r=1.0, g=0.0, b=0.0, a=1.0)
        """
        return cls(
            r=data["r"],
            g=data["g"],
            b=data["b"],
            a=data.get("a", 1.0),
        )

    def to_hex(self, include_alpha: bool = True) -> str:
        """
        Convert to hexadecimal color string.

        Args:
            include_alpha: Whether to include alpha channel in output

        Returns:
            Hexadecimal color string (e.g., '#FF0000' or '#FF0000FF')

        Example:
            >>> Color(1.0, 0.0, 0.0, 1.0).to_hex()
            '#FF0000FF'
            >>> Color(1.0, 0.0, 0.0, 1.0).to_hex(include_alpha=False)
            '#FF0000'
        """
        r = int(self.r * 255)
        g = int(self.g * 255)
        b = int(self.b * 255)

        if include_alpha:
            a = int(self.a * 255)
            return f"#{r:02X}{g:02X}{b:02X}{a:02X}"
        else:
            return f"#{r:02X}{g:02X}{b:02X}"

    @classmethod
    def from_hex(cls, hex_string: str) -> Color:
        """
        Create Color from hexadecimal string.

        Args:
            hex_string: Hex color string (formats: '#RGB', '#RRGGBB', '#RRGGBBAA')

        Returns:
            Color instance

        Raises:
            ValueError: If hex string is invalid

        Example:
            >>> Color.from_hex('#FF0000')
            Color(r=1.0, g=0.0, b=0.0, a=1.0)
            >>> Color.from_hex('#FF0000FF')
            Color(r=1.0, g=0.0, b=0.0, a=1.0)
            >>> Color.from_hex('#F00')
            Color(r=1.0, g=0.0, b=0.0, a=1.0)
        """
        # Remove '#' if present
        hex_string = hex_string.lstrip("#")

        # Handle different hex formats
        if len(hex_string) == 3:  # #RGB
            r = int(hex_string[0] * 2, 16) / 255.0
            g = int(hex_string[1] * 2, 16) / 255.0
            b = int(hex_string[2] * 2, 16) / 255.0
            a = 1.0
        elif len(hex_string) == 6:  # #RRGGBB
            r = int(hex_string[0:2], 16) / 255.0
            g = int(hex_string[2:4], 16) / 255.0
            b = int(hex_string[4:6], 16) / 255.0
            a = 1.0
        elif len(hex_string) == 8:  # #RRGGBBAA
            r = int(hex_string[0:2], 16) / 255.0
            g = int(hex_string[2:4], 16) / 255.0
            b = int(hex_string[4:6], 16) / 255.0
            a = int(hex_string[6:8], 16) / 255.0
        else:
            raise ValueError(
                f"Invalid hex color string: '{hex_string}'. "
                f"Expected formats: #RGB, #RRGGBB, or #RRGGBBAA"
            )

        return cls(r=r, g=g, b=b, a=a)

    @classmethod
    def from_rgb(cls, r: int, g: int, b: int, a: int = 255) -> Color:
        """
        Create Color from RGB values (0-255 range).

        Args:
            r: Red channel (0-255)
            g: Green channel (0-255)
            b: Blue channel (0-255)
            a: Alpha channel (0-255), default 255

        Returns:
            Color instance

        Example:
            >>> Color.from_rgb(255, 0, 0)
            Color(r=1.0, g=0.0, b=0.0, a=1.0)
        """
        return cls(
            r=r / 255.0,
            g=g / 255.0,
            b=b / 255.0,
            a=a / 255.0,
        )


@dataclass
class Texture:
    """
    Texture reference with metadata.

    Represents a texture file reference along with associated metadata
    such as resolution, format, and usage parameters.

    Attributes:
        file_path: Path to the texture file (relative or absolute)
        width: Texture width in pixels (optional)
        height: Texture height in pixels (optional)
        format: Texture format (e.g., 'PNG', 'JPEG', 'TGA')
        wrap_u: U-axis wrapping mode ('repeat', 'clamp', 'mirror')
        wrap_v: V-axis wrapping mode ('repeat', 'clamp', 'mirror')
        metadata: Additional custom metadata

    Example:
        >>> texture = Texture(
        ...     file_path='textures/fabric.png',
        ...     width=1024,
        ...     height=1024,
        ...     format='PNG'
        ... )
        >>> texture.to_dict()
        {'file_path': 'textures/fabric.png', 'width': 1024, ...}

    Notes:
        - file_path can be relative to project root or absolute
        - Dimensions (width, height) are optional and may be auto-detected
        - Wrapping modes determine how texture coordinates outside [0,1] are handled
    """

    file_path: str
    width: Optional[int] = None
    height: Optional[int] = None
    format: Optional[str] = None
    wrap_u: str = "repeat"
    wrap_v: str = "repeat"
    metadata: Dict[str, Any] = field(default_factory=dict)

    def __post_init__(self) -> None:
        """
        Validate texture parameters.

        Raises:
            ValueError: If wrap modes are invalid or dimensions are negative
        """
        valid_wrap_modes = {"repeat", "clamp", "mirror"}

        if self.wrap_u not in valid_wrap_modes:
            raise ValueError(
                f"Invalid wrap_u mode: '{self.wrap_u}'. "
                f"Must be one of: {valid_wrap_modes}"
            )

        if self.wrap_v not in valid_wrap_modes:
            raise ValueError(
                f"Invalid wrap_v mode: '{self.wrap_v}'. "
                f"Must be one of: {valid_wrap_modes}"
            )

        if self.width is not None and self.width <= 0:
            raise ValueError(f"Texture width must be positive, got {self.width}")

        if self.height is not None and self.height <= 0:
            raise ValueError(f"Texture height must be positive, got {self.height}")

    def to_dict(self) -> Dict[str, Any]:
        """
        Convert to dictionary for JSON serialization.

        Returns:
            Dictionary with all texture attributes

        Example:
            >>> texture = Texture('fabric.png', width=512, height=512)
            >>> texture.to_dict()
            {'file_path': 'fabric.png', 'width': 512, 'height': 512, ...}
        """
        return {
            "file_path": self.file_path,
            "width": self.width,
            "height": self.height,
            "format": self.format,
            "wrap_u": self.wrap_u,
            "wrap_v": self.wrap_v,
            "metadata": self.metadata,
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> Texture:
        """
        Create Texture from dictionary.

        Args:
            data: Dictionary with texture attributes

        Returns:
            Texture instance

        Raises:
            KeyError: If 'file_path' is missing
            ValueError: If parameters are invalid

        Example:
            >>> data = {
            ...     'file_path': 'fabric.png',
            ...     'width': 512,
            ...     'height': 512,
            ...     'format': 'PNG'
            ... }
            >>> Texture.from_dict(data)
            Texture(file_path='fabric.png', width=512, ...)
        """
        return cls(
            file_path=data["file_path"],
            width=data.get("width"),
            height=data.get("height"),
            format=data.get("format"),
            wrap_u=data.get("wrap_u", "repeat"),
            wrap_v=data.get("wrap_v", "repeat"),
            metadata=data.get("metadata", {}),
        )

    def get_path(self) -> Path:
        """
        Get file path as Path object.

        Returns:
            Path object for the texture file

        Example:
            >>> texture = Texture('textures/fabric.png')
            >>> texture.get_path()
            PosixPath('textures/fabric.png')
        """
        return Path(self.file_path)

    def exists(self) -> bool:
        """
        Check if texture file exists on filesystem.

        Returns:
            True if file exists, False otherwise

        Example:
            >>> texture = Texture('textures/fabric.png')
            >>> texture.exists()
            False  # if file doesn't exist
        """
        return self.get_path().exists()


# Export all types
__all__ = [
    "Point2D",
    "Point3D",
    "BoundingBox2D",
    "BoundingBox3D",
    "BoundingBox",  # Backward compatibility alias for BoundingBox3D
    "Transform2D",
    "Transform3D",
    "Transform",  # Backward compatibility alias for Transform3D
    "Color",
    "Texture",
]
