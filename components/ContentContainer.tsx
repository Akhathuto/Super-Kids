/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
/* tslint:disable */

import Editor from '@monaco-editor/react';
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';
import {Tab, TabList, TabPanel, Tabs} from 'react-tabs';

// import 'react-tabs/style/react-tabs.css'

import {playSound} from '@/lib/audio';
import {parseHTML, parseJSON} from '@/lib/parse';
import {
  CODE_REGION_CLOSER,
  CODE_REGION_OPENER,
  SPEC_ADDENDUM,
  SPEC_FROM_VIDEO_PROMPT,
} from '@/lib/prompts';
import {generateText} from '@/lib/textGeneration';

interface ContentContainerProps {
  contentBasis: string;
  preSeededSpec?: string;
  preSeededCode?: string;
  onLoadingStateChange?: (isLoading: boolean) => void;
}

type LoadingState = 'loading-spec' | 'loading-code' | 'ready' | 'error';

// Helper function to provide more user-friendly error messages.
const getFriendlyErrorMessage = (error: string | null): string => {
  if (!error) {
    return 'Our robots hit a little snag. Please try again!';
  }
  if (error.includes('SAFETY') || error.includes('blocked')) {
    return "The content couldn't be created for this video. This can sometimes happen due to safety filters. Please try a different video.";
  }
  if (error.includes('API key')) {
    return 'There seems to be an issue with the connection. Please check your setup and try again.';
  }
  // Generic fallback.
  return 'Our robots got a little stuck building the game. Would you like to try again?';
};

