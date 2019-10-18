import pay from '../api/Pay';

export default ({ app, router, Vue }) => {
  Vue.prototype.$pay = pay;
}
