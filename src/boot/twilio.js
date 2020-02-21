import twilio from 'src/core/api/Twilio'

export default ({ app, router, Vue }) => {
  Vue.prototype.$twilio = twilio;
}
