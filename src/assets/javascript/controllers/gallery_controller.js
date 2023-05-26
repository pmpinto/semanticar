import { Controller } from '@hotwired/stimulus'

export default class GalleryController extends Controller {
  // static targets = []

  // connect() {  }

  open() {
    this.element.classList.add('is-open')
  }

  close() {
    this.element.classList.remove('is-open')
  }
}
