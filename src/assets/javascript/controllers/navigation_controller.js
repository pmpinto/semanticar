import { Controller } from '@hotwired/stimulus'

export default class NavigationController extends Controller {
  // static targets = []

  // connect() { }

  toggle() {
    this.element.classList.toggle('is-open')
  }
}
