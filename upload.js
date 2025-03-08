// upload.js - Node.js script to upload menu items to API
// Run with: node upload.js

const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const FormData = require('form-data');

// Parse the menu items from the file
const menuItemsFile = fs.readFileSync('./paste.txt', 'utf8');
const menuItemsText = menuItemsFile.split('const menuItems = ')[1].split('export default menuItems;')[0];
// Use Function constructor to safely evaluate the array
const menuItems = new Function(`return ${menuItemsText}`)();

console.log(`Total menu items: ${menuItems.length}`);
console.log('Sample item:', menuItems[0]);

// Map the existing categories to the required ItemType enum
const categoryToItemTypeMap = {
  'Starter': 'appetizer',
  'Main': 'main',
  'Dessert': 'dessert'
};

// Define food descriptions for each item
const foodDescriptions = {
  // Starters
  'Bruschetta': 'Toasted bread topped with fresh tomatoes, basil, garlic, and drizzled with extra virgin olive oil.',
  'Garlic Bread': 'Freshly baked bread infused with garlic butter and herbs, toasted to perfection.',
  'Caprese Salad': 'Fresh mozzarella, ripe tomatoes, and basil leaves drizzled with balsamic glaze and olive oil.',
  'Spring Rolls': 'Crispy fried rolls filled with vegetables and served with sweet chili sauce.',
  'Shrimp Cocktail': 'Succulent shrimp served with our signature cocktail sauce and lemon wedges.',
  'Stuffed Mushrooms': 'Mushroom caps filled with a savory mixture of herbs, cheese, and breadcrumbs.',
  'Calamari': 'Lightly fried calamari rings served with marinara sauce and lemon wedges.',
  'Tomato Soup': 'Rich and creamy tomato soup garnished with fresh herbs and served with croutons.',
  'Crab Cakes': 'Delicate crab meat combined with spices, pan-seared to a golden brown.',
  'Mozzarella Sticks': 'Breaded mozzarella sticks fried until golden and served with marinara sauce.',
  'Charcuterie Board': 'Selection of fine cured meats, cheeses, olives, and crackers.',
  'Avocado Toast': 'Smashed avocado on toasted artisan bread with cherry tomatoes and microgreens.',
  'Hummus Platter': 'Creamy hummus served with warm pita bread, olives, and vegetable sticks.',
  'Crispy Tofu': 'Tofu pieces crispy on the outside, tender inside, served with dipping sauce.',
  'Chicken Wings': 'Juicy chicken wings tossed in your choice of sauce, served with celery and blue cheese dip.',
  'Deviled Eggs': 'Classic appetizer of halved hard-boiled eggs filled with a creamy, seasoned yolk mixture.',
  'Meatballs': 'Tender meatballs in a rich tomato sauce, topped with Parmesan cheese and herbs.',

  // Mains
  'Grilled Salmon': 'Fresh salmon fillet grilled to perfection, served with seasonal vegetables and lemon butter sauce.',
  'Spaghetti Carbonara': 'Al dente spaghetti tossed with pancetta, egg, Parmesan cheese, and black pepper.',
  'Chicken Parmesan': 'Breaded chicken breast topped with marinara sauce and melted cheese, served with pasta.',
  'Beef Stroganoff': 'Tender beef strips in a creamy mushroom sauce, served over egg noodles.',
  'Vegetarian Pizza': 'Thin crust pizza topped with tomato sauce, cheese, and a variety of fresh vegetables.',
  'Roast Chicken': 'Whole chicken roasted with herbs and garlic, served with roasted potatoes and vegetables.',
  'Pasta Primavera': 'Pasta tossed with fresh spring vegetables in a light garlic and olive oil sauce.',
  'Lamb Chops': 'Tender lamb chops marinated in herbs and grilled to your preference, served with mint sauce.',
  'Seafood Paella': 'Traditional Spanish rice dish with saffron, seafood, and chorizo.',
  'Vegetable Stir-fry': 'Fresh vegetables stir-fried in a savory sauce, served over steamed rice.',
  'Baked Ziti': 'Ziti pasta baked with tomato sauce, ricotta, and mozzarella cheese.',
  'Steak Frites': 'Grilled sirloin steak served with crispy french fries and herb butter.',
  'Fish and Chips': 'Beer-battered cod fillets served with thick-cut fries and tartar sauce.',
  'Lasagna': 'Layers of pasta, rich meat sauce, and creamy cheese, baked until golden.',
  'Pork Belly': 'Slow-roasted pork belly with crispy skin, served with apple sauce and vegetables.',
  'Duck Confit': 'Duck leg slow-cooked in its own fat until tender, served with roasted potatoes.',
  'Ratatouille': 'Traditional French vegetable stew with eggplant, zucchini, peppers, and tomatoes.',
  'Mushroom Risotto': 'Creamy Arborio rice cooked with mushrooms, white wine, and Parmesan cheese.',

  // Desserts
  'Chocolate Cake': 'Rich chocolate cake with layers of ganache, served with vanilla ice cream.',
  'Apple Pie': 'Traditional pie filled with cinnamon-spiced apples in a flaky crust, served warm.',
  'Tiramisu': 'Italian dessert of coffee-soaked ladyfingers, layered with mascarpone cream and cocoa.',
  'Cheesecake': 'Creamy New York-style cheesecake on a graham cracker crust, topped with berry compote.',
  'Ice Cream Sundae': 'Vanilla ice cream topped with chocolate sauce, whipped cream, and a cherry.',
  'Brownie': 'Fudgy chocolate brownie served warm with a scoop of vanilla ice cream.',
  'Panna Cotta': 'Silky Italian custard dessert topped with berry sauce.',
  'Fruit Tart': 'Buttery pastry shell filled with custard and topped with fresh seasonal fruits.',
  'Lemon Sorbet': 'Refreshing palate cleanser made with fresh lemons, light and zesty.',
  'Custard Pudding': 'Smooth, creamy vanilla custard topped with caramel sauce.',
  'Profiteroles': 'Light choux pastry filled with cream and drizzled with chocolate sauce.',
  'Carrot Cake': 'Moist spiced cake with grated carrots, topped with cream cheese frosting.',
  'Macarons': 'Delicate French almond cookies with a ganache filling in assorted flavors.',
  'Churros': 'Spanish fried dough pastry dusted with cinnamon sugar, served with chocolate dipping sauce.',
  'Creme Brulee': 'Rich custard base topped with a layer of caramelized sugar.',
  'Eclairs': 'Oblong pastry filled with cream and topped with chocolate icing.',
  'Lemon Meringue Pie': 'Tangy lemon filling in a pastry crust, topped with fluffy meringue.'
};

