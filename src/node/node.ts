import { walkSync } from '@nbhr/utils/fs'
import { readFileSync } from 'node:fs'
import { basename, join, relative, resolve, sep } from 'node:path'
import type { PreprocessorGroup } from 'svelte/types/compiler/preprocess/types'

interface Options {
  rootDir: string
  pageDir: string
  layoutDir: string
  rootPath: string
  entryFile: string
}

export function createRoutes(options: Options): PreprocessorGroup {
  const { rootDir, pageDir, layoutDir, rootPath, entryFile } = options
  return {
    script: ({ content, attributes, filename }) => {
      if (filename && filename.endsWith(entryFile)) {
        const routes: Map<string, unknown> = new Map()
        const pageFiles = walkSync(resolve(join(rootDir, pageDir)))
        const layoutFiles = walkSync(resolve(join(rootDir, layoutDir)))
        let importScriptBlock = ''
        for (const file of layoutFiles) {
          const parsedPath = relative(resolve(rootDir), file)
          const { identifier } = parseFile(parsedPath, layoutDir, rootPath)
          const importPath = generateImportPath(parsedPath)
          importScriptBlock += `\nimport ${identifier} from ${importPath};`
        }
        for (const file of pageFiles) {
          const parsedPath = relative(resolve(rootDir), file)
          const { identifier, path, isAsync } = parseFile(parsedPath, pageDir, rootPath)
          const importPath = generateImportPath(parsedPath)
          importScriptBlock += isAsync
            ? `\nlet ${identifier} = null;`
            : `\nimport ${identifier} from ${importPath};`

          const layoutConfig =
            readFileSync(file, 'utf8').match(/router-layout-(\w+)/i)?.[1] || 'default'
          const layoutName = layoutConfig?.charAt(0).toUpperCase() + layoutConfig?.slice(1)

          routes.set(identifier, {
            path: path,
            layout: layoutName,
            loader: isAsync
              ? `async () => {  console.log('async import'); console.log(${identifier}); return (await import(${importPath.replaceAll(
                  '"',
                  "'"
                )})).default; }`
              : `async () => { return Promise.resolve(${identifier}) }`,
          })
        }
        const routesDefinition = `
      $useRouter.routes = ${JSON.stringify([...routes.values()])
        .replace(/(?<=layout":)"(\w+)"/g, '$1')
        .replace(/(?<=loader":)"(.+?)"/g, '$1')};
      `

        let processedContent = content
        if (attributes['su-router-imports'] === true) {
          processedContent = importScriptBlock + '\n' + routesDefinition + '\n\n' + content
        }
        return {
          code: processedContent,
        }
      } else {
        return {
          code: content,
        }
      }
    },
  }
}

/** @internal */
export function parseFile(
  path: string,
  pageDir = 'pages',
  rootPath = '/'
): { identifier: string; path: string; isAsync: boolean } {
  let ivalue = ''
  let pvalue = ''

  if (rootPath && rootPath !== '/') {
    pvalue += rootPath
  }
  const extension = path.endsWith('.svelte') ? '.svelte' : '.svx'

  const segments = path.split(sep)
  let file = basename(segments.pop() || '', extension)
  const isAsync = file.startsWith('~') ? true : false
  file = file.replace('~', '')
  for (const dir of segments) {
    if (dir != pageDir) {
      isDynamic(dir)
        ? (ivalue += dir.slice(1, -1).toUpperCase() + '_')
        : (ivalue += dir.charAt(0).toUpperCase() + dir.slice(1) + '_')
      pvalue += isDynamic(dir) ? '/:' + dir.slice(1, -1).toLowerCase() : '/' + dir.toLowerCase()
    }
  }
  ivalue += isDynamic(file)
    ? file.slice(1, -1).toUpperCase()
    : file.charAt(0).toUpperCase() + file.slice(1)

  if (file.toLowerCase() !== 'index') {
    pvalue += isDynamic(file) ? '/:' + file.slice(1, -1).toLowerCase() : '/' + file.toLowerCase()
  }
  return {
    identifier: ivalue,
    path: pvalue,
    isAsync,
  }
}

/** @internal */
export function generateImportPath(path: string): string {
  return `"./${path.replaceAll(sep, '/')}"`
}

/** @internal */
function isDynamic(str: string): boolean {
  return str.startsWith('[') && str.endsWith(']')
}
