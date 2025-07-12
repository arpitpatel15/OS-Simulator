import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Play, RotateCcw } from 'lucide-react';

const LRUPageReplacement = () => {
  const [pageString, setPageString] = useState('');
  const [numFrames, setNumFrames] = useState('');
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});

  const validateInputs = () => {
    const newErrors = {};
    
    if (!pageString.trim()) {
      newErrors.pageString = 'Please enter page reference string';
    } else {
      try {
        const pages = pageString.split(',').map(num => parseInt(num.trim()));
        if (pages.some(isNaN) || pages.some(num => num < 0)) {
          newErrors.pageString = 'All pages must be valid non-negative numbers';
        }
      } catch {
        newErrors.pageString = 'Invalid format. Use comma-separated numbers';
      }
    }
    
    if (!numFrames || numFrames <= 0) {
      newErrors.numFrames = 'Please enter a valid number of frames';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const simulateLRU = () => {
    if (!validateInputs()) return;

    const pages = pageString.split(',').map(num => parseInt(num.trim()));
    const frames = parseInt(numFrames);
    
    let memory = [];
    let pageFaults = 0;
    const steps = [];

    pages.forEach((page, index) => {
      const step = {
        pageRequest: page,
        beforeMemory: [...memory],
        afterMemory: [],
        isHit: false,
        isFault: false
      };

      // Check if page is already in memory
      const pageIndex = memory.indexOf(page);
      
      if (pageIndex !== -1) {
        // Page hit - move to end (most recently used)
        memory.splice(pageIndex, 1);
        memory.push(page);
        step.isHit = true;
      } else {
        // Page fault
        pageFaults++;
        step.isFault = true;
        
        if (memory.length < frames) {
          // Memory not full, just add the page
          memory.push(page);
        } else {
          // Memory full, remove LRU (first element) and add new page
          memory.shift();
          memory.push(page);
        }
      }

      step.afterMemory = [...memory];
      steps.push(step);
    });

    setResult({
      steps,
      totalPageFaults: pageFaults,
      totalPages: pages.length,
      hitRatio: ((pages.length - pageFaults) / pages.length * 100).toFixed(2)
    });
  };

  const resetForm = () => {
    setPageString('');
    setNumFrames('');
    setResult(null);
    setErrors({});
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
          <h1 className="text-4xl font-bold text-gray-800 mb-2">LRU Page Replacement</h1>
          <p className="text-gray-600">Least Recently Used page replacement algorithm simulation</p>
        </div>

        {/* Input Form */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Input Parameters</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Page Reference String
              </label>
              <input
                type="text"
                value={pageString}
                onChange={(e) => setPageString(e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                  errors.pageString ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., 7,0,1,2,0,3,0,4"
              />
              {errors.pageString && (
                <p className="mt-1 text-sm text-red-600">{errors.pageString}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">Enter comma-separated page numbers</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Frames
              </label>
              <input
                type="number"
                value={numFrames}
                onChange={(e) => setNumFrames(e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                  errors.numFrames ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., 3"
                min="1"
              />
              {errors.numFrames && (
                <p className="mt-1 text-sm text-red-600">{errors.numFrames}</p>
              )}
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={simulateLRU}
              className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              <Play size={20} className="mr-2" />
              Simulate
            </button>
            <button
              onClick={resetForm}
              className="flex items-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              <RotateCcw size={20} className="mr-2" />
              Reset
            </button>
          </div>
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-8">
            {/* Summary */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">Results Summary</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-red-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-red-800 mb-2">Total Page Faults</h3>
                  <p className="text-3xl font-bold text-red-600">{result.totalPageFaults}</p>
                </div>
                
                <div className="bg-green-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-green-800 mb-2">Hit Ratio</h3>
                  <p className="text-3xl font-bold text-green-600">{result.hitRatio}%</p>
                </div>

                <div className="bg-blue-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-blue-800 mb-2">Total References</h3>
                  <p className="text-3xl font-bold text-blue-600">{result.totalPages}</p>
                </div>
              </div>
            </div>

            {/* Step-by-step visualization */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">Step-by-Step Execution</h2>
              
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-200 rounded-lg">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-200 px-4 py-3 text-left font-semibold">Step</th>
                      <th className="border border-gray-200 px-4 py-3 text-left font-semibold">Page Request</th>
                      <th className="border border-gray-200 px-4 py-3 text-left font-semibold">Before</th>
                      <th className="border border-gray-200 px-4 py-3 text-left font-semibold">After</th>
                      <th className="border border-gray-200 px-4 py-3 text-left font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.steps.map((step, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="border border-gray-200 px-4 py-3 font-medium">{index + 1}</td>
                        <td className="border border-gray-200 px-4 py-3">
                          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-mono">
                            {step.pageRequest}
                          </span>
                        </td>
                        <td className="border border-gray-200 px-4 py-3">
                          <div className="flex space-x-1">
                            {step.beforeMemory.length === 0 ? (
                              <span className="text-gray-400">Empty</span>
                            ) : (
                              step.beforeMemory.map((page, i) => (
                                <span key={i} className="bg-gray-200 text-gray-800 px-2 py-1 rounded text-sm font-mono">
                                  {page}
                                </span>
                              ))
                            )}
                          </div>
                        </td>
                        <td className="border border-gray-200 px-4 py-3">
                          <div className="flex space-x-1">
                            {step.afterMemory.map((page, i) => (
                              <span 
                                key={i} 
                                className={`px-2 py-1 rounded text-sm font-mono ${
                                  page === step.pageRequest && step.isFault
                                    ? 'bg-red-200 text-red-800'
                                    : page === step.pageRequest && step.isHit
                                    ? 'bg-green-200 text-green-800'
                                    : 'bg-gray-200 text-gray-800'
                                }`}
                              >
                                {page}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="border border-gray-200 px-4 py-3">
                          {step.isHit ? (
                            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                              Hit
                            </span>
                          ) : (
                            <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                              Fault
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Visual Memory State */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">Memory Frame Visualization</h2>
              <div className="space-y-4">
                {result.steps.map((step, index) => (
                  <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className="w-16 text-center font-medium">
                      Step {index + 1}
                    </div>
                    <div className="w-20 text-center">
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-mono">
                        {step.pageRequest}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      {Array.from({ length: parseInt(numFrames) }).map((_, frameIndex) => (
                        <div
                          key={frameIndex}
                          className={`w-12 h-12 border-2 rounded-lg flex items-center justify-center font-mono ${
                            step.afterMemory[frameIndex] !== undefined
                              ? step.afterMemory[frameIndex] === step.pageRequest && step.isFault
                                ? 'border-red-500 bg-red-100 text-red-800'
                                : step.afterMemory[frameIndex] === step.pageRequest && step.isHit
                                ? 'border-green-500 bg-green-100 text-green-800'
                                : 'border-gray-300 bg-white'
                              : 'border-gray-300 bg-gray-100'
                          }`}
                        >
                          {step.afterMemory[frameIndex] || '-'}
                        </div>
                      ))}
                    </div>
                    <div className="ml-4">
                      {step.isHit ? (
                        <span className="text-green-600 font-medium">✓ Hit</span>
                      ) : (
                        <span className="text-red-600 font-medium">✗ Fault</span>
                      )}
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

export default LRUPageReplacement;