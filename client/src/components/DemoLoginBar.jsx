// import React, { useState } from 'react';
// import { useAuth } from '../context/AuthContext';
// import { useNavigate } from 'react-router-dom';
// import { Shield, Wrench, UserCheck, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
// import toast from 'react-hot-toast';

 const DemoLoginBar = () => {
//   const { login, user } = useAuth();
//   const navigate = useNavigate();
//   const [isOpen, setIsOpen] = useState(true);
//   const [loadingRole, setLoadingRole] = useState(null);

//   const demoAccounts = [
//     {
//       role: 'ADMIN',
//       title: 'Administrator',
//       name: 'Dr. Rajesh',
//       email: 'admin@campus.edu',
//       pass: 'Admin@123',
//       icon: Shield,
//       color: 'bg-indigo-600 hover:bg-indigo-700 text-white',
//       badge: 'Admin',
//       redirect: '/admin/dashboard',
//     },
//     {
//       role: 'STAFF',
//       title: 'IT Support Staff',
//       name: 'Ravi Verma',
//       email: 'itstaff@campus.edu',
//       pass: 'Staff@123',
//       icon: Wrench,
//       color: 'bg-emerald-600 hover:bg-emerald-700 text-white',
//       badge: 'IT Staff',
//       redirect: '/staff/dashboard',
//     },
//     {
//       role: 'STAFF',
//       title: 'Maintenance Staff',
//       name: 'Suresh Kumar',
//       email: 'maintenancestaff@campus.edu',
//       pass: 'Staff@123',
//       icon: Wrench,
//       color: 'bg-teal-600 hover:bg-teal-700 text-white',
//       badge: 'Civil Staff',
//       redirect: '/staff/dashboard',
//     },
//     {
//       role: 'STUDENT',
//       title: 'Student 1',
//       name: 'Laxman (CSE)',
//       email: 'student@campus.edu',
//       pass: 'Student@123',
//       icon: UserCheck,
//       color: 'bg-blue-600 hover:bg-blue-700 text-white',
//       badge: 'Student 1',
//       redirect: '/student/dashboard',
//     },
//     {
//       role: 'STUDENT',
//       title: 'Student 2',
//       name: 'Priya (ECE)',
//       email: 'student2@campus.edu',
//       pass: 'Student@123',
//       icon: UserCheck,
//       color: 'bg-sky-600 hover:bg-sky-700 text-white',
//       badge: 'Student 2',
//       redirect: '/student/dashboard',
//     },
//   ];

//   const handleQuickLogin = async (acc) => {
//     try {
//       setLoadingRole(acc.email);
//       const loggedUser = await login(acc.email, acc.pass);
//       toast.success(`Logged in as ${loggedUser.name} (${loggedUser.role})`);
//       navigate(acc.redirect);
//     } catch (err) {
//       toast.error('Quick login failed: ' + err.message);
//     } finally {
//       setLoadingRole(null);
//     }
//   };

//   return (
//     <div className="bg-slate-900 text-white text-xs border-b border-slate-800 transition-all">
//       <div className="max-w-7xl mx-auto px-4 py-1.5 flex items-center justify-between">
//         <div className="flex items-center gap-2">
//           <span className="inline-flex items-center gap-1 font-semibold text-amber-400">
//             <Sparkles className="w-3.5 h-3.5" /> 1-Click Demo Accounts:
//           </span>
//           <span className="hidden sm:inline text-slate-400">
//             Switch roles to test Student, Staff & Admin portals
//           </span>
//         </div>

//         <button
//           onClick={() => setIsOpen(!isOpen)}
//           className="text-slate-400 hover:text-white flex items-center gap-1 font-medium text-xs px-2 py-0.5 rounded bg-slate-800"
//         >
//           {isOpen ? 'Hide Switcher' : 'Show Demo Logins'}
//           {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
//         </button>
//       </div>

//       {isOpen && (
//         <div className="bg-slate-950/70 border-t border-slate-800/80 px-4 py-2">
//           <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-2">
//             {demoAccounts.map((acc) => {
//               const isCurrent = user?.email === acc.email;
//               const Icon = acc.icon;
//               return (
//                 <button
//                   key={acc.email}
//                   onClick={() => handleQuickLogin(acc)}
//                   disabled={loadingRole === acc.email}
//                   className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all shadow-sm ${
//                     isCurrent
//                       ? 'ring-2 ring-amber-400 ring-offset-1 ring-offset-slate-900 bg-indigo-600 text-white'
//                       : acc.color
//                   } ${loadingRole === acc.email ? 'opacity-50 cursor-wait' : ''}`}
//                 >
//                   <Icon className="w-3.5 h-3.5" />
//                   <span>{acc.badge}:</span>
//                   <span className="font-semibold">{acc.name}</span>
//                   {isCurrent && (
//                     <span className="ml-1 px-1.5 py-0.2 bg-amber-400 text-slate-950 text-[10px] font-bold rounded">
//                       Active
//                     </span>
//                   )}
//                 </button>
//               );
//             })}
//           </div>
//         </div>
//       )}
//     </div>
//   );
 };

 export default DemoLoginBar;
