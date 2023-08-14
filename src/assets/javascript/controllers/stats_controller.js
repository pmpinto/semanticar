import { Controller } from '@hotwired/stimulus'
import { API } from '../api'

export default class StatsController extends Controller {
  static targets = ['subscribersTotal']

  async connect() {
    const subscribersTotal = await this.getSubscribesCount()
    this.subscribersTotalTarget.innerText = subscribersTotal || 0
  }

  async getSubscribesCount() {
    let { value } = process.env.ENV === 'production' ? await API.call('/get-subscribers-count') : { value: 7 }
    return value
  }
}
