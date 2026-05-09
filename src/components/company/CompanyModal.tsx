import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { CompanyForm } from './CompanyForm'
import type { Company, CompanyFormValues } from '@/types'

interface CompanyModalProps {
  open: boolean
  onClose: () => void
  company?: Company
  onSubmit: (values: CompanyFormValues, pendingFiles: File[]) => Promise<void>
  isSubmitting: boolean
}

export function CompanyModal({
  open,
  onClose,
  company,
  onSubmit,
  isSubmitting,
}: CompanyModalProps) {
  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-h-[92vh] max-w-xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{company ? 'Edit Company' : 'Add Company'}</DialogTitle>
        </DialogHeader>
        <CompanyForm
          defaultValues={company}
          onSubmit={async (values, files) => {
            await onSubmit(values, files)
            onClose()
          }}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  )
}
