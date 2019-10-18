import companies from '../api/Companies'

export default ({ app, router, Vue }) => {
  Vue.prototype.$companies = companies;
}
