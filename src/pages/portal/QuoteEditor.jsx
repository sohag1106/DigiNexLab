// Quotation editor (new/edit) — thin wrapper over the shared DocEditor.
import { useParams } from 'react-router-dom'
import DocEditor from './DocEditor'

export default function QuoteEditor() {
  const { id } = useParams()
  return <DocEditor kind="quotation" basePath="quotes" listPath="/portal/quotes" id={id} />
}
