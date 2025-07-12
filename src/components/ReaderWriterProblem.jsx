import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Play, Pause, RotateCcw, BookOpen, Edit3 } from 'lucide-react';

const ReaderWriterProblem = () => {
  const [numReaders, setNumReaders] = useState(3);
  const [numWriters, setNumWriters] = useState(2);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [simulation, setSimulation] = useState([]);
  const [activeReaders, setActiveReaders] = useState([]);
  const [activeWriter, setActiveWriter] = useState(null);
  const [waitingReaders, setWaitingReaders] = useState([]);
  const [waitingWriters, setWaitingWriters] = useState([]);
  const intervalRef = useRef(null);

  const generateSimulation = () => {
    const events = [];
    const totalProcesses = numReaders + numWriters;
    
    // Generate random events
    for (let i = 0; i < totalProcesses * 2; i++) {
      const isReader = Math.random() < (numReaders / totalProcesses);
      const processId = isReader 
        ? `R${Math.floor(Math.random() * numReaders) + 1}`
        : `W${Math.floor(Math.random() * numWriters) + 1}`;
      
      const action = Math.random() < 0.6 ? 'request' : 'release';
      
      events.push({
        step: i + 1,
        processId,
        type: isReader ? 'reader' : 'writer',
        action,
        time: i * 1000 + Math.random() * 500
      });
    }
    
    return events.sort((a, b) => a.time - b.time);
  };

  const startVisualization = () => {
    if (isPaused) {
      setIsPaused(false);
      setIsRunning(true);
      return;
    }

    const events = generateSimulation();
    setSimulation(events);
    setCurrentStep(0);
    setActiveReaders([]);
    setActiveWriter(null);
    setWaitingReaders([]);
    setWaitingWriters([]);
    setIsRunning(true);
    setIsPaused(false);
  };

  const pauseVisualization = () => {
    setIsPaused(true);
    setIsRunning(false);
  };

  const resetVisualization = () => {
    setIsRunning(false);
    setIsPaused(false);
    setCurrentStep(0);
    setSimulation([]);
    setActiveReaders([]);
    setActiveWriter(null);
    setWaitingReaders([]);
    setWaitingWriters([]);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  useEffect(() => {
    if (isRunning && !isPaused && currentStep < simulation.length) {
      intervalRef.current = setTimeout(() => {
        const event = simulation[currentStep];
        processEvent(event);
        setCurrentStep(prev => prev + 1);
      }, 1500);
    } else if (currentStep >= simulation.length && isRunning) {
      setIsRunning(false);
    }

    return () => {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
      }
    };
  }, [isRunning, isPaused, currentStep, simulation]);

  const processEvent = (event) => {
    if (event.type === 'reader') {
      if (event.action === 'request') {
        if (activeWriter === null) {
          // No active writer, reader can proceed
          setActiveReaders(prev => [...prev, event.processId]);
          setWaitingReaders(prev => prev.filter(id => id !== event.processId));
        } else {
          // Writer is active, reader must wait
          setWaitingReaders(prev => 
            prev.includes(event.processId) ? prev : [...prev, event.processId]
          );
        }
      } else {
        // Reader releasing
        setActiveReaders(prev => prev.filter(id => id !== event.processId));
      }
    } else {
      // Writer
      if (event.action === 'request') {
        if (activeReaders.length === 0 && activeWriter === null) {
          // No active readers or writers, writer can proceed
          setActiveWriter(event.processId);
          setWaitingWriters(prev => prev.filter(id => id !== event.processId));
        } else {
          // Readers or writer active, writer must wait
          setWaitingWriters(prev => 
            prev.includes(event.processId) ? prev : [...prev, event.processId]
          );
        }
      } else {
        // Writer releasing
        setActiveWriter(null);
        // Wake up waiting readers if any
        setTimeout(() => {
          if (waitingReaders.length > 0) {
            setActiveReaders(prev => [...prev, ...waitingReaders]);
            setWaitingReaders([]);
          }
        }, 100);
      }
    }
  };

  const getProcessColor = (processId, isActive) => {
    if (processId.startsWith('R')) {
      return isActive ? 'bg-blue-500' : 'bg-blue-200';
    } else {
      return isActive ? 'bg-red-500' : 'bg-red-200';
    }
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4 transition-colors">
            <ArrowLeft size={20} className="mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Reader-Writer Problem</h1>
          <p className="text-gray-600">Synchronization visualization for reader-writer problem</p>
        </div>

        {/* Configuration */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Configuration</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Readers
              </label>
              <input
                type="number"
                value={numReaders}
                onChange={(e) => setNumReaders(parseInt(e.target.value) || 1)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                min="1"
                max="10"
                disabled={isRunning}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Writers
              </label>
              <input
                type="number"
                value={numWriters}
                onChange={(e) => setNumWriters(parseInt(e.target.value) || 1)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                min="1"
                max="10"
                disabled={isRunning}
              />
            </div>
          </div>

          <div className="flex gap-4">
            {!isRunning ? (
              <button
                onClick={startVisualization}
                className="flex items-center px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
              >
                <Play size={20} className="mr-2" />
                {isPaused ? 'Resume' : 'Start Visualization'}
              </button>
            ) : (
              <button
                onClick={pauseVisualization}
                className="flex items-center px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-medium"
              >
                <Pause size={20} className="mr-2" />
                Pause
              </button>
            )}
            
            <button
              onClick={resetVisualization}
              className="flex items-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              <RotateCcw size={20} className="mr-2" />
              Reset
            </button>
          </div>
        </div>

        {/* Synchronization Concept */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Synchronization Rules</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 rounded-lg p-6">
              <div className="flex items-center mb-3">
                <BookOpen className="text-blue-600 mr-3" size={24} />
                <h3 className="text-lg font-semibold text-blue-800">Readers</h3>
              </div>
              <ul className="text-blue-700 space-y-2">
                <li>• Multiple readers can access simultaneously</li>
                <li>• Readers cannot access when a writer is active</li>
                <li>• Readers must wait for writers to finish</li>
              </ul>
            </div>
            
            <div className="bg-red-50 rounded-lg p-6">
              <div className="flex items-center mb-3">
                <Edit3 className="text-red-600 mr-3" size={24} />
                <h3 className="text-lg font-semibold text-red-800">Writers</h3>
              </div>
              <ul className="text-red-700 space-y-2">
                <li>• Only one writer can access at a time</li>
                <li>• Writers have exclusive access</li>
                <li>• Writers must wait for all readers to finish</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Visualization */}
        {simulation.length > 0 && (
          <div className="space-y-8">
            {/* Current Status */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">Current Status</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Shared Resource */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">Shared Resource</h3>
                  <div className="h-32 bg-white border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                    {activeWriter ? (
                      <div className="text-center">
                        <Edit3 className="text-red-600 mx-auto mb-2" size={32} />
                        <p className="text-red-800 font-medium">{activeWriter} Writing</p>
                      </div>
                    ) : activeReaders.length > 0 ? (
                      <div className="text-center">
                        <BookOpen className="text-blue-600 mx-auto mb-2" size={32} />
                        <p className="text-blue-800 font-medium">{activeReaders.length} Reader(s)</p>
                      </div>
                    ) : (
                      <p className="text-gray-500">Available</p>
                    )}
                  </div>
                </div>

                {/* Active Processes */}
                <div className="bg-green-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-green-800 mb-4">Active Processes</h3>
                  <div className="space-y-2">
                    {activeWriter && (
                      <div className="bg-red-500 text-white px-3 py-2 rounded-lg flex items-center">
                        <Edit3 size={16} className="mr-2" />
                        {activeWriter}
                      </div>
                    )}
                    {activeReaders.map(reader => (
                      <div key={reader} className="bg-blue-500 text-white px-3 py-2 rounded-lg flex items-center">
                        <BookOpen size={16} className="mr-2" />
                        {reader}
                      </div>
                    ))}
                    {activeReaders.length === 0 && !activeWriter && (
                      <p className="text-gray-500 text-center py-4">No active processes</p>
                    )}
                  </div>
                </div>

                {/* Waiting Queue */}
                <div className="bg-yellow-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-yellow-800 mb-4">Waiting Queue</h3>
                  <div className="space-y-2">
                    {waitingWriters.map(writer => (
                      <div key={writer} className="bg-red-200 text-red-800 px-3 py-2 rounded-lg flex items-center">
                        <Edit3 size={16} className="mr-2" />
                        {writer} (waiting)
                      </div>
                    ))}
                    {waitingReaders.map(reader => (
                      <div key={reader} className="bg-blue-200 text-blue-800 px-3 py-2 rounded-lg flex items-center">
                        <BookOpen size={16} className="mr-2" />
                        {reader} (waiting)
                      </div>
                    ))}
                    {waitingReaders.length === 0 && waitingWriters.length === 0 && (
                      <p className="text-gray-500 text-center py-4">No waiting processes</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Event Timeline */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">Event Timeline</h2>
              
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {simulation.slice(0, currentStep).map((event, index) => (
                  <div 
                    key={index} 
                    className={`flex items-center p-3 rounded-lg ${
                      index === currentStep - 1 ? 'bg-yellow-100 border border-yellow-300' : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3 flex-1">
                      <span className="text-sm text-gray-500 font-mono">
                        Step {event.step}
                      </span>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${
                        event.type === 'reader' ? 'bg-blue-500' : 'bg-red-500'
                      }`}>
                        {event.type === 'reader' ? <BookOpen size={16} /> : <Edit3 size={16} />}
                      </div>
                      <span className="font-medium">{event.processId}</span>
                      <span className={`px-2 py-1 rounded text-sm ${
                        event.action === 'request' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                      }`}>
                        {event.action}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReaderWriterProblem;