import { Application } from '@hotwired/stimulus'

import NavigationController from './controllers/navigation_controller'
import HeroController from './controllers/hero_controller'
import AppController from './controllers/app_controller'
import StatsController from './controllers/stats_controller'
import ShareController from './controllers/share_controller'
import GalleryController from './controllers/gallery_controller'
import SearchController from './controllers/search_controller'

window.Stimulus = Application.start()

window.Stimulus.register('navigation', NavigationController)
window.Stimulus.register('hero', HeroController)
window.Stimulus.register('app', AppController)
window.Stimulus.register('stats', StatsController)
window.Stimulus.register('share', ShareController)
window.Stimulus.register('gallery', GalleryController)
window.Stimulus.register('search', SearchController)
