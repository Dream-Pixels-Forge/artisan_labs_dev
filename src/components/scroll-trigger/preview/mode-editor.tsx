'use client'

import type { ScrollTriggerConfig } from '@/types'
import { SceneEditor } from './SceneEditor'
import { ManualRangeEditor } from './ManualRangeEditor'

interface ModeEditorProps {
  config: ScrollTriggerConfig
  frameCount: number
  frameTimestamps?: number[]
  disabled?: boolean
  onConfigChange: (updates: Partial<ScrollTriggerConfig>) => void
  setConfig: React.Dispatch<React.SetStateAction<ScrollTriggerConfig>>
}

export function ModeEditor({
  config,
  frameCount,
  frameTimestamps,
  disabled,
  onConfigChange,
  setConfig,
}: ModeEditorProps) {
  return (
    <>
      <SceneEditor
        config={config}
        frameCount={frameCount}
        frameTimestamps={frameTimestamps}
        disabled={disabled}
        setConfig={setConfig}
        onConfigChange={onConfigChange}
      />
      <ManualRangeEditor
        config={config}
        frameCount={frameCount}
        disabled={disabled}
        setConfig={setConfig}
      />
    </>
  )
}
