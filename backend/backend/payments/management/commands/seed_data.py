from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone
from decimal import Decimal
from products.models import Category, Product
from customers.models import Customer
from inventory.models import Supplier
from payments.models import PaymentAccount, ExpenseCategory, Expense
from notifications.models import NotificationChannel
from users.models import User

PRODUCTS_DATA = [
    {
        "category": "Processors",
        "subcategory": "Intel Core",
        "products": [
            {"name": "Intel Core i3-14100F", "brand": "Intel", "variant": "14th Gen", "pack_size": "1", "model_number": "BX8071514100F", "cost_price": 8500, "retail_price": 11500, "wholesale_price": 10500, "stock": 15, "tax_rate": 16, "description": "4-core, 8-thread LGA1700 processor"},
            {"name": "Intel Core i5-14600K", "brand": "Intel", "variant": "14th Gen", "pack_size": "1", "model_number": "BX8071514600K", "cost_price": 18500, "retail_price": 24500, "wholesale_price": 22500, "stock": 10, "tax_rate": 16, "description": "14-core, 20-thread LGA1700 desktop processor"},
            {"name": "Intel Core i7-14700K", "brand": "Intel", "variant": "14th Gen", "pack_size": "1", "model_number": "BX8071514700K", "cost_price": 32000, "retail_price": 42000, "wholesale_price": 39000, "stock": 8, "tax_rate": 16, "description": "20-core, 28-thread LGA1700 processor"},
            {"name": "Intel Core i9-14900K", "brand": "Intel", "variant": "14th Gen", "pack_size": "1", "model_number": "BX8071514900K", "cost_price": 48000, "retail_price": 62000, "wholesale_price": 58000, "stock": 5, "tax_rate": 16, "description": "24-core, 32-thread flagship desktop processor"},
        ],
    },
    {
        "category": "Processors",
        "subcategory": "AMD Ryzen",
        "products": [
            {"name": "AMD Ryzen 5 7600", "brand": "AMD", "variant": "7000 Series", "pack_size": "1", "model_number": "100-100001015BOX", "cost_price": 16000, "retail_price": 21000, "wholesale_price": 19500, "stock": 12, "tax_rate": 16, "description": "6-core, 12-thread AM5 processor"},
            {"name": "AMD Ryzen 7 7800X3D", "brand": "AMD", "variant": "7000 Series", "pack_size": "1", "model_number": "100-100001910WOF", "cost_price": 35000, "retail_price": 45000, "wholesale_price": 42000, "stock": 7, "tax_rate": 16, "description": "8-core 3D V-Cache gaming processor"},
            {"name": "AMD Ryzen 9 7950X", "brand": "AMD", "variant": "7000 Series", "pack_size": "1", "model_number": "100-100000514WOF", "cost_price": 42000, "retail_price": 55000, "wholesale_price": 51000, "stock": 4, "tax_rate": 16, "description": "16-core, 32-thread flagship AM5 processor"},
        ],
    },
    {
        "category": "Memory",
        "subcategory": "DDR5 RAM",
        "products": [
            {"name": "Corsair Vengeance 16GB DDR5-5600MHz", "brand": "Corsair", "variant": "Vengeance", "pack_size": "2x8GB Kit", "model_number": "CMK16GX5M2B5600C36", "cost_price": 4500, "retail_price": 6500, "wholesale_price": 5800, "stock": 25, "tax_rate": 16, "description": "DDR5 5600MHz CL36 memory kit"},
            {"name": "G.Skill Trident Z5 32GB DDR5-6000MHz", "brand": "G.Skill", "variant": "Trident Z5 RGB", "pack_size": "2x16GB Kit", "model_number": "F5-6000J3636F16GX2-TZ5RK", "cost_price": 9500, "retail_price": 13000, "wholesale_price": 12000, "stock": 18, "tax_rate": 16, "description": "DDR5 6000MHz CL36 RGB memory kit"},
            {"name": "Kingston Fury Beast 64GB DDR5-5200MHz", "brand": "Kingston", "variant": "Fury Beast", "pack_size": "2x32GB Kit", "model_number": "KF552C40BBK2-64", "cost_price": 16000, "retail_price": 21500, "wholesale_price": 20000, "stock": 10, "tax_rate": 16, "description": "DDR5 5200MHz CL40 memory kit"},
        ],
    },
    {
        "category": "Memory",
        "subcategory": "DDR4 RAM",
        "products": [
            {"name": "Kingston Fury Beast 8GB DDR4-3200MHz", "brand": "Kingston", "variant": "Fury Beast", "pack_size": "1x8GB", "model_number": "KF432C16BB/8", "cost_price": 1500, "retail_price": 2500, "wholesale_price": 2200, "stock": 40, "tax_rate": 16, "description": "DDR4 3200MHz CL16 memory module"},
            {"name": "Corsair Vengeance LPX 16GB DDR4-3200MHz", "brand": "Corsair", "variant": "Vengeance LPX", "pack_size": "2x8GB Kit", "model_number": "CMK16GX4M2B3200C16", "cost_price": 3200, "retail_price": 4800, "wholesale_price": 4300, "stock": 30, "tax_rate": 16, "description": "DDR4 3200MHz CL16 memory kit"},
            {"name": "G.Skill Ripjaws V 32GB DDR4-3600MHz", "brand": "G.Skill", "variant": "Ripjaws V", "pack_size": "2x16GB Kit", "model_number": "F4-3600C16D-32GVKC", "cost_price": 6500, "retail_price": 9000, "wholesale_price": 8200, "stock": 15, "tax_rate": 16, "description": "DDR4 3600MHz CL16 memory kit"},
        ],
    },
    {
        "category": "Storage",
        "subcategory": "NVMe SSD",
        "products": [
            {"name": "Samsung 990 Pro 1TB NVMe SSD", "brand": "Samsung", "variant": "990 Pro", "pack_size": "1TB", "model_number": "MZ-V9P1T0BW", "cost_price": 9500, "retail_price": 13500, "wholesale_price": 12500, "stock": 20, "tax_rate": 16, "description": "PCIe 4.0 NVMe M.2 SSD, 7450MB/s read"},
            {"name": "WD Black SN850X 2TB NVMe SSD", "brand": "Western Digital", "variant": "Black SN850X", "pack_size": "2TB", "model_number": "WDS200T2X0E", "cost_price": 18000, "retail_price": 24000, "wholesale_price": 22500, "stock": 12, "tax_rate": 16, "description": "PCIe 4.0 NVMe M.2 SSD with heatsink"},
            {"name": "Crucial P3 Plus 500GB NVMe SSD", "brand": "Crucial", "variant": "P3 Plus", "pack_size": "500GB", "model_number": "CT500P3PSSD8", "cost_price": 3500, "retail_price": 5200, "wholesale_price": 4700, "stock": 35, "tax_rate": 16, "description": "PCIe 4.0 NVMe M.2 SSD, 5000MB/s read"},
        ],
    },
    {
        "category": "Storage",
        "subcategory": "SATA SSD",
        "products": [
            {"name": "Samsung 870 EVO 500GB SATA SSD", "brand": "Samsung", "variant": "870 EVO", "pack_size": "500GB", "model_number": "MZ-77E500B/EU", "cost_price": 4200, "retail_price": 6000, "wholesale_price": 5500, "stock": 25, "tax_rate": 16, "description": "2.5-inch SATA III SSD"},
            {"name": "Crucial MX500 1TB SATA SSD", "brand": "Crucial", "variant": "MX500", "pack_size": "1TB", "model_number": "CT1000MX500SSD1", "cost_price": 7500, "retail_price": 10500, "wholesale_price": 9600, "stock": 18, "tax_rate": 16, "description": "2.5-inch SATA III SSD with 3D NAND"},
        ],
    },
    {
        "category": "Storage",
        "subcategory": "HDD",
        "products": [
            {"name": "Seagate BarraCuda 2TB HDD", "brand": "Seagate", "variant": "BarraCuda", "pack_size": "2TB", "model_number": "ST2000DM008", "cost_price": 3800, "retail_price": 5500, "wholesale_price": 5000, "stock": 22, "tax_rate": 16, "description": "3.5-inch 7200RPM SATA III hard drive"},
            {"name": "WD Blue 4TB HDD", "brand": "Western Digital", "variant": "Blue", "pack_size": "4TB", "model_number": "WD40EZAZ", "cost_price": 6500, "retail_price": 9000, "wholesale_price": 8300, "stock": 15, "tax_rate": 16, "description": "3.5-inch 5400RPM SATA III hard drive"},
        ],
    },
    {
        "category": "Graphics Cards",
        "subcategory": "NVIDIA GeForce",
        "products": [
            {"name": "NVIDIA GeForce RTX 4060 8GB", "brand": "NVIDIA", "variant": "RTX 4060", "pack_size": "1", "model_number": "RTX 4060 8GB", "cost_price": 28000, "retail_price": 38000, "wholesale_price": 35500, "stock": 8, "tax_rate": 16, "description": "Ada Lovelace architecture, 8GB GDDR6X"},
            {"name": "NVIDIA GeForce RTX 4070 Super 12GB", "brand": "NVIDIA", "variant": "RTX 4070 Super", "pack_size": "1", "model_number": "RTX 4070 SUPER 12GB", "cost_price": 45000, "retail_price": 60000, "wholesale_price": 56500, "stock": 5, "tax_rate": 16, "description": "Ada Lovelace architecture, 12GB GDDR6X"},
            {"name": "NVIDIA GeForce RTX 4080 Super 16GB", "brand": "NVIDIA", "variant": "RTX 4080 Super", "pack_size": "1", "model_number": "RTX 4080 SUPER 16GB", "cost_price": 75000, "retail_price": 98000, "wholesale_price": 92000, "stock": 3, "tax_rate": 16, "description": "Ada Lovelace architecture, 16GB GDDR6X"},
        ],
    },
    {
        "category": "Graphics Cards",
        "subcategory": "AMD Radeon",
        "products": [
            {"name": "AMD Radeon RX 7600 8GB", "brand": "AMD", "variant": "RX 7600", "pack_size": "1", "model_number": "RX 7600 8GB", "cost_price": 23000, "retail_price": 31000, "wholesale_price": 29000, "stock": 6, "tax_rate": 16, "description": "RDNA 3 architecture, 8GB GDDR6"},
            {"name": "AMD Radeon RX 7800 XT 16GB", "brand": "AMD", "variant": "RX 7800 XT", "pack_size": "1", "model_number": "RX 7800 XT 16GB", "cost_price": 40000, "retail_price": 53000, "wholesale_price": 50000, "stock": 4, "tax_rate": 16, "description": "RDNA 3 architecture, 16GB GDDR6"},
        ],
    },
    {
        "category": "Motherboards",
        "subcategory": "Intel Sockets",
        "products": [
            {"name": "MSI PRO Z790-A MAX WiFi", "brand": "MSI", "variant": "Z790", "pack_size": "1", "model_number": "PRO Z790-A MAX WIFI", "cost_price": 18000, "retail_price": 25000, "wholesale_price": 23200, "stock": 8, "tax_rate": 16, "description": "ATX LGA1700 DDR5 motherboard with WiFi 7"},
            {"name": "ASUS TUF Gaming B760-PLUS WiFi", "brand": "ASUS", "variant": "B760", "pack_size": "1", "model_number": "TUF GAMING B760-PLUS WIFI", "cost_price": 14000, "retail_price": 19500, "wholesale_price": 18000, "stock": 10, "tax_rate": 16, "description": "ATX LGA1700 motherboard with DDR5"},
        ],
    },
    {
        "category": "Motherboards",
        "subcategory": "AMD Sockets",
        "products": [
            {"name": "ASUS ROG STRIX X670E-E Gaming", "brand": "ASUS", "variant": "X670E", "pack_size": "1", "model_number": "ROG STRIX X670E-E", "cost_price": 35000, "retail_price": 46000, "wholesale_price": 43000, "stock": 4, "tax_rate": 16, "description": "ATX AM5 motherboard with PCIe 5.0"},
            {"name": "Gigabyte B650M AORUS Elite AX", "brand": "Gigabyte", "variant": "B650M", "pack_size": "1", "model_number": "B650M AORUS ELITE AX", "cost_price": 12000, "retail_price": 17000, "wholesale_price": 15800, "stock": 12, "tax_rate": 16, "description": "mATX AM5 motherboard with WiFi 6E"},
        ],
    },
    {
        "category": "Power Supplies",
        "subcategory": "PSU",
        "products": [
            {"name": "Corsair RM750x 750W 80+ Gold", "brand": "Corsair", "variant": "RM750x", "pack_size": "1", "model_number": "CP-9020199-UK", "cost_price": 8500, "retail_price": 12000, "wholesale_price": 11000, "stock": 15, "tax_rate": 16, "description": "Fully modular ATX power supply"},
            {"name": "EVGA SuperNOVA 850 G7 80+ Gold", "brand": "EVGA", "variant": "850 G7", "pack_size": "1", "model_number": "220-G7-0850-X1", "cost_price": 11000, "retail_price": 15500, "wholesale_price": 14300, "stock": 10, "tax_rate": 16, "description": "Fully modular ATX power supply"},
            {"name": "Seasonic Focus GX-1000 80+ Gold", "brand": "Seasonic", "variant": "Focus GX-1000", "pack_size": "1", "model_number": "FOCUS-GX-1000", "cost_price": 14500, "retail_price": 20000, "wholesale_price": 18500, "stock": 7, "tax_rate": 16, "description": "Fully modular 1000W ATX power supply"},
        ],
    },
    {
        "category": "Cooling",
        "subcategory": "CPU Coolers",
        "products": [
            {"name": "Noctua NH-D15 Chromax Black", "brand": "Noctua", "variant": "NH-D15", "pack_size": "1", "model_number": "NH-D15 chromax.black", "cost_price": 7000, "retail_price": 10000, "wholesale_price": 9200, "stock": 8, "tax_rate": 16, "description": "Dual-tower CPU air cooler with NF-A15 fans"},
            {"name": "Corsair H150i Elite Capellix XT 360mm", "brand": "Corsair", "variant": "H150i Elite", "pack_size": "360mm AIO", "model_number": "CW-9060061-WW", "cost_price": 12000, "retail_price": 16500, "wholesale_price": 15200, "stock": 6, "tax_rate": 16, "description": "360mm all-in-one liquid CPU cooler with RGB"},
            {"name": "Cooler Master Hyper 212 Halo", "brand": "Cooler Master", "variant": "Hyper 212", "pack_size": "1", "model_number": "RR-S4KK-21PA-R2", "cost_price": 2800, "retail_price": 4200, "wholesale_price": 3800, "stock": 20, "tax_rate": 16, "description": "Single-tower air cooler with ARGB fan"},
        ],
    },
    {
        "category": "Monitors",
        "subcategory": "Gaming Monitors",
        "products": [
            {"name": "LG 27GP850-B 27' 165Hz IPS", "brand": "LG", "variant": "UltraGear", "pack_size": "27-Inch", "model_number": "27GP850-B", "cost_price": 25000, "retail_price": 35000, "wholesale_price": 32500, "stock": 7, "tax_rate": 16, "description": "QHD 2560x1440 IPS 165Hz gaming monitor"},
            {"name": "Samsung Odyssey G7 32' 240Hz VA", "brand": "Samsung", "variant": "Odyssey G7", "pack_size": "32-Inch", "model_number": "LC32G75TQSNXZA", "cost_price": 35000, "retail_price": 48000, "wholesale_price": 45000, "stock": 5, "tax_rate": 16, "description": "WQHD 2560x1440 240Hz curved gaming monitor"},
        ],
    },
    {
        "category": "Monitors",
        "subcategory": "Office Monitors",
        "products": [
            {"name": "Dell 27' S2721QS 4K IPS", "brand": "Dell", "variant": "S2721QS", "pack_size": "27-Inch", "model_number": "S2721QS", "cost_price": 22000, "retail_price": 31000, "wholesale_price": 28800, "stock": 9, "tax_rate": 16, "description": "4K UHD 3840x2160 IPS office monitor"},
            {"name": "HP 24mh 24' IPS 1080p", "brand": "HP", "variant": "24mh", "pack_size": "24-Inch", "model_number": "24MH", "cost_price": 10000, "retail_price": 14500, "wholesale_price": 13500, "stock": 14, "tax_rate": 16, "description": "Full HD 1920x1080 IPS monitor with speakers"},
        ],
    },
    {
        "category": "Peripherals",
        "subcategory": "Keyboards",
        "products": [
            {"name": "Logitech G Pro X Mechanical", "brand": "Logitech", "variant": "G Pro X", "pack_size": "1", "model_number": "920-009394", "cost_price": 8500, "retail_price": 12000, "wholesale_price": 11000, "stock": 10, "tax_rate": 16, "description": "Tenkeyless mechanical gaming keyboard with GX switches"},
            {"name": "Keychron Q1 QMK Custom", "brand": "Keychron", "variant": "Q1", "pack_size": "75%", "model_number": "Q1-K3", "cost_price": 10000, "retail_price": 14500, "wholesale_price": 13200, "stock": 6, "tax_rate": 16, "description": "75% wired custom mechanical keyboard with aluminum frame"},
        ],
    },
    {
        "category": "Peripherals",
        "subcategory": "Mice",
        "products": [
            {"name": "Logitech G502 X Plus Wireless", "brand": "Logitech", "variant": "G502 X Plus", "pack_size": "1", "model_number": "910-006184", "cost_price": 8500, "retail_price": 12000, "wholesale_price": 11000, "stock": 12, "tax_rate": 16, "description": "Wireless gaming mouse with LIGHTFORCE switches and RGB"},
            {"name": "Razer DeathAdder V3 Pro", "brand": "Razer", "variant": "DeathAdder V3 Pro", "pack_size": "1", "model_number": "RZ01-04630100-R3M1", "cost_price": 9500, "retail_price": 13500, "wholesale_price": 12500, "stock": 8, "tax_rate": 16, "description": "Wireless ergonomic gaming mouse with Focus Pro 30K sensor"},
        ],
    },
    {
        "category": "Cases",
        "subcategory": "PC Cases",
        "products": [
            {"name": "Corsair 4000D Airflow", "brand": "Corsair", "variant": "4000D", "pack_size": "Mid Tower", "model_number": "CC-9011200-WW", "cost_price": 5500, "retail_price": 8000, "wholesale_price": 7300, "stock": 12, "tax_rate": 16, "description": "Mid-tower ATX case with high-airflow mesh front"},
            {"name": "NZXT H7 Flow", "brand": "NZXT", "variant": "H7 Flow", "pack_size": "Mid Tower", "model_number": "CM-H71FG-01", "cost_price": 8000, "retail_price": 11500, "wholesale_price": 10500, "stock": 8, "tax_rate": 16, "description": "Mid-tower ATX case with mesh front panel"},
            {"name": "Lian Li O11 Dynamic EVO", "brand": "Lian Li", "variant": "O11 Dynamic EVO", "pack_size": "Mid Tower", "model_number": "G99.O11DEVO.00", "cost_price": 11000, "retail_price": 15500, "wholesale_price": 14200, "stock": 5, "tax_rate": 16, "description": "Dual-chamber mid-tower ATX showcase case"},
        ],
    },
    {
        "category": "Networking",
        "subcategory": "Routers",
        "products": [
            {"name": "TP-Link Archer AX73 AX5400", "brand": "TP-Link", "variant": "Archer AX73", "pack_size": "1", "model_number": "ARCHER AX73", "cost_price": 5500, "retail_price": 8000, "wholesale_price": 7300, "stock": 15, "tax_rate": 16, "description": "AX5400 dual-band WiFi 6 router"},
            {"name": "ASUS RT-AX86U Pro AX5700", "brand": "ASUS", "variant": "RT-AX86U Pro", "pack_size": "1", "model_number": "RT-AX86U PRO", "cost_price": 18000, "retail_price": 25000, "wholesale_price": 23200, "stock": 6, "tax_rate": 16, "description": "AX5700 dual-band gaming WiFi 6 router"},
        ],
    },
]

