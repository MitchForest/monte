import { onCleanup, type ParentComponent } from 'solid-js';
import { createBrowserCurriculumClientManager } from '@monte/api';

import {
  registerCurriculumClientManager,
  unregisterCurriculumClientManager,
} from '../domains/curriculum/api/curriculumClient';

export const CurriculumProvider: ParentComponent = (props) => {
  const manager = createBrowserCurriculumClientManager();

  registerCurriculumClientManager(manager);

  onCleanup(() => unregisterCurriculumClientManager(manager));

  return props.children;
};
