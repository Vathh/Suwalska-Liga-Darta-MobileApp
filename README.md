This mobile application is designed for managing and scoring dart matches in real-time during tournaments. It serves as a digital scorekeeper, allowing referees or players to track 
scores and achievements as matches progress. This app is a crucial tool in the Suwalska Liga Darta system, enabling fluent match management and accurate statistic tracking.

# Purpose
The primary purpose of this mobile app is to facilitate the real-time scoring of dart matches during tournaments organized by Suwalska Liga Darta. 
When a tournament is initiated by the administrator through the web application, the tournament bracket is generated, and matches are drawn between players. 
These matches appear in the mobile app, ready to be played. The app allows users to input scores, track significant achievements (like hitting 180, 170+, quick finishes, and high finishes), 
and send the results to the backend API for storage and further processing.

# Key Features
- User Authentication: The app is available only to logged-in users. Unauthenticated users cannot access any functionality.
- Match List: Displays a list of matches for the current tournament. Users can select a match to begin scoring.
- Scorekeeping: Allows referees or players to record the scores achieved by players during a match.
- Result Submission: After a match concludes, the app sends the match result and achievements to the dedicated backend API.
- Achievement Tracking: The app automatically tracks notable achievements such as 180s, 170+ scores, quick finishes (QF), and high finishes (HF) during a match.
  These achievements are then sent to the backend API for storage.
  Additionally, the app gathers more detailed match statistics, which are visible to the user within the app but are not sent to the API.
  
# Technologies Used
- React Native: The app is built using React Native, enabling cross-platform functionality for both Android and iOS devices.
- Expo: Used as the development environment, making it easy to run the app on different devices and platforms.
- React Navigation: Manages the app's navigation and handles user transitions between screens.
- FontAwesome: Provides a variety of icons used throughout the app for a consistent and intuitive user interface.
- React Native Modal: Used for displaying modals, such as confirmations or additional information during the scoring process.

# Future Development Plans
- Customizable Match Settings: Add the ability to set the number of legs/sets required to win a match.
- Enhanced Statistics: Implement more detailed statistics tracking during matches, accessible directly within the app.
  
# Important Notes
This mobile application is a frontend tool designed to work in conjunction with a dedicated backend API. Without this API, 
the app cannot function as intended since it relies on the API for managing tournament data, player information, and match results.
