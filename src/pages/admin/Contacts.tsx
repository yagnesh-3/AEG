// Admin resource directory (§4) — professional contacts grouped by role, with
// role-based visibility and an add-contact modal.

import { useState } from 'react'
import { useData } from '../../context/DataContext'
import Modal from '../../components/Modal'
import type { ContactRole, Role } from '../../types'

const CONTACT_ROLES: ContactRole[] = [
  'Legal / Lawyer',
  'Accountant (Corporate)',
  'Project Manager',
  'Contractor — Civil',
  'Surveyor',
  'Engineer',
  'India Admin',
  'Banker',
]

const ALL_ROLES: Role[] = ['admin', 'staff', 'investor']

type FormState = {
  name: string
  role: ContactRole
  organisation: string
  email: string
  phone: string
  visibleTo: Role[]
}

const EMPTY_FORM: FormState = {
  name: '',
  role: 'Legal / Lawyer',
  organisation: '',
  email: '',
  phone: '',
  visibleTo: ['admin', 'staff'],
}

export default function Contacts() {
  const { contacts, addContact } = useData()
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)

  const toggleVisible = (role: Role) =>
    setForm((prev) => ({
      ...prev,
      visibleTo: prev.visibleTo.includes(role)
        ? prev.visibleTo.filter((r) => r !== role)
        : [...prev.visibleTo, role],
    }))

  const save = (e: React.FormEvent) => {
    e.preventDefault()
    addContact({
      id: `contact-${Date.now()}`,
      name: form.name,
      role: form.role,
      organisation: form.organisation,
      email: form.email,
      phone: form.phone,
      visibleTo: form.visibleTo.length ? form.visibleTo : ['admin'],
    })
    setForm(EMPTY_FORM)
    setModalOpen(false)
  }

  return (
    <div className="dashboard-stack">
      <section className="content-panel">
        <div className="panel-head-row">
          <h3>Resource directory ({contacts.length})</h3>
          <button type="button" className="button button-solid" onClick={() => setModalOpen(true)}>+ Add contact</button>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Organisation</th>
                <th>Contact</th>
                <th>Visible to</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((c) => (
                <tr key={c.id}>
                  <td><strong>{c.name}</strong></td>
                  <td>{c.role}</td>
                  <td>{c.organisation}</td>
                  <td>
                    <a href={`mailto:${c.email}`}>{c.email}</a>
                    <br />
                    <small>{c.phone}</small>
                  </td>
                  <td className="visible-tags">
                    {c.visibleTo.map((r) => <span key={r} className="chip chip-muted">{r}</span>)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <Modal open={modalOpen} title="Add contact" onClose={() => setModalOpen(false)}>
        <form className="admin-form" onSubmit={save}>
          <label>Name<input required value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} /></label>
          <div className="form-two-col">
            <label>Role
              <select value={form.role} onChange={(e) => setForm((p) => ({ ...p, role: e.target.value as ContactRole }))}>
                {CONTACT_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </label>
            <label>Organisation<input value={form.organisation} onChange={(e) => setForm((p) => ({ ...p, organisation: e.target.value }))} /></label>
          </div>
          <div className="form-two-col">
            <label>Email<input type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} /></label>
            <label>Phone<input value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} /></label>
          </div>
          <fieldset className="visible-picker">
            <legend>Visible to</legend>
            {ALL_ROLES.map((r) => (
              <label key={r} className="checkbox-row inline">
                <input type="checkbox" checked={form.visibleTo.includes(r)} onChange={() => toggleVisible(r)} />
                {r}
              </label>
            ))}
          </fieldset>
          <div className="modal-actions">
            <button type="button" className="button button-outline-dark" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="button button-solid">Add contact</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
