import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { db, storage } from '@/lib/firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, getDoc, setDoc, addDoc, deleteDoc } from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Home, BarChart2, Bell, User, Calendar, Clock, ChevronRight, ChevronLeft, LogOut, CheckCircle, MessageSquare, UserCheck, Search, FileText, Send, Camera, Edit, Trash2, Book, FileUp, GanttChartSquare } from 'lucide-react';
import { format, isToday, isThisWeek, isFuture } from 'date-fns';
import SessionCompletionEvaluation from '@/components/SessionCompletionEvaluation';
import LogoutConfirmation from '@/components/LogoutConfirmation';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import FooterSmall from '@/components/FooterSmall';

// --- INTERFACES & TYPES ---
interface Session {
  id: string;
  student_id: string;
  student_name: string;
  advisor_id: string;
  session_date: { toDate: () => Date };
  status: 'Pending' | 'Confirmed' | 'Completed' | 'To Complete' | 'Cancelled' | 'No-Show';
  session_details: { reasons: string[] };
}

interface Advisee {
    id: string;
    Name: string;
    Surname: string;
    email: string;
    photoURL?: string;
    faculty?: string;
}

interface BlockedTimeSlot {
    id: string;
    date: string;
    startTime: string;
    endTime: string;
    reason: string;
    reasonDetails?: string;
}

