import React, { useState, useEffect, useMemo } from "react";
import { Student, Club, CampusBuilding, CampusEvent, CheckIn } from "./types";
import {
  SAMPLE_STUDENTS,
  CAMPUS_BUILDINGS,
  INITIAL_CLUBS,
  INITIAL_EVENTS,
  INITIAL_CHECKINS,
} from "./data";
import CampusMap from "./components/CampusMap";
import EmailModal from "./components/EmailModal";
import {
  Users,
  MapPin,
  Calendar,
  User,
  Clock,
  LogOut,
  Plus,
  Trash2,
  ChevronLeft,
  Mail,
  CheckCircle,
  PlusCircle,
  BookOpen,
  Heart,
  FileText,
  UserCheck,
  Send,
  AlertCircle,
  Sparkles,
  Award,
  ArrowRight,
  Smile,
  BadgeInfo,
  Map,
  Home
} from "lucide-react";

export default function App() {
  // --- KIOSK GLOBAL STATES ---
  const [currentUser, setCurrentUser] = useState<Student | null>(null);
  const [currentScreen, setCurrentScreen] = useState<
    "login" | "home" | "club" | "nearby" | "event" | "profile"
  >("login");
  
  // Stateful listings to allow in-memory persistence during the session
  const [clubs, setClubs] = useState<Club[]>(INITIAL_CLUBS);
  const [events, setEvents] = useState<CampusEvent[]>(INITIAL_EVENTS);
  const [checkIns, setCheckIns] = useState<CheckIn[]>(INITIAL_CHECKINS);
  
  // UI selection states
  const [selectedClubId, setSelectedClubId] = useState<string>("husky-robotics");
  const [selectedEventId, setSelectedEventId] = useState<string>("evt-robotics-bbq");
  const [activeCheckIn, setActiveCheckIn] = useState<CheckIn | null>(null);
  
  // Custom dialogs & modals
  const [emailTargetStudent, setEmailTargetStudent] = useState<Student | null>(null);
  const [inspectingMember, setInspectingMember] = useState<Student | null>(null);

  // Login inputs
  const [netIDInput, setNetIDInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [loginError, setLoginError] = useState("");

  // Check-In Form States
  const [chkBuildingId, setChkBuildingId] = useState("HUB");
  const [chkDuration, setChkDuration] = useState("1 hour");
  const [chkNote, setChkNote] = useState("");

  // Profile Customizer states
  const [newInterestInput, setNewInterestInput] = useState("");
  const [newClassInput, setNewClassInput] = useState("");
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioInput, setBioInput] = useState("");
  const [eventToCancel, setEventToCancel] = useState<CampusEvent | null>(null);

  // Clock state for beautiful, realistic kiosk top-bar
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // --- DERIVED MEMOIZED STATES ---
  const currentClub = useMemo(() => {
    return clubs.find((c) => c.id === selectedClubId) || clubs[0];
  }, [clubs, selectedClubId]);

  const currentEvent = useMemo(() => {
    return events.find((e) => e.id === selectedEventId) || events[0];
  }, [events, selectedEventId]);

  // Handle auto-prefilling on login screen for high-grade testability
  const handleSelectDemoAccount = (netId: string) => {
    setNetIDInput(netId);
    setPasswordInput("••••••••");
    setLoginError("");
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNetID = netIDInput.toLowerCase().trim();
    if (!cleanNetID) {
      setLoginError("Please enter your UW NetID.");
      return;
    }

    // Attempt to locate in sample students
    const student = SAMPLE_STUDENTS[cleanNetID];
    if (student) {
      setCurrentUser(student);
      setCurrentScreen("home");
      setLoginError("");
    } else {
      // Allow dynamic creation of custom student netIDs to let users play freely
      const newCustomStudent: Student = {
        netId: cleanNetID,
        name: cleanNetID.charAt(0).toUpperCase() + cleanNetID.slice(1) + " Husky",
        email: `${cleanNetID}@uw.edu`,
        avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${cleanNetID}`,
        interests: ["CS", "Coffee", "Husky Sports"],
        classes: ["CSE 143 - Java II", "ASTR 101 - Stars"],
        bio: "Newly initialized UW student kiosk profile! Drop me an email!"
      };
      // Save it statefully
      SAMPLE_STUDENTS[cleanNetID] = newCustomStudent;
      setCurrentUser(newCustomStudent);
      setCurrentScreen("home");
      setLoginError("");
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentScreen("login");
    setNetIDInput("");
    setPasswordInput("");
    setActiveCheckIn(null);
    // Remove current user's checkins from dynamic lists
    if (currentUser) {
      setCheckIns(prev => prev.filter(c => c.netId !== currentUser.netId));
    }
  };

  // --- BUSINESS LOGIC ACTIONS ---

  // JOIN A SUGGESTED CLUB statefully
  const handleToggleClubRegistration = (clubId: string) => {
    if (!currentUser) return;
    setClubs((prevClubs) =>
      prevClubs.map((club) => {
        if (club.id === clubId) {
          const isMember = club.members.includes(currentUser.netId);
          let updatedMembers = [...club.members];
          let updatedCount = club.memberCount;
          
          if (isMember) {
            updatedMembers = updatedMembers.filter((id) => id !== currentUser.netId);
            updatedCount = Math.max(0, updatedCount - 1);
          } else {
            updatedMembers.push(currentUser.netId);
            updatedCount += 1;
          }
          
          return {
            ...club,
            members: updatedMembers,
            memberCount: updatedCount,
          };
        }
        return club;
      })
    );
  };

  // EVENT REGISTER / CANCEL Toggle
  const handleToggleEventRegistration = (eventId: string, confirmFirst: boolean = true) => {
    if (!currentUser) return;

    // Find the event to check if already registered
    const targetedEvent = events.find(e => e.id === eventId);
    if (targetedEvent) {
      const isRegistered = targetedEvent.attendees.includes(currentUser.netId);
      if (isRegistered && confirmFirst) {
        setEventToCancel(targetedEvent);
        return;
      }
    }

    setEvents((prevEvents) =>
      prevEvents.map((evt) => {
        if (evt.id === eventId) {
          const isRegistered = evt.attendees.includes(currentUser.netId);
          const updatedAttendees = isRegistered
            ? evt.attendees.filter((id) => id !== currentUser.netId)
            : [...evt.attendees, currentUser.netId];
          return {
            ...evt,
            attendees: updatedAttendees,
          };
        }
        return evt;
      })
    );
  };

  // CREATE LOCATION CHECKIN
  const handleCreateCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    // Grab the club name associated with the student to display in check-ins
    const userClubs = clubs.filter((c) => c.members.includes(currentUser.netId));
    const primaryClubName = userClubs.length > 0 ? userClubs[0].name : "Independent Husky";

    const newCheckIn: CheckIn = {
      id: `chk-user-${Date.now()}`,
      netId: currentUser.netId,
      studentName: currentUser.name,
      studentEmail: currentUser.email,
      studentAvatar: currentUser.avatar,
      clubName: primaryClubName,
      locationId: chkBuildingId,
      timeFrom: currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      stayDuration: chkDuration,
      note: chkNote.trim() || `Studying here in the ${CAMPUS_BUILDINGS.find(b => b.id === chkBuildingId)?.shortName || 'building'}!`,
      checkedInAt: new Date(),
    };

    // Add to state and save active state
    setCheckIns((prev) => [newCheckIn, ...prev.filter((c) => c.netId !== currentUser.netId)]);
    setActiveCheckIn(newCheckIn);
    setChkNote("");
  };

  // CHECKOUT LOCATION
  const handleCheckOut = () => {
    if (!currentUser) return;
    setCheckIns((prev) => prev.filter((c) => c.netId !== currentUser.netId));
    setActiveCheckIn(null);
  };

  // PROFILE MANAGER: Interests
  const handleAddInterest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !newInterestInput.trim()) return;
    const cleanInterest = newInterestInput.trim();
    if (!currentUser.interests.includes(cleanInterest)) {
      const updated = { ...currentUser, interests: [...currentUser.interests, cleanInterest] };
      currentUser.interests.push(cleanInterest); // local sync
      setCurrentUser(updated);
    }
    setNewInterestInput("");
  };

  const handleRemoveInterest = (interest: string) => {
    if (!currentUser) return;
    const updated = {
      ...currentUser,
      interests: currentUser.interests.filter((i) => i !== interest),
    };
    // local sync
    currentUser.interests = currentUser.interests.filter((i) => i !== interest);
    setCurrentUser(updated);
  };

  // PROFILE MANAGER: Classes
  const handleAddClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !newClassInput.trim()) return;
    const cleanClass = newClassInput.trim();
    if (!currentUser.classes.includes(cleanClass)) {
      const updated = { ...currentUser, classes: [...currentUser.classes, cleanClass] };
      currentUser.classes.push(cleanClass); // local sync
      setCurrentUser(updated);
    }
    setNewClassInput("");
  };

  const handleRemoveClass = (clsName: string) => {
    if (!currentUser) return;
    const updated = {
      ...currentUser,
      classes: currentUser.classes.filter((c) => c !== clsName),
    };
    currentUser.classes = currentUser.classes.filter((c) => c !== clsName); // local sync
    setCurrentUser(updated);
  };

  // --- INTERACTION HELPER GETTERS ---
  
  // Filter clubs owned vs suggested
  const myClubs = useMemo(() => {
    if (!currentUser) return [];
    return clubs.filter((c) => c.members.includes(currentUser.netId));
  }, [clubs, currentUser]);

  const suggestedClubs = useMemo(() => {
    if (!currentUser) return clubs;
    // Suggest clubs the user is not in. Let's showcase overlapping interest counts!
    return clubs
      .filter((c) => !c.members.includes(currentUser.netId))
      .map((club) => {
        // Calculate dynamic match level based on interests
        const matchedInterests = club.description.split(" ")
          .concat(club.longDescription.split(" "))
          .filter(word => currentUser.interests.some(interest => word.toLowerCase().includes(interest.toLowerCase()))).length;
        return {
          club,
          matches: matchedInterests,
        };
      })
      .sort((a, b) => b.matches - a.matches)
      .map((item) => item.club);
  }, [clubs, currentUser]);

  // Filter campus events: general today vs registered today
  const registeredEvents = useMemo(() => {
    if (!currentUser) return [];
    return events.filter((e) => e.attendees.includes(currentUser.netId));
  }, [events, currentUser]);

  // Filter checkins for nearby club members
  const checkedInClubMembersNearby = useMemo(() => {
    if (!currentUser || !activeCheckIn) return [];
    
    // Find checking-ins in the same building
    return checkIns.filter((checkin) => {
      // Must be same building, not the user themselves
      if (checkin.locationId !== activeCheckIn.locationId) return false;
      if (checkin.netId === currentUser.netId) return false;
      
      // Checking-in student must share at least one club with the current login user
      const checkingStudentClubs = clubs.filter((c) => c.members.includes(checkin.netId));
      const myClubsIds = myClubs.map((mc) => mc.id);
      const sharesClub = checkingStudentClubs.some((c) => myClubsIds.includes(c.id));
      
      return sharesClub;
    });
  }, [checkIns, activeCheckIn, currentUser, clubs, myClubs]);

  const otherBuildingCheckins = useMemo(() => {
    if (!currentUser) return checkIns;
    const currentLoc = activeCheckIn?.locationId;
    return checkIns.filter((c) => c.netId !== currentUser.netId && c.locationId !== currentLoc);
  }, [checkIns, activeCheckIn, currentUser]);

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1d0a3a] via-[#090112] to-[#040008] flex flex-col items-center justify-center p-2 sm:p-4 font-sans select-none overflow-hidden">
      
      {/* 
        KIOSK OUTER FRAME HOUSING (iPad proportion: 4:3 1024x768 limits)
        Styled perfectly like an interactive brushed-aluminum premium kiosk terminal.
      */}
      <div 
        id="kiosk-frame"
        className="kiosk-container w-[1024px] h-[768px] max-w-full max-h-full bg-slate-100 rounded-[32px] border-[14px] border-zinc-900 shadow-[0_25px_60px_-15px_rgba(50,0,110,0.35)] overflow-hidden flex flex-col relative"
      >
        
        {/* Kiosk Status Hardware Top-Bar */}
        <div className="h-10 bg-brand-purple text-white shadow-md flex items-center justify-between px-6 border-b border-brand-gold-dark/40 shrink-0 z-30">
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-mono tracking-wider font-bold text-brand-gold bg-brand-purple-dark px-2.5 py-0.5 rounded-full border border-brand-gold-dark/30 uppercase">
              UW Terminal #47
            </span>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-mono text-slate-300 font-semibold uppercase tracking-wider">HUB-STN ACTIVE</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-xs font-mono">
            {/* Real-time Clock display */}
            <div className="flex items-center gap-1.5 text-brand-gold-light font-bold">
              <Clock className="w-4 h-4 text-brand-gold" />
              <span>
                {currentTime.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })}
              </span>
              <span className="text-slate-400">|</span>
              <span className="text-white">
                {currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
              </span>
            </div>
            
            {currentUser && (
              <div className="flex items-center gap-2 border-l border-brand-purple-light pl-4">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-5 h-5 rounded-full bg-slate-200 border border-brand-gold"
                />
                <span className="font-semibold text-slate-100 text-[11px] max-w-[110px] truncate">
                  {currentUser.name}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Screens Layout */}
        <div className="flex-1 overflow-hidden relative bg-slate-50 flex flex-row">
          
          {/* Left Theme Sidebar Navigation */}
          {currentUser && (
            <div className="w-[82px] h-full bg-brand-purple border-r border-brand-purple-dark/20 flex flex-col items-center justify-between py-6 shrink-0 z-40 shadow-[inset_1px_0_0_rgba(255,255,255,0.06),4px_0_20px_rgba(50,0,110,0.12)] relative" id="left-sidebar">
              
              {/* Upper Logged in Page Shortcuts */}
              <div className="flex flex-col items-center gap-2 w-full">
                
                {/* Vertical menu list */}
                <div className="flex flex-col gap-3.5 w-full px-2" id="sidebar-nav-items">
                  {[
                    { screen: "profile", icon: User, title: "Student Profile" },
                    { screen: "home", icon: Home, title: "Home Portal" },
                    { screen: "club", icon: Users, title: "Clubs Dashboard" },
                    { screen: "nearby", icon: MapPin, title: "Nearby Friends" },
                    { screen: "event", icon: Calendar, title: "Campus Events" },
                  ].map((item) => {
                    const isActive = currentScreen === item.screen;
                    const IconComponent = item.icon;
                    return (
                      <button
                        key={item.screen}
                        onClick={() => setCurrentScreen(item.screen as any)}
                        title={item.title}
                        className={`w-full aspect-square rounded-2xl flex items-center justify-center transition-all relative group cursor-pointer ${
                          isActive
                            ? "bg-brand-purple-dark text-brand-gold border-l-4 border-brand-gold shadow-lg font-bold"
                            : "text-slate-300 hover:text-white hover:bg-brand-purple-light/50"
                        }`}
                      >
                        {item.screen === "profile" ? (
                          <img
                            src={currentUser.avatar}
                            alt="Profile"
                            className={`w-6 h-6 rounded-full border object-cover ${
                              isActive ? "border-brand-gold scale-110" : "border-slate-300 group-hover:scale-105 group-hover:border-white"
                            } transition-transform`}
                          />
                        ) : (
                          <IconComponent className={`w-[22px] h-[22px] ${isActive ? "scale-110" : "group-hover:scale-105"} transition-transform`} />
                        )}
                        
                        {/* Elegant Slide Horizontal Tooltip - sliding to the right */}
                        <div className="absolute left-[74px] scale-0 group-hover:scale-100 transition-all duration-150 origin-left bg-slate-900 text-white text-[10px] font-mono leading-none tracking-tight font-bold rounded-lg py-2 px-3 shadow-xl whitespace-nowrap z-50 pointer-events-none">
                          {item.title}
                        </div>
                      </button>
                    );
                  })}

                  {/* Divider line before logout button after event */}
                  <div className="h-[1px] bg-brand-purple-light/35 my-1.5 mx-2" />

                  {/* Add a logout button after event */}
                  <button
                    onClick={handleLogout}
                    title="Log Out of Kiosk"
                    className="w-full aspect-square rounded-2xl flex items-center justify-center text-rose-300 hover:text-white hover:bg-rose-950/40 transition-all group cursor-pointer relative"
                  >
                    <LogOut className="w-[22px] h-[22px] group-hover:scale-105 transition-transform" />
                    
                    {/* Tooltip */}
                    <div className="absolute left-[74px] scale-0 group-hover:scale-100 transition-all duration-150 origin-left bg-rose-950 text-white text-[10px] font-mono leading-none tracking-tight font-bold rounded-lg py-2 px-3 shadow-xl whitespace-nowrap z-50 pointer-events-none">
                      Log Out of Kiosk
                    </div>
                  </button>
                </div>
              </div>

              {/* Lower Section (Logout Button at really bottom of navigation) */}
              <div className="w-full px-2">
                <button
                  onClick={handleLogout}
                  title="Log Out of Kiosk"
                  className="w-full aspect-square rounded-2xl flex items-center justify-center text-rose-300 hover:text-white hover:bg-rose-950/40 transition-all group cursor-pointer relative"
                >
                  <LogOut className="w-[22px] h-[22px] group-hover:scale-105 transition-transform" />
                  
                  {/* Tooltip - sliding to the right */}
                  <div className="absolute left-[74px] scale-0 group-hover:scale-100 transition-all duration-150 origin-left bg-rose-950 text-white text-[10px] font-mono leading-none tracking-tight font-bold rounded-lg py-2 px-3 shadow-xl whitespace-nowrap z-50 pointer-events-none">
                    Log Out of Kiosk
                  </div>
                </button>
              </div>

            </div>
          )}
          
          {/* Main Workspace Pane */}
          <div className="flex-1 h-full min-w-0 flex flex-col overflow-hidden relative" id="workspace-wrapper">
          
          {/* SCREEN 1: LOGIN PAGE */}
          {currentScreen === "login" && (
            <div className="flex-1 grid grid-cols-5 h-full overflow-hidden animate-scale-up-fade">
              {/* Left Aesthetic Banner */}
              <div className="col-span-2 bg-gradient-to-br from-brand-purple-dark via-brand-purple to-[#100028] border-r border-[#32006e]/10 flex flex-col justify-between p-8 text-white relative">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px]" />
                
                <div className="space-y-2 z-10">
                  <span className="text-xs uppercase tracking-widest font-bold text-brand-gold font-mono">University of Washington</span>
                  <h1 className="font-display font-extrabold text-3xl leading-tight tracking-tight mt-1">
                    HUSKY CLUB<br />CONNECT
                  </h1>
                  <p className="text-slate-300 text-sm font-light leading-relaxed pt-2">
                    Connect organically with other students in your clubs. Discover live campus events, synchronize study check-ins, and build lifelong university friendships.
                  </p>
                </div>

                <div className="space-y-4 z-10">
                  <div className="bg-brand-purple-dark/60 border border-brand-gold-dark/40 rounded-2xl p-4 space-y-2">
                    <h4 className="text-xs font-mono font-bold text-brand-gold uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      HUB Student Kiosk Terminal
                    </h4>
                    <p className="text-[11px] text-slate-300 leading-normal">
                      Touch any pre-set profile cards on the right to sign in instantly, or write in any NetID.
                    </p>
                  </div>
                  
                  <div className="text-[10px] text-brand-gold-light/60 font-mono">
                    System version v4.12 • Bound to HUB 04
                  </div>
                </div>
              </div>

              {/* Right Form Pane */}
              <div className="col-span-3 p-8 flex flex-col justify-center bg-white space-y-6 overflow-y-auto">
                <div className="space-y-1.5">
                  <h2 className="font-display font-bold text-2xl text-slate-800 tracking-tight">Student Authentication</h2>
                  <p className="text-xs text-slate-500">Log in with your university NetID and password credentials</p>
                </div>

                {loginError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-xs flex items-center gap-2 font-medium">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{loginError}</span>
                  </div>
                )}

                <form onSubmit={handleLoginSubmit} className="space-y-4" id="login-form">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 block">UW NetID (Email prefix)</label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="e.g. sarahw"
                        id="netid-input"
                        value={netIDInput}
                        onChange={(e) => setNetIDInput(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-purple focus:bg-white transition-all text-slate-800"
                      />
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-slate-400">
                        @uw.edu
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 block">Password</label>
                    <input
                      type="password"
                      placeholder="•••••••••••••"
                      id="password-input"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple focus:bg-white transition-all text-slate-800"
                    />
                  </div>

                  <button
                    type="submit"
                    id="submit-login"
                    className="w-full py-3 bg-brand-purple hover:bg-brand-purple-light text-white font-semibold text-sm rounded-xl shadow-lg hover:shadow-brand-purple/20 transition-all flex items-center justify-center gap-2 mt-4"
                  >
                    <span>Proceed to Club Portal & Check-in</span>
                    <ArrowRight className="w-4 h-4 text-brand-gold-light" />
                  </button>
                </form>

                {/* Highly structured quick student accounts display */}
                <div className="space-y-2.5 border-t border-slate-100 pt-5">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                    👈 QUICK KIOSK DEMO ACCOUNTS (TAP TO PREFILL):
                  </span>
                  <div className="grid grid-cols-5 gap-2">
                    {Object.values(SAMPLE_STUDENTS).map((student) => {
                      const isSelected = netIDInput === student.netId;
                      return (
                        <button
                          key={student.netId}
                          onClick={() => handleSelectDemoAccount(student.netId)}
                          className={`p-2 rounded-xl border text-center transition-all flex flex-col items-center justify-center cursor-pointer gap-1.5 ${
                            isSelected
                              ? "border-brand-purple bg-brand-purple/5 ring-2 ring-brand-purple"
                              : "border-slate-200 hover:border-brand-purple/40 hover:bg-slate-50"
                          }`}
                        >
                          <img
                            src={student.avatar}
                            alt={student.name}
                            className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 p-0.5"
                          />
                          <div className="text-[10px] font-bold text-slate-800 truncate w-full">
                            {student.name.split(" ")[0]}
                          </div>
                          <span className="text-[9px] font-mono text-brand-purple-light/70 truncate w-full">
                            {student.netId}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SCREEN 2: MAIN HOME PORTAL */}
          {currentScreen === "home" && currentUser && (
            <div className="flex-1 p-5 flex flex-col justify-between max-h-full overflow-y-auto animate-scale-up-fade" id="home-portal-container">
              
              {/* Kiosk Welcome Segment */}
              <div className="card-sleek p-4 flex items-center justify-between shadow-md">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-12 h-12 rounded-xl bg-brand-purple/5 border border-brand-purple p-1 shadow-md shadow-brand-purple/5"
                    />
                    <div className="absolute -bottom-1 -right-0.5 bg-brand-gold text-slate-900 text-[8px] font-mono font-bold px-1 rounded-full border border-white uppercase">
                      ON
                    </div>
                  </div>
                  <div>
                    <h2 className="font-display font-extrabold text-xl text-slate-800 tracking-tight leading-tight">
                      Welcome, {currentUser.name}!
                    </h2>
                    <p className="text-slate-500 text-xs mt-0.5 max-w-[420px] leading-snug">
                      Find friends checked in nearby, manage your registered clubs, check scheduled campus events, or adjust your kiosk card profile from here.
                    </p>
                  </div>
                </div>

                <div className="text-right flex flex-col items-end gap-1 shrink-0">
                  {activeCheckIn ? (
                    <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 px-2.5 py-1 rounded-xl text-[11px] font-semibold">
                      <MapPin className="w-3.5 h-3.5 text-emerald-500 animate-bounce" />
                      <span>{CAMPUS_BUILDINGS.find(b => b.id === activeCheckIn.locationId)?.shortName}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-700 px-2.5 py-1 rounded-xl text-[11px] font-medium">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>No active check-in today</span>
                    </div>
                  )}
                  <span className="text-[10px] font-mono text-slate-400">NetID Session: <strong className="text-brand-purple font-bold">{currentUser.netId}</strong></span>
                </div>
              </div>

              {/* Core 4 Dashboard Grid */}
              <div className="grid grid-cols-2 gap-4 my-3.5 flex-1">
                {/* BUTTON 1: CLUBS */}
                <button
                  onClick={() => setCurrentScreen("club")}
                  className="card-sleek card-sleek-hover p-4 text-left flex flex-col justify-between group cursor-pointer relative overflow-hidden"
                >
                  <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 text-slate-100 opacity-60 group-hover:scale-110 transition-transform pointer-events-none">
                    <Users className="w-24 h-24 text-slate-100/40" />
                  </div>
                  <div className="space-y-2 z-10">
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-brand-purple group-hover:bg-brand-purple group-hover:text-white transition-colors duration-200">
                      <Users className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h3 className="font-display font-extrabold text-sm sm:text-base text-slate-800 tracking-tight flex items-center gap-1.5">
                        <span>Clubs & Societies</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 group-hover:bg-brand-purple/10 group-hover:text-brand-purple transition-all font-mono font-bold">
                          {myClubs.length} Joined
                        </span>
                      </h3>
                      <p className="text-slate-500 text-[11px] sm:text-xs mt-1 leading-snug">
                        Review lists of academic and social clubs you belong to, see member directories, browse campus recommendations, and register instantly.
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-brand-purple-light flex items-center gap-1 mt-2 group-hover:text-brand-purple z-10 uppercase">
                    Open Club Dashboard <ArrowRight className="w-3 h-3 animate-pulse" />
                  </span>
                </button>

                {/* BUTTON 2: NEARBY FRIENDS */}
                <button
                  onClick={() => setCurrentScreen("nearby")}
                  className="card-sleek card-sleek-hover p-4 text-left flex flex-col justify-between group cursor-pointer relative overflow-hidden"
                >
                  <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 text-slate-100 opacity-60 group-hover:scale-110 transition-transform pointer-events-none">
                    <MapPin className="w-24 h-24 text-slate-100/40" />
                  </div>
                  <div className="space-y-2 z-10">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-200">
                      <MapPin className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h3 className="font-display font-extrabold text-sm sm:text-base text-slate-800 tracking-tight flex items-center gap-1.5">
                        <span>Nearby Friends</span>
                        {checkedInClubMembersNearby.length > 0 && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 font-mono font-bold">
                            {checkedInClubMembersNearby.length} Nearby
                          </span>
                        )}
                      </h3>
                      <p className="text-slate-500 text-[11px] sm:text-xs mt-1 leading-snug">
                        Check-in at your current campus library or lounge. Discover other active club peers studying in the same building and email them instantly.
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-brand-purple-light flex items-center gap-1 mt-2 group-hover:text-brand-purple z-10 uppercase">
                    Check In & Connect <ArrowRight className="w-3 h-3 animate-pulse" />
                  </span>
                </button>

                {/* BUTTON 3: EVENTS */}
                <button
                  onClick={() => setCurrentScreen("event")}
                  className="card-sleek card-sleek-hover p-4 text-left flex flex-col justify-between group cursor-pointer relative overflow-hidden"
                >
                  <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 text-slate-100 opacity-60 group-hover:scale-110 transition-transform pointer-events-none">
                    <Calendar className="w-24 h-24 text-slate-100/40" />
                  </div>
                  <div className="space-y-2 z-10">
                    <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors duration-200">
                      <Calendar className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h3 className="font-display font-extrabold text-sm sm:text-base text-slate-800 tracking-tight flex items-center gap-1.5">
                        <span>Campus Events</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 font-mono font-bold">
                          Today Only
                        </span>
                      </h3>
                      <p className="text-slate-500 text-[11px] sm:text-xs mt-1 leading-snug">
                        Check out live student rallies, hackathons, rover demos, or outdoor BBQs scheduled across campus communities today, paired with 3D locator maps.
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-brand-purple-light flex items-center gap-1 mt-2 group-hover:text-brand-purple z-10 uppercase">
                    View Live Events Guide <ArrowRight className="w-3 h-3 animate-pulse" />
                  </span>
                </button>

                {/* BUTTON 4: STUDENT PROFILE / LOGOUT */}
                <button
                  onClick={() => setCurrentScreen("profile")}
                  className="card-sleek card-sleek-hover p-4 text-left flex flex-col justify-between group cursor-pointer relative overflow-hidden"
                >
                  <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 text-slate-100 opacity-60 group-hover:scale-110 transition-transform pointer-events-none">
                    <User className="w-24 h-24 text-slate-100/40" />
                  </div>
                  <div className="space-y-2 z-10">
                    <div className="w-9 h-9 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600 group-hover:bg-sky-600 group-hover:text-white transition-colors duration-200">
                      <User className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h3 className="font-display font-extrabold text-sm sm:text-base text-slate-800 tracking-tight flex items-center gap-1.5">
                        <span>Student Profile Card</span>
                        <span className="text-[9px] uppercase font-mono font-bold text-slate-400">Settings</span>
                      </h3>
                      <p className="text-slate-500 text-[11px] sm:text-xs mt-1 leading-snug">
                        Edit your bio statement, delete or add course listings, customize your affinity interests, test out various avatars, or log out of terminal.
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-brand-purple-light flex items-center gap-1 mt-2 group-hover:text-brand-purple z-10 uppercase">
                    Configure Profile <ArrowRight className="w-3 h-3 animate-pulse" />
                  </span>
                </button>
              </div>

              {/* Portal Footer */}
              <div className="pt-1.5 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-400 shrink-0 font-mono mt-1">
                <span>Kiosk Terminal HUB-04 • IP: 172.16.89.14</span>
                <span className="text-brand-purple">University of Washington Campus Life</span>
              </div>
            </div>
          )}

          {/* SCREEN 3: CLUBS SECTION */}
          {currentScreen === "club" && currentUser && (
            <div className="flex-1 overflow-hidden flex flex-col h-full bg-[#f8f7fa] animate-scale-up-fade">
              {/* Internal Screen Header */}
              <div className="border-b border-slate-200 bg-white px-6 py-4 flex items-center justify-between shadow-sm shrink-0">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setCurrentScreen("home")}
                    className="p-1 px-3 py-1.5 text-xs font-bold font-mono text-slate-600 hover:text-slate-900 border border-slate-200 rounded-xl hover:bg-slate-50 overflow-hidden flex items-center gap-1 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Home</span>
                  </button>
                  <div className="h-6 w-[1px] bg-slate-200" />
                  <div>
                    <h2 className="font-display font-extrabold text-lg text-slate-800 tracking-tight leading-tight">Clubs & Communities</h2>
                    <p className="text-[11px] text-slate-500">Manage joined organizations and see student members roster</p>
                  </div>
                </div>
                
                <span className="text-xs font-mono text-brand-purple-light">
                  Current Session: <strong>{currentUser.name}</strong> ({currentUser.netId})
                </span>
              </div>

              {/* Workspace Content splitting lists vs detail */}
              <div className="flex-1 grid grid-cols-12 overflow-hidden">
                
                {/* Column left (Clubs hierarchy) - span 4 */}
                <div className="col-span-4 border-r border-slate-200 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
                  
                  {/* Category 1: OWN CLUBS */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1 ">
                      <Award className="w-3 text-brand-purple" />
                      My Registered Clubs ({myClubs.length})
                    </span>
                    {myClubs.length === 0 ? (
                      <div className="border border-slate-200 border-dashed rounded-xl p-4 text-center bg-white space-y-1">
                        <p className="text-[11px] font-medium text-slate-500">You haven't joined any clubs yet.</p>
                        <p className="text-[10px] text-slate-400">Suggest some below or register directly!</p>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        {myClubs.map((club) => {
                          const isSelected = selectedClubId === club.id;
                          return (
                            <button
                              key={club.id}
                              onClick={() => setSelectedClubId(club.id)}
                              className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                                isSelected
                                  ? "bg-white border-brand-purple shadow-sm ring-1 ring-brand-purple"
                                  : "bg-white border-slate-200 hover:border-slate-300"
                              }`}
                            >
                              <div className="flex items-center gap-2.5 overflow-hidden">
                                <span className="text-2xl shrink-0">{club.logo}</span>
                                <div className="overflow-hidden">
                                  <h4 className="font-semibold text-xs text-slate-800 truncate">{club.name}</h4>
                                  <span className="text-[10px] text-slate-400 block font-medium truncate">{club.category}</span>
                                </div>
                              </div>
                              <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full shrink-0">
                                {club.memberCount}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Category 2: SUGGESTED CLUBS */}
                  <div className="space-y-1.5 pt-2">
                    <span className="text-[10px] font-mono font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3 text-brand-gold-dark" />
                      Suggested For You ({suggestedClubs.length})
                    </span>
                    <div className="space-y-1.5">
                      {suggestedClubs.map((club) => {
                        const isSelected = selectedClubId === club.id;
                        return (
                          <button
                            key={club.id}
                            onClick={() => setSelectedClubId(club.id)}
                            className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                              isSelected
                                ? "bg-white border-brand-purple shadow-sm ring-1 ring-brand-purple"
                                : "bg-white border-slate-200 hover:border-slate-350"
                            }`}
                          >
                            <div className="flex items-center gap-2.5 overflow-hidden">
                              <span className="text-2xl shrink-0">{club.logo}</span>
                              <div className="overflow-hidden">
                                <h4 className="font-semibold text-xs text-slate-800 truncate">{club.name}</h4>
                                <span className="text-[10px] text-slate-400 block font-medium truncate">{club.category}</span>
                              </div>
                            </div>
                            <span className="text-[9px] uppercase font-mono font-bold bg-amber-50 text-brand-gold-dark border border-brand-gold-light/20 px-1.5 py-0.5 rounded-full shrink-0">
                              Explore
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Column right (Club Details Pane & Members directory) - span 8 */}
                <div className="col-span-8 overflow-y-auto p-6 bg-white flex flex-col justify-between">
                  {currentClub ? (
                    <div className="space-y-5">
                      {/* Logo, Name, Join state */}
                      <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                        <div className="flex gap-4">
                          <span className="text-4xl p-2 bg-slate-50 border border-slate-100 rounded-2xl shrink-0">
                            {currentClub.logo}
                          </span>
                          <div>
                            <span className="text-[10px] font-mono font-bold bg-brand-purple/5 text-brand-purple px-2 py-0.5 rounded-full border border-brand-purple/10 uppercase tracking-wider">
                              {currentClub.category}
                            </span>
                            <h3 className="font-display font-extrabold text-xl text-slate-800 mt-1 leading-tight tracking-tight">
                              {currentClub.name}
                            </h3>
                            <p className="text-slate-400 text-xs mt-0.5">Roster total: {currentClub.memberCount} members</p>
                          </div>
                        </div>

                        {/* Register Action button */}
                        {myClubs.some((mc) => mc.id === currentClub.id) ? (
                          <button
                            onClick={() => handleToggleClubRegistration(currentClub.id)}
                            className="bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold text-xs px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>Leave Club</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleToggleClubRegistration(currentClub.id)}
                            className="bg-brand-purple hover:bg-brand-purple-light text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md shadow-brand-purple/10 flex items-center gap-2 transition-all cursor-pointer animate-pulse"
                          >
                            <Plus className="w-4 h-4 text-brand-gold-light" />
                            <span>Register & Join Club</span>
                          </button>
                        )}
                      </div>

                      {/* Info Cards Row */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-3.5 text-xs">
                          <span className="text-slate-400 font-semibold block uppercase tracking-wider text-[9px] mb-1 font-mono">Meeting Schedule</span>
                          <p className="text-slate-800 font-semibold leading-relaxed">{currentClub.meetingTime}</p>
                        </div>
                        <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-3.5 text-xs">
                          <span className="text-slate-400 font-semibold block uppercase tracking-wider text-[9px] mb-1 font-mono">Primary Campus Room</span>
                          <p className="text-slate-800 font-semibold leading-relaxed">{currentClub.meetingLocation}</p>
                        </div>
                      </div>

                      {/* Main Long Description */}
                      <div className="space-y-1">
                        <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">About this Organization</h4>
                        <p className="text-slate-600 text-xs leading-relaxed font-light">{currentClub.longDescription}</p>
                      </div>

                      {/* ROSTER / MEMBERS DIRECTORY */}
                      <div className="space-y-2.5 pt-2 border-t border-slate-100">
                        <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-brand-purple" />
                          Club Directory Roster ({currentClub.members.length} checked study peers)
                        </h4>
                        
                        <div className="grid grid-cols-2 gap-3">
                          {currentClub.members.map((memberNetId) => {
                            // Find student record details
                            const member = SAMPLE_STUDENTS[memberNetId];
                            if (!member) return null;
                            const isMe = memberNetId === currentUser.netId;
                            const isUserInClub = currentClub.members.includes(currentUser.netId);
                            
                            return (
                              <div
                                key={memberNetId}
                                onClick={() => {
                                  if (!isUserInClub) {
                                    alert(`To protect student privacy, you must join "${currentClub.name}" before you can inspect its member directories.`);
                                    return;
                                  }
                                  setInspectingMember(member);
                                }}
                                className={`border border-slate-200 p-3 rounded-xl flex items-center justify-between group transition-all text-left ${
                                  isUserInClub 
                                    ? "hover:border-brand-purple hover:bg-slate-50/50 cursor-pointer" 
                                    : "opacity-60 cursor-not-allowed bg-slate-100/50"
                                }`}
                              >
                                <div className="flex items-center gap-3 overflow-hidden">
                                  <img
                                    src={member.avatar}
                                    alt={member.name}
                                    className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 p-0.5 shrink-0"
                                  />
                                  <div className="overflow-hidden">
                                    <h5 className="font-bold text-xs text-slate-800 truncate flex items-center gap-1">
                                      <span>{member.name}</span>
                                      {isMe && <span className="text-[8px] px-1 py-0.2 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded block font-mono">Me</span>}
                                    </h5>
                                    <p className="text-[10px] text-slate-400 truncate mt-0.5">{member.email}</p>
                                  </div>
                                </div>
                                <span className={`text-[10px] font-mono font-bold bg-slate-50 border border-slate-200 text-slate-500 rounded px-1.5 py-0.5 transition-all shrink-0 ${isUserInClub ? "group-hover:bg-brand-purple/10 group-hover:text-brand-purple cursor-pointer" : "opacity-75 cursor-not-allowed"}`}>
                                  {isUserInClub ? "Inspect" : "Locked 🔒"}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center p-8 text-slate-400 space-y-2">
                      <Users className="w-12 h-12 text-slate-300" />
                      <p className="text-sm font-semibold">No club organization selected</p>
                      <p className="text-xs">Click on any club on the left sidebar to learn more.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* SCREEN 4: NEARBY FRIENDS SECTION */}
          {currentScreen === "nearby" && currentUser && (
            <div className="flex-1 overflow-hidden flex flex-col h-full bg-[#f8f7fa] animate-scale-up-fade">
              {/* Internal Header */}
              <div className="border-b border-slate-200 bg-white px-6 py-4 flex items-center justify-between shadow-sm shrink-0">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setCurrentScreen("home")}
                    className="p-1 px-3 py-1.5 text-xs font-bold font-mono text-slate-600 hover:text-slate-900 border border-slate-200 rounded-xl hover:bg-slate-50 overflow-hidden flex items-center gap-1 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Home</span>
                  </button>
                  <div className="h-6 w-[1px] bg-slate-200" />
                  <div>
                    <h2 className="font-display font-extrabold text-lg text-slate-800 tracking-tight leading-tight">Nearby Check-Ins & Friends</h2>
                    <p className="text-[11px] text-slate-500">Coordinate and find peer students checked-in at the same building</p>
                  </div>
                </div>
                
                {activeCheckIn && (
                  <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 text-emerald-800 px-3 py-1.5 rounded-xl text-xs font-semibold">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>Active: {CAMPUS_BUILDINGS.find((b) => b.id === activeCheckIn.locationId)?.name}</span>
                  </div>
                )}
              </div>

              {/* Core Content layout */}
              <div className="flex-1 grid grid-cols-12 overflow-hidden">
                
                {/* Column left (Check-In workflow OR user's active stay summary) - span 4 */}
                <div className="col-span-4 border-r border-slate-200 overflow-y-auto p-5 bg-white space-y-4">
                  {!activeCheckIn ? (
                    // CHECK IN WORKFLOW
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <span className="text-[9px] font-mono font-bold uppercase text-brand-purple tracking-wider block">Campus Safety Portal</span>
                        <h3 className="font-display font-black text-lg text-slate-800 tracking-tight leading-tight">Terminal Hub Check-In</h3>
                        <p className="text-[11px] text-slate-500 leading-normal">
                          Register your location, duration of study, and a quick student note to make yourself visible to club peers.
                        </p>
                      </div>

                      <form onSubmit={handleCreateCheckIn} className="space-y-4 pt-1" id="checkin-form">
                        {/* Select Building List */}
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-slate-700 block">Where are you on campus?</label>
                          <select
                            value={chkBuildingId}
                            onChange={(e) => setChkBuildingId(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-brand-purple focus:bg-white text-slate-800 font-medium"
                          >
                            {CAMPUS_BUILDINGS.map((b) => (
                              <option key={b.id} value={b.id}>
                                🏢 {b.name} ({b.shortName})
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Stay Duration Choices */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-700 block">How long will you stay here?</label>
                          <div className="grid grid-cols-2 gap-1.5">
                            {["30 mins", "1 hour", "2 hours", "3 hours"].map((dur) => {
                              const isSel = chkDuration === dur;
                              return (
                                <button
                                  key={dur}
                                  type="button"
                                  onClick={() => setChkDuration(dur)}
                                  className={`p-2 rounded-lg border text-center font-medium text-[11px] transition-all cursor-pointer ${
                                    isSel
                                      ? "bg-brand-purple border-brand-purple text-white shadow-sm font-semibold"
                                      : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300"
                                  }`}
                                >
                                  ⏰ {dur}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Note Input */}
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-slate-700 block mb-0.5">Check-In Activity Note</label>
                          <textarea
                            placeholder="e.g. Working on CSE 311 homework at the back tables, down to grab milk tea!"
                            value={chkNote}
                            onChange={(e) => setChkNote(e.target.value)}
                            rows={3}
                            maxLength={100}
                            className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-brand-purple placeholder:text-slate-400 text-slate-700 resize-none font-sans"
                          />
                          <div className="text-[9px] text-right text-slate-400 font-mono">
                            {chkNote.length}/100 chars max
                          </div>
                        </div>

                        <button
                          type="submit"
                          id="submit-checkin"
                          className="w-full py-3 bg-brand-purple hover:bg-brand-purple-light text-white font-bold text-xs rounded-xl shadow-lg shadow-brand-purple/10 flex items-center justify-center gap-1.5 transition-all mt-4"
                        >
                          <MapPin className="w-4 h-4 text-brand-gold-light animate-bounce" />
                          <span>Check In At Kiosk Spot</span>
                        </button>
                      </form>
                    </div>
                  ) : (
                    // SHOW ACTIVE CHECK-IN SUMMARY
                    <div className="space-y-5">
                      <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl space-y-3 shadow-inner">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow">
                            <CheckCircle className="w-5 h-5 animate-pulse" />
                          </div>
                          <div>
                            <span className="text-[9px] uppercase font-mono font-bold text-emerald-600 block">Kiosk Connection Live</span>
                            <h4 className="font-bold text-slate-800 text-xs">Checked In successfully!</h4>
                          </div>
                        </div>
                        
                        <div className="border-t border-emerald-200/40 pt-2 space-y-1.5 text-xs text-slate-700">
                          <div className="flex justify-between items-center">
                            <span className="font-semibold text-slate-500">Current Building:</span>
                            <span className="font-bold text-brand-purple font-display">{CAMPUS_BUILDINGS.find((b) => b.id === activeCheckIn.locationId)?.shortName}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="font-semibold text-slate-500">Logged Time:</span>
                            <span className="font-mono text-slate-600">{activeCheckIn.timeFrom}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="font-semibold text-slate-500">Stay Duration:</span>
                            <span className="font-bold text-slate-700">{activeCheckIn.stayDuration}</span>
                          </div>
                        </div>

                        <div className="border-t border-emerald-200/40 pt-2">
                          <span className="text-[10px] font-mono font-bold text-emerald-600 uppercase block mb-1">Your Kiosk Broadcast note:</span>
                          <p className="text-xs text-slate-600 italic bg-white/60 p-2 border border-emerald-100 rounded-lg">
                            "{activeCheckIn.note}"
                          </p>
                        </div>
                      </div>

                      {/* Checkout Action Button */}
                      <div className="space-y-2">
                        <p className="text-[10px] text-slate-400 text-center">Need to move elsewhere or clear privacy?</p>
                        <button
                          onClick={handleCheckOut}
                          className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <LogOut className="w-3.5 h-3.5 text-rose-500" />
                          <span>Check Out/Relocate</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Column right (Club Peers Checked-In Nearby and other buildings overview) - span 8 */}
                <div className="col-span-8 overflow-y-auto p-6 space-y-6 bg-slate-50">
                  
                  {/* REQUIREMENT 1: FRIENDS IN SAME BUILDING */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <h3 className="font-display font-extrabold text-base text-slate-800 tracking-tight flex items-center gap-1.5">
                        <Users className="w-5 h-5 text-brand-purple" />
                        <span>Club Peers Checked-In Nearby</span>
                        {activeCheckIn && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 font-mono font-bold uppercase">
                            {CAMPUS_BUILDINGS.find((b) => b.id === activeCheckIn.locationId)?.shortName}
                          </span>
                        )}
                      </h3>
                      <span className="text-[10px] font-mono text-slate-400">Refreshed Live</span>
                    </div>

                    {!activeCheckIn ? (
                      <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-3">
                        <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center mx-auto border border-amber-200">
                          <MapPin className="w-6 h-6 animate-pulse" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-bold text-sm text-slate-800">Check-In Required to Connect</h4>
                          <p className="text-xs text-slate-500 max-w-sm mx-auto">
                            To protect student privacy and facilitate study matches, you must check in on the left first to view peers in the same building.
                          </p>
                        </div>
                      </div>
                    ) : checkedInClubMembersNearby.length === 0 ? (
                      <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-2">
                        <p className="text-xs font-semibold text-slate-700">No other club members in {CAMPUS_BUILDINGS.find((b) => b.id === activeCheckIn.locationId)?.shortName} right now.</p>
                        <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                          Be the spark! Leave your check-in card active. Peers who open the kiosk in this building will discover your note and sync.
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-4">
                        {checkedInClubMembersNearby.map((chk) => {
                          // Look up student details
                          const student = SAMPLE_STUDENTS[chk.netId];
                          return (
                            <div
                              key={chk.id}
                              className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col justify-between space-y-3 hover:border-brand-purple transition-all hover:shadow-md"
                            >
                              <div className="flex gap-3">
                                <img
                                  src={chk.studentAvatar}
                                  alt={chk.studentName}
                                  className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 p-0.5 shrink-0"
                                />
                                <div className="overflow-hidden space-y-0.5">
                                  <div className="flex items-center gap-1.5">
                                    <h5 className="font-bold text-xs text-slate-800 truncate leading-snug">{chk.studentName}</h5>
                                    <span className="text-[8px] bg-indigo-50 border border-indigo-100 text-indigo-700 px-1 rounded-full font-mono font-bold font-semibold shrink-0">
                                      Peer
                                    </span>
                                  </div>
                                  <span className="text-[10px] text-slate-400 block font-mono">NetID: <strong className="text-slate-600">{chk.netId}</strong></span>
                                  <span className="text-[10px] text-brand-purple font-medium block truncate">👥 {chk.clubName}</span>
                                </div>
                              </div>

                              <div className="bg-slate-50 border border-slate-200/40 rounded-xl p-2.5 text-[11px] text-slate-600 font-light italic leading-relaxed">
                                "{chk.note}"
                              </div>

                              <div className="bg-slate-50 px-2 py-1.5 rounded-lg flex justify-between text-[10px] font-mono border border-slate-100">
                                <span className="text-slate-400">Est. Stay: <strong className="text-slate-700 font-sans">{chk.stayDuration}</strong></span>
                                <span className="text-slate-400">From: <strong className="text-slate-700">{chk.timeFrom}</strong></span>
                              </div>

                              {/* CLICK TO WORK EMAL TRANSFER */}
                              <button
                                onClick={() => student && setEmailTargetStudent(student)}
                                className="w-full py-2 bg-brand-purple hover:bg-brand-purple-light text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                              >
                                <Mail className="w-3.5 h-3.5 text-brand-gold-light" />
                                <span>Message via UW Email</span>
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* OPTION SUB: OTHER CAMPUS BROADCASTS */}
                  <div className="space-y-2 border-t border-slate-200 pt-5">
                    <span className="text-[11px] font-mono font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1">
                      <Map className="w-3.5" />
                      Activity Across Other Campus Hubs
                    </span>

                    <div className="grid grid-cols-2 gap-3">
                      {otherBuildingCheckins.map((chk) => {
                        const bName = CAMPUS_BUILDINGS.find((b) => b.id === chk.locationId)?.shortName || chk.locationId;
                        const student = SAMPLE_STUDENTS[chk.netId];
                        return (
                          <div
                            key={chk.id}
                            className="bg-white border border-slate-100 p-3 rounded-xl flex items-center justify-between shadow-sm opacity-80 hover:opacity-100 transition-opacity"
                          >
                            <div className="flex items-center gap-2.5 overflow-hidden">
                              <img
                                src={chk.studentAvatar}
                                alt={chk.studentName}
                                className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 p-0.5 shrink-0"
                              />
                              <div className="overflow-hidden">
                                <h6 className="font-bold text-[11px] text-slate-800 truncate leading-snug">{chk.studentName}</h6>
                                <span className="text-[9px] text-emerald-600 font-semibold block uppercase">🏢 Checked in: {bName}</span>
                              </div>
                            </div>

                            {activeCheckIn && student && (
                              <button
                                onClick={() => setEmailTargetStudent(student)}
                                className="p-1 px-2 border border-slate-200 text-[10px] font-mono font-bold rounded-lg hover:border-brand-purple hover:bg-brand-purple/5 transition-all text-brand-purple cursor-pointer"
                              >
                                Send Mail
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>
              </div>
            </div>
          )}

          {/* SCREEN 5: EVENTS SECTION TODAY */}
          {currentScreen === "event" && currentUser && (
            <div className="flex-1 overflow-hidden flex flex-col h-full bg-[#f8f7fa] animate-scale-up-fade">
              {/* Internal Screen Header */}
              <div className="border-b border-slate-200 bg-white px-6 py-4 flex items-center justify-between shadow-sm shrink-0">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setCurrentScreen("home")}
                    className="p-1 px-3 py-1.5 text-xs font-bold font-mono text-slate-600 hover:text-slate-900 border border-slate-200 rounded-xl hover:bg-slate-50 overflow-hidden flex items-center gap-1 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Home</span>
                  </button>
                  <div className="h-6 w-[1px] bg-slate-200" />
                  <div>
                    <h2 className="font-display font-extrabold text-lg text-slate-800 tracking-tight leading-tight">Campus Events Today</h2>
                    <p className="text-[11px] text-slate-500">Discover live events and study reviews scheduled on campus today</p>
                  </div>
                </div>
                
                <span className="text-xs font-mono text-brand-purple-light">
                  Today's campus density dashboard
                </span>
              </div>

              {/* Work split list vs details WITH MAP */}
              <div className="flex-1 grid grid-cols-12 overflow-hidden">
                
                {/* Column left (List of events) - span 4 */}
                <div className="col-span-4 border-r border-slate-200 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
                  
                  {/* Category A: GENERAL HAPPENINGS */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono font-bold uppercase text-slate-400 tracking-wider block">
                      📆 Scheduled Today ({events.length})
                    </span>
                    
                    <div className="space-y-2">
                      {events.map((evt) => {
                        const isSelected = selectedEventId === evt.id;
                        const host = clubs.find((c) => c.id === evt.clubId)?.logo || "📌";
                        return (
                          <button
                            key={evt.id}
                            onClick={() => setSelectedEventId(evt.id)}
                            className={`w-full text-left p-3 rounded-xl border transition-all flex items-start gap-2.5 cursor-pointer ${
                              isSelected
                                ? "bg-white border-brand-purple shadow-sm ring-1 ring-brand-purple"
                                : "bg-white border-slate-200 hover:border-slate-350"
                            }`}
                          >
                            <span className="text-2xl mt-0.5 shrink-0">{host}</span>
                            <div className="overflow-hidden space-y-0.5">
                              <span className="text-[9px] uppercase font-mono font-bold text-amber-600 block">
                                {evt.tag}
                              </span>
                              <h4 className="font-bold text-xs text-slate-800 leading-tight truncate">
                                {evt.title}
                              </h4>
                              <span className="text-[10px] text-slate-400 block font-mono">
                                {evt.time}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Category B: MY REGISTERED RSVPS */}
                  <div className="space-y-2 pt-2">
                    <span className="text-[10px] font-mono font-bold uppercase text-slate-400 tracking-wider block">
                      ✔️ My Active RSVPs ({registeredEvents.length})
                    </span>

                    {registeredEvents.length === 0 ? (
                      <div className="border border-slate-200 border-dashed rounded-xl p-3.5 text-center bg-white">
                        <span className="text-[10px] text-slate-400 block font-medium">No active reservations.</span>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        {registeredEvents.map((evt) => (
                          <button
                            key={evt.id}
                            onClick={() => setSelectedEventId(evt.id)}
                            className="w-full text-left p-2.5 bg-white border border-slate-200 rounded-xl hover:border-brand-purple transition-all text-xs flex items-center justify-between"
                          >
                            <span className="font-bold text-slate-700 truncate mr-2">{evt.title}</span>
                            <span className="text-[8px] font-mono font-bold bg-indigo-50 border border-indigo-200 text-indigo-700 px-1.5 rounded-full shrink-0 uppercase">RSVP'd</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Column right (Detailed view & Campus Map View) - span 8 */}
                <div className="col-span-8 overflow-y-auto p-6 bg-white flex flex-col justify-between h-full">
                  {currentEvent ? (
                    <div className="space-y-5 flex-1 flex flex-col">
                      {/* Top Header Card info */}
                      <div className="flex gap-4 items-start border-b border-slate-100 pb-4 shrink-0">
                        <div className="overflow-hidden space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-700 border border-amber-300/30 px-2.5 py-0.5 rounded-full uppercase">
                              {currentEvent.tag}
                            </span>
                            <span className="text-[11px] text-slate-400">Hosted by: <strong>{clubs.find((c) => c.id === currentEvent.clubId)?.name}</strong></span>
                          </div>
                          
                          <h3 className="font-display font-black text-xl text-slate-800 leading-tight tracking-tight">
                            {currentEvent.title}
                          </h3>
                          
                          <div className="flex items-center gap-3.5 text-xs text-slate-500 font-medium">
                            <span className="flex items-center gap-1">⏰ {currentEvent.time}</span>
                            <span className="flex items-center gap-1">🏢 location: <strong>{CAMPUS_BUILDINGS.find((b) => b.id === currentEvent.locationId)?.name}</strong></span>
                          </div>
                        </div>

                        {/* RSVP state action */}
                        {currentEvent.attendees.includes(currentUser.netId) ? (
                          <button
                            onClick={() => handleToggleEventRegistration(currentEvent.id)}
                            className="bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer"
                          >
                            Cancel RSVP
                          </button>
                        ) : (
                          <button
                            onClick={() => handleToggleEventRegistration(currentEvent.id)}
                            className="bg-brand-purple hover:bg-brand-purple-light text-white text-xs font-extrabold px-5 py-2.5 rounded-xl shadow-lg shadow-brand-purple/15 transition-all cursor-pointer"
                          >
                            Add to My RSVPs
                          </button>
                        )}
                      </div>

                      {/* Main Long info */}
                      <div className="space-y-1 shrink-0">
                        <h5 className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Event Details</h5>
                        <p className="text-slate-600 text-xs leading-relaxed font-light">{currentEvent.longDescription}</p>
                      </div>

                      {/* Who is Registered display */}
                      <div className="space-y-2 border-t border-slate-100 pt-3 shrink-0">
                        <h5 className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                          👥 Registered Students Directory ({currentEvent.attendees.length})
                        </h5>
                        
                        <div className="flex flex-wrap gap-2">
                          {currentEvent.attendees.map((netId) => {
                            const student = SAMPLE_STUDENTS[netId];
                            if (!student) return null;
                            const isMe = netId === currentUser.netId;
                            return (
                              <div
                                key={netId}
                                onClick={() => setInspectingMember(student)}
                                className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/60 rounded-xl py-1 px-2.5 text-xs hover:border-brand-purple transition-all cursor-pointer"
                              >
                                <img
                                  src={student.avatar}
                                  alt={student.name}
                                  className="w-5 h-5 rounded-full bg-white border border-slate-250 p-0.2 shrink-0"
                                />
                                <span className="font-semibold text-slate-700 text-[10px]">
                                  {isMe ? "Me" : student.name.split(" ")[0]}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* EMBEDDED campus locator map block */}
                      <div className="space-y-2 border-t border-slate-100 pt-4 flex-1 flex flex-col min-h-[160px] overflow-hidden">
                        <h5 className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                          <MapPin className="w-3.5 text-amber-500 animate-pulse" />
                          UW Campus Live Locator Map (Red Square Core Hub)
                        </h5>
                        <CampusMap
                          highlightedBuildingId={currentEvent.locationId}
                          selectedBuildingId={currentEvent.locationId}
                          className="flex-1 w-full relative min-h-[140px]"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center p-8 text-slate-400 space-y-2">
                      <Calendar className="w-12 h-12 text-slate-300" />
                      <p className="text-sm font-semibold">No campus event selected</p>
                      <p className="text-xs">Select any scheduled activity on the leftmost calendar rail to preview details and campus locations map.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* SCREEN 6: PROFILE & CONFIG CARD */}
          {currentScreen === "profile" && currentUser && (
            <div className="flex-1 overflow-hidden flex flex-col h-full bg-[#f8f7fa] animate-scale-up-fade">
              {/* Header */}
              <div className="border-b border-slate-200 bg-white px-6 py-4 flex items-center justify-between shadow-sm shrink-0">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setCurrentScreen("home")}
                    className="p-1 px-3 py-1.5 text-xs font-bold font-mono text-slate-600 hover:text-slate-900 border border-slate-200 rounded-xl hover:bg-slate-50 overflow-hidden flex items-center gap-1 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Home</span>
                  </button>
                  <div className="h-6 w-[1px] bg-slate-200" />
                  <div>
                    <h2 className="font-display font-extrabold text-lg text-slate-800 tracking-tight leading-tight">Student Profile Card</h2>
                    <p className="text-[11px] text-slate-500">Edit interests, classes database, biography details, and logout</p>
                  </div>
                </div>
                
                <span className="text-xs font-mono text-rose-500 hover:text-rose-700 font-bold flex items-center gap-1 cursor-pointer" onClick={handleLogout}>
                  <LogOut className="w-4 h-4" />
                  <span>Log Out of Kiosk</span>
                </span>
              </div>

              {/* Work splits Info left vs settings right */}
              <div className="flex-1 grid grid-cols-12 overflow-y-auto p-6 gap-6 bg-slate-50">
                
                {/* Column left (Full Student Card display) - span 5 */}
                <div className="col-span-5 space-y-4">
                  <div className="bg-white border border-slate-250 rounded-3xl p-6 shadow-sm relative overflow-hidden flex flex-col justify-between text-center space-y-4">
                    <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#32006e_1px,transparent_1px)] [background-size:16px_16px]" />
                    
                    <div className="flex flex-col items-center space-y-3 z-10">
                      {/* Portrait avatar with dynamic seed cycles */}
                      <button 
                        className="relative group focus:outline-none"
                        onClick={() => {
                          const seeds = ["sarahw", "alexc", "elenar", "marcusv", "chloep", "husky", "gold", "seattle"];
                          const currentSeedIndex = seeds.indexOf(currentUser.avatar.split("seed=")[1] || "sarahw");
                          const nextSeed = seeds[(currentSeedIndex + 1) % seeds.length];
                          
                          const updated = {
                            ...currentUser,
                            avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${nextSeed}`
                          };
                          currentUser.avatar = updated.avatar;
                          setCurrentUser(updated);
                        }}
                        title="Click to cycle portrait avatar seed!"
                      >
                        <img
                          src={currentUser.avatar}
                          alt={currentUser.name}
                          className="w-24 h-24 rounded-full bg-slate-50 border-4 border-brand-purple p-2.5 shadow-lg group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute bottom-0 right-0 bg-brand-gold text-slate-900 border-2 border-white text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase shadow">
                          Cycle
                        </div>
                      </button>

                      <div className="space-y-0.5">
                        <h3 className="font-display font-extrabold text-lg text-slate-800 tracking-tight leading-tight">
                          {currentUser.name}
                        </h3>
                        <p className="text-xs font-mono text-brand-purple font-semibold">NetID: {currentUser.netId}</p>
                        <p className="text-[11px] text-slate-400 font-medium">{currentUser.email}</p>
                      </div>
                    </div>

                    <div className="bg-slate-50 border border-slate-200/50 rounded-2xl p-4 text-xs text-left z-10 flex flex-col gap-2">
                      <div className="flex items-center justify-between animate-fade-in">
                        <span className="text-[9px] font-mono font-bold text-slate-400 uppercase block">Kiosk Bio Statement:</span>
                        <button
                          onClick={() => {
                            if (isEditingBio) {
                              const cleaned = bioInput.trim() || "Newly initialized UW student kiosk profile! Drop me an email!";
                              const updated = {
                                ...currentUser,
                                bio: cleaned
                              };
                              currentUser.bio = cleaned;
                              SAMPLE_STUDENTS[currentUser.netId].bio = cleaned;
                              setCurrentUser(updated);
                              setIsEditingBio(false);
                            } else {
                              setBioInput(currentUser.bio);
                              setIsEditingBio(true);
                            }
                          }}
                          className="text-[9.5px] uppercase font-bold tracking-tight px-2 py-1 rounded bg-brand-purple/10 text-brand-purple hover:bg-brand-purple hover:text-white transition-all cursor-pointer flex items-center gap-1 font-sans"
                        >
                          {isEditingBio ? "Save Bio" : "Edit Bio"}
                        </button>
                      </div>
                      
                      {isEditingBio ? (
                        <textarea
                          value={bioInput}
                          onChange={(e) => setBioInput(e.target.value)}
                          className="w-full h-20 p-2 text-xs border border-brand-purple/30 focus:border-brand-purple rounded-xl bg-white focus:outline-none resize-none font-sans text-slate-700 leading-normal"
                          placeholder="Tell campus peer students about your academic focus or campus interests..."
                          maxLength={160}
                        />
                      ) : (
                        <p className="text-slate-600 leading-relaxed italic">
                          "{currentUser.bio}"
                        </p>
                      )}
                    </div>

                    <div className="border-t border-slate-100 pt-4 text-xs font-mono text-slate-400 flex justify-between z-10">
                      <span>Status: Registered Student</span>
                      <span>Verified: uw.edu SSO</span>
                    </div>
                  </div>
                </div>

                {/* Column right (Classes & Interests config settings) - span 7 */}
                <div className="col-span-7 space-y-6">
                  
                  {/* CLASSES MANAGER */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
                    <h4 className="font-display font-bold text-sm text-slate-800 tracking-tight flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <BookOpen className="w-5 h-5 text-brand-purple" />
                        <span>Registered Academics Coursework</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 font-bold">({currentUser.classes.length} Enrolled)</span>
                    </h4>

                    {/* Classes list container */}
                    <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                      {currentUser.classes.length === 0 ? (
                        <p className="text-xs text-slate-400 font-light italic">No academic classes enrolled. Add some below!</p>
                      ) : (
                        currentUser.classes.map((cls) => (
                          <div
                            key={cls}
                            className="bg-slate-50 border border-slate-200/60 rounded-xl px-3 py-2 flex items-center justify-between text-xs hover:bg-slate-100 transition-colors"
                          >
                            <span className="font-semibold text-slate-700">{cls}</span>
                            <button
                              onClick={() => handleRemoveClass(cls)}
                              className="p-1 rounded text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Delete Course enrollment"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Add Class Input Form */}
                    <form onSubmit={handleAddClass} className="flex gap-2" id="class-add-form">
                      <input
                        type="text"
                        placeholder="e.g. CSE 446 - Machine Learning"
                        value={newClassInput}
                        onChange={(e) => setNewClassInput(e.target.value)}
                        required
                        className="flex-1 px-3 py-1.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-brand-purple text-slate-700"
                      />
                      <button
                        type="submit"
                        className="bg-brand-purple hover:bg-brand-purple-light text-white font-bold text-xs px-4 py-2 rounded-xl transition-colors flex items-center gap-1 shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5 text-brand-gold-light" />
                        <span>Add Class</span>
                      </button>
                    </form>
                  </div>

                  {/* INTERESTS MANAGER */}
                  <div className="bg-white border border-slate-300 rounded-3xl p-5 shadow-sm space-y-4">
                    <h4 className="font-display font-bold text-sm text-slate-800 tracking-tight flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Heart className="w-5 h-5 text-brand-purple" />
                        <span>Interest Affinity Tags</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 font-bold">({currentUser.interests.length} Tags)</span>
                    </h4>

                    {/* Interests chips list */}
                    <div className="flex flex-wrap gap-1.5 max-h-[100px] overflow-y-auto pr-1">
                      {currentUser.interests.length === 0 ? (
                        <p className="text-xs text-slate-400 font-light italic">No interest tags specified. Add some below to filter clubs!</p>
                      ) : (
                        currentUser.interests.map((interest) => (
                          <div
                            key={interest}
                            className="flex items-center gap-1 bg-brand-purple/5 border border-brand-purple/10 rounded-full py-1 pl-3 pr-2 text-xs"
                          >
                            <span className="text-brand-purple-light font-semibold text-[11px] font-display">{interest}</span>
                            <button
                              onClick={() => handleRemoveInterest(interest)}
                              className="text-slate-400 hover:text-rose-500 rounded-full hover:bg-slate-100 p-0.5 transition-colors cursor-pointer"
                              title="Delete tag"
                            >
                              <Plus className="w-3 h-3 rotate-45 shrink-0" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Add Interest mini Form */}
                    <form onSubmit={handleAddInterest} className="flex gap-2" id="interest-add-form">
                      <input
                        type="text"
                        placeholder="e.g. Rock Climbing, 3D Design, Boba Shops"
                        value={newInterestInput}
                        onChange={(e) => setNewInterestInput(e.target.value)}
                        required
                        className="flex-1 px-3 py-1.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-brand-purple text-slate-700"
                      />
                      <button
                        type="submit"
                        className="bg-brand-purple hover:bg-brand-purple-light text-white font-bold text-xs px-4 py-2 rounded-xl transition-colors flex items-center gap-1 shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5 text-brand-gold-light" />
                        <span>Add Tag</span>
                      </button>
                    </form>
                  </div>

                </div>
              </div>
            </div>
          )}

          </div>

        </div>

      </div>

      {/* MODAL 1: PRESET IN-APP EMAIL DISPATCHER */}
      {emailTargetStudent && currentUser && (
        <EmailModal
          recipient={emailTargetStudent}
          senderName={currentUser.name}
          senderEmail={currentUser.email}
          senderNetId={currentUser.netId}
          onClose={() => setEmailTargetStudent(null)}
        />
      )}

      {/* MODAL 2: STUDENT PROFILE DETAILED INSPECTOR LIGHTBOX */}
      {inspectingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col justify-between max-h-[90vh] animate-[scaleIn_0.15s_ease-out]">
            {/* Header branding block */}
            <div className="bg-brand-purple text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-brand-gold-light" />
                <h3 className="font-display font-semibold text-sm">Student Kiosk Directory Card</h3>
              </div>
              <button 
                onClick={() => setInspectingMember(null)}
                className="text-slate-300 hover:text-white font-bold p-1 hover:bg-white/10 rounded-full transition-colors font-mono"
              >
                ✕
              </button>
            </div>

            {/* Profile information */}
            <div className="p-5 flex-1 overflow-y-auto space-y-4">
              <div className="flex gap-4 items-center border-b border-slate-100 pb-3">
                <img
                  src={inspectingMember.avatar}
                  alt={inspectingMember.name}
                  className="w-16 h-16 rounded-full bg-slate-50 border border-slate-200 p-1"
                />
                <div>
                  <h4 className="font-display font-extrabold text-base text-slate-800 tracking-tight leading-tight">{inspectingMember.name}</h4>
                  <p className="text-xs font-mono text-brand-purple mt-0.5">NetID: {inspectingMember.netId}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{inspectingMember.email}</p>
                </div>
              </div>

              {/* Bio block */}
              <div className="space-y-1">
                <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Student Biography</span>
                <p className="text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-xl p-3 leading-relaxed italic">
                  "{inspectingMember.bio}"
                </p>
              </div>

              {/* Classes block */}
              <div className="space-y-1.5">
                <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Academics enrolled</span>
                <div className="flex flex-col gap-1">
                  {inspectingMember.classes.map((c) => (
                    <div key={c} className="text-xs text-slate-700 font-medium pl-2.5 border-l-2 border-brand-purple flex items-center gap-1 leading-relaxed">
                      📚 {c}
                    </div>
                  ))}
                </div>
              </div>

              {/* Interests block */}
              <div className="space-y-1.5">
                <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Interests & Affinities</span>
                <div className="flex flex-wrap gap-1.5">
                  {inspectingMember.interests.map((tag) => (
                    <span key={tag} className="text-[10px] bg-brand-purple/5 text-brand-purple font-semibold border border-brand-purple/15 rounded-full py-0.5 px-2.5 font-display">
                      ⚡ {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer with email direct dispatch link */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center gap-2 shrink-0">
              {currentUser && inspectingMember.netId !== currentUser.netId ? (
                <button
                  onClick={() => {
                    setInspectingMember(null);
                    setEmailTargetStudent(inspectingMember);
                  }}
                  className="w-full py-2.5 bg-brand-purple hover:bg-brand-purple-light text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-brand-purple/10 transition-colors cursor-pointer"
                >
                  <Mail className="w-3.5 h-3.5 text-brand-gold-light" />
                  <span>Send email via UW Mail Client</span>
                </button>
              ) : (
                <button
                  onClick={() => setInspectingMember(null)}
                  className="w-full py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Dismiss Directory Card
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: EVENT RSVP CANCEL CONFIRMATION DIALOG */}
      {eventToCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col justify-between animate-[scaleIn_0.15s_ease-out]">
            {/* Header branding block with red/amber theme */}
            <div className="bg-rose-800 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-brand-gold animate-pulse animate-bounce" />
                <h3 className="font-display font-semibold text-xs tracking-tight">Cancel RSVP</h3>
              </div>
              <button 
                onClick={() => setEventToCancel(null)}
                className="text-rose-200 hover:text-white font-bold p-1 hover:bg-white/10 rounded-full transition-colors font-mono"
              >
                ✕
              </button>
            </div>

            {/* Core dialog question */}
            <div className="p-5 text-center space-y-3.5">
              <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-1">
                <Calendar className="w-5 h-5" />
              </div>
              <div className="space-y-1 text-center">
                <h4 className="font-extrabold text-slate-800 text-sm">Cancel reservation?</h4>
                <p className="text-xs text-slate-500 leading-normal px-2">
                  Are you sure you want to cancel your RSVP reservation for &ldquo;<span className="font-semibold text-slate-755">{eventToCancel.title}</span>&rdquo;? You can re-register anytime.
                </p>
              </div>
            </div>

            {/* Confirmation actions buttons */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center gap-2.5">
              <button
                onClick={() => setEventToCancel(null)}
                className="flex-1 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold text-[11px] rounded-lg transition-all cursor-pointer"
              >
                No, Keep RSVP
              </button>
              <button
                onClick={() => {
                  handleToggleEventRegistration(eventToCancel.id, false);
                  setEventToCancel(null);
                }}
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-750 text-white font-bold text-[11px] rounded-lg shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                Yes, Cancel RSVP
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
