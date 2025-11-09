# City Hygiene Risk Monitor

A comprehensive, production-ready platform for monitoring, reporting, and tracking hygiene risks across cities. Built with Next.js, featuring real-time risk assessment, interactive maps, and automatic data expiration.

## 🚀 Features

### Core Functionality
- **Real-time Report Submission**: Submit hygiene issues with category selection and optional photos
- **Automatic Risk Assessment**: AI-powered risk classification with priority scoring (1-10)
- **Interactive Risk Map**: Visual representation with color-coded markers and special effects
- **Data Analytics**: Comprehensive charts and statistics for monitoring trends
- **Automatic Expiry**: 7-day TTL system with category-specific expiry rules
- **Mobile-First Design**: Responsive interface with burger menu and floating action buttons

### Risk Categories & Scoring
| Category | Risk Level | Score | Expiry | Map Style |
|----------|------------|-------|---------|-----------|
| Dead Animal | High | 10 | 1 day | 🔴 Red + Pulse |
| Sewage Overflow | High | 9 | 2 days | 🔴 Red + Pulse |
| Mosquito Breeding | Medium | 8 | 3 days | 🟠 Orange + Glow |
| Garbage | Medium | 7 | 5 days | 🟠 Orange |
| Toilet Unclean | Low | 5 | 7 days | 🟡 Yellow |
| Festival Waste | Low | 4 | 7 days | 🟡 Yellow |
| General Dirty | Low | 3 | 7 days | 🟢 Green |

### Technical Features
- **Redis Database**: TTL-based data storage with automatic expiration
- **Real-time Updates**: Live map updates and instant data refresh
- **Rate Limiting**: Built-in abuse prevention (5 requests/min per IP)
- **Mobile Responsive**: Optimized for all device sizes
- **TypeScript**: Full type safety and IntelliSense support

## 🏗️ Architecture

### Frontend
- **Next.js 14** with App Router
- **Tailwind CSS** for styling
- **React Leaflet** for interactive maps
- **Recharts** for data visualization
- **Lucide React** for icons

### Backend
- **Next.js API Routes** for backend logic
- **Upstash Redis** for data storage with TTL
- **Automatic cleanup** of expired reports
- **Rate limiting** and validation

### Data Flow
1. User submits report → API validation → Redis storage with TTL
2. Map updates in real-time → Interactive markers with risk styling
3. Automatic expiry → Reports disappear after category-specific time
4. Dashboard analytics → Real-time statistics and trends

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Upstash Redis account (free tier available)

## 🛠️ Installation

### 1. Clone and Install Dependencies
```bash
git clone <repository-url>
cd city-hygiene-risk-monitor
npm install
```

### 2. Environment Configuration
Create a `.env.local` file in the root directory:

```env
# Database
UPSTASH_REDIS_REST_URL=your_redis_url_here
UPSTASH_REDIS_REST_TOKEN=your_redis_token_here

# Map
NEXT_PUBLIC_MAP_TILE_URL=https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png

# Optional: Image Storage
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Optional: Auth
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

# Rate Limiting
RATE_LIMIT_MAX=5
RATE_LIMIT_WINDOW=60000
```

