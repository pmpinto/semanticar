import { Controller } from '@hotwired/stimulus'
import * as JsSearch from 'js-search'
import debounce from 'lodash.debounce'

import * as KnowledgeBase from '../../data/knowledge_base.json'

export default class SearchController extends Controller {
  static targets = ['input', 'total', 'duration', 'listItem', 'list', 'notFound']

  connect() {
    this.prepareSearch()

    this.inputTarget.addEventListener('keydown', debounce((event) => { this.doSearch(event) }, 250))
    document.body.addEventListener('keydown', debounce((event) => { this.listenForKeyboardShortcuts(event) }, 250))

    this.element.addEventListener('click', (event) => {
      if (event.target.classList.contains('search__backdrop')) {
        this.toggle()
        this.inputTarget.blur()
      }
    })
  }

  prepareSearch() {
    this.search = new JsSearch.Search('url')
    this.search.addIndex('title')
    this.search.addIndex('excerpt')
    this.search.addIndex('body')

    this.search.addDocuments(KnowledgeBase.posts)
  }

  async doSearch(event) {
    const searchString = this.inputTarget.value

    if (!searchString) {
      this.element.classList.remove('is-open')

      return
    }

    const startTime = performance.now()
    const { key } = event

    if (key === 'Enter' || key === 'Tab') {
      event.preventDefault()
      const firstPost = this.listTarget.querySelector('.search__post:not(.search__post--error)')

      if (!firstPost) return
      firstPost.querySelector('.search__link').focus()

      return
    }

    this.element.classList.add('is-open')
    this.clearResults()

    const results = this.search.search(searchString)
    if (results.length) {
      await this.injectResults(results)
    } else {
      this.showNotFound(searchString)
    }

    const endTime = performance.now()
    const duration = Math.round(((endTime - startTime) / 1000 + Number.EPSILON) * 100) / 100
    this.injectStats(duration, results.length)
  }

  submit(event) {
    event.preventDefault()
  }

  clearResults() {
    this.listTarget.innerHTML = ''
  }

  async injectResults(results) {
    const markup = document.createDocumentFragment()
    results.forEach(post => {
      const postMarkup = this.listItemTarget.content.cloneNode(true)
      const date = new Date(post.date)

      postMarkup.querySelector('.search__link').setAttribute('href', post.url)
      postMarkup.querySelector('.search__date').innerText = date.toLocaleDateString('pt-PT', { year: 'numeric', month: 'long', day: 'numeric' })
      postMarkup.querySelector('.search__title').innerText = post.title

      markup.appendChild(postMarkup)
    })

    this.listTarget.append(markup)

    return new Promise((resolve) => resolve())
  }

  showNotFound(query) {
    const markup = this.notFoundTarget.content.cloneNode(true)
    const text = markup.querySelector('.search__error')
    const message = text.innerText.replace('%query%', query)

    text.innerText = message
    this.listTarget.append(markup)
  }

  injectStats(duration, total) {
    this.totalTarget.innerText = total
    this.durationTarget.innerText = duration
  }

  toggle() {
    this.element.classList.toggle('is-visible')
    document.body.classList.toggle('is-scroll-locked')
    this.element.classList.remove('is-open')
    this.inputTarget.value = ''
  }

  listenForKeyboardShortcuts(event) {
    const { key } = event

    if (key === 'Escape') {
      this.toggle()
      this.inputTarget.blur()
      return
    }

    if (key === 'f' && !event.metaKey && !event.shiftKey && !event.altKey) {
      this.inputTarget.focus()
      if (!this.element.classList.contains('is-open')) {
        this.toggle()
      }
    }
  }
}
