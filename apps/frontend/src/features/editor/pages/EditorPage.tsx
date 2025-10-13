import { LessonWorkspace } from '../components/LessonWorkspace';
import { CurriculumSidebar } from '../components/CurriculumSidebar';
import { EditorHeader } from '../components/EditorHeader';
import { MetadataPanel } from '../components/MetadataPanel';
import { EditorStoresProvider, useEditorConfirm } from '../state/useEditorViewModel';
import { Button, Modal, PageSection } from '../../../shared/ui';

export const EditorPage = () => (
  <EditorStoresProvider>
    <div class="min-h-screen bg-[linear-gradient(180deg,var(--color-background)_0%,var(--color-background-soft)_100%)] px-4 pb-16 pt-16">
      <PageSection class="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <EditorHeader />

        <div class="grid gap-6 lg:grid-cols-[280px,1fr]">
          <CurriculumSidebar />

          <div class="grid gap-6 xl:grid-cols-[320px,1fr]">
            <section class="flex flex-col gap-4">
              <MetadataPanel />
            </section>
            <LessonWorkspace />
          </div>
        </div>
      </PageSection>
      <ConfirmDialog />
    </div>
  </EditorStoresProvider>
);

export default EditorPage;

const ConfirmDialog = () => {
  const confirm = useEditorConfirm();
  const state = () => confirm.state();
  const isOpen = () => state() !== null;

  return (
    <Modal
      open={isOpen()}
      onOpenChange={(next) => {
        if (!next && state()) {
          confirm.resolve(false);
        }
      }}
      title={state()?.message ?? 'Confirm action'}
      description={undefined}
      padding="md"
      class="space-y-4"
      children={
        <p class="text-sm text-[color:var(--color-text-muted)]">
          {state()?.message ?? 'Are you sure you want to continue?'}
        </p>
      }
      footer={
        <div class="flex gap-2">
          <Button variant="ghost" size="compact" onClick={() => confirm.resolve(false)}>
            {state()?.cancelLabel ?? 'Cancel'}
          </Button>
          <Button size="compact" onClick={() => confirm.resolve(true)}>
            {state()?.confirmLabel ?? 'Confirm'}
          </Button>
        </div>
      }
    />
  );
};
