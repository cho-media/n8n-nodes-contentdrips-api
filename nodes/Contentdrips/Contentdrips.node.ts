import type {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';

import { NodeConnectionType } from 'n8n-workflow';
import { contentdripsApiRequest, validateRequiredFields, cleanEmptyFields } from './GenericFunctions';

// Use Node.js built-in timer for proper TypeScript support
const wait = (ms: number): Promise<void> => {
	return new Promise((resolve) => {
		const timer = global.setTimeout(resolve, ms);
		// Properly handle timer cleanup
		if (timer && typeof timer === 'object' && 'unref' in timer) {
			timer.unref();
		}
	});
};

// Type guard for job_id validation
function validateJobId(jobId: unknown): string {
	if (typeof jobId !== 'string' || !jobId) {
		throw new Error('Invalid job_id received from Contentdrips API. Expected a valid job ID string.');
	}
	return jobId;
}

export class Contentdrips implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Contentdrips',
		name: 'contentdrips',
		icon: 'file:contentdrips.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Create carousels and static graphics using the Contentdrips API',
		defaults: {
			name: 'Contentdrips',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		credentials: [
			{
				name: 'contentdripsApi',
				required: true,
			},
		],
		requestDefaults: {
			baseURL: 'https://generate.contentdrips.com',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		},
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Graphic',
						value: 'graphic',
					},
					{
						name: 'Carousel',
						value: 'carousel',
					},
					{
						name: 'Job',
						value: 'job',
					},
				],
				default: 'graphic',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['graphic'],
					},
				},
				options: [
					{
						name: 'Create',
						value: 'create',
						description: 'Create a static graphic',
						action: 'Create a graphic',
					},
				],
				default: 'create',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['carousel'],
					},
				},
				options: [
					{
						name: 'Create',
						value: 'create',
						description: 'Create a carousel',
						action: 'Create a carousel',
					},
				],
				default: 'create',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['job'],
					},
				},
				options: [
					{
						name: 'Get Status',
						value: 'getStatus',
						description: 'Get the status of a job',
						action: 'Get job status',
					},
					{
						name: 'Get Result',
						value: 'getResult',
						description: 'Get the result of a completed job',
						action: 'Get job result',
					},
				],
				default: 'getStatus',
			},
			// Template ID - Required for graphic and carousel creation
			{
				displayName: 'Template ID',
				name: 'templateId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['graphic', 'carousel'],
						operation: ['create'],
					},
				},
				default: '',
				description: 'The ID of the Contentdrips template to use',
			},
			// Job ID - Required for job operations
			{
				displayName: 'Job ID',
				name: 'jobId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['job'],
					},
				},
				default: '',
				description: 'The ID of the job to check',
			},
			// Execution Mode
			{
				displayName: 'Execution Mode',
				name: 'executionMode',
				type: 'options',
				displayOptions: {
					show: {
						resource: ['graphic', 'carousel'],
						operation: ['create'],
					},
				},
				options: [
					{
						name: 'Synchronous (Wait for Completion)',
						value: 'sync',
						description: 'Wait for job completion and return final result',
					},
					{
						name: 'Asynchronous (Return Job ID)',
						value: 'async',
						description: 'Return job ID immediately for manual status checking',
					},
				],
				default: 'sync',
				description: 'Whether to wait for completion or return job ID immediately',
			},
			// Polling Settings (only shown in sync mode)
			{
				displayName: 'Polling Interval (seconds)',
				name: 'pollingInterval',
				type: 'number',
				displayOptions: {
					show: {
						resource: ['graphic', 'carousel'],
						operation: ['create'],
						executionMode: ['sync'],
					},
				},
				default: 5,
				description: 'How often to check job status (in seconds)',
				typeOptions: {
					minValue: 1,
					maxValue: 60,
				},
			},
			{
				displayName: 'Max Wait Time (minutes)',
				name: 'maxWaitTime',
				type: 'number',
				displayOptions: {
					show: {
						resource: ['graphic', 'carousel'],
						operation: ['create'],
						executionMode: ['sync'],
					},
				},
				default: 10,
				description: 'Maximum time to wait for job completion (in minutes)',
				typeOptions: {
					minValue: 1,
					maxValue: 60,
				},
			},
			// Output format
			{
				displayName: 'Output Format',
				name: 'output',
				type: 'options',
				displayOptions: {
					show: {
						resource: ['graphic', 'carousel'],
						operation: ['create'],
					},
				},
				options: [
					{
						name: 'PNG',
						value: 'png',
					},
					{
						name: 'PDF',
						value: 'pdf',
					},
				],
				default: 'png',
				description: 'The output format for the generated content',
			},
			// Branding section
			{
				displayName: 'Add Branding',
				name: 'addBranding',
				type: 'boolean',
				displayOptions: {
					show: {
						resource: ['graphic', 'carousel'],
						operation: ['create'],
					},
				},
				default: false,
				description: 'Whether to add branding information to the template',
			},
			{
				displayName: 'Branding',
				name: 'branding',
				type: 'collection',
				placeholder: 'Add Branding Field',
				displayOptions: {
					show: {
						resource: ['graphic', 'carousel'],
						operation: ['create'],
						addBranding: [true],
					},
				},
				default: {},
				options: [
					{
						displayName: 'Name',
						name: 'name',
						type: 'string',
						default: '',
						description: 'Your name or brand name',
					},
					{
						displayName: 'Handle',
						name: 'handle',
						type: 'string',
						default: '',
						description: 'Your social media handle, e.g., @username',
					},
					{
						displayName: 'Bio',
						name: 'bio',
						type: 'string',
						default: '',
						description: 'Short bio or description',
					},
					{
						displayName: 'Website URL',
						name: 'website_url',
						type: 'string',
						default: '',
						description: 'Your website URL',
					},
					{
						displayName: 'Avatar Image URL',
						name: 'avatar_image_url',
						type: 'string',
						default: '',
						description: 'URL to your avatar image',
					},
				],
			},
			// Content Updates
			{
				displayName: 'Content Updates',
				name: 'contentUpdates',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				displayOptions: {
					show: {
						resource: ['graphic', 'carousel'],
						operation: ['create'],
					},
				},
				description: 'Updates to apply to labeled elements in the template',
				default: {},
				options: [
					{
						name: 'updates',
						displayName: 'Update',
						values: [
							{
								displayName: 'Type',
								name: 'type',
								type: 'options',
								options: [
									{
										name: 'Textbox',
										value: 'textbox',
									},
									{
										name: 'Image',
										value: 'image',
									},
								],
								default: 'textbox',
							},
							{
								displayName: 'Label',
								name: 'label',
								type: 'string',
								default: '',
								description: 'The label of the element to update',
							},
							{
								displayName: 'Value',
								name: 'value',
								type: 'string',
								default: '',
								description: 'The new value for the element',
							},
						],
					},
				],
			},
			// Intro Slide Section
			{
				displayName: 'Enable Intro Slide',
				name: 'enableIntroSlide',
				type: 'boolean',
				displayOptions: {
					show: {
						resource: ['carousel'],
						operation: ['create'],
					},
				},
				default: false,
				description: 'Whether to include an intro slide',
			},
			{
				displayName: 'Intro Slide Heading',
				name: 'introSlideHeading',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['carousel'],
						operation: ['create'],
						enableIntroSlide: [true],
					},
				},
				default: '',
				description: 'Heading for the intro slide',
			},
			{
				displayName: 'Intro Slide Description',
				name: 'introSlideDescription',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['carousel'],
						operation: ['create'],
						enableIntroSlide: [true],
					},
				},
				default: '',
				description: 'Description for the intro slide',
			},
			{
				displayName: 'Intro Slide Image URL',
				name: 'introSlideImage',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['carousel'],
						operation: ['create'],
						enableIntroSlide: [true],
					},
				},
				default: '',
				description: 'Image URL for the intro slide',
			},
			// Content Slides Input Method Selection
			{
				displayName: 'Content Slides Input Method',
				name: 'contentSlidesInputMethod',
				type: 'options',
				displayOptions: {
					show: {
						resource: ['carousel'],
						operation: ['create'],
					},
				},
				options: [
					{
						name: 'Build Slides in UI',
						value: 'ui',
						description: 'Manually add slides using the interface',
					},
					{
						name: 'Use JSON Expression',
						value: 'json',
						description: 'Provide slides data as JSON (for dynamic content)',
					},
				],
				default: 'ui',
				description: 'Choose how to provide content slides data',
			},
			// UI Method - Fixed Collection for Content Slides
			{
				displayName: 'Content Slides',
				name: 'contentSlides',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				displayOptions: {
					show: {
						resource: ['carousel'],
						operation: ['create'],
						contentSlidesInputMethod: ['ui'],
					},
				},
				description: 'The content slides for the carousel. Add as many slides as needed.',
				default: {},
				placeholder: 'Add Slide',
				options: [
					{
						name: 'slide',
						displayName: 'Slide',
						values: [
							{
								displayName: 'Heading',
								name: 'heading',
								type: 'string',
								default: '',
								description: 'Heading for this slide',
							},
							{
								displayName: 'Description',
								name: 'description',
								type: 'string',
								default: '',
								description: 'Description for this slide',
							},
							{
								displayName: 'Image URL',
								name: 'image',
								type: 'string',
								default: '',
								description: 'Image URL for this slide',
							},
						],
					},
				],
			},
			// JSON Method for Content Slides
			{
				displayName: 'Content Slides JSON',
				name: 'contentSlidesJson',
				type: 'json',
				displayOptions: {
					show: {
						resource: ['carousel'],
						operation: ['create'],
						contentSlidesInputMethod: ['json'],
					},
				},
				default: '[\n  {\n    "heading": "Tip 1",\n    "description": "First tip description",\n    "image": "https://example.com/1.jpg"\n  },\n  {\n    "heading": "Tip 2",\n    "description": "Second tip description",\n    "image": "https://example.com/2.jpg"\n  }\n]',
				description: 'Content slides as JSON array. Use expressions like {{ $json.slides }} for dynamic data. All fields (heading, description, image) are optional.',
			},
			// Ending Slide Section
			{
				displayName: 'Enable Ending Slide',
				name: 'enableEndingSlide',
				type: 'boolean',
				displayOptions: {
					show: {
						resource: ['carousel'],
						operation: ['create'],
					},
				},
				default: false,
				description: 'Whether to include an ending slide',
			},
			{
				displayName: 'Ending Slide Heading',
				name: 'endingSlideHeading',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['carousel'],
						operation: ['create'],
						enableEndingSlide: [true],
					},
				},
				default: '',
				description: 'Heading for the ending slide',
			},
			{
				displayName: 'Ending Slide Description',
				name: 'endingSlideDescription',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['carousel'],
						operation: ['create'],
						enableEndingSlide: [true],
					},
				},
				default: '',
				description: 'Description for the ending slide',
			},
			{
				displayName: 'Ending Slide Image URL',
				name: 'endingSlideImage',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['carousel'],
						operation: ['create'],
						enableEndingSlide: [true],
					},
				},
				default: '',
				description: 'Image URL for the ending slide',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const resource = this.getNodeParameter('resource', i) as string;
				const operation = this.getNodeParameter('operation', i) as string;

				let responseData: IDataObject = {};

				if (resource === 'graphic' && operation === 'create') {
					responseData = await createGraphic.call(this, i);
				} else if (resource === 'carousel' && operation === 'create') {
					responseData = await createCarousel.call(this, i);
				} else if (resource === 'job') {
					if (operation === 'getStatus') {
						responseData = await getJobStatus.call(this, i);
					} else if (operation === 'getResult') {
						responseData = await getJobResult.call(this, i);
					}
				}

				returnData.push({
					json: responseData,
					pairedItem: {
						item: i,
					},
				});
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: error instanceof Error ? error.message : 'Unknown error occurred',
						},
						pairedItem: {
							item: i,
						},
					});
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}

