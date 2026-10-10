import PropTypes from 'prop-types';

// material-ui
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';

// project import
import { getAdminDisplayName, getAdminIdentifier, getAdminRoleLabel } from 'utils/admin-user';

// assets
import LogoutOutlined from '@ant-design/icons/LogoutOutlined';
import MailOutlined from '@ant-design/icons/MailOutlined';
import ProfileOutlined from '@ant-design/icons/ProfileOutlined';
import SafetyOutlined from '@ant-design/icons/SafetyOutlined';
import UserOutlined from '@ant-design/icons/UserOutlined';

export default function ProfileTab({ user, handleLogout }) {
  const displayName = getAdminDisplayName(user);
  const identifier = getAdminIdentifier(user);
  const roleLabel = getAdminRoleLabel(user);

  return (
    <List component="nav" sx={{ p: 0, '& .MuiListItemIcon-root': { minWidth: 32 } }}>
      <ListItem divider>
        <ListItemIcon>
          <UserOutlined />
        </ListItemIcon>
        <ListItemText primary="Ism-familya" secondary={displayName} />
      </ListItem>
      <ListItem divider>
        <ListItemIcon>
          <ProfileOutlined />
        </ListItemIcon>
        <ListItemText primary="Login" secondary={user?.login || '—'} />
      </ListItem>
      <ListItem divider>
        <ListItemIcon>
          <MailOutlined />
        </ListItemIcon>
        <ListItemText primary="Email" secondary={identifier} />
      </ListItem>
      <ListItem divider>
        <ListItemIcon>
          <SafetyOutlined />
        </ListItemIcon>
        <ListItemText primary="Rol" secondary={roleLabel} />
      </ListItem>
      <ListItemButton onClick={handleLogout}>
        <ListItemIcon>
          <LogoutOutlined />
        </ListItemIcon>
        <ListItemText
          primary="Chiqish"
          secondary={<Typography variant="caption">Admin sessiyasidan chiqish</Typography>}
        />
      </ListItemButton>
    </List>
  );
}

ProfileTab.propTypes = { user: PropTypes.object, handleLogout: PropTypes.func };
