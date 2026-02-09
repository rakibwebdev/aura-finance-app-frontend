# Aura Finance

**Tagline:** Bridge the gap between digital wealth and physical reality.

## 🌟 Features

### 1. Aura Vision (AR Decision Support)

The core feature that intervenes at the "Point of Sale":

- **Heads-Up Display (HUD)**: Uses Capacitor Community Barcode Scanner for real-time product scanning
- **Contextual Budgeting**: Calculates the Impact Factor showing how much of your weekly budget a purchase will consume
- **Visual Warning System**: Color-coded interface (Cyan = safe, Amber = caution, Red = danger) provides instant psychological feedback

### 2. 3D Goal Materialization

Gamified savings visualization with tangible 3D assets:

- **Dream Engine**: Built with React Three Fiber (R3F) for high-fidelity 3D rendering
- **Progressive Rendering**:
    - 0-25%: Wireframe mesh
    - 26-75%: Chassis and mechanical details
    - 100%: Fully rendered with lighting and textures
- **Interactive Viewer**: Rotate and zoom your future reward

### 3. Opportunity Cost Calculator

Links consumption to investment potential:

- **Asset Equivalence**: Converts purchase prices into investment units (e.g., Tesla shares)
- **Comparative Logic**: Visualizes the long-term wealth lost by spending vs. investing

### 4. Reactive Budget Dashboard

Clean, native-feeling financial dashboard:

- **Weekly Pulse**: Focus on "Safe-to-Spend" amounts
- **Category Tracking**: Auto-categorized spending with visual breakdowns
- **Cross-Platform**: Native performance on iOS and Android via Ionic Capacitor

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn
- iOS Simulator (for iOS development) or Android Studio (for Android development)

### Installation

1. Navigate to the app directory:

```bash
cd aura-finance-app
```

2. Install dependencies (if not already done):

```bash
npm install
```

3. Run in development mode:

```bash
ionic serve
```

### Building for Mobile

#### iOS

```bash
ionic capacitor add ios
ionic capacitor copy ios
ionic capacitor open ios
```

#### Android

```bash
ionic capacitor add android
ionic capacitor copy android
ionic capacitor open android
```

### Camera Permissions

For the barcode scanner to work on mobile devices, you need to configure camera permissions:

**iOS (ios/App/App/Info.plist):**

```xml
<key>NSCameraUsageDescription</key>
<string>Aura Finance needs camera access to scan product barcodes</string>
```

**Android (android/app/src/main/AndroidManifest.xml):**

```xml
<uses-permission android:name="android.permission.CAMERA" />
```

## 📱 App Structure

```
src/
├── components/
│   ├── GoalVisualizer.tsx       # 3D rendering component
│   ├── ImpactDisplay.tsx        # Impact factor visualization
│   └── OpportunityCostDisplay.tsx # Opportunity cost display
├── contexts/
│   └── BudgetContext.tsx        # Global state management
├── pages/
│   ├── Dashboard.tsx            # Main budget dashboard
│   ├── Scanner.tsx              # AR barcode scanner
│   └── Goals.tsx                # 3D goal visualization
├── types/
│   └── index.ts                 # TypeScript interfaces
└── theme/
    └── variables.css            # Ionic theme customization
```

## 🎨 Technology Stack

- **Framework**: Ionic React
- **Mobile**: Capacitor
- **3D Graphics**: React Three Fiber + Three.js + Drei
- **Charts**: Recharts
- **Barcode Scanning**: @capacitor-community/barcode-scanner
- **Routing**: React Router + Ionic React Router
- **State Management**: React Context API
- **Styling**: Ionic Components + Custom CSS

## 🎯 Key Concepts

### Impact Factor

The Impact Factor shows users exactly how much of their remaining weekly budget will be consumed by a specific purchase. It includes:

- Percentage of budget
- Remaining amount after purchase
- Color-coded warning level

### 3D Progress Stages

Goals evolve visually based on savings progress:

- **Wireframe (0-25%)**: Transparent outline
- **Partial (26-99%)**: Solid model with basic materials
- **Complete (100%)**: Full rendering with lights and textures

### Opportunity Cost

Helps users understand what they're giving up by making a purchase:

- Converts purchase price to equivalent investment units
- Shows potential future value vs. spending today

## 📝 Usage

1. **Dashboard**: View your weekly budget, spending by category, and recent transactions
2. **Scanner**: Tap "Start Scanning" to scan a product barcode and see its impact on your budget
3. **Goals**: Set a financial goal and watch it materialize in 3D as you save

## 🔧 Configuration

### Budget Settings

Edit `src/contexts/BudgetContext.tsx` to customize:

- Weekly budget amount
- Category allocations
- Default goal

### 3D Models

Customize the 3D model in `src/components/GoalVisualizer.tsx`. The current implementation shows a Cybertruck, but you can replace it with any Three.js geometry.

## 🚨 Important Notes

- The barcode scanner requires camera permissions and works best on physical devices
- 3D rendering is GPU-intensive; performance may vary on older devices
- Local storage is used to persist budget data and transactions

## 📄 License

This project is a demonstration app built for educational purposes.

## 🙏 Acknowledgments

- Ionic Framework
- React Three Fiber
- Capacitor Community
- Three.js

---

Built with ❤️ for smarter financial decisions
