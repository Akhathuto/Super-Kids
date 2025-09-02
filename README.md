# Super Kids by Edgtec

Turn any fun video into a super learning game! Super Kids uses the power of AI to analyze YouTube videos and automatically generate simple, interactive web games that help children learn and play with their favorite topics.

## How It Works

1.  **Find a Video**: Grab the URL of a fun and educational YouTube video.
2.  **Paste the Link**: Paste the video link into the Super Kids app.
3.  **Create Game!**: Click the "Create Game!" button.
4.  **AI Magic**: The Google Gemini API watches and understands the video's content. It then designs a unique learning game based on the key concepts from the video.
5.  **Play & Learn**: An interactive game is instantly generated for your child to play!

## Features

-   **AI-Powered Game Generation**: Leverages the Gemini API to create relevant and engaging learning experiences from video content.
-   **Interactive 'Play' Tab**: The main tab where kids can play the generated game directly in the browser.
-   **'Code' Tab**: For curious kids and parents, this tab shows the complete HTML, CSS, and JavaScript code for the generated game. It's a great way to peek under the hood!
-   **'Instructions' Tab**: This tab displays the "spec" or design document that the AI created after watching the video, outlining the rules and structure of the game it's about to build.
-   **Example Gallery**: A curated list of pre-analyzed videos provides instant fun and demonstrates the app's capabilities.

## Technology Stack

-   **Frontend**: React with TypeScript
-   **AI Model**: Google Gemini API (`@google/genai`) for video analysis and content generation.
-   **Code Editor**: Monaco Editor (the editor that powers VS Code) is used in the 'Code' and 'Instructions' tabs.
-   **Styling**: Custom CSS for a bright, playful, and kid-friendly user interface.
-   **Bundling**: The app is structured with modern ES modules, loaded via an `importmap` in `index.html`.

## Running Locally

1.  Open the `index.html` file in a modern web browser.
2.  When prompted, enter your Google Gemini API key. The key will be stored in your browser's `localStorage` for the session.
3.  The application is ready to use!