SUPPLIERS_DATA = [
    {
        "name": "Computer World Kenya Ltd",
        "contact_person": "James Kamau",
        "designation": "Sales Manager",
        "phone": "0712345678",
        "email": "james@computerworld.co.ke",
        "city": "Nairobi",
        "county": "Nairobi",
        "tax_number": "P051234567Z",
        "bank_name": "Equity Bank",
        "bank_account": "1001234567890",
        "is_preferred": True,
        "lead_time_days": 3,
    },
    {
        "name": "Tech Distributors East Africa",
        "contact_person": "Sarah Wanjiku",
        "designation": "Account Manager",
        "phone": "0723456789",
        "email": "sarah@techdistributors.co.ke",
        "city": "Nairobi",
        "county": "Nairobi",
        "tax_number": "P051234568Z",
        "bank_name": "KCB Bank",
        "bank_account": "1109876543210",
        "is_preferred": True,
        "lead_time_days": 5,
    },
    {
        "name": "Bits & Bytes Suppliers",
        "contact_person": "Peter Ochieng",
        "designation": "Director",
        "phone": "0734567890",
        "email": "peter@bitsbytes.co.ke",
        "city": "Mombasa",
        "county": "Mombasa",
        "tax_number": "P051234569Z",
        "bank_name": "Co-operative Bank",
        "bank_account": "1209876543210",
        "is_preferred": False,
        "lead_time_days": 7,
    },
    {
        "name": "Silicon Valley Imports",
        "contact_person": "Michael Njoroge",
        "designation": "Import Manager",
        "phone": "0745678901",
        "email": "michael@svimports.co.ke",
        "city": "Nairobi",
        "county": "Nairobi",
        "tax_number": "P051234570Z",
        "bank_name": "NCBA Bank",
        "bank_account": "1309876543210",
        "is_preferred": True,
        "lead_time_days": 14,
    },
    {
        "name": "Office Tech Solutions",
        "contact_person": "Grace Muthoni",
        "designation": "Operations Lead",
        "phone": "0756789012",
        "email": "grace@officetech.co.ke",
        "city": "Nairobi",
        "county": "Nairobi",
        "tax_number": "P051234571Z",
        "bank_name": "Standard Chartered",
        "bank_account": "1409876543210",
        "is_preferred": False,
        "lead_time_days": 4,
    },
]

