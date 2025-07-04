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

### Basic Usage

#### Creating a Static Graphic

```json
{
  "resource": "graphic",
  "operation": "create",
  "templateId": "126130",
  "output": "png",
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

#### Creating a Carousel - Clean & Simple

The carousel structure is much cleaner now:

**Intro Slide** (Always available):
```json
{
  "heading": "Start Here",
  "description": "Tips that actually work", 
  "image": "https://example.com/intro.jpg"
}
```

**Content Slides** - Choose one approach:

*Option 1: Fixed UI Fields (for manual entry)*
```json
{
  "slides": {
    "slide": [
      {
        "heading": "Post daily",
        "description": "It builds habit and reach."
      },
      {
        "heading": "Be helpful", 
        "description": "Always give value."
      }
    ]
  }
}
```

*Option 2: JSON Expression (for dynamic content)*
```json
{
  "slidesJson": "{{ $json.dynamicSlides }}"
}
```

Where `$json.dynamicSlides` contains:
```json
[
  {
    "heading": "Dynamic Tip 1",
    "description": "From previous node"
  },
  {
    "heading": "Dynamic Tip 2", 
    "description": "Also from previous node"
  }
]
```

**Ending Slide** (Always available):
```json
{
  "heading": "Follow for more",
  "description": "New tips every week.",
  "image": "https://example.com/end.jpg"
}
```

**Key Benefits:**
- **Simpler UX**: No complex toggles
- **Always accessible**: Intro/ending fields always visible
- **Flexible content**: Fixed UI or JSON expressions for content slides
- **Standard n8n pattern**: Familiar to n8n users

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

### Job Management

Contentdrips processes requests asynchronously. After creating a graphic or carousel:

1. You'll receive a `job_id` in the response
2. Use the **Job > Get Status** operation to check processing status
3. Use the **Job > Get Result** operation to get the final download URLs

## Compatibility

- Minimum n8n version: 0.198.0
- Tested with n8n version: 1.0.0+

## Usage Examples

### Social Media Automation
Create a workflow that:
1. Triggers on a schedule
2. Fetches content from a CMS or spreadsheet
3. Uses Contentdrips to generate social media graphics
4. Posts to social platforms automatically

### Marketing Campaign Generator
Build a workflow that:
1. Reads campaign data from Google Sheets
2. Generates branded graphics for each campaign
3. Stores results in cloud storage
4. Sends notification emails with download links

### Dynamic Workflow Examples

#### Example 1: Variable Slide Count from Spreadsheet
```
Google Sheets → Read Data → Code Node (Transform) → Contentdrips → Save Results
```

**Code Node example** to transform spreadsheet data:
```javascript
// Input: Array of tips from spreadsheet
const tips = $input.all()[0].json.tips;

// Transform to Contentdrips format
const slides = tips.map((tip, index) => ({
  heading: tip.title,
  description: tip.description,
  image: tip.image_url || `https://example.com/slide${index + 1}.jpg`
}));

return [{
  json: {
    slides: { slide: slides }
  }
}];
```

#### Example 2: AI-Generated Content with Variable Length
```
OpenAI → Generate Tips → Code Node → Contentdrips → Post to Social
```

The AI might generate 5 tips one day and 12 tips another day - the Contentdrips node handles both scenarios seamlessly.

#### Example 3: RSS Feed to Carousel
```
RSS Feed → Filter Items → Transform → Contentdrips → Cloud Storage
```

Number of slides depends on RSS feed items - could be 3 today, 10 tomorrow.

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

**Job Processing**
- Jobs typically take 2-5 minutes to process
- Use the Job Status operation to monitor progress
- Failed jobs will include error details in the response

### Getting Help

- Check the [Contentdrips API documentation](https://app.contentdrips.com/api-management)
- Visit the [n8n community forum](https://community.n8n.io)
- Report bugs on the [GitHub repository](https://github.com/YOUR_USERNAME/n8n-nodes-contentdrips/issues)

## Resources

- [Contentdrips Website](https://contentdrips.com)
- [Contentdrips API Documentation](https://app.contentdrips.com/api-management)
- [n8n Documentation](https://docs.n8n.io)
- [n8n Community Nodes](https://docs.n8n.io/integrations/community-nodes/)

## Version History

### 1.1.0
- **Improved carousel UX**: Removed complex toggles, always show intro/ending fields
- **Content slides**: Fixed UI fields OR JSON expression (standard n8n pattern)
- **Output format**: Fixed to PNG/PDF only (per API documentation)
- **Icon support**: SVG properly included in build process
- **Simplified logic**: Cleaner, more intuitive user interface

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
