import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './Component/Header';
import LoginPage from './Component/LoginPage';
import SignupPage from './Component/SignupPage';
import Homepage from './Component/Homepage';

import CommunityGardenPage from './Component/CommunityGardenPage';

import InfoPage from './Component/InfoPage';
import VarietyList from './Component/VarietyList';

import BoardPage from './Component/BoardPage';
import WritePostPage from './Component/WritePostPage';
import PostDetail from './Component/PostDetail';
import EditPostPage from './Component/EditPostPage';

import PlantSharingBoard from './Component/PlantSharingBoard';
import PlantSharingBoardWrite from './Component/PlantSharingBoardWrite';
import PlantDetails from './Component/PlantDetails'; 
import PlantEdit from './Component/PlantEdit';


function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        <Route path="/community-garden" element={<CommunityGardenPage />} />

        <Route path="/info" element={<InfoPage />} />
        <Route path="/variety-list" element={<VarietyList />} />

        <Route path="/board" element={<BoardPage />} /> {/* 자유게시판 - 게시글 보여주는 페이지 */}
        <Route path="/write" element={<WritePostPage />} /> {/* 자유게시판 - 게시글 작성 페이지 */}
        <Route path="/post/:freeBoardId" element={<PostDetail />} /> {/* 자유게시판 - 게시글 자세히 보여주는 페이지 */}
        <Route path="/edit/:freeBoardId" element={<EditPostPage />} /> {/* 자유게시판 - 게시글 수정 페이지 */}

        <Route path="/plant-sharing" element={<PlantSharingBoard />} /> {/* 식물 나눔 게시판 - 식물 나눔 게시글 보여주는 페이지*/}
        <Route path="/plant-sharing/write" element={<PlantSharingBoardWrite />} /> {/* 식물 나눔 게시판 - 식물 나눔 게시글 작성 페이지*/}
        <Route path="/plant-sharing/:shareBoardId" element={<PlantDetails />} /> {/* 식물 나눔 게시판 - 식물 나눔 게시글 자세히 보여주는 페이지*/}
        <Route path="/plant-sharing/edit/:shareBoardId" element={<PlantEdit />} /> {/* 식물 나눔 게시판 - 식물 나눔 게시글 수정 페이지 */}

      </Routes>
    </Router>
  );
}

export default App;