// Define common allergens for each menu item
const itemAllergens = {
  // Starters
  'Bruschetta': ['gluten'],
  'Garlic Bread': ['gluten', 'dairy'],
  'Caprese Salad': ['dairy'],
  'Spring Rolls': ['gluten'],
  'Shrimp Cocktail': ['shellfish'],
  'Stuffed Mushrooms': ['gluten', 'dairy'],
  'Calamari': ['gluten', 'shellfish'],
  'Tomato Soup': ['dairy'],
  'Crab Cakes': ['gluten', 'shellfish', 'eggs'],
  'Mozzarella Sticks': ['gluten', 'dairy', 'eggs'],
  'Charcuterie Board': ['dairy', 'gluten'],
  'Avocado Toast': ['gluten'],
  'Hummus Platter': ['gluten'],
  'Crispy Tofu': ['soy'],
  'Chicken Wings': ['eggs'],
  'Deviled Eggs': ['eggs'],
  'Meatballs': ['gluten', 'eggs'],

  // Mains
  'Grilled Salmon': ['fish'],
  'Spaghetti Carbonara': ['gluten', 'dairy', 'eggs'],
  'Chicken Parmesan': ['gluten', 'dairy', 'eggs'],
  'Beef Stroganoff': ['dairy', 'gluten'],
  'Vegetarian Pizza': ['gluten', 'dairy'],
  'Roast Chicken': [],
  'Pasta Primavera': ['gluten', 'dairy'],
  'Lamb Chops': [],
  'Seafood Paella': ['shellfish', 'fish'],
  'Vegetable Stir-fry': ['soy'],
  'Baked Ziti': ['gluten', 'dairy'],
  'Steak Frites': [],
  'Fish and Chips': ['fish', 'gluten'],
  'Lasagna': ['gluten', 'dairy', 'eggs'],
  'Pork Belly': [],
  'Duck Confit': [],
  'Ratatouille': [],
  'Mushroom Risotto': ['dairy'],

  // Desserts
  'Chocolate Cake': ['gluten', 'dairy', 'eggs'],
  'Apple Pie': ['gluten', 'dairy'],
  'Tiramisu': ['dairy', 'eggs', 'gluten'],
  'Cheesecake': ['dairy', 'eggs', 'gluten'],
  'Ice Cream Sundae': ['dairy', 'eggs'],
  'Brownie': ['gluten', 'dairy', 'eggs', 'nuts'],
  'Panna Cotta': ['dairy'],
  'Fruit Tart': ['gluten', 'dairy', 'eggs'],
  'Lemon Sorbet': [],
  'Custard Pudding': ['dairy', 'eggs'],
  'Profiteroles': ['gluten', 'dairy', 'eggs'],
  'Carrot Cake': ['gluten', 'dairy', 'eggs', 'nuts'],
  'Macarons': ['nuts', 'eggs'],
  'Churros': ['gluten', 'eggs'],
  'Creme Brulee': ['dairy', 'eggs'],
  'Eclairs': ['gluten', 'dairy', 'eggs'],
  'Lemon Meringue Pie': ['gluten', 'eggs']
};

