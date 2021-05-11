import { basename, join, relative, resolve } from 'path'
import type { PreprocessorGroup } from 'svelte/types/compiler/preprocess/types'
import { useFs } from '@nbhr/utils'

interface Options {
  rootDir: string
  pageDir: string
}

export function createRoutes (options: Options): PreprocessorGroup {
  const { rootDir, pageDir } = options
  return {
    script: ({ content }) => {
      const files = useFs.walkSync(resolve(join(rootDir, pageDir)))
      console.log(files)
      let importScriptBlock = ''
      files.forEach(file => {
        const parsedPath = relative(resolve(rootDir), file)
        console.log(parsedPath)
        const base = basename(file)
        const name = base.split('.')[0].replace('~', '')
        const path = `"./${parsedPath.replace(/\\/g, '/')}"`
        console.log(path)

        importScriptBlock += `\nimport ${name} from ${path};`
      })
      let processedContent = content
      if (content.includes('useRoutes')) {
        processedContent = importScriptBlock + '\n\n' + content
          .replace('useRoutes;', '{ a: Home }')
      }
      return {
        code: processedContent
      }
    }
  }
}