async function createGraphic(this: IExecuteFunctions, itemIndex: number): Promise<IDataObject> {
	const templateId = this.getNodeParameter('templateId', itemIndex) as string;
	const output = this.getNodeParameter('output', itemIndex) as string;
	const addBranding = this.getNodeParameter('addBranding', itemIndex) as boolean;
	const executionMode = this.getNodeParameter('executionMode', itemIndex, 'sync') as string;

	let body: IDataObject = {
		template_id: templateId,
		output,
	};

	// Add branding if specified
	if (addBranding) {
		const branding = this.getNodeParameter('branding', itemIndex) as IDataObject;
		if (Object.keys(branding).length > 0) {
			body.branding = cleanEmptyFields(branding);
		}
	}

	// Add content updates if specified
	const contentUpdates = this.getNodeParameter('contentUpdates', itemIndex) as IDataObject;
	if (contentUpdates.updates && Array.isArray(contentUpdates.updates)) {
		body.content_update = contentUpdates.updates;
	}

	// Clean and validate
	body = cleanEmptyFields(body);
	validateRequiredFields(body);

	// Make the initial request
	const initialResponse = await contentdripsApiRequest.call(this, 'POST', '/render', body);

	// If async mode, return the job info immediately
	if (executionMode === 'async') {
		return initialResponse;
	}

	// Sync mode: wait for completion and return final result
	const jobId = validateJobId(initialResponse.job_id);
	return await waitForJobCompletion.call(this, jobId, itemIndex);
}

