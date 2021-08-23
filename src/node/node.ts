import { walkSync } from '@nbhr/utils/fs'
import { basename, dirname, join, relative, resolve } from 'node:path'
import type { PreprocessorGroup } from 'svelte/types/compiler/preprocess/types'

interface Options {
  rootDir: string
  pageDir: string
  mainComponent: string
}

export function createRoutes(options: Options): PreprocessorGroup {
  const { rootDir, pageDir, mainComponent } = options
  return {
    script: ({ content, attributes }) => {
      const routes: Map<string, unknown> = new Map()
      const files = walkSync(resolve(join(rootDir, pageDir)))
      let importScriptBlock = ''
      for (const file of files) {
        const parsedPath = relative(resolve(rootDir), file)
        const directory = basename(dirname(parsedPath))
        const base = basename(file)
        let name = base.split('.')[0]
        const isDynamic = name.includes('[')
        name = name.replace('[', '').replace(']', '')
        const componentName = isDynamic ? directory.toUpperCase() : name
        const path = `"./${parsedPath.replaceAll('\\', '/')}"`
        importScriptBlock += `\nimport ${componentName} from ${path};`

        const routePath = `${
          directory == pageDir ? '' : '/' + directory.toLowerCase()
        }${isDynamic ? '/:' + name : '/' + name.toLowerCase()}`
        console.log(routePath)
        
        routes.set(componentName, {
          path:
            routePath == `/${mainComponent.split('.')[0].toLowerCase()}`
              ? '/'
              : routePath,
          // pattern: new RegExp(pattern).toString(),
          component: componentName,
        })
      }

      const routesDefinition = `
      $useRouter.routes = ${JSON.stringify([...routes.values()]).replace(
        /(?<=component":)"(\w+)"/g,
        '$1'
      )};
      `

      let processedContent = content
      if (attributes['svelteuse:imports'] === true) {
        processedContent =
          importScriptBlock + '\n' + routesDefinition + '\n\n' + content
      }
      return {
        code: processedContent,
      }
    },
  }
}
