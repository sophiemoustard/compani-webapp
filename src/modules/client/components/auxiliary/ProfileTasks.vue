<template>
  <div v-if="tasks">
    <q-item tag="label" v-for="(task, index) in tasks" :key="index">
      <q-item-section side>
        <q-checkbox dense v-model="task.check.isDone" @input="handleTask(task)" />
      </q-item-section>
      <q-item-section>
       {{ task.task.name }}
      </q-item-section>
    </q-item>
  </div>
</template>

<script>
import { NotifyPositive, NotifyNegative } from '@components/popup/notify.js';
import { displayTask } from 'src/modules/client/helpers/taskValidation.js';

export default {
  data () {
    return {
      tasks: null,
    }
  },
  computed: {
    getUser () {
      return this.$store.getters['rh/getUserProfile'];
    },
  },
  async mounted () {
    try {
      const tasks = await this.$users.getTasks(this.getUser._id);
      this.tasks = tasks.filter(task => displayTask(task, this.getUser));
    } catch (e) {
      console.error(e);
    }
  },
  methods: {
    async handleTask (task) {
      try {
        await this.$users.updateTask({ userId: this.getUser._id, taskId: task.task._id }, { isDone: task.check.isDone });
        this.$store.dispatch('rh/getUserProfile', { userId: this.getUser._id });
        NotifyPositive('Tâche mise à jour');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la mise à jour de la tâche');
      }
    },
  },
};
</script>
