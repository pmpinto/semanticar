import { Controller } from '@hotwired/stimulus'

export default class GalleryController extends Controller {
  connect() {
    window.addEventListener('popstate', () => {
      this.element.classList.toggle('is-open', history.state.isGalleryOpen)
    })

    if (window.location.hash === '#galeria') {
      this.open()
    }
  }

  open() {
    window.history.pushState({ name: document.querySelector('title').innerText, path: window.location.pathname, isGalleryOpen: true }, '', `${window.location.origin}${window.location.pathname}#galeria`)
    window.dispatchEvent(new Event('popstate'))
  }

  close() {
    window.history.pushState({ name: document.querySelector('title').innerText, path: window.location.pathname, isGalleryOpen: false }, '', `${window.location.origin}${window.location.pathname}`)
    window.dispatchEvent(new Event('popstate'))
  }
}
