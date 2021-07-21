import { writable } from 'svelte/store'
import type { SvelteComponent } from 'svelte/types/runtime'
import type { Writable } from 'svelte/types/runtime/store'

// export { default as RouterView } from './RouterView.svelte'

export function link (node: HTMLElement): {
  update?: (parameters: any) => void
  destroy?: () => void
} {
  node.addEventListener('click', function (event) {
    event.preventDefault()
    const href = node.getAttribute('href')

    useRouter.update(storeData => {
      storeData.navigate(href?.toString())
      return storeData
    })
  })
  return {
    destroy () {
    // the node has been removed from the DOM
    }
  }
}

interface Route {
  path: string
  component: SvelteComponent | undefined
  layout: SvelteComponent | undefined
}
class Router {
  private _routes: Route[] | undefined = undefined

  mode = 'history'

  root = '/'

  public set routes (r: Route[] | undefined) {
    this._routes = r
  }

  public get routes (): Route[] | undefined {
    return this._routes
  }

  /**
   * flush
   */
  public flush (): void {
    this._routes = undefined
  }

  private clearSlashes (path: string): string {
    return path.replace(/\/$/, '').replace(/^\//, '')
    // return path
  }

  /**
   * getFragment
   */
  public getFragment (): string {
    let fragment = ''
    if (this.mode === 'history') {
      fragment = this.clearSlashes(decodeURI(window.location.pathname + window.location.search))
      fragment = fragment.replace(/\?(.*)$/, '')
      fragment = this.root !== '/' ? fragment.replace(this.root, '') : fragment
    }
    return this.clearSlashes(fragment)
  }

  /**
   * navigate
   */
  public navigate (path: string = ''): void {
    console.log('navigate to', path)
    if (this.mode === 'history') {
      window.history.pushState(null, '', this.root + this.clearSlashes(path))
    }
  }

  public get component (): SvelteComponent | undefined {
    if (this._routes != null) {
      let c
      if (this.getFragment() === '') {
        c = this._routes.find(route => route.path === '/')?.component
      } else {
        const regex = new RegExp('^/' + this.getFragment() + '$', 'gm')
        c = this._routes.find(route => route.path.match(regex))?.component
      }
      return c
    }
    return undefined
  }

  public get layout (): SvelteComponent | undefined {
    if (this._routes != null) {
      let c
      if (this.getFragment() === '') {
        c = this._routes.find(route => route.path === '/')?.layout
      } else {
        const regex = new RegExp('^/' + this.getFragment() + '$', 'gm')
        c = this._routes.find(route => route.path.match(regex))?.layout
      }
      return c
    }
    return undefined
  }
}

export const useRouter: Writable<Router> = writable(new Router())
