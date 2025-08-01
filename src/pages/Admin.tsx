import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Users, UserCheck, Calendar, BarChart3, Settings, Search, Edit, Trash2, Mail, ChevronLeft, LogOut, Home, AlertTriangle, Clock, PieChart as PieChartIcon, LineChart as LineChartIcon, Send } from 'lucide-react';
import LogoutConfirmation from '@/components/LogoutConfirmation';
import FooterSmall from '@/components/FooterSmall';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import { format, startOfMonth, isWithinInterval } from 'date-fns';

// --- INTERFACES ---
interface User {
  id: string;
  Name: string;
  Surname: string;
  email: string;
  role: 'student' | 'advisor' | 'admin';
  faculty?: string;
  primaryAdvisorId?: string;
  course?: string;
}

interface Session {
  id: string;
  student_id: string;
  student_name: string;
  advisor_id: string;
  session_date: { toDate: () => Date };
  status: 'Pending' | 'Confirmed' | 'Completed' | 'To Complete' | 'Cancelled' | 'No-Show';
  session_details: { reasons: string[], mode: 'Online' | 'In-person', sessionType: 'Individual' | 'Group' };
}

// --- MAIN COMPONENT ---
const AdminPage = () => {
  const { user, logout } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const [users, setUsers] = useState<User[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uuid) { setLoading(false); return; }
    setLoading(true);

    const unsubUsers = onSnapshot(collection(db, "users"), snap => setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() } as User))));
    const unsubSessions = onSnapshot(collection(db, "sessions"), snap => setSessions(snap.docs.map(d => ({ id: d.id, ...d.data() } as Session))));
    
    setTimeout(() => setLoading(false), 800);
    return () => { unsubUsers(); unsubSessions(); };
  }, [user?.uuid]);

  if (loading || !user) {
    return <div className="flex h-screen items-center justify-center">Loading Admin Dashboard...</div>;
  }

  if (user.role !== 'admin') {
    return (
        <div className="flex h-screen items-center justify-center">
            <Card className="w-96 text-center">
                <CardHeader><CardTitle className="text-red-600">Access Denied</CardTitle></CardHeader>
                <CardContent><p>You do not have permission to access this page.</p></CardContent>
            </Card>
        </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      <Sidebar />
      <div className={`flex flex-col flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <div className="flex-1 overflow-y-auto">
          <main className="p-8">
            {activeSection === 'dashboard' && <SystemInsightsView />}
            {activeSection === 'users' && <UsersManagementView />}
            {activeSection === 'email' && <EmailBroadcastView />}
            {activeSection === 'settings' && <SystemSettings />}
          </main>
        </div>
        <FooterSmall />
      </div>
    </div>
  );

  // --- SUB-COMPONENTS ---
  function Sidebar() {
    return (
      <div className={`flex flex-col h-full bg-card text-card-foreground transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'} p-4 shadow-lg border-r fixed left-0 top-0 z-40`}>
        <div className="flex items-center justify-between mb-8">
          {isSidebarOpen && (
            <div className="flex items-center gap-3 p-2 rounded-lg">
              <img src={`https://placehold.co/100x100/1e40af/ffffff?text=${user.Name.charAt(0)}`} alt="Admin Avatar" className="w-10 h-10 rounded-full border-2 border-primary"/>
              <div>
                <p className="font-semibold">{user.Name} {user.Surname}</p>
                <p className="text-xs text-muted-foreground">Administrator</p>
              </div>
            </div>
          )}
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 rounded-full hover:bg-accent"><ChevronLeft size={20} /></button>
        </div>
        <nav className="flex-grow">
          <ul>
            <SidebarItem icon={<Home size={20} />} text="System Insights" isActive={activeSection === 'dashboard'} onClick={() => setActiveSection('dashboard')} />
            <SidebarItem icon={<Users size={20} />} text="User Management" isActive={activeSection === 'users'} onClick={() => setActiveSection('users')} />
            <SidebarItem icon={<Mail size={20} />} text="Email Broadcast" isActive={activeSection === 'email'} onClick={() => setActiveSection('email')} />
            <SidebarItem icon={<Settings size={20} />} text="System Settings" isActive={activeSection === 'settings'} onClick={() => setActiveSection('settings')} />
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

  function SystemInsightsView() {
    const kpis = useMemo(() => {
        const activeStudentIds = new Set(sessions.map(s => s.student_id));
        const now = new Date();
        const monthStart = startOfMonth(now);
        const sessionsThisMonth = sessions.filter(s => isWithinInterval(s.session_date.toDate(), { start: monthStart, end: now })).length;

        return {
            totalActiveStudents: `${activeStudentIds.size} / ${users.filter(u => u.role === 'student').length}`,
            totalSessionsThisMonth: sessionsThisMonth,
            systemUptime: "99.9%", // Mock data
            avgBookingTime: "3.5 min", // Mock data
        };
    }, [sessions, users]);

    return (
        <>
            <header className="mb-8"><h1 className="text-3xl font-bold">System Insights & Analytics</h1></header>
            
            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">At-a-Glance KPIs</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <KpiCard title="Total Active Students" value={kpis.totalActiveStudents} icon={<UserCheck />} />
                    <KpiCard title="Total Sessions (Month-to-Date)" value={kpis.totalSessionsThisMonth} icon={<Calendar />} />
                    <KpiCard title="System Uptime" value={kpis.systemUptime} icon={<AlertTriangle />} />
                    <KpiCard title="Avg. Booking Time" value={kpis.avgBookingTime} icon={<Clock />} />
                </div>
            </section>

            <section>
                 <h2 className="text-xl font-semibold mb-4">Session Analytics</h2>
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader><CardTitle>Session Type Breakdown</CardTitle></CardHeader>
                        <CardContent className="h-[300px]"><div className="flex items-center justify-center h-full text-muted-foreground">No data available</div></CardContent>
                    </Card>
                     <Card>
                        <CardHeader><CardTitle>Most Common Session Reasons</CardTitle></CardHeader>
                        <CardContent className="h-[300px]"><div className="flex items-center justify-center h-full text-muted-foreground">No data available</div></CardContent>
                    </Card>
                 </div>
            </section>
        </>
    );
  }
  
  function KpiCard({ title, value, icon }: { title: string, value: string | number, icon: React.ReactNode }) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <div className="text-muted-foreground">{icon}</div>
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{value}</div></CardContent>
        </Card>
    );
  }

  function UsersManagementView() { /* ... This can remain similar to your previous implementation ... */ 
      return <div>User Management</div>
  }
  
  function EmailBroadcastView() {
    const [recipients, setRecipients] = useState<string[]>([]);
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');

    const handleSendEmail = () => {
        if(recipients.length === 0 || !subject || !message) {
            toast.error("Please select recipients and fill out all fields.");
            return;
        }
        // In a real app, this would trigger a Firebase Cloud Function
        toast.info(`Simulating email send to ${recipients.length} users.`);
        console.log({recipients, subject, message});
    };

    return (
         <>
            <header className="mb-8"><h1 className="text-3xl font-bold">Email Broadcast</h1></header>
            <Card>
                <CardHeader><CardTitle>Send a message to students or advisors</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <label>Subject</label>
                        <Input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Important Announcement"/>
                    </div>
                     <div>
                        <label>Message</label>
                        <Textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Dear user..."/>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-2">Recipients</h3>
                        <div className="h-64 overflow-y-auto border rounded-md p-2">
                             <Table>
                                <TableHeader><TableRow><TableHead className="w-10"><Checkbox onCheckedChange={(checked) => {
                                    if(checked) setRecipients(users.map(u => u.id)); else setRecipients([]);
                                }} /></TableHead><TableHead>Name</TableHead><TableHead>Role</TableHead></TableRow></TableHeader>
                                <TableBody>
                                    {users.map(u => (
                                        <TableRow key={u.id}>
                                            <TableCell><Checkbox checked={recipients.includes(u.id)} onCheckedChange={(checked) => {
                                                if(checked) setRecipients([...recipients, u.id]); else setRecipients(recipients.filter(r => r !== u.id));
                                            }} /></TableCell>
                                            <TableCell>{u.Name} {u.Surname}</TableCell>
                                            <TableCell><Badge variant="outline">{u.role}</Badge></TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                    <Button onClick={handleSendEmail}><Send className="mr-2 h-4 w-4"/> Send Message</Button>
                </CardContent>
            </Card>
        </>
    );
  }

  function SystemSettings() {
    return (
        <>
            <header className="mb-8"><h1 className="text-3xl font-bold">System Settings</h1></header>
            <Card>
                <CardHeader><CardTitle>General Settings</CardTitle></CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">System-wide settings will be managed here.</p>
                </CardContent>
            </Card>
        </>
    );
  }
};

export default AdminPage;
