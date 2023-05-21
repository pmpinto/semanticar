import { Application } from '@hotwired/stimulus'

import NavigationController from './controllers/navigation_controller'
import HeroController from './controllers/hero_controller'

window.Stimulus = Application.start()

window.Stimulus.register('navigation', NavigationController)
window.Stimulus.register('hero', HeroController)
