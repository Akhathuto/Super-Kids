/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
/* tslint:disable */

import ContentContainer from '@/components/ContentContainer';
import ExampleGallery from '@/components/ExampleGallery';
import {DataContext} from '@/context';
import {Example} from '@/lib/types';
import {
  getYoutubeEmbedUrl,
  getYouTubeVideoTitle,
  validateYoutubeUrl,
} from '@/lib/youtube';
import {useContext, useEffect, useRef, useState} from 'react';

// Whether to validate the input URL before attempting to generate content
const VALIDATE_INPUT_URL = true;

// Whether to pre-seed with example content
const PRESEED_CONTENT = false;

// Helper function to load a shared state by ID
export default function App() {
  const {defaultExample, examples, setExamples, isLoading} =
    useContext(DataContext);

  const [videoUrl, setVideoUrl] = useState(
    PRESEED_CONTENT ? defaultExample?.url : '',
  );

  const [urlValidating, setUrlValidating] = useState(false); // State to track URL validation
  const [contentLoading, setContentLoading] = useState(false); // State to track content loading

  // Reference to ContentContainer component for accessing its state
  const contentContainerRef = useRef<{
    getSpec: () => string;
    getCode: () => string;
  } | null>(null);

  // Counter to force ContentContainer re-mount even if the video URL hasn't changed
  const [reloadCounter, setReloadCounter] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedExample, setSelectedExample] = useState<Example | null>(
    PRESEED_CONTENT ? defaultExample : null,
  );

  // Handle 'Enter' key press in the input field
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !urlValidating && !contentLoading) {
      handleSubmit();
    }
  };

  const handleExampleSelect = (example: Example) => {
    if (inputRef.current) {
      inputRef.current.value = example.url;
    }
    setVideoUrl(example.url);
    setSelectedExample(example);
    setReloadCounter((c) => c + 1);
  };

  const handleSubmit = async () => {
    const inputValue = inputRef.current?.value.trim() || '';

    if (!inputValue) {
      inputRef.current?.focus();
      return;
    }

    // Prevent multiple clicks while validating
    if (urlValidating) return;

    setUrlValidating(true);
    setVideoUrl(''); // Clear previous video URL immediately
    setContentLoading(false); // Reset content loading state
    setSelectedExample(null); // Clear the selected example to force new generation

    // Check if the URL matches any of our examples
    const isPreSeededExample = [defaultExample, ...examples].some(
      (example) => example.url === inputValue,
    );

    // No need to validate the URL if it's a pre-seeded example
    if (isPreSeededExample) {
      proceedWithVideo(inputValue);
      return;
    }

    if (VALIDATE_INPUT_URL) {
      // Validate video URL
      const validationResult = await validateYoutubeUrl(inputValue);

      if (validationResult.isValid) {
        proceedWithVideo(inputValue);
      } else {
        alert(validationResult.error || 'Invalid YouTube URL');
        setUrlValidating(false);
      }
    } else {
      // If URL validation is disabled, proceed directly
      proceedWithVideo(inputValue);
    }
  };

  // Helper function to handle common operations after URL validation
  const proceedWithVideo = (url: string) => {
    setVideoUrl(url);
    // Incrementing the counter changes the 'key' prop on ContentContainer,
    // forcing it to re-mount and re-generate content
    setReloadCounter((c) => c + 1);
    setUrlValidating(false);
  };

  // Callback function to handle loading state changes from ContentContainer
  const handleContentLoadingStateChange = (isLoading: boolean) => {
    setContentLoading(isLoading);
  };

  const exampleGallery = (
    <ExampleGallery
      title={PRESEED_CONTENT ? 'More examples' : 'Or try one of these!'}
      onSelectExample={handleExampleSelect}
      selectedExample={selectedExample}
    />
  );

  return (
    <>
      <main className="main-container">
        <div className="left-side">
          <h1 className="headline">Super Kids</h1>
          <p className="subtitle">
            Turn fun videos into super learning games!
          </p>
          <p className="attribution">
            by <strong>Edgtec</strong>
          </p>
          <div className="input-container">
            <label htmlFor="youtube-url" className="input-label">
              Paste a fun YouTube video link here:
            </label>
            <input
              ref={inputRef}
              id="youtube-url"
              className="youtube-input"
              type="text"
              placeholder="e.g. https://www.youtube.com/watch?v=..."
              defaultValue={PRESEED_CONTENT ? defaultExample?.url : ''}
              disabled={urlValidating || contentLoading} // Disable input while validating or loading
              onKeyDown={handleKeyDown} // Add keydown handler
              onChange={() => {
                // Clear all content upon input change
                setVideoUrl('');
                setSelectedExample(null);
              }}
            />
          </div>

          <div className="button-container">
            <button
              onClick={handleSubmit}
              className="button-primary submit-button"
              disabled={urlValidating || contentLoading} // Disable button during validation or content loading
            >
              {urlValidating
                ? 'Checking link...'
                : contentLoading
                  ? 'Building game...'
                  : 'Create Game!'}
            </button>
          </div>

          <div className="video-container">
            {videoUrl ? (
              <iframe
                className="video-iframe"
                src={getYoutubeEmbedUrl(videoUrl)}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen></iframe>
            ) : (
              <div className="video-placeholder">
                Your video adventure awaits!
              </div>
            )}
          </div>

          <div className="gallery-container desktop-gallery-container">
            {exampleGallery}
          </div>
        </div>

        <div className="right-side">
          <div className="content-area">
            {videoUrl ? (
              <ContentContainer
                key={reloadCounter}
                contentBasis={videoUrl}
                onLoadingStateChange={handleContentLoadingStateChange}
                preSeededSpec={selectedExample?.spec}
                preSeededCode={selectedExample?.code}
                ref={contentContainerRef}
              />
            ) : (
              <div className="content-placeholder">
                <p>
                  {urlValidating
                    ? 'Checking the link...'
                    : 'Paste a video link or pick an example to start the fun!'}
                </p>
              </div>
            )}
          </div>

          <div className="gallery-container mobile-gallery-container">
            {exampleGallery}
          </div>
        </div>
      </main>

      <style>{`
        .main-container {
          --color-headline: #FF8F00;
          --color-subtitle: #795548;
          --color-attribution: #bcaaa4;

          --color-video-container-background: #fff;

          --color-video-placeholder-text: #a1887f;

          --color-content-placeholder-border: #ffd54f;
          --color-content-placeholder-text: #a1887f;

          padding: 2rem;
          display: flex;
          gap: 2rem;
          height: 100vh;
          box-sizing: border-box;
          overflow: hidden;

          @media (max-width: 768px) {
            flex-direction: column;
            padding: 2.25rem 1.5rem 1.5rem;
            gap: 1rem;
            height: auto;
            overflow: visible;
          }
        }

        .left-side {
          width: 40%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.25rem;
          overflow-y: auto;
          scrollbar-width: none; /* Firefox */
          -ms-overflow-style: none; /* IE and Edge */

          @media (max-width: 768px) {
            width: 100%;
            height: auto;
            overflow: visible;
          }
        }

        .left-side::-webkit-scrollbar {
          display: none; /* Chrome, Safari, Opera */
        }

        .right-side {
          display: flex;
          flex-direction: column;
          flex: 1;
          gap: 1rem;
          height: 100%;

          @media (max-width: 768px) {
            height: auto;
          }
        }


        .headline {
          color: var(--color-headline);
          font-family: var(--font-display);
          font-size: 4.5rem;
          font-weight: 400;
          margin-top: 0.5rem;
          margin-bottom: 0;
          text-align: center;
          text-transform: uppercase;
          letter-spacing: 2px;
          -webkit-text-stroke: 2px #fff;
          paint-order: stroke fill;

          @media (max-width: 768px) {
            font-size: 3rem;
            -webkit-text-stroke: 1px #fff;
          }
        }

        .subtitle {
          color: var(--color-subtitle);
          font-size: 1.25rem;
          margin-top: -1rem;
          margin-bottom: 0;
          text-align: center;
          font-weight: 700;

          @media (max-width: 768px) {
            font-size: 1rem;
          }
        }

        .attribution {
          color: var(--color-attribution);
          font-family: var(--font-secondary);
          font-size: 0.9rem;
          font-style: italic;
          margin-bottom: 1rem;
          margin-top: -1rem;
          text-align: center;

          @media (max-width: 768px) {
            font-size: 0.8rem;
          }
        }

        .input-container {
          width: 100%;
        }

        .input-label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 700;
        }

        .youtube-input {
          width: 100%;
        }

        .button-container {
          width: 100%;
          display: flex;
          gap: 0.5rem;
        }

        .submit-button {
          flex: 1;
        }

        .share-button {
          flex: 0.05;
        }

        .video-container {
          background-color: var(--color-video-container-background);
          border-radius: 16px;
          color: var(--color-video-placeholder-text);
          margin: 0.5rem 0;
          padding-top: 56.25%; /* 16:9 aspect ratio */
          position: relative;
          width: 100%;
          border: 2px solid var(--color-brown-light);
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }

        .video-iframe {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border: none;
          border-radius: 14px;
        }

        .video-placeholder {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 1.2rem;
        }

        .content-area {
          flex: 1;
          display: flex;
          flex-direction: column;
          max-height: 100%;

          @media (max-width: 768px) {
            max-height: 550px;
            min-height: 550px;
          }
        }

        .content-placeholder {
          align-items: center;
          border: 3px dashed var(--color-content-placeholder-border);
          border-radius: 16px;
          box-sizing: border-box;
          color: var(--color-content-placeholder-text);
          display: flex;
          flex-direction: column;
          font-size: 1.2rem;
          font-weight: 700;
          height: 100%;
          justify-content: center;
          padding: 0 2rem;
          width: 100%;

          @media (max-width: 768px) {
            min-height: inherit;
          }
        }

        .gallery-container {
          width: 100%;
        }

        .desktop-gallery-container {
          display: block;

          @media (max-width: 768px) {
            display: none; /* Hide on mobile */
          }
        }

        .mobile-gallery-container {
          display: none; /* Hide on desktop */

          @media (max-width: 768px) {
            display: block;
          }
        }
      `}</style>
    </>
  );
}