CUSTOMERS_DATA = [
    {
        "name": "John Kamau",
        "phone": "0711111111",
        "email": "john.kamau@email.com",
        "city": "Nairobi",
        "county": "Nairobi",
        "pricing_tier": "retail",
        "loyalty_points": 150,
        "total_spent": Decimal("45000"),
        "is_active": True,
    },
    {
        "name": "Mary Akinyi",
        "phone": "0722222222",
        "email": "mary.akinyi@email.com",
        "city": "Mombasa",
        "county": "Mombasa",
        "pricing_tier": "wholesale",
        "loyalty_points": 500,
        "total_spent": Decimal("185000"),
        "is_active": True,
    },
    {
        "name": "David Kiprop",
        "phone": "0733333333",
        "email": "david.kiprop@email.com",
        "city": "Nakuru",
        "county": "Nakuru",
        "pricing_tier": "retail",
        "loyalty_points": 80,
        "total_spent": Decimal("12000"),
        "is_active": True,
    },
    {
        "name": "Grace Wambui",
        "phone": "0744444444",
        "email": "grace.wambui@email.com",
        "city": "Nairobi",
        "county": "Nairobi",
        "pricing_tier": "vip",
        "loyalty_points": 1200,
        "total_spent": Decimal("320000"),
        "is_active": True,
    },
    {
        "name": "Peter Otieno",
        "phone": "0755555555",
        "email": "peter.otieno@email.com",
        "city": "Kisumu",
        "county": "Kisumu",
        "pricing_tier": "retail",
        "loyalty_points": 30,
        "total_spent": Decimal("5000"),
        "is_active": True,
    },
    {
        "name": "Sarah Njeri",
        "phone": "0766666666",
        "email": "sarah.njeri@email.com",
        "city": "Nairobi",
        "county": "Nairobi",
        "pricing_tier": "wholesale",
        "loyalty_points": 750,
        "total_spent": Decimal("210000"),
        "is_active": True,
    },
    {
        "name": "Ezekiel Mutua",
        "phone": "0777777777",
        "email": "ezekiel.mutua@email.com",
        "city": "Machakos",
        "county": "Machakos",
        "pricing_tier": "retail",
        "loyalty_points": 0,
        "total_spent": Decimal("0"),
        "is_active": True,
    },
]

