// LiveBarn Enhanced Player Extension
(function() {
    'use strict';
    
    let video = null;
    let controlsBar = null;
    let speedControl = null;
    let forwardButton = null;
    
    // Wait for video player to load
    function waitForPlayer() {
        const checkInterval = setInterval(() => {
            video = document.querySelector('video');
            controlsBar = document.querySelector('.vjs-control-bar, .video-js .vjs-control-bar, [class*="control"], [class*="controls"]');
            
            if (video && controlsBar) {
                clearInterval(checkInterval);
                initializeControls();
            }
        }, 500);
        
        // Stop checking after 30 seconds
        setTimeout(() => clearInterval(checkInterval), 30000);
    }
    
    function initializeControls() {
        addSpeedControl();
        addForwardButton();
        
        // Re-add controls if the player reloads
        const observer = new MutationObserver(() => {
            if (!document.querySelector('.livebarn-speed-control')) {
                addSpeedControl();
            }
            if (!document.querySelector('.livebarn-forward-btn')) {
                addForwardButton();
            }
        });
        
        observer.observe(controlsBar, { childList: true, subtree: true });
    }
    
    function addSpeedControl() {
        // Find the play button to insert before it
        const playButton = controlsBar.querySelector('[class*="play"], .vjs-play-control, button[title*="Play"], button[title*="play"]');
        
        if (!playButton || document.querySelector('.livebarn-speed-control')) return;
        
        // Create speed control container
        speedControl = document.createElement('div');
        speedControl.className = 'livebarn-speed-control vjs-control vjs-button';
        speedControl.setAttribute('role', 'button');
        speedControl.setAttribute('tabindex', '0');
        speedControl.setAttribute('title', 'Playback Speed');
        
        // Create speed display
        const speedDisplay = document.createElement('span');
        speedDisplay.className = 'livebarn-speed-display';
        speedDisplay.textContent = '1x';
        
        // Create dropdown
        const dropdown = document.createElement('div');
        dropdown.className = 'livebarn-speed-dropdown';
        dropdown.style.display = 'none';
        
        const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2, 4];
        speeds.forEach(speed => {
            const option = document.createElement('div');
            option.className = 'livebarn-speed-option';
            option.textContent = speed + 'x';
            option.setAttribute('data-speed', speed);
            if (speed === 1) option.classList.add('active');
            
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                setPlaybackSpeed(speed);
                speedDisplay.textContent = speed + 'x';
                
                // Update active state
                dropdown.querySelectorAll('.livebarn-speed-option').forEach(opt => {
                    opt.classList.remove('active');
                });
                option.classList.add('active');
                
                dropdown.style.display = 'none';
            });
            
            dropdown.appendChild(option);
        });
        
        speedControl.appendChild(speedDisplay);
        speedControl.appendChild(dropdown);
        
        // Toggle dropdown on click
        speedControl.addEventListener('click', (e) => {
            e.stopPropagation();
            const isVisible = dropdown.style.display === 'block';
            dropdown.style.display = isVisible ? 'none' : 'block';
        });
        
        // Close dropdown when clicking elsewhere
        document.addEventListener('click', () => {
            dropdown.style.display = 'none';
        });
        
        // Insert before play button
        controlsBar.insertBefore(speedControl, playButton);
    }
    
    function addForwardButton() {
        // Find the audio/volume control to insert before it
        const audioControl = controlsBar.querySelector('[class*="volume"], [class*="audio"], .vjs-volume-control, .vjs-mute-control');
        // Fallback: find next track button and insert after it
        const nextButton = controlsBar.querySelector('[class*="next"], [title*="Next"], [title*="next"]');
        
        const insertTarget = audioControl || (nextButton ? nextButton.nextElementSibling : null);
        
        if (!insertTarget || document.querySelector('.livebarn-forward-btn')) return;
        
        // Create forward button
        forwardButton = document.createElement('button');
        forwardButton.className = 'livebarn-forward-btn vjs-control vjs-button';
        forwardButton.setAttribute('type', 'button');
        forwardButton.setAttribute('title', 'Forward 10 seconds');
        forwardButton.setAttribute('aria-label', 'Forward 10 seconds');
        
        // Create icon (forward arrow)
        const icon = document.createElement('span');
        icon.className = 'livebarn-forward-icon';
        icon.innerHTML = '⏩'; // Using emoji as fallback, will be styled with CSS
        
        forwardButton.appendChild(icon);
        
        // Add click handler
        forwardButton.addEventListener('click', () => {
            if (video) {
                video.currentTime = Math.min(video.currentTime + 10, video.duration);
            }
        });
        
        // Insert before audio control or after next button
        if (audioControl) {
            controlsBar.insertBefore(forwardButton, audioControl);
        } else if (nextButton) {
            nextButton.parentNode.insertBefore(forwardButton, nextButton.nextSibling);
        }
    }
    
    function setPlaybackSpeed(speed) {
        if (video) {
            video.playbackRate = speed;
        }
    }
    
    // Initialize when page loads
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', waitForPlayer);
    } else {
        waitForPlayer();
    }
    
    // Also check when navigating within the app
    window.addEventListener('popstate', () => {
        setTimeout(waitForPlayer, 1000);
    });
    
})();