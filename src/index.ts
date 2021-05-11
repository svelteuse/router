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
