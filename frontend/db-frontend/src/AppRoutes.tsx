import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './layouts/layout';
import UserProfilePage from './pages/UserProfilepage';

const AppRoutes = () => {
    return(
        <Routes>
            <Route path="/" element={<Layout showHero={true}>Home Page</Layout>} />
            <Route path="/user-profile" element={<Layout><UserProfilePage /></Layout>} />
            <Route path="*" element={<Navigate to="/"/>} />
        </Routes>
    );

};

export default AppRoutes;