import React from 'react';
import { Link } from 'react-router-dom';
import { HardDrive, Clock, FileText, Users } from 'lucide-react';

const Dashboard = () => {
  const algorithms = [
    {
      title: 'FCFS Disk Scheduling',
      description: 'First Come First Serve disk scheduling algorithm simulation',
      icon: HardDrive,
      path: '/fcfs-disk',
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Priority Scheduling',
      description: 'Non-preemptive priority scheduling algorithm simulation',
      icon: Clock,
      path: '/priority-scheduling',
      color: 'from-purple-500 to-purple-600'
    },
    {
      title: 'LRU Page Replacement',
      description: 'Least Recently Used page replacement algorithm simulation',
      icon: FileText,
      path: '/lru-page',
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'Reader-Writer Problem',
      description: 'Synchronization visualization for reader-writer problem',
      icon: Users,
      path: '/reader-writer',
      color: 'from-orange-500 to-orange-600'
    }
  ];

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            OS Algorithm Simulator
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Interactive simulations of operating system algorithms with visual demonstrations
          </p>
        </div>

        {/* Algorithm Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {algorithms.map((algorithm, index) => {
            const IconComponent = algorithm.icon;
            return (
              <Link
                key={index}
                to={algorithm.path}
                className="group block transform transition-all duration-300 hover:scale-105"
              >
                <div className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 overflow-hidden">
                  <div className={`h-2 bg-gradient-to-r ${algorithm.color}`}></div>
                  <div className="p-8">
                    <div className="flex items-center mb-4">
                      <div className={`p-3 rounded-lg bg-gradient-to-r ${algorithm.color} text-white`}>
                        <IconComponent size={32} />
                      </div>
                      <h3 className="text-2xl font-semibold text-gray-800 ml-4">
                        {algorithm.title}
                      </h3>
                    </div>
                    <p className="text-gray-600 leading-relaxed">
                      {algorithm.description}
                    </p>
                    <div className="mt-6">
                      <span className="inline-flex items-center text-blue-600 font-medium group-hover:text-blue-800 transition-colors">
                        Start Simulation
                        <svg className="ml-2 w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Footer */}
        <div className="text-center mt-16">
          <p className="text-gray-500">
            ©2025 OS Algorithm Simulator. All rights reserved. @Arpit
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;