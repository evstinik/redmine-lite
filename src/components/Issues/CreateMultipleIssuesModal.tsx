import * as React from 'react'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Chip from '@mui/material/Chip'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { useTrackers } from '@app/hooks/trackers'
import { useProjects } from '@app/hooks/projects'
import { useCreateMultipleIssuesForm, IssueRow } from '@app/hooks/createMultipleIssuesForm'
import { AutocompleteSelect } from '@app/components/AutocompleteSelect'
import { Project } from '@app/models/api/Project'
import { Tracker } from '@app/models/api/Issue'

interface CreateMultipleIssuesModalProps {
  open: boolean
  defaultProjectId: number
  onClose: () => void
  onCreated: () => void
}

interface IssueRowComponentProps {
  row: IssueRow
  projects: Project[]
  trackers: Tracker[]
  isLoadingTrackers: boolean
  isSubmitting: boolean
  rowResult: ReturnType<ReturnType<typeof useCreateMultipleIssuesForm>['getRowResult']>
  canRemove: boolean
  onUpdate: <K extends keyof IssueRow>(rowId: string, field: K, value: IssueRow[K]) => void
  onRemove: (rowId: string) => void
}

function IssueRowComponent({
  row,
  projects,
  trackers,
  isLoadingTrackers,
  isSubmitting,
  rowResult,
  canRemove,
  onUpdate,
  onRemove
}: IssueRowComponentProps) {
  const hasError = rowResult?.status === 'error'

  return (
    <TableRow
      sx={{
        backgroundColor: hasError ? 'error.light' : undefined,
        opacity: isSubmitting ? 0.6 : 1,
        '& td': { verticalAlign: 'top', py: 1 }
      }}
    >
      <TableCell sx={{ minWidth: 180 }}>
        <AutocompleteSelect<{ id: number; name: string }>
          label='Project'
          sx={{ minWidth: 170 }}
          slotProps={{
            paper: { sx: { minWidth: 300 } }
          }}
          options={projects}
          getOptionLabel={(option) => option.name}
          getOptionValue={(option) => String(option.id)}
          value={String(row.projectId)}
          onValueChanged={(pid) => onUpdate(row.id, 'projectId', Number(pid ?? 0))}
        />
      </TableCell>
      <TableCell sx={{ minWidth: 140 }}>
        <Select
          size='small'
          fullWidth
          value={row.trackerId}
          disabled={isLoadingTrackers}
          onChange={(e) => onUpdate(row.id, 'trackerId', Number(e.target.value))}
          endAdornment={
            isLoadingTrackers ? <CircularProgress size={16} sx={{ mr: 3 }} /> : undefined
          }
        >
          {trackers.map((t) => (
            <MenuItem key={t.id} value={t.id}>
              {t.name}
            </MenuItem>
          ))}
        </Select>
      </TableCell>
      <TableCell sx={{ minWidth: 200 }}>
        <TextField
          size='small'
          fullWidth
          placeholder='Subject *'
          value={row.subject}
          onChange={(e) => onUpdate(row.id, 'subject', e.target.value)}
          error={hasError}
          helperText={rowResult?.error}
        />
      </TableCell>
      <TableCell sx={{ minWidth: 180 }}>
        <TextField
          size='small'
          fullWidth
          placeholder='Description (optional)'
          multiline
          maxRows={3}
          value={row.description}
          onChange={(e) => onUpdate(row.id, 'description', e.target.value)}
        />
      </TableCell>
      <TableCell sx={{ width: 48 }}>
        <IconButton
          size='small'
          onClick={() => onRemove(row.id)}
          disabled={!canRemove || isSubmitting}
          title='Remove row'
          sx={{ color: 'error.main' }}
        >
          ✕
        </IconButton>
      </TableCell>
    </TableRow>
  )
}

export function CreateMultipleIssuesModal({
  open,
  defaultProjectId,
  onClose,
  onCreated
}: CreateMultipleIssuesModalProps) {
  const { trackers, isLoading: isLoadingTrackers } = useTrackers(open)
  const allProjects = useProjects() ?? []
  const { form, initialize, addRow, removeRow, updateRow, reset, submit, getRowResult, successCount } =
    useCreateMultipleIssuesForm()

  const defaultTrackerId = trackers.length > 0 ? trackers[0].id : 0

  React.useEffect(() => {
    if (open && form.rows.length === 0) {
      initialize(defaultProjectId, defaultTrackerId)
    }
  }, [open, form.rows.length, initialize, defaultProjectId, defaultTrackerId])

  React.useEffect(() => {
    if (defaultTrackerId > 0) {
      form.rows.forEach((row) => {
        if (row.trackerId === 0) {
          updateRow(row.id, 'trackerId', defaultTrackerId)
        }
      })
    }
  }, [defaultTrackerId]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleClose = React.useCallback(() => {
    reset()
    onClose()
  }, [reset, onClose])

  const handleCreateAll = React.useCallback(async () => {
    const allSucceeded = await submit()
    if (allSucceeded) {
      onCreated()
    }
  }, [submit, onCreated])

  const handleAddRow = React.useCallback(() => {
    const lastRow = form.rows[form.rows.length - 1]
    const projectId = lastRow?.projectId ?? defaultProjectId
    const trackerId = lastRow?.trackerId ?? defaultTrackerId
    addRow(projectId, trackerId)
  }, [addRow, form.rows, defaultProjectId, defaultTrackerId])

  const filledRowCount = form.rows.filter((r) => r.subject.trim()).length

  return (
    <Dialog open={open} onClose={handleClose} maxWidth='lg' fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          Create Multiple Issues
          {filledRowCount > 0 && (
            <Chip label={`${filledRowCount} issue${filledRowCount !== 1 ? 's' : ''}`} size='small' color='primary' />
          )}
          {successCount > 0 && (
            <Chip label={`${successCount} created`} size='small' color='success' />
          )}
        </Box>
      </DialogTitle>
      <DialogContent>
        {form.error && (
          <Alert severity='error' sx={{ mb: 2 }}>
            {form.error}
          </Alert>
        )}
        {successCount > 0 && !form.error && (
          <Alert severity='success' sx={{ mb: 2 }}>
            {successCount} issue{successCount !== 1 ? 's' : ''} created successfully!
          </Alert>
        )}
        <TableContainer>
          <Table size='small'>
            <TableHead>
              <TableRow>
                <TableCell>
                  <Typography variant='subtitle2'>Project</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant='subtitle2'>Type</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant='subtitle2'>Subject *</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant='subtitle2'>Description</Typography>
                </TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {form.rows.map((row) => (
                <IssueRowComponent
                  key={row.id}
                  row={row}
                  projects={allProjects}
                  trackers={trackers}
                  isLoadingTrackers={isLoadingTrackers}
                  isSubmitting={form.isSubmitting}
                  rowResult={getRowResult(row.id)}
                  canRemove={form.rows.length > 1}
                  onUpdate={updateRow}
                  onRemove={removeRow}
                />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Button
          size='small'
          onClick={handleAddRow}
          disabled={form.isSubmitting}
          sx={{ mt: 1 }}
        >
          + Add Row
        </Button>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={form.isSubmitting}>
          Cancel
        </Button>
        <Button
          onClick={handleCreateAll}
          variant='contained'
          disabled={form.isSubmitting || isLoadingTrackers || filledRowCount === 0}
        >
          {form.isSubmitting ? (
            <CircularProgress size={20} />
          ) : (
            `Create ${filledRowCount > 0 ? filledRowCount : ''} Issue${filledRowCount !== 1 ? 's' : ''}`
          )}
        </Button>
      </DialogActions>
    </Dialog>
  )
}