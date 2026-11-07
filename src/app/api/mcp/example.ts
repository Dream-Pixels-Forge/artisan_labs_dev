/**
 * Example: Using the Artisan Labs MCP server from a coding agent.
 *
 * This file demonstrates how an MCP coding agent can use the Artisan Labs
 * MCP server to create hero sections, generate scroll-trigger configs, and
 * export sequences programmatically.
 *
 * Run with: npx tsx src/app/api/mcp/example.ts
 */

import { generateScrollTriggerMap } from '@/lib/scroll-trigger'
import { DEFAULT_SCROLL_CONFIG } from '@/types'

const MCP_BASE = 'http://localhost:3000/api/mcp'

/**
 * Send a JSON-RPC request to the MCP server.
 */
async function mcpCall(method: string, params?: Record<string, unknown>) {
  const res = await fetch(MCP_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method,
      params,
    }),
  })
  const data = await res.json()
  if (data.error) throw new Error(data.error.message)
  return data.result
}

/**
 * Example 1: List available scroll trigger modes.
 */
async function listModes() {
  const result = await mcpCall('tools/list')
  const heroTool = result.tools.find((t: any) => t.name === 'create_hero_section')
  console.log('Available tools:', result.tools.map((t: any) => t.name))
  console.log('Hero section tool:', JSON.stringify(heroTool, null, 2))
}

/**
 * Example 2: Create a hero section from frame URLs.
 * An agent would call this to generate a complete hero section
 * with HTML, CSS, and scroll-trigger config.
 */
async function createHeroSection() {
  const frameUrls = [
    '/frames/hero-0001.webp',
    '/frames/hero-0002.webp',
    '/frames/hero-0003.webp',
    '/frames/hero-0004.webp',
    '/frames/hero-0005.webp',
  ]

  const result = await mcpCall('tools/call', {
    name: 'create_hero_section',
    arguments: {
      frameUrls,
      mode: 'easeInOut',
      scrollDistance: 2000,
      title: 'Artisan Labs',
      subtitle: 'Scrollytelling Sequence Optimizer',
    },
  })

  const content = JSON.parse((result.content[0] as any).text)
  console.log('Hero HTML:', content.html)
  console.log('Hero CSS:', content.css)
  console.log('Trigger events:', content.map.eventCount)
  return content
}

/**
 * Example 3: Generate a scroll-trigger map for custom integration.
 */
async function generateScrollTrigger() {
  const result = await mcpCall('tools/call', {
    name: 'generate_scroll_trigger',
    arguments: {
      frameCount: 100,
      mode: 'velocity',
      scrollDistance: 1500,
    },
  })

  const content = JSON.parse((result.content[0] as any).text)
  console.log('Scroll map events:', content.eventCount)
  console.log('First 3 events:', content.events.slice(0, 3))
  return content
}

/**
 * Example 4: Export a sequence as CSS for direct use in a site.
 */
async function exportCss() {
  const result = await mcpCall('tools/call', {
    name: 'export_sequence',
    arguments: {
      format: 'css',
      frameCount: 50,
      mode: 'goldenRatio',
      scrollDistance: 2500,
    },
  })

  const content = JSON.parse((result.content[0] as any).text)
  console.log('CSS export (first 200 chars):', content.content.slice(0, 200))
  return content
}

/**
 * Example 5: Read a resource (scroll modes info).
 */
async function readResource() {
  const res = await fetch(MCP_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 2,
      method: 'resources/read',
      params: { uri: 'artisan://modes' },
    }),
  })
  const data = await res.json()
  const modes = JSON.parse(data.result.contents[0].text)
  console.log('Available modes:', Object.keys(modes.modes))
  return modes
}

// Direct library usage (no MCP needed) - for comparison
function directUsage() {
  const map = generateScrollTriggerMap(50, {
    ...DEFAULT_SCROLL_CONFIG,
    mode: 'easeInOut',
    scrollDistance: 2000,
  })
  console.log('Direct usage - events:', map.eventCount)
  return map
}

export { listModes, createHeroSection, generateScrollTrigger, exportCss, readResource, directUsage }
