import stats from '../api/Stats'

export default ({ app, router, Vue }) => {
  Vue.prototype.$stats = stats;
}
