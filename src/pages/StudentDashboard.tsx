import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, updateDoc, doc, getDoc, deleteDoc, orderBy } from 'firebase/firestore';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Home, BarChart2, Bell, User, Calendar, Clock, ChevronLeft, ChevronRight, Download, Plus, LogOut, Camera, Link as LinkIcon, Trash2, TrendingUp, Target, Lightbulb, Users, Edit, XCircle, Info, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { format, formatDistanceToNow } from 'date-fns';
import StudentSessionEvaluation from '@/components/StudentSessionEvaluation';
import BookSessionDialog from '@/components/BookSessionDialog';
import LogoutConfirmation from '@/components/LogoutConfirmation';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import FooterSmall from '@/components/FooterSmall';
import StudentProfileModal from '@/components/StudentProfileModal';

// --- INTERFACES ---
interface StudentInfo {
    studentId: string;
    name: string;
    surname: string;
    studentNumber: string;
    email: string;
    course: string;
    faculty: string;
    profileURL: string;
}

interface AdvisorInfo {
    advisorId: string;
    name: string;
    surname: string;
    email: string;
    office: string;
    faculty: string;
}

interface Session {
  id: string;
  studentInfo: StudentInfo;
  advisorInfo: AdvisorInfo;
  sessionDateTime: { toDate: () => Date };
  status: 'Pending' | 'Confirmed' | 'Completed' | 'To Complete' | 'Cancelled';
  sessionType: 'Individual' | 'Group';
  reasons: string[];
  otherReason?: string;
  mode: 'In-person' | 'Online';
  meetLink?: string;
  groupMembers?: { name: string; surname: string; email: string }[];
  referenceCode: string;
  createdAt: any;
}

interface Advisor {
    id: string;
    name: string;
    surname: string;
    email: string;
    office: string;
    faculty: string;
}

