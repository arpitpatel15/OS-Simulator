import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Play, RotateCcw } from 'lucide-react';

const PriorityScheduling = () => {
  const [processes, setProcesses] = useState([
    { id: 'P1', arrivalTime: 0, burstTime: 10, priority: 3 }
  ]);
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});

  const addProcess = () => {
    const newId = `P${processes.length + 1}`;
    setProcesses([...processes, { id: newId, arrivalTime: 0, burstTime: 1, priority: 1 }]);
  };

  const removeProcess = (index) => {
    if (processes.length > 1) {
      setProcesses(processes.filter((_, i) => i !== index));
    }
  };

  const updateProcess = (index, field, value) => {
    const updated = [...processes];
    updated[index][field] = value;
    setProcesses(updated);
  };

  const validateInputs = () => {
    const newErrors = {};
    
    processes.forEach((process, index) => {
      if (!process.id.trim()) {
        newErrors[`id_${index}`] = 'Process ID required';
      }
      if (process.arrivalTime < 0 || isNaN(process.arrivalTime)) {
        newErrors[`arrivalTime_${index}`] = 'Valid arrival time required';
      }
      if (process.burstTime <= 0 || isNaN(process.burstTime)) {
        newErrors[`burstTime_${index}`] = 'Valid burst time required';
      }
      if (process.priority < 0 || isNaN(process.priority)) {
        newErrors[`priority_${index}`] = 'Valid priority required';
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateScheduling = () => {
    if (!validateInputs()) return;

    // Sort processes by arrival time, then by priority (lower number = higher priority)
    const sortedProcesses = [...processes].sort((a, b) => {
      if (a.arrivalTime === b.arrivalTime) {
        return a.priority - b.priority;
      }
      return a.arrivalTime - b.arrivalTime;
    });

    let currentTime = 0;
    let completedProcesses = [];
    let remainingProcesses = [...sortedProcesses];
    let ganttChart = [];

    while (remainingProcesses.length > 0) {
      // Get processes that have arrived
      const availableProcesses = remainingProcesses.filter(p => p.arrivalTime <= currentTime);
      
      if (availableProcesses.length === 0) {
        // No process available, jump to next arrival time
        currentTime = Math.min(...remainingProcesses.map(p => p.arrivalTime));
        continue;
      }

      // Select process with highest priority (lowest priority number)
      availableProcesses.sort((a, b) => a.priority - b.priority);
      const selectedProcess = availableProcesses[0];

      // Execute the process
      const startTime = currentTime;
      const endTime = currentTime + selectedProcess.burstTime;
      
      ganttChart.push({
        processId: selectedProcess.id,
        startTime,
        endTime
      });

      // Calculate times
      const completionTime = endTime;
      const turnaroundTime = completionTime - selectedProcess.arrivalTime;
      const waitingTime = turnaroundTime - selectedProcess.burstTime;

      completedProcesses.push({
        ...selectedProcess,
        completionTime,
        turnaroundTime,
        waitingTime
      });

      // Remove completed process and update current time
      remainingProcesses = remainingProcesses.filter(p => p.id !== selectedProcess.id);
      currentTime = endTime;
    }

    // Calculate averages
    const avgTurnaroundTime = completedProcesses.reduce((sum, p) => sum + p.turnaroundTime, 0) / completedProcesses.length;
    const avgWaitingTime = completedProcesses.reduce((sum, p) => sum + p.waitingTime, 0) / completedProcesses.length;

    setResult({
      processes: completedProcesses,
      avgTurnaroundTime: avgTurnaroundTime.toFixed(2),
      avgWaitingTime: avgWaitingTime.toFixed(2),
      ganttChart
    });
  };

  const resetForm = () => {
    setProcesses([{ id: 'P1', arrivalTime: 0, burstTime: 10, priority: 3 }]);
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
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Priority Scheduling</h1>
          <p className="text-gray-600">Non-preemptive priority scheduling algorithm simulation</p>
        </div>

        {/* Input Form */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Process Configuration</h2>
          
          <div className="overflow-x-auto mb-6">
            <table className="w-full border-collapse border border-gray-200 rounded-lg">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-200 px-4 py-3 text-left font-semibold">Process ID</th>
                  <th className="border border-gray-200 px-4 py-3 text-left font-semibold">Arrival Time</th>
                  <th className="border border-gray-200 px-4 py-3 text-left font-semibold">Burst Time</th>
                  <th className="border border-gray-200 px-4 py-3 text-left font-semibold">Priority</th>
                  <th className="border border-gray-200 px-4 py-3 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {processes.map((process, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="border border-gray-200 px-4 py-3">
                      <input
                        type="text"
                        value={process.id}
                        onChange={(e) => updateProcess(index, 'id', e.target.value)}
                        className={`w-full px-2 py-1 border rounded focus:ring-2 focus:ring-purple-500 ${
                          errors[`id_${index}`] ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                    </td>
                    <td className="border border-gray-200 px-4 py-3">
                      <input
                        type="number"
                        value={process.arrivalTime}
                        onChange={(e) => updateProcess(index, 'arrivalTime', parseInt(e.target.value) || 0)}
                        className={`w-full px-2 py-1 border rounded focus:ring-2 focus:ring-purple-500 ${
                          errors[`arrivalTime_${index}`] ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                    </td>
                    <td className="border border-gray-200 px-4 py-3">
                      <input
                        type="number"
                        value={process.burstTime}
                        onChange={(e) => updateProcess(index, 'burstTime', parseInt(e.target.value) || 1)}
                        className={`w-full px-2 py-1 border rounded focus:ring-2 focus:ring-purple-500 ${
                          errors[`burstTime_${index}`] ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                    </td>
                    <td className="border border-gray-200 px-4 py-3">
                      <input
                        type="number"
                        value={process.priority}
                        onChange={(e) => updateProcess(index, 'priority', parseInt(e.target.value) || 1)}
                        className={`w-full px-2 py-1 border rounded focus:ring-2 focus:ring-purple-500 ${
                          errors[`priority_${index}`] ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                    </td>
                    <td className="border border-gray-200 px-4 py-3">
                      <button
                        onClick={() => removeProcess(index)}
                        disabled={processes.length === 1}
                        className="text-red-600 hover:text-red-800 disabled:text-gray-400 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex gap-4 mb-4">
            <button
              onClick={addProcess}
              className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
            >
              <Plus size={18} className="mr-2" />
              Add Process
            </button>
          </div>

          <p className="text-sm text-gray-600 mb-6">
            <strong>Note:</strong> Lower priority number means higher priority (e.g., Priority 1  Priority 2)
          </p>

          <div className="flex gap-4">
            <button
              onClick={calculateScheduling}
              className="flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
            >
              <Play size={20} className="mr-2" />
              Calculate
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
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">Results</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-purple-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-purple-800 mb-2">Average Turnaround Time</h3>
                  <p className="text-3xl font-bold text-purple-600">{result.avgTurnaroundTime}</p>
                </div>
                
                <div className="bg-green-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-green-800 mb-2">Average Waiting Time</h3>
                  <p className="text-3xl font-bold text-green-600">{result.avgWaitingTime}</p>
                </div>
              </div>

              {/* Process Results Table */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-200 rounded-lg">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-200 px-4 py-3 text-left font-semibold">Process</th>
                      <th className="border border-gray-200 px-4 py-3 text-left font-semibold">AT</th>
                      <th className="border border-gray-200 px-4 py-3 text-left font-semibold">BT</th>
                      <th className="border border-gray-200 px-4 py-3 text-left font-semibold">Priority</th>
                      <th className="border border-gray-200 px-4 py-3 text-left font-semibold">CT</th>
                      <th className="border border-gray-200 px-4 py-3 text-left font-semibold">TAT</th>
                      <th className="border border-gray-200 px-4 py-3 text-left font-semibold">WT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.processes.map((process, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="border border-gray-200 px-4 py-3 font-medium">{process.id}</td>
                        <td className="border border-gray-200 px-4 py-3">{process.arrivalTime}</td>
                        <td className="border border-gray-200 px-4 py-3">{process.burstTime}</td>
                        <td className="border border-gray-200 px-4 py-3">{process.priority}</td>
                        <td className="border border-gray-200 px-4 py-3">{process.completionTime}</td>
                        <td className="border border-gray-200 px-4 py-3">{process.turnaroundTime}</td>
                        <td className="border border-gray-200 px-4 py-3">{process.waitingTime}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Gantt Chart */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">Gantt Chart</h2>
              <div className="overflow-x-auto">
                <div className="flex items-center space-x-0 min-w-max">
                  {result.ganttChart.map((item, index) => {
                    const width = item.endTime - item.startTime;
                    const colors = ['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500', 'bg-purple-500', 'bg-pink-500'];
                    return (
                      <div key={index} className="flex flex-col items-center">
                        <div
                          className={`${colors[index % colors.length]} text-white px-4 py-3 text-center font-medium flex items-center justify-center`}
                          style={{ width: `${width * 40}px`, minWidth: '60px' }}
                        >
                          {item.processId}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          {item.startTime} - {item.endTime}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PriorityScheduling;