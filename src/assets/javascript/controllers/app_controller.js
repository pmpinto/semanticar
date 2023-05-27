import { Controller } from '@hotwired/stimulus'
import { API } from '../api'
import throttle from 'lodash.throttle'

export default class AppController extends Controller {
  static targets = ['navigation', 'footer', 'highlights']

  connect() {
    this.observeFooter()
    this.observeHighlights()

    this.watchScrollPosition()

    this.toggleNavAndFooter = this.toggleNavAndFooter.bind(this)
  }

  toggleNavAndFooter(entry) {
    this.navigationTarget.classList.toggle('is-hidden', entry.isIntersecting)
  }

  async subscribe(event) {
    event.preventDefault()
    await API.call('/increment-subscribers-count')
    window.location = event.target.closest('a').getAttribute('href')
  }

  observeFooter() {
    const observer = new IntersectionObserver(([entry]) => {
      this.toggleNavAndFooter(entry)
    }, {
      rootMargin: '0px',
      threshold: 0.5,
    })

    observer.observe(this.footerTarget)
  }

  observeHighlights() {
    if (!this.hasHighlightsTarget) return

    const observer = new IntersectionObserver(([entry]) => {
      this.displayHighlights(entry)
    }, {
      rootMargin: '0px',
      threshold: 0.8,
    })

    observer.observe(this.highlightsTarget)
  }

  displayHighlights(entry) {
    this.highlightsTarget.classList.toggle('is-visible', entry.isIntersecting)
  }

  watchScrollPosition() {
    window.addEventListener('scroll', throttle(() => {
      this.updateScrollPosition()
    }, 60), false)
  }

  updateScrollPosition() {
    const offset = document.body.offsetWidth / -4
    const scrollPosition = (window.pageYOffset + offset) / document.body.offsetHeight
    document.body.style.setProperty('--scroll-position', scrollPosition)
  }
}
