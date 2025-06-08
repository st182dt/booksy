# BookMarket - Used School Books Marketplace

A modern, responsive marketplace for buying and selling used school books built with Next.js 14, MongoDB, and Imgur API integration.

## 🚀 Features

- **Modern Design**: Beautiful blue/purple gradient theme with glass morphism effects
- **Responsive Layout**: Works perfectly on desktop, tablet, and mobile
- **User Authentication**: Secure login/register system
- **Book Management**: Add, edit, delete, and browse books
- **Image Upload**: Integrated with Imgur API for photo hosting
- **Search & Filter**: Find books by title, condition, price, and date
- **Social Integration**: Direct links to seller's social media profiles

## 🛠 Local Setup Instructions

### Prerequisites
- Node.js 18+ installed
- MongoDB Atlas account (connection string provided)
- Imgur API credentials (provided)

### Installation Steps

1. **Clone/Download the project files**

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Environment Setup**
   The app is pre-configured with your credentials:
   - MongoDB URI: Already set in the code
   - Imgur API: Already configured with your client ID
   - JWT Secret: Already set in the code

4. **Run the development server**
   \`\`\`bash
   npm run dev
   \`\`\`

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📱 How to Use

### For All Users (No Login Required)
- Browse all available books on the homepage
- Search books by title
- Filter by condition (New, Like New, Good, Fair, Poor)
- Sort by date, title, condition, or price
- View detailed book information
- Contact sellers via their social media profiles

### For Registered Users
- **Register/Login**: Click the Login button in the top right
- **Add Books**: Use the "Add Book" button to list your textbooks
- **Manage Listings**: View and edit your books in "My Listings"
- **Upload Photos**: Drag and drop or click to upload book images
- **Edit/Delete**: Manage your own listings with full control

## 🎯 Key Features Explained

### Book Listing Process
1. Click "Add Book" (requires login)
2. Fill in book details (title, condition, price, description)
3. Upload a photo of the book
4. Add your social media profile link
5. Submit to marketplace

### Search & Discovery
- **Search Bar**: Find books by title
- **Condition Filter**: Filter by book condition
- **Sort Options**: Order by date, alphabetical, condition, or price
- **Real-time Results**: Instant filtering and searching

### User Experience
- **Glass Morphism Design**: Modern, translucent UI elements
- **Smooth Animations**: Framer Motion powered transitions
- **Mobile Responsive**: Perfect experience on all devices
- **Toast Notifications**: User-friendly feedback messages

## 🔧 Technical Stack

- **Frontend**: Next.js 14 with App Router
- **Styling**: Tailwind CSS with custom gradients
- **Animations**: Framer Motion
- **Database**: MongoDB Atlas
- **Authentication**: JWT with secure sessions
- **Image Hosting**: Imgur API
- **UI Components**: Radix UI primitives

## 📊 Database Collections

The app automatically creates these MongoDB collections:
- `users`: User accounts and authentication
- `books`: Book listings with all details

## 🎨 Design System

- **Primary Colors**: Blue to Purple gradients
- **Background**: Light white with subtle gradients
- **Effects**: Glass morphism, floating animations
- **Typography**: Inter font family
- **Icons**: Lucide React icon set

## 🔒 Security Features

- **Password Hashing**: bcryptjs for secure password storage
- **JWT Authentication**: Secure session management
- **Input Validation**: Server-side validation for all forms
- **CORS Protection**: Built-in Next.js security headers
- **Image Upload**: Secure Imgur API integration

## 📝 Usage Tips

1. **High-Quality Photos**: Upload clear, well-lit photos of your books
2. **Detailed Descriptions**: Include edition, condition details, and any highlights
3. **Fair Pricing**: Research similar books for competitive pricing
4. **Social Profiles**: Use active Facebook or Instagram profiles for better trust
5. **Regular Updates**: Keep your listings current and remove sold books

## 🚀 Getting Started

1. Start the development server: `npm run dev`
2. Visit `http://localhost:3000`
3. Browse books or create an account to start selling
4. Add your first book to the marketplace!

## 📞 Support

If you encounter any issues:
1. Check the browser console for error messages
2. Ensure MongoDB connection is working
3. Verify Imgur API credentials
4. Make sure all dependencies are installed

Enjoy your new book marketplace! 📚✨
