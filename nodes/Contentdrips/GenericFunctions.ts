import type {
	IDataObject,
	IExecuteFunctions,
	IHttpRequestMethods,
	IRequestOptions,
} from 'n8n-workflow';

export async function contentdripsApiRequest(
	this: IExecuteFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body: IDataObject = {},
	qs: IDataObject = {},
): Promise<any> {
	const options: IRequestOptions = {
		method,
		body,
		qs,
		url: `https://generate.contentdrips.com${endpoint}`,
		headers: {
			'Content-Type': 'application/json',
		},
		json: true,
	};

	if (Object.keys(body).length === 0) {
		delete options.body;
	}

	if (Object.keys(qs).length === 0) {
		delete options.qs;
	}

	return this.helpers.httpRequestWithAuthentication.call(this, 'contentdripsApi', options);
}

export function buildCarouselData(
	inputMethod: string,
	enableIntroSlide: boolean,
	introSlide: IDataObject,
	slides: IDataObject,
	enableEndingSlide: boolean,
	endingSlide: IDataObject,
	carouselJson: IDataObject,
): IDataObject {
	if (inputMethod === 'json') {
		return carouselJson;
	}

	const carousel: IDataObject = {};

	if (enableIntroSlide && Object.keys(introSlide).length > 0) {
		carousel.intro_slide = introSlide;
	}

	if (slides.slide && Array.isArray(slides.slide) && slides.slide.length > 0) {
		carousel.slides = slides.slide;
	}

	if (enableEndingSlide && Object.keys(endingSlide).length > 0) {
		carousel.ending_slide = endingSlide;
	}

	return carousel;
}

export function validateRequiredFields(body: IDataObject): void {
	if (!body.template_id) {
		throw new Error('Template ID is required');
	}
}

export function cleanEmptyFields(obj: IDataObject): IDataObject {
	const cleaned: IDataObject = {};
	
	for (const [key, value] of Object.entries(obj)) {
		if (value !== null && value !== undefined && value !== '') {
			if (typeof value === 'object' && !Array.isArray(value)) {
				const cleanedNested = cleanEmptyFields(value as IDataObject);
				if (Object.keys(cleanedNested).length > 0) {
					cleaned[key] = cleanedNested;
				}
			} else if (Array.isArray(value) && value.length > 0) {
				cleaned[key] = value;
			} else if (typeof value !== 'object') {
				cleaned[key] = value;
			}
		}
	}
	
	return cleaned;
}
