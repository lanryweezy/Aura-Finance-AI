/**
 * Aura Finance AI — Mobile App Setup Guide
 * Run these commands after npm install
 */

/*
## Step 1: Build the web app
npm run build

## Step 2: Add Android platform
npx cap add android

## Step 3: Sync web assets to native
npx cap sync

## Step 4: Open in Android Studio
npx cap open android

## Step 5: Build APK
# In Android Studio: Build → Build Bundle(s) / APK(s) → Build APK(s)

## iOS (requires Mac)
npx cap add ios
npx cap sync
npx cap open ios
# Build in Xcode
*/

// Mobile-specific splash screen and status bar config
// Already configured in capacitor.config.json:
// - Splash screen: dark background (#0A0E29) with cyan spinner
// - Status bar: dark style, matches app theme
// - Keyboard: dark mode, body resize
// - Local notifications: for alerts and reminders

export const MOBILE_CONFIG = {
  appName: 'Aura Finance AI',
  packageName: 'com.aura.finance',
  version: '1.0.0',
  minSdkVersion: 22,
  targetSdkVersion: 34,
  features: [
    'Biometric authentication',
    'Push notifications',
    'Offline sync',
    'Camera for receipt scanning',
    'Share invoice via WhatsApp',
  ],
};
