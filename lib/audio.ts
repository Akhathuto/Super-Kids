/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
/* tslint:disable */

/**
 * Finds an audio element by its ID and plays it.
 * It resets the audio's current time to 0 to allow for rapid, overlapping plays.
 * @param soundId The ID of the <audio> element to play.
 */
export function playSound(soundId: string): void {
  try {
    const sound = document.getElementById(soundId) as HTMLAudioElement | null;
    if (sound) {
      sound.currentTime = 0;
      sound.play().catch((error) => {
        // Autoplay was prevented. This is common before any user interaction.
        // We can safely ignore this error.
        console.warn(`Sound play prevented for '${soundId}':`, error.message);
      });
    } else {
      console.warn(`Audio element with ID '${soundId}' not found.`);
    }
  } catch (error) {
    console.error(`Error playing sound '${soundId}':`, error);
  }
}
