import './style.css'
import App from './App.vue'
const app = createApp(App)
const head = createHead()
// Importar Builder desde el SDK para Vue

app.use(head)

app.mount("#app")
