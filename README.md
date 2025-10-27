# n8n-nodes-youtranscript 📝

This is an n8n community node that lets you use **YouTube Transcripts** in your n8n workflows. Because sometimes you need to know what people are saying in videos without actually watching them.

[YouTube](https://www.youtube.com/) is the world's largest video platform. It has transcripts for most videos, but accessing them programmatically? That's where things get interesting.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/sustainable-use-license/) workflow automation platform.

## Table of Contents

- [Installation](#installation)
- [The "How Did This Happen?" Story](#the-how-did-this-happen-story)
- [Operations](#operations)
- [Compatibility](#compatibility)
- [Usage](#usage)
- [Resources](#resources)

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

TL;DR:
```bash
npm install n8n-nodes-youtranscript
```

## The "How Did This Happen?" Story

Let's be honest here: YouTube has transcripts, but they don't exactly make it easy to grab them programmatically. So what's a developer to do when they want to automate transcript extraction?

**Reverse engineering**, of course. 🔧

This community node has been inspired by the excellent work done in the [youtube-transcript-api](https://github.com/jdepoix/youtube-transcript-api) Python library. By understanding how YouTube's internal API works, we've built a Node.js implementation that brings transcript extraction to n8n workflows.

The node works by:
1. Fetching the YouTube video page
2. Extracting the `INNERTUBE_API_KEY` from the page
3. Calling YouTube's internal player API to get caption tracks
4. Downloading and parsing the transcript XML

All of these calls are legitimate interactions with YouTube's publicly accessible endpoints. So, let's celebrate the engineering achievement: it took time and effort to make it happen. ;-)

### What This Node Can Do

- **Get Transcripts**: Extract the full transcript of any YouTube video with available captions
- **Multi-language Support**: Specify your preferred languages in order of preference
- **List Available Languages**: Check which transcript languages are available for a video
- **Auto-generated vs Manual**: Automatically prefers manually created transcripts over auto-generated ones

All of this by talking directly to YouTube's internal endpoints. No API key needed. *What could possibly go wrong?* 😅

### The Fine Print

⚠️ **Important Disclaimer**: Since this is based on reverse engineering:
- Things might break if YouTube changes their internal API (and they will, eventually)
- This is not officially supported by YouTube (obviously)
- Use at your own risk, but also... use it because it's awesome
- If YouTube releases an official transcript API, we'll all pretend this never happened
- Respect YouTube's terms of service and rate limits

## Operations

This node currently supports the following operations:

### Get Transcript
- **Video ID**: The YouTube video ID (the part after `?v=` in the URL)
- **Languages**: Optional comma-separated list of language codes (e.g., `en,es,fr`)
  - If specified, the node will try to find a transcript in the first available language
  - If not specified, it will prefer manually created transcripts over auto-generated ones
- **Output**: Returns the full transcript as text and an array of snippets with timestamps

### List Available Languages
- **Video ID**: The YouTube video ID
- **Output**: Returns an array of available language codes for the video's transcripts

## Compatibility

- **Minimum n8n version**: 0.198.0
- **Tested with**: n8n 1.115.2

**Known Issues**:
- If YouTube updates their internal API structure, things might break. When (not if) that happens, we'll update the node accordingly.
- Rate limiting might be a thing. Be gentle with the requests.
- Some videos don't have transcripts available (live streams, very new videos, or videos where the creator disabled them)

## Usage

### Basic Example: Get English Transcript

1. Add the **YouTube Transcript** node to your workflow
2. Select **Get Transcript** operation
3. Enter the video ID (e.g., `dQw4w9WgXcQ`)
4. Leave languages empty or specify `en`
5. Execute!

The output will include:
```json
{
  "transcript": "Full transcript text here...",
  "snippets": [
    {
      "text": "First segment",
      "start": 0.0,
      "duration": 2.5
    },
    {
      "text": "Second segment",
      "start": 2.5,
      "duration": 3.0
    }
  ]
}
```

### Multi-language Example

Want to get a transcript in Spanish, but fall back to English if Spanish isn't available?

1. Set **Languages** to: `es,en`
2. The node will try Spanish first, then English

### Check Available Languages

1. Select **List Available Languages** operation
2. Enter the video ID
3. Get a list of all available language codes

### Tips

- Extract the video ID from URLs using n8n's built-in string manipulation
- Use the snippets array if you need timestamps for each segment
- Combine with AI nodes to summarize or analyze transcripts
- Be mindful of YouTube's terms of service when processing transcripts

## Resources

- [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)
- [youtube-transcript-api](https://github.com/jdepoix/youtube-transcript-api) - The Python library that inspired this node
- [YouTube](https://www.youtube.com/) - The service we're "integrating" with
- [n8n workflows](https://n8n.io/workflows/) - Get inspired by what others are building

## Contributing

Found a bug? YouTube changed their API again? Want to add more features?

Contributions are welcome! This is a community effort to bring YouTube transcript automation to n8n.

---

**Made with ☕ and a healthy dose of curiosity**

*Disclaimer: This is an unofficial, community-built integration. It is not affiliated with, endorsed by, or supported by YouTube or Google. Use responsibly and respect YouTube's terms of service.* 😉
