import { Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { SvgIcon } from '@mui/material'
import { RootState } from 'root/shared/store';
import { SvgSelector } from 'root/shared/components/SvgSelector';
import { useGetUserObjectQuery } from 'root/features/authorization/authorizationApi';
import { setUserObject } from 'root/features/authorization/authorizationSlice';
import './styles.scss';

function Layout() {
  var userInfo = useSelector((state: RootState) => state.authorizationReducer);
  var getUserObject = useGetUserObjectQuery();
  var dispatch = useDispatch();
  useEffect(() => {
    if(getUserObject.isSuccess){
      dispatch(setUserObject({
        email: getUserObject.data.email,
        userName: getUserObject.data.userName,
        avatarUrl: getUserObject.data.avatarUrl
      }))
    }
  }, [getUserObject.isSuccess])
  return (
    <>
      <div className="layout">
        <div id='layout__decoration-1'/>
        <div id='layout__decoration-2'/>
        <div id='layout__decoration-3'/>
        <div id='layout__decoration-4'/>
        <div id='layout__decoration-5'/>
        <div id='layout__decoration-6'/>
        <div className='layout__user-badge'>
          {
            userInfo.avatarUrl ?
            <img src={userInfo.avatarUrl} className='layout__user-avatar'></img>
            :
            <div className='layout__default-avatar'>
              <SvgIcon><SvgSelector iconName='discord-icon' /></SvgIcon>
            </div>
          }
          <span>{userInfo.userName}</span>
        </div>
      </div>
      <div className='layout__content-container'>
        <Outlet />
      </div>
    </>
  );
}

export default Layout;
