
import * as React from 'react';
import { useState, useEffect, FC } from 'react';
import { Navbar, Nav } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { IoMoonOutline, IoPersonOutline } from 'react-icons/io5';
// import { BiMoon } from 'react-icons/bi';
import { AiOutlineNotification, AiOutlineSun } from 'react-icons/ai';
import { IheaderProps } from './IHeaderProps';

import styles from '../LearningManagementSystem.module.scss';

const Header: FC<IheaderProps> = (props) => {
    const location = useLocation();
    const [activeLink, setActiveLink] = useState<string>(location.pathname);
    const [navColor, setNavColor] = useState<string>('white');
    const [theme, setTheme] = useState<string>('light');
    const [notificationCount] = useState<number>(10000);

    const [isOpenProfile, setIsOpenProfile] = useState<boolean>(false);

    const toggleDropdown = (): void => setIsOpenProfile(!isOpenProfile);

    useEffect(() => {

        setActiveLink(location.pathname);

        if (location.pathname === '/') {
            setNavColor(theme === 'light' ? 'white' : 'white');
        } else {
            setNavColor(theme === 'light' ? 'black' : 'white');
        }
    }, [location, theme]);

    const toggleTheme = (): void => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme); // Persist theme
    };

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') || 'light';
        setTheme(savedTheme);
        document.documentElement.setAttribute('data-theme', savedTheme);
    }, []);

    return (
        <Navbar
            bg="transparent"
            className={`${styles.header}`}
            expand="lg"
            style={{ color: `${navColor}` }}
        >
            {/* Logo on the left */}
            <Navbar.Brand as={Link} to="/" className={`${styles.headerLogo}`} style={{ color: `${navColor}` }}>
                <img src={require("../../assets/logo.svg")} alt="Pixel World" />
                <b>EduVerse</b>
            </Navbar.Brand>

            {/* Toggler for mobile view */}
            <Navbar.Toggle aria-controls="navbar-nav" style={{
                background: '#fff', // Toggle icon color based on theme
            }} />

            <Navbar.Collapse id="navbar-nav" role="region">
                {/* Center navigation links */}
                <Nav className="mx-auto">
                    {/* <Nav.Link
                        className={`${styles.navLink} ${activeLink === '/' ? 'active' : ''}`}
                        as={Link}
                        to="/"
                        style={{ color: navColor }}
                    >
                        Home
                    </Nav.Link> */}
                    <Nav.Link
                        className={`${styles.navLink} ${activeLink === '/policies' ? `${styles.active}` : ''}`}
                        as={Link}
                        to="/policies"
                        style={{ color: `${navColor}` }}
                    >
                        Policies
                    </Nav.Link>
                    <Nav.Link
                        className={`${styles.navLink} ${activeLink === '/orientations' ? `${styles.active}` : ''}`}
                        as={Link}
                        to="/orientations"
                        style={{ color: `${navColor}` }}
                    >
                        Orientations
                    </Nav.Link>
                    <Nav.Link
                        className={`${styles.navLink} ${activeLink === '/trainings' ? `${styles.active}` : ''}`}
                        as={Link}
                        to="/trainings"
                        style={{ color: `${navColor}` }}
                    >
                        Trainings
                    </Nav.Link>

                    <Nav.Link
                        className={`${styles.navLink} ${activeLink === '/apps' ? `${styles.active}` : ''}`}
                        as={Link}
                        to="/apps"
                        style={{ color: `${navColor}` }}
                    >
                        Apps
                    </Nav.Link>
                </Nav>

                {/* Button on the right */}
                <div className="d-sm-flex align-items-center ">
                    <input type='search' className={`${styles.headerSearch} my-2`} placeholder='Search...' />
                    {/* Theme toggle button */}
                    <button
                        className={`btn btn-secondary ms-3  ${styles.notificationButton}`}
                        style={{
                            backgroundColor: theme === 'light' ? '#f0f0f0' : '#333',
                            color: theme === 'light' ? '#000' : '#fff',
                        }}
                    >
                        <AiOutlineNotification size={24} />
                        <span className={`${styles.notificationBadge}`}  >
                            {notificationCount > 999 ? '999+' : notificationCount}
                        </span>
                    </button>


                    <button
                        onClick={toggleTheme}
                        className="btn btn-secondary ms-3"
                        style={{ backgroundColor: theme === 'light' ? '#f0f0f0' : '#333', color: theme === 'light' ? '#000' : '#fff' }}
                    >
                        {theme === 'light' ? <IoMoonOutline size={24} /> : <AiOutlineSun size={26} />}
                    </button>


                    <div style={{ position: "relative", display: "inline-block" }}>
                        {/* Button */}
                        <button
                            onClick={toggleDropdown}
                            className="btn btn-secondary ms-3"
                            style={{
                                backgroundColor: theme === "light" ? "#f0f0f0" : "#333",
                                color: theme === "light" ? "#000" : "#fff",
                            }}
                        >
                            <IoPersonOutline size={24} />
                        </button>

                        {/* Dropdown Menu */}
                        {isOpenProfile && (
                            <div
                                className={`${styles.profileDropdownMenu}`}

                            >
                                <Nav.Link
                                    as={Link}
                                    to='/profile'
                                    className={`${styles.profileDropdownItem} ${activeLink === '/profile' ? `${styles.active}` : ''}`}
                                >
                                    My Profile
                                </Nav.Link>
                                <Nav.Link
                                    as={Link}
                                    to='/settings'
                                    className={`${styles.profileDropdownItem} ${activeLink === '/settings' ? `${styles.active}` : ''}`}

                                >
                                    Settings
                                </Nav.Link>
                                <Nav.Link
                                    as={Link}
                                    to='/logout'
                                    className={`${styles.profileDropdownItem} ${activeLink === '/logout' ? `${styles.active}` : ''}`}

                                >
                                    Logout
                                </Nav.Link>
                            </div>
                        )}
                    </div>
                </div>
            </Navbar.Collapse>
        </Navbar>
    );
};

export default Header;
