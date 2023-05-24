import { Application } from '@hotwired/stimulus'

import NavigationController from './controllers/navigation_controller'
import HeroController from './controllers/hero_controller'
import AppController from './controllers/app_controller'
import StatsController from './controllers/stats_controller'

window.Stimulus = Application.start()

window.Stimulus.register('navigation', NavigationController)
window.Stimulus.register('hero', HeroController)
window.Stimulus.register('app', AppController)
window.Stimulus.register('stats', StatsController)
