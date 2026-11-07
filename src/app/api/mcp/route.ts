import { NextResponse } from 'next/server'

/**
 * MCP (Model Context Protocol) server for Artisan Labs.
 *
 * Exposes the app's scrollytelling capabilities as MCP tools so coding
 * agents can programmatically create hero sections, scroll-triggered
 * animations, and export frame sequences.
 *
 * Transport: Streamable HTTP (POST with Accept: text/event-stream for
 * SSE, or plain JSON for non-streaming).
 *
 * Tools:
 *   - create_hero_section       Build a hero section config from frames
 *   - generate_scroll_trigger   Compute a scroll-trigger map from a config
 *   - export_sequence           Export a sequence as JSON/JS/CSS
 *   - list_scroll_modes         Return available scroll trigger modes
 */

// ─── Types ─────────────────────────────────────────────────────────────

type McpRequest = {
  jsonrpc: '2.0'
  id?: string | number
  method: string
  params?: Record<string, unknown>
}

type McpTool = {
  name: string
  description: string
  inputSchema: Record<string, unknown>
}

type McpResource = {
  uri: string
  name: string
  description?: string
  mimeType?: string
}

// ─── Tool Definitions ─────────────────────────────────────────────────

const TOOLS: McpTool[] = [
  {
    name: 'create_hero_section',
    description:
      'Create a hero section configuration from a list of frame images. ' +
      'Returns a scroll-trigger config, HTML markup, and CSS ready to drop ' +
      'into a Next.js or static site.',
    inputSchema: {
      type: 'object',
      properties: {
        frameUrls: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of frame image URLs (ordered)',
        },
        mode: {
          type: 'string',
          enum: [
            'linear',
            'easeIn',
            'easeOut',
            'easeInOut',
            'velocity',
            'scene',
            'goldenRatio',
            'stepHold',
            'manual',
          ],
          description: 'Scroll trigger calculation mode',
          default: 'easeInOut',
        },
        scrollDistance: {
          type: 'number',
          description: 'Total scroll distance in pixels',
          default: 3000,
        },
        title: {
          type: 'string',
          description: 'Hero section heading text',
          default: 'Hero Section',
        },
        subtitle: {
          type: 'string',
          description: 'Hero section subtitle text',
          default: '',
        },
      },
      required: ['frameUrls'],
      additionalProperties: false,
    },
  },
  {
    name: 'generate_scroll_trigger',
    description:
      'Compute a scroll-trigger map from a config. Returns per-frame ' +
      'scroll positions, progress values, and statistics.',
    inputSchema: {
      type: 'object',
      properties: {
        frameCount: {
          type: 'number',
          description: 'Number of frames',
          minimum: 1,
        },
        mode: {
          type: 'string',
          enum: [
            'linear',
            'easeIn',
            'easeOut',
            'easeInOut',
            'velocity',
            'scene',
            'goldenRatio',
            'stepHold',
            'manual',
          ],
          description: 'Scroll trigger calculation mode',
          default: 'easeInOut',
        },
        scrollDistance: {
          type: 'number',
          description: 'Total scroll distance in pixels',
          default: 3000,
        },
      },
      required: ['frameCount'],
      additionalProperties: false,
    },
  },
  {
    name: 'export_sequence',
    description:
      'Export a sequence as JSON, JavaScript, or CSS for use in a web site.',
    inputSchema: {
      type: 'object',
      properties: {
        format: {
          type: 'string',
          enum: ['json', 'js', 'css'],
          description: 'Export format',
          default: 'json',
        },
        frameCount: {
          type: 'number',
          description: 'Number of frames',
          minimum: 1,
        },
        mode: {
          type: 'string',
          enum: [
            'linear',
            'easeIn',
            'easeOut',
            'easeInOut',
            'velocity',
            'scene',
            'goldenRatio',
            'stepHold',
            'manual',
          ],
          description: 'Scroll trigger calculation mode',
          default: 'easeInOut',
        },
        scrollDistance: {
          type: 'number',
          description: 'Total scroll distance in pixels',
          default: 3000,
        },
      },
      required: ['format', 'frameCount'],
      additionalProperties: false,
    },
  },
  {
    name: 'list_scroll_modes',
    description:
      'Return all available scroll trigger modes with descriptions and ' +
      'best-use guidance.',
    inputSchema: {
      type: 'object',
      properties: {},
      additionalProperties: false,
    },
  },
]

// ─── Resource Definitions ─────────────────────────────────────────────

