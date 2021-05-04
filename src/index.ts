import type { PreprocessorGroup } from 'svelte/types/compiler/preprocess/types'

export const createRoutes = (): PreprocessorGroup => {
  return {
    script: ({ content }) => {
      const processedContent = content
      return {
        code: processedContent
      }
    }
  }
}
