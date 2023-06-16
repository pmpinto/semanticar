import { Controller } from '@hotwired/stimulus'
import { API } from '../api'

export default class StatsController extends Controller {
  static targets = ['subscribersTotal']

  async connect() {
    const subscribersTotal = await this.getSubscribesCount()
    this.subscribersTotalTarget.innerText = subscribersTotal || 0
  }

  async getSubscribesCount() {
    const { value } = await API.call('/get-subscribers-count')
    return value
  }
}
