const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- Cleaning database for POP DIY TOYS pivot ---');
  await prisma.auditLog.deleteMany({});
  await prisma.supportTicket.deleteMany({});
  await prisma.shipmentTracking.deleteMany({});
  await prisma.shipment.deleteMany({});
  await prisma.orderReturn.deleteMany({});
  await prisma.refund.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.couponUsage.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.cartItem.deleteMany({});
  await prisma.cart.deleteMany({});
  await prisma.wishlistItem.deleteMany({});
  await prisma.wishlist.deleteMany({});
  await prisma.inventory.deleteMany({});
  await prisma.productVariant.deleteMany({});
  await prisma.productImage.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.subcategory.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.brand.deleteMany({});
  await prisma.warehouse.deleteMany({});
  await prisma.coupon.deleteMany({});
  await prisma.banner.deleteMany({});
  await prisma.websiteSetting.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.address.deleteMany({});
  await prisma.customerProfile.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('--- Seeding Users and Roles ---');
  const superAdmin = await prisma.user.create({
    data: {
      email: 'admin@almarto.com',
      passwordHash: 'admin123',
      name: 'Almarto Pop Toys Admin',
      phone: '+91 99000 11223',
      role: 'SUPER_ADMIN',
      isActive: true,
    },
  });

  const customerUser = await prisma.user.create({
    data: {
      email: 'customer@almarto.com',
      passwordHash: 'customer123',
      name: 'Aarav Sharma',
      phone: '+91 98765 43210',
      role: 'CUSTOMER',
      isActive: true,
      profile: {
        create: {
          gender: 'Male',
          loyaltyPoints: 450,
        },
      },
    },
  });

  console.log('--- Seeding Customer Address ---');
  await prisma.address.create({
    data: {
      userId: customerUser.id,
      fullName: 'Aarav Sharma',
      phone: '9876543210',
      pincode: '560001',
      flatHouse: 'Flat 402, Royal Palms Residency',
      areaColony: 'MG Road, Ashok Nagar',
      landmark: 'Near Trinity Metro Station',
      city: 'Bengaluru',
      state: 'Karnataka',
      addressType: 'HOME',
      isDefault: true,
    },
  });

  console.log('--- Seeding Warehouses ---');
  const whBangalore = await prisma.warehouse.create({
    data: {
      name: 'Almarto Pop Toys Central Hub',
      code: 'WH-BLR-01',
      address: 'Plot 18, Toy Studio Park, Electronic City',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560100',
      contactPerson: 'Karthik Toymaster',
      contactPhone: '+91 98450 12345',
    },
  });

  console.log('--- Seeding Pop DIY Toy Brands ---');
  const brandsData = [
    { name: 'PopCraft Studios', slug: 'popcraft-studios', isFeatured: true, description: 'Premium DIY vinyl pop figures and customizable art toys' },
    { name: 'KawaiiLab DIY', slug: 'kawaiilab-diy', isFeatured: true, description: 'Japanese-inspired cute pop DIY kits and mystery blind boxes' },
    { name: 'MiniVerse Craft', slug: 'miniverse-craft', isFeatured: true, description: 'Handcrafted miniature room dioramas and pop dollhouses' },
    { name: 'PixelPop Bricks', slug: 'pixelpop-bricks', isFeatured: true, description: 'Assemble-your-own pop art block figurines & cyberpunk mechs' },
    { name: 'GlowArt Toys', slug: 'glowart-toys', isFeatured: false, description: 'Glow-in-the-dark and sensory pop fidget craft sets' },
  ];

  const brandMap = {};
  for (const b of brandsData) {
    const created = await prisma.brand.create({ data: b });
    brandMap[b.slug] = created;
  }

  console.log('--- Seeding POP DIY Toy Categories ---');
  const categoriesData = [
    {
      name: 'Paint-Your-Own Vinyl Pop',
      slug: 'paint-your-own-vinyl',
      icon: 'Palette',
      isFeatured: true,
      displayOrder: 1,
      image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&auto=format&fit=crop&q=80',
      description: 'Blank matte vinyl figures with non-toxic acrylic paints, detailing brushes, and palettes for custom designer art toys.',
      subcategories: ['Anime & Chibi Vinyls', 'Cute Animals & Pets', 'Urban Art Figurines', 'Glow & Metallic Kits'],
    },
    {
      name: 'DIY Mystery Blind Boxes',
      slug: 'diy-mystery-blind-boxes',
      icon: 'Gift',
      isFeatured: true,
      displayOrder: 2,
      image: 'https://images.unsplash.com/photo-1558679908-541bcf1249ff?w=600&auto=format&fit=crop&q=80',
      description: 'Surprise pop toy kits with secret assembly parts, rare collector accessories, and customizable sticker decals.',
      subcategories: ['Fantasy Series 1', 'Cyber Monster Series', 'Space Explorers', 'Secret Chase Editions'],
    },
    {
      name: 'Miniature Pop Dioramas',
      slug: 'miniature-pop-dioramas',
      icon: 'Home',
      isFeatured: true,
      displayOrder: 3,
      image: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=600&auto=format&fit=crop&q=80',
      description: 'Intricately detailed build-it-yourself miniature rooms, pop book-nooks, cafes, and light-up acrylic display cases.',
      subcategories: ['Pop Book Nooks', 'Mini Coffee Shops', 'Anime Streetscapes', 'Cozy Bedrooms'],
    },
    {
      name: 'Pop Brick & Mech Kits',
      slug: 'pop-brick-mech-kits',
      icon: 'Boxes',
      isFeatured: true,
      displayOrder: 4,
      image: 'https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?w=600&auto=format&fit=crop&q=80',
      description: 'Buildable modular pop art characters, retro arcade machines, and articulated robotic pop statues.',
      subcategories: ['Retro Gaming Pops', 'Articulated Mechs', 'Botanical Pop Pots', 'Pop Head Sculptures'],
    },
    {
      name: 'Pop Beads & Craft Studio',
      slug: 'pop-beads-craft-studio',
      icon: 'Sparkles',
      isFeatured: false,
      displayOrder: 5,
      image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=600&auto=format&fit=crop&q=80',
      description: 'Snap-together pop beads, jewelry designer studios, and keychain charms with zero glue required.',
      subcategories: ['Snap Pop Beads', 'DIY Bag Charms', 'Clay Figure Accents', 'Glow Charms'],
    },
    {
      name: 'Sensory & Fidget DIYs',
      slug: 'sensory-fidget-diys',
      icon: 'Smile',
      isFeatured: false,
      displayOrder: 6,
      image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&auto=format&fit=crop&q=80',
      description: 'Make-your-own squishy pop toys, sensory bubble fidget sculptures, and crystal clay mold creations.',
      subcategories: ['Custom Squishy Kits', 'Pop Bubble Sculptures', 'Crystal Gel Molds'],
    },
  ];

  const categoryMap = {};
  for (const cat of categoriesData) {
    const createdCat = await prisma.category.create({
      data: {
        name: cat.name,
        slug: cat.slug,
        icon: cat.icon,
        isFeatured: cat.isFeatured,
        displayOrder: cat.displayOrder,
        image: cat.image,
        description: cat.description,
      },
    });
    categoryMap[cat.slug] = createdCat;

    for (const sub of cat.subcategories) {
      const subSlug = `${cat.slug}-${sub.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
      await prisma.subcategory.create({
        data: {
          categoryId: createdCat.id,
          name: sub,
          slug: subSlug,
        },
      });
    }
  }

  console.log('--- Seeding POP DIY TOY Products ---');
  const products = [
    {
      title: 'PopCraft Studio: Paint-Your-Own Vinyl Pop Dragon (8-Inch DIY Master Kit)',
      slug: 'popcraft-paint-your-own-vinyl-dragon-diy-kit',
      sku: 'POP-DIY-DRG-01',
      categorySlug: 'paint-your-own-vinyl',
      brandSlug: 'popcraft-studios',
      mrp: 2499,
      price: 1499,
      discountPercent: 40,
      rating: 4.9,
      reviewCount: 482,
      stock: 45,
      isFeatured: true,
      isTrending: true,
      isBestSeller: true,
      isDealOfTheDay: true,
      dealEndTime: new Date(Date.now() + 86400000 * 2),
      shortDescription: 'Blank matte vinyl dragon figure with 12 rich acrylic paints, 3 pro detailing brushes, and gloss sealer.',
      description: 'Unleash your inner toy artist! The PopCraft Studio Vinyl Dragon is cast in smooth, primer-ready white vinyl. Customize every scale, horn, and wing with our premium non-toxic acrylic paints. Complete with fine-tip detailing brushes and a gloss topcoat to preserve your masterpiece for gallery display.',
      warrantyInfo: '100% Non-Toxic & Safe - Child & Adult Certified',
      sellerName: 'Almarto Pop Studio Direct',
      highlights: JSON.stringify([
        'Includes 8-inch Blank Matte White Vinyl Pop Dragon Figure',
        '12 High-Pigment Acrylic Paint Pots (Mixable & Quick-Drying)',
        '3 Ergonomic Fine-Tip Detailing Brushes (Sizes 0, 1, 2)',
        '1 Clear Protective Gloss Sealant Varnish for permanent shine',
        'Illustrated Color Theory & Technique Guidebook included',
        'Sturdy acrylic magnetic display base'
      ]),
      specifications: JSON.stringify({
        'Difficulty Level': 'Beginner to Intermediate (All Skill Levels)',
        'Figure Height': '8.2 Inches (21 cm)',
        'Material': 'BPA-Free Eco Matte Vinyl',
        'Drying Time': '20-30 Minutes per coat',
        'In the Box': '1x Vinyl Figure, 12x Paints, 3x Brushes, 1x Palette, 1x Varnish, 1x Manual'
      }),
      images: [
        'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=800&auto=format&fit=crop&q=80',
      ],
      variants: [
        { title: 'Standard Edition (12 Paints)', sku: 'POP-DIY-DRG-STD', price: 1499, mrp: 2499, stock: 30 },
        { title: 'Deluxe Metallic Edition (12 Paints + 6 Metallic/Glow)', sku: 'POP-DIY-DRG-DLX', price: 1899, mrp: 2999, stock: 15 },
      ]
    },
    {
      title: 'KawaiiLab: Mystery DIY Pop Blind Box (Series 1 - Mythical Forest Spirits)',
      slug: 'kawaiilab-mystery-diy-pop-blind-box-series-1',
      sku: 'POP-BLIND-SER1',
      categorySlug: 'diy-mystery-blind-boxes',
      brandSlug: 'kawaiilab-diy',
      mrp: 1299,
      price: 799,
      discountPercent: 38,
      rating: 4.8,
      reviewCount: 890,
      stock: 80,
      isFeatured: true,
      isTrending: true,
      isBestSeller: true,
      isDealOfTheDay: true,
      dealEndTime: new Date(Date.now() + 86400000 * 3),
      shortDescription: 'Unbox 1 of 8 mystery DIY creature figures to assemble, paint, and accessorize with secret foil pouches.',
      description: 'The excitement of blind boxes meets the joy of DIY crafting! Each sealed collector box contains 1 random mythical creature figure waiting for your creative touch, along with miniature craft paints, sticker decals, and a secret collector card.',
      warrantyInfo: 'Guaranteed Authentic KawaiiLab Sealed Box',
      sellerName: 'KawaiiLab Official Store',
      highlights: JSON.stringify([
        '1 Sealed Surprise Pop Toy Figure (Chance of 1:72 Rare Golden Chase Edition)',
        'Snap-fit assembly parts with articulating head and arms',
        '4 Themed Pastel Mini Acrylic Paint Pots & detail applicator',
        'Holographic custom eye decals and accessory stickers',
        'Collector Card with character lore and display stand'
      ]),
      specifications: JSON.stringify({
        'Difficulty Level': 'Easy & Fun (Ages 6+)',
        'Figure Height': '3.5 - 4 Inches',
        'Series Characters': '8 Regular Designs + 1 Secret Golden Kitsune',
        'In the Box': '1x Mystery Figure, 4x Paints, 1x Brush, 1x Decal Sheet, 1x Card'
      }),
      images: [
        'https://images.unsplash.com/photo-1558679908-541bcf1249ff?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80',
      ],
      variants: [
        { title: 'Single Blind Box', sku: 'POP-BLIND-SGL', price: 799, mrp: 1299, stock: 60 },
        { title: 'Full Set Case (8 Blind Boxes - Guaranteed No Duplicates)', sku: 'POP-BLIND-CASE8', price: 5499, mrp: 10392, stock: 20 },
      ]
    },
    {
      title: 'MiniVerse Craft: Kyoto Pop Tea House Miniature DIY Diorama with LED Lights',
      slug: 'miniverse-kyoto-pop-tea-house-miniature-diorama',
      sku: 'POP-DIO-KYO-01',
      categorySlug: 'miniature-pop-dioramas',
      brandSlug: 'miniverse-craft',
      mrp: 3999,
      price: 2499,
      discountPercent: 37,
      rating: 4.9,
      reviewCount: 310,
      stock: 25,
      isFeatured: true,
      isTrending: true,
      isBestSeller: false,
      isDealOfTheDay: false,
      shortDescription: 'Build a cozy Japanese Pop Tea House complete with tatami mats, tiny teapot, sliding shoji screens & warm LED lamps.',
      description: 'Escape into miniature bliss! Craft every tiny piece of this traditional Japanese tea house. Features precision laser-cut eco-wood pieces, realistic fabric cushions, paper lanterns, and a battery-powered LED lighting circuit that bathes the miniature room in warm amber light.',
      warrantyInfo: 'Missing piece free replacement guarantee',
      sellerName: 'MiniVerse Artisans',
      highlights: JSON.stringify([
        'Precision laser-cut basswood panels with snap & glue fit',
        'Working Warm LED Ambient Lighting with hidden switch',
        'Over 85 detailed miniature items (cups, scrolls, plants, teapot)',
        'Dust-proof acrylic transparent display case included',
        'Full color step-by-step assembly manual with 1:1 scale diagrams'
      ]),
      specifications: JSON.stringify({
        'Difficulty Level': 'Intermediate (Estimated 6-8 Hours Build)',
        'Assembled Dimensions': '19cm x 15cm x 16.5cm',
        'Lighting': 'Warm LED (2x AAA Batteries required, not included)',
        'Materials': 'Wood, Fabric, Paper, Resin, Metal, Acrylic Case'
      }),
      images: [
        'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&auto=format&fit=crop&q=80',
      ],
      variants: []
    },
    {
      title: 'PixelPop Bricks: Cyber Samurai Pop Mech (650-Piece Articulated DIY Figure)',
      slug: 'pixelpop-cyber-samurai-pop-mech-brick-kit',
      sku: 'POP-BRK-CYB-01',
      categorySlug: 'pop-brick-mech-kits',
      brandSlug: 'pixelpop-bricks',
      mrp: 2999,
      price: 1799,
      discountPercent: 40,
      rating: 4.7,
      reviewCount: 520,
      stock: 35,
      isFeatured: true,
      isTrending: false,
      isBestSeller: true,
      isDealOfTheDay: true,
      dealEndTime: new Date(Date.now() + 86400000 * 1.5),
      shortDescription: 'Assemble a badass cyberpunk samurai pop figure with articulated joints, dual energy katana blades, and display plaque.',
      description: 'Build your own cybernetic warrior! PixelPop Bricks brings high-octane anime style to modular brick building. Features 24 points of poseable articulation, glowing neon transparent accents, and a removable samurai battle helmet.',
      warrantyInfo: 'Guaranteed no missing bricks with instant replacement',
      sellerName: 'PixelPop Official Hub',
      highlights: JSON.stringify([
        '650 High-Tolerance Precision Building Bricks',
        'Fully poseable ball-joint articulation in shoulders, knees, and fingers',
        'Dual translucent neon energy katanas and back-scabbard',
        'Custom engraved collector display stand with numbered plaque',
        'Universal compatibility with standard major building bricks'
      ]),
      specifications: JSON.stringify({
        'Piece Count': '650 Pieces',
        'Assembled Height': '10.5 Inches (26 cm)',
        'Difficulty': 'Moderate (Ages 8+)',
        'Material': 'High-Grade ABS Plastic'
      }),
      images: [
        'https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1563089145-599997674d42?w=800&auto=format&fit=crop&q=80',
      ],
      variants: []
    },
    {
      title: 'PopCraft Studio: DIY Blank Vinyl Bear Pop & Fluid Pouring Art Kit',
      slug: 'popcraft-diy-blank-vinyl-bear-fluid-pouring-art-kit',
      sku: 'POP-DIY-BEAR-01',
      categorySlug: 'paint-your-own-vinyl',
      brandSlug: 'popcraft-studios',
      mrp: 1999,
      price: 1199,
      discountPercent: 40,
      rating: 4.8,
      reviewCount: 1140,
      stock: 75,
      isFeatured: true,
      isTrending: true,
      isBestSeller: true,
      isDealOfTheDay: false,
      shortDescription: 'Viral DIY fluid bear art kit with 9-inch vinyl bear, 3 marbled pouring paints, apron, and drip tray.',
      description: 'Create your very own viral marbled pop art bear! Simply mix the vibrant acrylic pouring fluid, pour over the poseable 9-inch vinyl bear, and watch hypnotic, one-of-a-kind marble patterns form before your eyes. No painting skill required!',
      warrantyInfo: 'Non-Toxic Water-Based Paints',
      sellerName: 'Almarto Pop Studio Direct',
      highlights: JSON.stringify([
        '9-Inch Poseable Blank Vinyl Art Bear Figure',
        '3 Custom Fluid Acrylic Pouring Paints (Purple, Neon Orange, Pure White)',
        'Includes mixing cups, stirrers, protective gloves, and tabletop apron',
        'Deep mess-free cardboard drying and display drip tray',
        'Dries to an ultra-shiny porcelain-like ceramic finish'
      ]),
      specifications: JSON.stringify({
        'Bear Height': '9 Inches (23 cm)',
        'Color Theme': 'Royal Purple & Electric Orange Galaxy Swirl',
        'Drying Time': '24 Hours full cure',
        'Skill Level': 'Absolute Beginner (All Ages)'
      }),
      images: [
        'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800&auto=format&fit=crop&q=80',
      ],
      variants: [
        { title: 'Royal Purple & Orange Swirl', sku: 'POP-BEAR-PUR-ORG', price: 1199, mrp: 1999, stock: 45 },
        { title: 'Neon Cyber Glow Swirl', sku: 'POP-BEAR-CYB-GLW', price: 1399, mrp: 2199, stock: 30 },
      ]
    },
    {
      title: 'KawaiiLab: DIY Clay Pop Dessert Animals Workshop Kit',
      slug: 'kawaiilab-diy-clay-pop-dessert-animals-kit',
      sku: 'POP-CLY-DST-01',
      categorySlug: 'pop-beads-craft-studio',
      brandSlug: 'kawaiilab-diy',
      mrp: 1499,
      price: 899,
      discountPercent: 40,
      rating: 4.7,
      reviewCount: 390,
      stock: 50,
      isFeatured: false,
      isTrending: true,
      isBestSeller: false,
      isDealOfTheDay: false,
      shortDescription: 'Super-soft air-dry clay kit to sculpt 12 adorable pop animal macarons, donuts & bobas with keyring clips.',
      description: 'Sculpt ultra-cute pop figures with feather-light, non-sticky magic air-dry clay! Comes with 10 vibrant clay colors, silicone sculpting molds, metal keyring attachments, and glossy finish glaze.',
      warrantyInfo: 'Safe & Odorless Certified Clay',
      sellerName: 'KawaiiLab Official Store',
      highlights: JSON.stringify([
        '10 Resealable Packs of Ultra-Light Air Dry Magic Clay',
        'Non-sticky, mess-free, and dries soft without baking',
        '3 Multi-Shape Silicone Pop Molds and 4 Plastic Sculpting Tools',
        '12 Silver Keyring Chains & Swivel Hooks to turn clay into backpack charms',
        'Full color step-by-step sculpting recipe book'
      ]),
      specifications: JSON.stringify({
        'Clay Weight': '350 grams total',
        'Drying Time': 'Air dries in 24 hours (No oven required)',
        'Difficulty': 'Easy (Ages 5+ to Adult Craft Lovers)'
      }),
      images: [
        'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=800&auto=format&fit=crop&q=80',
      ],
      variants: []
    },
    {
      title: 'GlowArt: DIY Glow-In-The-Dark Galactic Pop Slime & Crystal Terrarium',
      slug: 'glowart-diy-galactic-pop-slime-crystal-terrarium',
      sku: 'POP-GLW-SLM-01',
      categorySlug: 'sensory-fidget-diys',
      brandSlug: 'glowart-toys',
      mrp: 1699,
      price: 999,
      discountPercent: 41,
      rating: 4.6,
      reviewCount: 620,
      stock: 40,
      isFeatured: false,
      isTrending: false,
      isBestSeller: true,
      isDealOfTheDay: false,
      shortDescription: 'Compound your own glowing galactic slime with pop crystals, alien figurines, and UV blacklight keychain.',
      description: 'A sensory pop DIY experience out of this world! Mix crystal slime bases with glowing stardust pigments, insert collectible mini alien pop figurines into your clear globe terrarium, and charge it with the included UV light.',
      warrantyInfo: 'Washable & Non-Toxic Formula',
      sellerName: 'GlowArt India',
      highlights: JSON.stringify([
        '2 Glow-in-the-dark Slime bases with activator bottles',
        'Includes 4 collectible miniature alien & space explorer pop figurines',
        'Crystal faceted display dome with wooden LED light-up base',
        'Micro UV mini blacklight keychain torch included',
        'Zero-mess formula, washes off easily with warm water'
      ]),
      specifications: JSON.stringify({
        'Dome Dimensions': '12cm diameter x 14cm height',
        'Glow Duration': 'Charges in seconds, glows for hours in dark',
        'Age Suitability': 'Ages 6 to 99'
      }),
      images: [
        'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800&auto=format&fit=crop&q=80',
      ],
      variants: []
    },
    {
      title: 'MiniVerse Craft: DIY Cyberpunk Pop Ramen Bar Miniature Book Nook',
      slug: 'miniverse-cyberpunk-pop-ramen-bar-book-nook',
      sku: 'POP-DIO-RAM-01',
      categorySlug: 'miniature-pop-dioramas',
      brandSlug: 'miniverse-craft',
      mrp: 4499,
      price: 2899,
      discountPercent: 35,
      rating: 4.9,
      reviewCount: 420,
      stock: 20,
      isFeatured: true,
      isTrending: true,
      isBestSeller: false,
      isDealOfTheDay: true,
      dealEndTime: new Date(Date.now() + 86400000 * 2.5),
      shortDescription: 'Sensational bookshelf insert featuring a glowing neon alleyway, miniature steaming ramen bowls, and vending machines.',
      description: 'Turn your bookshelf into an enchanting Tokyo cyberpunk night scene! This DIY Book Nook kit slots right between your books on the shelf. Features motion-sensing internal LED lights that turn on automatically when you walk by.',
      warrantyInfo: 'Full replacement guarantee for any transit damages',
      sellerName: 'MiniVerse Artisans',
      highlights: JSON.stringify([
        'Intricate 3D wooden puzzle book nook with 280 precision pieces',
        'Interactive infrared body motion sensor turns on neon lights automatically',
        'Mirror alleyway trick creates an infinite glowing street illusion',
        'Detailed mini ramen bar, vending machine, neon signs, and cat figurine',
        'Fits seamlessly on any standard library bookshelf'
      ]),
      specifications: JSON.stringify({
        'Assembled Size': '24.5cm H x 18.2cm D x 8cm W',
        'Sensor Type': 'Infrared Human Motion Sensor (1-2m range)',
        'Power': '3x AA Batteries (not included)',
        'Estimated Assembly': '5-7 Hours'
      }),
      images: [
        'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=800&auto=format&fit=crop&q=80',
      ],
      variants: []
    }
  ];

  const createdProducts = [];
  for (const p of products) {
    const category = categoryMap[p.categorySlug];
    const brand = p.brandSlug ? brandMap[p.brandSlug] : null;

    const createdProd = await prisma.product.create({
      data: {
        title: p.title,
        slug: p.slug,
        sku: p.sku,
        categoryId: category.id,
        brandId: brand ? brand.id : null,
        mrp: p.mrp,
        price: p.price,
        discountPercent: p.discountPercent,
        taxRate: 18.0,
        stock: p.stock,
        lowStockThreshold: 10,
        rating: p.rating,
        reviewCount: p.reviewCount,
        isFeatured: p.isFeatured,
        isTrending: p.isTrending,
        isBestSeller: p.isBestSeller,
        isDealOfTheDay: p.isDealOfTheDay,
        dealEndTime: p.dealEndTime || null,
        shortDescription: p.shortDescription,
        description: p.description,
        warrantyInfo: p.warrantyInfo,
        sellerName: p.sellerName,
        highlights: p.highlights,
        specifications: p.specifications,
        status: 'PUBLISHED',
      },
    });

    for (let i = 0; i < p.images.length; i++) {
      await prisma.productImage.create({
        data: {
          productId: createdProd.id,
          url: p.images[i],
          altText: p.title,
          isPrimary: i === 0,
          displayOrder: i,
        },
      });
    }

    if (p.variants && p.variants.length > 0) {
      for (const v of p.variants) {
        await prisma.productVariant.create({
          data: {
            productId: createdProd.id,
            title: v.title,
            sku: v.sku,
            price: v.price,
            mrp: v.mrp,
            stock: v.stock,
          },
        });
      }
    }

    await prisma.inventory.create({
      data: {
        productId: createdProd.id,
        warehouseId: whBangalore.id,
        quantityAvailable: p.stock,
        quantityReserved: 1,
      },
    });

    createdProducts.push(createdProd);
  }

  console.log('--- Seeding Verified Customer Reviews for Pop DIY Toys ---');
  await prisma.review.create({
    data: {
      productId: createdProducts[0].id, // Paint-Your-Own Dragon
      userId: customerUser.id,
      rating: 5,
      title: 'Best creative weekend project ever!',
      comment: 'The vinyl quality is top notch and the paints are so pigmented. My dragon looks like an expensive art collectible on my desk now. 10/10 recommend!',
      isVerifiedPurchase: true,
      helpfulCount: 38,
    },
  });

  await prisma.review.create({
    data: {
      productId: createdProducts[1].id, // Mystery Blind Box
      userId: customerUser.id,
      rating: 5,
      title: 'Got the rare golden kitsune!',
      comment: 'The unboxing experience was pure joy. Snapped together easily and the mini paints were surprisingly good quality.',
      isVerifiedPurchase: true,
      helpfulCount: 19,
    },
  });

  console.log('--- Seeding Pop Toy Discount Coupons ---');
  await prisma.coupon.create({
    data: {
      code: 'ALMARTO500',
      type: 'FIXED',
      value: 500,
      minOrderValue: 1999,
      maxDiscount: 500,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 86400000 * 60),
      isActive: true,
      description: 'Flat ₹500 off on Pop DIY Toy orders above ₹1,999',
    },
  });

  await prisma.coupon.create({
    data: {
      code: 'POPTOY15',
      type: 'PERCENTAGE',
      value: 15,
      minOrderValue: 999,
      maxDiscount: 600,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 86400000 * 60),
      isActive: true,
      description: '15% off on your DIY Pop Toy collection',
    },
  });

  console.log('--- Seeding Website Settings for Pop Toys ---');
  const settings = [
    { key: 'store_name', value: 'ALMARTO POP DIY', group: 'STORE' },
    { key: 'store_tagline', value: 'India’s Premier Pop DIY Toys & Designer Craft Universe', group: 'STORE' },
    { key: 'support_email', value: 'support@almarto.com', group: 'STORE' },
    { key: 'support_phone', value: '+91 1800 123 2562', group: 'STORE' },
    { key: 'business_gstin', value: '29AAACA1234M1Z5', group: 'TAX' },
    { key: 'free_shipping_threshold', value: '499', group: 'SHIPPING' },
    { key: 'standard_shipping_charge', value: '49', group: 'SHIPPING' },
    { key: 'express_shipping_charge', value: '99', group: 'SHIPPING' },
    { key: 'default_courier', value: 'DELHIVERY', group: 'SHIPPING' },
    { key: 'payment_razorpay_mode', value: 'TEST', group: 'PAYMENT' },
    { key: 'announcement_bar_enabled', value: 'false', group: 'GENERAL' }, // Explicitly disabled per user request
    { key: 'announcement_bar_text', value: '', group: 'GENERAL' },
    { key: 'marquee_enabled', value: 'true', group: 'STORE' },
    { key: 'marquee_text', value: 'jai ballayya ', group: 'STORE' },
    { key: 'marquee_theme', value: 'gradient', group: 'STORE' },
    { key: 'marquee_speed', value: 'fast', group: 'STORE' },
    { key: 'marquee_link', value: '/products', group: 'STORE' },
  ];

  for (const s of settings) {
    await prisma.websiteSetting.create({ data: s });
  }

  console.log('🎉 POP DIY Toys Database Seeding successfully completed!');
}

main()
  .catch((e) => {
    console.error('Seed Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
