/**
 * seed/seed.js
 * Database seeder script for "Plain Walls"
 * Populates 15 curated poster products across all 6 categories
 * 
 * Usage: npm run seed
 */

require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db.js');
const Poster = require('../models/Poster.js');

const postersData = [
  {
    title: 'Quiet Arch No. 3',
    slug: 'quiet-arch-no-3',
    description: 'An architectural dialogue between gentle afternoon sunlight, arched doorway contours, and pale plaster surfaces. Designed to bring stillness to quiet living spaces.',
    price: 699,
    category: 'Architecture',
    sizes: [
      { label: 'A4', price: 699 },
      { label: 'A3', price: 1199 },
      { label: 'A2', price: 1799 }
    ],
    finish: 'matte',
    imageUrl: '/images/arch-quiet-arch-3.jpg',
    featured: true
  },
  {
    title: 'Fern Study No. 12',
    slug: 'fern-study-no-12',
    description: 'A delicate botanical study capturing natural frond textures against warm linen backdrop. Clean organic balance for understated bedrooms and reading nooks.',
    price: 599,
    category: 'Botanical',
    sizes: [
      { label: 'A4', price: 599 },
      { label: 'A3', price: 999 },
      { label: 'A2', price: 1599 }
    ],
    finish: 'matte',
    imageUrl: '/images/botanical-fern-study.jpg',
    featured: true
  },
  {
    title: 'Ochre & Mineral Forms',
    slug: 'ochre-mineral-forms',
    description: 'Minimal abstract study exploring layered earth pigment shapes, subtle grain textures, and negative space inspired by mid-century Scandinavian ceramics.',
    price: 749,
    category: 'Abstract',
    sizes: [
      { label: 'A4', price: 749 },
      { label: 'A3', price: 1249 },
      { label: 'A2', price: 1849 }
    ],
    finish: 'gloss laminated',
    imageUrl: '/images/abstract-ochre-forms.jpg',
    featured: true
  },
  {
    title: 'Contour Figure No. 2',
    slug: 'contour-figure-no-2',
    description: 'One continuous fluid stroke exploring human posture and negative tension. Printed on archival 280gsm stock with premium lamination for longevity.',
    price: 549,
    category: 'Line Art',
    sizes: [
      { label: 'A4', price: 549 },
      { label: 'A3', price: 949 },
      { label: 'A2', price: 1499 }
    ],
    finish: 'matte',
    imageUrl: '/images/lineart-contour-figure.jpg',
    featured: true
  },
  {
    title: 'Dune Silence',
    slug: 'dune-silence',
    description: 'Wind-carved desert crests cast under low morning sun. Monochromatic gradients and peaceful horizons that ground minimalist dining areas and hallways.',
    price: 649,
    category: 'Landscape',
    sizes: [
      { label: 'A4', price: 649 },
      { label: 'A3', price: 1099 },
      { label: 'A2', price: 1699 }
    ],
    finish: 'matte',
    imageUrl: '/images/landscape-dune-silence.jpg',
    featured: true
  },
  {
    title: 'Form & Void Bauhaus Study',
    slug: 'form-void-bauhaus-study',
    description: 'Editorial typographic specimen exploring modern Swiss grid principles, proportion, and quiet typographic rhythm. A homage to rationalist composition.',
    price: 499,
    category: 'Typography',
    sizes: [
      { label: 'A4', price: 499 },
      { label: 'A3', price: 899 },
      { label: 'A2', price: 1399 }
    ],
    finish: 'gloss laminated',
    imageUrl: '/images/typography-form-void.jpg',
    featured: true
  },
  {
    title: 'Monolith in Silence',
    slug: 'monolith-in-silence',
    description: 'A study in weight and pigment density. Rich warm tones balanced with unprinted canvas space, referencing classical European oil sketches.',
    price: 799,
    category: 'Abstract',
    sizes: [
      { label: 'A4', price: 799 },
      { label: 'A3', price: 1299 },
      { label: 'A2', price: 1899 }
    ],
    finish: 'matte',
    imageUrl: '/images/abstract-monolith.jpg',
    featured: false
  },
  {
    title: 'Terracotta Equilibrium',
    slug: 'terracotta-equilibrium',
    description: 'Curved organic volume suspended over negative void. Gentle earthy terracotta hues designed to harmonize with oak, birch, and travertine textures.',
    price: 699,
    category: 'Abstract',
    sizes: [
      { label: 'A4', price: 699 },
      { label: 'A3', price: 1149 },
      { label: 'A2', price: 1749 }
    ],
    finish: 'gloss laminated',
    imageUrl: '/images/abstract-terracotta.jpg',
    featured: false
  },
  {
    title: 'Olive Branch Monograph',
    slug: 'olive-branch-monograph',
    description: 'Sun-dappled foliage and Mediterranean olive branch silhouetted against chalky limestone. A warm, timeless botanic print.',
    price: 599,
    category: 'Botanical',
    sizes: [
      { label: 'A4', price: 599 },
      { label: 'A3', price: 999 },
      { label: 'A2', price: 1549 }
    ],
    finish: 'matte',
    imageUrl: '/images/botanical-olive-branch.jpg',
    featured: false
  },
  {
    title: 'Eucalyptus & Shadow',
    slug: 'eucalyptus-and-shadow',
    description: 'Silver-dollar eucalyptus stems creating rhythmic linear shadows across soft beige plaster. Clean, calming flora study.',
    price: 549,
    category: 'Botanical',
    sizes: [
      { label: 'A4', price: 549 },
      { label: 'A3', price: 949 },
      { label: 'A2', price: 1499 }
    ],
    finish: 'gloss laminated',
    imageUrl: '/images/botanical-eucalyptus.jpg',
    featured: false
  },
  {
    title: 'Exhibition Pavilion 1923',
    slug: 'exhibition-pavilion-1923',
    description: 'Archival modernist exhibition poster inspired by European avant-garde typography. Bold yet restrained composition with generous white borders.',
    price: 499,
    category: 'Typography',
    sizes: [
      { label: 'A4', price: 499 },
      { label: 'A3', price: 899 },
      { label: 'A2', price: 1399 }
    ],
    finish: 'matte',
    imageUrl: '/images/typography-exhibition-23.jpg',
    featured: false
  },
  {
    title: 'Geometry of Ascend No. 7',
    slug: 'geometry-of-ascend-no-7',
    description: 'Brutalist concrete steps and directional shadow study. Clean diagonals that add architectural depth to modern workspaces and entryways.',
    price: 699,
    category: 'Architecture',
    sizes: [
      { label: 'A4', price: 699 },
      { label: 'A3', price: 1199 },
      { label: 'A2', price: 1799 }
    ],
    finish: 'matte',
    imageUrl: '/images/arch-concrete-steps.jpg',
    featured: false
  },
  {
    title: 'Coastal Horizon No. 4',
    slug: 'coastal-horizon-no-4',
    description: 'Pale tide reflections and sea foam line beneath morning overcast skies. Minimal seascape rendered in soft oyster and charcoal tones.',
    price: 649,
    category: 'Landscape',
    sizes: [
      { label: 'A4', price: 649 },
      { label: 'A3', price: 1099 },
      { label: 'A2', price: 1699 }
    ],
    finish: 'gloss laminated',
    imageUrl: '/images/landscape-coastal-mist.jpg',
    featured: false
  },
  {
    title: 'Nordic Ridge Study',
    slug: 'nordic-ridge-study',
    description: 'Layered mountain silhouettes fading into morning horizon mist. A peaceful atmospheric landscape for bedrooms and study corners.',
    price: 699,
    category: 'Landscape',
    sizes: [
      { label: 'A4', price: 699 },
      { label: 'A3', price: 1149 },
      { label: 'A2', price: 1749 }
    ],
    finish: 'matte',
    imageUrl: '/images/landscape-nordic-ridge.jpg',
    featured: false
  },
  {
    title: 'Gestural Silhouette',
    slug: 'gestural-silhouette',
    description: 'Expressive charcoal gesture capturing form and delicate balance. Minimalist figurative line work suited for gallery-style wall arrangements.',
    price: 549,
    category: 'Line Art',
    sizes: [
      { label: 'A4', price: 549 },
      { label: 'A3', price: 949 },
      { label: 'A2', price: 1499 }
    ],
    finish: 'matte',
    imageUrl: '/images/lineart-gestural-hands.jpg',
    featured: false
  }
];

const seedDatabase = async () => {
  try {
    await connectDB();

    console.log('[Seed] Clearing existing posters...');
    await Poster.deleteMany({});

    console.log(`[Seed] Inserting ${postersData.length} curated posters...`);
    const inserted = await Poster.insertMany(postersData);

    console.log(`[Seed] Successfully inserted ${inserted.length} posters across all categories.`);
    console.log('[Seed] Featured posters:', inserted.filter(p => p.featured).length);

    await mongoose.connection.close();
    console.log('[Seed] Database connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error.message);
    process.exit(1);
  }
};

seedDatabase();
