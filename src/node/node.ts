import { walkSync } from '@nbhr/utils/fs'
import { readFileSync } from 'node:fs'
import { basename, join, relative, resolve, sep } from 'node:path'
import type { PreprocessorGroup } from 'svelte/types/compiler/preprocess/types'

interface Options {
  rootDir: string
  pageDir: string
  rootPath: string
}

export function createRoutes(options: Options): PreprocessorGroup {
  const { rootDir, pageDir, rootPath } = options
  return {
    script: ({ content, attributes, filename }) => {
      if (filename && filename.endsWith('App.svelte')) {
        const routes: Map<string, unknown> = new Map()
        const files = walkSync(resolve(join(rootDir, pageDir)))
        let importScriptBlock = ''
        for (const file of files) {
          const parsedPath = relative(resolve(rootDir), file)
          const componentName = generateImportIdentifier(parsedPath, pageDir)
          const path = generateImportPath(parsedPath)
          importScriptBlock += `\nimport ${componentName} from ${path};`

          const routePath = generateRoutePath(componentName, rootPath)

          const layoutConfig =
            readFileSync(file, 'utf8').match(/router-layout-(\w+)/i)?.[1] || 'default'
          const layoutName = layoutConfig?.charAt(0).toUpperCase() + layoutConfig?.slice(1)

          routes.set(componentName, {
            path: routePath,
            component: componentName,
            layout: layoutName,
          })
        }

        const routesDefinition = `
      $useRouter.routes = ${JSON.stringify([...routes.values()])
        .replace(/(?<=component":)"(\w+)"/g, '$1')
        .replace(/(?<=layout":)"(\w+)"/g, '$1')};
      `

        let processedContent = content
        if (attributes['svelteuse:imports'] === true) {
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

export function generateImportIdentifier(path: string, pageDir: string): string {
  let value = ''
  const segments = path.split(sep)
  const file = basename(segments.pop() || '', '.svelte')
  for (const dir of segments) {
    if (dir != pageDir) {
      isDynamic(dir)
        ? (value += dir.slice(1, -1).toUpperCase() + '_')
        : (value += dir.charAt(0).toUpperCase() + dir.slice(1) + '_')
    }
  }
  value += isDynamic(file)
    ? file.slice(1, -1).toUpperCase()
    : file.charAt(0).toUpperCase() + file.slice(1)
  return value
  // return isDynamic ? directory.toUpperCase() : name
}

export function generateImportPath(path: string): string {
  return `"./${path.replaceAll(sep, '/')}"`
}

export function generateRoutePath(componentName: string, rootPath?: string): string {
  // const routePath = `${rootPath ? rootPath : ''}${
  //   directory == pageDir ? '' : '/' + directory.toLowerCase()
  // }${isDynamic ? '/:' + name : '/' + name.toLowerCase()}`
  let value = ''
  if (rootPath) {
    value += rootPath
  }
  const segments = componentName.split('_')
  for (const segment of segments) {
    if (segment.toLowerCase() == 'index') {
      break
    }
    value += isUpperCase(segment) ? '/:' + segment.toLowerCase() : '/' + segment.toLowerCase()
  }

  return value
}

// function which checks if string is upper case
function isUpperCase(str: string): boolean {
  return str === str.toUpperCase()
}

// function which checks if string starts with '[' and ends with ']'
function isDynamic(str: string): boolean {
  return str.startsWith('[') && str.endsWith(']')
}