const AdvisorDashboard = () => {
  const { user, logout } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Data States
  const [sessions, setSessions] = useState<Session[]>([]);
  const [advisees, setAdvisees] = useState<Advisee[]>([]);
  const [loading, setLoading] = useState(true);
  
  // UI States
  const [evaluationSession, setEvaluationSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState({
    name: '',
    email: user?.email || '',
    avatar: '',
  });

  useEffect(() => {
    if (user) {
      setUserProfile({
        name: `${user.Name} ${user.Surname}`,
        email: user.email,
        avatar: `https://placehold.co/100x100/d38c05/ffffff?text=${user.Name.charAt(0)}`,
      });
    }
  }, [user]);

  // Firestore Data Fetching
  useEffect(() => {
    if (!user?.uuid) { setLoading(false); return; }
    setLoading(true);

    const sessionsQuery = query(collection(db, "sessions"), where("advisor_id", "==", user.uuid));
    const adviseesQuery = query(collection(db, "users"), where("primaryAdvisorId", "==", user.uuid));

    const unsubSessions = onSnapshot(sessionsQuery, snap => setSessions(snap.docs.map(d => ({ id: d.id, ...d.data() } as Session))));
    const unsubAdvisees = onSnapshot(adviseesQuery, snap => setAdvisees(snap.docs.map(d => ({ id: d.id, ...d.data() } as Advisee))));
    
    setTimeout(() => setLoading(false), 1200);

    return () => { unsubSessions(); unsubAdvisees(); };
  }, [user?.uuid]);
  
  // --- DERIVED DATA & KPIS ---
  const todaysSessions = useMemo(() => sessions.filter(s => ['Pending', 'Confirmed'].includes(s.status) && isToday(s.session_date.toDate())), [sessions]);
  const sessionsToComplete = useMemo(() => sessions.filter(s => s.status === 'To Complete'), [sessions]);
  const studentsToSeeThisWeek = useMemo(() => new Set(sessions.filter(s => ['Pending', 'Confirmed'].includes(s.status) && isThisWeek(s.session_date.toDate(), { weekStartsOn: 1 })).map(s => s.student_name)).size, [sessions]);
    
  if (loading || !user) {
    return <div className="flex h-screen items-center justify-center">Loading Advisor Dashboard...</div>;
  }

  // --- RENDER ---
  return (
    <div className="flex h-screen bg-background font-sans">
      <Sidebar />
      <div className={`flex flex-col flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <div className="flex-1 overflow-y-auto">
            <main className="p-8">
                {activeSection === 'dashboard' && <MainDashboardView />}
                {activeSection === 'sessions-students' && <SessionsStudentsSection />}
                {activeSection === 'analytics' && <AnalyticsSection />}
                {activeSection === 'availability' && <AvailabilitySection />}
                {activeSection === 'notifications' && <NotificationsSection />}
                {activeSection === 'broadcast' && <BroadcastMessagingSection />}
                {activeSection === 'resources' && <SharedResourcesSection />}
            </main>
        </div>
        <FooterSmall />
      </div>
      
      {evaluationSession && <SessionCompletionEvaluation open={!!evaluationSession} onOpenChange={() => setEvaluationSession(null)} session={evaluationSession} onComplete={() => toast.success("Evaluation submitted!")} />}
    </div>
  );
  
  // --- SUB-COMPONENTS ---
  function Sidebar() {
    return (
        <div className={`flex flex-col h-full bg-card text-card-foreground transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'} p-4 shadow-lg border-r fixed left-0 top-0 z-40`}>
          <div className="flex items-center justify-between mb-8">
            {isSidebarOpen && (
                <ProfileModal>
                    <div className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-accent">
                        <img src={userProfile.avatar} alt="Advisor Avatar" className="w-10 h-10 rounded-full border-2 border-primary"/>
                        <div>
                            <p className="font-semibold">{`Dr. ${user.Surname}`}</p>
                            <p className="text-xs text-muted-foreground">Advisor</p>
                        </div>
                    </div>
                </ProfileModal>
            )}
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 rounded-full hover:bg-accent"><ChevronLeft size={20} /></button>
          </div>
          <nav className="flex-grow">
            <ul>
                <SidebarItem icon={<Home size={20} />} text="Dashboard" isActive={activeSection === 'dashboard'} onClick={() => setActiveSection('dashboard')} />
                <SidebarItem icon={<Calendar size={20} />} text="Sessions & Students" isActive={activeSection === 'sessions-students'} onClick={() => setActiveSection('sessions-students')} />
                <SidebarItem icon={<BarChart2 size={20} />} text="Advising Insights" isActive={activeSection === 'analytics'} onClick={() => setActiveSection('analytics')} />
                <SidebarItem icon={<Clock size={20} />} text="Availability" isActive={activeSection === 'availability'} onClick={() => setActiveSection('availability')} />
                <SidebarItem icon={<Bell size={20} />} text="Notifications" isActive={activeSection === 'notifications'} onClick={() => setActiveSection('notifications')} />
                <SidebarItem icon={<Send size={20} />} text="Broadcast Message" isActive={activeSection === 'broadcast'} onClick={() => setActiveSection('broadcast')} />
                <SidebarItem icon={<Book size={20} />} text="Shared Resources" isActive={activeSection === 'resources'} onClick={() => setActiveSection('resources')} />
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

  function ProfileModal({ children }: { children: React.ReactNode }) { /* ... */ return <Dialog><DialogTrigger asChild>{children}</DialogTrigger><DialogContent>Profile</DialogContent></Dialog>; }
  function SidebarItem({ icon, text, isActive, onClick }: any) { /* ... */ return <li className="mb-2"><button onClick={onClick} className={`flex items-center w-full p-3 rounded-lg transition-colors duration-200 ${isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'} ${isSidebarOpen ? '' : 'justify-center'}`}>{icon} {isSidebarOpen && <span className="ml-3">{text}</span>}</button></li>; }
  
  function MainDashboardView() {
    return (
        <>
            <header className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Good morning, Dr. {user.Surname}.</h1>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => setActiveSection('availability')}><Clock className="mr-2 h-4 w-4"/> Manage Availability</Button>
                    <Button onClick={() => setActiveSection('sessions-students')}><Calendar className="mr-2 h-4 w-4"/>View Full Calendar</Button>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <InsightCard title="Students to See This Week" value={studentsToSeeThisWeek} />
                <InsightCard title="Pending Evaluations" value={sessionsToComplete.length} />
                <InsightCard title="Total Advisees" value={advisees.length} />
                <InsightCard title="Available Slots (Next 7 Days)" value={"N/A"} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card>
                    <CardHeader><CardTitle>Today's Schedule</CardTitle></CardHeader>
                    <CardContent>
                        {todaysSessions.length > 0 ? todaysSessions.slice(0, 3).map(s => <div key={s.id} className="mb-2 p-2 rounded-md bg-accent">{s.student_name} at {format(s.session_date.toDate(), 'p')}</div>) : <p className="text-muted-foreground">No sessions scheduled for today.</p>}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle>Pending Requests</CardTitle></CardHeader>
                    <CardContent>
                        {sessionsToComplete.length > 0 ? sessionsToComplete.slice(0,3).map(s => <div key={s.id} className="mb-2 p-2 rounded-md bg-amber-100 flex justify-between items-center"><span>{s.student_name}</span> <Button size="sm" onClick={() => setEvaluationSession(s)}>Evaluate</Button></div>) : <p className="text-muted-foreground">No sessions are pending evaluation.</p>}
                    </CardContent>
                </Card>
            </div>
        </>
    );
  }

  function InsightCard({ title, value }: { title: string, value: string | number }) { /* ... */ return (<Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">{title}</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{value}</div></CardContent></Card>); }

  function SessionsStudentsSection() {
    const [activeTab, setActiveTab] = useState('upcoming');
    const upcoming = useMemo(() => sessions.filter(s => ['Pending', 'Confirmed'].includes(s.status)), [sessions]);
    const toComplete = useMemo(() => sessions.filter(s => s.status === 'To Complete'), [sessions]);
    const past = useMemo(() => sessions.filter(s => ['Completed', 'Cancelled', 'No-Show'].includes(s.status)), [sessions]);
    
    return <>
        <header className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Sessions & Students</h1>
        </header>
        <div className="flex gap-2 mb-4 border-b">
            <TabButton title="Upcoming" count={upcoming.length} isActive={activeTab === 'upcoming'} onClick={() => setActiveTab('upcoming')} />
            <TabButton title="To Complete" count={toComplete.length} isActive={activeTab === 'to-complete'} onClick={() => setActiveTab('to-complete')} />
            <TabButton title="Past" count={past.length} isActive={activeTab === 'past'} onClick={() => setActiveTab('past')} />
        </div>
        <Card>
            <CardContent className="pt-6">
                <p>Session list for "{activeTab}" will be displayed here.</p>
            </CardContent>
        </Card>
    </>
  }

  function TabButton({ title, count, isActive, onClick }: any) { /* ... */ return ( <button onClick={onClick} className={`py-2 px-4 text-sm font-medium border-b-2 ${isActive ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}> {title} <Badge variant={isActive ? "default" : "secondary"}>{count}</Badge> </button> ); }
  
  function AnalyticsSection() {
    return <>
        <h1 className="text-3xl font-bold mb-8">Advising Insights</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
                <CardHeader><CardTitle>Most Common Session Topics</CardTitle></CardHeader>
                <CardContent className="h-[300px]">
                    <div className="flex items-center justify-center h-full text-muted-foreground">No session data available to generate chart.</div>
                </CardContent>
            </Card>
             <Card>
                <CardHeader><CardTitle>Student Breakdown by Faculty</CardTitle></CardHeader>
                <CardContent className="h-[300px]">
                     <div className="flex items-center justify-center h-full text-muted-foreground">No advisee data available to generate chart.</div>
                </CardContent>
            </Card>
            <Card className="lg:col-span-2">
                <CardHeader><CardTitle>Session Load Over Time</CardTitle></CardHeader>
                 <CardContent className="h-[300px]">
                     <div className="flex items-center justify-center h-full text-muted-foreground">No session data available to generate chart.</div>
                </CardContent>
            </Card>
        </div>
    </>;
  }
  
  function AvailabilitySection() {
    const [blockedSlots, setBlockedSlots] = useState<BlockedTimeSlot[]>([]);
    const [newSlot, setNewSlot] = useState({ date: '', startTime: '', endTime: '', reason: '', reasonDetails: '' });
    
    useEffect(() => {
        if(!user?.uuid) return;
        const blockedSlotsRef = collection(db, 'advisor_availability', user.uuid, 'blockedTimeSlots');
        const unsub = onSnapshot(blockedSlotsRef, (snapshot) => {
            setBlockedSlots(snapshot.docs.map(d => ({id: d.id, ...d.data()} as BlockedTimeSlot)));
        });
        return () => unsub();
    }, [user?.uuid]);

    const addBlockedSlot = async () => {
        if (!user?.uuid || !newSlot.date || !newSlot.startTime || !newSlot.endTime || !newSlot.reason) {
            toast.error("Please fill all fields for the time slot.");
            return;
        }
        if (newSlot.reason === 'Other' && !newSlot.reasonDetails) {
            toast.error("Please specify a reason for 'Other'.");
            return;
        }
        try {
            await addDoc(collection(db, 'advisor_availability', user.uuid, 'blockedTimeSlots'), newSlot);
            setNewSlot({ date: '', startTime: '', endTime: '', reason: '', reasonDetails: '' });
            toast.success("Time slot blocked successfully!");
        } catch (error) {
            toast.error("Failed to block time slot.");
        }
    };

    const deleteBlockedSlot = async (id: string) => {
        if (!user?.uuid) return;
        try {
            await deleteDoc(doc(db, 'advisor_availability', user.uuid, 'blockedTimeSlots', id));
            toast.success("Blocked slot removed.");
        } catch (error) {
            toast.error("Failed to remove blocked slot.");
        }
    };

    return (
        <>
            <h1 className="text-3xl font-bold mb-8">Manage Availability</h1>
            <Card>
                <CardHeader><CardTitle>Block Off Specific Time Slots</CardTitle></CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Input type="date" value={newSlot.date} onChange={e => setNewSlot({...newSlot, date: e.target.value})} />
                            <Input type="time" value={newSlot.startTime} onChange={e => setNewSlot({...newSlot, startTime: e.target.value})} />
                            <Input type="time" value={newSlot.endTime} onChange={e => setNewSlot({...newSlot, endTime: e.target.value})} />
                        </div>
                        <Select onValueChange={(value) => setNewSlot({...newSlot, reason: value})}>
                            <SelectTrigger><SelectValue placeholder="Select a reason..." /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Meeting">Meeting</SelectItem>
                                <SelectItem value="Lunch">Lunch</SelectItem>
                                <SelectItem value="Leave">Leave</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                        {newSlot.reason === 'Other' && (
                            <Input placeholder="Please specify reason" value={newSlot.reasonDetails} onChange={e => setNewSlot({...newSlot, reasonDetails: e.target.value})} />
                        )}
                        <Button onClick={addBlockedSlot}>Block Time Slot</Button>
                    </div>
                    <div className="mt-6 space-y-2">
                        <h3 className="font-semibold">Currently Blocked Slots</h3>
                        {blockedSlots.length > 0 ? blockedSlots.map(b => (
                            <div key={b.id} className="flex justify-between items-center p-2 bg-muted rounded-md">
                                <div>
                                    <p>{format(new Date(b.date), 'PPP')} from {b.startTime} to {b.endTime}</p>
                                    <p className="text-xs text-muted-foreground">{b.reason === 'Other' ? b.reasonDetails : b.reason}</p>
                                </div>
                                <Button size="sm" variant="ghost" onClick={() => deleteBlockedSlot(b.id)}><Trash2 className="h-4 w-4"/></Button>
                            </div>
                        )) : <p className="text-sm text-muted-foreground">No specific time slots are currently blocked.</p>}
                    </div>
                </CardContent>
            </Card>
        </>
    );
  }

  function NotificationsSection() {
      return <>
        <h1 className="text-3xl font-bold mb-8">Notifications</h1>
        <Card>
            <CardContent className="pt-6">
                <div className="text-center text-muted-foreground py-12">You have no new notifications.</div>
            </CardContent>
        </Card>
      </>
  }
  
  function BroadcastMessagingSection() {
      return <>
        <h1 className="text-3xl font-bold mb-8">Broadcast Message</h1>
        <Card>
            <CardHeader><CardTitle>Send a message to all your advisees</CardTitle></CardHeader>
            <CardContent>
                <Textarea placeholder="Type your message here..." className="mb-4" />
                <Button>Send Broadcast</Button>
            </CardContent>
        </Card>
      </>
  }

  function SharedResourcesSection() {
      return <>
        <h1 className="text-3xl font-bold mb-8">Shared Resources</h1>
        <Card>
            <CardHeader><CardTitle>Manage shared resources and templates for students.</CardTitle></CardHeader>
            <CardContent>
                 <div className="text-center text-muted-foreground py-12">No shared resources have been added yet.</div>
            </CardContent>
        </Card>
      </>
  }
};

export default AdvisorDashboard;