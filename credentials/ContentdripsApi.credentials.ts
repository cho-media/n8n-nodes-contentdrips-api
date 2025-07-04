import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class ContentdripsApi implements ICredentialType {
	name = 'contentdripsApi';

	displayName = 'Contentdrips API';

	documentationUrl = 'https://app.contentdrips.com/api-management';

	properties: INodeProperties[] = [
		{
			displayName: 'API Token',
			name: 'apiToken',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			description: 'Your Contentdrips API token. You can create or manage your token at https://app.contentdrips.com/api-management',
			required: true,
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.apiToken}}',
				'Content-Type': 'application/json',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://generate.contentdrips.com',
			url: '/render',
			method: 'POST',
			body: {
				template_id: 'invalid_test_template',
				output: 'png',
			},
		},
		rules: [
			{
				type: 'responseCode',
				properties: {
					value: 401,
					message: 'Invalid API token. Please check your credentials in Contentdrips.',
				},
			},
			{
				type: 'responseCode', 
				properties: {
					value: 400,
					message: 'API token is valid but template not found (this is expected for credential test).',
				},
			},
		],
	};
}
