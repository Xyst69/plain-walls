/**
 * seed/seedEcommerce.js
 * Comprehensive Database Seeder for NovaMart E-Commerce
 * Populates MongoDB (ecommerce_db) with:
 *   - 4 Categories (Electronics, Fashion, Home & Kitchen, Gaming)
 *   - 24 Detailed Products with high-resolution images, variants, ratings, and reviews
 *   - 3 Initial Customer Orders to demonstrate data visibility in MongoDB Compass
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product.js');
const Category = require('../models/Category.js');
const Order = require('../models/Order.js');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ecommerce_db';

const categoriesData = [
  {
    name: 'Electronics',
    slug: 'electronics',
    icon: '⚡',
    bannerImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80',
    description: 'Flagship smartphones, noise-cancelling audio, ultrabooks and smart wearables.'
  },
  {
    name: 'Fashion',
    slug: 'fashion',
    icon: '👟',
    bannerImage: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80',
    description: 'Trending streetwear, retro sneakers, premium chronographs and daily carry gear.'
  },
  {
    name: 'Home & Kitchen',
    slug: 'home-kitchen',
    icon: '☕',
    bannerImage: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=1200&q=80',
    description: 'Espresso machines, digital air fryers, desk lamps and culinary essentials.'
  },
  {
    name: 'Gaming',
    slug: 'gaming',
    icon: '🎮',
    bannerImage: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80',
    description: 'Mechanical keyboards, ultra-lightweight gaming mice, headsets and monitors.'
  }
];

const productsData = [
  // ---------------- ELECTRONICS ----------------
  {
    title: 'Sony WH-1000XM5 Wireless Noise-Cancelling Headphones',
    slug: 'sony-wh-1000xm5-headphones',
    brand: 'Sony',
    category: 'Electronics',
    price: 26990,
    originalPrice: 34990,
    discountPercentage: 23,
    rating: 4.8,
    reviewCount: 3240,
    inStock: true,
    stock: 45,
    badge: 'Bestseller',
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Industry-leading noise canceling with two processors and 8 microphones. Ultra-comfortable lightweight design with soft fit leather, 30-hour battery life with quick charging (3 mins for 3 hours of playback).',
    highlights: [
      'Two processors and 8 microphones for unparalleled noise cancellation',
      'Up to 30-hour battery life with fast 3-minute charge for 3 hours playback',
      'Crystal clear hands-free calling with 4 beamforming microphones',
      'Speak-to-Chat technology automatically pauses music when you talk'
    ],
    specifications: [
      { label: 'Brand', value: 'Sony' },
      { label: 'Model', value: 'WH-1000XM5' },
      { label: 'Battery Life', value: '30 Hours' },
      { label: 'Connectivity', value: 'Bluetooth 5.2 / 3.5mm Aux' },
      { label: 'Weight', value: '250 grams' },
      { label: 'Warranty', value: '1 Year Manufacturer Warranty' }
    ],
    variants: [
      { name: 'Color', options: ['Midnight Black', 'Silver Frost', 'Midnight Blue'] }
    ],
    reviews: [
      { user: 'Aakash Verma', rating: 5, title: 'Best ANC headphones on the market!', comment: 'Flawless noise cancellation on flights and daily metro commute. Soundstage is rich and immersive.', date: new Date('2026-03-10') },
      { user: 'Priya Sundaram', rating: 5, title: 'Extremely comfortable for 8+ hour workdays', comment: 'Microphone clarity in Zoom calls is crisp. Memory foam cups do not press against glasses.', date: new Date('2026-03-18') }
    ],
    isDealOfDay: true,
    isFeatured: true
  },
  {
    title: 'Apple MacBook Air M3 (13.6-inch, 16GB Unified Memory, 512GB SSD)',
    slug: 'apple-macbook-air-m3-13',
    brand: 'Apple',
    category: 'Electronics',
    price: 114900,
    originalPrice: 134900,
    discountPercentage: 15,
    rating: 4.9,
    reviewCount: 920,
    inStock: true,
    stock: 22,
    badge: "Amazon's Choice",
    images: [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Lean, mean M3 machine. Built for Apple Intelligence. Ultra-thin Liquid Retina display, MagSafe 3 charging, dual Thunderbolt ports, up to 18 hours of battery life with silent fanless thermal architecture.',
    highlights: [
      'Supercharged by Apple M3 8-core CPU and 10-core GPU',
      'Fanless design runs completely silent under heavy workloads',
      '13.6-inch Liquid Retina display with 500 nits brightness and P3 wide color',
      '1080p FaceTime HD camera with studio-quality three-mic array'
    ],
    specifications: [
      { label: 'Brand', value: 'Apple' },
      { label: 'Chip', value: 'Apple M3 (8-core CPU / 10-core GPU)' },
      { label: 'Memory', value: '16GB Unified Memory' },
      { label: 'Storage', value: '512GB High-Speed SSD' },
      { label: 'Display', value: '13.6-inch Liquid Retina (2560 x 1664)' },
      { label: 'Weight', value: '1.24 kg' }
    ],
    variants: [
      { name: 'Color', options: ['Midnight', 'Starlight', 'Space Grey', 'Silver'] }
    ],
    reviews: [
      { user: 'Rohan Mehta', rating: 5, title: 'Silent beast for developers', comment: 'Compiles Next.js & Docker containers seamlessly without breaking a sweat or hearing any fan noise.', date: new Date('2026-02-14') }
    ],
    isDealOfDay: false,
    isFeatured: true
  },
  {
    title: 'Samsung Galaxy Watch 6 Classic (Bluetooth, 47mm, Stainless Steel)',
    slug: 'samsung-galaxy-watch-6-classic',
    brand: 'Samsung',
    category: 'Electronics',
    price: 27999,
    originalPrice: 36999,
    discountPercentage: 24,
    rating: 4.6,
    reviewCount: 850,
    inStock: true,
    stock: 30,
    badge: 'Trending',
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'The return of the iconic rotating bezel. Sapphire crystal display, advanced sleep coaching, body composition analysis (BIA), heart rhythm notifications, and seamless Wear OS ecosystem.',
    highlights: [
      'Tactile rotating bezel for quick physical UI navigation',
      'Sapphire Crystal glass resistant to scratches and everyday knocks',
      'Comprehensive health tracking: ECG, Blood Pressure, BIA, Sleep Score',
      'IP68 and 5ATM water and dust resistance rating'
    ],
    specifications: [
      { label: 'Brand', value: 'Samsung' },
      { label: 'Display', value: '1.5-inch Super AMOLED (480x480)' },
      { label: 'Case Size', value: '47mm Stainless Steel' },
      { label: 'Battery', value: '425 mAh (Fast Wireless Charging)' },
      { label: 'Sensors', value: 'BioActive Sensor, Optical Heart Rate, Barometer' }
    ],
    variants: [
      { name: 'Color', options: ['Black', 'Silver'] }
    ],
    reviews: [
      { user: 'Nitin Rao', rating: 5, title: 'Rotating bezel is pure satisfaction', comment: 'Feels like a luxury Swiss watch with all the smartwatch power I need.', date: new Date('2026-01-20') }
    ],
    isDealOfDay: false,
    isFeatured: true
  },
  {
    title: 'Bose QuietComfort Ultra Earbuds (Spatial Audio, World-Class ANC)',
    slug: 'bose-quietcomfort-ultra-earbuds',
    brand: 'Bose',
    category: 'Electronics',
    price: 21900,
    originalPrice: 29900,
    discountPercentage: 27,
    rating: 4.7,
    reviewCount: 1120,
    inStock: true,
    stock: 40,
    badge: 'Deal of the Day',
    images: [
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Breakthrough spatialized audio for more immersive listening that makes your music feel real. CustomTune technology shapes audio and noise cancellation to the exact contours of your ears.',
    highlights: [
      'Bose Immersive Audio pushes boundaries of spatial sound',
      'CustomTune technology personalizes sound to your ear canal shape',
      'Up to 6 hours listening time (24 hours total with USB-C case)',
      'Touch controls on both earbuds for volume, mode switching, and playback'
    ],
    specifications: [
      { label: 'Brand', value: 'Bose' },
      { label: 'Microphones', value: '4 mics per earbud' },
      { label: 'Water Rating', value: 'IPX4 sweat resistant' },
      { label: 'Bluetooth Range', value: 'Up to 30 feet' }
    ],
    variants: [
      { name: 'Color', options: ['Black', 'White Smoke', 'Lunar Blue'] }
    ],
    reviews: [
      { user: 'Kunal Shrestha', rating: 5, title: 'Bass and noise cancellation are unmatched', comment: 'Blocks out noisy coffee shops completely.', date: new Date('2026-02-28') }
    ],
    isDealOfDay: true,
    isFeatured: false
  },
  {
    title: 'Apple iPhone 15 Pro Max (256 GB, Natural Titanium)',
    slug: 'apple-iphone-15-pro-max-256gb',
    brand: 'Apple',
    category: 'Electronics',
    price: 134900,
    originalPrice: 159900,
    discountPercentage: 16,
    rating: 4.8,
    reviewCount: 1890,
    inStock: true,
    stock: 18,
    badge: 'Bestseller',
    images: [
      'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Forged in aerospace-grade titanium with the groundbreaking A17 Pro chip. Customizable Action button, USB-C connector with USB 3 speeds, and 5x optical telephoto zoom camera.',
    highlights: [
      'Aerospace-grade titanium design is light, strong, and corrosion-resistant',
      'A17 Pro chip brings hardware-accelerated ray tracing to mobile gaming',
      'Pro camera system with 48MP main sensor and 5x optical zoom',
      'Dynamic Island bubbles up alerts and Live Activities'
    ],
    specifications: [
      { label: 'Brand', value: 'Apple' },
      { label: 'Display', value: '6.7-inch Super Retina XDR OLED (120Hz ProMotion)' },
      { label: 'Chipset', value: 'A17 Pro (6-core CPU, 6-core GPU)' },
      { label: 'Storage', value: '256GB' },
      { label: 'Camera', value: '48MP Main + 12MP Ultra-Wide + 12MP 5x Telephoto' }
    ],
    variants: [
      { name: 'Color', options: ['Natural Titanium', 'Blue Titanium', 'Black Titanium', 'White Titanium'] },
      { name: 'Storage', options: ['256GB', '512GB', '1TB'] }
    ],
    reviews: [
      { user: 'Vikram Malhotra', rating: 5, title: 'Titanium weight difference is incredible', comment: 'Noticeably lighter in the hand. Battery easily lasts 1.5 days of heavy usage.', date: new Date('2026-03-01') }
    ],
    isDealOfDay: false,
    isFeatured: true
  },
  {
    title: 'Sony Bravia 55-inch 4K Ultra HD Smart OLED Google TV',
    slug: 'sony-bravia-55-oled-4k-tv',
    brand: 'Sony',
    category: 'Electronics',
    price: 99990,
    originalPrice: 129900,
    discountPercentage: 23,
    rating: 4.8,
    reviewCount: 430,
    inStock: true,
    stock: 12,
    badge: 'Top Rated',
    images: [
      'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Pure OLED black and stunning brightness powered by Cognitive Processor XR. Acoustic Surface Audio+ turns the entire screen into a speaker for sound positioned directly behind the action.',
    highlights: [
      'Self-illuminating OLED panel delivers infinite contrast and pure blacks',
      'Cognitive Processor XR mimics human vision and hearing perception',
      'Auto Low Latency Mode (ALLM) and Variable Refresh Rate (VRR) for PS5',
      'Google TV brings 10,000+ apps and voice search with Google Assistant'
    ],
    specifications: [
      { label: 'Brand', value: 'Sony' },
      { label: 'Screen Size', value: '55 Inches' },
      { label: 'Resolution', value: '4K Ultra HD (3840 x 2160)' },
      { label: 'Refresh Rate', value: '120 Hz Native' },
      { label: 'Audio', value: '50W Acoustic Surface Audio+ (Dolby Atmos)' }
    ],
    variants: [
      { name: 'Size', options: ['55 Inch', '65 Inch'] }
    ],
    reviews: [
      { user: 'Deepak Joshi', rating: 5, title: 'Movies feel like IMAX in my living room', comment: 'Dolby Vision HDR colors pop with perfect depth. Zero blooming or halos.', date: new Date('2026-02-19') }
    ],
    isDealOfDay: false,
    isFeatured: false
  },

  // ---------------- FASHION ----------------
  {
    title: "Nike Air Max Pulse Casual Running Sneakers (Men's)",
    slug: 'nike-air-max-pulse-sneakers',
    brand: 'Nike',
    category: 'Fashion',
    price: 9995,
    originalPrice: 13995,
    discountPercentage: 29,
    rating: 4.6,
    reviewCount: 2100,
    inStock: true,
    stock: 50,
    badge: 'Bestseller',
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Pulling inspiration from the London music scene, the Air Max Pulse brings an underground touch to the iconic Air Max line. Point-loaded Air cushioning provides responsive bounce all day long.',
    highlights: [
      'Point-loaded Air system revamps cushioning for energized push-off',
      'Textile upper with leather and synthetic overlays for durable breathability',
      'Waffle-inspired rubber outsole for authentic street traction'
    ],
    specifications: [
      { label: 'Brand', value: 'Nike' },
      { label: 'Sole Material', value: 'Waffle Rubber' },
      { label: 'Closure', value: 'Lace-Up' },
      { label: 'Fit', value: 'Standard Width (True to size)' }
    ],
    variants: [
      { name: 'Size (UK)', options: ['UK 7', 'UK 8', 'UK 9', 'UK 10', 'UK 11'] },
      { name: 'Color', options: ['Photon Dust / Red', 'Black / Pure Platinum', 'Triple White'] }
    ],
    reviews: [
      { user: 'Sameer Khan', rating: 5, title: 'Stylish and super cushy', comment: 'Walked 15,000 steps around Mumbai on day one with zero foot fatigue.', date: new Date('2026-03-05') }
    ],
    isDealOfDay: true,
    isFeatured: true
  },
  {
    title: "Fossil Grant Chronograph Dark Brown Leather Watch",
    slug: 'fossil-grant-chronograph-watch',
    brand: 'Fossil',
    category: 'Fashion',
    price: 7495,
    originalPrice: 12995,
    discountPercentage: 42,
    rating: 4.6,
    reviewCount: 3400,
    inStock: true,
    stock: 35,
    badge: 'Deal of the Day',
    images: [
      'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Inspired by vintage clocks, our Grant collection features Roman numeral markers and artistic dial depth. Crafted with genuine brown leather strap and stainless steel round case with 50m water resistance.',
    highlights: [
      'Classic Roman numeral dial with 3 chronograph subdials (stopwatch functionality)',
      'Interchangeable 22mm genuine leather strap with buckle closure',
      'Water resistant to 50 meters (suitable for swimming in shallow water)'
    ],
    specifications: [
      { label: 'Brand', value: 'Fossil' },
      { label: 'Case Diameter', value: '44mm' },
      { label: 'Strap Width', value: '22mm' },
      { label: 'Movement', value: 'Quartz Chronograph' },
      { label: 'Warranty', value: '2 Years International' }
    ],
    variants: [
      { name: 'Dial Color', options: ['Cream / Blue Hands', 'Black / Rose Gold', 'Silver / Brown'] }
    ],
    reviews: [
      { user: 'Aditya Singhania', rating: 5, title: 'Gets compliments every single time', comment: 'The blue hands against the cream dial look way more expensive than ₹7.5k.', date: new Date('2026-02-11') }
    ],
    isDealOfDay: true,
    isFeatured: true
  },
  {
    title: "Ray-Ban Classic Polarized Aviator Sunglasses (Gold / G-15 Green)",
    slug: 'ray-ban-polarized-aviator',
    brand: 'Ray-Ban',
    category: 'Fashion',
    price: 8190,
    originalPrice: 11290,
    discountPercentage: 27,
    rating: 4.8,
    reviewCount: 4520,
    inStock: true,
    stock: 60,
    badge: "Amazon's Choice",
    images: [
      'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Originally designed in 1937 for US aviators, the Ray-Ban RB3025 Aviator is one of the most iconic sunglasses in history. Featuring polarized crystal green lenses that eliminate 99% of reflected glare.',
    highlights: [
      'High-grade polarized crystal lenses eliminate reflective glare and reduce eye strain',
      'Lightweight Monel metal alloy frame with silicone nose pads',
      '100% UV400 radiation protection coating'
    ],
    specifications: [
      { label: 'Brand', value: 'Ray-Ban' },
      { label: 'Model', value: 'RB3025 001/58' },
      { label: 'Lens Width', value: '58mm (Standard)' },
      { label: 'Bridge Size', value: '14mm' },
      { label: 'Frame Material', value: 'Gold Metal' }
    ],
    variants: [
      { name: 'Lens Size', options: ['55mm (Small)', '58mm (Standard)', '62mm (Large)'] }
    ],
    reviews: [
      { user: 'Harsh Vardhan', rating: 5, title: 'Timeless classic', comment: 'Crystal clear driving vision on sunny highways. Polarized lens is worth every penny.', date: new Date('2026-01-29') }
    ],
    isDealOfDay: false,
    isFeatured: true
  },
  {
    title: "Levi's Men's Original Trucker Denim Jacket",
    slug: 'levis-mens-trucker-denim-jacket',
    brand: "Levi's",
    category: 'Fashion',
    price: 3499,
    originalPrice: 5999,
    discountPercentage: 42,
    rating: 4.5,
    reviewCount: 1450,
    inStock: true,
    stock: 40,
    badge: 'Trending',
    images: [
      'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'A symbol of self-expression for decades. The original denim jacket since 1967, featuring pointed collar, buttoned front flap pockets, side welt pockets, and waist adjusters.',
    highlights: [
      '100% heavy-duty non-stretch cotton denim',
      'Hits at the hip for a regular tailored silhouette',
      'Branded metal shank buttons and iconic red tab on chest pocket'
    ],
    specifications: [
      { label: 'Brand', value: "Levi's" },
      { label: 'Material', value: '100% Cotton Denim' },
      { label: 'Fit', value: 'Standard Regular' },
      { label: 'Care', value: 'Machine wash cold with like colors' }
    ],
    variants: [
      { name: 'Size', options: ['S', 'M', 'L', 'XL', 'XXL'] },
      { name: 'Wash', options: ['Dark Stonewash', 'Faded Blue', 'Washed Black'] }
    ],
    reviews: [
      { user: 'Karthik Narang', rating: 5, title: 'Gets better with every wash', comment: 'Rugged construction, looks great layered over hoodies or tees.', date: new Date('2026-03-02') }
    ],
    isDealOfDay: false,
    isFeatured: false
  },
  {
    title: 'The North Face Borealis Commuter Backpack (28L, Black)',
    slug: 'the-north-face-borealis-backpack',
    brand: 'The North Face',
    category: 'Fashion',
    price: 6999,
    originalPrice: 9999,
    discountPercentage: 30,
    rating: 4.7,
    reviewCount: 890,
    inStock: true,
    stock: 28,
    badge: 'Top Rated',
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'The iconic 28-liter pack features a dedicated protective laptop compartment, external bungee storage system, and FlexVent suspension certified by the American Chiropractic Association.',
    highlights: [
      'FlexVent suspension system with custom injection-molded shoulder straps',
      'Dedicated 15-inch fleece-lined padded laptop compartment',
      'Front compartment with internal organization and secure-zip tablet pocket',
      'Two external mesh water bottle pockets that double as multi-use pockets'
    ],
    specifications: [
      { label: 'Brand', value: 'The North Face' },
      { label: 'Capacity', value: '28 Liters' },
      { label: 'Material', value: '210D Recycled Nylon Ripstop with non-PFC DWR' },
      { label: 'Weight', value: '1.05 kg' }
    ],
    variants: [
      { name: 'Color', options: ['TNF Black', 'Asphalt Grey', 'Navy / White'] }
    ],
    reviews: [
      { user: 'Manish Tyagi', rating: 5, title: 'Best laptop backpack for college & travel', comment: 'Ergonomic straps distribute heavy laptop weight effortlessly.', date: new Date('2026-02-04') }
    ],
    isDealOfDay: false,
    isFeatured: false
  },
  {
    title: 'Urban Classics Heavyweight Vintage Washed Cotton Hoodie',
    slug: 'urban-classics-heavyweight-hoodie',
    brand: 'Urban Classics',
    category: 'Fashion',
    price: 1999,
    originalPrice: 3499,
    discountPercentage: 43,
    rating: 4.5,
    reviewCount: 670,
    inStock: true,
    stock: 55,
    badge: 'Bestseller',
    images: [
      'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Premium 450 GSM French Terry cotton hoodie with dropped shoulders, oversized boxy silhouette, double-layered hood without drawstrings, and kangaroo front pocket.',
    highlights: [
      'Ultra-dense 450 GSM heavyweight brushed French Terry cotton',
      'Preshrunk vintage garment wash for a lived-in texture',
      'Thick 2x2 ribbed cuffs and hem that hold their shape'
    ],
    specifications: [
      { label: 'Brand', value: 'Urban Classics' },
      { label: 'GSM', value: '450 GSM' },
      { label: 'Material', value: '100% Combed Cotton' },
      { label: 'Fit', value: 'Oversized Boxy Dropped-Shoulder' }
    ],
    variants: [
      { name: 'Size', options: ['S', 'M', 'L', 'XL'] },
      { name: 'Color', options: ['Washed Charcoal', 'Vintage Moss', 'Oatmeal Heather', 'Off-White'] }
    ],
    reviews: [
      { user: 'Varun Grover', rating: 5, title: 'Insane fabric quality for this price', comment: 'Feels like a ₹6,000 streetwear label piece. Heavy and warm.', date: new Date('2026-03-09') }
    ],
    isDealOfDay: false,
    isFeatured: false
  },

  // ---------------- HOME & KITCHEN ----------------
  {
    title: 'Breville Barista Touch Espresso Machine with Touchscreen & Auto Steam',
    slug: 'breville-barista-touch-espresso',
    brand: 'Breville',
    category: 'Home & Kitchen',
    price: 54990,
    originalPrice: 69990,
    discountPercentage: 21,
    rating: 4.8,
    reviewCount: 870,
    inStock: true,
    stock: 14,
    badge: 'Bestseller',
    images: [
      'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1509785307050-d4066910ec1e?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Cafe quality specialty coffee at home. Touchscreen display guides you through grind, brew, and automatic microfoam milk texturing for latte art in 3 easy seconds.',
    highlights: [
      'Automated touchscreen menu with pre-programmed cafe drinks: Espresso, Latte, Cappuccino',
      'ThermoJet heating system reaches optimum extraction temperature in 3 seconds',
      'Integrated precision conical burr grinder with 30 grind size settings',
      'Automatic steam wand textures silky microfoam milk to your exact preferred temperature'
    ],
    specifications: [
      { label: 'Brand', value: 'Breville' },
      { label: 'Pressure', value: '15 Bar Italian Pump (9 Bar extraction)' },
      { label: 'Water Tank', value: '2 Liters (BPA Free)' },
      { label: 'Bean Hopper', value: '250 grams with locking system' },
      { label: 'Material', value: 'Brushed Stainless Steel' }
    ],
    variants: [
      { name: 'Finish', options: ['Brushed Stainless Steel', 'Black Truffle', 'Sea Salt White'] }
    ],
    reviews: [
      { user: 'Siddharth Iyer', rating: 5, title: 'Changed my mornings forever', comment: 'Barista quality flat whites in under 60 seconds without leaving the house.', date: new Date('2026-02-22') }
    ],
    isDealOfDay: true,
    isFeatured: true
  },
  {
    title: 'Philips Digital Air Fryer XL (4.2L Rapid Air Tech, 1400W)',
    slug: 'philips-digital-air-fryer-xl',
    brand: 'Philips',
    category: 'Home & Kitchen',
    price: 7999,
    originalPrice: 12995,
    discountPercentage: 38,
    rating: 4.6,
    reviewCount: 5600,
    inStock: true,
    stock: 65,
    badge: 'Deal of the Day',
    images: [
      'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Fry with up to 90% less oil. Rapid Air Technology swirls hot air to create crispy outside and tender inside meals. 7 presets on digital touch screen with keep-warm function.',
    highlights: [
      'Patented starfish bottom swirls hot air for even frying without flipping',
      'Touchscreen with 7 preset cook programs: fries, meat, fish, chicken, cake, grill',
      'Dishwasher-safe QuickClean basket with non-stick coating',
      'NutriU recipe app integration with 500+ healthy recipe guides'
    ],
    specifications: [
      { label: 'Brand', value: 'Philips' },
      { label: 'Capacity', value: '4.2 Liters (Up to 4 portions)' },
      { label: 'Power', value: '1400 Watts' },
      { label: 'Cord Length', value: '0.8 meters' }
    ],
    variants: [
      { name: 'Color', options: ['Gloss Black / Silver', 'Matte White'] }
    ],
    reviews: [
      { user: 'Meena Kapoor', rating: 5, title: 'Crispy samosas and fries with zero guilt', comment: 'Cooks twice as fast as my microwave oven and uses a fraction of the oil.', date: new Date('2026-03-08') }
    ],
    isDealOfDay: true,
    isFeatured: true
  },
  {
    title: 'Dyson V12 Detect Slim Cordless Vacuum Cleaner (Laser Dust Sensor)',
    slug: 'dyson-v12-detect-slim-vacuum',
    brand: 'Dyson',
    category: 'Home & Kitchen',
    price: 45900,
    originalPrice: 55900,
    discountPercentage: 18,
    rating: 4.7,
    reviewCount: 1230,
    inStock: true,
    stock: 20,
    badge: 'Top Rated',
    images: [
      'https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=800&q=80'
    ],
    description: "Dyson's most powerful, compact cordless vacuum. Illuminated cleaner head reveals invisible dust on hard floors. Piezo sensor counts and measures dust particles on live LCD screen.",
    highlights: [
      'Laser illuminates microscopic dust particles on hard floors',
      'Piezo sensor automatically increases suction power when higher dust volume is detected',
      'Up to 60 minutes of fade-free run time with click-in battery',
      'Hair screw tool de-tangles pet hair directly into the bin'
    ],
    specifications: [
      { label: 'Brand', value: 'Dyson' },
      { label: 'Suction Power', value: '150 Air Watts' },
      { label: 'Weight', value: '2.2 kg' },
      { label: 'Bin Volume', value: '0.35 Liters' },
      { label: 'Filtration', value: 'Whole-machine HEPA filtration (99.99% down to 0.3 microns)' }
    ],
    variants: [
      { name: 'Color', options: ['Yellow / Iron', 'Nickel / Blue'] }
    ],
    reviews: [
      { user: 'Ananya Sen', rating: 5, title: 'The laser reveals dust you never knew existed', comment: 'Lightweight enough to do ceiling fans and sofa crevices effortlessly.', date: new Date('2026-02-17') }
    ],
    isDealOfDay: false,
    isFeatured: true
  },
  {
    title: 'BenQ ScreenBar Halo LED Monitor Light Bar with Wireless Controller',
    slug: 'benq-screenbar-halo-light-bar',
    brand: 'BenQ',
    category: 'Home & Kitchen',
    price: 13990,
    originalPrice: 17990,
    discountPercentage: 22,
    rating: 4.8,
    reviewCount: 940,
    inStock: true,
    stock: 35,
    badge: "Amazon's Choice",
    images: [
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Zero screen glare desk lamp designed specifically for curved and flat monitors. Asymmetrical optical design illuminates only your desk, with ambient backlight to balance eye contrast.',
    highlights: [
      'Patented asymmetrical optical design guarantees zero screen reflection',
      'Smart wireless rotary puck controller for brightness and color temperature adjustment',
      'Integrated back ambient light reduces eye strain during late night work',
      'Auto-dimming ambient light sensor maintains constant 500 lux desk illuminance'
    ],
    specifications: [
      { label: 'Brand', value: 'BenQ' },
      { label: 'Color Temp', value: '2700K - 6500K (Warm to Cool)' },
      { label: 'Power Source', value: 'USB-A 5V 1.3A' },
      { label: 'Monitor Compatibility', value: 'Flat (0.7-6cm) & Curved monitors (1000R-1800R)' }
    ],
    variants: [
      { name: 'Model', options: ['ScreenBar Halo (Front + Back Light)', 'ScreenBar Plus (Front Light Only)'] }
    ],
    reviews: [
      { user: 'Tarun Saxena', rating: 5, title: 'Eliminated my end-of-day eye strain', comment: 'The back ambient light against the wall makes working in the dark so comfortable.', date: new Date('2026-01-15') }
    ],
    isDealOfDay: false,
    isFeatured: false
  },
  {
    title: 'Fellow Stagg EKG Electric Pour-Over Kettle (Matte Black, 0.9L)',
    slug: 'fellow-stagg-ekg-electric-kettle',
    brand: 'Fellow',
    category: 'Home & Kitchen',
    price: 16499,
    originalPrice: 21999,
    discountPercentage: 25,
    rating: 4.9,
    reviewCount: 780,
    inStock: true,
    stock: 25,
    badge: 'Trending',
    images: [
      'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Precision gooseneck spout for the ultimate pour-over coffee control. PID temperature controller maintains degree-precise water temperature with minimalist LCD screen and stopwatch.',
    highlights: [
      'Precision gooseneck pour spout for optimal flow rate velocity and angle',
      'PID temperature controller holds exact set temperature for up to 60 minutes',
      'High-contrast LCD screen displays target temp, current temp, and brew stopwatch'
    ],
    specifications: [
      { label: 'Brand', value: 'Fellow' },
      { label: 'Capacity', value: '0.9 Liters' },
      { label: 'Power', value: '1200 Watts (Rapid boil)' },
      { label: 'Body', value: '304 Stainless Steel with Matte Finish' }
    ],
    variants: [
      { name: 'Color', options: ['Matte Black', 'Matte White', 'Warm Pink with Maple Wood'] }
    ],
    reviews: [
      { user: 'Devina Chawla', rating: 5, title: 'Work of art on the kitchen counter', comment: 'The counterbalanced handle makes the slowest pour feel effortless.', date: new Date('2026-03-04') }
    ],
    isDealOfDay: false,
    isFeatured: false
  },
  {
    title: 'Le Creuset Signature Enameled Cast Iron Dutch Oven (5.5 Qt, Cerise Red)',
    slug: 'le-creuset-cast-iron-dutch-oven',
    brand: 'Le Creuset',
    category: 'Home & Kitchen',
    price: 22500,
    originalPrice: 28000,
    discountPercentage: 20,
    rating: 4.9,
    reviewCount: 610,
    inStock: true,
    stock: 15,
    badge: 'Top Rated',
    images: [
      'https://images.unsplash.com/photo-1584990347449-3990b798b31a?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Handcrafted in France since 1925. Unrivaled heat distribution and retention for slow braising, roasting, stews, and artisanal crusty sourdough bread. Safe for all stovetops and oven up to 260°C.',
    highlights: [
      'Enameled cast iron delivers superior heat distribution and retention',
      'Easy-to-clean vibrant exterior enamel resists chipping and cracking',
      'Tight-fitting lid locks in moisture for tender, flavor-packed dishes'
    ],
    specifications: [
      { label: 'Brand', value: 'Le Creuset' },
      { label: 'Capacity', value: '5.5 Quarts (5.3 Liters)' },
      { label: 'Heat Source', value: 'Induction, Gas, Electric, Ceramic, Oven safe to 260°C' },
      { label: 'Origin', value: 'Made in France' }
    ],
    variants: [
      { name: 'Color', options: ['Cerise Red', 'Flame Orange', 'Marseille Blue', 'Meringue Cream'] }
    ],
    reviews: [
      { user: 'Chef Rahul Bajaj', rating: 5, title: 'An heirloom piece that lasts generations', comment: 'Bakes the most blistered, crunchy sourdough loaves you will ever taste.', date: new Date('2026-02-15') }
    ],
    isDealOfDay: false,
    isFeatured: false
  },

  // ---------------- GAMING ----------------
  {
    title: 'Sony PlayStation 5 DualSense Wireless Controller (Midnight Black)',
    slug: 'sony-ps5-dualsense-wireless-controller',
    brand: 'PlayStation',
    category: 'Gaming',
    price: 5490,
    originalPrice: 6390,
    discountPercentage: 14,
    rating: 4.8,
    reviewCount: 7200,
    inStock: true,
    stock: 80,
    badge: 'Bestseller',
    images: [
      'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1592840496073-e535bede70db?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Discover a deeper gaming experience with tactile haptic feedback, dynamic adaptive triggers, and a built-in microphone, all integrated into an iconic comfortable design.',
    highlights: [
      'Immersive haptic feedback replaces traditional rumble motors with physical recoil',
      'Dynamic adaptive triggers simulate tension of drawing bowstrings or braking cars',
      'Built-in microphone and 3.5mm headset jack for seamless multiplayer voice chat'
    ],
    specifications: [
      { label: 'Brand', value: 'Sony PlayStation' },
      { label: 'Connectivity', value: 'Bluetooth 5.1 / USB Type-C' },
      { label: 'Compatibility', value: 'PS5, PC (Steam / Windows), macOS, iOS, Android' },
      { label: 'Battery', value: 'Built-in 1560 mAh Li-ion Rechargeable' }
    ],
    variants: [
      { name: 'Color', options: ['Midnight Black', 'White', 'Cosmic Red', 'Galactic Purple', 'Cobalt Blue'] }
    ],
    reviews: [
      { user: 'Gaurav Gill', rating: 5, title: 'Adaptive triggers are next gen magic', comment: 'Playing Spider-Man and Cyberpunk feels unbelievably tactile.', date: new Date('2026-03-01') }
    ],
    isDealOfDay: true,
    isFeatured: true
  },
  {
    title: 'Logitech G Pro X Superlight 2 Wireless Gaming Mouse (60g, 4K Polling)',
    slug: 'logitech-g-pro-x-superlight-2',
    brand: 'Logitech G',
    category: 'Gaming',
    price: 12995,
    originalPrice: 16995,
    discountPercentage: 24,
    rating: 4.9,
    reviewCount: 1840,
    inStock: true,
    stock: 45,
    badge: 'Deal of the Day',
    images: [
      'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'The world’s undisputed championship esports mouse. Weighing just 60 grams with HERO 2 sensor (32,000 DPI), LIGHTFORCE hybrid optical-mechanical switches, and up to 4000Hz wireless polling rate.',
    highlights: [
      'Featherlight 60-gram weight without honeycomb holes or compromises',
      'HERO 2 sensor tracks over 500 IPS with zero smoothing or acceleration',
      'LIGHTFORCE optical-mechanical switches for crisp clicks and zero latency',
      'Up to 95 hours of continuous motion battery life via USB-C'
    ],
    specifications: [
      { label: 'Brand', value: 'Logitech G' },
      { label: 'DPI', value: '100 - 32,000 DPI' },
      { label: 'Weight', value: '60 grams' },
      { label: 'Polling Rate', value: 'Up to 4000 Hz with LIGHTSPEED' },
      { label: 'Feet', value: 'Zero-additive PTFE glides' }
    ],
    variants: [
      { name: 'Color', options: ['Matte Black', 'Pure White', 'Magenta Pink'] }
    ],
    reviews: [
      { user: 'Pranav Nair', rating: 5, title: 'Aim tracking in Valorant improved instantly', comment: 'Zero drag on the mousepad. Battery literally lasts for weeks on a single charge.', date: new Date('2026-02-26') }
    ],
    isDealOfDay: true,
    isFeatured: true
  },
  {
    title: 'Keychron K2 Pro QMK/VIA Wireless Custom Mechanical Keyboard',
    slug: 'keychron-k2-pro-mechanical-keyboard',
    brand: 'Keychron',
    category: 'Gaming',
    price: 8499,
    originalPrice: 11999,
    discountPercentage: 29,
    rating: 4.8,
    reviewCount: 540,
    inStock: true,
    stock: 32,
    badge: "Amazon's Choice",
    images: [
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Compact 75% layout custom wireless mechanical keyboard. Fully programmable with QMK & VIA web configurator, double-shot PBT keycaps, sound-absorbing foam, and hot-swappable switches.',
    highlights: [
      'South-facing RGB backlighting with 22 dynamic lighting presets',
      'Hot-swappable sockets allow changing 3-pin or 5-pin switches without soldering',
      'QMK/VIA support allows remapping any key or macro directly in web browser',
      'Connects up to 3 devices via Bluetooth 5.1 with seamless Mac & Windows switch'
    ],
    specifications: [
      { label: 'Brand', value: 'Keychron' },
      { label: 'Layout', value: '75% (84 Keys)' },
      { label: 'Keycaps', value: 'OSA Profile Double-Shot PBT' },
      { label: 'Battery', value: '4000 mAh (Up to 300 hours non-backlit)' }
    ],
    variants: [
      { name: 'Switch Type', options: ['Keychron K Pro Red (Linear)', 'Keychron K Pro Brown (Tactile)', 'Keychron K Pro Blue (Clicky)'] }
    ],
    reviews: [
      { user: 'Soham Banerjee', rating: 5, title: 'Deep, creamy typing acoustics', comment: 'The pre-lubed switches and sound foam eliminate all hollow case ping. Delight to type on.', date: new Date('2026-02-12') }
    ],
    isDealOfDay: false,
    isFeatured: true
  },
  {
    title: 'SteelSeries Arctis Nova Pro Wireless Multi-System Gaming Headset',
    slug: 'steelseries-arctis-nova-pro-wireless',
    brand: 'SteelSeries',
    category: 'Gaming',
    price: 28999,
    originalPrice: 34999,
    discountPercentage: 17,
    rating: 4.7,
    reviewCount: 980,
    inStock: true,
    stock: 18,
    badge: 'Top Rated',
    images: [
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Almighty Audio with premium high fidelity drivers and 360° Spatial Audio. Infinity Power System with dual hot-swap batteries, active noise cancellation, and OLED Wireless Base Station.',
    highlights: [
      'Active Noise Cancellation with 4-mic hybrid system silences keyboard clatter',
      'Dual hot-swappable batteries mean you never have to plug in your headset',
      'Multi-System Connect lets you switch between PC, PlayStation, and Switch instantly',
      'ClearCast Gen 2 bidirectional microphone with AI-powered noise removal'
    ],
    specifications: [
      { label: 'Brand', value: 'SteelSeries' },
      { label: 'Audio Drivers', value: '40mm Neodymium Hi-Res (10–40,000 Hz)' },
      { label: 'Wireless Range', value: '12 meters (40 ft) 2.4 GHz' },
      { label: 'Battery Life', value: '44 Hours (22 hours per battery pack)' }
    ],
    variants: [
      { name: 'Compatibility', options: ['PC & PlayStation', 'Xbox & PC'] }
    ],
    reviews: [
      { user: 'Naveen Reddy', rating: 5, title: 'The hot-swap battery system is a game changer', comment: 'You literally never run out of juice mid-tournament.', date: new Date('2026-01-22') }
    ],
    isDealOfDay: false,
    isFeatured: false
  },
  {
    title: 'LG UltraGear 27-inch QHD Nano IPS Gaming Monitor (240Hz, 1ms, HDR400)',
    slug: 'lg-ultragear-27-qhd-240hz-monitor',
    brand: 'LG',
    category: 'Gaming',
    price: 29999,
    originalPrice: 42000,
    discountPercentage: 29,
    rating: 4.7,
    reviewCount: 1420,
    inStock: true,
    stock: 22,
    badge: 'Trending',
    images: [
      'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Born to game. Fast 240Hz refresh rate combined with 1ms (GtG) response time on a gorgeous Nano IPS panel. NVIDIA G-SYNC Compatible and AMD FreeSync Premium Pro certified.',
    highlights: [
      '27-inch QHD (2560 x 1440) Nano IPS with DCI-P3 98% color gamut coverage',
      'Blazing fast 240Hz refresh rate and 1ms (GtG) pixel response',
      'NVIDIA G-Sync compatible & AMD FreeSync Premium Pro eliminates tearing',
      'Ergonomic stand with height, tilt, and 90° pivot rotation'
    ],
    specifications: [
      { label: 'Brand', value: 'LG' },
      { label: 'Resolution', value: '2560 x 1440 (QHD)' },
      { label: 'Panel', value: 'Nano IPS with VESA DisplayHDR 400' },
      { label: 'Ports', value: '2x HDMI 2.1, 1x DisplayPort 1.4, 2x USB 3.0 downstream' }
    ],
    variants: [
      { name: 'Refresh Rate', options: ['240Hz (Pro Esports)', '165Hz (Standard)'] }
    ],
    reviews: [
      { user: 'Karan Singhal', rating: 5, title: 'Crisp QHD resolution and zero ghosting', comment: 'Apex Legends and CS2 look butter smooth. Colors are breathtaking.', date: new Date('2026-03-03') }
    ],
    isDealOfDay: false,
    isFeatured: false
  },
  {
    title: 'Shure MV7 USB/XLR Dynamic Podcast & Streaming Microphone',
    slug: 'shure-mv7-dynamic-podcast-microphone',
    brand: 'Shure',
    category: 'Gaming',
    price: 21490,
    originalPrice: 26990,
    discountPercentage: 20,
    rating: 4.9,
    reviewCount: 2300,
    inStock: true,
    stock: 25,
    badge: 'Bestseller',
    images: [
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Inspired by the legendary SM7B. Dual USB and XLR outputs for digital plug-and-play or professional studio interfaces. Voice Isolation Technology captures your voice without ambient room noise.',
    highlights: [
      'Voice Isolation Technology ignores room acoustics and background fan noise',
      'Auto Level Mode adjusts gain in real-time to keep your stream volume consistent',
      'Intuitive touch panel on microphone body for gain, monitor mix, and instant mute',
      'Built-in 3.5mm headphone output for direct zero-latency vocal monitoring'
    ],
    specifications: [
      { label: 'Brand', value: 'Shure' },
      { label: 'Transducer Type', value: 'Dynamic (Cardioid Polar Pattern)' },
      { label: 'Output', value: 'USB Micro-B & Standard 3-Pin XLR' },
      { label: 'Sampling Rate', value: '24-Bit / 48 kHz' }
    ],
    variants: [
      { name: 'Color', options: ['Matte Black', 'Silver'] }
    ],
    reviews: [
      { user: 'Rajesh Nair', rating: 5, title: 'Radio broadcast sound right out of the box', comment: 'Plugs straight into Mac USB-C. Eliminates all echo from untreated bedroom walls.', date: new Date('2026-02-09') }
    ],
    isDealOfDay: false,
    isFeatured: false
  }
];

const seedOrdersData = [
  {
    orderNumber: 'ORD-2026-10492',
    customer: {
      fullName: 'Rahul Sharma',
      email: 'rahul.sharma@example.com',
      phone: '+91 98201 12345',
      address: 'Flat 402, Green Glen Apartments, Outer Ring Road, Bellandur',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560103'
    },
    items: [
      {
        title: 'Sony WH-1000XM5 Wireless Noise-Cancelling Headphones',
        brand: 'Sony',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
        price: 26990,
        quantity: 1,
        variant: 'Color: Midnight Black',
        itemTotal: 26990
      }
    ],
    pricing: {
      subtotal: 26990,
      discount: 2699,
      couponCode: 'SAVE10',
      deliveryFee: 0,
      totalAmount: 24291
    },
    paymentMethod: 'upi',
    paymentStatus: 'Completed',
    orderStatus: 'Confirmed',
    trackingTimeline: [
      { status: 'Confirmed', label: 'Order Confirmed & UPI Payment Verified', timestamp: new Date(Date.now() - 3600000), done: true },
      { status: 'Packed', label: 'Packed at NovaMart Bengaluru Warehouse', timestamp: new Date(Date.now() - 1800000), done: true },
      { status: 'Shipped', label: 'In Transit with Express Courier Partner', timestamp: null, done: false },
      { status: 'Delivered', label: 'Expected Delivery Tomorrow by 2:00 PM', timestamp: null, done: false }
    ],
    createdAt: new Date(Date.now() - 3600000)
  },
  {
    orderNumber: 'ORD-2026-94812',
    customer: {
      fullName: 'Sneha Patel',
      email: 'sneha.patel@example.com',
      phone: '+91 97123 45678',
      address: 'B-14 Silver Springs, Near SG Highway, Bodakdev',
      city: 'Ahmedabad',
      state: 'Gujarat',
      pincode: '380054'
    },
    items: [
      {
        title: "Nike Air Max Pulse Casual Running Sneakers (Men's)",
        brand: 'Nike',
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
        price: 9995,
        quantity: 1,
        variant: 'Size: UK 9 | Color: Photon Dust / Red',
        itemTotal: 9995
      },
      {
        title: "Fossil Grant Chronograph Dark Brown Leather Watch",
        brand: 'Fossil',
        image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80',
        price: 7495,
        quantity: 1,
        variant: 'Dial: Cream / Blue Hands',
        itemTotal: 7495
      }
    ],
    pricing: {
      subtotal: 17490,
      discount: 1749,
      couponCode: 'SAVE10',
      deliveryFee: 0,
      totalAmount: 15741
    },
    paymentMethod: 'cod',
    paymentStatus: 'Pending',
    orderStatus: 'Shipped',
    trackingTimeline: [
      { status: 'Confirmed', label: 'Order Confirmed (Cash on Delivery)', timestamp: new Date(Date.now() - 86400000), done: true },
      { status: 'Packed', label: 'Packed & Barcode Scanned', timestamp: new Date(Date.now() - 72000000), done: true },
      { status: 'Shipped', label: 'Dispatched via BlueDart Express Air', timestamp: new Date(Date.now() - 43200000), done: true },
      { status: 'Delivered', label: 'Out for delivery today', timestamp: null, done: false }
    ],
    createdAt: new Date(Date.now() - 86400000)
  }
];

async function seedDatabase() {
  try {
    console.log('====================================================');
    console.log('  NovaMart E-Commerce Database Seeder');
    console.log('====================================================');
    console.log(`Connecting to MongoDB at: ${MONGO_URI} ...`);

    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB database: ecommerce_db');

    // 1. Clear old collections
    console.log('Cleaning old collections...');
    await Product.deleteMany({});
    await Category.deleteMany({});
    await Order.deleteMany({});

    // 2. Insert Categories
    console.log(`Inserting ${categoriesData.length} product categories...`);
    await Category.insertMany(categoriesData);

    // 3. Insert Products
    console.log(`Inserting ${productsData.length} rich e-commerce products...`);
    const insertedProducts = await Product.insertMany(productsData);
    console.log(`Successfully seeded ${insertedProducts.length} products!`);

    // 4. Update order items with actual product IDs
    const productMap = {};
    insertedProducts.forEach(p => { productMap[p.slug] = p._id; });

    const linkedOrders = seedOrdersData.map(order => {
      const updatedItems = order.items.map(item => {
        const matched = insertedProducts.find(p => p.title === item.title);
        return {
          ...item,
          productId: matched ? matched._id : null
        };
      });
      return { ...order, items: updatedItems };
    });

    console.log(`Inserting ${linkedOrders.length} initial demonstration orders...`);
    await Order.insertMany(linkedOrders);

    console.log('\n====================================================');
    console.log('  DATABASE SEED COMPLETE!');
    console.log('====================================================');
    console.log('  MongoDB Compass Connection Details:');
    console.log('    URI:          mongodb://localhost:27017');
    console.log('    Database:     ecommerce_db');
    console.log('    Collections:  products (24 docs)');
    console.log('                  categories (4 docs)');
    console.log('                  orders (2 docs)');
    console.log('====================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
