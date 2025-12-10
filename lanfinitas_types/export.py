"""
Export Types - CAD file formats and export metadata

导出类型模块 - 提供CAD文件格式和导出元数据相关的数据结构
"""

from dataclasses import dataclass, field, asdict
from typing import Dict, List, Optional, Any
from enum import Enum
from datetime import datetime
import json


class ExportFormat(str, Enum):
    """
    Supported CAD export formats

    支持的CAD导出格式
    """
    # Vector formats
    DXF = "dxf"  # AutoCAD DXF (Drawing Exchange Format)
    DWG = "dwg"  # AutoCAD DWG (Drawing)
    PLT = "plt"  # HPGL Plotter format
    PDF = "pdf"  # Portable Document Format
    SVG = "svg"  # Scalable Vector Graphics

    # Gerber CAD systems
    GERBER = "gerber"  # Gerber format
    LECTRA = "lectra"  # Lectra Modaris format
    OPTITEX = "optitex"  # Optitex format
    ASSYST = "assyst"  # Assyst format

    # 3D formats
    OBJ = "obj"  # Wavefront OBJ
    FBX = "fbx"  # Autodesk FBX
    GLTF = "gltf"  # GL Transmission Format
    STL = "stl"  # Stereolithography

    # Data formats
    JSON = "json"  # JSON data format
    XML = "xml"  # XML data format


class DXFVersion(str, Enum):
    """
    AutoCAD DXF version

    AutoCAD DXF版本
    """
    R12 = "R12"  # AutoCAD R12 (1992)
    R13 = "R13"  # AutoCAD R13 (1994)
    R14 = "R14"  # AutoCAD R14 (1997)
    R2000 = "R2000"  # AutoCAD 2000
    R2004 = "R2004"  # AutoCAD 2004
    R2007 = "R2007"  # AutoCAD 2007
    R2010 = "R2010"  # AutoCAD 2010
    R2013 = "R2013"  # AutoCAD 2013
    R2018 = "R2018"  # AutoCAD 2018 (default)


class UnitSystem(str, Enum):
    """
    Measurement unit system

    测量单位系统
    """
    MILLIMETERS = "mm"  # Millimeters
    CENTIMETERS = "cm"  # Centimeters
    METERS = "m"  # Meters
    INCHES = "in"  # Inches
    FEET = "ft"  # Feet


class LayerType(str, Enum):
    """
    CAD layer type

    CAD图层类型
    """
    OUTLINE = "outline"  # Pattern outline
    INTERNAL = "internal"  # Internal lines
    GRAINLINE = "grainline"  # Grain line
    NOTCH = "notch"  # Notches/marks
    TEXT = "text"  # Text labels
    SEAM_ALLOWANCE = "seam_allowance"  # Seam allowance
    CUTTING = "cutting"  # Cutting lines
    REFERENCE = "reference"  # Reference lines


