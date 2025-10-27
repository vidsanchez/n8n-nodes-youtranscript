import { IExecuteFunctions, INodeExecutionData, INodeType, INodeTypeDescription, NodeApiError, NodeOperationError } from 'n8n-workflow';
import convert from 'xml-js';

// Interfaces for the data structure
interface Snippet {
    text: string;
    start: number;
    duration: number;
}

export class YouTubeTranscript implements INodeType {
    description: INodeTypeDescription = {
        displayName: 'YouTube Transcript',
        name: 'youTubeTranscript',
        icon: 'file:YouTube.icon.svg',
        group: ['transform'],
        version: 2,
        description: 'Gets the transcript of a YouTube video.',
        defaults: {
            name: 'YouTube Transcript',
        },
        inputs: ['main'],
        outputs: ['main'],
        properties: [
            {
                displayName: 'Operation',
                name: 'operation',
                type: 'options',
                options: [
                    {
                        name: 'Get Transcript',
                        value: 'getTranscript',
                        description: 'Get the transcript of a YouTube video',
                    },
                    {
                        name: 'List Available Languages',
                        value: 'listLanguages',
                        description: 'List the available transcript languages for a YouTube video',
                    },
                ],
                default: 'getTranscript',
                description: 'The operation to perform.',
            },
            {
                displayName: 'Video ID',
                name: 'videoId',
                type: 'string',
                default: '',
                placeholder: 'Enter YouTube Video ID',
                description: 'The ID of the YouTube video',
                displayOptions: {
                    show: {
                        operation: ['getTranscript', 'listLanguages'],
                    },
                },
            },
            {
                displayName: 'Languages',
                name: 'languages',
                type: 'string',
                default: '',
                placeholder: 'en,es',
                description: 'Comma-separated list of languages in order of preference. Leave empty for default.',
                displayOptions: {
                    show: {
                        operation: ['getTranscript'],
                    },
                },
            },
            {
                displayName: 'Proxy',
                name: 'proxy',
                type: 'string',
                default: '',
                placeholder: 'http://proxy.example.com:8080',
                description: 'Optional proxy URL to use for requests (e.g., http://proxy.example.com:8080 or socks5://proxy.example.com:1080)',
                displayOptions: {
                    show: {
                        operation: ['getTranscript', 'listLanguages'],
                    },
                },
            },
        ],
    };

    async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
        const items = this.getInputData();
        const returnData: INodeExecutionData[] = [];
        const operation = this.getNodeParameter('operation', 0, 'getTranscript') as string;

        for (let i = 0; i < items.length; i++) {
            const videoId = this.getNodeParameter('videoId', i, '') as string;
            const proxy = this.getNodeParameter('proxy', i, '') as string;

            // Prepare request options with proxy if provided
            const requestOptions: any = {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept-Language': 'en-US,en;q=0.9',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                },
            };
            if (proxy) {
                requestOptions.proxy = proxy;
            }

            try {
                const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
                const response = await this.helpers.httpRequest({ url: watchUrl, ...requestOptions });
                const html = response.toString();

                const apiKeyMatch = html.match(/"INNERTUBE_API_KEY":\s*"([a-zA-Z0-9_-]+)"/);
                if (!apiKeyMatch || apiKeyMatch.length < 2) {
                    throw new Error('Could not find INNERTUBE_API_KEY');
                }
                const apiKey = apiKeyMatch[1];

                const innertubeUrl = `https://www.youtube.com/youtubei/v1/player?key=${apiKey}`;
                const innertubeResponse = await this.helpers.httpRequest({
                    method: 'POST',
                    url: innertubeUrl,
                    body: {
                        context: {
                            client: {
                                clientName: 'WEB',
                                clientVersion: '2.20210721.00.00',
                            },
                        },
                        videoId,
                    },
                    json: true,
                    ...requestOptions,
                });

                const innertubeData: any = innertubeResponse;
                const captionsJson = innertubeData.captions?.playerCaptionsTracklistRenderer;
                if (!captionsJson || !captionsJson.captionTracks) {
                    throw new Error('Transcripts disabled for this video');
                }

                const transcriptList = captionsJson.captionTracks.map((track: any) => ({
                    video_id: videoId,
                    url: track.baseUrl,
                    language: track.name.simpleText,
                    language_code: track.languageCode,
                    is_generated: track.kind === 'asr',
                }));

                if (operation === 'listLanguages') {
                    returnData.push({ json: { availableLanguages: transcriptList.map((t: any) => t.language_code) } });
                    continue;
                }

                const languagesRaw = this.getNodeParameter('languages', i, '') as string;
                const languages = languagesRaw.split(',').filter(lang => lang.trim() !== '');

                let transcriptTrack: any;
                if (languages.length > 0) {
                    for (const lang of languages) {
                        transcriptTrack = transcriptList.find((t: any) => t.language_code === lang);
                        if (transcriptTrack) {
                            break;
                        }
                    }
                } else {
                    // Default behavior: find manually created transcript first, then auto-generated
                    transcriptTrack = transcriptList.find((t: any) => !t.is_generated);
                    if (!transcriptTrack) {
                        transcriptTrack = transcriptList[0];
                    }
                }

                if (!transcriptTrack) {
                    throw new Error(`No transcript found for languages: ${languages.join(', ')}`);
                }

                const transcriptXmlResponse = await this.helpers.httpRequest({ url: transcriptTrack.url, ...requestOptions });
                const transcriptXml = transcriptXmlResponse.toString();

                const result: any = convert.xml2js(transcriptXml, { compact: true });
                let snippets: Snippet[] = [];
                if (result.transcript && result.transcript.text) {
                    const texts = Array.isArray(result.transcript.text) ? result.transcript.text : [result.transcript.text];
                    snippets = texts.map((t: any) => ({
                        text: t._text,
                        start: parseFloat(t._attributes.start),
                        duration: parseFloat(t._attributes.dur || '0.0'),
                    }));
                }

                returnData.push({
                    json: {
                        transcript: snippets.map((t: Snippet) => t.text).join(' '),
                        snippets: snippets,
                    },
                });
            } catch (error) {
                if (this.continueOnFail()) {
                    const err = error as any;
                    const errorMessage = err.response?.status === 429 
                        ? 'YouTube rate limit exceeded (429). Try using a proxy or waiting before retrying.'
                        : err.message;
                    returnData.push({ json: { error: errorMessage }, error: new NodeOperationError(this.getNode(), err) });
                    continue;
                }
                const err = error as any;
                if (err.response?.status === 429) {
                    throw new NodeOperationError(
                        this.getNode(),
                        'YouTube rate limit exceeded (429). Please try: 1) Using a proxy in the Proxy field, 2) Waiting a few minutes before retrying, or 3) Using a different network.',
                    );
                }
                throw error;
            }
        }

        return this.prepareOutputData(returnData);
    }
}