import { Navigate, Route, Routes } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import ModulePage from './pages/ModulePage';
import ResourcePage from './pages/ResourcePage';
import Module1Theory from './pages/Module1Theory';
import Module1Video from './pages/Module1Video';
import Module1Activity from './pages/Module1Activity';
import Module1Evaluation from './pages/Module1Evaluation';
import SessionGuard from './components/SessionGuard';
import ProgressPage from './pages/ProgressPage';

export default function App(){
  return <Routes>
    <Route path="/" element={<Landing/>}/>
    <Route path="/login" element={<Login/>}/>
    <Route path="/registro" element={<Register/>}/>
    <Route path="/olvide-contrasena" element={<ForgotPassword/>}/>
    <Route path="/restablecer-contrasena" element={<ResetPassword/>}/>
    <Route path="/inicio" element={<SessionGuard><Dashboard/></SessionGuard>}/>
    <Route path="/progreso" element={<SessionGuard><ProgressPage/></SessionGuard>}/>
    <Route path="/modulos/:id" element={<SessionGuard><ModulePage/></SessionGuard>}/>
    <Route path="/modulos/1/teoria" element={<SessionGuard><Module1Theory/></SessionGuard>}/>
    <Route path="/modulos/1/video" element={<SessionGuard><Module1Video/></SessionGuard>}/>
    <Route path="/modulos/1/actividad" element={<SessionGuard><Module1Activity/></SessionGuard>}/>
    <Route path="/modulos/1/evaluacion" element={<SessionGuard><Module1Evaluation/></SessionGuard>}/>
    <Route path="/modulos/:id/:resource" element={<SessionGuard><ResourcePage/></SessionGuard>}/>
    <Route path="*" element={<Navigate to="/" replace/>}/>
  </Routes>
}
