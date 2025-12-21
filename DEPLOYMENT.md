# Deployment Guide

## Important Notes for 2025

### CORS and API Access

The SoundCloud Randomizer makes client-side requests to the SoundCloud API. Due to CORS (Cross-Origin Resource Sharing) policies, there are some considerations:

1. **GitHub Pages Deployment**: The app works best when deployed to GitHub Pages or any web server with HTTPS
2. **Local Testing**: When testing locally, you may need to:
   - Use a proper web server (not just opening the file directly)
   - Some browser extensions (ad blockers, privacy extensions) may block API requests
   - Temporarily disable extensions or whitelist `soundcloud.com` and `api-v2.soundcloud.com`

### Deployment Options

#### GitHub Pages (Recommended)
1. Push your changes to the repository
2. Go to Settings → Pages in your GitHub repository
3. Select the branch to deploy (usually `main` or `master`)
4. The site will be available at `https://[username].github.io/[repo-name]/`

#### Local Testing with Python
```bash
# Python 3
python3 -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

Then open `http://localhost:8000` in your browser.

#### Local Testing with Node.js
```bash
npx http-server -p 8000
```

### SoundCloud API Considerations

- The app uses SoundCloud API v2 with fallback to v1
- A public client ID is included for demo purposes
- For production use, consider registering your own app at https://soundcloud.com/you/apps
- The SoundCloud Widget API is used for playback, which doesn't require authentication

### Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge) are required
- JavaScript must be enabled
- Autoplay may be restricted by browser policies - users may need to interact with the page first

## Troubleshooting

### "No tracks found" Message
- Try different genre combinations
- Ensure your browser isn't blocking API requests
- Check browser console for errors (F12)
- Disable ad blockers or privacy extensions temporarily

### Widget Not Loading
- Ensure the track URL is valid
- Check that SoundCloud's embed service is accessible
- Some corporate networks may block SoundCloud

### API Rate Limiting
- The SoundCloud API has rate limits
- If you hit rate limits, wait a few minutes and try again
- For high-traffic sites, register your own API app
