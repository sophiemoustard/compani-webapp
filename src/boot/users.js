import users from '../api/Users'

export default ({ app, router, Vue }) => {
  Vue.prototype.$users = users;
}