interface Notification {
    id: string;
    userId: string;
    message: string;
    timestamp: { toDate: () => Date };
    isRead: boolean;
}

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const [sessions, setSessions] = useState<Session[]>([]);
  const [primaryAdvisor, setPrimaryAdvisor] = useState<Advisor | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [evaluationSession, setEvaluationSession] = useState<Session | null>(null);
  const [showEvaluation, setShowEvaluation] = useState(false);
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [activeSessionTab, setActiveSessionTab] = useState('upcoming');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const SESSIONS_PER_PAGE = 3;

  const [userProfile, setUserProfileState] = useState({
      name: '',
      surname: '',
      email: '',
      studentNumber: '',
      avatar: '',
      course: '',
      faculty:''
  });

  // Fetch real data from Firestore
  useEffect(() => {
    if (!user?.uuid) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const userDocRef = doc(db, "users", user.uuid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          const profileData = {
              name: userData.Name || '',
              surname: userData.Surname || '',
              email: userData.email || '',
              studentNumber: userData.studentNumber || 'N/A',
              avatar: userData.profileURL || `https://placehold.co/100x100/0ea5e9/ffffff?text=${(userData.Name || 'U').charAt(0)}`,
              course: userData.course || 'Course not set',
              faculty: userData.faculty || 'Faculty not set'
          };
          
          let advisorData = null;
          if (userData.primaryAdvisorId) {
              const advisorDocRef = doc(db, "users", userData.primaryAdvisorId);
              const advisorDoc = await getDoc(advisorDocRef);
              if (advisorDoc.exists()) {
                  const ad = advisorDoc.data();
                  advisorData = { 
                      id: advisorDoc.id, 
                      name: ad.Name || 'N/A', 
                      surname: ad.Surname || '',
                      email: ad.email || 'N/A',
                      office: ad.office || 'N/A',
                      faculty: ad.faculty || 'N/A'
                  };
              }
          }
          
          setUserProfileState(profileData);
          setPrimaryAdvisor(advisorData);
        }
      } catch (error) {
        console.error("Error fetching initial data:", error);
        toast.error("Could not load your dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    const sessionsQuery = query(collection(db, "sessions"), where("studentInfo.studentId", "==", user.uuid), orderBy("sessionDateTime", "desc"));
    const unsubscribeSessions = onSnapshot(sessionsQuery, (snapshot) => {
      const userSessions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Session));
      setSessions(userSessions);
    });
    
    const notificationsQuery = query(collection(db, "notifications"), where("userId", "==", user.uuid), orderBy("timestamp", "desc"));
    const unsubscribeNotifications = onSnapshot(notificationsQuery, (snapshot) => {
        const userNotifications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
        setNotifications(userNotifications);
    });

    return () => {
      unsubscribeSessions();
      unsubscribeNotifications();
    };
  }, [user?.uuid]);
  
  // -- DYNAMIC DATA & INSIGHTS -- //
  const upcomingSessions = useMemo(() => sessions.filter(s => ['Pending', 'Confirmed'].includes(s.status)).sort((a,b) => a.sessionDateTime.toDate().getTime() - b.sessionDateTime.toDate().getTime()), [sessions]);
  const pastSessions = useMemo(() => sessions.filter(s => ['Completed', 'Cancelled'].includes(s.status)), [sessions]);
  const toEvaluateSessions = useMemo(() => sessions.filter(s => s.status === 'To Complete'), [sessions]);
  
  const sessionsPerMonth = useMemo(() => {
    if (sessions.length === 0) return [];
    const monthCounts = sessions.reduce((acc, session) => {
      const month = format(session.sessionDateTime.toDate(), 'MMM yyyy');
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(monthCounts).map(([name, sessions]) => ({ name, sessions }));
  }, [sessions]);

  const sessionReasonData = useMemo(() => {
    if (sessions.length === 0) return [];
      const reasonCounts = sessions.reduce((acc, session) => {
          session.reasons.forEach(reason => { acc[reason] = (acc[reason] || 0) + 1; });
          return acc;
      }, {} as Record<string, number>);

      const colors = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#f43f5e', '#14b8a6'];
      return Object.entries(reasonCounts).map(([name, value], index) => ({ name, value, color: colors[index % colors.length] }));
  }, [sessions]);

  // -- HANDLERS -- //
  const handleBookSession = async (sessionData: any) => {
    if (!user || !primaryAdvisor) {
        toast.error("Cannot book session: User or primary advisor information is missing.");
        return;
    }

    try {
        const { selectedDate, selectedTime, selectedReasons, otherReasonText, mode, sessionType, groupMembers, meetLink } = sessionData;

        const sessionDateTime = new Date(selectedDate);
        const [startHour, startMinute] = selectedTime.split(' - ')[0].split(':');
        sessionDateTime.setHours(parseInt(startHour, 10), parseInt(startMinute, 10));

        const newSession = {
            studentInfo: {
                studentId: user.uuid,
                name: userProfile.name,
                surname: userProfile.surname,
                studentNumber: userProfile.studentNumber,
                email: userProfile.email,
                course: userProfile.course,
                faculty: userProfile.faculty,
                profileURL: userProfile.avatar,
            },
            advisorInfo: {
                advisorId: primaryAdvisor.id,
                name: primaryAdvisor.name,
                surname: primaryAdvisor.surname,
                email: primaryAdvisor.email,
                office: primaryAdvisor.office,
                faculty: primaryAdvisor.faculty
            },
            sessionDateTime,
            status: 'Pending',
            sessionType: sessionType === 'individual' ? 'Individual' : 'Group',
            reasons: selectedReasons,
            otherReason: otherReasonText || '',
            mode: mode === 'in-person' ? 'In-person' : 'Online',
            meetLink: meetLink || '',
            groupMembers: groupMembers || [],
            referenceCode: `VUT-${Date.now().toString().slice(-6)}`,
            createdAt: serverTimestamp(),
        };

        await addDoc(collection(db, "sessions"), newSession);
        
        const notificationMessage = `New session booked with ${primaryAdvisor.name} ${primaryAdvisor.surname} on ${format(sessionDateTime, 'PPP')}.`;
        await addDoc(collection(db, "notifications"), {
            userId: user.uuid,
            message: notificationMessage,
            timestamp: serverTimestamp(),
            isRead: false
        });

        await addDoc(collection(db, "notifications"), {
            userId: primaryAdvisor.id,
            message: `New session booked by ${userProfile.name} ${userProfile.surname} on ${format(sessionDateTime, 'PPP')}.`,
            timestamp: serverTimestamp(),
            isRead: false
        });
        
        toast.success("Session booked successfully!");
        setShowBookingDialog(false);

    } catch (error) {
        console.error("Error booking session:", error);
        toast.error("Failed to book session. Please try again.");
    }
  };

  const handleCancelSession = async (sessionId: string) => {
    if(window.confirm("Are you sure you want to cancel this session? This action cannot be undone.")) {
        const sessionRef = doc(db, "sessions", sessionId);
        try {
            await updateDoc(sessionRef, { status: 'Cancelled' });
            toast.success("Your session has been cancelled.");
        } catch (error) {
            console.error("Error cancelling session:", error);
            toast.error("Failed to cancel session. Please try again.");
        }
    }
  };
  
  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newAvatar = e.target?.result as string;
        setUserProfileState(prev => ({ ...prev, avatar: newAvatar }));
        toast.success("Avatar preview updated. Save changes to apply.");
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading || !user) {
    return <div className="flex h-screen items-center justify-center text-lg">Loading Dashboard...</div>;
  }

  // --- RENDER ---
  return (
    <div className="flex flex-col min-h-screen bg-background font-sans">
      <div className="flex flex-1">
        <Sidebar />
        <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
            <main className="p-4 sm:p-8">
                {renderActiveSection()}
            </main>
        </div>
      </div>
      <div className={`transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <FooterSmall/>
      </div>
      
      <BookSessionDialog 
        open={showBookingDialog} 
        onOpenChange={setShowBookingDialog} 
        onBookSession={handleBookSession} 
        advisors={primaryAdvisor ? [primaryAdvisor] : []} 
        bookedSlots={[]} 
      />
      {showEvaluation && evaluationSession && <StudentSessionEvaluation isOpen={showEvaluation} session={evaluationSession} onClose={() => setShowEvaluation(false)} onSubmit={() => {}} />}
      <StudentProfileModal 
        isOpen={showProfileModal} 
        onClose={() => setShowProfileModal(false)} 
        userProfile={userProfile}
        onAvatarChange={handleAvatarChange}
      />
    </div>
  );

  function renderActiveSection() {
    switch(activeSection) {
      case 'dashboard': return <MainDashboardView />;
      case 'my-sessions': return <MySessionsSection />;
      case 'analytics': return <AnalyticsSection />;
      case 'my-advisor': return <MyAdvisorSection />;
      case 'resource-hub': return <ResourceHubSection />;
      case 'notifications': return <NotificationsSection />;
      default: return <MainDashboardView />;
    }
  }

  // --- SUB-COMPONENTS ---
  function Sidebar() {
    return (
        <div className={`flex flex-col bg-card text-card-foreground transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'} p-4 shadow-lg border-r fixed left-0 top-0 bottom-0 z-40 overflow-y-auto`}>
            <div className="flex items-center justify-between mb-8">
                {isSidebarOpen && (
                    <div 
                        className="flex items-center gap-3 p-1 rounded-lg hover:bg-accent transition-colors duration-200 cursor-pointer"
                        onClick={() => setShowProfileModal(true)}
                    >
                        <div className="relative group">
                            <img 
                                src={userProfile.avatar} 
                                alt="User Avatar" 
                                className="w-10 h-10 rounded-full border-2 border-primary"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <User size={16} className="text-white"/>
                            </div>
                        </div>
                        <span className="text-lg font-semibold truncate">{userProfile.name} {userProfile.surname}</span>
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
    const recentNotifications = notifications.slice(0, 3);
    return (
        <>
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <h1 className="text-3xl font-bold">Welcome back, {userProfile.name}!</h1>
                <Button onClick={() => setShowBookingDialog(true)} size="lg" className="shadow-lg w-full sm:w-auto"><Plus size={16} className="mr-2"/> Book a New Session</Button>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <InsightCard title="Total Sessions" value={sessions.length} />
                <InsightCard title="Upcoming" value={upcomingSessions.length} />
                <InsightCard title="Completed" value={pastSessions.length} />
                <InsightCard title="To Evaluate" value={toEvaluateSessions.length} />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveSection('notifications')}>
                    <CardHeader><CardTitle className="flex items-center gap-2"><Bell size={20} /> Recent Notifications</CardTitle></CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {recentNotifications.length > 0 ? recentNotifications.map(notification => (
                                <div key={notification.id} className="flex items-start gap-3 p-2 rounded-lg">
                                    {!notification.isRead && <div className="w-2 h-2 rounded-full mt-2 bg-primary flex-shrink-0" />}
                                    <div className="flex-1 pl-1">
                                        <p className="text-sm">{notification.message}</p>
                                        <p className="text-xs text-muted-foreground">{formatDistanceToNow(notification.timestamp.toDate(), { addSuffix: true })}</p>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-center text-muted-foreground py-4">No new notifications.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveSection('my-sessions')}>
                    <CardHeader><CardTitle className="flex items-center gap-2"><Calendar size={20} /> Latest Sessions</CardTitle></CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {recentSessions.length > 0 ? recentSessions.map(session => (
                                <div key={session.id} className="flex justify-between items-center p-3 rounded-lg bg-blue-50">
                                    <div>
                                        <p className="font-semibold text-blue-900">{session.advisorInfo.name} {session.advisorInfo.surname}</p>
                                        <p className="text-sm text-slate-600">{format(session.sessionDateTime.toDate(), 'PPP, p')}</p>
                                    </div>
                                    <Badge className="ml-4">{session.status}</Badge>
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

    const sessionsToDisplay = sessionsForTab(activeSessionTab);
    const totalPages = Math.ceil(sessionsToDisplay.length / SESSIONS_PER_PAGE);
    const indexOfLastSession = currentPage * SESSIONS_PER_PAGE;
    const indexOfFirstSession = indexOfLastSession - SESSIONS_PER_PAGE;
    const currentSessions = sessionsToDisplay.slice(indexOfFirstSession, indexOfLastSession);

    useEffect(() => {
        setCurrentPage(1);
    }, [activeSessionTab]);

    return <>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <h1 className="text-3xl font-bold">My Sessions</h1>
            <Button onClick={() => setShowBookingDialog(true)} className="shadow-lg w-full sm:w-auto">
                <Plus size={16} className="mr-2"/> Book Session
            </Button>
        </div>
        <div className="flex gap-2 mb-4 border-b">
            <TabButton title={`Upcoming (${upcomingSessions.length})`} isActive={activeSessionTab === 'upcoming'} onClick={() => setActiveSessionTab('upcoming')} />
            <TabButton title={`To Evaluate (${toEvaluateSessions.length})`} isActive={activeSessionTab === 'to-evaluate'} onClick={() => setActiveSessionTab('to-evaluate')} />
            <TabButton title={`Past (${pastSessions.length})`} isActive={activeSessionTab === 'past'} onClick={() => setActiveSessionTab('past')} />
        </div>
        <div className="space-y-4">
            {currentSessions.length > 0 ? 
                currentSessions.map(s => <SessionCard key={s.id} session={s} />) :
                <Card><CardContent className="p-6 text-center text-muted-foreground">No sessions in this category.</CardContent></Card>
            }
        </div>
        {totalPages > 1 && (
            <div className="flex justify-center items-center mt-6">
                <Button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} variant="outline">
                    <ChevronLeft size={16} className="mr-2" /> Previous
                </Button>
                <span className="mx-4 text-sm font-medium">Page {currentPage} of {totalPages}</span>
                <Button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} variant="outline">
                    Next <ChevronRight size={16} className="ml-2" />
                </Button>
            </div>
        )}
    </>;
  }
  
  function TabButton({ title, isActive, onClick}: any) {
    return <button onClick={onClick} className={`py-2 px-4 text-sm font-medium ${isActive ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'}`}>{title}</button>
  }
  
  function SessionCard({ session }: { session: Session }) { 
    const isGroup = session.sessionType === 'Group';
    const displayReasons = session.reasons.map(r => r === 'Other' ? session.otherReason || 'Other' : r).join(', ');

    const statusStyles: { [key: string]: { bg: string, text: string, border: string } } = {
        Pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300' },
        Confirmed: { bg: 'bg-sky-100', text: 'text-sky-800', border: 'border-sky-300' },
        Completed: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300' },
        Cancelled: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300' },
        'To Complete': { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-300' },
    };
    
    const currentStatusStyle = statusStyles[session.status] || { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-300' };

    return (
        <Card>
            <CardContent className="p-0">
                <div className="p-4 bg-slate-50 rounded-t-lg flex justify-between items-start">
                    <div>
                        <p className="font-bold text-lg text-slate-800">{session.advisorInfo.name} {session.advisorInfo.surname}</p>
                        <p className="text-xs text-slate-500">Ref: {session.referenceCode}</p>
                    </div>
                    <div className="text-sm text-right">
                        <p className="font-semibold text-slate-700">{format(session.sessionDateTime.toDate(), 'MMMM d, yyyy')}</p>
                        <p className="text-slate-500">{format(session.sessionDateTime.toDate(), 'p')}</p>
                    </div>
                </div>
                <div className="p-4">
                    <div className="flex justify-between items-end">
                        <div className="text-sm space-y-1">
                            <p><strong className="font-medium text-slate-600">Reason:</strong> {displayReasons}</p>
                            <p><strong className="font-medium text-slate-600">Type:</strong> {session.sessionType} {isGroup && `(${session.groupMembers?.length || 0} members)`}</p>
                             {isGroup && session.groupMembers && (
                                <ul className="pl-5 list-disc text-xs text-slate-500">
                                    {session.groupMembers.map((member, index) => <li key={index}>{member.email}</li>)}
                                </ul>
                            )}
                            <p><strong className="font-medium text-slate-600">Mode:</strong> {session.mode}</p>
                        </div>
                        <div className="text-right">
                            <div className="flex items-center gap-2 mt-4">
                                <span className="text-sm font-medium text-slate-600">Status:</span>
                                <div className={`py-1 px-3 rounded-full text-xs font-semibold border ${currentStatusStyle.bg} ${currentStatusStyle.text} ${currentStatusStyle.border}`}>
                                    {session.status}
                                </div>
                            </div>
                            {(session.status === 'Pending' || session.status === 'Confirmed') && (
                                <div className="flex gap-2 mt-2">
                                    <Button className="bg-slate-600 hover:bg-slate-700 text-white" size="sm" onClick={() => toast.info("Reschedule feature coming soon.")}>
                                        Reschedule
                                    </Button>
                                    <Button className="bg-amber-500 hover:bg-amber-600 text-white" size="sm" onClick={() => handleCancelSession(session.id)}>
                                        Cancel
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
  }

  function AnalyticsSection() {
    return <>
        <h1 className="text-3xl font-bold mb-8">My Academic Journey</h1>
        {sessions.length === 0 ? (
            <Card><CardContent className="text-center text-muted-foreground py-16">No data to display analytics. Complete a session to see your journey.</CardContent></Card>
        ) : (
            <div className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <Card>
                        <CardHeader><CardTitle className="flex items-center gap-2"><BarChart2 size={20} /> Session Topics Breakdown</CardTitle></CardHeader>
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
                        <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp size={20} /> Sessions Per Month</CardTitle></CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={sessionsPerMonth}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name"/>
                                    <YAxis allowDecimals={false} />
                                    <Tooltip/>
                                    <Bar dataKey="sessions" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>
            </div>
        )}
    </>;
  }
  
  function MyAdvisorSection() {
     if (!primaryAdvisor) return (
       <>
         <h1 className="text-3xl font-bold mb-8">My Advisor</h1>
         <Card>
           <CardContent className="p-6 text-center text-muted-foreground">
             Your primary advisor has not been assigned.
           </CardContent>
         </Card>
       </>
     );
     
     return (
       <>
         <h1 className="text-3xl font-bold mb-8">My Advisor</h1>
         <Card>
            <CardContent className="p-6 flex items-center gap-6">
                <img 
                    src={`https://placehold.co/100x100/1e40af/ffffff?text=${(primaryAdvisor.name || 'A').charAt(0)}`} 
                    alt="Advisor Avatar" 
                    className="w-24 h-24 rounded-full border-4 border-primary/20"
                />
                <div>
                    <h2 className="text-2xl font-bold">{primaryAdvisor.name} {primaryAdvisor.surname}</h2>
                    <p className="text-muted-foreground">{primaryAdvisor.faculty}</p>
                    <div className="mt-4 space-y-2">
                        <p><strong>Email:</strong> {primaryAdvisor.email}</p>
                        <p><strong>Office:</strong> {primaryAdvisor.office}</p>
                    </div>
                </div>
            </CardContent>
         </Card>
       </>
     );
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
  
  function NotificationsSection() {
    return (
      <>
        <h1 className="text-3xl font-bold mb-8">Notifications</h1>
        <Card>
            <CardContent className="p-6">
                <div className="space-y-4">
                    {notifications.length > 0 ? notifications.map(notification => (
                        <div key={notification.id} className="flex items-start gap-4 border-b pb-4 last:border-b-0 last:pb-0">
                            {!notification.isRead && <div className="w-2.5 h-2.5 rounded-full mt-1.5 bg-primary flex-shrink-0" />}
                            <div className={`flex-1 ${notification.isRead ? 'pl-6' : ''}`}>
                                <p className="text-sm">{notification.message}</p>
                                <p className="text-xs text-muted-foreground">{formatDistanceToNow(notification.timestamp.toDate(), { addSuffix: true })}</p>
                            </div>
                        </div>
                    )) : (
                        <p className="text-center text-muted-foreground py-8">You have no new notifications.</p>
                    )}
                </div>
            </CardContent>
        </Card>
      </>
    );
  }
};

export default StudentDashboard;