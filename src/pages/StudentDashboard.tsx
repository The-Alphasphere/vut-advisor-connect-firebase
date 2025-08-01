import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, updateDoc, doc, getDoc, deleteDoc } from 'firebase/firestore';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Home, BarChart2, Bell, Settings, User, Calendar, Clock, ChevronRight, ChevronLeft, Download, Plus, LogOut, Camera, Link as LinkIcon, Flag, CheckSquare, Square, Trash2, TrendingUp, Target, Lightbulb } from 'lucide-react';
import { toast } from 'sonner';
import { format, startOfMonth } from 'date-fns';
import StudentSessionEvaluation from '@/components/StudentSessionEvaluation';
import BookSessionDialog from '@/components/BookSessionDialog';
import LogoutConfirmation from '@/components/LogoutConfirmation';
import jsPDF from 'jspdf';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import FooterSmall from '@/components/FooterSmall';
import StudentProfileModal from '@/components/StudentProfileModal';
import { LineChart, Line } from 'recharts';

// --- INTERFACES ---
interface Session {
  id: string;
  student_id: string;
  advisor_id: string;
  advisor_name: string;
  session_date: { toDate: () => Date };
  status: 'Pending' | 'Confirmed' | 'Completed' | 'To Complete' | 'Cancelled';
  session_details: {
    reasons: string[];
    sessionType?: string;
    groupMembers?: { name: string; email: string }[];
  };
  reference_code: string;
}

