import internalHours from '../api/InternalHours'

export default ({ app, router, Vue }) => {
  Vue.prototype.$internalHours = internalHours;
}
