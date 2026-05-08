import { useParams } from 'react-router-dom'

export function JobStatusPage() {
  const { id } = useParams()
  return <div>Hello world: Job status page (id: {id})</div>
}
