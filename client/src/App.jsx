import { useState } from 'react'
import heroImg from './assets/hero.png'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import './App.css'
import Login from './components/Login'
import Signup from './components/Signup'
import CreateProject from './components/CreateProject'
import ProjectList from './components/ProjectList'

function App() {
  const [currentView, setCurrentView] = useState('login')


  return (
    <>
      <main className="app-container"> 
      <nav className="auth-nav">
        <button 
          className={currentView === 'login' ? 'active' : ''} 
          onClick={() => setCurrentView('login')}
        >
          Login
        </button>
        <button 
          className={currentView === 'signup' ? 'active' : ''} 
          onClick={() => setCurrentView('signup')}
        >
          Sign Up
        </button>
        
        <button 
          className={currentView === 'createProject' ? 'active' : ''}
          onClick={() => setCurrentView('createProject')}
        >
          Create Project
        </button>

        <button
          className={currentView === 'projectList' ? 'active' : ''}
          onClick={() => setCurrentView('projectList')}
        >
          List of Projects
        </button>

      </nav>

      <section className="auth-content">
        {currentView === 'login' && <Login />}
        {currentView === 'signup' && <Signup />}
        {currentView === 'createProject' && <CreateProject />}
        {currentView === 'projectList' && <ProjectList />}
      </section>
      </main>
    </>
  )
}

export default App
