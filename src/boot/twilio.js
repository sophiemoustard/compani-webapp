import twilio from '../api/Twilio'

export default ({ app, router, Vue }) => {
  Vue.prototype.$twilio = twilio;
}