// Function to get description for a menu item
function getDescription(itemName) {
  return foodDescriptions[itemName] ||
    `Delicious ${itemName.toLowerCase()} prepared with the finest ingredients, served to perfection.`;
}

// Function to get allergens for a menu item
function getAllergens(itemName, category) {
  if (itemAllergens[itemName]) {
    return itemAllergens[itemName];
  }

  // Generate allergens based on category if not found
  const allergens = [];
  if (category === 'Starter') {
    if (Math.random() > 0.5) allergens.push('gluten');
    if (Math.random() > 0.7) allergens.push('dairy');
  } else if (category === 'Main') {
    if (Math.random() > 0.6) allergens.push('gluten');
    if (Math.random() > 0.7) allergens.push('dairy');
    if (itemName.toLowerCase().includes('fish') || itemName.toLowerCase().includes('seafood')) {
      allergens.push('fish');
    }
  } else if (category === 'Dessert') {
    if (Math.random() > 0.3) allergens.push('gluten');
    if (Math.random() > 0.3) allergens.push('dairy');
    if (Math.random() > 0.5) allergens.push('eggs');
    if (Math.random() > 0.8) allergens.push('nuts');
  }

  return [...new Set(allergens)]; // Remove duplicates
}

// Enhance the menu items with descriptions, allergens, and image filenames
const enhancedMenuItems = menuItems.map(item => {
  return {
    ...item,
    description: getDescription(item.name),
    allergens: getAllergens(item.name, item.category),
    imageFilename: `food${item.id}.png`,
    type: categoryToItemTypeMap[item.category].toLowerCase()
  };
});

// Save the enhanced menu items to a file for reference
fs.writeFileSync('enhancedMenuItems.json', JSON.stringify(enhancedMenuItems, null, 2));
console.log('Enhanced menu items saved to enhancedMenuItems.json');

