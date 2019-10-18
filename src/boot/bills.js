import bills from '../api/Bills';

export default ({ app, router, Vue }) => {
  Vue.prototype.$bills = bills;
}
