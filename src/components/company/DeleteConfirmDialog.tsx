import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface DeleteConfirmDialogProps {
  open: boolean
  companyName: string
  onConfirm: () => void
  onCancel: () => void
  isDeleting?: boolean
}

export function DeleteConfirmDialog({
  open,
  companyName,
  onConfirm,
  onCancel,
  isDeleting,
}: DeleteConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={v => !v && onCancel()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Delete Company</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <strong>{companyName}</strong>? All images will also be
            removed. This cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={isDeleting}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isDeleting}>
            {isDeleting ? 'Deleting…' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
