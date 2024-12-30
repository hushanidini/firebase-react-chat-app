# My Realtime Chat App

A real-time simple chat application built with React, Firebase, zustand, and Vite.

## Features

- Real-time messaging
- Emoji support
- Notifications with toast messages
- Time ago formatting for messages
- blocked users
- File upload
- Search chat users
- Create a Chat Interface:
    Design and create the chat interface using React components.
    Set up a form for users to enter their messages and a container to display the chat messages.
    Use React state to manage the list of messages and the current user’s input.
- Implement Real-time Communication:
    Use Firebase Realtime Database to store and retrieve chat messages.
    Set up a Firebase Realtime Database reference to the chat messages collection.
- Send Messages:
    Implement the logic to send messages from the chat form.
    When a user submits a message, use the Firebase Realtime Database API to add the message to the chat messages collection.
    The real-time listener will update the chat interface with the new message.
- Display User Information:
    Retrieve and display user information such as username or profile picture alongside each message.
    Use Firebase Authentication to access the user’s information when displaying the chat messages.
-  Implement User Authentication:
    Set up user authentication using Firebase Authentication. Use different authentication methods like email/password
    Implement the authentication flow in your React app, including sign-up, login, and logout functionality using the Firebase Authentication API.
    
## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/hushanidini/firebase-react-chat-app.git
   cd firebase-react-chat-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Usage

To start the development server, run:

![alt text](image.png)