EXPENSE_CATEGORIES = [
    {"name": "Rent & Utilities", "description": "Office and store rent, electricity, water, internet"},
    {"name": "Salaries & Wages", "description": "Employee salaries, wages, and commissions"},
    {"name": "Office Supplies", "description": "Stationery, printer consumables, office equipment"},
    {"name": "Transport & Logistics", "description": "Delivery costs, fuel, vehicle maintenance"},
    {"name": "Marketing & Advertising", "description": "Social media ads, signage, promotions"},
    {"name": "Maintenance & Repairs", "description": "Equipment repair, building maintenance"},
    {"name": "Software & Licenses", "description": "Software subscriptions, licenses, hosting"},
    {"name": "Insurance", "description": "Business insurance, equipment insurance"},
    {"name": "Taxes & Fees", "description": "Business permits, taxes, government fees"},
    {"name": "Miscellaneous", "description": "Other business expenses"},
]

EXPENSES_DATA = [
    {"category_name": "Rent & Utilities", "amount": Decimal("85000"), "description": "Monthly rent for Nairobi store - June 2026", "expense_date": "2026-06-01"},
    {"category_name": "Rent & Utilities", "amount": Decimal("12000"), "description": "Electricity bill - June 2026", "expense_date": "2026-06-05"},
    {"category_name": "Rent & Utilities", "amount": Decimal("8000"), "description": "Internet and WiFi subscription", "expense_date": "2026-06-03"},
    {"category_name": "Salaries & Wages", "amount": Decimal("320000"), "description": "Monthly salaries for all staff - June 2026", "expense_date": "2026-06-25"},
    {"category_name": "Office Supplies", "amount": Decimal("4500"), "description": "Printer toner and paper", "expense_date": "2026-06-10"},
    {"category_name": "Transport & Logistics", "amount": Decimal("15000"), "description": "Product delivery fuel and driver costs", "expense_date": "2026-06-15"},
    {"category_name": "Marketing & Advertising", "amount": Decimal("25000"), "description": "Facebook and Instagram ads campaign", "expense_date": "2026-06-08"},
    {"category_name": "Maintenance & Repairs", "amount": Decimal("6500"), "description": "AC repair at Nairobi store", "expense_date": "2026-06-12"},
    {"category_name": "Software & Licenses", "amount": Decimal("10000"), "description": "Microsoft 365 Business subscription - monthly", "expense_date": "2026-06-02"},
    {"category_name": "Insurance", "amount": Decimal("18000"), "description": "Monthly business insurance premium", "expense_date": "2026-06-01"},
]

