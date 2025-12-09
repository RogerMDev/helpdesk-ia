import { computeInitials, colorFromText } from '../utils/avatar.js'

export default function AvatarInitials({
  name,
  lastName,
  email,
  size = 36,
  className = '',
  textClassName = '',
  title,
}) {
  const initials = computeInitials(name, lastName, email)
  const bg = colorFromText(`${name || ''} ${lastName || ''} ${email || ''}`)
  const style = { width: size, height: size, backgroundColor: bg }

  return (
    <div
      title={title || `${name || ''} ${lastName || ''}`.trim() || email || ''}
      className={`rounded-full flex items-center justify-center text-white font-semibold shadow-sm ${className}`}
      style={style}
    >
      <span className={textClassName}>{initials}</span>
    </div>
  )
}
