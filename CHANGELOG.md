# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2024-10-27

### Added
- **Proxy Support**: New optional "Proxy" field to route all HTTP requests through a proxy server
  - Supports HTTP, HTTPS, and SOCKS5 proxy protocols
  - Helps bypass rate limiting and geographical restrictions
  - Available for both "Get Transcript" and "List Available Languages" operations
- **Enhanced Request Headers**: All requests now include realistic browser headers (User-Agent, Accept-Language, Accept)
  - Reduces detection as automated requests
  - Improves compatibility with YouTube's anti-bot measures

### Improved
- **Better Error Handling for Rate Limits**: Specific error messages for HTTP 429 (Too Many Requests)
  - Clear guidance on how to resolve rate limiting issues
  - Suggests using proxy, waiting, or changing network
- **More Robust HTTP Requests**: Improved request configuration to simulate real browser behavior

### Fixed
- Enhanced reliability when dealing with YouTube's rate limiting mechanisms

---

## [0.1.0] - 2024-10-27

### Added
- Initial release of n8n-nodes-youtranscript
- **Get Transcript** operation to extract YouTube video transcripts
- **List Available Languages** operation to check available transcript languages
- Multi-language support with preference order (e.g., `en,es,fr`)
- Automatic preference for manually created transcripts over auto-generated ones
- Timestamp support with snippets array containing start time and duration
- Full transcript text output for easy consumption
- Error handling for videos without transcripts
- Support for both auto-generated and manual captions

### Technical Details
- Extracts INNERTUBE_API_KEY from YouTube video pages
- Uses YouTube's internal player API to fetch caption tracks
- Parses XML transcript data into structured JSON
- Built with TypeScript for type safety
- Uses xml-js for XML parsing

---

## Future Plans

### Planned Features
- [ ] Support for translating transcripts to different languages
- [ ] Batch processing of multiple video IDs
- [ ] Caching mechanism to reduce API calls
- [ ] Custom formatting options for transcript output
- [ ] Support for downloading specific time ranges

### Known Limitations
- Depends on YouTube's internal API structure (may break if YouTube updates their system)
- No official API support from YouTube
- Rate limiting may apply based on YouTube's policies
- Some videos may not have transcripts available (live streams, very new videos, disabled by creator)

---

**Note**: This is a community-maintained project. Updates will be released as needed to maintain compatibility with YouTube's platform.
