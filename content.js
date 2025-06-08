// LiveBarn Enhanced Player Extension - Version 2
(function() {
    'use strict';
    
    let video = null;
    let controlsAdded = false;
    
    function debug(message, element = null) {
        console.log('[LiveBarn Extension V2] ' + message, element);
    }
    
    function createFloatingControls() {
        if (controlsAdded) return;
        
        debug('Starting control creation process...');
        
        // Find video element
        video = document.querySelector('video');
        if (!video) {
            debug('No video found');
            return;
        }
        
        debug('Video found, attempting integration...');
        
        // Remove any existing controls first
        const existing = document.getElementById('livebarn-floating-controls');
        if (existing) {
            existing.remove();
            debug('Removed existing controls');
        }
        
        // First, try to find and integrate with the actual player controls
        const playerControls = document.querySelector('.jw-controlbar, .jw-controls, [class*="control"]');
        if (playerControls) {
            debug('Found player controls, attempting integration:', playerControls);
            if (integrateWithPlayerControls(playerControls)) {
                return;
            }
        }
        
        // Fallback: Create positioned overlay near the video controls
        createOverlayControls();
    }
    
    function integrateWithPlayerControls(playerControls) {
        debug('Attempting to integrate with player controls');
        
        // Look for specific control elements to insert between
        const playButton = playerControls.querySelector('[aria-label*="Play"], [title*="Play"], .jw-icon-play, button');
        const volumeControl = playerControls.querySelector('[aria-label*="volume"], [aria-label*="Volume"], [title*="volume"], .jw-icon-volume');
        
        debug('Found play button:', playButton);
        debug('Found volume control:', volumeControl);
        
        if (playButton || volumeControl) {
            // Create speed control
            const speedBtn = createStyledButton('1x', 'Playback Speed', function() {
                cycleSpeed(this);
            });
            
            // Create forward button  
            const forwardBtn = createStyledButton('⏩', 'Forward 10 seconds', function() {
                video.currentTime = Math.min(video.currentTime + 10, video.duration);
                debug('Jumped forward 10 seconds');
            });
            
            // Try to insert in the control bar
            try {
                if (volumeControl) {
                    // Insert before volume control
                    playerControls.insertBefore(forwardBtn, volumeControl);
                    playerControls.insertBefore(speedBtn, forwardBtn);
                    debug('Successfully integrated with player controls before volume');
                } else if (playButton) {
                    // Insert after play button
                    playButton.parentNode.insertBefore(speedBtn, playButton.nextSibling);
                    playButton.parentNode.insertBefore(forwardBtn, speedBtn.nextSibling);
                    debug('Successfully integrated with player controls after play');
                } else {
                    // Append to controls
                    playerControls.appendChild(speedBtn);
                    playerControls.appendChild(forwardBtn);
                    debug('Successfully appended to player controls');
                }
                
                controlsAdded = true;
                return true;
            } catch (error) {
                debug('Failed to integrate with player controls:', error);
                return false;
            }
        }
        
        return false;
    }
    
    function createStyledButton(text, title, clickHandler) {
        const btn = document.createElement('button');
        btn.textContent = text;
        btn.title = title;
        btn.style.background = 'rgba(0,0,0,0.8)';
        btn.style.color = 'white';
        btn.style.border = '1px solid rgba(255,255,255,0.3)';
        btn.style.padding = '8px 12px';
        btn.style.margin = '0 4px';
        btn.style.borderRadius = '4px';
        btn.style.cursor = 'pointer';
        btn.style.fontSize = '12px';
        btn.style.fontWeight = 'bold';
        btn.style.fontFamily = 'inherit';
        btn.style.height = '32px';
        btn.style.minWidth = '40px';
        btn.style.display = 'inline-flex';
        btn.style.alignItems = 'center';
        btn.style.justifyContent = 'center';
        btn.style.transition = 'background-color 0.2s ease';
        
        btn.addEventListener('click', clickHandler);
        
        // Hover effects
        btn.addEventListener('mouseenter', function() {
            btn.style.background = 'rgba(255,255,255,0.2)';
        });
        btn.addEventListener('mouseleave', function() {
            btn.style.background = 'rgba(0,0,0,0.8)';
        });
        
        return btn;
    }
    
    function createOverlayControls() {
        debug('Creating overlay controls near video');
        
        // Find the video container to position relative to it
        const videoContainer = document.querySelector('#jwplayer-container, .jwplayer, video').closest('div');
        if (!videoContainer) {
            debug('Could not find video container');
            return;
        }
        
        debug('Found video container:', videoContainer);
        
        // Make sure the video container has relative positioning
        const containerStyle = window.getComputedStyle(videoContainer);
        if (containerStyle.position === 'static') {
            videoContainer.style.position = 'relative';
        }
        
        // Create controls container positioned relative to video
        const controls = document.createElement('div');
        controls.id = 'livebarn-floating-controls';
        controls.style.position = 'absolute';
        controls.style.bottom = '60px';
        controls.style.left = '50%';
        controls.style.transform = 'translateX(-50%)';
        controls.style.display = 'flex';
        controls.style.gap = '12px';
        controls.style.zIndex = '999999';
        controls.style.fontFamily = '-apple-system, BlinkMacSystemFont, sans-serif';
        controls.style.pointerEvents = 'auto';
        controls.style.background = 'rgba(0,0,0,0.8)';
        controls.style.padding = '8px 12px';
        controls.style.borderRadius = '6px';
        controls.style.border = '1px solid rgba(255,255,255,0.2)';
        controls.style.backdropFilter = 'blur(10px)';
        
        // Create speed control
        const speedBtn = createStyledButton('1x', 'Playback Speed', function() {
            cycleSpeed(this);
        });
        
        // Create forward button
        const forwardBtn = createStyledButton('⏩', 'Forward 10 seconds', function() {
            video.currentTime = Math.min(video.currentTime + 10, video.duration);
            debug('Jumped forward 10 seconds');
        });
        
        controls.appendChild(speedBtn);
        controls.appendChild(forwardBtn);
        
        // Add to video container instead of body
        videoContainer.appendChild(controls);
        
        // Debug the actual position
        setTimeout(function() {
            const rect = controls.getBoundingClientRect();
            debug('Overlay controls position:', {
                width: rect.width,
                height: rect.height,
                top: rect.top,
                left: rect.left,
                bottom: rect.bottom,
                right: rect.right
            });
        }, 100);
        
        controlsAdded = true;
        debug('Overlay controls created and attached to video container');
    }
    
    const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2, 4];
    let currentSpeedIndex = 2; // Start at 1x
    
    function cycleSpeed(button) {
        currentSpeedIndex = (currentSpeedIndex + 1) % speeds.length;
        const speed = speeds[currentSpeedIndex];
        video.playbackRate = speed;
        button.textContent = speed + 'x';
        debug('Speed changed to ' + speed + 'x');
    }
    
    // Try multiple times to find the video
    function findVideo() {
        debug('Searching for video...');
        
        // Check every 2 seconds
        const interval = setInterval(function() {
            if (document.querySelector('video')) {
                debug('Video found! Creating controls...');
                createFloatingControls();
                clearInterval(interval);
            } else {
                debug('Still searching for video...');
            }
        }, 2000);
        
        // Stop after 2 minutes
        setTimeout(function() {
            clearInterval(interval);
            debug('Search timeout - giving up');
        }, 120000);
    }
    
    // Start immediately
    debug('Extension V2 starting...');
    findVideo();
    
    // Also try when page loads
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', findVideo);
    }
    
    // Also try on navigation
    window.addEventListener('popstate', function() {
        setTimeout(findVideo, 1000);
    });
    
})();