import './style.css'
import { createApp } from 'vue'
import { createAuth0 } from '@auth0/auth0-vue'
import { createHead } from '@vueuse/head'
import App from './App.vue'
const app = createApp(App)
const head = createHead()
//Configure Auth0
app.use(
  createAuth0({
    domain: import.meta.env.VITE_AUTH0_DOMAIN,
    clientId: import.meta.env.VITE_AUTH0_CLIENT_ID,
    authorizationParams: {
      redirect_uri: window.location.origin
    }
  })
)

app.use(head)

app.mount("#app")
