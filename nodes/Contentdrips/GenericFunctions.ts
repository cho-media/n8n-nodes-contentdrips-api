import type {
	IDataObject,
	IExecuteFunctions,
	IHttpRequestMethods,
	IHttpRequestOptions,
} from 'n8n-workflow';

export async function contentdripsApiRequest(
	this: IExecuteFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body: IDataObject = {},
	qs: IDataObject = {},
): Promise<any> {
	const options: IHttpRequestOptions = {
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

export function isJobCompleted(status: string): boolean {
	return status === 'completed' || status === 'success';
}

export function isJobFailed(status: string): boolean {
	return status === 'failed' || status === 'error';
}

export function isJobPending(status: string): boolean {
	return status === 'pending' || status === 'processing' || status === 'queued' || status === 'IN_QUEUE' || status === 'IN_PROGRESS';
}
