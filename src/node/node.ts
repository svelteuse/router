import { walkSync } from '@nbhr/utils/fs'
import { basename, join, relative, resolve } from 'node:path'
import type { PreprocessorGroup } from 'svelte/types/compiler/preprocess/types'

interface Options {
  rootDir: string
  pageDir: string
}

export function createRoutes (options: Options): PreprocessorGroup {
  const { rootDir, pageDir } = options
  return {
    script: ({ content, attributes }) => {
      const files = walkSync(resolve(join(rootDir, pageDir)))
      // console.log(files)
      let importScriptBlock = ''
      for (const file of files) {
        const parsedPath = relative(resolve(rootDir), file)
        // console.log(parsedPath)
        const base = basename(file)
        const name = base.split('.')[0].replace('~', '')
        const path = `"./${parsedPath.replace(/\\/g, '/')}"`
        // console.log(path)
        importScriptBlock += `\nimport ${name} from ${path};`
      }
      let processedContent = content
      if (attributes['svelteuse:imports'] === true) {
        processedContent = importScriptBlock + '\n\n' + content
      }
      return {
        code: processedContent
      }
    }
  }
}
