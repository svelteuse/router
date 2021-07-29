import { writable } from 'svelte/store'
import type { SvelteComponent } from 'svelte/types/runtime'
import type { Writable } from 'svelte/types/runtime/store'

// export { default as RouterView } from './RouterView.svelte'

export function exists<T>(x: T): boolean {
  return x === undefined || x === null ? false : true
}

export function useGuard(options: Record<any, any>,...args: any[]): boolean {
  // FIXME:  navigate on Guard here, instead of Application
  console.log('args', args)
  if (options.link === 'or') {
    return args.includes(true)
  }
  return args.every(e => e === true)
}

export function link (node: HTMLElement): {
  destroy?: () => void
} {
  node.addEventListener('click', function (event) {
    event.preventDefault()
    const href = node.getAttribute('href')

    useRouter.update(storeData => {
      storeData.navigate(href?.toString() || '')
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

interface Router {
  routes: Route[] | undefined
  mode:string
  root: string
  getFragment: () => string
  getComponent: () => SvelteComponent | undefined
  getComponentLayout: () => SvelteComponent | undefined
  navigate: (path: string) => void
}

export const useRouter: Writable<Router> = writable({
  routes: undefined,
  mode: 'history',
  root: '/',
  getFragment: () => {
    return decodeURI(window.location.pathname + window.location.search)
  },
  getComponent: function () {
    console.log(this.getFragment())
    
    if (this.routes != undefined) {
      console.log('try to find above route')
      
      let c
      const regex = new RegExp('^' + this.getFragment() + '$', 'gm')
      console.log('using regex: ' + regex)
      
      c = this.routes.find(route => {
        console.log('route: ' + route.path)
        
        return route.path.match(regex)
      })?.component
      return c
    }
  },
  getComponentLayout: function() {
    console.log(this.getFragment())
    
    if (this.routes != undefined) {
      console.log('try to find above route')
      
      let c
      const regex = new RegExp('^' + this.getFragment() + '$', 'gm')
      console.log('using regex: ' + regex)
      
      c = this.routes.find(route => {
        console.log('route: ' + route.path)
        
        return route.path.match(regex)
      })?.layout
      return c
    }
  },
  navigate: function (path: string)  {
    useRouter.update(storeData => {
      console.log('navigate to: ' + path)
      if (storeData.mode === 'history') {
        window.history.pushState(undefined, '', this.root + path.replace(/\/$/, '').replace(/^\//, ''))
      }
      return storeData
    })
  }
})
