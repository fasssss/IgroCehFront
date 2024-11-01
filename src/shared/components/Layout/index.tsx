import { Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { SvgIcon } from '@mui/material'
import { RootState } from 'root/shared/store';
import { SvgSelector } from 'root/shared/components/SvgSelector';
import { useLazyGetUserObjectQuery } from 'root/features/authorization/authorizationApi';
import { setUserObject } from 'root/features/authorization/authorizationSlice';
import i18n from 'root/shared/localization';
import './styles.scss';
import { useOnMount } from 'root/shared/hooks/useOnMount';

function Layout() {
  var [isLanguageSelectorOpened, setIsLanguageSelectorOpened] = useState(false);
  var userInfo = useSelector((state: RootState) => state.authorizationReducer);
  var [getUserObject, userObject] = useLazyGetUserObjectQuery();
  var dispatch = useDispatch();
  useEffect(() => {
    if(!userInfo.userName && !userInfo.email && !userInfo.avatarUrl) {
      getUserObject();
    }
  }, []);

  useOnMount(() => {
    const handleClick = (e: MouseEvent) => {
      setIsLanguageSelectorOpened(document.getElementsByClassName('layout__language-flag')[0] == e.target);
    };

    document.addEventListener("click", handleClick);
    return () => {
      document.removeEventListener("click", handleClick);
    };
  });

  useEffect(() => {
    if(userObject.isSuccess){
      dispatch(setUserObject({
        email: userObject.data.email,
        userName: userObject.data.userName,
        avatarUrl: userObject.data.avatarUrl
      }))
    }
  }, [userObject.isSuccess])

  const getCountryBadge = (countryCode: string) => {
    if(countryCode === 'en')
    {
      return(
        <div className='layout__language-flag'>English &nbsp;<SvgSelector iconName='american-flag'/></div>
      );
    }

    if(countryCode === 'ru')
      {
        return(
          <div className='layout__language-flag'>Russian &nbsp;<SvgSelector iconName='russian-flag'/></div>
        );
      }
  }

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
          <div className='layout__language'>
            <div onClick={() => setIsLanguageSelectorOpened(!isLanguageSelectorOpened)} className='layout__language-button'>
              {
                getCountryBadge(i18n.language)
              }
            </div>

            {
              <div className='layout__language-selector' style={!isLanguageSelectorOpened ? { display: 'none', opacity: 0}: {}}>
                {
                  ["en", "ru"].map((value) => {
                    return(
                      <div key={value} 
                        onClick={() => {
                          i18n.changeLanguage(value);
                          console.log(i18n.languages);
                          setIsLanguageSelectorOpened(false)
                        }} 
                        className='layout__language-option'
                      >
                        { getCountryBadge(value) }
                      </div>
                    );
                  })
                }
              </div>
            }
          </div>
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
