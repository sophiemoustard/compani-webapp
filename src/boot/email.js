import email from '../api/Email'

export default ({ app, router, Vue }) => {
  Vue.prototype.$email = email;
}
