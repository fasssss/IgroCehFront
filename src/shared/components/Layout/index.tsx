import { Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { SvgIcon } from '@mui/material'
import { RootState } from 'root/shared/store';
import { SvgSelector } from 'root/shared/components/SvgSelector';
import './styles.scss';

function Layout() {
  var userInfo = useSelector((state: RootState) => state.authorizationReducer);
  return (
    <>
      <div className="layout">
        <div className='layout__user-badge'>
          {
            userInfo.avatarUrl ?
            <img src={userInfo.avatarUrl}></img>
            :
            <SvgIcon><SvgSelector iconName='discord-icon' /></SvgIcon>
          }
        </div>
      </div>
      <Outlet />
    </>
  );
}

export default Layout;
