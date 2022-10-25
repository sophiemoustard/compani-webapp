import { mapState } from 'vuex';
import { THREE_DAYS_VIEW, WEEK_VIEW } from '@data/constants';
import moment from '@helpers/moment';

export const planningTimelineMixin = {
  data () {
    return {
      viewMode: WEEK_VIEW,
      targetDate: '',
      datimeModal: false,
      days: [],
    };
  },
  computed: {
    ...mapState('main', ['drawer']),
    isThreeDaysView () {
      if (this.viewMode) return this.viewMode === THREE_DAYS_VIEW;
      return false;
    },
    endOfWeek () {
      const gapDays = this.isThreeDaysView ? 2 : 6;
      return moment(this.startOfWeek).add(gapDays, 'd').endOf('d').toISOString();
    },
  },
  watch: {
    startOfWeek () {
      this.targetDate = this.startOfWeek;
    },
  },
  mounted () {
    this.targetDate = this.startOfWeek;
  },
  methods: {
    getTimelineDays () {
      const gapDays = this.isThreeDaysView ? 2 : 6;
      const range = moment.range(this.startOfWeek, moment(this.startOfWeek).add(gapDays, 'd'));
      this.days = Array.from(range.by('days'));
    },
    timelineTitle () {
      if (this.startOfWeek === '') return '';
      if (moment(this.startOfWeek).month() === moment(this.endOfWeek).month()) {
        return moment(this.startOfWeek).format('MMMM YYYY');
      }

      return `${moment(this.startOfWeek).format('MMM')} - ${moment(this.endOfWeek).format('MMM YYYY')}`;
    },
    goToNextWeek () {
      const gapDays = this.isThreeDaysView ? 3 : 7;
      this.startOfWeek = moment(this.startOfWeek).add(gapDays, 'd').toISOString();
      this.updateTimeline();
    },
    goToPreviousWeek () {
      const gapDays = this.isThreeDaysView ? -3 : -7;
      this.startOfWeek = moment(this.startOfWeek).add(gapDays, 'd').toISOString();
      this.updateTimeline();
    },
    goToToday () {
      this.startOfWeek = this.isThreeDaysView
        ? moment().startOf('day').toISOString()
        : moment().startOf('week').toISOString();
      this.updateTimeline();
    },
    goToWeek (value) {
      this.startOfWeek = this.isThreeDaysView
        ? moment(value).startOf('day').toISOString()
        : moment(value).startOf('week').toISOString();
      this.updateTimeline();
      this.datimeModal = false;
    },
    updateViewMode (viewMode) {
      const isCurrentWeek = moment().isBetween(moment(this.startOfWeek), moment(this.endOfWeek));
      this.viewMode = viewMode;
      if (!this.isThreeDaysView) this.startOfWeek = moment(this.startOfWeek).startOf('week').toISOString();
      else if (isCurrentWeek) {
        this.startOfWeek = moment().startOf('day').toISOString();
      }
      this.updateTimeline();
    },
  },
};