@dataclass
class CADLayer:
    """
    CAD file layer definition

    CAD文件图层定义

    Attributes:
        name: Layer name
        type: Layer type
        color: Layer color (0-255 for DXF color index, or hex code)
        line_weight: Line weight/thickness
        visible: Layer visibility
        locked: Layer lock status
    """
    name: str
    type: LayerType
    color: str = "7"  # Default white
    line_weight: float = 0.25  # mm
    visible: bool = True
    locked: bool = False

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization"""
        return {
            "name": self.name,
            "type": self.type.value,
            "color": self.color,
            "line_weight": self.line_weight,
            "visible": self.visible,
            "locked": self.locked,
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "CADLayer":
        """Create CADLayer from dictionary"""
        return cls(
            name=data["name"],
            type=LayerType(data["type"]),
            color=data.get("color", "7"),
            line_weight=data.get("line_weight", 0.25),
            visible=data.get("visible", True),
            locked=data.get("locked", False),
        )


@dataclass
class ExportOptions:
    """
    Export configuration options

    导出配置选项

    Attributes:
        format: Export format
        unit: Measurement unit
        scale: Scale factor (1.0 = 100%)
        include_seam_allowance: Include seam allowance in export
        include_grainline: Include grain line markers
        include_notches: Include notches/marks
        include_text_labels: Include text labels
        mirror_pieces: Mirror symmetric pieces
        dxf_version: DXF version (for DXF export)
        layers: Custom layer definitions
        precision: Decimal precision for coordinates
        compress: Compress output file
        metadata: Additional export metadata
    """
    format: ExportFormat
    unit: UnitSystem = UnitSystem.CENTIMETERS
    scale: float = 1.0
    include_seam_allowance: bool = True
    include_grainline: bool = True
    include_notches: bool = True
    include_text_labels: bool = True
    mirror_pieces: bool = False
    dxf_version: DXFVersion = DXFVersion.R2018
    layers: List[CADLayer] = field(default_factory=list)
    precision: int = 3
    compress: bool = False
    metadata: Dict[str, Any] = field(default_factory=dict)

    def __post_init__(self) -> None:
        """Validate export options"""
        if self.scale <= 0:
            raise ValueError("Scale must be positive")
        if self.precision < 0:
            raise ValueError("Precision must be non-negative")

        # Set default layers if not provided
        if not self.layers:
            self.layers = self._get_default_layers()

    def _get_default_layers(self) -> List[CADLayer]:
        """Get default layer configuration"""
        return [
            CADLayer("OUTLINE", LayerType.OUTLINE, "1", 0.35),  # Red, thick
            CADLayer("INTERNAL", LayerType.INTERNAL, "5", 0.18),  # Blue, thin
            CADLayer("GRAINLINE", LayerType.GRAINLINE, "3", 0.25),  # Green
            CADLayer("NOTCH", LayerType.NOTCH, "2", 0.25),  # Yellow
            CADLayer("TEXT", LayerType.TEXT, "7", 0.18),  # White/black
            CADLayer("SEAM_ALLOWANCE", LayerType.SEAM_ALLOWANCE, "8", 0.13),  # Gray, dashed
        ]

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization"""
        return {
            "format": self.format.value,
            "unit": self.unit.value,
            "scale": self.scale,
            "include_seam_allowance": self.include_seam_allowance,
            "include_grainline": self.include_grainline,
            "include_notches": self.include_notches,
            "include_text_labels": self.include_text_labels,
            "mirror_pieces": self.mirror_pieces,
            "dxf_version": self.dxf_version.value,
            "layers": [layer.to_dict() for layer in self.layers],
            "precision": self.precision,
            "compress": self.compress,
            "metadata": self.metadata,
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "ExportOptions":
        """Create ExportOptions from dictionary"""
        return cls(
            format=ExportFormat(data["format"]),
            unit=UnitSystem(data.get("unit", "cm")),
            scale=data.get("scale", 1.0),
            include_seam_allowance=data.get("include_seam_allowance", True),
            include_grainline=data.get("include_grainline", True),
            include_notches=data.get("include_notches", True),
            include_text_labels=data.get("include_text_labels", True),
            mirror_pieces=data.get("mirror_pieces", False),
            dxf_version=DXFVersion(data.get("dxf_version", "R2018")),
            layers=[CADLayer.from_dict(layer) for layer in data.get("layers", [])],
            precision=data.get("precision", 3),
            compress=data.get("compress", False),
            metadata=data.get("metadata", {}),
        )


@dataclass
class ExportMetadata:
    """
    Export file metadata

    导出文件元数据

    Attributes:
        pattern_id: Source pattern ID
        pattern_name: Pattern name
        export_format: Export format
        export_date: Export timestamp
        software_name: Software name ("Lanfinitas AI")
        software_version: Software version
        author: Author/creator name
        company: Company/organization name
        comments: Additional comments
        file_size_bytes: Output file size in bytes
        checksum: File checksum (MD5, SHA256, etc.)
        custom_fields: Custom metadata fields
    """
    pattern_id: str
    pattern_name: str
    export_format: ExportFormat
    export_date: str = field(default_factory=lambda: datetime.utcnow().isoformat())
    software_name: str = "Lanfinitas AI"
    software_version: str = "1.0.0"
    author: Optional[str] = None
    company: Optional[str] = None
    comments: Optional[str] = None
    file_size_bytes: Optional[int] = None
    checksum: Optional[str] = None
    custom_fields: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization"""
        return {
            "pattern_id": self.pattern_id,
            "pattern_name": self.pattern_name,
            "export_format": self.export_format.value,
            "export_date": self.export_date,
            "software_name": self.software_name,
            "software_version": self.software_version,
            "author": self.author,
            "company": self.company,
            "comments": self.comments,
            "file_size_bytes": self.file_size_bytes,
            "checksum": self.checksum,
            "custom_fields": self.custom_fields,
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "ExportMetadata":
        """Create ExportMetadata from dictionary"""
        return cls(
            pattern_id=data["pattern_id"],
            pattern_name=data["pattern_name"],
            export_format=ExportFormat(data["export_format"]),
            export_date=data.get("export_date", datetime.utcnow().isoformat()),
            software_name=data.get("software_name", "Lanfinitas AI"),
            software_version=data.get("software_version", "1.0.0"),
            author=data.get("author"),
            company=data.get("company"),
            comments=data.get("comments"),
            file_size_bytes=data.get("file_size_bytes"),
            checksum=data.get("checksum"),
            custom_fields=data.get("custom_fields", {}),
        )


@dataclass
class CADFile:
    """
    Complete CAD file representation

    完整的CAD文件表示

    Attributes:
        filepath: Output file path
        format: File format
        options: Export options
        metadata: Export metadata
        content: Optional file content (for in-memory representation)
        validated: Whether file has been validated
        validation_errors: List of validation errors
    """
    filepath: str
    format: ExportFormat
    options: ExportOptions
    metadata: ExportMetadata
    content: Optional[bytes] = None
    validated: bool = False
    validation_errors: List[str] = field(default_factory=list)

    @property
    def filename(self) -> str:
        """Extract filename from filepath"""
        import os
        return os.path.basename(self.filepath)

    @property
    def extension(self) -> str:
        """Get file extension"""
        import os
        return os.path.splitext(self.filepath)[1]

    @property
    def is_valid(self) -> bool:
        """Check if file is valid"""
        return self.validated and not self.validation_errors

    def validate(self) -> bool:
        """
        Validate CAD file

        Returns:
            True if valid, False otherwise
        """
        self.validation_errors = []

        # Check file extension matches format
        expected_ext = f".{self.format.value}"
        if not self.filepath.lower().endswith(expected_ext):
            self.validation_errors.append(
                f"File extension mismatch: expected '{expected_ext}' for format '{self.format.value}'"
            )

        # Check content exists if validated
        if self.content is None:
            self.validation_errors.append("File content is empty")

        # Check metadata
        if not self.metadata.pattern_id:
            self.validation_errors.append("Pattern ID is required in metadata")

        self.validated = True
        return self.is_valid

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization (without binary content)"""
        return {
            "filepath": self.filepath,
            "format": self.format.value,
            "options": self.options.to_dict(),
            "metadata": self.metadata.to_dict(),
            "validated": self.validated,
            "validation_errors": self.validation_errors,
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "CADFile":
        """Create CADFile from dictionary"""
        return cls(
            filepath=data["filepath"],
            format=ExportFormat(data["format"]),
            options=ExportOptions.from_dict(data["options"]),
            metadata=ExportMetadata.from_dict(data["metadata"]),
            validated=data.get("validated", False),
            validation_errors=data.get("validation_errors", []),
        )

    def to_json(self, filepath: str, indent: int = 2) -> None:
        """Save CAD file metadata to JSON"""
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(self.to_dict(), f, indent=indent, ensure_ascii=False)

    @classmethod
    def from_json(cls, filepath: str) -> "CADFile":
        """Load CAD file metadata from JSON"""
        with open(filepath, "r", encoding="utf-8") as f:
            data = json.load(f)
        return cls.from_dict(data)
