import * as React from 'react'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import InputLabel from '@mui/material/InputLabel'
import FormControl from '@mui/material/FormControl'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import { useTrackers } from '@app/hooks/trackers'
import { useCreateIssueForm } from '@app/hooks/createIssueForm'

interface CreateIssueModalProps {
  open: boolean
  projectId: number
  onClose: () => void
  onCreated: () => void
}

export function CreateIssueModal({ open, projectId, onClose, onCreated }: CreateIssueModalProps) {
  const { trackers, isLoading: isLoadingTrackers, error: trackerError } = useTrackers(open)
  const { form, setField, reset, submit } = useCreateIssueForm(projectId)

  React.useEffect(() => {
    if (trackers.length > 0 && form.trackerId === 0) {
      setField('trackerId', trackers[0].id)
    }
  }, [trackers, form.trackerId, setField])

  const handleClose = React.useCallback(() => {
    reset()
    onClose()
  }, [reset, onClose])

  const handleCreate = React.useCallback(async () => {
    const success = await submit()
    if (success) onCreated()
  }, [submit, onCreated])

  const displayError = form.error || trackerError

  return (
    <Dialog open={open} onClose={handleClose} maxWidth='sm' fullWidth>
      <DialogTitle>Create New Issue</DialogTitle>
      <DialogContent>
        {displayError && (
          <Alert severity='error' sx={{ mb: 2 }}>
            {displayError}
          </Alert>
        )}
        <FormControl fullWidth sx={{ mt: 1 }}>
          <InputLabel id='tracker-label'>Type</InputLabel>
          <Select
            labelId='tracker-label'
            label='Type'
            value={form.trackerId}
            disabled={isLoadingTrackers}
            onChange={(e) => setField('trackerId', Number(e.target.value))}
            endAdornment={
              isLoadingTrackers ? (
                <CircularProgress size={20} sx={{ mr: 3 }} />
              ) : undefined
            }
          >
            {trackers.map((t) => (
              <MenuItem key={t.id} value={t.id}>
                {t.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          autoFocus
          margin='dense'
          label='Subject'
          fullWidth
          variant='outlined'
          value={form.subject}
          onChange={(e) => setField('subject', e.target.value)}
          sx={{ mt: 2 }}
        />
        <TextField
          margin='dense'
          label='Description'
          fullWidth
          multiline
          rows={4}
          variant='outlined'
          value={form.description}
          onChange={(e) => setField('description', e.target.value)}
          sx={{ mt: 1 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={form.isSubmitting}>
          Cancel
        </Button>
        <Button
          onClick={handleCreate}
          variant='contained'
          disabled={form.isSubmitting || isLoadingTrackers || !form.subject.trim()}
        >
          {form.isSubmitting ? <CircularProgress size={20} /> : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}