// Export the ContentContainer component as a forwardRef component
export default forwardRef(function ContentContainer(
  {
    contentBasis,
    preSeededSpec,
    preSeededCode,
    onLoadingStateChange,
  }: ContentContainerProps,
  ref,
) {
  const [spec, setSpec] = useState<string>(preSeededSpec || '');
  const [code, setCode] = useState<string>(preSeededCode || '');
  const [iframeKey, setIframeKey] = useState(0);
  const [saveMessage, setSaveMessage] = useState('');
  const [loadingState, setLoadingState] = useState<LoadingState>(
    preSeededSpec && preSeededCode ? 'ready' : 'loading-spec',
  );
  const [error, setError] = useState<string | null>(null);
  const [isEditingSpec, setIsEditingSpec] = useState(false);
  const [editedSpec, setEditedSpec] = useState('');
  const [activeTabIndex, setActiveTabIndex] = useState(0); // 0: Play, 1: Code, 2: Instructions

  // Expose methods to the parent component through ref
  useImperativeHandle(ref, () => ({
    getSpec: () => spec,
    getCode: () => code,
  }));

  // Helper function to generate content spec from video
  const generateSpecFromVideo = async (videoUrl: string): Promise<string> => {
    const specResponse = await generateText({
      modelName: 'gemini-2.5-flash',
      prompt: SPEC_FROM_VIDEO_PROMPT,
      videoUrl: videoUrl,
    });

    let spec = parseJSON(specResponse).spec;

    spec += SPEC_ADDENDUM;

    return spec;
  };

  // Helper function to generate code from content spec
  const generateCodeFromSpec = useCallback(async (spec: string): Promise<string> => {
    // FIX: Use a recommended model 'gemini-2.5-flash' instead of a deprecated/prohibited one.
    const codeResponse = await generateText({
      modelName: 'gemini-2.5-flash',
      prompt: spec,
    });

    const code = parseHTML(
      codeResponse,
      CODE_REGION_OPENER,
      CODE_REGION_CLOSER,
    );
    return code;
  }, []);

  // Propagate loading state changes as a boolean
  useEffect(() => {
    if (onLoadingStateChange) {
      const isLoading =
        loadingState === 'loading-spec' || loadingState === 'loading-code';
      onLoadingStateChange(isLoading);
    }
  }, [loadingState, onLoadingStateChange]);

  // Main content generation logic, wrapped in useCallback for reuse (e.g., for a retry button).
  const startGeneration = useCallback(async () => {
    // If we have pre-seeded content, skip generation
    if (preSeededSpec && preSeededCode) {
      setSpec(preSeededSpec);
      setCode(preSeededCode);
      setLoadingState('ready');
      return;
    }

    try {
      // Reset states
      setLoadingState('loading-spec');
      setError(null);
      setSpec('');
      setCode('');

      // Generate a content spec based on video content
      const generatedSpec = await generateSpecFromVideo(contentBasis);
      setSpec(generatedSpec);
      setLoadingState('loading-code');

      // Generate code using the generated content spec
      const generatedCode = await generateCodeFromSpec(generatedSpec);
      setCode(generatedCode);
      setLoadingState('ready');
    } catch (err) {
      console.error(
        'An error occurred while attempting to generate content:',
        err,
      );
      setError(
        err instanceof Error ? err.message : 'An unknown error occurred',
      );
      setLoadingState('error');
    }
  }, [contentBasis, preSeededSpec, preSeededCode, generateCodeFromSpec]);

  // On mount (or when contentBasis changes), start the generation process.
  useEffect(() => {
    startGeneration();
  }, [startGeneration]);

  // Re-render iframe when code changes
  useEffect(() => {
    if (code) {
      setIframeKey((prev) => prev + 1);
    }
  }, [code]);

  // Show save message when code changes manually (not during initial load)
  useEffect(() => {
    if (saveMessage) {
      const timer = setTimeout(() => {
        setSaveMessage('');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [saveMessage]);

  const handleCodeChange = (value: string | undefined) => {
    setCode(value || '');
    setSaveMessage('Code updated. Changes will appear in the Play tab.');
  };

  const handleSpecEdit = () => {
    setEditedSpec(spec);
    setIsEditingSpec(true);
  };

  const handleSpecSave = async () => {
    const trimmedEditedSpec = editedSpec.trim();

    // Only regenerate if the spec has actually changed
    if (trimmedEditedSpec === spec) {
      setIsEditingSpec(false); // Close the editor
      setEditedSpec(''); // Reset edited spec state
      return;
    }

    try {
      setLoadingState('loading-code');
      setError(null);
      setSpec(trimmedEditedSpec); // Update spec state with trimmed version
      setIsEditingSpec(false);
      setActiveTabIndex(1); // Switch to code tab

      // Generate code using the edited content spec
      const generatedCode = await generateCodeFromSpec(trimmedEditedSpec);
      setCode(generatedCode);
      setLoadingState('ready');
    } catch (err) {
      console.error(
        'An error occurred while attempting to generate code:',
        err,
      );
      setError(
        err instanceof Error ? err.message : 'An unknown error occurred',
      );
      setLoadingState('error');
    }
  };

  const handleSpecCancel = () => {
    setIsEditingSpec(false);
    setEditedSpec('');
  };

  const renderLoadingSpinner = () => (
    <div
      style={{
        alignItems: 'center',
        color: '#666',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        justifyContent: 'center',
        marginTop: '-2.5rem',
      }}>
      <div className="loading-spinner"></div>
      <p
        style={{
          color: 'var(--color-text)',
          fontSize: '1.125rem',
          marginTop: '20px',
          fontWeight: 700,
        }}>
        {loadingState === 'loading-spec'
          ? 'Our busy bees are watching the video...'
          : 'Building your super fun game!'}
      </p>
    </div>
  );

  const renderErrorState = () => (
    <div
      style={{
        alignItems: 'center',
        color: 'var(--color-error)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        justifyContent: 'center',
        marginTop: '-2.5rem',
        textAlign: 'center',
        padding: '1rem',
        boxSizing: 'border-box',
      }}>
      <div
        style={{
          fontFamily: 'var(--font-symbols)',
          fontSize: '5rem',
        }}>
        error
      </div>
      <h3
        style={{
          fontSize: '1.5rem',
          marginBottom: '0.5rem',
          color: 'var(--color-text)',
        }}>
        Uh oh! Something went wrong.
      </h3>
      <p
        style={{
          color: 'var(--color-text)',
          marginBottom: '1.5rem',
          maxWidth: '80%',
        }}>
        {getFriendlyErrorMessage(error)}
      </p>
      <button onClick={startGeneration} className="button-primary">
        Try Again
      </button>
      <p
        style={{
          marginTop: '1.5rem',
          fontSize: '0.8em',
          color: '#999',
          maxWidth: '90%',
          wordBreak: 'break-word',
        }}>
        <strong>Details:</strong> {error || 'An unknown error occurred.'}
      </p>
    </div>
  );

  // Styles for tab list
  const tabListStyle = {
    backgroundColor: 'transparent',
    display: 'flex',
    listStyle: 'none',
    margin: 0,
    padding: '0 12px',
  };

  // Styles for tabs
  const tabStyle = {
    borderTopLeftRadius: '8px',
    borderTopRightRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    marginRight: '4px',
    padding: '8px 16px',
    fontWeight: '700',
  };

  // Base style for button container in spec tab
  const buttonContainerStyle = {padding: '0 1rem 1rem'};

  const renderSpecContent = () => {
    if (loadingState === 'error') {
      return spec ? (
        <div
          style={{
            whiteSpace: 'pre-wrap',
            fontFamily: 'var(--font-technical)',
            lineHeight: 1.75,
            flex: 1,
            overflow: 'auto',
            padding: '1rem 2rem',
            maskImage:
              'linear-gradient(to bottom, black 95%, transparent 100%)',
            WebkitMaskImage:
              'linear-gradient(to bottom, black 95%, transparent 100%)',
          }}>
          {spec}
        </div>
      ) : (
        renderErrorState()
      );
    }

    if (loadingState === 'loading-spec') {
      return renderLoadingSpinner();
    }

    if (isEditingSpec) {
      return (
        <div style={{height: '100%', display: 'flex', flexDirection: 'column'}}>
          <Editor
            height="100%"
            defaultLanguage="text"
            value={editedSpec}
            onChange={(value) => setEditedSpec(value || '')}
            theme="light"
            options={{
              minimap: {enabled: false},
              fontSize: 14,
              wordWrap: 'on',
              lineNumbers: 'off',
            }}
          />
          <div style={{display: 'flex', gap: '6px', ...buttonContainerStyle}}>
            <button onClick={handleSpecSave} className="button-primary">
              Save & regenerate code
            </button>
            <button onClick={handleSpecCancel} className="button-secondary">
              Cancel
            </button>
          </div>
        </div>
      );
    }

    return (
      <div style={{height: '100%', display: 'flex', flexDirection: 'column'}}>
        <div
          style={{
            whiteSpace: 'pre-wrap',
            fontFamily: 'var(--font-technical)',
            lineHeight: 1.75,
            flex: 1,
            overflow: 'auto',
            padding: '1rem 2rem',
            maskImage:
              'linear-gradient(to bottom, black 95%, transparent 100%)',
            WebkitMaskImage:
              'linear-gradient(to bottom, black 95%, transparent 100%)',
          }}>
          {spec}
        </div>
        <div style={buttonContainerStyle}>
          <button
            style={{display: 'flex', alignItems: 'center', gap: '5px'}}
            onClick={handleSpecEdit}
            className="button-primary">
            Edit{' '}
            <span
              style={{
                fontFamily: 'var(--font-symbols)',
                fontSize: '1.125rem',
              }}
              aria-hidden="true">
              edit
            </span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div
      style={{
        border: '3px solid var(--color-brown-light)',
        borderRadius: '16px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        maxHeight: 'inherit',
        minHeight: 'inherit',
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: '#fff',
      }}>
      <Tabs
        style={{
          bottom: 0,
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          left: 0,
          position: 'absolute',
          right: 0,
          top: 0,
        }}
        selectedIndex={activeTabIndex}
        onSelect={(index) => {
          playSound('audio-tab');
          // If currently editing spec and switching away from spec tab
          if (isEditingSpec && index !== 2) {
            setIsEditingSpec(false); // Exit edit mode
            setEditedSpec(''); // Clear edited content
          }
          setActiveTabIndex(index); // Update the active tab index
        }}>
        <TabList style={tabListStyle}>
          <Tab style={tabStyle} selectedClassName="selected-tab">
            Play
          </Tab>
          <Tab style={tabStyle} selectedClassName="selected-tab">
            Code
          </Tab>
          <Tab style={tabStyle} selectedClassName="selected-tab">
            Instructions
          </Tab>
        </TabList>

        <div style={{flex: 1, overflow: 'hidden'}}>
          <TabPanel style={{height: '100%', padding: '0'}}>
            {loadingState === 'error' ? (
              renderErrorState()
            ) : loadingState !== 'ready' ? (
              renderLoadingSpinner()
            ) : (
              <div
                style={{height: '100%', width: '100%', position: 'relative'}}>
                <iframe
                  key={iframeKey}
                  srcDoc={code}
                  style={{
                    border: 'none',
                    width: '100%',
                    height: '100%',
                  }}
                  title="rendered-html"
                  sandbox="allow-scripts"
                />
              </div>
            )}
          </TabPanel>

          <TabPanel style={{height: '100%', padding: '0'}}>
            {loadingState === 'error' ? (
              renderErrorState()
            ) : loadingState !== 'ready' ? (
              renderLoadingSpinner()
            ) : (
              <div style={{height: '100%', position: 'relative'}}>
                <Editor
                  height="100%"
                  defaultLanguage="html"
                  value={code}
                  onChange={handleCodeChange}
                  theme="light"
                  options={{
                    minimap: {enabled: false},
                    fontSize: 14,
                    wordWrap: 'on',
                    formatOnPaste: true,
                    formatOnType: true,
                  }}
                />
                {saveMessage && (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '10px',
                      right: '10px',
                      background: 'rgba(0,0,0,0.7)',
                      color: 'white',
                      padding: '5px 10px',
                      borderRadius: '4px',
                      fontSize: '12px',
                    }}>
                    {saveMessage}
                  </div>
                )}
              </div>
            )}
          </TabPanel>

          <TabPanel
            style={{
              height: '100%',
              padding: '1rem',
              overflow: 'auto',
              boxSizing: 'border-box',
            }}>
            {renderSpecContent()}
          </TabPanel>
        </div>
      </Tabs>

      <style>{`
        .selected-tab {
          background: #fff;
          color: var(--color-text);
          border-bottom: 3px solid var(--color-accent);
        }

        .react-tabs {
          width: 100%;
        }

        .react-tabs__tab-panel {
          border-top: 3px solid var(--color-brown-light);
        }

        .loading-spinner {
          animation: spin 1s ease-in-out infinite;
          border: 5px solid rgba(0, 0, 0, 0.1);
          border-radius: 50%;
          border-top-color: var(--color-accent);
          height: 60px;
          width: 60px;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
});