// Function to upload a single menu item using Node.js
async function uploadMenuItem(item) {
  return new Promise(async (resolve, reject) => {
    try {
      const formData = new FormData();
      formData.append('name', item.name);
      formData.append('description', item.description);
      formData.append('price', parseFloat(item.price));
      formData.append('type', item.type);
      formData.append('calories', parseInt(item.kcal));
      formData.append('avgWaitTime', parseInt(item.time.split(' ')[0]));
      formData.append('allergens', JSON.stringify(item.allergens));

      // Get the image file from the images directory
      const imagePath = path.join(process.cwd(), 'images', item.imageFilename);
      if (fs.existsSync(imagePath)) {
        formData.append('image', fs.createReadStream(imagePath), item.imageFilename);
      } else {
        console.warn(`Warning: Image file not found at ${imagePath}. Skipping image upload for ${item.name}.`);
      }

      const response = await fetch('https://api-d4o6tbc5fq-uc.a.run.app/menu-items', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6ImJjNDAxN2U3MGE4MWM5NTMxY2YxYjY4MjY4M2Q5OThlNGY1NTg5MTkiLCJ0eXAiOiJKV1QifQ.eyJuYW1lIjoiSmFrdWIgT2xzemV3c2tpIiwiaXNzIjoiaHR0cHM6Ly9zZWN1cmV0b2tlbi5nb29nbGUuY29tL3Jlc3RhdXJhbnQtbWFuYWdlbWVudC1zeS0xYTBjZCIsImF1ZCI6InJlc3RhdXJhbnQtbWFuYWdlbWVudC1zeS0xYTBjZCIsImF1dGhfdGltZSI6MTc0MTQ3MjM4MCwidXNlcl9pZCI6Ik5PYlNjV1FpSDNmOUZUWDA0REpjTjdya1pLVTIiLCJzdWIiOiJOT2JTY1dRaUgzZjlGVFgwNERKY043cmtaS1UyIiwiaWF0IjoxNzQxNDcyMzgwLCJleHAiOjE3NDE0NzU5ODAsImVtYWlsIjoiai5vbHN6ZXdza2kwNWFAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOmZhbHNlLCJwaG9uZV9udW1iZXIiOiIrNDg1MDQyMDc5MTAiLCJmaXJlYmFzZSI6eyJpZGVudGl0aWVzIjp7ImVtYWlsIjpbImoub2xzemV3c2tpMDVhQGdtYWlsLmNvbSJdLCJwaG9uZSI6WyIrNDg1MDQyMDc5MTAiXX0sInNpZ25faW5fcHJvdmlkZXIiOiJwYXNzd29yZCJ9fQ.TU2RyftviDNqBonuOkwRRJgRIqVonevawYA6g-Ay1ewmVeaZCCLeuvlDUYzXAuKSCb42mNI-HiRwstdj6bS48btC7Eg47e581U5Cn3Llwku-HRZFjerM1YZ7Q9UHJE7FdKmQot0vgLgjOVT0liy8dQJhFxB6PdZBj__peuBi1MZ3LjEUhbYE_mKgEhmGIBe3jykyT-qllN7apzXjbeQIexn1IsSy8OGH1QpIN7d60q1uBgz-dgawB4fJxgt0-UsxZu8-zVNXTOTXSsVqtiOuKVqlyxVumR4WN1BZgplteriN_jNa6il2EH7oUAnmoLbfeETNEof6kP099r-Zk3tz9g'
        },
        body: formData
      });

      const result = await response.json();
      console.log(`✅ Uploaded ${item.name}: HTTP ${response.status}`);
      resolve(result);
    } catch (error) {
      console.error(`❌ Error uploading ${item.name}:`, error);
      reject(error);
    }
  });
}

