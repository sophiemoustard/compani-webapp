import users from 'src/core/api/Users'

export default ({ app, router, Vue }) => {
  Vue.prototype.$users = users;
}
