import roles from '../api/Roles'

export default ({ app, router, Vue }) => {
  Vue.prototype.$roles = roles;
}
