# Firebase Setup Instructions for Shared Universe Mode

## Overview
The Shared Universe feature requires Firebase Realtime Database to enable real-time synchronization between two players. Follow these steps to set up Firebase for your game.

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Give your project a name (e.g., "pro-player-elite-shared-universe")
4. Follow the setup wizard (you can disable Google Analytics for this project)
5. Click "Create project"

## Step 2: Enable Realtime Database

1. In your Firebase project, go to "Build" → "Realtime Database"
2. Click "Create Database"
3. Select a location (choose a location close to your players)
4. **Important**: Select "Start in test mode" for development
5. Click "Enable"

## Step 3: Get Firebase Configuration

1. Go to Project Settings (gear icon in Firebase Console)
2. Scroll down to "Your apps" section
3. Click the web icon (`</>`) to add a web app
4. Give your app a nickname (e.g., "Pro Player Elite")
5. **Don't check** "Firebase Hosting" for now
6. Click "Register app"
7. Copy the `firebaseConfig` object that appears

## Step 4: Configure firebase-integration.js

1. Open `firebase-integration.js` in your project
2. Replace the placeholder `firebaseConfig` object with your actual configuration:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_ACTUAL_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

3. Save the file

## Step 5: Set Database Rules (Security)

For development, you can use these permissive rules. **For production, implement proper authentication:**

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

To set rules:
1. Go to Realtime Database → Rules tab
2. Paste the rules above
3. Click "Publish"

## Step 6: Test the Setup

1. Open your game in a browser
2. Click "Modo Online"
3. You should see your friend code generated
4. Open the game in another browser/incognito window
5. Click "Modo Online" and enter the friend code
6. The players should connect and see each other in the lobby

## Important Notes

- **Free Tier**: Firebase offers a generous free tier that should be sufficient for 2-player shared universe
- **Data Privacy**: Only public player data is synced (name, OVR, club, stats, achievements) - no private save state
- **Authentication**: Currently uses anonymous player IDs. For production, consider implementing Firebase Auth
- **Real-time Sync**: Changes propagate instantly between connected players
- **Offline Fallback**: If Firebase fails, the game falls back to offline mode automatically

## Troubleshooting

**"Firebase initialization error"**:
- Check that your Firebase config is correct
- Ensure Realtime Database is enabled
- Check browser console for specific error messages

**"Friend code not found"**:
- Ensure both players are online
- Check that the friend code is entered correctly (6 characters, uppercase)
- Verify Firebase rules allow read/write access

**"Season advancement blocked"**:
- Both players must click "Ready" in the lobby before season can advance
- Check that both players are on the same season number

## Production Deployment

When deploying to production:
1. Implement Firebase Authentication (email/password or anonymous)
2. Restrict database rules to authenticated users only
3. Add error handling for network failures
4. Consider implementing a reconnection strategy
5. Add rate limiting to prevent abuse

## Database Structure Reference

The Firebase Realtime Database uses this structure:

```
/players/{playerId}/
  /profile/ { nome, geral, clubeId, valorMercado, ... }
  /stats/ { jogos, gols, assistencias, notas }
  /achievements/ [ { trofeu, ano, competicao } ]
  /lastUpdated: timestamp
  /currentSeason: number

/connections/{userId}/
  /friends/ [ { friendId, friendName, connectedAt, status } ]
  /friendCode: string

/lobbies/{lobbyId}/
  /players/{playerId}/ { nome, ready, currentSeason, clubeId }
  /seasonSync/ { currentSeason, allPlayersReady, seasonInProgress }
  /createdAt: timestamp

/events/{playerId}/
  /achievements/ [ { type, trophy, year, timestamp, playerName } ]
```

This structure ensures real-time synchronization while maintaining privacy and preventing interference between players' game states.
