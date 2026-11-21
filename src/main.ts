import '@fontsource-variable/manrope';
import '@fontsource/ibm-plex-mono/latin-400.css';
import '@fontsource/ibm-plex-mono/cyrillic-400.css';
import './styles.css';
import { renderPage } from './components/page';
import { initContactCopy, initNavigation, initReveals, restoreAnchor } from './lib/interactions';

const app = document.querySelector<HTMLDivElement>('#app');
if (app) {
  app.innerHTML = renderPage();
  initNavigation();
  initReveals();
  initContactCopy();
  restoreAnchor();
}
