import { Controller } from '@hotwired/stimulus'

export default class AppController extends Controller {
  static targets = ['navigation', 'footer']

  connect() {
    console.log('> this.navigationTarget', this.navigationTarget,)

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

}
