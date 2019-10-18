import VueAnalytics from 'vue-analytics'

export default ({ app, router, Vue }) => {
  Vue.use(VueAnalytics, {
    id: process.env.GA_TRACKING_ID,
    checkDuplicatedScript: true,
    router,
    ignoreRoutes: ['settings'],
  });
}