const RESOURCES: McpResource[] = [
  {
    uri: 'artisan://modes',
    name: 'Scroll Trigger Modes',
    description: 'All available scroll trigger calculation modes',
    mimeType: 'application/json',
  },
  {
    uri: 'artisan://config',
    name: 'Default Scroll Config',
    description: 'Default scroll trigger configuration',
    mimeType: 'application/json',
  },
]

// ─── Handler Implementations ─────────────────────────────────────────

import {
  generateScrollTriggerMap,
  exportScrollTriggerJSON,
  exportScrollTriggerJS,
  exportScrollTriggerCSS,
  SCROLL_MODE_INFO,
} from '@/lib/scroll-trigger'
import type { ScrollTriggerConfig } from '@/types'
import { DEFAULT_SCROLL_CONFIG } from '@/types'



function handleListScrollModes(): unknown {
  return {
    modes: Object.entries(SCROLL_MODE_INFO).map(([key, info]) => ({
      key,
      ...info,
    })),
  }
}

function handleGenerateScrollTrigger(params: unknown): unknown {
  const p = params as Record<string, unknown>
  const frameCount = Number(p.frameCount) || 120
  const mode = (p.mode ?? 'easeInOut') as ScrollTriggerConfig['mode']
  const scrollDistance = Number(p.scrollDistance) ?? 1000

  const config: ScrollTriggerConfig = {
    ...DEFAULT_SCROLL_CONFIG,
    mode,
    scrollDistance,
  }

  const map = generateScrollTriggerMap(frameCount, config)

  return {
    config,
    eventCount: map.eventCount,
    events: map.events,
    stats: map.stats,
    scrollDistancePx: map.scrollDistancePx,
  }
}

function handleCreateHeroSection(params: unknown): unknown {
  const p = params as Record<string, unknown>
  const frameUrls: string[] = Array.isArray(p.frameUrls) ? p.frameUrls : []
  const mode = (p.mode ?? 'easeInOut') as ScrollTriggerConfig['mode']
  const scrollDistance = Number(p.scrollDistance) ?? 3000
  const title = String(p.title ?? 'Hero Section')
  const subtitle = String(p.subtitle ?? '')

  const frameCount = frameUrls.length
  const config: ScrollTriggerConfig = {
    ...DEFAULT_SCROLL_CONFIG,
    mode,
    scrollDistance,
  }

  const map = generateScrollTriggerMap(frameCount, config)

  // Generate HTML markup
  const eventsHtml = map.events
    .map(
      (e, i) => `
    <img
      src="${frameUrls[i] ?? ''}"
      data-scroll="${e.scrollPosition}"
      data-frame="${e.frameIndex}"
      class="scroll-frame absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-700 ${i === 0 ? 'opacity-100' : ''}"
      alt="Frame ${e.frameIndex + 1}"
    />
  `,
    )
    .join('')

  const html = `
<div class="relative w-full h-[${scrollDistance}px] overflow-hidden">
  <div class="absolute inset-0 w-full h-full">
    ${eventsHtml}
  </div>
</div>
  `.trim()

  const css = `
.scroll-frame {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  transition: opacity 700ms ease;
}
.scroll-frame.opacity-100 {
  opacity: 1;
}
  `.trim()

  return {
    html,
    css,
    config,
    map: {
      eventCount: map.eventCount,
      events: map.events,
      stats: map.stats,
    },
    title,
    subtitle,
    frameUrls,
  }
}

function handleExportSequence(params: unknown): unknown {
  const p = params as Record<string, unknown>
  const format = (p.format ?? 'json') as 'json' | 'js' | 'css'
  const frameCount = Number(p.frameCount) ?? 120
  const mode = (p.mode ?? 'easeInOut') as ScrollTriggerConfig['mode']
  const scrollDistance = Number(p.scrollDistance) ?? 1000

  const config: ScrollTriggerConfig = {
    ...DEFAULT_SCROLL_CONFIG,
    mode,
    scrollDistance,
  }

  const map = generateScrollTriggerMap(frameCount, config)

  switch (format) {
    case 'json':
      return { format: 'json', content: exportScrollTriggerJSON(map) }
    case 'js':
      return { format: 'js', content: exportScrollTriggerJS(map) }
    case 'css':
      return { format: 'css', content: exportScrollTriggerCSS(map) }
    default:
      return { format: 'json', content: exportScrollTriggerJSON(map) }
  }
}

// ─── MCP Protocol Handler ─────────────────────────────────────────────

