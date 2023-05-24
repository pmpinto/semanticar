import { Application } from '@hotwired/stimulus'

import NavigationController from './controllers/navigation_controller'
import HeroController from './controllers/hero_controller'
import AppController from './controllers/app_controller'

import { API } from './api'

window.Stimulus = Application.start()

window.Stimulus.register('navigation', NavigationController)
window.Stimulus.register('hero', HeroController)
window.Stimulus.register('app', AppController)

const tryapi = async () => {
  console.log('> get count')
  const value = await API.call('/get-subscribers-count')
  // const valueInc = await API.call('/increment-subscribers-count')
  console.log('> value', value)
  // console.log('> valueUbc', valueInc)

}
tryapi()
