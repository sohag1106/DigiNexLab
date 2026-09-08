// Invoice editor (new/edit) — thin wrapper over the shared DocEditor.
import { useParams } from 'react-router-dom'
import DocEditor from './DocEditor'

export default function InvoiceEditor() {
  const { id } = useParams()
  return <DocEditor kind="invoice" basePath="invoices" listPath="/portal/invoices" id={id} />
}
