
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { cn } from '@/lib/utils';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  SidebarFooter,
  useSidebar
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { logoutUser } from '@/lib/firebase';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  Package,
  Users,
  User,
  ChartBar,
  FileText,
  Settings,
  Home,
  LogOut,
  AlertTriangle,
  Building,
  Store,
  Moon,
  Sun,
  Monitor,
  TrendingUp,
  Receipt
} from 'lucide-react';
import { useIsMobile, useSwipeGesture } from '@/hooks/use-mobile';

export default function AppSidebar() {
  const { userData } = useAuth();
  const { theme, toggleTheme, actualTheme } = useTheme();
  const { toast } = useToast();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { setOpenMobile } = useSidebar();

  // Use swipe gesture to close the sidebar
  useSwipeGesture(
    () => {
      if (isMobile) {
        setOpenMobile(true);
      }
    }, // Open sidebar on swipe right
    () => {
      if (isMobile) {
        setOpenMobile(false);
      }
    } // Close sidebar on swipe left
  );

  const handleLogout = async () => {
    try {
      await logoutUser();
      toast({
        title: "Logged out",
        description: "Successfully logged out of your store account",
      });
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Logout Failed",
        description: "There was an error logging out",
        variant: "destructive",
      });
    }
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    // Close sidebar on mobile after navigation
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const getThemeIcon = () => {
    switch (theme) {
      case 'light': return <Sun className="h-4 w-4" />;
      case 'dark': return <Moon className="h-4 w-4" />;
      case 'system': return <Monitor className="h-4 w-4" />;
      default: return <Sun className="h-4 w-4" />;
    }
  };

  const getThemeLabel = () => {
    switch (theme) {
      case 'light': return 'Light Mode';
      case 'dark': return 'Dark Mode';
      case 'system': return 'System Mode';
      default: return 'Light Mode';
    }
  };

  const isAdmin = userData?.role === 'admin';

  return (
    <Sidebar className="bg-sidebar border-sidebar-border">
      <SidebarHeader className="px-4 py-6 bg-gradient-to-r from-store-500 to-emerald-500">
        <div
          className="flex items-center cursor-pointer group"
          onClick={() => handleNavigation('/dashboard')}
          role="button"
          tabIndex={0}
          aria-label="Go to store dashboard"
        >
          <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm group-hover:bg-white/30 transition-colors">
            <Store className="h-6 w-6 text-white" />
          </div>
          <div className="ml-3">
            <span className="text-xl font-display font-bold text-white">StoreManager</span>
            <p className="text-sm text-white/80 font-medium">Pro</p>
          </div>
        </div>
        <SidebarTrigger className="absolute top-4 right-4 text-white hover:bg-white/20" />
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">
            Store Operations
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => handleNavigation('/dashboard')}
                  className="sidebar-item rounded-lg"
                >
                  <Home className="h-5 w-5" />
                  <span className="font-medium">Dashboard</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => handleNavigation('/inventory')}
                  className="sidebar-item rounded-lg"
                >
                  <Package className="h-5 w-5" />
                  <span className="font-medium">Inventory</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => handleNavigation('/sales')}
                  className="sidebar-item rounded-lg"
                >
                  <ShoppingCart className="h-5 w-5" />
                  <span className="font-medium">Point of Sale</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => handleNavigation('/reports')}
                  className="sidebar-item rounded-lg"
                >
                  <Receipt className="h-5 w-5" />
                  <span className="font-medium">Reports</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">
            Store Management
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => handleNavigation('/stock-alerts')}
                  className="sidebar-item rounded-lg"
                >
                  <AlertTriangle className="h-5 w-5" />
                  <span className="font-medium">Stock Alerts</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => handleNavigation('/suppliers')}
                  className="sidebar-item rounded-lg"
                >
                  <Building className="h-5 w-5" />
                  <span className="font-medium">Suppliers</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">
              Store Administration
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => handleNavigation('/users')}
                    className="sidebar-item rounded-lg"
                  >
                    <Users className="h-5 w-5" />
                    <span className="font-medium">Team Members</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => handleNavigation('/analytics')}
                    className="sidebar-item rounded-lg"
                  >
                    <TrendingUp className="h-5 w-5" />
                    <span className="font-medium">Analytics</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => handleNavigation('/settings')}
                    className="sidebar-item rounded-lg"
                  >
                    <Settings className="h-5 w-5" />
                    <span className="font-medium">Store Settings</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="p-4 bg-muted/20">
        {/* Theme Toggle */}
        <div className="mb-3">
          <Button
            variant="ghost"
            size="sm"
            className="w-full flex items-center justify-start px-3 py-2 hover:bg-sidebar-accent/50 rounded-lg"
            onClick={toggleTheme}
          >
            {getThemeIcon()}
            <span className="ml-2 text-sm">{getThemeLabel()}</span>
          </Button>
        </div>

        {/* User Info */}
        <div className="space-y-3">
          <div className="flex items-center px-3 py-2 bg-sidebar-accent/30 rounded-lg">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-store-500 to-emerald-500 flex items-center justify-center mr-3">
              <User className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 truncate">
              <p className="text-sm font-medium text-sidebar-foreground">{userData?.email}</p>
              <p className="text-xs text-muted-foreground capitalize">
                {userData?.role === 'admin' ? 'Store Manager' : 'Team Member'}
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="w-full flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground transition-colors"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            <span>Logout</span>
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
