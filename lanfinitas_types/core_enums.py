"""
Core enumeration types for Lanfinitas AI platform.

This module defines all core enums used across the platform,
including garment styles, measurement units, CAD formats, and more.
"""

from enum import Enum


class GarmentStyle(str, Enum):
    """Supported garment styles."""

    # Tops
    BASIC_TEE = "basic_tee"
    POLO_SHIRT = "polo_shirt"
    BLOUSE = "blouse"
    SHIRT = "shirt"
    TANK_TOP = "tank_top"
    HOODIE = "hoodie"
    SWEATER = "sweater"

    # Bottoms
    PANTS = "pants"
    JEANS = "jeans"
    SHORTS = "shorts"
    SKIRT = "skirt"
    LEGGINGS = "leggings"

    # Dresses & Jumpsuits
    DRESS = "dress"
    JUMPSUIT = "jumpsuit"
    ROMPER = "romper"

    # Outerwear
    JACKET = "jacket"
    COAT = "coat"
    BLAZER = "blazer"
    VEST = "vest"

    # Activewear
    SPORTS_BRA = "sports_bra"
    YOGA_PANTS = "yoga_pants"
    TRACK_JACKET = "track_jacket"

    # Custom
    CUSTOM = "custom"


class MeasurementUnit(str, Enum):
    """Measurement units."""

    CENTIMETERS = "cm"
    INCHES = "in"
    MILLIMETERS = "mm"
    METERS = "m"


class CADFormat(str, Enum):
    """Supported CAD file formats."""

    DXF = "dxf"  # AutoCAD DXF
    PLT = "plt"  # HPGL plotter format
    DWG = "dwg"  # AutoCAD native format
    PDF = "pdf"  # Portable Document Format
    SVG = "svg"  # Scalable Vector Graphics
    AI = "ai"   # Adobe Illustrator

    # Industry-specific formats
    GERBER = "gerber"  # Gerber Technology
    LECTRA = "lectra"  # Lectra Systems
    OPTITEX = "optitex"  # Optitex
    CLO3D = "clo3d"  # CLO 3D
    BROWZWEAR = "browzwear"  # Browzwear


class FabricType(str, Enum):
    """Common fabric types."""

    # Natural fibers
    COTTON = "cotton"
    LINEN = "linen"
    SILK = "silk"
    WOOL = "wool"
    CASHMERE = "cashmere"

    # Synthetic fibers
    POLYESTER = "polyester"
    NYLON = "nylon"
    SPANDEX = "spandex"
    ACRYLIC = "acrylic"
    RAYON = "rayon"

    # Blends
    COTTON_POLYESTER = "cotton_polyester"
    COTTON_SPANDEX = "cotton_spandex"
    WOOL_POLYESTER = "wool_polyester"

    # Technical fabrics
    DENIM = "denim"
    JERSEY = "jersey"
    FLEECE = "fleece"
    CANVAS = "canvas"
    MESH = "mesh"
    LEATHER = "leather"
    SUEDE = "suede"

    # Sustainable
    ORGANIC_COTTON = "organic_cotton"
    RECYCLED_POLYESTER = "recycled_polyester"
    TENCEL = "tencel"
    BAMBOO = "bamboo"

    # Custom
    CUSTOM = "custom"


class Gender(str, Enum):
    """Gender categories for sizing."""

    MALE = "male"
    FEMALE = "female"
    UNISEX = "unisex"
    KIDS_BOYS = "kids_boys"
    KIDS_GIRLS = "kids_girls"


class SizeCategory(str, Enum):
    """Size categories."""

    # Standard sizes
    XXS = "xxs"
    XS = "xs"
    S = "s"
    M = "m"
    L = "l"
    XL = "xl"
    XXL = "xxl"
    XXXL = "xxxl"

    # Plus sizes
    PLUS_1X = "1x"
    PLUS_2X = "2x"
    PLUS_3X = "3x"
    PLUS_4X = "4x"
    PLUS_5X = "5x"

    # Numeric sizes (US)
    SIZE_0 = "0"
    SIZE_2 = "2"
    SIZE_4 = "4"
    SIZE_6 = "6"
    SIZE_8 = "8"
    SIZE_10 = "10"
    SIZE_12 = "12"
    SIZE_14 = "14"
    SIZE_16 = "16"
    SIZE_18 = "18"
    SIZE_20 = "20"

    # Custom/Made-to-measure
    CUSTOM = "custom"


