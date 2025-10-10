import { createSignal, type Accessor, type Setter } from 'solid-js';
import { createStore, type SetStoreFunction } from 'solid-js/store';

import type {
  CreateLessonFormState,
  LessonMetaFormState,
  TopicFormState,
  UnitFormState,
} from '../types';

interface FormWithError<T> {
  form: T;
  setForm: SetStoreFunction<T>;
  error: Accessor<string | undefined>;
  setError: Setter<string | undefined>;
}

interface SimpleForm<T> {
  form: T;
  setForm: SetStoreFunction<T>;
}

interface CreationForm<T> extends FormWithError<T> {
  isCreating: Accessor<boolean>;
  setIsCreating: Setter<boolean>;
}

export interface EditorFormsStore {
  unit: FormWithError<UnitFormState>;
  topic: FormWithError<TopicFormState>;
  lessonMeta: SimpleForm<LessonMetaFormState>;
  createUnit: CreationForm<UnitFormState>;
  createTopic: CreationForm<TopicFormState>;
  createLesson: CreationForm<CreateLessonFormState>;
  metaTab: {
    active: Accessor<'unit' | 'topic' | 'lesson'>;
    setActive: Setter<'unit' | 'topic' | 'lesson'>;
  };
  helpers: {
    resetCreateUnitForm: () => void;
    resetCreateTopicForm: () => void;
    resetCreateLessonForm: () => void;
  };
}

const defaultUnitForm: UnitFormState = {
  title: '',
  slug: '',
  summary: '',
  coverImage: '',
  status: 'active',
};

const defaultTopicForm: TopicFormState = {
  title: '',
  slug: '',
  overview: '',
  focusSkills: '',
  estimatedDurationMinutes: '',
  status: 'active',
};

const defaultLessonMetaForm: LessonMetaFormState = {
  author: '',
  notes: '',
};

const defaultCreateLessonForm: CreateLessonFormState = {
  title: '',
  slug: '',
};

export const createEditorFormsStore = (): EditorFormsStore => {
  const [unitForm, setUnitForm] = createStore<UnitFormState>({ ...defaultUnitForm });
  const [unitError, setUnitError] = createSignal<string | undefined>(undefined);

  const [topicForm, setTopicForm] = createStore<TopicFormState>({ ...defaultTopicForm });
  const [topicError, setTopicError] = createSignal<string | undefined>(undefined);

  const [lessonMetaForm, setLessonMetaForm] =
    createStore<LessonMetaFormState>({ ...defaultLessonMetaForm });

  const [activeMetaTab, setActiveMetaTab] = createSignal<'unit' | 'topic' | 'lesson'>('unit');

  const [createUnitForm, setCreateUnitForm] = createStore<UnitFormState>({ ...defaultUnitForm });
  const [createUnitError, setCreateUnitError] = createSignal<string | undefined>(undefined);
  const [isCreatingUnit, setIsCreatingUnit] = createSignal(false);

  const [createTopicForm, setCreateTopicForm] = createStore<TopicFormState>({
    ...defaultTopicForm,
  });
  const [createTopicError, setCreateTopicError] = createSignal<string | undefined>(undefined);
  const [isCreatingTopic, setIsCreatingTopic] = createSignal(false);

  const [createLessonForm, setCreateLessonForm] =
    createStore<CreateLessonFormState>({ ...defaultCreateLessonForm });
  const [createLessonError, setCreateLessonError] = createSignal<string | undefined>(undefined);
  const [isCreatingLesson, setIsCreatingLesson] = createSignal(false);

  const resetCreateUnitForm = () => {
    setCreateUnitForm({ ...defaultUnitForm });
    setCreateUnitError(undefined);
  };

  const resetCreateTopicForm = () => {
    setCreateTopicForm({ ...defaultTopicForm });
    setCreateTopicError(undefined);
  };

  const resetCreateLessonForm = () => {
    setCreateLessonForm({ ...defaultCreateLessonForm });
    setCreateLessonError(undefined);
  };

  return {
    unit: {
      form: unitForm,
      setForm: setUnitForm,
      error: unitError,
      setError: setUnitError,
    },
    topic: {
      form: topicForm,
      setForm: setTopicForm,
      error: topicError,
      setError: setTopicError,
    },
    lessonMeta: {
      form: lessonMetaForm,
      setForm: setLessonMetaForm,
    },
    createUnit: {
      form: createUnitForm,
      setForm: setCreateUnitForm,
      error: createUnitError,
      setError: setCreateUnitError,
      isCreating: isCreatingUnit,
      setIsCreating: setIsCreatingUnit,
    },
    createTopic: {
      form: createTopicForm,
      setForm: setCreateTopicForm,
      error: createTopicError,
      setError: setCreateTopicError,
      isCreating: isCreatingTopic,
      setIsCreating: setIsCreatingTopic,
    },
    createLesson: {
      form: createLessonForm,
      setForm: setCreateLessonForm,
      error: createLessonError,
      setError: setCreateLessonError,
      isCreating: isCreatingLesson,
      setIsCreating: setIsCreatingLesson,
    },
    metaTab: {
      active: activeMetaTab,
      setActive: setActiveMetaTab,
    },
    helpers: {
      resetCreateUnitForm,
      resetCreateTopicForm,
      resetCreateLessonForm,
    },
  };
};
