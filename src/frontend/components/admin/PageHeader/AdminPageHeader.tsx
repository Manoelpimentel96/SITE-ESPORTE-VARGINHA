import '../../../../styles/admin/AdminPageHeader.css'

interface AdminPageHeaderProps {
  title: string
  description: string
}

export default function AdminPageHeader({
  title,
  description,
}: AdminPageHeaderProps) {
  return (
    <div className="admin-page-header">
      <div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
    </div>
  )
}
