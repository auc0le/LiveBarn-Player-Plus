// LiveBarn Enhanced Player Extension - Version 3 (Aggressive Integration)
(function() {
    'use strict';
    
    let video = null;
    let controlsAdded = false;
    
    function debug(message, element = null) {
        console.log('[LiveBarn Extension V3] ' + message, element);
    }
    
    function createFloatingControls() {
        if (controlsAdded) return;
        
        debug('Starting aggressive control integration...');
        
        // Find video element first
        video = document.querySelector('video');
        if (!video) {
            debug('No video found');
            return;
        }
        
        debug('Video found, attempting aggressive integration...');
        
        // Remove any existing controls first
        const existing = document.getElementById('livebarn-floating-controls');
        if (existing) {
            existing.remove();
            debug('Removed existing controls');
        }
        
        // Try multiple strategies to find and integrate with controls
        if (tryJWPlayerIntegration()) return;
        if (tryVideoJSIntegration()) return;
        if (tryGenericPlayerIntegration()) return;
        if (tryAggressiveDOMSearch()) return;
        
        // Final fallback: Create positioned overlay
        debug('All integration attempts failed, falling back to overlay');
        createOverlayControls();
    }
    
    function tryJWPlayerIntegration() {
        debug('Trying JWPlayer integration...');
        
        // JWPlayer specific selectors
        const selectors = [
            '.jw-controlbar .jw-button-container',
            '.jw-controlbar',
            '.jwplayer .jw-controls .jw-controlbar',
            '.jw-controls-left',
            '.jw-group'
        ];
        
        for (let selector of selectors) {
            const controlBar = document.querySelector(selector);
            if (controlBar) {
                debug('Found JWPlayer control bar:', controlBar);
                
                // Look for play button or first button
                const playButton = controlBar.querySelector('.jw-icon-play, .jw-button-play, button[aria-label*="play" i]');
                const firstButton = controlBar.querySelector('button, .jw-button, .jw-icon');
                
                const targetButton = playButton || firstButton;
                
                if (targetButton) {
                    debug('Found target button for insertion:', targetButton);
                    return insertButtonsBeforeTarget(targetButton, 'jwplayer');
                } else {
                    // Try to append to the control bar directly
                    debug('No target button found, trying to prepend to control bar');
                    return prependButtonsToContainer(controlBar, 'jwplayer');
                }
            }
        }
        
        return false;
    }
    
    function tryVideoJSIntegration() {
        debug('Trying Video.js integration...');
        
        const selectors = [
            '.vjs-control-bar',
            '.video-js .vjs-control-bar',
            '.vjs-controls'
        ];
        
        for (let selector of selectors) {
            const controlBar = document.querySelector(selector);
            if (controlBar) {
                debug('Found Video.js control bar:', controlBar);
                
                const playButton = controlBar.querySelector('.vjs-play-control, button[title*="play" i]');
                const firstButton = controlBar.querySelector('button, .vjs-control');
                
                const targetButton = playButton || firstButton;
                
                if (targetButton) {
                    debug('Found Video.js target button:', targetButton);
                    return insertButtonsBeforeTarget(targetButton, 'videojs');
                } else {
                    return prependButtonsToContainer(controlBar, 'videojs');
                }
            }
        }
        
        return false;
    }
    
    function tryGenericPlayerIntegration() {
        debug('Trying generic player integration...');
        
        // Cast a wide net for any control bar
        const selectors = [
            '[class*="control-bar"]',
            '[class*="controls"]',
            '[class*="player-controls"]',
            '[class*="control"][class*="bar"]',
            '[class*="toolbar"]',
            'div[class*="control"]'
        ];
        
        for (let selector of selectors) {
            const elements = document.querySelectorAll(selector);
            
            for (let element of elements) {
                // Check if this element contains buttons and is near the video
                const buttons = element.querySelectorAll('button, [role="button"], [class*="button"]');
                if (buttons.length > 0) {
                    debug('Found generic control bar with buttons:', element);
                    
                    // Try to find a play button
                    const playButton = Array.from(buttons).find(btn => {
                        const text = (btn.textContent || btn.title || btn.getAttribute('aria-label') || '').toLowerCase();
                        return text.includes('play') || btn.className.includes('play');
                    });
                    
                    const targetButton = playButton || buttons[0];
                    
                    if (targetButton) {
                        debug('Found generic target button:', targetButton);
                        if (insertButtonsBeforeTarget(targetButton, 'generic')) {
                            return true;
                        }
                    }
                }
            }
        }
        
        return false;
    }
    
    function tryAggressiveDOMSearch() {
        debug('Trying aggressive DOM search...');
        
        // Find all buttons near the video
        const allButtons = document.querySelectorAll('button, [role="button"]');
        const videoRect = video.getBoundingClientRect();
        
        let bestCandidate = null;
        let minDistance = Infinity;
        
        for (let button of allButtons) {
            const buttonRect = button.getBoundingClientRect();
            
            // Calculate distance from video
            const distance = Math.abs(buttonRect.bottom - videoRect.bottom) + 
                           Math.abs(buttonRect.left - videoRect.left);
            
            // Check if button looks like it might be a play button
            const text = (button.textContent || button.title || button.getAttribute('aria-label') || '').toLowerCase();
            const isPlayLike = text.includes('play') || button.className.includes('play') || 
                              button.querySelector('[class*="play"]');
            
            if (distance < minDistance && (isPlayLike || distance < 200)) {
                minDistance = distance;
                bestCandidate = button;
            }
        }
        
        if (bestCandidate) {
            debug('Found aggressive candidate button:', bestCandidate);
            return insertButtonsBeforeTarget(bestCandidate, 'aggressive');
        }
        
        return false;
    }
    
    function insertButtonsBeforeTarget(targetButton, type) {
        debug(`Attempting to insert buttons before target (${type}):`, targetButton);
        
        try {
            const speedBtn = createIntegratedButton('1x', 'Playback Speed', function() {
                cycleSpeed(this);
            }, type);
            
            const forwardBtn = createIntegratedButton('', 'Forward 10 seconds', function() {
                video.currentTime = Math.min(video.currentTime + 10, video.duration);
                debug('Jumped forward 10 seconds');
            }, type);
            
            // Insert speed button first (leftmost)
            targetButton.parentNode.insertBefore(speedBtn, targetButton);
            // Insert forward button between speed and target
            targetButton.parentNode.insertBefore(forwardBtn, targetButton);
            
            debug('Successfully integrated buttons before target');
            controlsAdded = true;
            return true;
            
        } catch (error) {
            debug('Failed to insert buttons before target:', error);
            return false;
        }
    }
    
    function prependButtonsToContainer(container, type) {
        debug(`Attempting to prepend buttons to container (${type}):`, container);
        
        try {
            const speedBtn = createIntegratedButton('1x', 'Playback Speed', function() {
                cycleSpeed(this);
            }, type);
            
            const forwardBtn = createIntegratedButton('', 'Forward 10 seconds', function() {
                video.currentTime = Math.min(video.currentTime + 10, video.duration);
                debug('Jumped forward 10 seconds');
            }, type);
            
            // Insert at the beginning
            container.insertBefore(forwardBtn, container.firstChild);
            container.insertBefore(speedBtn, container.firstChild);
            
            debug('Successfully prepended buttons to container');
            controlsAdded = true;
            return true;
            
        } catch (error) {
            debug('Failed to prepend buttons to container:', error);
            return false;
        }
    }
    
    function createIntegratedButton(text, title, clickHandler, playerType) {
        const btn = document.createElement('button');
        btn.title = title;
        btn.type = 'button';
        
        // Check if this is the forward button to create custom SVG
        if (title.includes('Forward')) {
            btn.innerHTML = createForwardButtonSVG();
        } else {
            btn.textContent = text;
        }
        
        // Base styles that should work with most players
        btn.style.background = 'transparent';
        btn.style.border = 'none';
        btn.style.color = 'inherit';
        btn.style.cursor = 'pointer';
        btn.style.padding = '8px 12px';
        btn.style.margin = '0 4px';
        btn.style.fontSize = '14px';
        btn.style.fontFamily = 'inherit';
        btn.style.display = 'inline-flex';
        btn.style.alignItems = 'center';
        btn.style.justifyContent = 'center';
        btn.style.minWidth = '40px';
        btn.style.height = '40px';
        btn.style.borderRadius = '4px';
        btn.style.transition = 'all 0.2s ease';
        btn.style.outline = 'none';
        
        // Player-specific styling
        switch (playerType) {
            case 'jwplayer':
                btn.className = 'jw-button jw-icon jw-icon-inline livebarn-custom-btn';
                btn.style.color = '#ffffff';
                break;
            case 'videojs':
                btn.className = 'vjs-control vjs-button livebarn-custom-btn';
                break;
            default:
                btn.className = 'livebarn-custom-btn';
                // Try to inherit colors from nearby buttons
                const nearbyButton = btn.parentNode?.querySelector('button');
                if (nearbyButton) {
                    const computedStyle = window.getComputedStyle(nearbyButton);
                    btn.style.color = computedStyle.color;
                    btn.style.fontSize = computedStyle.fontSize;
                }
                break;
        }
        
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            clickHandler.call(this);
        });
        
        // Hover effects
        btn.addEventListener('mouseenter', function() {
            btn.style.backgroundColor = 'rgba(255,255,255,0.1)';
        });
        btn.addEventListener('mouseleave', function() {
            btn.style.backgroundColor = 'transparent';
        });
        
        return btn;
    }
    
    function createForwardButtonSVG() {
        // Use the user's custom forward SVG
        return `
            <svg class="jw-svg-icon jw-svg-icon-forward" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1080" focusable="false" style="width: 24px; height: 24px;">
                <g transform="translate(-1052.3457,87.44336)">
                    <g transform="translate(1434.3945,-88.34375)">
                        <path style="fill:currentColor;fill-rule:nonzero;stroke:none;" d="m 257.87305,596.64453 c -6.3189,-0.60103 -12.71382,1.60585 -17.34766,6.25586 l -58.5,58.5 30.59961,30.60156 21.59961,-21.60156 v 229.5 l 43.20117,0.45117 V 618.20117 c 0.0215,-8.75286 -5.2427,-16.65336 -13.32812,-20.00586 -2.02136,-0.83812 -4.11831,-1.35043 -6.22461,-1.55078 z"/>
                        <path style="fill:currentColor;fill-rule:nonzero;stroke:none;" d="m 429.52539,596.15039 c -32.92103,1.36426 -62.90715,19.323 -79.65039,47.70117 -38.70038,64.05862 -38.70038,144.29099 0,208.34961 16.74324,28.37817 46.72936,46.33495 79.65039,47.69922 32.92105,-1.36427 62.90715,-19.32105 79.65039,-47.69922 38.7004,-64.05863 38.7004,-144.29099 0,-208.34961 -16.74324,-28.37817 -46.72934,-46.33691 -79.65039,-47.70117 z m 0,43.20117 c 35.1,0 64.79883,49.49922 64.79883,108.44922 0,58.95 -29.24883,108.45117 -64.79883,108.45117 -35.1,0 -64.80078,-49.50117 -64.80078,-108.45117 0,-58.95 29.70078,-108.44922 64.80078,-108.44922 z"/>
                    </g>
                    <path style="fill:currentColor;fill-rule:nonzero;stroke:none;" d="m 1801.5273,91.056641 c -9.58,1.415039 -15.9082,10.343749 -15.9082,25.249999 v 86.84961 h -585.4492 c -12.1031,0.17874 -21.8721,9.94772 -22.0508,22.05078 v 563.84961 c 0.162,11.8615 9.7382,21.43741 21.5997,21.59961 h 282.1503 V 723.80664 H 1264.9688 V 290.00781 h 520.6503 v 86.84961 c 0,23.85 16.2,32.39961 36,19.34961 l 188.0997,-125.55078 c 13.2109,-6.66039 18.6233,-22.69633 12.1503,-36 -2.5876,-5.28743 -6.8629,-9.56085 -12.1503,-12.14844 L 1821.6191,96.957031 c -7.425,-4.89375 -14.3437,-6.749414 -20.0918,-5.90039 z"/>
                </g>
            </svg>
        `;
    }
    
    function createOverlayControls() {
        debug('Creating fallback overlay controls');
        
        // Find the video container to position relative to it
        const videoContainer = video.closest('div') || document.body;
        
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
        
        controlsAdded = true;
        debug('Fallback overlay controls created');
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
    
    const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2, 4];
    let currentSpeedIndex = 2; // Start at 1x
    
    function cycleSpeed(button) {
        currentSpeedIndex = (currentSpeedIndex + 1) % speeds.length;
        const speed = speeds[currentSpeedIndex];
        video.playbackRate = speed;
        button.textContent = speed + 'x';
        debug('Speed changed to ' + speed + 'x');
    }
    
    // More aggressive search function
    function findVideoAndControls() {
        debug('Searching for video and controls...');
        
        let attempts = 0;
        const maxAttempts = 30; // 60 seconds total
        
        const interval = setInterval(function() {
            attempts++;
            debug(`Search attempt ${attempts}/${maxAttempts}`);
            
            const videoElement = document.querySelector('video');
            if (videoElement && !controlsAdded) {
                debug('Video found! Attempting control integration...');
                
                // Wait a bit for controls to be ready
                setTimeout(() => {
                    createFloatingControls();
                }, 50);
                
                clearInterval(interval);
            } else if (attempts >= maxAttempts) {
                debug('Search timeout - giving up');
                clearInterval(interval);
            }
        }, 250);
    }
    
    // Start immediately
    debug('Extension V3 starting with aggressive integration...');
    findVideoAndControls();
    
    // Also try when page loads
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', findVideoAndControls);
    }
    
    // Also try on navigation and dynamic content changes
    window.addEventListener('popstate', function() {
        controlsAdded = false;
        setTimeout(findVideoAndControls, 1000);
    });
    
    // Watch for dynamic content changes
    const observer = new MutationObserver(function(mutations) {
        if (!controlsAdded) {
            for (let mutation of mutations) {
                if (mutation.addedNodes.length > 0) {
                    // Check if video or controls were added
                    for (let node of mutation.addedNodes) {
                        if (node.nodeType === 1) { // Element node
                            if (node.querySelector && (node.querySelector('video') || node.querySelector('[class*="control"]'))) {
                                debug('Detected dynamic content change with video/controls');
                                setTimeout(() => {
                                    if (!controlsAdded) {
                                        findVideoAndControls();
                                    }
                                }, 1000);
                                break;
                            }
                        }
                    }
                }
            }
        }
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
})();