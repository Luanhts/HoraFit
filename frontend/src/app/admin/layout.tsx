'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Package, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import logo from '@/assets/HoraFitLogo.jpg'

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname()

  const menuItems = [
    { path: '/admin/produtos', icon: Package, label: 'Produtos' },
  ]

  const isActive = (path: string) => {
    if (path === '/admin') {
      return pathname === path
    }
    return pathname?.startsWith(path)
  }

  return (
    <div className="min-h-screen flex bg-muted/30">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r flex flex-col">
        <div className="p-6 border-b">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src={logo}
              alt="A Hora Fit"
              width={40}
              height={40}
              className="rounded-full object-cover"
            />
            <div>
              <div className="font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                A Hora Fit
              </div>
              <div className="text-xs text-muted-foreground">Admin Panel</div>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.path)
            return (
              <Link key={item.path} href={item.path}>
                <Button
                  variant={ active ? 'default' : 'ghost'}
                  className={`w-full justify-start gap-3 cursor-pointer ${active 
              ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
              : 'hover:bg-secondary hover:text-white'
            }`}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Button>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-destructive"
            onClick={() => {
              // implementar logout
              console.log('Logout')
            }}
          >
            <LogOut className="h-5 w-5" />
            Sair
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="container py-8 px-18">
          {children}
        </div>
      </main>
    </div>
  )
}

export default AdminLayout