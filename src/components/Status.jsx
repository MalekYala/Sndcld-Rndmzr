export default function Status({ message, type }) {
  if (!message) return null
  const cls = 'status' + (type ? ` status--${type}` : '')
  return <div id="status" className={cls}>{message}</div>
}
