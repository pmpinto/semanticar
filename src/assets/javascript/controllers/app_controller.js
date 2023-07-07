import { Controller } from '@hotwired/stimulus'
import { API } from '../api'
import throttle from 'lodash.throttle'

export default class AppController extends Controller {
  static targets = ['navigation', 'footer', 'highlights', 'progressBar', 'toc']

  connect() {
    this.observeFooter()
    this.observeHighlights()

    this.watchScroll()
    this.setAnalyticsEvents()

    this.toggleNav = this.toggleNav.bind(this)
    this.isPost = this.element.classList.contains('post')
    this.isError = this.element.classList.contains('error')

    this.setupTocEvents()
    this.observePostSections()
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
      if (this.isError) return

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
    const scrollPosition = window.pageYOffset / document.body.offsetHeight
    document.body.style.setProperty('--scroll-position', scrollPosition)
  }

  updateScrollPercentage() {
    const post = document.querySelector('.post__main')
    const relatedHeight = document.querySelector('.related')?.offsetHeight || 0
    const subscribeBannerHeight = document.querySelector('.subscribe-banner')?.offsetHeight || 0
    const shareHeight = document.querySelector('.share')?.offsetHeight || 0
    const offset = relatedHeight - subscribeBannerHeight - shareHeight + window.innerHeight / 2

    const scrollPercentage = Math.min(window.pageYOffset / (post.scrollHeight - window.innerHeight - offset), 1)
    document.body.style.setProperty('--scroll-percentage', scrollPercentage)
  }

  setAnalyticsEvents() {
    if (!window.gtag) return

    const elements = document.querySelectorAll('[data-event-category]')

    elements.forEach((element) => {
      element.addEventListener('click', () => {
        const category = element.getAttribute('data-event-category')
        const label = element.getAttribute('data-event-label')

        window.gtag('event', 'click', {
          'event_category': category,
          'event_label': label
        })
      })
    })
  }

  setupTocEvents() {
    const toc = document.querySelector('.toc__list')

    if (!toc) return

    this.cleanMarkupFromTocPlugin(toc)
    this.tocTarget.appendChild(toc)
    this.tocTarget.classList.add('is-visible')
  }

  cleanMarkupFromTocPlugin(toc) {
    const siblings = [toc.previousElementSibling, toc.nextElementSibling]

    siblings.forEach((sibling) => {
      const markup = sibling.outerHTML
      if (markup === '<p></p>') {
        sibling.remove()
      }
    })
  }

  observePostSections() {
    if (!this.isPost) return

    const tocLinks = this.tocTarget.querySelectorAll('a')
    const observer = new IntersectionObserver(([entry]) => {
      if (this.isError || !this.isPost) return

      this.setSectionActiveInTOC(entry)
    }, {
      rootMargin: '0px',
      threshold: 1,
    })

    tocLinks.forEach((link) => {
      const sectionID = link.getAttribute('href')
      const section = document.querySelector(sectionID)

      if (section) {
        observer.observe(section)
      }
    })
  }

  setSectionActiveInTOC(section) {
    const sectionID = `#${section.target.getAttribute('id')}`
    const link = this.tocTarget.querySelector(`a[href="${sectionID}"]`)
    const activeLink = this.tocTarget.querySelector('.is-active')

    if (section.isIntersecting) {
      activeLink?.classList.remove('is-active')
      link.classList.toggle('is-active', section.isIntersecting)
    }
  }
}
