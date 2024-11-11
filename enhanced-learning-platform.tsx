import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { Calendar, Target, TrendingUp, Award } from 'lucide-react';

// New Analytics Dashboard Component
const AnalyticsDashboard = ({ studentData }) => {
  const [timeRange, setTimeRange] = useState('week');
  const [learningData, setLearningData] = useState([]);

  useEffect(() => {
    // Simulated data - replace with actual API call
    const data = [
      { date: '2024-01', studyTime: 45, completion: 85, engagement: 72 },
      { date: '2024-02', studyTime: 52, completion: 88, engagement: 78 },
      { date: '2024-03', studyTime: 48, completion: 92, engagement: 82 },
      { date: '2024-04', studyTime: 60, completion: 95, engagement: 88 }
    ];
    setLearningData(data);
  }, [timeRange]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="text-blue-500" />
              Learning Goals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {['Complete Python Basics', 'Submit Final Project', 'Review ML Concepts'].map((goal, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span>{goal}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="text-blue-500" />
              Study Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">14</div>
              <div className="text-sm text-gray-600">Days</div>
              <div className="mt-2 grid grid-cols-7 gap-1">
                {Array(7).fill(0).map((_, idx) => (
                  <div
                    key={idx}
                    className="h-2 rounded-full bg-blue-200"
                    style={{
                      backgroundColor: idx < 5 ? 'rgb(37, 99, 235)' : 'rgb(219, 234, 254)'
                    }}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Award className="text-blue-500" />
              Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[
                { name: 'Fast Learner', progress: 80 },
                { name: 'Problem Solver', progress: 65 },
                { name: 'Team Player', progress: 90 }
              ].map((achievement, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{achievement.name}</span>
                    <span>{achievement.progress}%</span>
                  </div>
                  <Progress value={achievement.progress} className="h-1" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="text-blue-500" />
            Learning Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={learningData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="completion"
                  stackId="1"
                  stroke="#2563eb"
                  fill="#2563eb"
                  fillOpacity={0.6}
                />
                <Area
                  type="monotone"
                  dataKey="engagement"
                  stackId="1"
                  stroke="#7c3aed"
                  fill="#7c3aed"
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Enhanced Course View Component
const CourseView = ({ course }) => {
  const [activeSection, setActiveSection] = useState('content');
  const [discussions, setDiscussions] = useState([]);

  useEffect(() => {
    // Simulate loading discussions
    setDiscussions([
      { id: 1, user: 'Alice', message: 'Great explanation in chapter 3!', likes: 5 },
      { id: 2, user: 'Bob', message: 'Anyone want to form a study group?', likes: 3 }
    ]);
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{course.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeSection} onValueChange={setActiveSection}>
            <TabsList>
              <TabsTrigger value="content">Course Content</TabsTrigger>
              <TabsTrigger value="discussions">Discussions</TabsTrigger>
              <TabsTrigger value="notes">My Notes</TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="space-y-4">
              {course.modules?.map((module, idx) => (
                <Card key={idx}>
                  <CardHeader>
                    <CardTitle className="text-lg">{module.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {module.lessons?.map((lesson, lessonIdx) => (
                        <div
                          key={lessonIdx}
                          className="flex items-center justify-between p-2 hover:bg-gray-50 rounded"
                        >
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${
                              lesson.completed ? 'bg-green-500' : 'bg-gray-300'
                            }`} />
                            <span>{lesson.title}</span>
                          </div>
                          <Button variant="ghost" size="sm">
                            {lesson.completed ? 'Review' : 'Start'}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="discussions">
              <Card>
                <CardContent className="space-y-4">
                  {discussions.map((discussion) => (
                    <div key={discussion.id} className="p-4 border rounded">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">{discussion.user}</div>
                          <div className="text-gray-600">{discussion.message}</div>
                        </div>
                        <Button variant="ghost" size="sm">
                          Like ({discussion.likes})
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notes">
              <Card>
                <CardContent>
                  <textarea
                    className="w-full h-64 p-4 border rounded resize-none"
                    placeholder="Take notes here..."
                  />
                  <div className="mt-4 flex justify-end">
                    <Button>Save Notes</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export { AnalyticsDashboard, CourseView };
