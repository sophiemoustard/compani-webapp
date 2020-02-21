import stats from 'src/core/api/Stats'

export default ({ app, router, Vue }) => {
  Vue.prototype.$stats = stats;
}
