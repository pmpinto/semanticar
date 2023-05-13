import { Application } from '@hotwired/stimulus'

import NavigationController from './controllers/navigation_controller'

window.Stimulus = Application.start()

window.Stimulus.register('navigation', NavigationController)
