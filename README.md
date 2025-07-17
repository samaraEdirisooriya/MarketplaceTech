# ElectroHub - Modern Electronics Showcase Website

A responsive, modern electronics showcase website built with vanilla HTML, CSS, and JavaScript. Features Google Sheets integration for product data management and WhatsApp integration for seamless customer inquiries.

## Features

### 🚀 Core Functionality
- **Responsive Design**: Optimized for mobile, tablet, and desktop devices
- **Modern UI/UX**: Clean, sleek design with smooth animations and transitions
- **Google Sheets Integration**: Real-time product data loading from Google Sheets
- **WhatsApp Integration**: Direct customer inquiries through WhatsApp
- **Product Management**: Search, filter, and sort functionality
- **Dark/Light Mode**: Toggle between themes with persistent preference storage

### 🎨 Design Features
- **AOS Animations**: Smooth scroll animations using AOS.js
- **Sticky Navigation**: Fixed header with logo and search functionality
- **Hero Section**: Eye-catching landing area with call-to-action
- **Product Grid**: Responsive product showcase with hover effects
- **Top Selling Section**: Highlighted best-selling products
- **Modal Interactions**: Purchase confirmation popups

### 🔧 Technical Features
- **Vanilla JavaScript**: No frameworks, pure JavaScript implementation
- **LocalStorage**: Persistent user preferences and tracking
- **Error Handling**: Graceful error states and fallback content
- **SEO Optimized**: Meta tags, semantic HTML, and sitemap
- **Performance Optimized**: Lazy loading, debounced search, and efficient DOM manipulation

## Setup Instructions

### 1. Google Sheets Configuration

#### Create Your Product Spreadsheet:
1. Create a new Google Sheet
2. Set up columns in the following order:
   - Column A: Product Name
   - Column B: Image URL
   - Column C: Description
   - Column D: Price (numeric)
   - Column E: Top Selling (TRUE/FALSE)
   - Column F: Category

#### Get Google Sheets API Key:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google Sheets API
4. Create credentials (API Key)
5. Restrict the API key to Google Sheets API only

#### Configure API Access:
1. Make your Google Sheet public (shareable with anyone with the link)
2. Copy your spreadsheet ID from the URL
3. Update the configuration in `script.js`:

```javascript
const GOOGLE_SHEETS_CONFIG = {
    spreadsheetId: 'YOUR_SPREADSHEET_ID', // Replace with your actual ID
    range: 'Sheet1!A:F',
    apiKey: 'YOUR_API_KEY' // Replace with your actual API key
};