class PatternPieceType(str, Enum):
    """Types of pattern pieces."""

    # Body pieces
    FRONT = "front"
    BACK = "back"
    FRONT_LEFT = "front_left"
    FRONT_RIGHT = "front_right"
    BACK_LEFT = "back_left"
    BACK_RIGHT = "back_right"

    # Sleeves
    SLEEVE = "sleeve"
    SLEEVE_LEFT = "sleeve_left"
    SLEEVE_RIGHT = "sleeve_right"

    # Collars & Necklines
    COLLAR = "collar"
    COLLAR_STAND = "collar_stand"
    FACING = "facing"
    NECKBAND = "neckband"

    # Pockets
    POCKET = "pocket"
    POCKET_BAG = "pocket_bag"
    POCKET_FLAP = "pocket_flap"

    # Waistbands & Cuffs
    WAISTBAND = "waistband"
    CUFF = "cuff"

    # Linings & Interfacings
    LINING = "lining"
    INTERFACING = "interfacing"

    # Other
    YOKE = "yoke"
    GUSSET = "gusset"
    PLACKET = "placket"
    HOOD = "hood"

    # Custom
    CUSTOM = "custom"


class SeamType(str, Enum):
    """Types of seams."""

    PLAIN = "plain"  # Plain/basic seam
    FRENCH = "french"  # French seam
    FLAT_FELLED = "flat_felled"  # Flat-felled seam
    OVERLOCKED = "overlocked"  # Overlock/serged seam
    TOPSTITCHED = "topstitched"  # Topstitched seam
    BLIND = "blind"  # Blind hem
    DOUBLE_STITCHED = "double_stitched"  # Double-stitched
    ZIGZAG = "zigzag"  # Zigzag stitch

    # Custom
    CUSTOM = "custom"


class DartType(str, Enum):
    """Types of darts."""

    SINGLE_POINT = "single_point"  # Single-pointed dart
    DOUBLE_POINT = "double_point"  # Double-pointed dart (fish dart)
    FRENCH = "french"  # French dart
    CONTOUR = "contour"  # Contour dart

    # Dart locations
    BUST = "bust"
    WAIST = "waist"
    SHOULDER = "shoulder"
    ELBOW = "elbow"

    # Custom
    CUSTOM = "custom"


class LayoutStrategy(str, Enum):
    """Layout optimization strategies."""

    GREEDY = "greedy"  # Fast greedy placement
    GENETIC_ALGORITHM = "genetic_algorithm"  # GA optimization
    SIMULATED_ANNEALING = "simulated_annealing"  # SA optimization
    REINFORCEMENT_LEARNING = "reinforcement_learning"  # RL-based
    HYBRID = "hybrid"  # Hybrid approach

    # Custom
    CUSTOM = "custom"


class OptimizationObjective(str, Enum):
    """Optimization objectives for layout."""

    MINIMIZE_WASTE = "minimize_waste"  # Minimize fabric waste
    MAXIMIZE_UTILIZATION = "maximize_utilization"  # Maximize utilization
    MINIMIZE_COST = "minimize_cost"  # Minimize total cost
    BALANCE = "balance"  # Balance multiple objectives

    # Custom
    CUSTOM = "custom"


class TaskStatus(str, Enum):
    """Status of async tasks."""

    PENDING = "pending"
    QUEUED = "queued"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"
    TIMEOUT = "timeout"


class ErrorSeverity(str, Enum):
    """Error severity levels."""

    DEBUG = "debug"
    INFO = "info"
    WARNING = "warning"
    ERROR = "error"
    CRITICAL = "critical"


class MaterialSustainability(str, Enum):
    """Material sustainability ratings."""

    A_PLUS = "a_plus"  # Highly sustainable (organic, recycled)
    A = "a"  # Sustainable (certified, eco-friendly)
    B = "b"  # Moderately sustainable
    C = "c"  # Standard materials
    D = "d"  # Low sustainability
    E = "e"  # Not sustainable

    UNKNOWN = "unknown"
