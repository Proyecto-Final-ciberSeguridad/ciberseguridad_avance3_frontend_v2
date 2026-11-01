import { Navigate, Route, Routes } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import ModulePage from './pages/ModulePage';
import ResourcePage from './pages/ResourcePage';
import SessionGuard from './components/SessionGuard';

export default function App(){
  return <Routes>
    <Route path="/" element={<Landing/>}/>
    <Route path="/login" element={<Login/>}/>
    <Route path="/registro" element={<Register/>}/>
    <Route path="/olvide-contrasena" element={<ForgotPassword/>}/>
    <Route path="/restablecer-contrasena" element={<ResetPassword/>}/>
    <Route path="/inicio" element={<SessionGuard><Dashboard/></SessionGuard>}/>
    <Route path="/modulos/:id" element={<SessionGuard><ModulePage/></SessionGuard>}/>
    <Route path="/modulos/:id/:resource" element={<SessionGuard><ResourcePage/></SessionGuard>}/>
    <Route path="*" element={<Navigate to="/" replace/>}/>
  </Routes>
}
