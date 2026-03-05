require('dotenv').config();
const { sequelize, connectDB } = require('./config/database');
const { TokenPackage } = require('./models');

const tokenPackages = [
  {
    name: "Starter Pack",
    description: "Perfect for getting started with AI image generation",
    tokens: 50,
    price_amount: 99.00,
    price_currency: "INR",
    type: "one_time",
    features: JSON.stringify(["50 AI tokens", "Image generation", "Basic support"]),
    sort_order: 1
  },
  {
    name: "Creator Pack",
    description: "Great for content creators and small businesses",
    tokens: 200,
    price_amount: 349.00,
    price_currency: "INR",
    type: "one_time",
    features: JSON.stringify(["200 AI tokens", "Image & video generation", "Priority support"]),
    sort_order: 2
  },
  {
    name: "Pro Pack",
    description: "For professionals and agencies",
    tokens: 500,
    price_amount: 799.00,
    price_currency: "INR",
    type: "one_time",
    features: JSON.stringify(["500 AI tokens", "All generation types", "Premium support"]),
    sort_order: 3
  },
  {
    name: "Enterprise Pack",
    description: "For large teams and enterprises",
    tokens: 2000,
    price_amount: 2999.00,
    price_currency: "INR",
    type: "one_time",
    features: JSON.stringify(["2000 AI tokens", "All features", "Dedicated support"]),
    sort_order: 4
  },
  {
    name: "Monthly Basic",
    description: "Monthly subscription with 100 tokens",
    tokens: 100,
    price_amount: 199.00,
    price_currency: "INR",
    type: "subscription",
    duration: 30,
    features: JSON.stringify(["100 tokens/month", "Auto-renewal", "Cancel anytime"]),
    sort_order: 5
  },
  {
    name: "Monthly Pro",
    description: "Monthly subscription with 500 tokens",
    tokens: 500,
    price_amount: 699.00,
    price_currency: "INR",
    type: "subscription",
    duration: 30,
    features: JSON.stringify(["500 tokens/month", "All features", "Priority support"]),
    sort_order: 6
  }
];

const seedDatabase = async () => {
  try {
    await connectDB();
    console.log('Connected to MySQL');

    // Clear existing packages
    await TokenPackage.destroy({ where: {} });
    console.log('Cleared existing token packages');

    // Insert new packages
    await TokenPackage.bulkCreate(tokenPackages);
    console.log('Token packages seeded successfully');

    console.log('Database seeding completed');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

// Run seeder if called directly
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;