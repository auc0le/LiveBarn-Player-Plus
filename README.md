# LiveBarn Enhanced Player

A Firefox extension that enhances LiveBarn's video player with professional playback controls.

## Features

- **Variable Speed Playback**: Control video speed from 0.5x to 4x (0.5x, 0.75x, 1x, 1.25x, 1.5x, 2x, 4x)
- **Forward 10 Seconds**: Jump forward 10 seconds to match LiveBarn's existing rewind functionality
- **Native Integration**: Seamlessly integrates with LiveBarn's existing player controls
- **Automatic Detection**: Works on all LiveBarn video pages without configuration

## Installation

### Method 1: Temporary Installation (Development)
1. Download or clone this repository
2. Open Firefox and navigate to `about:debugging`
3. Click "This Firefox" in the sidebar
4. Click "Load Temporary Add-on"
5. Select the `manifest.json` file from the extension folder
6. The extension will be active until you restart Firefox

### Method 2: Permanent Installation
1. Download the repository as a ZIP file
2. Extract to a permanent location on your computer
3. Follow Method 1 steps, but the extension will remain installed
4. Note: You'll need to reload it if you restart Firefox

## Usage

Once installed, the extension automatically activates when you visit any LiveBarn video page.

### Speed Control
- Located to the left of the play button
- Click to open dropdown menu with speed options
- Current speed is displayed (e.g., "1x", "2x")
- Select any speed from 0.5x to 4x

### Forward Button
- Located between the next track button and audio controls
- Click to jump forward 10 seconds
- Matches the design of LiveBarn's existing rewind button

## Technical Details

### Files
- `manifest.json` - Extension configuration and permissions
- `content.js` - Main functionality and DOM manipulation
- `styles.css` - Custom styling to match LiveBarn's player theme

### Browser Compatibility
- **Firefox**: Full support (tested)
- **Chrome**: Not compatible (uses Manifest V2)

### Permissions
- `activeTab` - Only accesses the current LiveBarn tab when active

## How It Works

The extension uses content scripts to:
1. Wait for LiveBarn's video player to load
2. Locate the video element and control bar
3. Inject custom controls at specified positions
4. Style controls to match the existing player theme
5. Handle playback rate changes and time jumping

## Troubleshooting

### Extension Not Working
- Ensure you're on a LiveBarn video page
- Check that the video player has fully loaded
- Try refreshing the page
- Verify the extension is enabled in `about:addons`

### Controls Not Appearing
- LiveBarn may have updated their player structure
- The extension waits up to 30 seconds for the player to load
- Try reloading the extension in `about:debugging`

### Speed Changes Not Working
- Ensure the video is loaded and playable
- Some live streams may not support all playback speeds
- Check browser console for JavaScript errors

## Development

### Modifying the Extension
1. Edit the relevant files (`content.js` for functionality, `styles.css` for appearance)
2. Go to `about:debugging` → "This Firefox"
3. Click "Reload" next to the extension
4. Refresh the LiveBarn page to see changes

### Adding New Features
The extension is structured to easily add new controls:
- Add UI elements in `content.js`
- Style them in `styles.css`
- Follow the existing pattern for integration

### Debugging
- Open browser developer tools (F12)
- Check the Console tab for error messages
- Use the Inspector to examine DOM changes

## Limitations

- Only works on LiveBarn.com domains
- Requires manual installation (not in Firefox Add-ons store)
- May need updates if LiveBarn changes their player structure
- Speed control effectiveness depends on video source and browser capabilities

## Browser Compatibility Note

This extension uses Manifest V2, which is:
- ✅ **Supported in Firefox** (indefinitely)
- ❌ **Deprecated in Chrome** (moving to Manifest V3)

For Chrome compatibility, the extension would need to be rewritten for Manifest V3.

## Legal

This extension modifies the user interface of LiveBarn.com for personal use enhancement. It does not:
- Bypass any content restrictions
- Download or redistribute copyrighted content
- Interfere with LiveBarn's core functionality
- Collect or transmit user data

Use responsibly and in accordance with LiveBarn's terms of service.

## Contributing

Feel free to:
- Report issues or bugs
- Suggest new features
- Submit improvements
- Fork for personal modifications

## Version History

### v1.0
- Initial release
- Variable speed playback (0.5x - 4x)
- Forward 10 seconds button
- Native UI integration