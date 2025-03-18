import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { MdClose } from 'react-icons/md';

interface BarProps {
  label: string;
  icon: JSX.Element;
  close: (boolean: boolean) => void;
}

const Bar = ({ label, icon, close }: BarProps) => {
  return (
    <Box sx={{ flexGrow: 1, zIndex: 1000 }}>
      <AppBar position="static" color='secondary'>
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            sx={{ mr: 2 }}>
            {icon}
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {label}
          </Typography>
          <IconButton
            size="large"
            edge="end"
            color="inherit"
            sx={{ ml: 2 }}
            onClick={() => close(false)}>
            <MdClose />
          </IconButton>
        </Toolbar>
      </AppBar>
    </Box>
  );
}


export default Bar;