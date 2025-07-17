# ElectroHub - Complete Deployment Guide

## Overview
This guide will help you deploy your ElectroHub electronics website to GitHub Pages with full Google Sheets integration using Google Apps Script.

## Part 1: Set Up Google Apps Script

### Step 1: Create Google Apps Script Project
1. Go to [Google Apps Script](https://script.google.com/)
2. Click "New Project"
3. Replace the default code with the contents of `google-apps-script.js`
4. Save the project (name it "ElectroHub API")

### Step 2: Configure the Script
1. In the Apps Script editor, update the `SPREADSHEET_ID` variable with your actual spreadsheet ID:
   ```javascript
   const SPREADSHEET_ID = '1_5WnD9v2xIFA8qhDzDmYzOJhunp3fSwgUCMALoB-bLM';
   ```

### Step 3: Deploy as Web App
1. Click "Deploy" → "New deployment"
2. Choose "Web app" as the type
3. Set the following:
   - **Execute as**: Me (your email)
   - **Who has access**: Anyone
4. Click "Deploy"
5. Copy the Web App URL (it looks like: `https://script.google.com/macros/s/ABC123.../exec`)

### Step 4: Initialize Sample Data (Optional)
1. In the Apps Script editor, click on the function dropdown
2. Select `initializeSampleData`
3. Click "Run" to add sample products to your spreadsheet

## Part 2: Update Frontend Configuration

### Step 1: Update script.js
1. Open `script.js` in your project
2. Find the `GOOGLE_APPS_SCRIPT_CONFIG` section
3. Replace `YOUR_APPS_SCRIPT_URL_HERE` with your actual Web App URL:
   ```javascript
   const GOOGLE_APPS_SCRIPT_CONFIG = {
       webAppUrl: 'https://script.google.com/macros/s/YOUR_ACTUAL_URL/exec',
       fallbackToApi: false
   };
   ```

### Step 2: Test Locally
1. Open the website in your browser
2. The products should now load from your Google Sheets
3. Test the search, filter, and purchase functionality

## Part 3: Deploy to GitHub Pages

### Step 1: Prepare Files for GitHub
Files to include in your repository:
- `index.html`
- `style.css`
- `script.js` (updated with your Apps Script URL)
- `robots.txt`
- `sitemap.xml`
- `README.md`

### Step 2: Create GitHub Repository
1. Go to [GitHub](https://github.com) and create a new repository
2. Name it something like "electrohub-website"
3. Make it public
4. Initialize with README

### Step 3: Upload Files
1. Upload all the files listed above to your repository
2. Commit the changes

### Step 4: Enable GitHub Pages
1. Go to your repository settings
2. Scroll down to "Pages" section
3. Set source to "Deploy from a branch"
4. Select "main" branch and "/ (root)" folder
5. Click "Save"

### Step 5: Update URLs
1. After deployment, update the URLs in `robots.txt` and `sitemap.xml`:
   ```
   Replace: https://yourdomain.github.io/electrohub/
   With: https://yourusername.github.io/your-repo-name/
   ```

## Part 4: Manage Your Products

### Adding Products via Google Sheets
1. Open your Google Sheets document
2. Add products with the following columns:
   - **A**: Product Name
   - **B**: Image URL
   - **C**: Description
   - **D**: Price (number)
   - **E**: Top Selling (TRUE/FALSE)
   - **F**: Category

### Adding Products via Apps Script (Optional)
You can also add products programmatically:
```javascript
// In Apps Script console, run:
addProduct({
  name: "New Product",
  imageUrl: "https://example.com/image.jpg",
  description: "Product description",
  price: 99.99,
  topSelling: true,
  category: "electronics"
});
```

## Part 5: Troubleshooting

### Common Issues:

1. **Products not loading**: Check that your Apps Script URL is correct in `script.js`
2. **CORS errors**: Make sure your Apps Script is deployed with "Anyone" access
3. **Empty spreadsheet**: Use the `initializeSampleData` function or add products manually
4. **GitHub Pages not updating**: It can take a few minutes for changes to reflect

### Testing Your Deployment:
1. Visit your GitHub Pages URL
2. Check that products load from your spreadsheet
3. Test search and filter functionality
4. Verify WhatsApp integration works
5. Test theme toggle and responsiveness

## Final Notes

- Your website is now fully functional with Google Sheets integration
- Products update in real-time when you modify the spreadsheet
- No server maintenance required
- All features work on GitHub Pages
- The solution is free and scalable

## Need Help?
If you encounter any issues, check the browser console for error messages and verify that:
1. Your Apps Script URL is correct
2. Your spreadsheet is accessible
3. Your Apps Script has the right permissions

Your ElectroHub website is now ready for production use!