function createMcpError(code: number, message: string): unknown {
  return { code, message }
}

async function handleMcpRequest(req: McpRequest): Promise<unknown> {
  const { method, params, id } = req

  // Initialize
  if (method === 'initialize') {
    return {
      jsonrpc: '2.0',
      id,
      result: {
        protocolVersion: '2024-11-05',
        capabilities: {
          tools: {},
          resources: {},
        },
        serverInfo: {
          name: 'artisan-labs-mcp',
          version: '0.1.0',
        },
      },
    }
  }

  // List tools
  if (method === 'tools/list') {
    return {
      jsonrpc: '2.0',
      id,
      result: { tools: TOOLS },
    }
  }

  // List resources
  if (method === 'resources/list') {
    return {
      jsonrpc: '2.0',
      id,
      result: { resources: RESOURCES },
    }
  }

  // Read resource
  if (method === 'resources/read') {
    const uri = (params as Record<string, unknown>)?.uri as string
    if (uri === 'artisan://modes') {
      return {
        jsonrpc: '2.0',
        id,
        result: {
          contents: [
            {
              uri,
              mimeType: 'application/json',
              text: JSON.stringify(handleListScrollModes(), null, 2),
            },
          ],
        },
      }
    }
    if (uri === 'artisan://config') {
      return {
        jsonrpc: '2.0',
        id,
        result: {
          contents: [
            {
              uri,
              mimeType: 'application/json',
              text: JSON.stringify(DEFAULT_SCROLL_CONFIG, null, 2),
            },
          ],
        },
      }
    }
    return {
      jsonrpc: '2.0',
      id,
      error: createMcpError(-32602, `Unknown resource: ${uri}`),
    }
  }

  // Call tool
  if (method === 'tools/call') {
    const name = (params as Record<string, unknown>)?.name as string
    const args = (params as Record<string, unknown>)?.arguments as
      | Record<string, unknown>
      | undefined

    try {
      let result: unknown
      switch (name) {
        case 'create_hero_section':
          result = handleCreateHeroSection(args)
          break
        case 'generate_scroll_trigger':
          result = handleGenerateScrollTrigger(args)
          break
        case 'export_sequence':
          result = handleExportSequence(args)
          break
        case 'list_scroll_modes':
          result = handleListScrollModes()
          break
        default:
          return {
            jsonrpc: '2.0',
            id,
            error: createMcpError(-32601, `Unknown tool: ${name}`),
          }
      }

      return {
        jsonrpc: '2.0',
        id,
        result: {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        },
      }
    } catch (err) {
      return {
        jsonrpc: '2.0',
        id,
        error: createMcpError(
          -32603,
          err instanceof Error ? err.message : 'Internal error',
        ),
      }
    }
  }

  return {
    jsonrpc: '2.0',
    id,
    error: createMcpError(-32601, `Unknown method: ${method}`),
  }
}

// ─── Next.js Route Handler ────────────────────────────────────────────

export async function POST(req: Request): Promise<Response> {
  const accept = req.headers.get('accept') || ''
  const isSse = accept.includes('text/event-stream')

  let body: McpRequest
  try {
    body = (await req.json()) as McpRequest
  } catch {
    return NextResponse.json(
      { jsonrpc: '2.0', error: { code: -32700, message: 'Parse error' } },
      { status: 400 },
    )
  }

  const result = await handleMcpRequest(body)

  if (isSse) {
    const eventData = `data: ${JSON.stringify(result)}\n\n`
    return new Response(eventData, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  }

  return NextResponse.json(result)
}

// Handle GET for SSE connection establishment
export async function GET(req: Request): Promise<Response> {
  const accept = req.headers.get('accept') || ''
  if (!accept.includes('text/event-stream')) {
    return NextResponse.json(
      { error: 'Use POST with Accept: text/event-stream for SSE' },
      { status: 400 },
    )
  }

  // SSE stream - send an initialization event then keep connection alive
  const encoder = new TextEncoder()
  const stream = new TransformStream()
  const writer = stream.writable.getWriter()

  // Send initial endpoint event
  writer
    .write(encoder.encode('event: endpoint\ndata: /api/mcp\n\n'))
    .catch(() => {})

  // Keep-alive interval
  const keepAlive = setInterval(() => {
    writer.write(encoder.encode(': ping\n\n')).catch(() => {})
  }, 30000)

  // Close on request abort
  req.signal.addEventListener('abort', () => {
    clearInterval(keepAlive)
    writer.close()
  })

  return new Response(stream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
