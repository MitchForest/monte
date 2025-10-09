import { LessonWorkspace } from './components/LessonWorkspace';
import { CurriculumSidebar } from './components/CurriculumSidebar';
import { EditorHeader } from './components/EditorHeader';
import { MetadataPanel } from './components/MetadataPanel';
import { useEditorViewModel, type EditorViewModel } from './hooks/useEditorViewModel';
import { PageSection } from '../../../design-system';

export const EditorPage = () => {
  const vm: EditorViewModel = useEditorViewModel();

  return (
    <div class="min-h-screen bg-shell px-4 pb-16 pt-16">
      <PageSection class="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <EditorHeader vm={vm} />

        <div class="grid gap-6 lg:grid-cols-[280px,1fr]">
          <CurriculumSidebar vm={vm} />

          <div class="grid gap-6 xl:grid-cols-[320px,1fr]">
            <section class="flex flex-col gap-4">
              <MetadataPanel vm={vm} />
            </section>
            <LessonWorkspace vm={vm} />
          </div>
        </div>
      </PageSection>
    </div>
  );
};

export default EditorPage;
