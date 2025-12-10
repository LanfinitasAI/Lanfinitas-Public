"""
Fabric Types - Fabric properties and physical parameters

面料类型模块 - 提供面料属性和物理参数相关的数据结构
"""

from dataclasses import dataclass, field, asdict
from typing import Dict, Optional, Any
from enum import Enum
import json


class FabricType(str, Enum):
    """
    Fabric material type

    面料材质类型
    """
    COTTON = "cotton"  # 棉
    SILK = "silk"  # 丝绸
    WOOL = "wool"  # 羊毛
    LINEN = "linen"  # 亚麻
    POLYESTER = "polyester"  # 涤纶
    NYLON = "nylon"  # 尼龙
    SPANDEX = "spandex"  # 氨纶
    RAYON = "rayon"  # 人造丝
    ACRYLIC = "acrylic"  # 腈纶
    BLENDED = "blended"  # 混纺
    KNIT = "knit"  # 针织
    WOVEN = "woven"  # 梭织


class FabricWeight(str, Enum):
    """
    Fabric weight category

    面料重量级别
    """
    ULTRA_LIGHT = "ultra_light"  # < 100 g/m²
    LIGHT = "light"  # 100-200 g/m²
    MEDIUM = "medium"  # 200-340 g/m²
    HEAVY = "heavy"  # 340-450 g/m²
    ULTRA_HEAVY = "ultra_heavy"  # > 450 g/m²


class FabricStretch(str, Enum):
    """
    Fabric stretch type

    面料弹性类型
    """
    NO_STRETCH = "no_stretch"  # Non-elastic (0-2% stretch)
    SLIGHT_STRETCH = "slight_stretch"  # Slight stretch (2-15%)
    MODERATE_STRETCH = "moderate_stretch"  # Moderate stretch (15-30%)
    SUPER_STRETCH = "super_stretch"  # Super stretch (>30%)
    FOUR_WAY = "four_way"  # Four-way stretch


class WeavingPattern(str, Enum):
    """
    Fabric weaving pattern

    编织图案类型
    """
    PLAIN = "plain"  # Plain weave
    TWILL = "twill"  # Twill weave
    SATIN = "satin"  # Satin weave
    JACQUARD = "jacquard"  # Jacquard
    DOBBY = "dobby"  # Dobby
    LENO = "leno"  # Leno weave
    BASKET = "basket"  # Basket weave


