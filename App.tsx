/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
/* tslint:disable */

import ContentContainer from '@/components/ContentContainer';
import ExampleGallery from '@/components/ExampleGallery';
import {DataContext} from '@/context';
import {playSound} from '@/lib/audio';
import {Example} from '@/lib/types';
import {getYoutubeEmbedUrl} from '@/lib/youtube';
// FIX: Import React to use React types like CSSProperties and FormEvent.
import React, {useContext, useMemo, useRef, useState} from 'react';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [activeChannel, setActiveChannel] = useState('All Channels');

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
  const channels = [
    'All Channels',
    'Art for Kids Hub',
    'Blippi',
    'Cosmic Kids Yoga',
    'GoldieBlox',
    'Homeschool Pop',
    'Jack Hartmann Kids Music Channel',
    'Numberblocks',
    'SciShow Kids',
    'Story Time',
  ];

  const filteredVideos = useMemo(() => {
    return examples.filter((video) => {
      const subjectMatch =
        activeSubject === 'All' || video.subject === activeSubject;
      const ageMatch =
        selectedAge === 'All Ages' || video.ageRange === selectedAge;
      const gradeMatch =
        selectedGrade === 'All Grades' || video.grade === selectedGrade;
      const channelMatch =
        activeChannel === 'All Channels' || video.channel === activeChannel;
      const searchMatch =
        searchQuery.trim() === '' ||
        video.title.toLowerCase().includes(searchQuery.toLowerCase());
      return subjectMatch && ageMatch && gradeMatch && searchMatch && channelMatch;
    });
  }, [
    examples,
    activeSubject,
    selectedAge,
    selectedGrade,
    searchQuery,
    activeChannel,
  ]);

  const handleExampleSelect = (example: Example) => {
    playSound('audio-select');
    setSelectedVideo(example);
  };

  const handleGoBack = () => {
    playSound('audio-back');
    setSelectedVideo(null);
  };

  // Callback function to handle loading state changes from ContentContainer
  const handleContentLoadingStateChange = (isLoading: boolean) => {
    setContentLoading(isLoading);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    playSound('audio-click');
    // Filtering is reactive to the searchQuery state, this just prevents submission.
  };

  // The main view of the app: A welcoming feed of videos.
  const VideoFeedView = (
    <div className="feed-view-container">
      <h1 className="headline" aria-label="Super Kids">
        {'Super Kids'.split('').map((char, index) => (
          <span
            key={index}
            className="headline-char"
            // FIX: Cast style object to React.CSSProperties to allow for custom properties.
            style={{'--char-index': index} as React.CSSProperties}>
            {char === ' ' ? '\u00A0' : char}
          </span>
        ))}
      </h1>
      <p className="subtitle">Turn fun videos into super learning games!</p>
      <p className="attribution">
        by <strong>Edgtec</strong>
      </p>

      <form className="search-container" onSubmit={handleSearch}>
        <input
          type="search"
          id="video-search"
          placeholder="Search for videos like 'taco' or 'space'..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label="Search for educational videos"
        />
        <button type="submit" aria-label="Search">
          <span className="back-button-icon" aria-hidden="true">
            search
          </span>
        </button>
      </form>

      <div className="filters-and-tabs-container">
        {/* Filters */}
        <div className="filters-container">
          <div className="filter-group">
            <label htmlFor="age-filter">Age Range</label>
            <select
              id="age-filter"
              value={selectedAge}
              onChange={(e) => {
                playSound('audio-click');
                setSelectedAge(e.target.value);
              }}>
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
              onChange={(e) => {
                playSound('audio-click');
                setSelectedGrade(e.target.value);
              }}>
              {grades.map((grade) => (
                <option key={grade} value={grade}>
                  {grade}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Subject Tabs */}
        <div
          className="tabs-container"
          role="tablist"
          aria-label="Filter by subject">
          {subjects.map((subject) => (
            <button
              key={subject}
              role="tab"
              aria-selected={activeSubject === subject}
              className={`tab-button ${
                activeSubject === subject ? 'active' : ''
              }`}
              onClick={() => {
                playSound('audio-tab');
                setActiveSubject(subject);
              }}>
              {subject}
            </button>
          ))}
        </div>

        {/* Channel Tabs */}
        <div
          className="tabs-container channel-tabs-container"
          role="tablist"
          aria-label="Filter by channel">
          {channels.map((channel) => (
            <button
              key={channel}
              role="tab"
              aria-selected={activeChannel === channel}
              className={`tab-button ${
                activeChannel === channel ? 'active' : ''
              }`}
              onClick={() => {
                playSound('audio-tab');
                setActiveChannel(channel);
              }}>
              {channel}
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

        /* Search Styles */
        .search-container {
          display: flex;
          gap: 0.5rem;
          max-width: 600px;
          margin: 0 auto 2.5rem auto;
        }
        
        .search-container input {
          flex-grow: 1;
          font-size: 1.125rem;
          padding: 0.8rem 1.25rem;
          border-radius: 99px;
        }
        
        .search-container button {
          border-radius: 99px;
          padding: 0.8rem;
          aspect-ratio: 1/1;
          display: flex;
          align-items: center;
          justify-content: center;
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