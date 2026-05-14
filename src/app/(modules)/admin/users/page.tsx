"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  Users,
  UserPlus,
  Search,
  MoreVertical,
  Shield,
  Trash2,
  RefreshCw,
  Key,
  Copy,
  CheckCircle2,
  AlertCircle,
  Mail,
  ShieldAlert
} from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Badge } from "@/components/ui/Badge"
import { Modal } from "@/components/ui/Modal"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from "@/components/ui/DropdownMenu"
import { useAuthStore, apiFetch } from "@/lib/useAuthStore"
import { toast } from "sonner"

interface User {
  id: string
  email: string
  role: string
  twoFactorEnabled: boolean
  createdAt: string
}

export default function UserManagementPage() {
  const router = useRouter()
  const { user: currentUser } = useAuthStore()
  const [users, setUsers] = React.useState<User[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [searchQuery, setSearchQuery] = React.useState("")

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false)
  const [isReset2FAModalOpen, setIsReset2FAModalOpen] = React.useState(false)
  const [isPasswordModalOpen, setIsPasswordModalOpen] = React.useState(false)
  const [isSummaryModalOpen, setIsSummaryModalOpen] = React.useState(false)

  // Form states
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null)
  const [newUserData, setNewUserData] = React.useState({ email: "", role: "user", password: "" })
  const [editUserData, setEditUserData] = React.useState({ email: "", role: "user" })
  const [newPassword, setNewPassword] = React.useState("")
  const [userSummary, setUserSummary] = React.useState({ email: "", password: "" })

  const fetchUsers = async () => {
    setIsLoading(true)
    try {
      const response = await apiFetch('/users')
      const data = await response.json()
      if (response.ok) {
        setUsers(data)
      } else {
        toast.error(data.message || "Gagal mengambil data user")
      }
    } catch (err) {
      toast.error("Terjadi kesalahan koneksi")
    } finally {
      setIsLoading(false)
    }
  }

  const generateRandomPassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*"
    let password = ""
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return password
  }

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault()
    const password = generateRandomPassword()

    try {
      const response = await apiFetch('/users', {
        method: 'POST',
        body: JSON.stringify({ ...newUserData, password })
      })
      const data = await response.json()

      if (response.ok) {
        toast.success("User berhasil ditambahkan")
        setUsers([data.user, ...users])
        setIsAddModalOpen(false)
        setUserSummary({ email: newUserData.email, password })
        setIsSummaryModalOpen(true)
        setNewUserData({ email: "", role: "user", password: "" })
      } else {
        toast.error(data.message || "Gagal menambah user")
      }
    } catch (err) {
      toast.error("Terjadi kesalahan")
    }
  }

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUser) return

    try {
      const response = await apiFetch(`/users/${selectedUser.id}`, {
        method: 'PUT',
        body: JSON.stringify(editUserData)
      })
      if (response.ok) {
        toast.success("User berhasil diperbarui")
        fetchUsers()
        setIsEditModalOpen(false)
      } else {
        const data = await response.json()
        toast.error(data.message || "Gagal memperbarui user")
      }
    } catch (err) {
      toast.error("Terjadi kesalahan")
    }
  }

  const handleDeleteUser = async () => {
    if (!selectedUser) return

    try {
      const response = await apiFetch(`/users/${selectedUser.id}`, {
        method: 'DELETE'
      })
      if (response.ok) {
        toast.success("User berhasil dihapus")
        setUsers(users.filter(u => u.id !== selectedUser.id))
        setIsDeleteModalOpen(false)
      } else {
        const data = await response.json()
        toast.error(data.message || "Gagal menghapus user")
      }
    } catch (err) {
      toast.error("Terjadi kesalahan")
    }
  }

  const handleReset2FA = async () => {
    if (!selectedUser) return

    try {
      const response = await apiFetch(`/users/${selectedUser.id}/reset-2fa`, {
        method: 'POST'
      })
      if (response.ok) {
        toast.success("2FA berhasil direset")
        fetchUsers()
        setIsReset2FAModalOpen(false)
      } else {
        const data = await response.json()
        toast.error(data.message || "Gagal meriset 2FA")
      }
    } catch (err) {
      toast.error("Terjadi kesalahan")
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUser || !newPassword) return

    try {
      const response = await apiFetch(`/users/${selectedUser.id}/change-password`, {
        method: 'POST',
        body: JSON.stringify({ password: newPassword })
      })
      if (response.ok) {
        toast.success("Password berhasil diubah")
        setUserSummary({ email: selectedUser.email, password: newPassword })
        setIsPasswordModalOpen(false)
        setIsSummaryModalOpen(true)
        setNewPassword("")
      } else {
        const data = await response.json()
        toast.error(data.message || "Gagal mengubah password")
      }
    } catch (err) {
      toast.error("Terjadi kesalahan")
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("Berhasil disalin ke clipboard")
  }

  const filteredUsers = users.filter(u =>
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const [origin, setOrigin] = React.useState("")

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin)
    }

    // Check admin access
    if (!currentUser || currentUser.role !== 'admin') {
      toast.error("Akses ditolak. Anda bukan admin.")
      router.push("/dashboard")
      return
    }

    fetchUsers()
  }, [])

  const whatsappMessage = `*Informasi Akun SmartFarm*\n\nUsername: ${userSummary.email}\nPassword: ${userSummary.password}\n\nSilakan login di: ${origin}/login\n\n_Harap segera ganti password setelah login dan aktifkan 2FA._`

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <Users className="h-6 w-6 text-primary-green" />
            Manajemen User
          </h1>
          <p className="text-text-secondary text-sm">Kelola akses akun dan keamanan sistem Barbara Farm.</p>
        </div>
        <Button
          variant="primary"
          className="flex items-center gap-2"
          onClick={() => setIsAddModalOpen(true)}
        >
          <UserPlus className="h-4 w-4" />
          Tambah User Baru
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-border-neutral shadow-sm">
          <p className="text-text-secondary text-xs font-medium uppercase tracking-wider mb-1">Total User</p>
          <p className="text-2xl font-bold text-text-primary">{users.length}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-border-neutral shadow-sm">
          <p className="text-text-secondary text-xs font-medium uppercase tracking-wider mb-1">Admin</p>
          <p className="text-2xl font-bold text-primary-green">{users.filter(u => u.role === 'admin').length}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-border-neutral shadow-sm">
          <p className="text-text-secondary text-xs font-medium uppercase tracking-wider mb-1">2FA Aktif</p>
          <p className="text-2xl font-bold text-info">{users.filter(u => u.twoFactorEnabled).length}</p>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-3xl border border-border-neutral shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border-neutral flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
            <Input
              placeholder="Cari user berdasarkan email..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" size="sm" onClick={fetchUsers}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-page-background/50">
                <th className="p-4 text-xs font-bold text-text-secondary uppercase tracking-wider">User</th>
                <th className="p-4 text-xs font-bold text-text-secondary uppercase tracking-wider">Role</th>
                <th className="p-4 text-xs font-bold text-text-secondary uppercase tracking-wider">Keamanan</th>
                <th className="p-4 text-xs font-bold text-text-secondary uppercase tracking-wider">Dibuat Pada</th>
                <th className="p-4 text-xs font-bold text-text-secondary uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-neutral text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-text-secondary">Memuat data user...</td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-text-secondary">Tidak ada user ditemukan.</td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-soft-green-surface/20 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-soft-green-surface flex items-center justify-center text-primary-green font-bold">
                          {u.email.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-text-primary">{u.email}</span>
                          <span className="text-xs text-text-secondary">ID: {u.id.slice(0, 8)}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge variant={u.role === 'admin' ? 'primary' : 'neutral'}>
                        {u.role === 'admin' ? 'Administrator' : 'Staff'}
                      </Badge>
                    </td>
                    <td className="p-4">
                      {u.twoFactorEnabled ? (
                        <div className="flex items-center gap-1 text-success text-xs font-medium">
                          <Shield className="h-3 w-3" />
                          2FA Aktif
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-text-secondary text-xs font-medium">
                          <ShieldAlert className="h-3 w-3" />
                          2FA Non-aktif
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-text-secondary">
                      {new Date(u.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="p-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => {
                            setSelectedUser(u);
                            setEditUserData({ email: u.email, role: u.role });
                            setIsEditModalOpen(true);
                          }}>
                            <MoreVertical className="mr-2 h-4 w-4 text-text-secondary" />
                            Edit User
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => { setSelectedUser(u); setIsPasswordModalOpen(true); }}>
                            <Key className="mr-2 h-4 w-4 text-text-secondary" />
                            Ubah Password
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => { setSelectedUser(u); setIsReset2FAModalOpen(true); }}>
                            <RefreshCw className="mr-2 h-4 w-4 text-text-secondary" />
                            Reset 2FA
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-danger focus:bg-danger/10 focus:text-danger"
                            onClick={() => { setSelectedUser(u); setIsDeleteModalOpen(true); }}
                            disabled={u.id === currentUser?.id}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Hapus User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Tambah User Baru">
        <form onSubmit={handleAddUser} className="space-y-4 pt-2">
          <Input
            label="Email Address"
            type="email"
            placeholder="email@example.com"
            value={newUserData.email}
            onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
            required
          />
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-primary">Role</label>
            <select
              className="w-full h-11 px-4 rounded-xl border border-border-neutral bg-white focus:outline-none focus:ring-2 focus:ring-primary-green transition-all"
              value={newUserData.role}
              onChange={(e) => setNewUserData({ ...newUserData, role: e.target.value })}
            >
              <option value="user">Staff / User</option>
              <option value="admin">Administrator</option>
            </select>
          </div>
          <div className="bg-soft-green-surface/30 p-4 rounded-xl border border-dashed border-primary-green/20">
            <p className="text-xs text-text-secondary text-center">
              Password akan di-generate secara otomatis dan ditampilkan setelah berhasil membuat user.
            </p>
          </div>
          <div className="flex gap-3 pt-4">
            <Button variant="outline" className="flex-1" type="button" onClick={() => setIsAddModalOpen(false)}>Batal</Button>
            <Button variant="primary" className="flex-1" type="submit">Buat Akun</Button>
          </div>
        </form>
      </Modal>

      {/* Edit User Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit User">
        <form onSubmit={handleUpdateUser} className="space-y-4 pt-2">
          <Input
            label="Email Address"
            type="email"
            value={editUserData.email}
            onChange={(e) => setEditUserData({ ...editUserData, email: e.target.value })}
            required
          />
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-primary">Role</label>
            <select
              className="w-full h-11 px-4 rounded-xl border border-border-neutral bg-white"
              value={editUserData.role}
              onChange={(e) => setEditUserData({ ...editUserData, role: e.target.value })}
            >
              <option value="user">Staff / User</option>
              <option value="admin">Administrator</option>
            </select>
          </div>
          <div className="flex gap-3 pt-4">
            <Button variant="outline" className="flex-1" type="button" onClick={() => setIsEditModalOpen(false)}>Batal</Button>
            <Button variant="primary" className="flex-1" type="submit">Simpan Perubahan</Button>
          </div>
        </form>
      </Modal>

      {/* Change Password Modal */}
      <Modal isOpen={isPasswordModalOpen} onClose={() => setIsPasswordModalOpen(false)} title="Ubah Password">
        <form onSubmit={handleChangePassword} className="space-y-4 pt-2">
          <p className="text-sm text-text-secondary">Ubah password untuk user: <span className="font-bold text-text-primary">{selectedUser?.email}</span></p>
          <Input
            label="Password Baru"
            type="text"
            placeholder="Masukkan password baru"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <div className="flex gap-2">
            <Button variant="outline" className="text-xs py-1" type="button" onClick={() => setNewPassword(generateRandomPassword())}>
              Generate Random
            </Button>
          </div>
          <div className="flex gap-3 pt-4">
            <Button variant="outline" className="flex-1" type="button" onClick={() => setIsPasswordModalOpen(false)}>Batal</Button>
            <Button variant="primary" className="flex-1" type="submit">Update Password</Button>
          </div>
        </form>
      </Modal>

      {/* Reset 2FA Modal */}
      <Modal isOpen={isReset2FAModalOpen} onClose={() => setIsReset2FAModalOpen(false)} title="Reset Keamanan 2FA">
        <div className="space-y-4 pt-2 text-center">
          <div className="mx-auto h-16 w-16 bg-warning/10 rounded-full flex items-center justify-center text-warning mb-4">
            <AlertCircle className="h-8 w-8" />
          </div>
          <p className="text-text-primary font-medium">Reset 2FA untuk {selectedUser?.email}?</p>
          <p className="text-sm text-text-secondary px-4">
            User akan diminta untuk memindai ulang kode QR pada login berikutnya. Lakukan ini jika user kehilangan akses ke aplikasi Google Authenticator mereka.
          </p>
          <div className="flex gap-3 pt-4">
            <Button variant="outline" className="flex-1" onClick={() => setIsReset2FAModalOpen(false)}>Batal</Button>
            <Button variant="primary" className="flex-1 bg-warning hover:bg-warning/90 border-warning" onClick={handleReset2FA}>Ya, Reset 2FA</Button>
          </div>
        </div>
      </Modal>

      {/* Delete User Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Hapus Akun">
        <div className="space-y-4 pt-2 text-center">
          <div className="mx-auto h-16 w-16 bg-danger/10 rounded-full flex items-center justify-center text-danger mb-4">
            <Trash2 className="h-8 w-8" />
          </div>
          <p className="text-text-primary font-medium">Hapus akun {selectedUser?.email}?</p>
          <p className="text-sm text-text-secondary px-4">
            Tindakan ini tidak dapat dibatalkan. Semua akses user ini akan segera dicabut.
          </p>
          <div className="flex gap-3 pt-4">
            <Button variant="outline" className="flex-1" onClick={() => setIsDeleteModalOpen(false)}>Batal</Button>
            <Button variant="primary" className="flex-1 bg-danger hover:bg-danger/90 border-danger" onClick={handleDeleteUser}>Ya, Hapus</Button>
          </div>
        </div>
      </Modal>

      {/* User Summary Modal (For Copy Paste) */}
      <Modal isOpen={isSummaryModalOpen} onClose={() => setIsSummaryModalOpen(false)} title="Informasi Akun Berhasil Dibuat">
        <div className="space-y-6 pt-2">
          <div className="flex items-center gap-3 p-4 bg-success/10 rounded-2xl border border-success/20">
            <CheckCircle2 className="h-6 w-6 text-success" />
            <p className="text-sm font-medium text-success">Informasi login sudah siap dikirim.</p>
          </div>

          <div className="space-y-3">
            <div className="p-4 bg-page-background rounded-2xl border border-border-neutral relative group">
              <pre className="text-sm text-text-primary whitespace-pre-wrap font-sans leading-relaxed">
                {whatsappMessage}
              </pre>
              <Button
                variant="outline"
                size="sm"
                className="absolute top-2 right-2 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => copyToClipboard(whatsappMessage)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button variant="primary" className="w-full flex items-center justify-center gap-2" onClick={() => copyToClipboard(whatsappMessage)}>
              <Copy className="h-4 w-4" />
              Salin Informasi (Untuk WhatsApp)
            </Button>
            <Button variant="outline" className="w-full" onClick={() => setIsSummaryModalOpen(false)}>Tutup</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
