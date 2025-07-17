/**
 * Google Apps Script for ElectroHub - Electronics Showcase Website
 * This script provides API endpoints for the website to interact with Google Sheets
 */

// Configuration
const SPREADSHEET_ID = '1_5WnD9v2xIFA8qhDzDmYzOJhunp3fSwgUCMALoB-bLM';
const SHEET_NAME = 'Sheet1';
const DATA_RANGE = 'A:F'; // Columns A-F (Name, Image, Description, Price, TopSelling, Category)

/**
 * Main function to handle web app requests
 */
function doGet(e) {
  // Enable CORS for web requests
  const output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);
  
  try {
    const action = e.parameter.action || 'getProducts';
    
    switch (action) {
      case 'getProducts':
        const products = getProducts();
        const response = {
          success: true,
          data: products,
          timestamp: new Date().toISOString()
        };
        output.setContent(JSON.stringify(response));
        break;
        
      case 'addProduct':
        const newProduct = {
          name: e.parameter.name,
          imageUrl: e.parameter.imageUrl,
          description: e.parameter.description,
          price: parseFloat(e.parameter.price),
          topSelling: e.parameter.topSelling === 'true',
          category: e.parameter.category
        };
        const addResult = addProduct(newProduct);
        output.setContent(JSON.stringify(addResult));
        break;
        
      default:
        output.setContent(JSON.stringify({
          success: false,
          error: 'Invalid action'
        }));
    }
  } catch (error) {
    output.setContent(JSON.stringify({
      success: false,
      error: error.toString()
    }));
  }
  
  return output;
}

/**
 * Handle POST requests for adding products
 */
function doPost(e) {
  return doGet(e);
}

/**
 * Get all products from the spreadsheet
 */
function getProducts() {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    const data = sheet.getRange(DATA_RANGE).getValues();
    
    // Filter out empty rows and process data
    const products = data
      .filter(row => row[0] && row[0].toString().trim() !== '') // Filter out empty rows
      .map((row, index) => ({
        id: generateProductId(index),
        name: row[0] || 'Unknown Product',
        imageUrl: row[1] || '',
        description: row[2] || 'No description available',
        price: parseFloat(row[3]) || 0,
        topSelling: (row[4] || '').toString().toLowerCase() === 'true',
        category: row[5] || 'general'
      }));
    
    return products;
  } catch (error) {
    console.error('Error getting products:', error);
    throw new Error('Failed to fetch products from spreadsheet');
  }
}

/**
 * Add a new product to the spreadsheet
 */
function addProduct(product) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    
    // Find the first empty row
    const lastRow = sheet.getLastRow();
    const newRow = lastRow + 1;
    
    // Add the product data
    sheet.getRange(newRow, 1, 1, 6).setValues([[
      product.name,
      product.imageUrl,
      product.description,
      product.price,
      product.topSelling,
      product.category
    ]]);
    
    return {
      success: true,
      message: 'Product added successfully',
      productId: generateProductId(newRow)
    };
  } catch (error) {
    console.error('Error adding product:', error);
    return {
      success: false,
      error: 'Failed to add product'
    };
  }
}

/**
 * Generate a unique product ID
 */
function generateProductId(index) {
  return 'prod_' + index + '_' + Utilities.getUuid().substring(0, 8);
}

/**
 * Initialize the spreadsheet with sample data (run once)
 */
function initializeSampleData() {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
  
  // Clear existing data
  sheet.clear();
  
  // Add headers
  sheet.getRange(1, 1, 1, 6).setValues([
    ['Product Name', 'Image URL', 'Description', 'Price', 'Top Selling', 'Category']
  ]);
  
  // Add sample products
  const sampleProducts = [
    [
      'iPhone 15 Pro',
      'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400',
      'Latest Apple iPhone with advanced Pro features and A17 chip',
      999.99,
      true,
      'smartphones'
    ],
    [
      'MacBook Pro M3',
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400',
      'Powerful laptop with M3 chip for professional use',
      1999.99,
      true,
      'laptops'
    ],
    [
      'AirPods Pro',
      'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=400',
      'Wireless earbuds with active noise cancellation',
      249.99,
      true,
      'audio'
    ],
    [
      'Samsung Galaxy S24',
      'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400',
      'Latest Samsung flagship with advanced AI features',
      899.99,
      false,
      'smartphones'
    ],
    [
      'Sony WH-1000XM5',
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400',
      'Premium noise-canceling headphones',
      329.99,
      false,
      'audio'
    ],
    [
      'iPad Pro 12.9"',
      'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400',
      'Professional tablet with M2 chip and Liquid Retina display',
      1099.99,
      true,
      'tablets'
    ]
  ];
  
  // Add sample data starting from row 2
  sheet.getRange(2, 1, sampleProducts.length, 6).setValues(sampleProducts);
  
  return 'Sample data initialized successfully';
}

/**
 * Get spreadsheet statistics
 */
function getStats() {
  try {
    const products = getProducts();
    const stats = {
      totalProducts: products.length,
      topSellingCount: products.filter(p => p.topSelling).length,
      categories: [...new Set(products.map(p => p.category))],
      averagePrice: products.reduce((sum, p) => sum + p.price, 0) / products.length || 0
    };
    
    return {
      success: true,
      stats: stats
    };
  } catch (error) {
    return {
      success: false,
      error: error.toString()
    };
  }
}