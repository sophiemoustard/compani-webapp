import email from 'src/core/api/Email'

export default ({ app, router, Vue }) => {
  Vue.prototype.$email = email;
}
