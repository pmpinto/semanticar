import { Controller } from '@hotwired/stimulus'

export default class ShareController extends Controller {
  static values = {
    postTitle: String
  }

  // connect() {  }

  async copyUrlToClipboard() {
    if (!navigator?.clipboard) {
      return
    }

    try {
      const pageUrl = window.location.href

      await navigator.clipboard.writeText(pageUrl)
      await this.askNotificationPermission('Endereço copiado!')
    } catch (error) {
      console.error('Clipboard Error:', error)
    }
  }

  async notify(text) {
    const notification = new Notification('Semanticar', {
      body: text,
      icon: '/static_assets/images/metadata/logo-32.png'
    })

    notification.addEventListener('error', (error) => {
      console.log('Notification Error:', error)
      alert(text)
    })
  }

  async askNotificationPermission(text) {
    if (!('Notification' in window)) {
      alert(text)
      return
    }

    if (Notification.permission === 'granted') {
      this.notify(text)
      return
    }

    const permission = await Notification.requestPermission()
    if (permission !== 'granted') {
      alert(text)
      return
    }

    this.notify(text)
  }

  async shareNative() {
    if (!navigator?.share) {
      this.copyUrlToClipboard()
      return
    }

    try {
      await navigator.share({
        title: 'Semanticar',
        text: `${this.postTitleValue.trim()} • Semanticar`,
        url: window.location.href
      })
    } catch (error) {
      console.error('Native share error:', error)
    }
  }
}
