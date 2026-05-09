import { Box, Drawer, AppBar, Toolbar, Typography, List, ListItem, ListItemButton, ListItemIcon, ListItemText, CssBaseline, Avatar, IconButton, Menu, MenuItem } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import ChurchIcon from '@mui/icons-material/Church';
import EventIcon from '@mui/icons-material/Event';
import SettingsIcon from '@mui/icons-material/Settings';
import BusinessIcon from '@mui/icons-material/Business';
import GroupsIcon from '@mui/icons-material/Groups';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import LockIcon from '@mui/icons-material/Lock';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import TranslateIcon from '@mui/icons-material/Translate';
import InsightsIcon from '@mui/icons-material/Insights';

import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useUiStore } from '../stores/uiStore';
import { useTranslation } from 'react-i18next';
import { ChangePasswordDialog } from '../components/common/ChangePasswordDialog';

const drawerWidth = 260;

const tenantMenuItems = [
  { translationKey: 'menu.dashboard', icon: <DashboardIcon />, path: '/', permission: 'VIEW_DASHBOARD' },
  { translationKey: 'menu.activities', icon: <EventIcon />, path: '/activities', permission: 'VIEW_ACTIVITIES' },
  { translationKey: 'menu.churches', icon: <ChurchIcon />, path: '/churches', permission: 'MANAGE_CHURCHES' },
  { translationKey: 'menu.members', icon: <GroupsIcon />, path: '/members', permission: 'VIEW_MEMBERS' },
  { translationKey: 'menu.finance', icon: <AccountBalanceIcon />, path: '/finance', permission: 'VIEW_FINANCE' },
  { translationKey: 'menu.analytics', icon: <InsightsIcon />, path: '/analytics', permission: 'VIEW_FINANCE' },
  { translationKey: 'menu.ministries', icon: <GroupsIcon />, path: '/ministries', permission: 'VIEW_MINISTRIES' },
  { translationKey: 'menu.roles', icon: <SettingsIcon />, path: '/roles', permission: 'MANAGE_ROLES' },
  { translationKey: 'menu.users', icon: <PeopleIcon />, path: '/users', permission: 'MANAGE_USERS' },
];

const platformMenuItems = [
  { translationKey: 'menu.globalDashboard', icon: <DashboardIcon />, path: '/' },
  { translationKey: 'menu.councilManagement', icon: <BusinessIcon />, path: '/platform-councils' },
];

export const MainLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langAnchorEl, setLangAnchorEl] = useState<null | HTMLElement>(null);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { mode, toggleMode, language, setLanguage } = useUiStore();
  const { t } = useTranslation();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  if (!user) return null;

  const isSuperAdmin = user.role === 'SUPER_ADMIN';

  let menuItems = isSuperAdmin ? platformMenuItems : tenantMenuItems.filter(item =>
    !item.permission || user.permissions?.includes(item.permission)
  );

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleLangMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setLangAnchorEl(event.currentTarget);
  };

  const handleLangMenuClose = () => {
    setLangAnchorEl(null);
  };

  const changeLanguage = (lang: 'en' | 'es') => {
    setLanguage(lang);
    handleLangMenuClose();
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'background.paper', borderRight: '1px solid', borderColor: 'divider' }}>
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <ChurchIcon sx={{ color: 'primary.main', fontSize: 32 }} />
        <Typography variant="h6" className="gradient-text" sx={{ fontWeight: 'bold' }}>
          EcclesiaOps
        </Typography>
      </Box>
      <List sx={{ px: 2, flex: 1 }}>
        {menuItems.map((item) => {
          const active = location.pathname.startsWith(item.path) && (item.path !== '/' || location.pathname === '/');
          return (
            <ListItem disablePadding key={item.path} sx={{ mb: 1 }}>
              <ListItemButton
                onClick={() => navigate(item.path)}
                sx={{
                  borderRadius: 2,
                  bgcolor: active ? 'primary.50' : 'transparent',
                  color: active ? 'primary.main' : 'text.primary',
                  '&:hover': {
                    bgcolor: 'primary.50',
                    color: 'primary.main',
                    '& .MuiListItemIcon-root': {
                      color: 'primary.main',
                    }
                  }
                }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: active ? 'primary.main' : 'text.secondary' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={t(item.translationKey)}
                  sx={{ '& .MuiTypography-root': { fontWeight: active ? 600 : 500, fontSize: '0.95rem' } }}
                />
              </ListItemButton>
            </ListItem>
          )
        })}
      </List>
      <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1 }}>
        <Avatar sx={{ bgcolor: 'secondary.main', width: 40, height: 40 }}>
          {user.email?.charAt(0).toUpperCase()}
        </Avatar>
        <Box sx={{ flex: 1, overflow: 'hidden' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
            {user.role}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', display: 'block' }}>
            {user.email}
          </Typography>
        </Box>
        <IconButton onClick={() => setChangePasswordOpen(true)} color="primary" size="small" title={t('changePassword.title')}>
          <LockIcon />
        </IconButton>
        <IconButton onClick={handleLogout} color="error" size="small" title={t('common.logout')}>
          <LogoutIcon />
        </IconButton>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Box sx={{ flexGrow: 1 }} />

          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <IconButton color="inherit" onClick={toggleMode}>
              {mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
            </IconButton>

            <IconButton color="inherit" onClick={handleLangMenuOpen}>
              <TranslateIcon />
            </IconButton>
            <Menu
              anchorEl={langAnchorEl}
              open={Boolean(langAnchorEl)}
              onClose={handleLangMenuClose}
            >
              <MenuItem onClick={() => changeLanguage('es')} selected={language === 'es'}>Español</MenuItem>
              <MenuItem onClick={() => changeLanguage('en')} selected={language === 'en'}>English</MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, border: 'none' },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box component="main" sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` } }}>
        <Toolbar />
        <Outlet />
      </Box>

      <ChangePasswordDialog open={changePasswordOpen} onClose={() => setChangePasswordOpen(false)} />
    </Box>
  );
};
