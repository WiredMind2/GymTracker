# 💪 Gym Tracker React

A modern, responsive workout tracking application built with React and Tailwind CSS. Track your workouts, monitor progress with real charts, create custom templates, and manage your exercise library.

## ✨ Features

- 📊 **Real Progress Charts** - Chart.js powered visualizations for workout frequency, volume tracking, and exercise distribution
- 🏋️ **Workout Tracking** - Start/end workouts, add exercises, track sets, reps, and weights
- 📋 **Template Management** - Create, duplicate, and delete workout templates
- 🏃 **Exercise Library** - Custom exercises with categories
- 📈 **Progress Analytics** - Weekly workout stats and favorite exercises
- 🌙 **Dark Mode** - Toggle between light and dark themes
- 💾 **Data Export/Import** - Backup and restore your data
- 📱 **PWA Ready** - Installable web application
- 🎯 **Mobile Optimized** - Responsive design for all devices

## 🚀 Quick Start

### Prerequisites

- Node.js 18 or higher
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd gym-tracker-react
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

## 🌐 GitHub Pages Deployment

### Automatic Deployment

This repository includes a GitHub Actions workflow that automatically builds and deploys to GitHub Pages on every push to the `main` branch.

### Setup Instructions

1. **Enable GitHub Pages**
   - Go to your repository settings on GitHub
   - Navigate to "Pages" section
   - Under "Source", select "GitHub Actions"
   - Save the settings

2. **Repository Settings**
   - Ensure your repository name matches the `base` path in `vite.config.js`
   - The current configuration assumes the repository name is `gym-tracker-react`
   - If your repository name is different, update `vite.config.js`:
     ```javascript
     base: process.env.NODE_ENV === 'production' ? '/your-repo-name/' : '/',
     ```

3. **Deploy**
   - Push your code to the `main` branch
   - GitHub Actions will automatically:
     - Install dependencies
     - Build the application
     - Deploy to GitHub Pages
   - Your site will be available at: `https://your-username.github.io/gym-tracker-react/`

### Manual Deployment

If you prefer to deploy manually:

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy the `dist` folder** to your preferred hosting service

## 🛠️ Technology Stack

- **Frontend**: React 18 with Vite
- **Styling**: Tailwind CSS
- **Charts**: Chart.js with react-chartjs-2
- **Database**: IndexedDB with Dexie
- **State Management**: React Context API
- **Icons**: Unicode emojis
- **Deployment**: GitHub Pages

## 📁 Project Structure

```
gym-tracker-react/
├── public/                 # Static assets
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── layout/       # Layout components
│   │   └── ui/           # UI components
│   ├── context/          # React Context providers
│   ├── hooks/            # Custom React hooks
│   ├── pages/            # Page components
│   ├── utils/            # Utility functions
│   └── App.jsx           # Main app component
├── .github/workflows/    # GitHub Actions workflows
├── vite.config.js        # Vite configuration
└── tailwind.config.js    # Tailwind CSS configuration
```

## 🎨 Customization

### Dark Mode

The app includes a complete dark mode implementation with:
- Theme context for state management
- Automatic system preference detection
- Local storage persistence
- Theme toggle in header and settings

### Charts

Chart.js powered visualizations:
- Weekly workout frequency (bar chart)
- Volume progression (line chart)
- Exercise distribution (doughnut chart)
- Dark mode compatible charts with automatic theme detection

### Database

Uses IndexedDB for client-side storage:
- Workouts and exercise sets
- Exercise library
- Custom templates
- Settings and preferences

## 📱 PWA Features

- Service Worker for offline functionality
- App manifest for installation
- Responsive design for mobile
- Touch-friendly interface

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Build and preview
npm run build
npm run preview
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and commit: `git commit -m 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is open source and available under the MIT License.

## 🔧 Troubleshooting

### Build Issues

- Ensure Node.js 18+ is installed
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check for TypeScript errors if using strict mode

### GitHub Pages Issues

- Verify repository name matches `vite.config.js` base path
- Ensure GitHub Pages is enabled in repository settings
- Check Actions tab for deployment logs
- Wait a few minutes after pushing for deployment

### Database Issues

- Clear browser data and IndexedDB
- Check browser compatibility (modern browsers required)
- Verify service worker registration

## 📊 Performance

- Code splitting with Vite
- Optimized bundle size
- Efficient IndexedDB queries
- Lazy loading of components

## 🌟 Future Enhancements

- [ ] Exercise videos/instructions
- [ ] Workout sharing between users
- [ ] Integration with fitness trackers
- [ ] Advanced analytics and insights
- [ ] Offline-first architecture improvements

---

**Built with ❤️ using React and Tailwind CSS**
