import { createContext, useContext, type ParentComponent } from 'solid-js';

import type { TimelineStore } from './timelineStore';

const TimelineContext = createContext<TimelineStore>();

export const TimelineProvider: ParentComponent<{ store: TimelineStore }> = (props) => (
  <TimelineContext.Provider value={props.store}>{props.children}</TimelineContext.Provider>
);

export const useTimelineStore = (): TimelineStore => {
  const store = useContext(TimelineContext);
  if (!store) {
    throw new Error('TimelineProvider missing in component tree.');
  }
  return store;
};
