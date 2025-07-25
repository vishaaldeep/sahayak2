import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginScreen from './components/LoginScreen';
import SignupScreen from './components/SignupScreen';
import JobsScreen from './components/JobsScreen';
import PostJobScreen from './components/PostJobScreen';
import TabLayout from './components/TabLayout';
import HomeScreen from './components/HomeScreen';
import SkillsScreen from './components/SkillsScreen';
import WalletScreen from './components/WalletScreen';
import ProfileSection from './components/ProfileSection';
import DocSreen from './components/DocScreen';
import MapScreen from './components/MapScreen';

function App() {
  const [user, setUser] = React.useState(JSON.parse(localStorage.getItem('user')));

  const handleLogin = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  }

  return (
    <BrowserRouter>
      <Routes>
          <Route path="/login" element={<LoginScreen onLogin={handleLogin} />} />
          <Route path="/signup" element={<SignupScreen onLogin={handleLogin} />} />
          <Route path="/" element={!user ? <Navigate to="/login" /> : (user.user.roleType === 'job provider' ? <Navigate to="/welcome/post-job" /> : <Navigate to="/welcome" />)} />
          <Route path="/welcome" element={<TabLayout />}>
            <Route index element={<HomeScreen />} />
            <Route path="jobs" element={<JobsScreen />} />
            <Route path="skills" element={<SkillsScreen />} />
            <Route path="wallet" element={<WalletScreen />} />
            <Route path="profile" element={<ProfileSection />} />
            <Route path="post-job" element={<PostJobScreen />} />
            <Route path="chowk" element={<MapScreen />} />
          </Route>
          <Route path="/docscreen" element={<DocSreen/>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;