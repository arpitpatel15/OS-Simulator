import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import FCFSDiskScheduling from './components/FCFSDiskScheduling';
import PriorityScheduling from './components/PriorityScheduling';
import LRUPageReplacement from './components/LRUPageReplacement';
import ReaderWriterProblem from './components/ReaderWriterProblem';
import Home from './components/Home';
const App = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Routes>
          <Route path="/" element={<Home/>} />
          <Route path="/fcfs-disk" element={<FCFSDiskScheduling />} />
          <Route path="/priority-scheduling" element={<PriorityScheduling />} />
          <Route path="/lru-page" element={<LRUPageReplacement />} />
          <Route path="/reader-writer" element={<ReaderWriterProblem />} />
        </Routes>
      </div>
    </Router>

  )
}

export default App
