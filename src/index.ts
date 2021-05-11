import { writable } from 'svelte/store'
import type { Writable } from 'svelte/types/runtime/store'

export { default as RouterView } from './RouterView.svelte'

export function link (node: HTMLElement): {
  update?: (parameters: any) => void
  destroy?: () => void
} {
  node.addEventListener('click', function (event) {
    event.preventDefault()
    const href = node.getAttribute('href')
    window.history.pushState({}, '', href)
    useRouter.update(data => {
      data.currentPath = (href != null) ? href : '/'
      return data
    })
  })
  return {
    destroy () {
    // the node has been removed from the DOM
    }
  }
}

interface Router {
  routes: Record<string, any>
  navigate: () => void
  currentPath: string
  getComponent: any

}
const router: Router = {
  routes: {
    '/': {
      path: '/',
      component: null
    }
  },
  navigate: () => {
    console.log('navigate tests')
  },
  currentPath: '/',
  get getComponent () {
    return this.routes[this.currentPath].component
  }
}
export const useRouter = writable(router)

