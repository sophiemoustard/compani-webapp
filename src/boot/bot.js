import bot from '../api/Bot'

export default ({ app, router, Vue }) => {
  Vue.prototype.$bot = bot;
}