@dataclass
class PhysicalParams:
    """
    Physical parameters for fabric simulation

    面料物理模拟参数

    Attributes:
        density: Fabric density in g/m²
        thickness: Fabric thickness in mm
        tensile_strength_warp: Tensile strength in warp direction (N/cm)
        tensile_strength_weft: Tensile strength in weft direction (N/cm)
        elongation_warp: Elongation at break in warp direction (%)
        elongation_weft: Elongation at break in weft direction (%)
        bending_rigidity: Bending rigidity (mN·cm)
        shear_rigidity: Shear rigidity (N/m)
        friction_coefficient: Surface friction coefficient (0-1)
        air_permeability: Air permeability (mm/s)
        moisture_regain: Moisture regain rate (%)
    """
    density: float  # g/m²
    thickness: float  # mm
    tensile_strength_warp: float  # N/cm
    tensile_strength_weft: float  # N/cm
    elongation_warp: float  # %
    elongation_weft: float  # %
    bending_rigidity: float  # mN·cm
    shear_rigidity: float  # N/m
    friction_coefficient: float  # 0-1
    air_permeability: float  # mm/s
    moisture_regain: float  # %

    def __post_init__(self) -> None:
        """Validate physical parameters"""
        if self.density <= 0:
            raise ValueError("Density must be positive")
        if self.thickness <= 0:
            raise ValueError("Thickness must be positive")
        if not 0 <= self.friction_coefficient <= 1:
            raise ValueError("Friction coefficient must be between 0 and 1")
        if self.elongation_warp < 0 or self.elongation_weft < 0:
            raise ValueError("Elongation must be non-negative")

    def to_dict(self) -> Dict[str, float]:
        """Convert to dictionary for JSON serialization"""
        return asdict(self)

    @classmethod
    def from_dict(cls, data: Dict[str, float]) -> "PhysicalParams":
        """Create PhysicalParams from dictionary"""
        return cls(**data)

    @classmethod
    def default_cotton(cls) -> "PhysicalParams":
        """Default parameters for cotton fabric"""
        return cls(
            density=150.0,
            thickness=0.5,
            tensile_strength_warp=60.0,
            tensile_strength_weft=50.0,
            elongation_warp=10.0,
            elongation_weft=12.0,
            bending_rigidity=0.05,
            shear_rigidity=0.02,
            friction_coefficient=0.3,
            air_permeability=100.0,
            moisture_regain=8.5,
        )

    @classmethod
    def default_silk(cls) -> "PhysicalParams":
        """Default parameters for silk fabric"""
        return cls(
            density=80.0,
            thickness=0.3,
            tensile_strength_warp=40.0,
            tensile_strength_weft=35.0,
            elongation_warp=20.0,
            elongation_weft=22.0,
            bending_rigidity=0.01,
            shear_rigidity=0.01,
            friction_coefficient=0.2,
            air_permeability=150.0,
            moisture_regain=11.0,
        )

    @classmethod
    def default_polyester(cls) -> "PhysicalParams":
        """Default parameters for polyester fabric"""
        return cls(
            density=120.0,
            thickness=0.4,
            tensile_strength_warp=80.0,
            tensile_strength_weft=70.0,
            elongation_warp=25.0,
            elongation_weft=28.0,
            bending_rigidity=0.03,
            shear_rigidity=0.015,
            friction_coefficient=0.25,
            air_permeability=80.0,
            moisture_regain=0.4,
        )

    @classmethod
    def default_wool(cls) -> "PhysicalParams":
        """Default parameters for wool fabric"""
        return cls(
            density=250.0,
            thickness=0.8,
            tensile_strength_warp=45.0,
            tensile_strength_weft=40.0,
            elongation_warp=30.0,
            elongation_weft=35.0,
            bending_rigidity=0.08,
            shear_rigidity=0.025,
            friction_coefficient=0.4,
            air_permeability=50.0,
            moisture_regain=16.0,
        )


