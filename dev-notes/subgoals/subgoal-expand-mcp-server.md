# subgoal-expand-mcp-server.md

Derived from master GOAL.md / acceptance criterion: "Expand MCP server with more capabilities."

## Problem
The MCP server at `src/app/api/mcp/route.ts` has 4 tools but could do more:
- `capture_frame` — extract a single frame from a video
- `list_sequences` — list archived sequences
- `delete_sequence` — remove a sequence
- `get_sequence_stats` — get statistics about stored sequences

## Goal
Add additional MCP tools for sequence management.

## Verification Gates
- [ ] New MCP tools added to route.ts
- [ ] `tsc --noEmit` passes
- [ ] `vitest run` passes
- [ ] `next build` passes
- [ ] MCP docs updated

## Files to Touch
- `src/app/api/mcp/route.ts` — add new tools
- `docs/MCP-INTEGRATION.md` — document new tools
- `src/app/api/mcp/route.test.ts` — add tests for new tools

## Non-Goals
- Actual video frame extraction (requires video processing libs)
- Database integration

## Status
pending
