import { Controller } from '@hotwired/stimulus'

export default class HeroController extends Controller {
  // static targets = []

  // connect() { }

  letsGo(event) {
    event.preventDefault()

    const goToElement = this.element.nextElementSibling
    goToElement.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    })

  }
}
