import React from 'react';
import Search from '../components/search/Search';
import Profile from '../components/profile/Profile';
// This is dummy data for Profile team - will be replaced with API
// import profileData from '../components/profile/profileData';
import CreateEvent from '../components/create-event/CreateEvent';

export default function Home() {
  return (
    <div>
      <Search />
      {/* <Profile profileId={1}/> */}
      {/* <CreateEvent/> */}
    </div>
  );
}
