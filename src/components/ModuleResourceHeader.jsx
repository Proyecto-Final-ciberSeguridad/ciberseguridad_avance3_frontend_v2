import { Link, useNavigate } from 'react-router-dom';
import { getCurrentUser, logoutUser } from '../auth';

export default function ModuleResourceHeader(){
  const user=getCurrentUser();
  const nav=useNavigate();
  function logout(){logoutUser();nav('/login');}
  return <header className="resource-topbar">
    <div className="mini-brand"><span className="mini-shield">◈</span><div><b>Santa Fe Capacita</b><small>Gobierno Provincial</small></div></div>
    <nav><Link to="/inicio">Inicio</Link><Link className="active" to="/inicio">Mis Cursos</Link><span>Evaluaciones</span></nav>
    <div className="resource-user"><span>{user?.fullName || 'Usuario'}</span><button onClick={logout}>↪ Cerrar sesión</button></div>
  </header>
}