@dataclass
class FabricProperties:
    """
    Complete fabric properties

    完整的面料属性

    Attributes:
        id: Unique fabric identifier
        name: Fabric name
        type: Fabric material type
        weight_category: Fabric weight category
        stretch_type: Fabric stretch type
        weaving_pattern: Weaving pattern
        width: Fabric width in cm (standard: 110, 140, 150)
        color: Fabric color hex code
        pattern_description: Pattern/print description
        physical_params: Physical simulation parameters
        care_instructions: Care and washing instructions
        sustainability_score: Environmental sustainability score (0-100)
        cost_per_meter: Cost per meter in USD
        metadata: Additional fabric metadata
    """
    id: str
    name: str
    type: FabricType
    weight_category: FabricWeight
    stretch_type: FabricStretch
    weaving_pattern: WeavingPattern
    width: float  # cm
    color: str = "#FFFFFF"
    pattern_description: str = "solid"
    physical_params: Optional[PhysicalParams] = None
    care_instructions: str = "Machine wash cold, tumble dry low"
    sustainability_score: int = 50
    cost_per_meter: float = 10.0
    metadata: Dict[str, Any] = field(default_factory=dict)

    def __post_init__(self) -> None:
        """Validate fabric properties"""
        if self.width <= 0:
            raise ValueError("Fabric width must be positive")
        if not 0 <= self.sustainability_score <= 100:
            raise ValueError("Sustainability score must be between 0 and 100")
        if self.cost_per_meter < 0:
            raise ValueError("Cost per meter must be non-negative")

        # Set default physical params based on fabric type if not provided
        if self.physical_params is None:
            if self.type == FabricType.COTTON:
                self.physical_params = PhysicalParams.default_cotton()
            elif self.type == FabricType.SILK:
                self.physical_params = PhysicalParams.default_silk()
            elif self.type == FabricType.POLYESTER:
                self.physical_params = PhysicalParams.default_polyester()
            elif self.type == FabricType.WOOL:
                self.physical_params = PhysicalParams.default_wool()
            else:
                # Default to cotton-like properties
                self.physical_params = PhysicalParams.default_cotton()

    @property
    def is_elastic(self) -> bool:
        """Check if fabric has stretch"""
        return self.stretch_type != FabricStretch.NO_STRETCH

    @property
    def is_heavyweight(self) -> bool:
        """Check if fabric is heavyweight"""
        return self.weight_category in [FabricWeight.HEAVY, FabricWeight.ULTRA_HEAVY]

    @property
    def is_sustainable(self) -> bool:
        """Check if fabric meets sustainability threshold (score >= 70)"""
        return self.sustainability_score >= 70

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization"""
        return {
            "id": self.id,
            "name": self.name,
            "type": self.type.value,
            "weight_category": self.weight_category.value,
            "stretch_type": self.stretch_type.value,
            "weaving_pattern": self.weaving_pattern.value,
            "width": self.width,
            "color": self.color,
            "pattern_description": self.pattern_description,
            "physical_params": self.physical_params.to_dict() if self.physical_params else None,
            "care_instructions": self.care_instructions,
            "sustainability_score": self.sustainability_score,
            "cost_per_meter": self.cost_per_meter,
            "metadata": self.metadata,
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "FabricProperties":
        """Create FabricProperties from dictionary"""
        return cls(
            id=data["id"],
            name=data["name"],
            type=FabricType(data["type"]),
            weight_category=FabricWeight(data["weight_category"]),
            stretch_type=FabricStretch(data["stretch_type"]),
            weaving_pattern=WeavingPattern(data["weaving_pattern"]),
            width=data["width"],
            color=data.get("color", "#FFFFFF"),
            pattern_description=data.get("pattern_description", "solid"),
            physical_params=PhysicalParams.from_dict(data["physical_params"])
            if data.get("physical_params")
            else None,
            care_instructions=data.get("care_instructions", "Machine wash cold, tumble dry low"),
            sustainability_score=data.get("sustainability_score", 50),
            cost_per_meter=data.get("cost_per_meter", 10.0),
            metadata=data.get("metadata", {}),
        )

    def to_json(self, filepath: str, indent: int = 2) -> None:
        """Save fabric properties to JSON file"""
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(self.to_dict(), f, indent=indent, ensure_ascii=False)

    @classmethod
    def from_json(cls, filepath: str) -> "FabricProperties":
        """Load fabric properties from JSON file"""
        with open(filepath, "r", encoding="utf-8") as f:
            data = json.load(f)
        return cls.from_dict(data)


@dataclass
class FabricUsage:
    """
    Fabric usage for pattern cutting

    纸样裁剪面料使用信息

    Attributes:
        fabric_id: Reference to fabric properties
        quantity_meters: Required fabric length in meters
        utilization_rate: Fabric utilization rate (0-1), 1=100% used
        waste_percentage: Waste percentage
        cutting_layout_id: Optional reference to cutting layout
        estimated_cost: Estimated cost for this fabric usage
    """
    fabric_id: str
    quantity_meters: float
    utilization_rate: float
    waste_percentage: float
    cutting_layout_id: Optional[str] = None
    estimated_cost: float = 0.0

    def __post_init__(self) -> None:
        """Validate fabric usage"""
        if self.quantity_meters < 0:
            raise ValueError("Quantity must be non-negative")
        if not 0 <= self.utilization_rate <= 1:
            raise ValueError("Utilization rate must be between 0 and 1")
        if self.waste_percentage < 0:
            raise ValueError("Waste percentage must be non-negative")

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization"""
        return asdict(self)

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "FabricUsage":
        """Create FabricUsage from dictionary"""
        return cls(**data)
