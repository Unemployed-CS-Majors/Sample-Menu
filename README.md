# Restaurant Menu Uploader

A Node.js script for processing menu items and uploading them to the restaurant management API, with support for adding descriptions, allergens, and images.

## Overview

This script takes a menu items array from a text file, enhances it with rich descriptions and allergen information, and uploads each item to the API. It provides functionality for batch uploads, individual item uploads, and generating curl commands for manual uploading.

## Features

- **Automatic Data Enhancement**:
  - Adds detailed, appetizing descriptions for each dish
  - Assigns common allergens based on dish type and ingredients
  - Maps categories to API-compatible types
  - Associates correct image files based on item ID

- **Flexible Upload Options**:
  - Upload all menu items at once
  - Upload a specific item by ID
  - Generate curl commands for manual uploads

- **Error Handling & Progress Tracking**:
  - Checks for missing files and directories
  - Provides clear console output with progress indicators
  - Creates detailed logs and summaries

## Prerequisites

Before running the script, you'll need:

1. Node.js v12 or higher installed
2. Required npm packages:
   - node-fetch (v2)
   - form-data
3. Your menu items data in a text file (`paste.txt`)
4. Food images named `food1.png`, `food2.png`, etc. corresponding to item IDs

## Installation

1. Clone this repository or download the script
2. Install dependencies:

```bash
npm install node-fetch@2 form-data
```

> **Note**: We use node-fetch v2 as v3 requires ESM modules

3. Create an `images` directory and add your food images:

```bash
mkdir images
# Add your food1.png, food2.png, etc. to this directory
```

## Usage

### Basic Usage

Run the script without parameters to start the interactive mode:

```bash
node upload.js
```

### Command Line Options

The script supports several command line options:

```bash
# Upload all menu items to the API
node upload.js --upload-all

# Upload a specific item by ID
node upload.js --item 5

# Generate curl commands for manual uploads
node upload.js --generate-curl

# Create the images directory if it doesn't exist
node upload.js --create-images-dir

# Show help information
node upload.js --help
```

## Configuration

The script expects:

1. `paste.txt` containing your menu items array in the same directory
2. An `images` directory containing image files named `food1.png`, `food2.png`, etc.

## Output Files

The script generates:

- `enhancedMenuItems.json`: The complete enhanced menu data
- `curl-commands.sh`: Shell script with curl commands for manual uploads (when using --generate-curl)

## How It Works

1. The script reads the menu items from `paste.txt`
2. For each item, it:
   - Adds a detailed description based on item name and category
   - Assigns appropriate allergens based on item content
   - Maps the category to the API's required format
   - Associates the correct image filename
3. Uploads each item to the API with a small delay between requests
4. Provides a summary of successful and failed uploads

## Troubleshooting

### Common Issues

- **Missing Images**: Ensure all referenced image files exist in the `images` directory
- **Authentication Errors**: Check if the API token is valid and not expired
- **Connection Issues**: Verify your internet connection and API endpoint availability

### Debug Tips

- Review `enhancedMenuItems.json` to ensure data is formatted correctly
- Try uploading a single item with `--item <id>` to isolate issues
- Use `--generate-curl` to create commands for manual testing

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Created for the restaurant management system
- Descriptions and allergen information generated based on culinary expertise

---

*For additional support or questions, please contact the system administrator.*