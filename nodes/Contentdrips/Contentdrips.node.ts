import type {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IHttpRequestMethods,
} from 'n8n-workflow';
import { NodeApiError, NodeOperationError, NodeConnectionType } from 'n8n-workflow';

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
					{
						name: 'JPG',
						value: 'jpg',
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
						description: 'Your social media handle (e.g., @username)',
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
			// Carousel Input Method Selection
			{
				displayName: 'Carousel Data Input',
				name: 'carouselInputMethod',
				type: 'options',
				displayOptions: {
					show: {
						resource: ['carousel'],
						operation: ['create'],
					},
				},
				options: [
					{
						name: 'Define in UI',
						value: 'ui',
						description: 'Use the UI to manually define slides',
					},
					{
						name: 'Use JSON Expression',
						value: 'json',
						description: 'Provide carousel data as JSON (for dynamic content)',
					},
				],
				default: 'ui',
				description: 'Choose how to provide carousel slide data',
			},
			// UI Method - Individual Fields
			{
				displayName: 'Enable Intro Slide',
				name: 'enableIntroSlide',
				type: 'boolean',
				displayOptions: {
					show: {
						resource: ['carousel'],
						operation: ['create'],
						carouselInputMethod: ['ui'],
					},
				},
				default: false,
				description: 'Whether to include an intro slide',
			},
			{
				displayName: 'Intro Slide',
				name: 'introSlide',
				type: 'collection',
				displayOptions: {
					show: {
						resource: ['carousel'],
						operation: ['create'],
						carouselInputMethod: ['ui'],
						enableIntroSlide: [true],
					},
				},
				default: {},
				options: [
					{
						displayName: 'Heading',
						name: 'heading',
						type: 'string',
						default: '',
						description: 'Heading for the intro slide (optional)',
					},
					{
						displayName: 'Description',
						name: 'description',
						type: 'string',
						default: '',
						description: 'Description for the intro slide (optional)',
					},
					{
						displayName: 'Image URL',
						name: 'image',
						type: 'string',
						default: '',
						description: 'Image URL for the intro slide (optional)',
					},
				],
			},
			{
				displayName: 'Content Slides',
				name: 'slides',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				displayOptions: {
					show: {
						resource: ['carousel'],
						operation: ['create'],
						carouselInputMethod: ['ui'],
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
			{
				displayName: 'Enable Ending Slide',
				name: 'enableEndingSlide',
				type: 'boolean',
				displayOptions: {
					show: {
						resource: ['carousel'],
						operation: ['create'],
						carouselInputMethod: ['ui'],
					},
				},
				default: false,
				description: 'Whether to include an ending slide',
			},
			{
				displayName: 'Ending Slide',
				name: 'endingSlide',
				type: 'collection',
				displayOptions: {
					show: {
						resource: ['carousel'],
						operation: ['create'],
						carouselInputMethod: ['ui'],
						enableEndingSlide: [true],
					},
				},
				default: {},
				options: [
					{
						displayName: 'Heading',
						name: 'heading',
						type: 'string',
						default: '',
						description: 'Heading for the ending slide (optional)',
					},
					{
						displayName: 'Description',
						name: 'description',
						type: 'string',
						default: '',
						description: 'Description for the ending slide (optional)',
					},
					{
						displayName: 'Image URL',
						name: 'image',
						type: 'string',
						default: '',
						description: 'Image URL for the ending slide (optional)',
					},
				],
			},
			// JSON Method - Single Field
			{
				displayName: 'Carousel JSON',
				name: 'carouselJson',
				type: 'json',
				displayOptions: {
					show: {
						resource: ['carousel'],
						operation: ['create'],
						carouselInputMethod: ['json'],
					},
				},
				default: '{\n  "intro_slide": {\n    "heading": "Start Here",\n    "description": "Tips that work",\n    "image": "https://example.com/intro.jpg"\n  },\n  "slides": [\n    {\n      "heading": "Tip 1",\n      "description": "First tip",\n      "image": "https://example.com/1.jpg"\n    },\n    {\n      "heading": "Tip 2", \n      "description": "Second tip",\n      "image": "https://example.com/2.jpg"\n    }\n  ],\n  "ending_slide": {\n    "heading": "Follow for more",\n    "description": "New tips weekly",\n    "image": "https://example.com/end.jpg"\n  }\n}',
				description: 'Complete carousel data as JSON. Use expressions like {{ $json.slides }} for dynamic data. All fields (heading, description, image) are optional.',
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

				// Validate required parameters
				if (!resource || !operation) {
					throw new NodeOperationError(
						this.getNode(),
						'Resource and operation parameters are required',
						{ itemIndex: i }
					);
				}

				let responseData: any;

				if (resource === 'graphic' && operation === 'create') {
					responseData = await this.createGraphic(i);
				} else if (resource === 'carousel' && operation === 'create') {
					responseData = await this.createCarousel(i);
				} else if (resource === 'job') {
					if (operation === 'getStatus') {
						responseData = await this.getJobStatus(i);
					} else if (operation === 'getResult') {
						responseData = await this.getJobResult(i);
					} else {
						throw new NodeOperationError(
							this.getNode(),
							`Unknown job operation: ${operation}`,
							{ itemIndex: i }
						);
					}
				} else {
					throw new NodeOperationError(
						this.getNode(),
						`Unknown resource "${resource}" or operation "${operation}"`,
						{ itemIndex: i }
					);
				}

				returnData.push({
					json: responseData,
					pairedItem: {
						item: i,
					},
				});
			} catch (error) {
				// Handle different error types appropriately
				if (error instanceof NodeApiError || error instanceof NodeOperationError) {
					if (this.continueOnFail()) {
						returnData.push({
							json: {
								error: error.message,
								resource: this.getNodeParameter('resource', i, 'unknown'),
								operation: this.getNodeParameter('operation', i, 'unknown'),
							},
							pairedItem: {
								item: i,
							},
						});
						continue;
					}
					throw error;
				}

				// Handle unknown errors
				const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
				const nodeError = new NodeOperationError(
					this.getNode(), 
					`Contentdrips API error: ${errorMessage}`,
					{ itemIndex: i }
				);

				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: nodeError.message,
							resource: this.getNodeParameter('resource', i, 'unknown'),
							operation: this.getNodeParameter('operation', i, 'unknown'),
						},
						pairedItem: {
							item: i,
						},
					});
					continue;
				}
				throw nodeError;
			}
		}

		return [returnData];
	}

	private async createGraphic(this: IExecuteFunctions, itemIndex: number): Promise<IDataObject> {
		const templateId = this.getNodeParameter('templateId', itemIndex) as string;
		const output = this.getNodeParameter('output', itemIndex) as string;
		const addBranding = this.getNodeParameter('addBranding', itemIndex) as boolean;

		// Validate required parameters
		if (!templateId) {
			throw new NodeOperationError(
				this.getNode(),
				'Template ID is required for graphic creation',
				{ itemIndex }
			);
		}

		const body: IDataObject = {
			template_id: templateId,
			output,
		};

		// Add branding if specified
		if (addBranding) {
			const branding = this.getNodeParameter('branding', itemIndex) as IDataObject;
			if (Object.keys(branding).length > 0) {
				body.branding = branding;
			}
		}

		// Add content updates if specified
		const contentUpdates = this.getNodeParameter('contentUpdates', itemIndex) as IDataObject;
		if (contentUpdates.updates && Array.isArray(contentUpdates.updates)) {
			body.content_update = contentUpdates.updates;
		}

		try {
			const response = await this.helpers.httpRequestWithAuthentication.call(
				this,
				'contentdripsApi',
				{
					method: 'POST' as IHttpRequestMethods,
					url: '/render',
					body,
				},
			);

			return response;
		} catch (error) {
			const apiError = error instanceof Error ? error : new Error('Unknown API error');
			throw new NodeApiError(
				this.getNode(),
				apiError,
				{ message: `Failed to create graphic with template ${templateId}`, itemIndex }
			);
		}
	}

	private async createCarousel(this: IExecuteFunctions, itemIndex: number): Promise<IDataObject> {
		const templateId = this.getNodeParameter('templateId', itemIndex) as string;
		const output = this.getNodeParameter('output', itemIndex) as string;
		const addBranding = this.getNodeParameter('addBranding', itemIndex) as boolean;
		const carouselInputMethod = this.getNodeParameter('carouselInputMethod', itemIndex) as string;

		// Validate required parameters
		if (!templateId) {
			throw new NodeOperationError(
				this.getNode(),
				'Template ID is required for carousel creation',
				{ itemIndex }
			);
		}

		if (!carouselInputMethod) {
			throw new NodeOperationError(
				this.getNode(),
				'Carousel input method must be specified',
				{ itemIndex }
			);
		}

		const body: IDataObject = {
			template_id: templateId,
			output,
		};

		// Add branding if specified
		if (addBranding) {
			const branding = this.getNodeParameter('branding', itemIndex) as IDataObject;
			if (Object.keys(branding).length > 0) {
				body.branding = branding;
			}
		}

		// Add content updates if specified
		const contentUpdates = this.getNodeParameter('contentUpdates', itemIndex) as IDataObject;
		if (contentUpdates.updates && Array.isArray(contentUpdates.updates)) {
			body.content_update = contentUpdates.updates;
		}

		// Handle carousel data based on input method
		let carousel: IDataObject = {};

		if (carouselInputMethod === 'json') {
			// JSON expression method - handle both string and object inputs
			try {
				const carouselJsonParam = this.getNodeParameter('carouselJson', itemIndex);
				
				if (typeof carouselJsonParam === 'string') {
					// Parse JSON string
					carousel = JSON.parse(carouselJsonParam);
				} else if (typeof carouselJsonParam === 'object' && carouselJsonParam !== null) {
					// Already an object
					carousel = carouselJsonParam as IDataObject;
				} else {
					throw new NodeOperationError(
						this.getNode(),
						'Carousel JSON must be a valid JSON object or string',
						{ itemIndex }
					);
				}

				// Validate carousel structure
				if (typeof carousel !== 'object' || carousel === null) {
					throw new NodeOperationError(
						this.getNode(),
						'Carousel JSON must be a valid object with intro_slide, slides, and/or ending_slide properties',
						{ itemIndex }
					);
				}
			} catch (error) {
				if (error instanceof NodeOperationError) {
					throw error;
				}
				throw new NodeOperationError(
					this.getNode(),
					`Invalid JSON in carousel parameter: ${error instanceof Error ? error.message : 'Unknown error'}`,
					{ itemIndex }
				);
			}
		} else {
			// UI method
			const enableIntroSlide = this.getNodeParameter('enableIntroSlide', itemIndex) as boolean;
			if (enableIntroSlide) {
				const introSlide = this.getNodeParameter('introSlide', itemIndex) as IDataObject;
				if (Object.keys(introSlide).length > 0) {
					carousel.intro_slide = introSlide;
				}
			}

			const slides = this.getNodeParameter('slides', itemIndex) as IDataObject;
			if (slides.slide && Array.isArray(slides.slide)) {
				if (slides.slide.length === 0) {
					throw new NodeOperationError(
						this.getNode(),
						'At least one content slide is required for carousel creation',
						{ itemIndex }
					);
				}
				carousel.slides = slides.slide;
			} else {
				throw new NodeOperationError(
					this.getNode(),
					'At least one content slide is required for carousel creation',
					{ itemIndex }
				);
			}

			const enableEndingSlide = this.getNodeParameter('enableEndingSlide', itemIndex) as boolean;
			if (enableEndingSlide) {
				const endingSlide = this.getNodeParameter('endingSlide', itemIndex) as IDataObject;
				if (Object.keys(endingSlide).length > 0) {
					carousel.ending_slide = endingSlide;
				}
			}
		}

		if (Object.keys(carousel).length === 0) {
			throw new NodeOperationError(
				this.getNode(),
				'Carousel must have at least intro_slide, slides, or ending_slide data',
				{ itemIndex }
			);
		}

		body.carousel = carousel;

		try {
			const response = await this.helpers.httpRequestWithAuthentication.call(
				this,
				'contentdripsApi',
				{
					method: 'POST' as IHttpRequestMethods,
					url: '/render?tool=carousel-maker',
					body,
				},
			);

			return response;
		} catch (error) {
			const apiError = error instanceof Error ? error : new Error('Unknown API error');
			throw new NodeApiError(
				this.getNode(),
				apiError,
				{ message: `Failed to create carousel with template ${templateId}`, itemIndex }
			);
		}
	}

	private async getJobStatus(this: IExecuteFunctions, itemIndex: number): Promise<IDataObject> {
		const jobId = this.getNodeParameter('jobId', itemIndex) as string;

		// Validate required parameters
		if (!jobId || jobId.trim() === '') {
			throw new NodeOperationError(
				this.getNode(),
				'Job ID is required for checking job status',
				{ itemIndex }
			);
		}

		try {
			const response = await this.helpers.httpRequestWithAuthentication.call(
				this,
				'contentdripsApi',
				{
					method: 'GET' as IHttpRequestMethods,
					url: `/job/${jobId}/status`,
				},
			);

			return response;
		} catch (error) {
			const apiError = error instanceof Error ? error : new Error('Unknown API error');
			throw new NodeApiError(
				this.getNode(),
				apiError,
				{ message: `Failed to get status for job ${jobId}`, itemIndex }
			);
		}
	}

	private async getJobResult(this: IExecuteFunctions, itemIndex: number): Promise<IDataObject> {
		const jobId = this.getNodeParameter('jobId', itemIndex) as string;

		// Validate required parameters
		if (!jobId || jobId.trim() === '') {
			throw new NodeOperationError(
				this.getNode(),
				'Job ID is required for getting job result',
				{ itemIndex }
			);
		}

		try {
			const response = await this.helpers.httpRequestWithAuthentication.call(
				this,
				'contentdripsApi',
				{
					method: 'GET' as IHttpRequestMethods,
					url: `/job/${jobId}/result`,
				},
			);

			return response;
		} catch (error) {
			const apiError = error instanceof Error ? error : new Error('Unknown API error');
			throw new NodeApiError(
				this.getNode(),
				apiError,
				{ message: `Failed to get result for job ${jobId}`, itemIndex }
			);
		}
	}
}
