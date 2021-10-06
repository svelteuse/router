import { parse } from 'regexparam'
import { writable } from 'svelte/store'
import type { SvelteComponent } from 'svelte/types/runtime'
import type { Writable } from 'svelte/types/runtime/store'

export function exists<T>(x: T): boolean {
  return x === undefined || x === null ? false : true
}

// const guardCheck = useGuard({ link: 'or', redirect: '/login' }, exists(ACCOUNTS[0]))
// if (!guardCheck) {
//   $useRouter.navigate('/login')
//   console.log($useRouter.getFragment())
//   console.log($useRouter.getComponent())
// }

// options: GuardOptions, ...args: any[]
// interface GuardOptions {}

class Guard {
  _destination = '/'
  _logic: 'and' | 'or' = 'and'

  constructor(logic?: 'and' | 'or') {
    console.log('GUARD CLASS')
    if (logic) this._logic = logic
  }

  /**
   * goTo
   */
  public goTo(href: string): this {
    this._destination = href
    console.log('guard would send me to', href)
    return this
  }

  private _navigate() {
    useRouter.update((storeData) => {
      storeData.navigate(this._destination)
      window.location.reload()
      return storeData
    })
  }

  /**
   * check
   */
  public check(...args: boolean[]): this {
    console.log('argsArray', args)
    if (this._logic === 'and' && args.some((check) => check == false)) {
      this._navigate()
    }
    return this
  }

  // console.log('args', args)
  // if (options.link === 'or') {
  //   return args.includes(true)
  // }
  // return args.every((e) => e === true)
}

export function useGuard(): Guard {
  return new Guard()
}
export function link(node: HTMLElement): {
  destroy?: () => void
} {
  node.addEventListener('click', function (event) {
    if (event.metaKey || event.altKey || event.ctrlKey || event.shiftKey) return
    event.preventDefault()
    const href = node.getAttribute('href')

    useRouter.update((storeData) => {
      storeData.navigate(href?.toString() || '')
      return storeData
    })
  })
  return {
    destroy() {
      // the node has been removed from the DOM
    },
  }
}

interface Route {
  path: string
  component: SvelteComponent | undefined
  layout: SvelteComponent | undefined
}

interface Router {
  routes: Route[]
  mode: string
  root: string
  props: Record<string, unknown>
  getFragment: () => string
  matchRoute: (path: string) => Route | undefined
  getComponent: () => SvelteComponent | undefined
  getComponentLayout: () => SvelteComponent | undefined
  getProps: () => Record<string, unknown>
  navigate: (path: string) => void
}

type Evergreen =
  | string
  | number
  | boolean
  | bigint
  | Record<string, unknown>
  | Array<unknown>
  | null
  | undefined

type ComponentProps = Record<string, Evergreen>

export const useRouter: Writable<Router> = writable({
  routes: [],
  mode: 'history',
  root: '/',
  props: <ComponentProps>{},
  matchRoute: function (path: string) {
    const routes = this.routes
    let match
    for (const route of routes) {
      const { pathname, search } = new URL('https://test.org' + path)

      const router = parse(route.path)
      const isRoute = router.pattern.test(pathname)

      console.log('query to add as props', search)

      if (isRoute) match = route
      if (router.keys.length > 0) {
        const matches = router.pattern.exec(pathname)
        if (matches) {
          let i = 0
          while (i < router.keys.length) {
            const key = router.keys[i].toString()
            const value = matches[++i]
            this.props[key] = value
          }
        }
      }
      if (search.length > 0) {
        this.props['queryparams'] = Object.fromEntries(
          new URLSearchParams(search) as unknown as Map<string, string>
        )
      }
      if (isRoute) break
    }
    return match
  },
  getFragment: () => {
    return decodeURI(window.location.pathname + window.location.search)
  },
  getComponentLayout: function () {
    if (this.routes) {
      console.log('trying to match:', this.getFragment())
      const svelteComponent = this.matchRoute(this.getFragment())

      if (!svelteComponent) {
        console.log("page not found")
        this.navigate(`${this.getFragment().split("/")[1]}/notfound`)
        return
      }  else {
        return svelteComponent.layout
      }
    } else {
      throw new Error('routes are not registered correctly')
    }
  },
  getComponent: function () {
    if (this.routes) {
      console.log('try to find above route')
      const svelteComponent = this.matchRoute(this.getFragment())

      if (!svelteComponent) {
        console.log("page not found")
        this.navigate(`${this.getFragment().split("/")[1]}/notfound`)
        return
      }  else {
        return svelteComponent.component
      }
    } else {
      throw new Error('routes are not registered correctly')
    }
  },
  getProps: function () {
    return this.props
  },
  navigate: function (path: string) {
    useRouter.update((storeData) => {
      console.log('navigate to: ' + path)
      if (storeData.mode === 'history') {
        window.history.pushState(
          undefined,
          '',
          this.root + path.replace(/\/$/, '').replace(/^\//, '')
        )
      }
      return storeData
    })
  },
})
