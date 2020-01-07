import Sectors from '../../api/Sectors'
import Users from '../../api/Users'
import Customers from '../../api/Customers'
import { formatIdentity } from '../../helpers/utils';

import { AUXILIARY, SECTOR, PERSON, CUSTOMER } from '../../data/constants';

export const fillFilter = async ({ commit }, roleToSearch) => {
  const rawPromises = [];
  let elems = [];
  rawPromises.push(Sectors.list());
  if (roleToSearch === AUXILIARY) rawPromises.push(Users.listWithSectorHistories());
  else if (roleToSearch === CUSTOMER) rawPromises.push(Customers.listWithSubscriptions());

  const filterPromises = await Promise.all(rawPromises);
  const sectors = filterPromises[0];
  for (let i = 0, l = sectors.length; i < l; i++) {
    elems.push({
      label: sectors[i].name,
      value: sectors[i].name,
      _id: sectors[i]._id,
      type: SECTOR,
    });
  }

  if (roleToSearch) {
    const persons = filterPromises[1];
    for (let i = 0, l = persons.length; i < l; i++) {
      const value = formatIdentity(persons[i].identity, 'FL');
      elems.push({ label: value, value: value, ...persons[i], type: PERSON });
    }
  }

  commit('setFilters', elems);
}
