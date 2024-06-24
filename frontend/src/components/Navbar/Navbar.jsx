import React, { useState } from 'react';
import './Navbar.css';
import { Link, useNavigate } from 'react-router-dom'
import { assets } from '../../assets/assets';
import { useContext } from 'react';
import { StoreContext } from '../context/StoreContext';


const Navbar = ({ setShowLogin }) => {

  const { getTotalCartAmount, token, setToken } = useContext(StoreContext)
  const [activeItem, setActiveItem] = useState('Home');
  const navigate = useNavigate()

  const logout = () => {
    localStorage.removeItem("token")
    setToken("")
    navigate("/")
  }

  const handleItemClick = (itemName) => {
    setActiveItem(itemName);
  };

  return (
    <div className="navbar">
      <Link to='/'><img src={assets.logo} alt='' className='logo' /></Link>

      <ul className="navbar-menu">
        <Link to='/' className={`nav-link ${activeItem === 'home' ? 'active' : ''}`} onClick={() => handleItemClick('home')}>Home</Link>
        <a href='#explore-menu' className={`nav-link ${activeItem === 'menu' ? 'active' : ''}`} onClick={() => handleItemClick('menu')}>menu</a>
        <a href='#app-download' className={`nav-link ${activeItem === 'mobile-app' ? 'active' : ''}`} onClick={() => handleItemClick('mobile-app')}>mobile-app</a>
        <a href='#footer' className={`nav-link ${activeItem === 'contact' ? 'active' : ''}`} onClick={() => handleItemClick('contact')}>contact</a>
      </ul>
      <div className='navbar-right'>
        <img src={assets.search_icon} alt='' />
        <div className='navbar-search-icon'>
          <Link to='/cart'><img src={assets.basket_icon} alt='' /></Link>
          <div className={getTotalCartAmount() === 0 ? '' : 'dot'}></div>
        </div>
        {!token ? <button onClick={() => setShowLogin(true)}>sign in</button>
          : <div className='navbar-profile'>

            <img src={assets.profile_icon} alt='' />
            <ul className='nav-profile-dropdown'>
              <li onClick={() => navigate("/myorders")}><img src={assets.myorder} alt='' /><p>Orders</p></li>
              <hr />
              <li onClick={() => logout()}><img src={assets.logout_icon} alt='' /><p>Logout</p></li>
            </ul>
          </div>}

      </div>
    </div>
  );
};

export default Navbar;
