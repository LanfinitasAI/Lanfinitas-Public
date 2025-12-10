"""
Design Types - 3D design and mesh structures for Lanfinitas AI.

This module provides data structures for 3D meshes, materials, and complete
design assemblies. All types support JSON serialization and integrate with
common.py types.

3D设计类型模块 - 提供3D模型和网格相关的数据结构
"""

from __future__ import annotations
from dataclasses import dataclass, field
from typing import Dict, Any, Optional, List, Tuple

from lanfinitas_core.types.common import (
    Point2D,
    Point3D,
    Color,
    Texture,
    Transform,
)


@dataclass
class Vertex:
    """
    3D Vertex with optional normal and UV coordinates.

    Represents a single vertex in 3D space with optional attributes for
    shading (normal) and texture mapping (UV).

    Attributes:
        position: 3D position in space
        normal: Optional surface normal for smooth shading
        uv: Optional 2D texture coordinate (U, V in [0, 1] range)

    Example:
        >>> vertex = Vertex(
        ...     position=Point3D(1.0, 2.0, 3.0),
        ...     normal=Point3D(0.0, 1.0, 0.0),
        ...     uv=Point2D(0.5, 0.5)
        ... )
        >>> vertex.to_dict()
        {'position': {'x': 1.0, 'y': 2.0, 'z': 3.0}, ...}

    Notes:
        - Normal vectors should typically be unit length (magnitude 1.0)
        - UV coordinates are usually in [0, 1] range but can exceed for tiling
        - Position is required, normal and uv are optional
    """

    position: Point3D
    normal: Optional[Point3D] = None
    uv: Optional[Point2D] = None

    def to_dict(self) -> Dict[str, Any]:
        """
        Convert to dictionary for JSON serialization.

        Returns:
            Dictionary with 'position', 'normal' (if present), and 'uv' (if present)

        Example:
            >>> vertex = Vertex(Point3D(1, 2, 3))
            >>> vertex.to_dict()
            {'position': {'x': 1, 'y': 2, 'z': 3}, 'normal': None, 'uv': None}
        """
        return {
            "position": self.position.to_dict(),
            "normal": self.normal.to_dict() if self.normal else None,
            "uv": self.uv.to_dict() if self.uv else None,
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> Vertex:
        """
        Create Vertex from dictionary.

        Args:
            data: Dictionary with 'position' and optional 'normal', 'uv' keys

        Returns:
            Vertex instance

        Raises:
            KeyError: If 'position' is missing

        Example:
            >>> data = {
            ...     'position': {'x': 1, 'y': 2, 'z': 3},
            ...     'normal': {'x': 0, 'y': 1, 'z': 0}
            ... }
            >>> Vertex.from_dict(data)
            Vertex(position=Point3D(...), normal=Point3D(...), uv=None)
        """
        return cls(
            position=Point3D.from_dict(data["position"]),
            normal=Point3D.from_dict(data["normal"]) if data.get("normal") else None,
            uv=Point2D.from_dict(data["uv"]) if data.get("uv") else None,
        )


@dataclass
class Face:
    """
    Indexed triangle face.

    Represents a triangular face using three vertex indices. This is the
    standard representation for triangle meshes.

    Attributes:
        v0: Index of first vertex
        v1: Index of second vertex
        v2: Index of third vertex

    Example:
        >>> face = Face(v0=0, v1=1, v2=2)
        >>> face.to_dict()
        {'v0': 0, 'v1': 1, 'v2': 2}
        >>> face.indices()
        (0, 1, 2)

    Notes:
        - Indices reference vertices in the parent Mesh's vertex list
        - Vertex winding order determines face normal (typically counter-clockwise)
        - All indices must be valid for the mesh's vertex count
    """

    v0: int
    v1: int
    v2: int

    def to_dict(self) -> Dict[str, int]:
        """
        Convert to dictionary for JSON serialization.

        Returns:
            Dictionary with 'v0', 'v1', 'v2' keys

        Example:
            >>> Face(0, 1, 2).to_dict()
            {'v0': 0, 'v1': 1, 'v2': 2}
        """
        return {"v0": self.v0, "v1": self.v1, "v2": self.v2}

    @classmethod
    def from_dict(cls, data: Dict[str, int]) -> Face:
        """
        Create Face from dictionary.

        Args:
            data: Dictionary with 'v0', 'v1', 'v2' keys

        Returns:
            Face instance

        Raises:
            KeyError: If any required key is missing

        Example:
            >>> Face.from_dict({'v0': 0, 'v1': 1, 'v2': 2})
            Face(v0=0, v1=1, v2=2)
        """
        return cls(v0=data["v0"], v1=data["v1"], v2=data["v2"])

    def indices(self) -> Tuple[int, int, int]:
        """
        Get face indices as a tuple.

        Returns:
            Tuple of (v0, v1, v2)

        Example:
            >>> Face(0, 1, 2).indices()
            (0, 1, 2)
        """
        return (self.v0, self.v1, self.v2)


@dataclass
class TextureRef:
    """
    Texture reference with UV mapping parameters.

    Extends a base Texture with additional UV mapping controls such as
    scale, offset, and UV channel selection.

    Attributes:
        texture: Base texture reference from common.py
        uv_channel: UV channel index (default: 0)
        scale: UV scale factor as Point2D (default: 1.0, 1.0)
        offset: UV offset as Point2D (default: 0.0, 0.0)
        rotation: UV rotation in degrees (default: 0.0)

    Example:
        >>> tex_ref = TextureRef(
        ...     texture=Texture('fabric.png'),
        ...     scale=Point2D(2.0, 2.0),
        ...     offset=Point2D(0.5, 0.0)
        ... )
        >>> tex_ref.to_dict()
        {'texture': {...}, 'uv_channel': 0, 'scale': {...}, ...}

    Notes:
        - scale > 1.0 creates tiling, scale < 1.0 enlarges the texture
        - offset allows sliding the texture across the surface
        - rotation is in degrees, counter-clockwise
        - uv_channel selects which UV set to use (most models have 1)
    """

    texture: Texture
    uv_channel: int = 0
    scale: Point2D = field(default_factory=lambda: Point2D(1.0, 1.0))
    offset: Point2D = field(default_factory=lambda: Point2D(0.0, 0.0))
    rotation: float = 0.0

    def to_dict(self) -> Dict[str, Any]:
        """
        Convert to dictionary for JSON serialization.

        Returns:
            Dictionary with all TextureRef attributes

        Example:
            >>> tex_ref = TextureRef(Texture('fabric.png'))
            >>> tex_ref.to_dict()
            {'texture': {...}, 'uv_channel': 0, ...}
        """
        return {
            "texture": self.texture.to_dict(),
            "uv_channel": self.uv_channel,
            "scale": self.scale.to_dict(),
            "offset": self.offset.to_dict(),
            "rotation": self.rotation,
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> TextureRef:
        """
        Create TextureRef from dictionary.

        Args:
            data: Dictionary with texture reference attributes

        Returns:
            TextureRef instance

        Raises:
            KeyError: If 'texture' is missing

        Example:
            >>> data = {
            ...     'texture': {'file_path': 'fabric.png'},
            ...     'scale': {'x': 2.0, 'y': 2.0}
            ... }
            >>> TextureRef.from_dict(data)
            TextureRef(texture=Texture(...), scale=Point2D(2.0, 2.0), ...)
        """
        return cls(
            texture=Texture.from_dict(data["texture"]),
            uv_channel=data.get("uv_channel", 0),
            scale=Point2D.from_dict(data["scale"]) if "scale" in data else Point2D(1.0, 1.0),
            offset=Point2D.from_dict(data["offset"]) if "offset" in data else Point2D(0.0, 0.0),
            rotation=data.get("rotation", 0.0),
        )


@dataclass
class Material:
    """
    PBR (Physically Based Rendering) Material.

    Defines the visual appearance of a surface using physically-based
    rendering parameters including albedo color, textures, roughness,
    metallic properties, and emission.

    Attributes:
        name: Material name/identifier
        color: Base albedo color (from common.py Color)
        texture: Optional albedo/diffuse texture
        normal_map: Optional normal map texture for surface detail
        roughness: Surface roughness (0.0 = smooth/glossy, 1.0 = rough/matte)
        metallic: Metallic property (0.0 = dielectric, 1.0 = metal)
        emission: Optional emissive color for self-lit materials
        opacity: Transparency (0.0 = fully transparent, 1.0 = fully opaque)
        metadata: Additional custom material properties

    Example:
        >>> material = Material(
        ...     name='fabric_cotton',
        ...     color=Color(0.8, 0.6, 0.4, 1.0),
        ...     texture=TextureRef(Texture('cotton.png')),
        ...     roughness=0.7,
        ...     metallic=0.0
        ... )
        >>> material.to_dict()
        {'name': 'fabric_cotton', 'color': {...}, ...}

    Notes:
        - Follows PBR metallic/roughness workflow
        - roughness and metallic should be in [0.0, 1.0] range
        - emission enables glow effects (e.g., for LEDs, screens)
        - opacity < 1.0 requires alpha blending in renderer
    """

    name: str
    color: Color
    texture: Optional[TextureRef] = None
    normal_map: Optional[TextureRef] = None
    roughness: float = 0.5
    metallic: float = 0.0
    emission: Optional[Color] = None
    opacity: float = 1.0
    metadata: Dict[str, Any] = field(default_factory=dict)

    def __post_init__(self) -> None:
        """
        Validate material parameters.

        Raises:
            ValueError: If roughness, metallic, or opacity is outside [0.0, 1.0]
        """
        for param, value in [("roughness", self.roughness), ("metallic", self.metallic), ("opacity", self.opacity)]:
            if not 0.0 <= value <= 1.0:
                raise ValueError(
                    f"Material {param} must be in [0.0, 1.0] range, got {value}"
                )

    def to_dict(self) -> Dict[str, Any]:
        """
        Convert to dictionary for JSON serialization.

        Returns:
            Dictionary with all material attributes

        Example:
            >>> material = Material('wood', Color(0.6, 0.4, 0.2, 1.0))
            >>> material.to_dict()
            {'name': 'wood', 'color': {...}, 'roughness': 0.5, ...}
        """
        return {
            "name": self.name,
            "color": self.color.to_dict(),
            "texture": self.texture.to_dict() if self.texture else None,
            "normal_map": self.normal_map.to_dict() if self.normal_map else None,
            "roughness": self.roughness,
            "metallic": self.metallic,
            "emission": self.emission.to_dict() if self.emission else None,
            "opacity": self.opacity,
            "metadata": self.metadata,
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> Material:
        """
        Create Material from dictionary.

        Args:
            data: Dictionary with material attributes

        Returns:
            Material instance

        Raises:
            KeyError: If 'name' or 'color' is missing
            ValueError: If parameter values are invalid

        Example:
            >>> data = {
            ...     'name': 'plastic',
            ...     'color': {'r': 1.0, 'g': 0.0, 'b': 0.0, 'a': 1.0},
            ...     'roughness': 0.3,
            ...     'metallic': 0.0
            ... }
            >>> Material.from_dict(data)
            Material(name='plastic', color=Color(...), ...)
        """
        return cls(
            name=data["name"],
            color=Color.from_dict(data["color"]),
            texture=TextureRef.from_dict(data["texture"]) if data.get("texture") else None,
            normal_map=TextureRef.from_dict(data["normal_map"]) if data.get("normal_map") else None,
            roughness=data.get("roughness", 0.5),
            metallic=data.get("metallic", 0.0),
            emission=Color.from_dict(data["emission"]) if data.get("emission") else None,
            opacity=data.get("opacity", 1.0),
            metadata=data.get("metadata", {}),
        )


@dataclass
class Mesh:
    """
    3D Triangle Mesh.

    Represents a triangular mesh with vertices, faces, and optional per-vertex
    attributes. This is the fundamental 3D geometry container.

    Attributes:
        vertices: List of vertex definitions
        faces: List of triangular faces (vertex index triplets)
        name: Optional mesh name/identifier
        material_name: Optional material reference
        metadata: Additional mesh properties

    Example:
        >>> mesh = Mesh(
        ...     vertices=[
        ...         Vertex(Point3D(0, 0, 0)),
        ...         Vertex(Point3D(1, 0, 0)),
        ...         Vertex(Point3D(0, 1, 0))
        ...     ],
        ...     faces=[Face(0, 1, 2)],
        ...     name='triangle'
        ... )
        >>> mesh.to_dict()
        {'vertices': [...], 'faces': [...], 'name': 'triangle', ...}

    Notes:
        - All face indices must reference valid vertices
        - Vertex normals should be normalized (unit length)
        - UV coordinates typically in [0, 1] range
        - material_name references a Material in the parent Design3D
    """

    vertices: List[Vertex]
    faces: List[Face]
    name: Optional[str] = None
    material_name: Optional[str] = None
    metadata: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        """
        Convert to dictionary for JSON serialization.

        Returns:
            Dictionary with mesh data

        Example:
            >>> mesh = Mesh([Vertex(Point3D(0, 0, 0))], [Face(0, 0, 0)])
            >>> mesh.to_dict()
            {'vertices': [...], 'faces': [...], ...}
        """
        return {
            "vertices": [v.to_dict() for v in self.vertices],
            "faces": [f.to_dict() for f in self.faces],
            "name": self.name,
            "material_name": self.material_name,
            "metadata": self.metadata,
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> Mesh:
        """
        Create Mesh from dictionary.

        Args:
            data: Dictionary with 'vertices' and 'faces' lists

        Returns:
            Mesh instance

        Raises:
            KeyError: If required keys are missing

        Example:
            >>> data = {
            ...     'vertices': [{'position': {'x': 0, 'y': 0, 'z': 0}}],
            ...     'faces': [{'v0': 0, 'v1': 0, 'v2': 0}]
            ... }
            >>> Mesh.from_dict(data)
            Mesh(vertices=[Vertex(...)], faces=[Face(...)])
        """
        return cls(
            vertices=[Vertex.from_dict(v) for v in data["vertices"]],
            faces=[Face.from_dict(f) for f in data["faces"]],
            name=data.get("name"),
            material_name=data.get("material_name"),
            metadata=data.get("metadata", {}),
        )


@dataclass
class Design3D:
    """
    Complete 3D Design assembly.

    Represents a complete 3D design containing multiple meshes, materials,
    and a transform. This is the top-level container for 3D garment designs.

    Attributes:
        meshes: List of mesh objects in the design
        materials: Dictionary mapping material names to Material objects
        transform: Global transform applied to entire design
        name: Optional design name/identifier
        metadata: Additional design properties (author, version, tags, etc.)

    Example:
        >>> design = Design3D(
        ...     meshes=[mesh1, mesh2],
        ...     materials={'fabric': material1, 'button': material2},
        ...     transform=Transform.identity(),
        ...     name='shirt_design_v1'
        ... )
        >>> design.to_dict()
        {'meshes': [...], 'materials': {...}, ...}

    Notes:
        - meshes list can contain multiple mesh objects
        - materials dict provides material definitions for mesh references
        - transform applies to all meshes uniformly
        - metadata can include version, author, creation_date, tags, etc.
    """

    meshes: List[Mesh]
    materials: Dict[str, Material] = field(default_factory=dict)
    transform: Transform = field(default_factory=Transform.identity)
    name: Optional[str] = None
    metadata: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        """
        Convert to dictionary for JSON serialization.

        Returns:
            Dictionary with complete design data

        Example:
            >>> design = Design3D([mesh], {'mat': material})
            >>> design.to_dict()
            {'meshes': [...], 'materials': {...}, 'transform': {...}, ...}
        """
        return {
            "meshes": [m.to_dict() for m in self.meshes],
            "materials": {name: mat.to_dict() for name, mat in self.materials.items()},
            "transform": self.transform.to_dict(),
            "name": self.name,
            "metadata": self.metadata,
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> Design3D:
        """
        Create Design3D from dictionary.

        Args:
            data: Dictionary with design data

        Returns:
            Design3D instance

        Raises:
            KeyError: If required keys are missing

        Example:
            >>> data = {
            ...     'meshes': [{...}],
            ...     'materials': {'fabric': {...}},
            ...     'transform': {'translation': {...}, ...}
            ... }
            >>> Design3D.from_dict(data)
            Design3D(meshes=[...], materials={...}, ...)
        """
        return cls(
            meshes=[Mesh.from_dict(m) for m in data["meshes"]],
            materials={
                name: Material.from_dict(mat_data)
                for name, mat_data in data.get("materials", {}).items()
            },
            transform=Transform.from_dict(data["transform"]) if "transform" in data else Transform.identity(),
            name=data.get("name"),
            metadata=data.get("metadata", {}),
        )


# Export all types
__all__ = [
    "Vertex",
    "Face",
    "Mesh",
    "Material",
    "TextureRef",
    "Design3D",
]
