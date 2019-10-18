import euSpace from '../data/euSpace';
import moment from 'moment';
import { COMPANY_CONTRACT } from '../data/constants';

const isNotFromEU = (userNationality) => !Object.keys(euSpace).includes(userNationality);

export const taskValidation = (user = null) => {
  if (!user) throw new Error('No user.');
  const tasks = user.procedure;
  if (!Array.isArray(tasks)) throw new Error('Tasks must be an array.');

  for (let i = 0, l = tasks.length; i < l; i++) {
    if (!tasks[i].check.isDone && displayTask(tasks[i], user)) {
      if (tasks[i].task.name.match(/inscription (mutuelle|médecine)/i)) {
        const contract = user.contracts.find(contract => contract.status === COMPANY_CONTRACT && !contract.endDate);
        if (contract) {
          const contractPlusSixWeeks = moment(contract.startDate).add(6, 'w');
          return moment().isAfter(moment(contractPlusSixWeeks));
        }
        return false;
      }
      return true;
    }
  }
  return false;
};

export const displayTask = (task, user = null) => {
  const taskName = task.task.name;
  if (taskName.match(/titre de séjour/i)) {
    if (user.identity && user.identity.nationality) {
      return isNotFromEU(user.identity.nationality);
    }
  }

  if (taskName.match(/inscription mutuelle/i)) {
    return !user.administrative.mutualFund || !user.administrative.mutualFund.has;
  }

  return true;
};