PAYMENT_ACCOUNTS = [
    {"name": "Main Cash Register", "account_type": "cash", "account_number": "CR-001", "current_balance": Decimal("150000"), "is_default": True},
    {"name": "M-Pesa Business Paybill", "account_type": "mpesa", "account_number": "247247", "paybill_number": "247247", "current_balance": Decimal("85000"), "is_default": False},
    {"name": "Equity Bank Current Account", "account_type": "bank", "account_number": "1001234567890", "bank_name": "Equity Bank", "bank_branch": "Nairobi CBD", "current_balance": Decimal("500000"), "is_default": False},
    {"name": "KCB Business Account", "account_type": "bank", "account_number": "1109876543210", "bank_name": "KCB Bank", "bank_branch": "Moi Avenue", "current_balance": Decimal("750000"), "is_default": False},
]


class Command(BaseCommand):
    help = 'Seeds the database with initial data for the POS system'

    def handle(self, *args, **options):
        try:
            admin_user = User.objects.filter(role='super_admin').first()
            if not admin_user:
                admin_user = User.objects.filter(is_superuser=True).first()
            if not admin_user:
                admin_user = User.objects.first()

            if not admin_user:
                self.stdout.write(self.style.ERROR("No users found. Create a superuser first."))
                return

            self._seed_suppliers()
            self._seed_categories_and_products()
            self._seed_customers()
            self._seed_payment_accounts(admin_user)
            self._seed_expense_categories(admin_user)

            self.stdout.write(self.style.SUCCESS("Database seeded successfully!"))

        except Exception as e:
            self.stderr.write(self.style.ERROR(f"Seeding failed: {e}"))
            raise

    @transaction.atomic
    def _seed_suppliers(self):
        for data in SUPPLIERS_DATA:
            Supplier.objects.get_or_create(
                phone=data["phone"],
                defaults=data,
            )
        self.stdout.write(f"  Created {len(SUPPLIERS_DATA)} suppliers")

    @transaction.atomic
    def _seed_categories_and_products(self):
        categories_created = 0
        products_created = 0

        for group in PRODUCTS_DATA:
            cat, created = Category.objects.get_or_create(
                name=group["category"],
                defaults={"slug": group["category"].lower().replace(" ", "-"), "description": f"{group['category']} category"},
            )
            if created:
                categories_created += 1

            if group.get("subcategory"):
                subcat, created = Category.objects.get_or_create(
                    name=group["subcategory"],
                    defaults={"slug": group["subcategory"].lower().replace(" ", "-"), "parent": cat, "description": f"{group['subcategory']} subcategory"},
                )
                if created:
                    categories_created += 1
            else:
                subcat = cat

            for product_data in group["products"]:
                _, created = Product.objects.get_or_create(
                    name=product_data["name"],
                    defaults={
                        "category": subcat,
                        "brand": product_data["brand"],
                        "variant": product_data["variant"],
                        "pack_size": product_data["pack_size"],
                        "model_number": product_data["model_number"],
                        "cost_price": product_data["cost_price"],
                        "retail_price": product_data["retail_price"],
                        "wholesale_price": product_data["wholesale_price"],
                        "stock_quantity": product_data["stock"],
                        "reorder_level": 5,
                        "reorder_quantity": 10,
                        "minimum_stock": 3,
                        "tax_rate": product_data["tax_rate"],
                        "description": product_data["description"],
                        "is_active": True,
                    },
                )
                if created:
                    products_created += 1

        self.stdout.write(f"  Created {categories_created} categories, {products_created} products")

    @transaction.atomic
    def _seed_customers(self):
        created_count = 0
        for data in CUSTOMERS_DATA:
            _, created = Customer.objects.get_or_create(
                phone=data["phone"],
                defaults=data,
            )
            if created:
                created_count += 1
        self.stdout.write(f"  Created {created_count} customers")

    @transaction.atomic
    def _seed_payment_accounts(self, user):
        created_count = 0
        for data in PAYMENT_ACCOUNTS:
            _, created = PaymentAccount.objects.get_or_create(
                name=data["name"],
                defaults=data,
            )
            if created:
                created_count += 1
        self.stdout.write(f"  Created {created_count} payment accounts")

    @transaction.atomic
    def _seed_expense_categories(self, user):
        category_map = {}
        for cat_data in EXPENSE_CATEGORIES:
            cat, created = ExpenseCategory.objects.get_or_create(
                name=cat_data["name"],
                defaults={"description": cat_data["description"]},
            )
            category_map[cat.name] = cat

        expense_count = 0
        for exp_data in EXPENSES_DATA:
            category = category_map[exp_data["category_name"]]
            _, created = Expense.objects.get_or_create(
                category=category,
                amount=exp_data["amount"],
                description=exp_data["description"],
                expense_date=exp_data["expense_date"],
                status="paid",
                defaults={"requested_by": user, "approved_by": user},
            )
            if created:
                expense_count += 1

        self.stdout.write(f"  Created {len(EXPENSE_CATEGORIES)} expense categories, {expense_count} expenses")
