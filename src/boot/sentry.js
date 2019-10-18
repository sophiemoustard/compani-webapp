import Raven from 'raven-js'
import RavenVue from 'raven-js/plugins/vue'

export default ({ app, router, Vue }) => {
  Raven
    .config('https://db50f77df4cc4e4eafa8e221d267c541@sentry.io/287454', { environment: 'production' })
    .addPlugin(RavenVue, Vue)
    .install();
}
