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

## Setup and Local Development

This project is a static web application that runs entirely in the browser. Follow these instructions to run it on your local machine for development or testing.

### Prerequisites

-   A modern web browser (e.g., Chrome, Firefox, Safari, Edge).
-   A local web server. If you don't have one, you can use the lightweight servers built into Python or Node.js.
    -   [Node.js](https://nodejs.org/) (version 14 or higher is recommended)
    -   [Python 3](https://www.python.org/)
-   A Google Gemini API key. You can get a key from [Google AI Studio](https://aistudio.google.com/app/apikey).

### Installation and Setup

1.  **Clone the Repository**

    Open your terminal, navigate to the directory where you want to store the project, and run:
    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```
    (Replace `<repository-url>` and `<repository-directory>` with the actual values).

2.  **Configure Your API Key**

    The application needs your Google Gemini API key to work.
    
    1.  In the root directory of the project, create a new file named `env.js`.
    2.  Add the following code to `env.js`, replacing the placeholder with your actual key:
        ```javascript
        // env.js - This file is for local development and should not be committed.
        globalThis.process = {
          env: {
            API_KEY: "YOUR_API_KEY_HERE"
          }
        };
        ```
    3.  Open `index.html` and uncomment the following line to include your new `env.js` file:
        ```html
        <!-- <script src="/env.js"></script> -->
        ```
        It should look like this after uncommenting:
        ```html
        <script src="/env.js"></script>
        ```

    **Important:** To prevent accidentally committing your secret API key, ensure your project's `.gitignore` file contains a line with `env.js`.

3.  **Run a Local Web Server**

    From the root directory of the project in your terminal, start a local server using one of the following commands:

    -   **Using Node.js:**
        ```bash
        npx serve
        ```
        This will typically serve the app at `http://localhost:3000`.
    -   **Using Python 3:**
        ```bash
        python3 -m http.server
        ```
        This will typically serve the app at `http://localhost:8000`.

4.  **Launch the App**

    Open your web browser and navigate to the local address provided by your server command. You should now see the "Super Kids by Edgtec" application running.