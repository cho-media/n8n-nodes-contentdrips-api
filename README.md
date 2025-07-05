# n8n-nodes-contentdrips-api

![n8n.io - Workflow Automation](https://raw.githubusercontent.com/n8n-io/n8n/master/assets/n8n-logo.png)

This is an n8n community node that lets you use [Contentdrips](https://contentdrips.com) in your n8n workflows.

Contentdrips is a powerful API for creating carousels and static graphics programmatically. It enables you to automate content creation using templates, making it perfect for social media automation, marketing campaigns, and content generation workflows.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

### GUI Installation

1. Go to **Settings > Community Nodes**
2. Select **Install**
3. Enter `n8n-nodes-contentdrips-api`
4. Select **Install**

### Manual Installation

To get started, install the package in your n8n root directory:

```bash
npm install n8n-nodes-contentdrips-api
```

For Docker installations, add the following line before the font installation command in your n8n Dockerfile:

```dockerfile
RUN cd /usr/local/lib/node_modules/n8n && npm install n8n-nodes-contentdrips-api
```

## Operations

### Graphic Resource
- **Create**: Generate a static graphic using a Contentdrips template

### Carousel Resource  
- **Create**: Generate a multi-slide carousel using a Contentdrips template

### Job Resource
- **Get Status**: Check the processing status of a job
- **Get Result**: Get the final result of a completed job

## Execution Modes

This node supports two execution modes for creating graphics and carousels:

### Synchronous Mode (Default)
- **Default behavior**: Waits for job completion and returns final download URLs
- **Best for**: Simple workflows where you need the final result immediately
- **Configurable**: Polling interval (1-60 seconds) and maximum wait time (1-30 minutes)
- **Returns**: Final download URLs, job ID, processing time, and status check count

### Asynchronous Mode
- **Immediate return**: Returns job ID immediately without waiting
- **Best for**: Complex workflows requiring parallel processing or custom job management
- **Use with**: Job operations for manual status checking and result retrieval
- **Returns**: Job ID and initial status information

## Credentials

You need to authenticate with the Contentdrips API using an API token.

### Prerequisites
1. Sign up for a [Contentdrips account](https://app.contentdrips.com)
2. Create an API token in your [API Management dashboard](https://app.contentdrips.com/api-management)

### Setup
1. In n8n, go to **Credentials** and create a new **Contentdrips API** credential
2. Enter your API token
3. Save the credential

## Configuration

### Template Setup
Before using this node, you need to:

1. Create templates in your Contentdrips dashboard
2. Label the elements you want to update dynamically:
   - Right-click on textboxes or images in the template editor
   - Select "Add Label" and give it a name (e.g., `title_1`, `hashtag_1`)
   - Use these labels in your n8n workflow to update content

### Supported Output Formats
- **PNG**: High-quality raster images 
- **PDF**: Perfect for print and professional documents

### Basic Usage

#### Creating a Static Graphic (Synchronous Mode)

```json
{
  "resource": "graphic",
  "operation": "create",
  "templateId": "126130",
  "output": "png",
  "executionMode": "sync",
  "pollingInterval": 5,
  "maxWaitTime": 10,
  "contentUpdates": {
    "updates": [
      {
        "type": "textbox",
        "label": "title_1",
        "value": "My Dynamic Title"
      },
      {
        "type": "textbox", 
        "label": "hashtag_1",
        "value": "#automation"
      }
    ]
  }
}
```

#### Creating a Graphic (Asynchronous Mode)

```json
{
  "resource": "graphic",
  "operation": "create",
  "templateId": "126130",
  "output": "png",
  "executionMode": "async",
  "contentUpdates": {
    "updates": [
      {
        "type": "textbox",
        "label": "title_1",
        "value": "My Dynamic Title"
      }
    ]
  }
}
```

#### Creating a Carousel - Flexible Structure

**Intro Slide** (Optional):
- Enable/disable toggle
- When enabled: heading, description, and image fields automatically appear

**Content Slides** (Main content):
- **Method 1 - Build in UI**: Manually add slides using the interface
- **Method 2 - JSON Expression**: Use dynamic data with expressions like `{{ $json.slides }}`

**Ending Slide** (Optional):
- Enable/disable toggle  
- When enabled: heading, description, and image fields automatically appear

**Example - UI Method (Synchronous):**
```json
{
  "resource": "carousel",
  "operation": "create", 
  "templateId": "126130",
  "output": "png",
  "executionMode": "sync",
  "pollingInterval": 10,
  "maxWaitTime": 15,
  "enableIntroSlide": true,
  "introSlideHeading": "Welcome!",
  "introSlideDescription": "Let's get started",
  "contentSlidesInputMethod": "ui",
  "contentSlides": {
    "slide": [
      {
        "heading": "Step 1",
        "description": "First step details"
      },
      {
        "heading": "Step 2", 
        "description": "Second step details"
      }
    ]
  },
  "enableEndingSlide": true,
  "endingSlideHeading": "Thank you!",
  "endingSlideDescription": "Follow for more tips"
}
```

**Example - JSON Method for Content Slides (Asynchronous):**
```json
{
  "resource": "carousel",
  "operation": "create", 
  "templateId": "126130",
  "output": "pdf",
  "executionMode": "async",
  "contentSlidesInputMethod": "json",
  "contentSlidesJson": "{{ $json.dynamicSlides }}"
}
```

Where `$json.dynamicSlides` contains:
```json
[
  {
    "heading": "Dynamic Tip 1",
    "description": "Generated from data"
  },
  {
    "heading": "Dynamic Tip 2", 
    "description": "Another generated tip"
  }
]
```

### Branding

You can include branding information that will be automatically applied to templates with branding placeholders:

```json
{
  "addBranding": true,
  "branding": {
    "name": "John Doe",
    "handle": "@johndoe",
    "bio": "Content Creator & Marketer",
    "website_url": "https://johndoe.com",
    "avatar_image_url": "https://example.com/avatar.jpg"
  }
}
```

### Job Management (Asynchronous Workflows)

When using asynchronous mode, you can manually manage jobs:

1. Create graphic/carousel with `executionMode: "async"`
2. You'll receive a `job_id` in the response
3. Use the **Job > Get Status** operation to check processing status
4. Use the **Job > Get Result** operation to get the final download URLs

**Example Asynchronous Workflow:**
```
Trigger → Contentdrips (async) → Wait (30s) → Job Status → Job Result
```

## Workflow Examples

### Simple Content Generation (Synchronous)
```
Schedule Trigger → Contentdrips (sync) → Slack/Email Notification
```

### Parallel Content Generation (Asynchronous)
```
Trigger → Split in Batches → Contentdrips (async) → Collect Job IDs → Poll All Jobs → Combine Results
```

### Dynamic Social Media Automation
```
RSS Feed → Transform Data → Contentdrips (sync) → Multiple Social Platforms
```

### Advanced Campaign Generator (Asynchronous)
```
Google Sheets → Process Data → Multiple Contentdrips (async) → Monitor Jobs → Cloud Storage
```

## Compatibility

- Minimum n8n version: 0.198.0
- Tested with n8n version: 1.0.0+
- Node.js: 18.18.0+

## Troubleshooting

### Common Issues

**Authentication Errors**
- Verify your API token is correct
- Check that the token has proper permissions
- Ensure you're using the latest version of the node

**Template Errors**
- Confirm the template ID exists in your Contentdrips account
- Verify that labeled elements match your content updates
- Check that required fields are provided

**Job Processing (Synchronous Mode)**
- Jobs typically take 2-5 minutes to process
- Adjust polling interval and max wait time based on your needs
- Failed jobs will include detailed error information

**Job Processing (Asynchronous Mode)**
- Use Job Status operation to monitor progress
- Failed jobs will include error details in the response
- Jobs can be checked at any time using the job ID

**Timeout Issues**
- Increase maximum wait time for complex templates
- Consider using asynchronous mode for very long jobs
- Use longer polling intervals to reduce API load

### Performance Tips

- **Synchronous Mode**: Use for simple, single-content generation
- **Asynchronous Mode**: Use for batch processing or when integrating with other long-running operations
- **Polling Settings**: Start with 5-second intervals, adjust based on typical job completion times
- **Parallel Processing**: Use asynchronous mode with multiple nodes for faster batch processing

### Getting Help

- Check the [Contentdrips API documentation](https://app.contentdrips.com/api-management)
- Visit the [n8n community forum](https://community.n8n.io)
- Report bugs on the [GitHub repository](https://github.com/cho-media/n8n-nodes-contentdrips-api/issues)

## Resources

- [Contentdrips Website](https://contentdrips.com)
- [Contentdrips API Documentation](https://app.contentdrips.com/api-management)
- [n8n Documentation](https://docs.n8n.io)
- [n8n Community Nodes](https://docs.n8n.io/integrations/community-nodes/)

## Version History

### 1.2.0
- **NEW**: Synchronous execution mode (default) - automatically waits for job completion
- **NEW**: Asynchronous execution mode - returns job ID immediately for manual management
- **NEW**: Configurable polling intervals and timeout settings
- **IMPROVED**: Enhanced error handling with detailed job failure information
- **IMPROVED**: Better response data including processing time and status check counts
- **FIXED**: SVG icon loading issues

### 1.1.3
- Bug fixes and stability improvements

### 1.0.0
- Initial release
- Support for creating static graphics and carousels
- Job status and result management
- Branding and content update features
- Full API coverage for Contentdrips v1

## License

[MIT](LICENSE.md)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
