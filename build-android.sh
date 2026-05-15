#!/bin/bash
# Build World Explorer as Android APK
# Requirements: Android Studio + SDK installed, ANDROID_HOME set

set -e

echo "🌍 Building World Explorer Android APK..."

# 1. Build web app
npm run build

# 2. Sync to Android
npx cap sync android

# 3. Build debug APK (no signing needed for testing)
cd android
./gradlew assembleDebug

echo ""
echo "✅ APK ready at:"
echo "   android/app/build/outputs/apk/debug/app-debug.apk"
echo ""
echo "📲 Install on connected device:"
echo "   adb install android/app/build/outputs/apk/debug/app-debug.apk"
