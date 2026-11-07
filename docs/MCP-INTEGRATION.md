# Artisan Labs MCP Integration

The Artisan Labs MCP (Model Context Protocol) server exposes the app's
scrollytelling capabilities as tools that coding agents can call
programmatically. This allows agents to create hero sections, generate
scroll-trigger configs, and export frame sequences without manual UI
interaction.

## Endpoint

- **POST** `/api/mcp` - JSON-RPC 2.0 requests
- **GET** `/api/mcp` - SSE connection establishment (`Accept: text/event-stream`)

## Available Tools

### `create_hero_section`

Build a complete hero section from frame images. Returns HTML markup, CSS,
and scroll-trigger config ready to drop into a Next.js or static site.

**Parameters:**
| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `frameUrls` | string[] | Yes | — | Ordered array of frame image URLs |
| `mode` | string | No | `"easeInOut"` | Scroll trigger mode |
| `scrollDistance` | number | No | `3000` | Total scroll distance in px |
| `title` | string | No | `"Hero Section"` | Hero heading |
| `subtitle` | string | No | `""` | Hero subtitle |

**Returns:** HTML markup, CSS, scrollTrigger config, event count, and frame metadata.

### `generate_scroll_trigger`

Compute a scroll-trigger map from a config. Returns per-frame scroll
positions, progress values, and statistics.

**Parameters:**
| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `frameCount` | number | Yes | — | Number of frames |
| `mode` | string | No | `"easeInOut"` | Scroll trigger mode |
| `scrollDistance` | number | No | `1000` | Total scroll distance in px |

**Returns:** Config, events array, statistics, scrollDistancePx.

### `export_sequence`

Export a sequence as JSON, JavaScript, or CSS for use in a web site.

**Parameters:**
| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `format` | string | Yes | — | `"json"`, `"js"`, or `"css"` |
| `frameCount` | number | Yes | — | Number of frames |
| `mode` | string | No | `"easeInOut"` | Scroll trigger mode |
| `scrollDistance` | number | No | `1000` | Total scroll distance in px |

**Returns:** Exported content in the requested format.

### `list_scroll_modes`

Return all available scroll trigger modes with descriptions and best-use
guidance.

**Parameters:** None.

**Returns:** Object with mode key → { label, description, icon, bestFor }.

## Available Resources

| URI | Description |
|-----|-------------|
| `artisan://modes` | All scroll trigger modes (JSON) |
| `artisan://config` | Default scroll trigger configuration (JSON) |

## Example Usage

### Create a hero section

```typescript
const result = await mcpCall('tools/call', {
  name: 'create_hero_section',
  arguments: {
    frameUrls: [
      '/frames/hero-0001.webp',
      '/frames/hero-0002.webp',
      '/frames/hero-0003.webp',
    ],
    mode: 'easeInOut',
    scrollDistance: 2000,
    title: 'Artisan Labs',
    subtitle: 'Scrollytelling Sequence Optimizer',
  },
})

const content = JSON.parse(result.content[0].text)
// content.html   -> Hero section HTML markup
// content.css    -> Scroll frame CSS
// content.config -> Scroll trigger configuration
// content.map    -> Trigger events and statistics
```

### Generate scroll-trigger config

```typescript
const result = await mcpCall('tools/call', {
  name: 'generate_scroll_trigger',
  arguments: {
    frameCount: 100,
    mode: 'velocity',
    scrollDistance: 1500,
  },
})

const content = JSON.parse(result.content[0].text)
// content.events -> Per-frame scroll positions
// content.stats  -> Spacing statistics
```

### Export as CSS

```typescript
const result = await mcpCall('tools/call', {
  name: 'export_sequence',
  arguments: {
    format: 'css',
    frameCount: 50,
    mode: 'goldenRatio',
    scrollDistance: 2500,
  },
})

const content = JSON.parse(result.content[0].text)
// content.content -> CSS text ready for <style> tag
```

## Scroll Trigger Modes

| Mode | Best For |
|------|----------|
| `linear` | Uniform playback, product showcases |
| `easeIn` | Building anticipation, dramatic reveals |
| `easeOut` | Hero intros, smooth landings |
| `easeInOut` | Most scrollytelling, general purpose |
| `velocity` | Videos with varying motion, action scenes |
| `scene` | Storyboarded content, multi-section narratives |
| `goldenRatio` | Artistic storytelling, premium experiences |
| `stepHold` | Presentations, data stories, infographics |
| `manual` | Precise control, highlight specific moments |

## Architecture

```
src/app/api/mcp/
├── route.ts        # MCP server (Streamable HTTP + JSON-RPC)
├── route.test.ts   # Tests for scroll-trigger integration
└── example.ts      # Example client usage

src/components/
└── hero-section.tsx # React component consuming scroll-trigger output

src/lib/
└── scroll-trigger.ts # Core scroll-trigger calculation engine
```

## Integration with Coding Agents

MCP coding agents can discover tools via `tools/list`, read resources via
`resources/list`/`resources/read`, and execute tools via `tools/call`.
This enables agents to:

1. Discover available scroll-trigger modes
2. Generate hero section configs from frame URLs
3. Compute scroll-trigger maps for custom animations
4. Export sequences as JSON/JS/CSS for deployment

## Test

```bash
npx vitest run src/app/api/mcp/route.test.ts
```
