/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
/* tslint:disable */

import ContentContainer from '@/components/ContentContainer';
import ExampleGallery from '@/components/ExampleGallery';
import {DataContext} from '@/context';
import {Example} from '@/lib/types';
import {getYoutubeEmbedUrl} from '@/lib/youtube';
import {useContext, useMemo, useRef, useState} from 'react';

// Whether to pre-seed with example content
const PRESEED_CONTENT = false;

// Helper function to load a shared state by ID
export default function App() {
  const {examples} = useContext(DataContext);
  const [selectedVideo, setSelectedVideo] = useState<Example | null>(null);
  const [contentLoading, setContentLoading] = useState(false);

  // State for filters and tabs
  const [activeSubject, setActiveSubject] = useState('All');
  const [selectedAge, setSelectedAge] = useState('All Ages');
  const [selectedGrade, setSelectedGrade] = useState('All Grades');

  const contentContainerRef = useRef<{
    getSpec: () => string;
    getCode: () => string;
  } | null>(null);

  const subjects = [
    'All',
    'Science',
    'Math',
    'English',
    'Geography',
    'Arts & Crafts',
  ];
  const ageRanges = ['All Ages', '3-5', '6-8', '9-12'];
  const grades = ['All Grades', 'Preschool', 'K-2', '3-5'];

  const filteredVideos = useMemo(() => {
    return examples.filter((video) => {
      const subjectMatch =
        activeSubject === 'All' || video.subject === activeSubject;
      const ageMatch = selectedAge === 'All Ages' || video.ageRange === selectedAge;
      const gradeMatch =
        selectedGrade === 'All Grades' || video.grade === selectedGrade;
      return subjectMatch && ageMatch && gradeMatch;
    });
  }, [examples, activeSubject, selectedAge, selectedGrade]);

  const handleExampleSelect = (example: Example) => {
    setSelectedVideo(example);
  };

  const handleGoBack = () => {
    setSelectedVideo(null);
  };

  // Callback function to handle loading state changes from ContentContainer
  const handleContentLoadingStateChange = (isLoading: boolean) => {
    setContentLoading(isLoading);
  };

  // The main view of the app: A welcoming feed of videos.
  const VideoFeedView = (
    <div className="feed-view-container">
      <h1 className="headline">Super Kids</h1>
      <p className="subtitle">Turn fun videos into super learning games!</p>
      <p className="attribution">
        by <strong>Edgtec</strong>
      </p>

      <div className="filters-and-tabs-container">
        {/* Filters */}
        <div className="filters-container">
          <div className="filter-group">
            <label htmlFor="age-filter">Age Range</label>
            <select
              id="age-filter"
              value={selectedAge}
              onChange={(e) => setSelectedAge(e.target.value)}>
              {ageRanges.map((age) => (
                <option key={age} value={age}>
                  {age}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label htmlFor="grade-filter">Grade Level</label>
            <select
              id="grade-filter"
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}>
              {grades.map((grade) => (
                <option key={grade} value={grade}>
                  {grade}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs-container">
          {subjects.map((subject) => (
            <button
              key={subject}
              className={`tab-button ${
                activeSubject === subject ? 'active' : ''
              }`}
              onClick={() => setActiveSubject(subject)}>
              {subject}
            </button>
          ))}
        </div>
      </div>

      <ExampleGallery
        videos={filteredVideos}
        onSelectVideo={handleExampleSelect}
      />
    </div>
  );

  // The view after a video is selected: The video player and the generated game.
  const ActivityView = (
    <div className="activity-view-container">
      <div className="activity-header">
        <button onClick={handleGoBack} className="back-button">
          <span className="back-button-icon" aria-hidden="true">
            arrow_back
          </span>
          Back to Videos
        </button>
        <h2 className="activity-title">{selectedVideo?.title}</h2>
      </div>
      <div className="main-container">
        <div className="left-side">
          <div className="video-container">
            {selectedVideo ? (
              <iframe
                className="video-iframe"
                src={getYoutubeEmbedUrl(selectedVideo.url)}
                title={`YouTube video player for ${selectedVideo.title}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen></iframe>
            ) : null}
          </div>
        </div>
        <div className="right-side">
          <div className="content-area">
            {selectedVideo ? (
              <ContentContainer
                key={selectedVideo.title} // Use a unique key to force re-mount
                contentBasis={selectedVideo.url}
                onLoadingStateChange={handleContentLoadingStateChange}
                preSeededSpec={selectedVideo?.spec}
                preSeededCode={selectedVideo?.code}
                ref={contentContainerRef}
              />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <main>
        {/* Conditionally render the view based on whether a video is selected */}
        {!selectedVideo ? VideoFeedView : ActivityView}
      </main>

      <style>{`
        /* General Layout Styles */
        .feed-view-container {
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .activity-view-container {
          height: 100vh;
          display: flex;
          flex-direction: column;
          box-sizing: border-box;
          overflow: hidden;
        }

        .activity-header {
          display: flex;
          align-items: center;
          padding: 1rem 1.5rem;
          gap: 1.5rem;
          background-color: var(--color-white);
          border-bottom: 2px solid #eee;
          flex-shrink: 0;
        }
        
        .back-button {
          background: transparent;
          border: 2px solid transparent;
          color: var(--color-text);
          font-weight: 700;
          font-size: 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: 99px;
        }
        
        .back-button:hover {
          background-color: #f0f0f0;
          border-color: #ddd;
        }
        
        .activity-title {
          font-size: 1.25rem;
          font-weight: 700;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .main-container {
          padding: 1.5rem;
          display: flex;
          gap: 1.5rem;
          flex-grow: 1;
          height: 100%;
          box-sizing: border-box;
          overflow: hidden;

          @media (max-width: 768px) {
            flex-direction: column;
            padding: 1.5rem;
            height: auto;
            overflow: visible;
          }
        }

        .left-side {
          width: 40%;
          height: 100%;
          display: flex;
          flex-direction: column;
          
          @media (max-width: 768px) {
            width: 100%;
            height: auto;
            overflow: visible;
          }
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

        /* Header Styles */
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
          margin-bottom: 2.5rem;
          margin-top: -1rem;
          text-align: center;

          @media (max-width: 768px) {
            font-size: 0.8rem;
            margin-bottom: 2rem;
          }
        }

        /* Filters and Tabs Styles */
        .filters-and-tabs-container {
          background-color: var(--color-white);
          border-radius: 16px;
          padding: 1.5rem;
          margin-bottom: 2.5rem;
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
          border: 2px solid #f0f0f0;
        }

        .filters-container {
          display: flex;
          gap: 2rem;
          justify-content: center;
          margin-bottom: 1.5rem;

          @media (max-width: 500px) {
            flex-direction: column;
            gap: 1rem;
          }
        }

        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .filter-group label {
          font-weight: 700;
          font-size: 0.9rem;
          color: var(--color-subtitle);
        }
        
        .filter-group select {
          min-width: 200px;
        }

        .tabs-container {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
          justify-content: center;
          border-top: 2px solid #f0f0f0;
          padding-top: 1.5rem;
        }

        /* Video Styles */
        .video-container {
          background-color: var(--color-white);
          border-radius: 16px;
          color: var(--color-video-placeholder-text);
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

        /* Content Area Styles */
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
      `}</style>
    </>
  );
}