async function createCarousel(this: IExecuteFunctions, itemIndex: number): Promise<IDataObject> {
	const templateId = this.getNodeParameter('templateId', itemIndex) as string;
	const output = this.getNodeParameter('output', itemIndex) as string;
	const addBranding = this.getNodeParameter('addBranding', itemIndex) as boolean;
	const executionMode = this.getNodeParameter('executionMode', itemIndex, 'sync') as string;

	let body: IDataObject = {
		template_id: templateId,
		output,
	};

	// Add branding if specified
	if (addBranding) {
		const branding = this.getNodeParameter('branding', itemIndex) as IDataObject;
		if (Object.keys(branding).length > 0) {
			body.branding = cleanEmptyFields(branding);
		}
	}

	// Add content updates if specified
	const contentUpdates = this.getNodeParameter('contentUpdates', itemIndex) as IDataObject;
	if (contentUpdates.updates && Array.isArray(contentUpdates.updates)) {
		body.content_update = contentUpdates.updates;
	}

	// Build carousel data
	const carousel: IDataObject = {};

	// Handle intro slide
	const enableIntroSlide = this.getNodeParameter('enableIntroSlide', itemIndex, false) as boolean;
	if (enableIntroSlide) {
		const introSlide: IDataObject = {};
		const heading = this.getNodeParameter('introSlideHeading', itemIndex, '') as string;
		const description = this.getNodeParameter('introSlideDescription', itemIndex, '') as string;
		const image = this.getNodeParameter('introSlideImage', itemIndex, '') as string;
		
		if (heading) {
			introSlide.heading = heading;
		}
		if (description) {
			introSlide.description = description;
		}
		if (image) {
			introSlide.image = image;
		}
		
		if (Object.keys(introSlide).length > 0) {
			carousel.intro_slide = introSlide;
		}
	}

	// Handle content slides
	const contentSlidesInputMethod = this.getNodeParameter('contentSlidesInputMethod', itemIndex, 'ui') as string;
	
	if (contentSlidesInputMethod === 'ui') {
		const contentSlides = this.getNodeParameter('contentSlides', itemIndex, {}) as IDataObject;
		if (contentSlides.slide && Array.isArray(contentSlides.slide) && contentSlides.slide.length > 0) {
			carousel.slides = contentSlides.slide;
		}
	} else {
		const contentSlidesJson = this.getNodeParameter('contentSlidesJson', itemIndex, []) as IDataObject[];
		if (Array.isArray(contentSlidesJson) && contentSlidesJson.length > 0) {
			carousel.slides = contentSlidesJson;
		}
	}

	// Handle ending slide
	const enableEndingSlide = this.getNodeParameter('enableEndingSlide', itemIndex, false) as boolean;
	if (enableEndingSlide) {
		const endingSlide: IDataObject = {};
		const heading = this.getNodeParameter('endingSlideHeading', itemIndex, '') as string;
		const description = this.getNodeParameter('endingSlideDescription', itemIndex, '') as string;
		const image = this.getNodeParameter('endingSlideImage', itemIndex, '') as string;
		
		if (heading) {
			endingSlide.heading = heading;
		}
		if (description) {
			endingSlide.description = description;
		}
		if (image) {
			endingSlide.image = image;
		}
		
		if (Object.keys(endingSlide).length > 0) {
			carousel.ending_slide = endingSlide;
		}
	}

	if (Object.keys(carousel).length > 0) {
		body.carousel = carousel;
	}

	// Clean and validate
	body = cleanEmptyFields(body);
	validateRequiredFields(body);

	// Make the initial request
	const initialResponse = await contentdripsApiRequest.call(this, 'POST', '/render?tool=carousel-maker', body);

	// If async mode, return the job info immediately
	if (executionMode === 'async') {
		return initialResponse;
	}

	// Sync mode: wait for completion and return final result
	const jobId = validateJobId(initialResponse.job_id);
	return await waitForJobCompletion.call(this, jobId, itemIndex);
}

