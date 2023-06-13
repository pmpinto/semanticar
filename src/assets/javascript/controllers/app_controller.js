import { Controller } from '@hotwired/stimulus'
import { API } from '../api'
import throttle from 'lodash.throttle'

export default class AppController extends Controller {
  static targets = ['navigation', 'footer', 'highlights', 'progressBar']

  connect() {
    this.observeFooter()
    this.observeHighlights()

    this.watchScroll()

    this.toggleNav = this.toggleNav.bind(this)
    this.isPost = this.element.classList.contains('post')
  }

  toggleNav(entry) {
    this.navigationTarget.classList.toggle('is-hidden', entry.isIntersecting)
  }

  toggleProgressBar(entry) {
    this.progressBarTarget.classList.toggle('is-hidden', entry.isIntersecting)
  }

  async subscribe(event) {
    event.preventDefault()

    const hasSubscription = !!window.localStorage.getItem('subscription')
    if (!hasSubscription) {
      window.localStorage.setItem('subscription', new Date())
      await API.call('/increment-subscribers-count')
    }

    window.location = event.target.closest('a').getAttribute('href')
  }

  observeFooter() {
    const observer = new IntersectionObserver(([entry]) => {
      this.toggleNav(entry)
      if (this.isPost) {
        this.toggleProgressBar(entry)
      }
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

  watchScroll() {
    window.addEventListener('scroll', throttle(() => {
      if (this.isPost) {
        this.updateScrollPosition()
        this.updateScrollPercentage()
      }
    }, 60), false)
  }

  updateScrollPosition() {
    const offset = document.body.offsetWidth / -4
    const scrollPosition = (window.pageYOffset + offset) / document.body.offsetHeight
    document.body.style.setProperty('--scroll-position', scrollPosition)
  }

  updateScrollPercentage() {
    const post = document.querySelector('.post__main')
    const scrollPercentage = Math.min(window.pageYOffset / (post.scrollHeight - window.innerHeight), 1)
    document.body.style.setProperty('--scroll-percentage', scrollPercentage)
  }
}
