import type {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';

import { NodeConnectionType } from 'n8n-workflow';
import { contentdripsApiRequest, validateRequiredFields, cleanEmptyFields } from './GenericFunctions';

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
						description: 'Your name or brand name (optional)',
					},
					{
						displayName: 'Handle',
						name: 'handle',
						type: 'string',
						default: '',
						description: 'Your social media handle (optional), e.g., @username',
					},
					{
						displayName: 'Bio',
						name: 'bio',
						type: 'string',
						default: '',
						description: 'Short bio or description (optional)',
					},
					{
						displayName: 'Website URL',
						name: 'website_url',
						type: 'string',
						default: '',
						description: 'Your website URL (optional)',
					},
					{
						displayName: 'Avatar Image URL',
						name: 'avatar_image_url',
						type: 'string',
						default: '',
						description: 'URL to your avatar image (optional)',
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
				description: 'Heading for the intro slide (optional)',
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
				description: 'Description for the intro slide (optional)',
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
				description: 'Image URL for the intro slide (optional)',
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
								description: 'Heading for this slide (optional)',
							},
							{
								displayName: 'Description',
								name: 'description',
								type: 'string',
								default: '',
								description: 'Description for this slide (optional)',
							},
							{
								displayName: 'Image URL',
								name: 'image',
								type: 'string',
								default: '',
								description: 'Image URL for this slide (optional)',
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
				description: 'Heading for the ending slide (optional)',
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
				description: 'Description for the ending slide (optional)',
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
				description: 'Image URL for the ending slide (optional)',
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

				let responseData: any;

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

	return contentdripsApiRequest.call(this, 'POST', '/render', body);
}

async function createCarousel(this: IExecuteFunctions, itemIndex: number): Promise<IDataObject> {
	const templateId = this.getNodeParameter('templateId', itemIndex) as string;
	const output = this.getNodeParameter('output', itemIndex) as string;
	const addBranding = this.getNodeParameter('addBranding', itemIndex) as boolean;

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
		
		if (heading) introSlide.heading = heading;
		if (description) introSlide.description = description;
		if (image) introSlide.image = image;
		
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
		const contentSlidesJson = this.getNodeParameter('contentSlidesJson', itemIndex, []) as any[];
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
		
		if (heading) endingSlide.heading = heading;
		if (description) endingSlide.description = description;
		if (image) endingSlide.image = image;
		
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

	return contentdripsApiRequest.call(this, 'POST', '/render?tool=carousel-maker', body);
}

async function getJobStatus(this: IExecuteFunctions, itemIndex: number): Promise<IDataObject> {
	const jobId = this.getNodeParameter('jobId', itemIndex) as string;
	return contentdripsApiRequest.call(this, 'GET', `/job/${jobId}/status`);
}

async function getJobResult(this: IExecuteFunctions, itemIndex: number): Promise<IDataObject> {
	const jobId = this.getNodeParameter('jobId', itemIndex) as string;
	return contentdripsApiRequest.call(this, 'GET', `/job/${jobId}/result`);
}