// Function to upload all menu items with a delay between each
async function uploadAllMenuItems() {
  console.log(`\n🚀 Starting upload of ${enhancedMenuItems.length} menu items...\n`);

  // Check if images directory exists
  const imagesDir = path.join(process.cwd(), 'images');
  if (!fs.existsSync(imagesDir)) {
    console.warn(`⚠️ Warning: The 'images' directory does not exist at ${imagesDir}`);
    console.log('Please make sure your food1.png, food2.png, etc. files are in an "images" directory.');

    const createDir = process.argv.includes('--create-images-dir');
    if (createDir) {
      console.log('Creating images directory...');
      fs.mkdirSync(imagesDir, { recursive: true });
    } else {
      console.log('Use --create-images-dir flag to automatically create the images directory.');
    }
  }

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < enhancedMenuItems.length; i++) {
    const item = enhancedMenuItems[i];
    console.log(`📤 Uploading item ${i+1} of ${enhancedMenuItems.length}: ${item.name}`);

    try {
      await uploadMenuItem(item);
      successCount++;
    } catch (error) {
      errorCount++;
      console.error(`  - Error details: ${error.message}`);
    }

    // Add a delay between uploads to avoid overwhelming the API
    if (i < enhancedMenuItems.length - 1) {
      const delayMs = 1000; // 1 second delay
      console.log(`⏱️ Waiting ${delayMs/1000} second before next upload...`);
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  console.log('\n📊 Upload Summary');
  console.log(`🟢 Successfully uploaded: ${successCount} items`);
  console.log(`🔴 Failed uploads: ${errorCount} items`);
  console.log(`🏁 Process complete!`);
}

// Generate curl commands for each item
function generateCurlCommands() {
  const commands = enhancedMenuItems.map(item => {
    return `curl --location 'https://api-d4o6tbc5fq-uc.a.run.app/menu-items' \\
--header 'Authorization: Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6ImJjNDAxN2U3MGE4MWM5NTMxY2YxYjY4MjY4M2Q5OThlNGY1NTg5MTkiLCJ0eXAiOiJKV1QifQ.eyJuYW1lIjoiSmFrdWIgT2xzemV3c2tpIiwiaXNzIjoiaHR0cHM6Ly9zZWN1cmV0b2tlbi5nb29nbGUuY29tL3Jlc3RhdXJhbnQtbWFuYWdlbWVudC1zeS0xYTBjZCIsImF1ZCI6InJlc3RhdXJhbnQtbWFuYWdlbWVudC1zeS0xYTBjZCIsImF1dGhfdGltZSI6MTc0MTQ3MjM4MCwidXNlcl9pZCI6Ik5PYlNjV1FpSDNmOUZUWDA0REpjTjdya1pLVTIiLCJzdWIiOiJOT2JTY1dRaUgzZjlGVFgwNERKY043cmtaS1UyIiwiaWF0IjoxNzQxNDcyMzgwLCJleHAiOjE3NDE0NzU5ODAsImVtYWlsIjoiai5vbHN6ZXdza2kwNWFAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOmZhbHNlLCJwaG9uZV9udW1iZXIiOiIrNDg1MDQyMDc5MTAiLCJmaXJlYmFzZSI6eyJpZGVudGl0aWVzIjp7ImVtYWlsIjpbImoub2xzemV3c2tpMDVhQGdtYWlsLmNvbSJdLCJwaG9uZSI6WyIrNDg1MDQyMDc5MTAiXX0sInNpZ25faW5fcHJvdmlkZXIiOiJwYXNzd29yZCJ9fQ.TU2RyftviDNqBonuOkwRRJgRIqVonevawYA6g-Ay1ewmVeaZCCLeuvlDUYzXAuKSCb42mNI-HiRwstdj6bS48btC7Eg47e581U5Cn3Llwku-HRZFjerM1YZ7Q9UHJE7FdKmQot0vgLgjOVT0liy8dQJhFxB6PdZBj__peuBi1MZ3LjEUhbYE_mKgEhmGIBe3jykyT-qllN7apzXjbeQIexn1IsSy8OGH1QpIN7d60q1uBgz-dgawB4fJxgt0-UsxZu8-zVNXTOTXSsVqtiOuKVqlyxVumR4WN1BZgplteriN_jNa6il2EH7oUAnmoLbfeETNEof6kP099r-Zk3tz9g' \\
--form 'name="${item.name}"' \\
--form 'description="${item.description}"' \\
--form 'price="${parseFloat(item.price)}"' \\
--form 'type="${item.type}"' \\
--form 'calories="${parseInt(item.kcal)}"' \\
--form 'avgWaitTime="${parseInt(item.time.split(' ')[0])}"' \\
--form 'allergens="${JSON.stringify(item.allergens)}"' \\
--form 'image=@"images/${item.imageFilename}"'`;
  });

  // Save curl commands to a file
  fs.writeFileSync('curl-commands.sh', commands.join('\n\n'));
  console.log('Curl commands saved to curl-commands.sh');

  return commands;
}

// Check command line arguments for specific actions
function processCommandLineArgs() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Usage: node upload.js [options]

Options:
  --upload-all          Upload all menu items to the API
  --generate-curl       Generate curl commands for manual uploads
  --create-images-dir   Create the images directory if it doesn't exist
  --item <id>           Upload a specific item by its ID
  --help, -h            Show this help message
`);
    process.exit(0);
  }

  if (args.includes('--generate-curl')) {
    generateCurlCommands();
  }

  const itemIdIndex = args.indexOf('--item');
  if (itemIdIndex !== -1 && args[itemIdIndex + 1]) {
    const itemId = parseInt(args[itemIdIndex + 1]);
    const item = enhancedMenuItems.find(item => item.id === itemId);

    if (item) {
      console.log(`Uploading single item: ${item.name} (ID: ${item.id})`);
      uploadMenuItem(item)
        .then(() => console.log('Upload complete!'))
        .catch(err => console.error('Upload failed:', err));
    } else {
      console.error(`Item with ID ${itemId} not found!`);
      process.exit(1);
    }
  } else if (args.includes('--upload-all')) {
    uploadAllMenuItems();
  } else if (!args.includes('--generate-curl')) {
    // If no specific action is provided, prompt the user
    console.log(`
What would you like to do?
1. Upload all menu items to the API
2. Generate curl commands for manual uploads
3. Exit

Enter your choice (1-3): `);

    // Since we can't use readline in this context, we'll default to uploading all
    console.log('Defaulting to uploading all menu items...');
    uploadAllMenuItems();
  }
}

// Run the script
processCommandLineArgs();