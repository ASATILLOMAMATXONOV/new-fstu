// material-ui
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import PropTypes from 'prop-types';

// project import
import { formatAdminDateTime } from 'utils/admin-user';

// assets
import CheckCircleOutlined from '@ant-design/icons/CheckCircleOutlined';
import ClockCircleOutlined from '@ant-design/icons/ClockCircleOutlined';
import InfoCircleOutlined from '@ant-design/icons/InfoCircleOutlined';
import LockOutlined from '@ant-design/icons/LockOutlined';
import WarningOutlined from '@ant-design/icons/WarningOutlined';

// ==============================|| HEADER PROFILE - SETTING TAB ||============================== //

export default function SettingTab({ user }) {
  return (
    <List component="nav" sx={{ p: 0, '& .MuiListItemIcon-root': { minWidth: 32 } }}>
      <ListItem divider>
        <ListItemIcon>
          <CheckCircleOutlined />
        </ListItemIcon>
        <ListItemText primary="Holat" secondary={user?.active ? 'Faol' : 'Nofaol'} />
      </ListItem>
      <ListItem divider>
        <ListItemIcon>
          <ClockCircleOutlined />
        </ListItemIcon>
        <ListItemText primary="Oxirgi kirish" secondary={formatAdminDateTime(user?.lastLoginAt)} />
      </ListItem>
      <ListItem divider>
        <ListItemIcon>
          <LockOutlined />
        </ListItemIcon>
        <ListItemText primary="Parol yangilangan" secondary={formatAdminDateTime(user?.passwordChangedAt)} />
      </ListItem>
      <ListItem divider>
        <ListItemIcon>
          <WarningOutlined />
        </ListItemIcon>
        <ListItemText primary="Xato urinishlar" secondary={`${user?.failedLoginAttempts ?? 0} ta`} />
      </ListItem>
      <ListItem>
        <ListItemIcon>
          <InfoCircleOutlined />
        </ListItemIcon>
        <ListItemText primary="Oxirgi IP" secondary={user?.lastLoginIp || '—'} />
      </ListItem>
    </List>
  );
}

SettingTab.propTypes = { user: PropTypes.object };