async function waitForJobCompletion(this: IExecuteFunctions, jobId: string, itemIndex: number): Promise<IDataObject> {
	const pollingInterval = this.getNodeParameter('pollingInterval', itemIndex, 5) as number;
	const maxWaitTime = this.getNodeParameter('maxWaitTime', itemIndex, 10) as number;
	
	const startTime = Date.now();
	const maxWaitMs = maxWaitTime * 60 * 1000; // Convert minutes to milliseconds
	const pollingIntervalMs = pollingInterval * 1000; // Convert seconds to milliseconds

	while (Date.now() - startTime < maxWaitMs) {
		try {
			// Check job status
			const statusResponse = await contentdripsApiRequest.call(this, 'GET', `/job/${jobId}/status`);
			
			// Check if job is completed
			if (statusResponse.status === 'completed' || statusResponse.status === 'success') {
				// Get the final result
				const resultResponse = await contentdripsApiRequest.call(this, 'GET', `/job/${jobId}/result`);
				return {
					...resultResponse,
					job_id: jobId,
					processing_time_seconds: Math.round((Date.now() - startTime) / 1000),
					execution_mode: 'synchronous',
				};
			}
			
			// Check if job failed
			if (statusResponse.status === 'failed' || statusResponse.status === 'error') {
				throw new Error(`Job failed: ${statusResponse.error || statusResponse.message || 'Unknown error'}`);
			}
			
			// Job is still processing, wait before next check
			await wait(pollingIntervalMs);
			
		} catch (error) {
			if (error instanceof Error && error.message.includes('Job failed:')) {
				throw error;
			}
			// For other errors (network issues, etc.), continue polling
			await wait(pollingIntervalMs);
		}
	}
	
	// Timeout reached
	throw new Error(`Job completion timeout reached (${maxWaitTime} minutes). Job ID: ${jobId}. You can check the status manually using the Job resource.`);
}

async function getJobStatus(this: IExecuteFunctions, itemIndex: number): Promise<IDataObject> {
	const jobId = this.getNodeParameter('jobId', itemIndex) as string;
	return contentdripsApiRequest.call(this, 'GET', `/job/${jobId}/status`);
}

async function getJobResult(this: IExecuteFunctions, itemIndex: number): Promise<IDataObject> {
	const jobId = this.getNodeParameter('jobId', itemIndex) as string;
	return contentdripsApiRequest.call(this, 'GET', `/job/${jobId}/result`);
}
