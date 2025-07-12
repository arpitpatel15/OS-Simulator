import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Play, RotateCcw } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const FCFSDiskScheduling = () => {
  const [initialHead, setInitialHead] = useState('');
  const [requestQueue, setRequestQueue] = useState('');
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});

  const validateInputs = () => {
    const newErrors = {};
    
    if (!initialHead || initialHead < 0) {
      newErrors.initialHead = 'Please enter a valid initial head position';
    }
    
    if (!requestQueue.trim()) {
      newErrors.requestQueue = 'Please enter disk requests';
    } else {
      try {
        const requests = requestQueue.split(',').map(num => parseInt(num.trim()));
        if (requests.some(isNaN) || requests.some(num => num < 0)) {
          newErrors.requestQueue = 'All requests must be valid positive numbers';
        }
      } catch {
        newErrors.requestQueue = 'Invalid format. Use comma-separated numbers';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const simulateFCFS = () => {
    if (!validateInputs()) return;

    const head = parseInt(initialHead);
    const requests = requestQueue.split(',').map(num => parseInt(num.trim()));
    
    let currentHead = head;
    let totalMovement = 0;
    const sequence = [head];
    const movements = [];

    requests.forEach(request => {
      const movement = Math.abs(currentHead - request);
      totalMovement += movement;
      movements.push(movement);
      currentHead = request;
      sequence.push(request);
    });

    setResult({
      sequence,
      totalMovement,
      movements,
      requests
    });
  };

  const resetForm = () => {
    setInitialHead('');
    setRequestQueue('');
    setResult(null);
    setErrors({});
  };

  const chartData = result ? {
    labels: result.sequence.map((_, index) => `Step ${index}`),
    datasets: [
      {
        label: 'Head Position',
        data: result.sequence,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 3,
        pointBackgroundColor: 'rgb(59, 130, 246)',
        pointBorderColor: 'white',
        pointBorderWidth: 2,
        pointRadius: 6,
        tension: 0.1
      }
    ]
  } : null;

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'FCFS Disk Head Movement',
        font: {
          size: 16,
          weight: 'bold'
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Disk Position'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Time Steps'
        }
      }
    }
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4 transition-colors">
            <ArrowLeft size={20} className="mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">FCFS Disk Scheduling</h1>
          <p className="text-gray-600">First Come First Serve disk scheduling algorithm simulation</p>
        </div>

        {/* Input Form */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Input Parameters</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Initial Head Position
              </label>
              <input
                type="number"
                value={initialHead}
                onChange={(e) => setInitialHead(e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.initialHead ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., 50"
              />
              {errors.initialHead && (
                <p className="mt-1 text-sm text-red-600">{errors.initialHead}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Disk Request Queue
              </label>
              <input
                type="text"
                value={requestQueue}
                onChange={(e) => setRequestQueue(e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.requestQueue ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., 82,170,43,140,24,16,190"
              />
              {errors.requestQueue && (
                <p className="mt-1 text-sm text-red-600">{errors.requestQueue}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">Enter comma-separated values</p>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={simulateFCFS}
              className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
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
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">Results</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-blue-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-blue-800 mb-2">Request Sequence</h3>
                  <p className="text-blue-600 font-mono">{result.requests.join(' → ')}</p>
                </div>
                
                <div className="bg-green-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-green-800 mb-2">Total Head Movement</h3>
                  <p className="text-3xl font-bold text-green-600">{result.totalMovement}</p>
                </div>
              </div>

              {/* Movement Table */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-200 rounded-lg">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-200 px-4 py-3 text-left font-semibold">Step</th>
                      <th className="border border-gray-200 px-4 py-3 text-left font-semibold">From</th>
                      <th className="border border-gray-200 px-4 py-3 text-left font-semibold">To</th>
                      <th className="border border-gray-200 px-4 py-3 text-left font-semibold">Movement</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.requests.map((request, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="border border-gray-200 px-4 py-3">{index + 1}</td>
                        <td className="border border-gray-200 px-4 py-3">{result.sequence[index]}</td>
                        <td className="border border-gray-200 px-4 py-3">{request}</td>
                        <td className="border border-gray-200 px-4 py-3 font-mono">{result.movements[index]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Chart */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">Head Movement Visualization</h2>
              <div className="h-96">
                <Line data={chartData} options={chartOptions} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FCFSDiskScheduling;