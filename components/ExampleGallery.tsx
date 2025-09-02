/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
/* tslint:disable */

import {DataContext} from '@/context';
import {Example} from '@/lib/types';
import {useContext} from 'react';

interface ExampleGalleryProps {
  videos: Example[];
  onSelectVideo: (example: Example) => void;
}

export default function ExampleGallery({
  videos,
  onSelectVideo,
}: ExampleGalleryProps) {
  const {isLoading} = useContext(DataContext);

  const getThumbnailUrl = (url: string) => {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    const videoId = match && match[2].length === 11 ? match[2] : null;
    return videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : '';
  };

  if (isLoading) {
    return (
      <div className="message-container">
        <p>Loading amazing videos...</p>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="message-container">
        <p>No videos found for these filters!</p>
        <p>Try selecting a different age, grade, or subject.</p>
      </div>
    );
  }

  return (
    <div className="example-gallery">
      <div className="gallery-grid">
        {videos.map((example) => (
          <div
            key={example.title}
            className="gallery-item"
            onClick={() => onSelectVideo(example)}
            role="button"
            tabIndex={0}
            aria-label={`Select video: ${example.title}`}>
            <div className="thumbnail-container">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={getThumbnailUrl(example.url)}
                alt={example.title}
                className="thumbnail"
              />
              <div className="play-icon-overlay">
                <span className="back-button-icon play-icon" aria-hidden="true">
                  play_circle
                </span>
              </div>
            </div>
            <div className="gallery-item-title">{example.title}</div>
          </div>
        ))}
      </div>

      <style>{`
        .example-gallery {
          width: 100%;
        }

        .gallery-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 2rem;
        }

        .gallery-item {
          cursor: pointer;
          border: 2px solid var(--color-brown-light);
          background-color: #fff;
          border-radius: 16px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }

        .gallery-item:hover {
          transform: translateY(-6px) scale(1.03);
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
        }
        
        .gallery-item:hover .play-icon-overlay {
          opacity: 1;
          transform: scale(1.1);
        }

        .gallery-item:hover .thumbnail {
          transform: scale(1.05);
        }

        .gallery-item-title {
          align-items: center;
          background-color: #fff;
          display: flex;
          flex-grow: 1;
          font-size: 1rem;
          font-weight: 700;
          justify-content: center;
          padding: 1rem;
          text-align: center;
          color: var(--color-brown-dark);
        }

        .thumbnail-container {
          position: relative;
          padding-top: 56.25%; /* 16:9 aspect ratio */
          border-bottom: 2px solid var(--color-brown-light);
          overflow: hidden;
        }

        .thumbnail {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease-in-out;
        }
        
        .play-icon-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: rgba(0,0,0,0.3);
          opacity: 0;
          transition: opacity 0.3s ease-in-out, transform 0.3s ease-in-out;
        }
        
        .play-icon {
          font-size: 64px;
          color: rgba(255, 255, 255, 0.9);
          text-shadow: 0 2px 4px rgba(0,0,0,0.5);
        }

        .message-container {
          text-align: center;
          padding: 3rem 1rem;
          background-color: #fff;
          border-radius: 16px;
          border: 2px dashed var(--color-brown-light);
        }
        
        .message-container p {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--color-subtitle);
        }

        .message-container p:last-child {
          font-size: 1rem;
          font-weight: 400;
          color: var(--color-text);
          margin-top: 0.5rem;
        }
      `}</style>
    </div>
  );
}