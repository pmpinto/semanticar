import { Controller } from '@hotwired/stimulus'
import { API } from '../api'

export default class AppController extends Controller {
  static targets = ['navigation', 'footer']

  connect() {
    const observer = new IntersectionObserver(([entry]) => {
      this.toggleNavAndFooter(entry)
    }, {
      rootMargin: '0px',
      threshold: 0.5,
    })

    observer.observe(this.footerTarget)

    this.toggleNavAndFooter = this.toggleNavAndFooter.bind(this)
  }

  toggleNavAndFooter(entry) {
    this.navigationTarget.classList.toggle('is-hidden', entry.isIntersecting)
  }

  async subscribe() {
    await API.call('/increment-subscribers-count')
  }
}
