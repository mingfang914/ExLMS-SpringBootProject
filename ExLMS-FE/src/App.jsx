import React, { useEffect } from 'react'
import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import Login from './pages/Login'
import Register from './pages/Register'
import LandingPage from './pages/LandingPage'
import Dashboard from './pages/Dashboard'
import GroupList from './pages/Groups/GroupList'
import GroupDetail from './pages/Groups/GroupDetail'
import CreateGroup from './pages/Groups/CreateGroup'
import CourseDetail from './pages/Courses/CourseDetail'
import CreateCourse from './pages/Courses/CreateCourse'
import CourseEditor from './pages/Courses/CourseEditor'
import GroupCourseDetail from './pages/Courses/GroupCourseDetail'
import QuizEditor from './pages/Courses/QuizEditor'
import QuizPlayer from './pages/Courses/QuizPlayer'
import QuizResult from './pages/Courses/QuizResult'
import MeetingRoom from './pages/Meetings/MeetingRoom'
import MeetingDetail from './pages/Meetings/MeetingDetail'
import ForumList from './pages/Forum/ForumList'
import ForumPostDetail from './pages/Forum/ForumPostDetail'
import CreateForumPost from './pages/Forum/CreateForumPost'
import AssignmentList from './pages/Assignments/AssignmentList'
import AssignmentDetail from './pages/Assignments/AssignmentDetail'
import AssignmentForm from './pages/Assignments/AssignmentForm'
import Calendar from './pages/Calendar'
import Notifications from './pages/Notifications'
import Users from './pages/Admin/Users'
import Profile from './pages/Profile'
import CourseInventory from './pages/Inventory/CourseInventory'
import AssignmentInventory from './pages/Inventory/AssignmentInventory'
import QuizInventory from './pages/Inventory/QuizInventory'
import InventoryCourseDetail from './pages/Inventory/CourseDetail'
import InventoryAssignmentDetail from './pages/Inventory/AssignmentDetail'
import InventoryQuizDetail from './pages/Inventory/QuizDetail'
import Layout from './components/Layout'
import ProtectedRoute from './components/Common/ProtectedRoute'
import { initSocket, disconnectSocket } from './services/socketService'
import { setUser } from './store/authSlice'
import authService from './services/authService'

function App() {
  const { isAuthenticated, user } = useSelector((state) => state.auth)
  const dispatch = useDispatch()

  useEffect(() => {
    if (isAuthenticated) {
      initSocket()
      if (!user) {
        authService.getCurrentUser()
          .then(data => dispatch(setUser(data)))
          .catch(err => console.error('Failed to restore user session:', err))
      }
    } else {
      disconnectSocket()
    }

    return () => {
      disconnectSocket()
    }
  }, [isAuthenticated, user, dispatch])

  return (
    <Routes>
      <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
      <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/" />} />
      
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <Layout>
              <Dashboard />
            </Layout>
          ) : (
            <LandingPage />
          )
        }
      />
      
      {/* Authenticated Routes - Basic Access (Student, Instructor, Admin) */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout><Outlet /></Layout>}>
          <Route path="/groups" element={<GroupList />} />
          <Route path="/groups/:id" element={<GroupDetail />} />
          <Route path="/groups/:groupId/courses/:courseId/view" element={<GroupCourseDetail />} />
          <Route path="/groups/:groupId/courses/:courseId/quiz/:quizId/take" element={<QuizPlayer />} />
          <Route path="/groups/:groupId/courses/:courseId/quiz/attempts/:attemptId/result" element={<QuizResult />} />
          <Route path="/groups/:groupId/courses/:id" element={<CourseDetail />} />
          <Route path="/groups/:groupId/meetings/:id" element={<MeetingDetail />} />
          <Route path="/groups/:groupId/assignments" element={<AssignmentList />} />
          <Route path="/groups/:groupId/assignments/:id" element={<AssignmentDetail />} />
          <Route path="/forum" element={<ForumList />} />
          <Route path="/forum/create" element={<CreateForumPost />} />
          <Route path="/forum/edit/:id" element={<CreateForumPost />} />
          <Route path="/forum/posts/:id" element={<ForumPostDetail />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
        
        <Route path="/groups/:groupId/meetings/:id/room" element={<MeetingRoom />} />
      </Route>

      {/* Instructor & Admin Only Routes - Management */}
      <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'INSTRUCTOR']} />}>
        <Route element={<Layout><Outlet /></Layout>}>
          <Route path="/groups/create" element={<CreateGroup />} />
          <Route path="/groups/:groupId/courses/create" element={<CourseEditor />} />
          <Route path="/groups/:groupId/courses/:courseId/edit" element={<CourseEditor />} />
          <Route path="/groups/:groupId/courses/:courseId/quiz/create" element={<QuizEditor />} />
          <Route path="/groups/:groupId/courses/:courseId/quiz/:quizId/edit" element={<QuizEditor />} />
          <Route path="/groups/:groupId/assignments/create" element={<AssignmentForm />} />
          <Route path="/groups/:groupId/assignments/:id/edit" element={<AssignmentForm />} />
          
          {/* Inventory */}
          <Route path="/inventory/courses" element={<CourseInventory />} />
          <Route path="/inventory/courses/create" element={<CourseEditor />} />
          <Route path="/inventory/courses/view/:id" element={<InventoryCourseDetail />} />
          <Route path="/inventory/courses/edit/:courseId" element={<CourseEditor />} />
          <Route path="/inventory/assignments" element={<AssignmentInventory />} />
          <Route path="/inventory/assignments/create" element={<AssignmentForm />} />
          <Route path="/inventory/assignments/view/:id" element={<InventoryAssignmentDetail />} />
          <Route path="/inventory/assignments/edit/:id" element={<AssignmentForm />} />
          <Route path="/inventory/quizzes" element={<QuizInventory />} />
          <Route path="/inventory/quizzes/create" element={<QuizEditor />} />
          <Route path="/inventory/quizzes/view/:id" element={<InventoryQuizDetail />} />
          <Route path="/inventory/quizzes/edit/:quizId" element={<QuizEditor />} />
        </Route>
      </Route>

      {/* Admin Only Routes */}
      <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
        <Route element={<Layout><Outlet /></Layout>}>
          <Route path="/admin/users" element={<Users />} />
        </Route>
      </Route>

      {/* Fallback routes */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

export default App