### 3. Set Up Upstash Redis
1. Go to [upstash.com](https://upstash.com)
2. Create a free account
3. Create a new Redis database
4. Copy the REST URL and Token to your `.env.local`

### 4. Run the Application
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🎯 Usage

### For Citizens
1. **Submit Reports**: Use the floating "+" button or map interface
2. **Choose Category**: Select from 7 hygiene issue types
3. **Add Location**: Describe the problem location
4. **Optional Photo**: Upload supporting images
5. **Submit**: Get instant risk assessment and priority scoring

### For City Officials
1. **Monitor Map**: View all active reports with risk indicators
2. **Analyze Trends**: Use dashboard charts for insights
3. **Filter Data**: Sort by risk level, category, or date range
4. **Export Data**: Download reports for further analysis

### CSV Upload
- **Format**: text, location, date columns required
- **Validation**: Automatic format checking and error handling
- **Processing**: Instant upload with risk classification

## 🔧 Customization

### Adding New Categories
Edit `app/utils/riskCalculation.ts`:
```typescript
export const RISK_CONFIGS: Record<ReportCategory, RiskConfig> = {
  // ... existing categories
  new_category: {
    risk: 'medium',
    score: 6,
    expiryDays: 4,
    mapStyle: {
      color: '#F97316',
      size: 18
    }
  }
}
```

### Modifying Risk Rules
Update the risk calculation logic in the same file to adjust scoring algorithms.

### Styling Changes
Modify `app/globals.css` and Tailwind configuration in `tailwind.config.js`.

## 🚀 Deployment

### Quick Deploy to Vercel (Recommended) ⚡

The fastest way to deploy your application:

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Deploy to Vercel**
   - Visit [vercel.com](https://vercel.com) and sign up
   - Click "New Project" and import your repository
   - Add environment variables (see below)
   - Click "Deploy"

3. **Set Environment Variables**
   - `UPSTASH_REDIS_REST_URL` - Your Upstash Redis URL
   - `UPSTASH_REDIS_REST_TOKEN` - Your Upstash Redis Token
   - `NEXT_PUBLIC_MAP_TILE_URL` - Map tile URL (default provided)

4. **Your app is live!** 🎉

### Other Deployment Options

- **Netlify**: See [DEPLOYMENT.md](./DEPLOYMENT.md) for details
- **Railway**: Full-stack deployment with Redis included
- **Render**: Simple web service deployment
- **AWS/Google Cloud**: For enterprise deployments

📖 **Full deployment guide**: See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions on all platforms.

## 📊 API Endpoints

### Reports
- `POST /api/reports` - Create new report
- `GET /api/reports` - List reports with filters
- `DELETE /api/reports/:id` - Delete report (admin)
- `PUT /api/reports/:id` - Update report (admin)

### Dashboard
- `GET /api/dashboard` - Get analytics and statistics

### Parameters
- `from` / `to`: Date range filtering
- `category`: Filter by issue type
- `risk`: Filter by risk level
- `bbox`: Geographic bounding box

## 🔒 Security Features

- **Rate Limiting**: 5 requests per minute per IP
- **Input Validation**: Comprehensive data sanitization
- **TTL Enforcement**: Automatic data expiration
- **User Limits**: One report per user per day
- **Geographic Validation**: Coordinate boundary checking

## 📱 Mobile Features

- **Responsive Design**: Optimized for all screen sizes
- **Touch-Friendly**: Large buttons and intuitive gestures
- **Offline Support**: Progressive Web App capabilities
- **Floating Action Button**: Easy report submission
- **Burger Menu**: Collapsible sidebar for mobile

## 🧪 Testing

### Sample Data
Use the provided `sample_data.csv` for testing:
```csv
text,location,date
"Garbage overflow in Central Park","Central Park, NYC","2024-01-15"
"Bad smell from drain on Broadway","Broadway St, NYC","2024-01-16"
```

### Manual Testing
1. Submit reports through the form
2. Verify map markers appear correctly
3. Check risk classification accuracy
4. Test data expiry functionality
5. Validate mobile responsiveness

## 🐛 Troubleshooting

### Common Issues
- **Map not loading**: Check Leaflet CSS loading
- **Redis connection failed**: Verify environment variables
- **Build errors**: Ensure Node.js 18+ compatibility
- **Mobile issues**: Test responsive breakpoints

### Debug Mode
Enable detailed logging by setting `NODE_ENV=development` in your environment.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **OpenStreetMap** for map tiles
- **Upstash** for Redis hosting
- **Vercel** for Next.js framework
- **Tailwind CSS** for utility-first styling

## 📞 Support

For questions or issues:
- Create a GitHub issue
- Check the documentation
- Review the troubleshooting guide

---

**Made for cleaner cities** 🏙️✨ 