
import { useState } from 'react'
import { Outlet } from 'react-router-dom'

import AdminSidebar from '../components/admin/Sidebar/AdminSidebar'
import AdminHeader from '../components/admin/Header/AdminHeader'

import '../../styles/layouts/AdminLayout.css'

export default function AdminLayout() {
  const [menuOpen, setMenuOpen] = useState(false)

  function closeMenu() {
    setMenuOpen(false)
  }

  return (
    <div className="admin-shell">
      <AdminSidebar
        isOpen={menuOpen}
        onClose={closeMenu}
      />

      <main className="admin-main">
        <AdminHeader onOpenMenu={() => setMenuOpen(true)} />

        <section className="admin-content">
          <Outlet />
        </section>
      </main>
    </div>
  )
}
