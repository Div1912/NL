import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, ResponsiveContainer
} from 'recharts';
import {
  BookOpen, Target, Bell, TrendingUp, User, LogOut,
  Calendar, Award, ChevronRight, Filter, Search
} from 'lucide-react';

// Authentication Context
const AuthContext = React.createContext(null);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        // Verify token with backend
        const response = await fetch('api/auth/verify', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    const response = await fetch('api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    
    if (response.ok) {
      const { token, user } = await response.json();
      localStorage.setItem('token', token);
      setUser(user);
    } else {
      throw new Error('Login failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Login Component
const LoginPage = () => {
  const { login } = React.useContext(AuthContext);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(formData);
    } catch (err) {
      setError('Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Login to Career Guidance</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  email: e.target.value
                }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  password: e.target.value
                }))}
              />
            </div>
            {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
            <Button type="submit" className="w-full">Login</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

// Enhanced Course Detail Component
const CourseDetail = ({ course, onClose }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simulate progress loading
    const timer = setInterval(() => {
      setProgress(prev => Math.min(prev + 10, 100));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{course.title}</DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Course Details</h4>
                <div className="space-y-2 text-sm">
                  <div>Duration: {course.duration_weeks} weeks</div>
                  <div>Difficulty: {course.difficulty}</div>
                  <div>Rating: {course.rating}/5.0</div>
                  <div>Completion Rate: {course.completion_rate * 100}%</div>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Skills Covered</h4>
                <div className="flex flex-wrap gap-2">
                  {course.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Prerequisites</h4>
              <ul className="list-disc list-inside text-sm">
                {course.prerequisites.map((prereq, idx) => (
                  <li key={idx}>{prereq}</li>
                ))}
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="curriculum" className="space-y-4">
            {/* Sample curriculum structure */}
            {Array.from({ length: 4 }, (_, weekIndex) => (
              <Card key={weekIndex}>
                <CardHeader>
                  <CardTitle className="text-lg">Week {weekIndex + 1}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Array.from({ length: 3 }, (_, lessonIndex) => (
                      <div
                        key={lessonIndex}
                        className="flex items-center justify-between p-2 hover:bg-gray-50 rounded"
                      >
                        <div className="flex items-center gap-2">
                          <BookOpen size={16} />
                          <span>Lesson {lessonIndex + 1}</span>
                        </div>
                        <Button variant="ghost" size="sm">
                          Start
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="resources" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Learning Materials</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {['Course Slides', 'Practice Exercises', 'Code Examples'].map((resource, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 hover:bg-gray-50 rounded"
                      >
                        <span>{resource}</span>
                        <Button variant="outline" size="sm">
                          Download
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Additional Resources</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {['Reference Guide', 'Community Forum', 'FAQ'].map((resource, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 hover:bg-gray-50 rounded"
                      >
                        <span>{resource}</span>
                        <Button variant="outline" size="sm">
                          Access
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="progress" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Your Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span>Overall Progress</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Completed Items</h4>
                      <div className="space-y-1 text-sm">
                        <div>Lessons: 12/20</div>
                        <div>Exercises: 8/15</div>
                        <div>Assessments: 2/4</div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Time Spent</h4>
                      <div className="space-y-1 text-sm">
                        <div>This Week: 5h 30m</div>
                        <div>Total: 22h 45m</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Performance Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={[
                      { subject: 'Exercises', score: 80 },
                      { subject: 'Quizzes', score: 75 },
                      { subject: 'Projects', score: 85 },
                      { subject: 'Participation', score: 70 },
                      { subject: 'Assessments', score: 78 }
                    ]}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="subject" />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} />
                      <Radar
                        name="Performance"
                        dataKey="score"
                        stroke="#2563eb"
                        fill="#2563eb"
                        fillOpacity={0.6}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

// Enhanced Learning Path Component
const LearningPath = ({ studentData }) => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [filters, setFilters] = useState({
    difficulty: null,
    duration: null,
    skill: null
  });

  // ... (rest of the component implementation)

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="py-4">
          <div className="flex gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Filter className="mr-2 h-4 w-4" />
                  Difficulty
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleFilterChange('difficulty', 'beginner')}>
                  Beginner
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleFilterChange('difficulty', 'intermediate')}>
                  Intermediate
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleFilterChange('difficulty', 'advanced')}>
                  Advanced
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Add more filters... */}
          </div>
        </CardContent>
      </Card>

      {/* Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {courses.map((course, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="text-blue-500" size={20} />
                {course.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-sm text-gray-600">
                  Duration: {course.duration_weeks} weeks
                </div>
                <div className="text-sm text-gray-600">
                  Difficulty: {course.difficulty}
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {course.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
                <Progress
                  value={course.completion_rate * 100}
                  className="h-2 mt-4"
                />
                <div className="text-xs text-gray-500 text-right">
                  {Math.roun