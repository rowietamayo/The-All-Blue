import { db, chefsTable, menuItemsTable, reviewsTable, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

async function main() {
  console.log("Seeding database (non-destructive)...");

  // ── Admin user ───────────────────────────────────────────────────────────────
  // Only insert if the admin phone doesn't already exist.
  const adminPhone = process.env.ADMIN_PHONE || "1234567890";
  const existingAdmin = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.phone, adminPhone));

  if (existingAdmin.length === 0) {
    console.log("Inserting admin user...");
    await db.insert(usersTable).values({
      phone: adminPhone,
      name: "Admin Sanji",
      role: "admin",
    });
  } else {
    console.log("Admin user already exists, skipping.");
  }

  // ── Chefs ────────────────────────────────────────────────────────────────────
  // Only seed chefs if the table is empty.
  const existingChefs = await db.select().from(chefsTable);
  if (existingChefs.length === 0) {
    console.log("Inserting default chefs...");
    await db.insert(chefsTable).values([
      {
        name: '"Black Leg" Sanji',
        specialty: "Flambé & Master Seafood",
        bio: "Founder and executive chef of All Blue, the world's most celebrated oceanfront restaurant, he combines ingredients and culinary traditions from every sea into unforgettable dining experiences. Renowned for his extraordinary cooking skills, impeccable hospitality, and unwavering respect for food, Sanji has become a living legend among chefs worldwide.",
        yearsExperience: 12,
        imageUrl: "https://ik.imagekit.io/8mmiwepdm/all-blue/chefs/08b342ff-f4c6-46e6-94f4-bc435fb98bbc-1780376526969_PfHFOFXLz.png",
      },
      {
        name: '"Red Leg" Zeff',
        specialty: "Fine dining cuisine, seafood dishes",
        bio: "The legendary head chef and owner of the Baratie, Zeff is a stern yet deeply respected culinary master known throughout the seas for his exceptional skill and uncompromising standards. Recognizable by his towering chef's hat, braided mustache, and imposing presence, he commands the kitchen with discipline and authority.",
        yearsExperience: 45,
        imageUrl: "https://ik.imagekit.io/8mmiwepdm/all-blue/chefs/ee1f0feb-6280-4dd9-9f86-c7e8a38cd3b3-1780377247172_Xu3rYSTza.png",
      },
      {
        name: "Cosette",
        specialty: "Cook",
        bio: "A talented young cook. Cosette is known for her gentle nature, dedication, and love for cooking.",
        yearsExperience: 0,
        imageUrl: "https://ik.imagekit.io/8mmiwepdm/all-blue/chefs/5b81e473-382b-4a5e-b191-1a23c820720f-1780376548509_rIxgWjtKE.png",
      },
      {
        name: "Charlotte Chiffon",
        specialty: "Signature Chiffon Cakes and Artisan Pastries",
        bio: "Skilled pastry chef who combines creativity, precision, and passion to create memorable desserts. Known for her friendly nature and dedication to quality, she brings sweetness and joy to every dish she prepares.",
        yearsExperience: 0,
        imageUrl: "https://ik.imagekit.io/8mmiwepdm/all-blue/chefs/023b5b28-6e8e-4167-8b22-09af752f9c68-1780375671343_P0hmhEpYK.png",
      },
      {
        name: "Charlotte Lola",
        specialty: "Chocolate Artisan and Pastry Chef",
        bio: "Twin sister of Chiffon, she is a passionate pastry chef known for her emotional depth and master chocolate-making skills.",
        yearsExperience: 0,
        imageUrl: "https://ik.imagekit.io/8mmiwepdm/all-blue/chefs/ab85dc26-e1d4-4d2e-820a-0c209a39a51b-1780374918093_LuWlEpKux.png",
      },
      {
        name: "Patty",
        specialty: "Seafood Entrées, Grill Techniques",
        bio: "A veteran chef of the Baratie, Patty is renowned for his immense strength, fierce temper, and unwavering dedication to the culinary arts.",
        yearsExperience: 0,
        imageUrl: "https://ik.imagekit.io/8mmiwepdm/all-blue/chefs/6e22d54c-97bf-4bff-a6cb-be6206316066-1780378012046_p91HyME1A.png",
      },
      {
        name: "Carne",
        specialty: "Knife Skills, Ingredient Preparation, Butchery",
        bio: "Skilled culinary professional whose calm confidence and precision make him one of the kitchen's most reliable chefs.",
        yearsExperience: 0,
        imageUrl: "https://ik.imagekit.io/8mmiwepdm/all-blue/chefs/3af6257c-7ec9-4400-8a8f-845680e41bbf-1780378553418_L0Nlv5j7A.png",
      },
      {
        name: "Tajio",
        specialty: "Ingredient Preparation",
        bio: "A talented young chef with a keen eye for detail and a passion for cooking. Tajio's dedication, reliability, and growing culinary skills make him a valued member of the All Blue kitchen team.",
        yearsExperience: 0,
        imageUrl: "https://ik.imagekit.io/8mmiwepdm/all-blue/chefs/e5141a3d-9af8-4da8-b6c0-63624725dada-1780379287593_PjJOli-mR.png",
      },
    ]);
  } else {
    console.log(`Chefs table already has ${existingChefs.length} entries, skipping.`);
  }

  // ── Menu items ───────────────────────────────────────────────────────────────
  // Only seed menu items if the table is empty.
  const existingMenu = await db.select().from(menuItemsTable);
  if (existingMenu.length === 0) {
    console.log("Inserting default menu items...");
    const insertedItems = await db.insert(menuItemsTable).values([
      {
        name: "Elephant Bluefin Tuna Steak",
        description: "Pan-seared premium steak cut from the legendary Elephant Bluefin Tuna, served with a citrus-glaze infusion from the South Blue.",
        price: 42.00,
        origin: "south_blue",
        category: "Seafood",
        isAvailable: true,
        isFeatured: true,
        imageUrl: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&q=80&w=800",
      },
      {
        name: "Sea King Stew",
        description: "A robust, slow-simmered seafood stew containing wild Sea King tenderloin, deep-ocean sea weeds, and aromatic herbs.",
        price: 34.50,
        origin: "south_blue",
        category: "Seafood",
        isAvailable: true,
        isFeatured: true,
        imageUrl: "https://ik.imagekit.io/8mmiwepdm/all-blue/food-north-2-1780245337199_NvyAG2sOq.png",
      },
      {
        name: "Sky Fish Sashimi",
        description: "Delicately sliced rare Sky Fish harvested directly from the White-White Sea above. Served chilled with a light soy-mirin dip.",
        price: 38.00,
        origin: "east_blue",
        category: "Seafood",
        isAvailable: true,
        isFeatured: true,
        imageUrl: "https://images.unsplash.com/photo-1534080391025-09795d197360?auto=format&fit=crop&q=80&w=800",
      },
      {
        name: "Desert Strawberry Sorbet",
        description: "A highly refreshing sweet sorbet prepared from rare desert strawberries native to the Alabasta Kingdom oasis.",
        price: 12.50,
        origin: "east_blue",
        category: "Dessert",
        isAvailable: true,
        isFeatured: false,
        imageUrl: "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?auto=format&fit=crop&q=80&w=800",
      },
      {
        name: "Baratie Lobster Thermidor",
        description: "A whole North Blue lobster baked in a rich cream sauce of cognac, egg yolks, and gruyère cheese. Zeff's famous recipe.",
        price: 55.00,
        origin: "north_blue",
        category: "Seafood",
        isAvailable: true,
        isFeatured: false,
        imageUrl: "https://images.unsplash.com/photo-1559742811-82428b49223b?auto=format&fit=crop&q=80&w=800",
      },
      {
        name: "Cloud Burst Sipper",
        description: "A refreshing blue-and-pink sparkling beverage crowned with a delicate cotton candy cloud for a sweet, enchanting experience.",
        price: 10.55,
        origin: "east_blue",
        category: "Beverage",
        isAvailable: true,
        isFeatured: false,
        imageUrl: "https://ik.imagekit.io/8mmiwepdm/all-blue/chatgpt-image-may-30-2026-08-41-13-pm-1780144916677_sVr24FHfM.png",
      },
    ]).returning();

    // ── Reviews (only seeded alongside menu items) ──────────────────────────
    const existingReviews = await db.select().from(reviewsTable);
    if (existingReviews.length === 0) {
      console.log("Inserting default reviews...");
      await db.insert(reviewsTable).values([
        {
          menuItemId: insertedItems[0].id,
          userName: "Monkey D. Luffy",
          rating: 5,
          comment: "MEAT!!! TUNA MEAT!!! THIS IS THE BEST FISH STUFF I'VE EVER TASTED! SANJI, MORE PLEASE!!!",
        },
        {
          menuItemId: insertedItems[0].id,
          userName: "Roronoa Zoro",
          rating: 4,
          comment: "Goes remarkably well with sake. The cook didn't completely ruin it.",
        },
        {
          menuItemId: insertedItems[1].id,
          userName: "Nami",
          rating: 5,
          comment: "Incredibly flavorful and filled with nourishing minerals. Well worth the price, even if Sanji gave me a discount!",
        },
        {
          menuItemId: insertedItems[2].id,
          userName: "Nico Robin",
          rating: 5,
          comment: "A delightful culinary experience. The sky fish has a unique texture that feels like dining on clouds.",
        },
      ]);
    }
  } else {
    console.log(`Menu items table already has ${existingMenu.length} entries, skipping.`);
  }

  console.log("Done.");
}

main().catch(err => {
  console.error("Seed failed:", err);
  process.exit(1);
});