interface Goal {
    id: string;
    text: string;
    completed: boolean;
}

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const [sessions, setSessions] = useState<Session[]>([]);
  const [advisors, setAdvisors] = useState<any[]>([]);
  const [primaryAdvisor, setPrimaryAdvisor] = useState<any>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [newGoal, setNewGoal] = useState("");
  const [loading, setLoading] = useState(true);
  
  const [evaluationSession, setEvaluationSession] = useState<Session | null>(null);
  const [showEvaluation, setShowEvaluation] = useState(false);
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [activeSessionTab, setActiveSessionTab] = useState('upcoming');
  const [showProfileModal, setShowProfileModal] = useState(false);

  const [userProfile, setUserProfileState] = useState({
      name: '',
      email: '',
      avatar: '',
      course: '',
      faculty: ''
  });

  // Fetch real data from Firestore
  useEffect(() => {
    if (!user?.uuid) {
      setLoading(false);
      return;
    }

    setLoading(true);
    
    // Fetch user-specific data (including primary advisor ID, course, and faculty)
    const userDocRef = doc(db, "users", user.uuid);
    const unsubscribeUser = onSnapshot(userDocRef, (userDoc) => {
        if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserProfileState({
                name: `${userData.Name || ''} ${userData.Surname || ''}`,
                email: userData.email || '',
                avatar: `https://placehold.co/100x100/0ea5e9/ffffff?text=${(userData.Name || 'U').charAt(0)}`,
                course: userData.course || 'Course not set',
                faculty: userData.faculty || 'Faculty not set'
            });

            if (userData.primaryAdvisorId) {
                const advisorDocRef = doc(db, "users", userData.primaryAdvisorId);
                getDoc(advisorDocRef).then(advisorDoc => {
                    if (advisorDoc.exists()) {
                        setPrimaryAdvisor({ id: advisorDoc.id, ...advisorDoc.data() });
                    }
                });
            }
        }
    });

    const sessionsQuery = query(collection(db, "sessions"), where("student_id", "==", user.uuid));
    const unsubscribeSessions = onSnapshot(sessionsQuery, (snapshot) => {
      const userSessions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Session));
      setSessions(userSessions);
      setLoading(false);
    });

    const advisorsQuery = query(collection(db, "users"), where("role", "==", "advisor"));
    const unsubscribeAdvisors = onSnapshot(advisorsQuery, (snapshot) => setAdvisors(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))));
    
    const goalsQuery = query(collection(db, "users", user.uuid, "goals"));
    const unsubscribeGoals = onSnapshot(goalsQuery, (snapshot) => setGoals(snapshot.docs.map(doc => ({id: doc.id, ...doc.data() } as Goal))));

    return () => {
      unsubscribeUser();
      unsubscribeSessions();
      unsubscribeAdvisors();
      unsubscribeGoals();
    };
  }, [user?.uuid]);
  
  // -- DYNAMIC DATA & INSIGHTS -- //
  const upcomingSessions = useMemo(() => sessions.filter(s => ['Pending', 'Confirmed'].includes(s.status)).sort((a,b) => a.session_date.toDate().getTime() - b.session_date.toDate().getTime()), [sessions]);
  const pastSessions = useMemo(() => sessions.filter(s => ['Completed', 'Cancelled'].includes(s.status)), [sessions]);
  const toEvaluateSessions = useMemo(() => sessions.filter(s => s.status === 'To Complete'), [sessions]);
  
  const sessionsPerMonth = useMemo(() => {
    if (sessions.length === 0) return [];
    const monthCounts = sessions.reduce((acc, session) => {
      const month = format(session.session_date.toDate(), 'MMM yyyy');
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(monthCounts).map(([name, sessions]) => ({ name, sessions }));
  }, [sessions]);
  const sessionReasonData = useMemo(() => {
    if (sessions.length === 0) return [];
      const reasonCounts = sessions.reduce((acc, session) => {
          session.session_details.reasons.forEach(reason => { acc[reason] = (acc[reason] || 0) + 1; });
          return acc;
      }, {} as Record<string, number>);

      const colors = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
      return Object.entries(reasonCounts).map(([name, value], index) => ({ name, value, color: colors[index % colors.length] }));
  }, [sessions]);

  const sessionStatusData = useMemo(() => {
    if (sessions.length === 0) return [];
    const statusCounts = sessions.reduce((acc, session) => {
      acc[session.status] = (acc[session.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const colors = ['#10b981', '#f59e0b', '#0ea5e9', '#ef4444', '#6b7280'];
    return Object.entries(statusCounts).map(([name, value], index) => ({ name, value, color: colors[index % colors.length] }));
  }, [sessions]);

  const sessionsPerWeek = useMemo(() => {
    if (sessions.length === 0) return [];
    const weekCounts = sessions.reduce((acc, session) => {
      const week = format(session.session_date.toDate(), 'yyyy-MM-dd');
      acc[week] = (acc[week] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(weekCounts).map(([name, sessions]) => ({ name, sessions })).slice(-8);
  }, [sessions]);

  const performanceData = useMemo(() => {
    if (sessions.length === 0) return [];
    return sessions.slice(-6).map((session, index) => ({
      session: `Session ${index + 1}`,
      satisfaction: Math.floor(Math.random() * 3) + 3, // Mock data 3-5
      progress: Math.floor(Math.random() * 40) + 60 // Mock data 60-100
    }));
  }, [sessions]);


  // -- HANDLERS -- //
  const addGoal = async () => {
    if (newGoal.trim() === "" || !user) return;
    await addDoc(collection(db, "users", user.uuid, "goals"), { text: newGoal, completed: false, createdAt: serverTimestamp() });
    setNewGoal("");
  };

  const toggleGoal = async (id: string, completed: boolean) => {
    if (!user) return;
    await updateDoc(doc(db, "users", user.uuid, "goals", id), { completed: !completed });
  };
  
  const deleteGoal = async (id: string) => {
    if (!user) return;
    await deleteDoc(doc(db, "users", user.uuid, "goals", id));
  };
  
  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newAvatar = e.target?.result as string;
        setUserProfileState(prev => ({ ...prev, avatar: newAvatar }));
        toast.success("Avatar preview updated.");
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading || !user) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  // --- RENDER ---
  return (
    <div className="flex flex-col min-h-screen bg-background font-sans">
      <div className="flex flex-1">
        <Sidebar />
        <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
            <main className="p-8">
                {activeSection === 'dashboard' && <MainDashboardView />}
                {activeSection === 'my-sessions' && <MySessionsSection />}
                {activeSection === 'analytics' && <AnalyticsSection />}
                {activeSection === 'my-advisor' && <MyAdvisorSection />}
                {activeSection === 'resource-hub' && <ResourceHubSection />}
                {activeSection === 'goal-tracker' && <GoalTrackerSection />}
                {activeSection === 'notifications' && <NotificationsSection />}
                
            </main>
        </div>
      </div>
      <div className={`transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <FooterSmall/>
      </div>
      
      <BookSessionDialog open={showBookingDialog} onOpenChange={setShowBookingDialog} onBookSession={() => {}} advisors={advisors} bookedSlots={[]} />
      {showEvaluation && evaluationSession && <StudentSessionEvaluation isOpen={showEvaluation} session={evaluationSession} onClose={() => setShowEvaluation(false)} onSubmit={() => {}} />}
      <StudentProfileModal 
        isOpen={showProfileModal} 
        onClose={() => setShowProfileModal(false)} 
        userProfile={userProfile}
        onAvatarChange={handleAvatarChange}
      />
    </div>
  );

  // --- SUB-COMPONENTS ---
  function Sidebar() {
    return (
        <div className={`flex flex-col bg-card text-card-foreground transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'} p-4 shadow-lg border-r fixed left-0 top-0 bottom-0 z-40 overflow-y-auto`}>
            <div className="flex items-center justify-between mb-8">
                {isSidebarOpen && (
                    <div 
                        className="flex items-center gap-3 p-1 rounded-lg hover:bg-accent transition-colors duration-200 cursor-pointer w-full"
                        onClick={() => setShowProfileModal(true)}
                    >
                        <div className="relative group flex-shrink-0">
                            <img 
                                src={userProfile.avatar} 
                                alt="User Avatar" 
                                className="w-10 h-10 rounded-full border-2 border-primary"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <User size={16} className="text-white"/>
                            </div>
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-md font-semibold truncate">{userProfile.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{userProfile.course}</p>
                            <p className="text-xs text-muted-foreground truncate">{userProfile.faculty}</p>
                        </div>
                    </div>
                )}
                <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 rounded-full hover:bg-accent"><ChevronLeft size={20} /></button>
            </div>
            <nav className="flex-grow">
                <ul>
                    <SidebarItem icon={<Home size={20} />} text="Dashboard" isActive={activeSection === 'dashboard'} onClick={() => setActiveSection('dashboard')} />
                    <SidebarItem icon={<Calendar size={20} />} text="My Sessions" isActive={activeSection === 'my-sessions'} onClick={() => setActiveSection('my-sessions')} />
                    <SidebarItem icon={<BarChart2 size={20} />} text="My Journey" isActive={activeSection === 'analytics'} onClick={() => setActiveSection('analytics')} />
                    <SidebarItem icon={<User size={20} />} text="My Advisor" isActive={activeSection === 'my-advisor'} onClick={() => setActiveSection('my-advisor')} />
                    <SidebarItem icon={<LinkIcon size={20} />} text="Resource Hub" isActive={activeSection === 'resource-hub'} onClick={() => setActiveSection('resource-hub')} />
                    <SidebarItem icon={<Flag size={20} />} text="Goal Tracker" isActive={activeSection === 'goal-tracker'} onClick={() => setActiveSection('goal-tracker')} />
                    <SidebarItem icon={<Bell size={20} />} text="Notifications" isActive={activeSection === 'notifications'} onClick={() => setActiveSection('notifications')} />
                </ul>
            </nav>
            <div className="mt-auto">
                <LogoutConfirmation onLogout={logout}>
                    <button className={`flex items-center w-full p-3 rounded-lg transition-colors duration-200 text-muted-foreground hover:bg-accent hover:text-red-500 ${isSidebarOpen ? 'justify-start' : 'justify-center'}`}>
                        <LogOut size={20} />
                        {isSidebarOpen && <span className="ml-3 text-sm font-medium">Logout</span>}
                    </button>
                </LogoutConfirmation>
            </div>
        </div>
    );
  }

  function SidebarItem({ icon, text, isActive, onClick }: any) {
     return (<li className="mb-2"><button onClick={onClick} className={`flex items-center w-full p-3 rounded-lg transition-colors duration-200 ${isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'} ${isSidebarOpen ? '' : 'justify-center'}`}>{icon} {isSidebarOpen && <span className="ml-3">{text}</span>}</button></li>);
  }
  
  function MainDashboardView() {
    const recentSessions = upcomingSessions.slice(0, 3);
    const recentNotifications = [
      { id: 1, message: "Session with Dr. Smith scheduled for tomorrow", time: "2 hours ago", type: "session" },
      { id: 2, message: "Please complete evaluation for your last session", time: "1 day ago", type: "evaluation" },
      { id: 3, message: "New resources added to your course materials", time: "3 days ago", type: "resource" }
    ];
    
    return (
        <>
            <header className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Welcome back, {userProfile.name.split(' ')[0]}!</h1>
                <Button onClick={() => setShowBookingDialog(true)} size="lg" className="shadow-lg"><Plus size={16} className="mr-2"/> Book a New Session</Button>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <InsightCard title="Total Sessions" value={sessions.length} />
                <InsightCard title="Upcoming" value={upcomingSessions.length} />
                <InsightCard title="Completed" value={pastSessions.length} />
                <InsightCard title="To Evaluate" value={toEvaluateSessions.length} />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Notifications */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Bell size={20} />
                            Recent Notifications
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {recentNotifications.map(notification => (
                                <div key={notification.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent">
                                    <div className={`w-2 h-2 rounded-full mt-2 ${
                                        notification.type === 'session' ? 'bg-blue-500' : 
                                        notification.type === 'evaluation' ? 'bg-orange-500' : 'bg-green-500'
                                    }`} />
                                    <div className="flex-1">
                                        <p className="text-sm">{notification.message}</p>
                                        <p className="text-xs text-muted-foreground">{notification.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Latest Sessions */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar size={20} />
                            Latest Sessions
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {recentSessions.length > 0 ? recentSessions.map(session => (
                                <div key={session.id} className="flex justify-between items-center p-3 rounded-lg hover:bg-accent">
                                    <div>
                                        <p className="font-medium">{session.advisor_name}</p>
                                        <p className="text-sm text-muted-foreground">{session.session_details.reasons.join(', ')}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm">{format(session.session_date.toDate(), 'MMM dd')}</p>
                                        <Badge variant="outline">{session.status}</Badge>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-center text-muted-foreground py-4">No upcoming sessions</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
  }
  
  function InsightCard({ title, value }: { title: string, value: string | number }) {
    return <Card><CardHeader><CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{value}</p></CardContent></Card>;
  }

  function MySessionsSection() {
    const sessionsForTab = (tab: string) => {
        if (tab === 'upcoming') return upcomingSessions;
        if (tab === 'to-evaluate') return toEvaluateSessions;
        if (tab === 'past') return pastSessions;
        return [];
    };
    return <>
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">My Sessions</h1>
            <Button onClick={() => setShowBookingDialog(true)} className="shadow-lg">
                <Plus size={16} className="mr-2"/> Book Session
            </Button>
        </div>
        <div className="flex gap-2 mb-4 border-b">
            <TabButton title={`Upcoming (${upcomingSessions.length})`} isActive={activeSessionTab === 'upcoming'} onClick={() => setActiveSessionTab('upcoming')} />
            <TabButton title={`To Evaluate (${toEvaluateSessions.length})`} isActive={activeSessionTab === 'to-evaluate'} onClick={() => setActiveSessionTab('to-evaluate')} />
            <TabButton title={`Past (${pastSessions.length})`} isActive={activeSessionTab === 'past'} onClick={() => setActiveSessionTab('past')} />
        </div>
        <div className="space-y-4">
            {sessionsForTab(activeSessionTab).length > 0 ? 
                sessionsForTab(activeSessionTab).map(s => <SessionCard key={s.id} session={s} />) :
                <Card><CardContent className="p-6 text-center text-muted-foreground">No sessions in this category.</CardContent></Card>
            }
        </div>
    </>;
  }
  
  function TabButton({ title, isActive, onClick}: any) {
    return <button onClick={onClick} className={`py-2 px-4 text-sm font-medium ${isActive ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'}`}>{title}</button>
  }
  
  function SessionCard({ session }: { session: Session }) { 
    return <Card><CardContent className="p-4 flex justify-between items-center"><div><p className="font-semibold">{session.advisor_name}</p><p className="text-sm text-muted-foreground">{session.session_details.reasons.join(', ')}</p></div><div><p>{format(session.session_date.toDate(), 'PPP, p')}</p><Badge>{session.status}</Badge></div></CardContent></Card>
  }

  function AnalyticsSection() {
    const timelineData = sessions.slice(0, 5).map((session, index) => ({
      date: format(session.session_date.toDate(), 'MMM dd, yyyy'),
      event: `Session with ${session.advisor_name}`,
      type: session.session_details.reasons[0] || 'General',
      status: session.status
    }));

    const aiInsights = [
      "You've had consistent academic advising sessions, showing great commitment to your academic journey.",
      "Consider scheduling more career guidance sessions to complement your academic progress.",
      "Your session frequency suggests strong engagement with academic support services."
    ];

    return <>
        <h1 className="text-3xl font-bold mb-8">My Academic Journey</h1>
        <div className="space-y-8">
                     {/* First Charts Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BarChart2 size={20} />
                                    Session Topics Breakdown
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie data={sessionReasonData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                                            {sessionReasonData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                        </Pie>
                                        <Tooltip/>
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                        
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <TrendingUp size={20} />
                                    Sessions Per Month
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={sessionsPerMonth}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name"/>
                                        <YAxis/>
                                        <Tooltip/>
                                        <Bar dataKey="sessions" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Second Charts Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BarChart2 size={20} />
                                    Session Status Distribution
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie data={sessionStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                                            {sessionStatusData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                        </Pie>
                                        <Tooltip/>
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                        
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <TrendingUp size={20} />
                                    Weekly Session Activity
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={sessionsPerWeek}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name"/>
                                        <YAxis/>
                                        <Tooltip/>
                                        <Line type="monotone" dataKey="sessions" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ fill: 'hsl(var(--primary))' }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Third Charts Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Target size={20} />
                                    Session Performance Metrics
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={performanceData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="session"/>
                                        <YAxis/>
                                        <Tooltip/>
                                        <Bar dataKey="satisfaction" fill="#10b981" name="Satisfaction (1-5)" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="progress" fill="#0ea5e9" name="Progress %" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                        
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BarChart2 size={20} />
                                    Advisor Interaction Frequency
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={sessions.slice(0, 5).map(s => ({ name: s.advisor_name.split(' ')[0], sessions: Math.floor(Math.random() * 8) + 1 }))}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name"/>
                                        <YAxis/>
                                        <Tooltip/>
                                        <Bar dataKey="sessions" fill="hsl(var(--accent-foreground))" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Timeline and AI Insights Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar size={20} />
                                    Your Advising Timeline
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {timelineData.map((item, index) => (
                                        <div key={index} className="flex items-start gap-4 pb-4 border-b last:border-b-0">
                                            <div className="w-3 h-3 rounded-full bg-primary mt-2 flex-shrink-0" />
                                            <div className="flex-1">
                                                <p className="font-medium">{item.event}</p>
                                                <p className="text-sm text-muted-foreground">{item.type}</p>
                                                <p className="text-xs text-muted-foreground">{item.date}</p>
                                                <Badge variant="outline" className="mt-1">{item.status}</Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Lightbulb size={20} />
                                    AI Actionable Insights
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {aiInsights.map((insight, index) => (
                                        <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-accent/50">
                                            <Target size={16} className="text-primary mt-0.5 flex-shrink-0" />
                                            <p className="text-sm">{insight}</p>
                                        </div>
                                    ))}
                                    {sessions.length === 0 && (
                                        <p className="text-center text-muted-foreground py-4">
                                            Complete more sessions to receive personalized insights.
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
        
        {/* Show message if no sessions */}
        {sessions.length === 0 && (
            <Card><CardContent className="text-center text-muted-foreground py-16">No data to display analytics. Complete a session to see your journey.</CardContent></Card>
        )}
    </>;
  }
  
  function MyAdvisorSection() {
     if (!primaryAdvisor) return <><h1 className="text-3xl font-bold mb-8">My Advisor</h1><Card><CardContent className="p-6 text-center text-muted-foreground">Your primary advisor has not been assigned.</CardContent></Card></>
     return <><h1 className="text-3xl font-bold mb-8">My Advisor</h1>
      <Card><CardHeader><CardTitle>{primaryAdvisor.fullName}</CardTitle></CardHeader>
          <CardContent><p><strong>Email:</strong> {primaryAdvisor.email}</p><p><strong>Office:</strong> {primaryAdvisor.office || 'TBA'}</p></CardContent>
      </Card>
     </>
  }

  function ResourceHubSection() {
    return (
      <>
        <h1 className="text-3xl font-bold mb-8">Resource Hub</h1>
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            Resource hub coming soon.
          </CardContent>
        </Card>
      </>
    );
  }

  function GoalTrackerSection() {
     return <><h1 className="text-3xl font-bold mb-8">Goal Tracker</h1>
      <Card><CardContent className="p-6">
          <div className="flex gap-2 mb-4">
              <Input value={newGoal} onChange={(e) => setNewGoal(e.target.value)} placeholder="Add a new goal..." onKeyPress={(e) => e.key === 'Enter' && addGoal()} />
              <Button onClick={addGoal}>Add Goal</Button>
          </div>
          <div className="space-y-2">
              {goals.map(goal => <div key={goal.id} className="flex items-center gap-3 p-2 rounded hover:bg-accent"><button onClick={() => toggleGoal(goal.id, goal.completed)}>{goal.completed ? <CheckSquare className="text-green-500"/> : <Square/>}</button><span className={goal.completed ? 'line-through text-muted-foreground' : ''}>{goal.text}</span><button onClick={() => deleteGoal(goal.id)} className="ml-auto text-muted-foreground hover:text-red-500"><Trash2 size={16}/></button></div>)}
              {goals.length === 0 && <p className="text-muted-foreground text-center pt-4">No goals set yet. Add one to get started!</p>}
          </div>
      </CardContent></Card>
     </>
  }
  
  function NotificationsSection() {
    return <><h1 className="text-3xl font-bold mb-8">Notifications</h1><Card><CardContent className="p-6 text-center text-muted-foreground">You have no new notifications.</CardContent></Card></>;
  }

  function SettingsSection() {
    const [emailReminders, setEmailReminders] = useState(true);
    const [pushNotifications, setPushNotifications] = useState(false);
    const [autoConfirmSessions, setAutoConfirmSessions] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState('English');

    return <>
        <h1 className="text-3xl font-bold mb-8">Settings</h1>
        <div className="grid gap-6 md:grid-cols-2">
            <Card>
                <CardHeader><CardTitle>Appearance</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <p className="text-sm mb-2 text-muted-foreground">Theme</p>
                        <div className="flex gap-2">
                            <Button variant="default">Light</Button>
                            <Button variant="outline">Dark</Button>
                            <Button variant="outline">System</Button>
                        </div>
                    </div>
                    <div>
                        <p className="text-sm mb-2 text-muted-foreground">Language</p>
                        <select 
                          value={selectedLanguage} 
                          onChange={(e) => setSelectedLanguage(e.target.value)}
                          className="w-full p-2 border rounded-md bg-background"
                        >
                            <option value="English">English</option>
                            <option value="Afrikaans">Afrikaans</option>
                            <option value="Zulu">Zulu</option>
                        </select>
                    </div>
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader><CardTitle>Notification Preferences</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <label className="font-medium">Email Reminders</label>
                            <p className="text-sm text-muted-foreground">Get session reminders via email</p>
                        </div>
                        <Button 
                          variant={emailReminders ? "default" : "outline"} 
                          size="sm"
                          onClick={() => setEmailReminders(!emailReminders)}
                        >
                          {emailReminders ? 'On' : 'Off'}
                        </Button>
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <label className="font-medium">Push Notifications</label>
                            <p className="text-sm text-muted-foreground">Receive browser notifications</p>
                        </div>
                        <Button 
                          variant={pushNotifications ? "default" : "outline"} 
                          size="sm"
                          onClick={() => setPushNotifications(!pushNotifications)}
                        >
                          {pushNotifications ? 'On' : 'Off'}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader><CardTitle>Session Preferences</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <label className="font-medium">Auto-confirm Sessions</label>
                            <p className="text-sm text-muted-foreground">Automatically confirm session bookings</p>
                        </div>
                        <Button 
                          variant={autoConfirmSessions ? "default" : "outline"} 
                          size="sm"
                          onClick={() => setAutoConfirmSessions(!autoConfirmSessions)}
                        >
                          {autoConfirmSessions ? 'On' : 'Off'}
                        </Button>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-muted-foreground">Default Session Duration</label>
                        <select className="w-full p-2 border rounded-md bg-background mt-1">
                            <option value="30">30 minutes</option>
                            <option value="45">45 minutes</option>
                            <option value="60" selected>60 minutes</option>
                        </select>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader><CardTitle>Privacy & Data</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <Button variant="outline" className="w-full">
                        <Download size={16} className="mr-2" />
                        Export My Data
                    </Button>
                    <Button variant="outline" className="w-full">
                        Delete Account
                    </Button>
                    <p className="text-xs text-muted-foreground">
                        Account deletion is permanent and cannot be undone.
                    </p>
                </CardContent>
            </Card>
        </div>
    </>;
  }
  
};

export default StudentDashboard;
