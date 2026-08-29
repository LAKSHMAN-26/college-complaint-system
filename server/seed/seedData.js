const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Department = require('../models/Department');
const Complaint = require('../models/Complaint');
const StatusHistory = require('../models/StatusHistory');
const Comment = require('../models/Comment');
const Notification = require('../models/Notification');
const {
  ROLES,
  COMPLAINT_STATUS,
  COMPLAINT_PRIORITY,
  NOTIFICATION_TYPES,
} = require('../utils/constants');

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/college_complaint_db';
    console.log(`Connecting to database at ${mongoUri}...`);
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
    });
    console.log('Connected to MongoDB.');

    // Clear existing data
    console.log('Clearing old records...');
    await Promise.all([
      User.deleteMany({}),
      Department.deleteMany({}),
      Complaint.deleteMany({}),
      StatusHistory.deleteMany({}),
      Comment.deleteMany({}),
      Notification.deleteMany({}),
    ]);

    // 1. Create Departments
    console.log('Creating Departments...');
    const deptIT = await Department.create({
      name: 'IT Support & Networking',
      description: 'Responsible for campus Wi-Fi, lab systems, servers, and computer hardware.',
      contactEmail: 'itsupport@campus.edu',
      contactPhone: '+91 98765 43210',
    });

    const deptMaintenance = await Department.create({
      name: 'Maintenance & Infrastructure',
      description: 'Handles civil work, carpentry, air conditioning, plumbing, and structural repairs.',
      contactEmail: 'maintenance@campus.edu',
      contactPhone: '+91 98765 43211',
    });

    const deptHostel = await Department.create({
      name: 'Hostel Administration',
      description: 'Manages student accommodation, room amenities, hostel mess, and security.',
      contactEmail: 'hosteladmin@campus.edu',
      contactPhone: '+91 98765 43212',
    });

    const deptElectrical = await Department.create({
      name: 'Electrical Engineering & Power',
      description: 'Power backup, campus lighting, electrical wiring, switches, and fans.',
      contactEmail: 'electrical@campus.edu',
      contactPhone: '+91 98765 43213',
    });

    const deptSanitation = await Department.create({
      name: 'Sanitation & Cleanliness',
      description: 'Daily campus housekeeping, hygiene maintenance, and waste disposal.',
      contactEmail: 'cleanliness@campus.edu',
      contactPhone: '+91 98765 43214',
    });

    // 2. Create Users
    console.log('Creating Users with hashed passwords...');
    // Admin
    const adminUser = await User.create({
      name: 'Dr. Rajesh Sharma',
      email: 'admin@campus.edu',
      password: 'Admin@123',
      role: ROLES.ADMIN,
      phone: '+91 99000 11223',
    });

    // IT Staff
    const itStaff = await User.create({
      name: 'Ravi Verma (IT Tech)',
      email: 'itstaff@campus.edu',
      password: 'Staff@123',
      role: ROLES.STAFF,
      department: deptIT.name,
      departmentRef: deptIT._id,
      phone: '+91 98111 22334',
    });

    // Maintenance Staff
    const maintenanceStaff = await User.create({
      name: 'Suresh Kumar (Civil Lead)',
      email: 'maintenancestaff@campus.edu',
      password: 'Staff@123',
      role: ROLES.STAFF,
      department: deptMaintenance.name,
      departmentRef: deptMaintenance._id,
      phone: '+91 98222 33445',
    });

    // Link staff to departments
    deptIT.staff.push(itStaff._id);
    await deptIT.save();
    deptMaintenance.staff.push(maintenanceStaff._id);
    await deptMaintenance.save();

    // Students
    const student1 = await User.create({
      name: 'Laxman Kumar',
      email: 'student@campus.edu',
      password: 'Student@123',
      role: ROLES.STUDENT,
      studentId: '22CS001',
      department: 'Computer Science & Engineering',
      phone: '+91 97333 44556',
    });

    const student2 = await User.create({
      name: 'Priya Sharma',
      email: 'student2@campus.edu',
      password: 'Student@123',
      role: ROLES.STUDENT,
      studentId: '23EC045',
      department: 'Electronics & Communication',
      phone: '+91 97444 55667',
    });

    // 3. Create Sample Complaints
    console.log('Creating Seed Complaints & Timelines...');

    // Complaint 1 - IN_PROGRESS (Wi-Fi issue)
    const cmp1 = await Complaint.create({
      complaintId: 'CMP-2026-0001',
      title: 'High-speed Wi-Fi not working in CSE Lab 2',
      description:
        'The main access point in CSE Lab 2 is continuously dropping connections during practical sessions. Over 40 workstations are unable to connect to the intranet.',
      category: 'Wi-Fi / Internet',
      location: 'Academic Block A, 2nd Floor, Room 204 (CSE Lab 2)',
      priority: COMPLAINT_PRIORITY.HIGH,
      status: COMPLAINT_STATUS.IN_PROGRESS,
      student: student1._id,
      department: deptIT._id,
      assignedStaff: itStaff._id,
      attachments: [
        {
          url: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&auto=format&fit=crop&q=80',
          filename: 'router_error_light.jpg',
          size: 245000,
          mimetype: 'image/jpeg',
        },
      ],
    });

    await StatusHistory.create([
      {
        complaint: cmp1._id,
        status: COMPLAINT_STATUS.SUBMITTED,
        changedBy: student1._id,
        comment: 'Complaint submitted by Laxman Kumar.',
        createdAt: new Date(Date.now() - 48 * 3600 * 1000),
      },
      {
        complaint: cmp1._id,
        status: COMPLAINT_STATUS.UNDER_REVIEW,
        changedBy: adminUser._id,
        comment: 'Verified priority and severity with lab coordinator.',
        createdAt: new Date(Date.now() - 36 * 3600 * 1000),
      },
      {
        complaint: cmp1._id,
        status: COMPLAINT_STATUS.ASSIGNED,
        changedBy: adminUser._id,
        department: deptIT._id,
        assignedStaff: itStaff._id,
        comment: 'Assigned to IT Support & Networking team (Ravi Verma).',
        createdAt: new Date(Date.now() - 24 * 3600 * 1000),
      },
      {
        complaint: cmp1._id,
        status: COMPLAINT_STATUS.IN_PROGRESS,
        changedBy: itStaff._id,
        comment: 'Replaced faulty PoE injector and now configuring secondary SSID.',
        createdAt: new Date(Date.now() - 12 * 3600 * 1000),
      },
    ]);

    await Comment.create([
      {
        complaint: cmp1._id,
        user: adminUser._id,
        message: 'We have escalated this to Ravi from IT Support. Testing replacement router.',
      },
      {
        complaint: cmp1._id,
        user: itStaff._id,
        message: 'Inspecting router switch port. Will complete firmware upgrade by 4 PM today.',
      },
      {
        complaint: cmp1._id,
        user: student1._id,
        message: 'Thank you for the quick response! We have our lab exam tomorrow at 10 AM.',
      },
    ]);

    // Complaint 2 - RESOLVED (Water leakage)
    const cmp2 = await Complaint.create({
      complaintId: 'CMP-2026-0002',
      title: 'Water pipe leakage on 3rd Floor Hostel Washroom',
      description:
        'Major water leakage from main valve causing flooding near room 312 in Boys Hostel Block B.',
      category: 'Water Supply',
      location: 'Boys Hostel Block B, 3rd Floor Common Washroom',
      priority: COMPLAINT_PRIORITY.HIGH,
      status: COMPLAINT_STATUS.RESOLVED,
      student: student1._id,
      department: deptMaintenance._id,
      assignedStaff: maintenanceStaff._id,
      resolution: {
        text: 'The damaged brass valve was replaced and joints were sealed with industrial sealant. Water pressure tested successfully.',
        resolvedAt: new Date(Date.now() - 4 * 3600 * 1000),
        resolvedBy: maintenanceStaff._id,
        evidence: [
          {
            url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&auto=format&fit=crop&q=80',
            filename: 'valve_repaired.jpg',
            size: 312000,
            mimetype: 'image/jpeg',
          },
        ],
      },
    });

    await StatusHistory.create([
      {
        complaint: cmp2._id,
        status: COMPLAINT_STATUS.SUBMITTED,
        changedBy: student1._id,
        comment: 'Complaint submitted.',
        createdAt: new Date(Date.now() - 72 * 3600 * 1000),
      },
      {
        complaint: cmp2._id,
        status: COMPLAINT_STATUS.ASSIGNED,
        changedBy: adminUser._id,
        department: deptMaintenance._id,
        assignedStaff: maintenanceStaff._id,
        comment: 'Routed to plumbing wing under Maintenance.',
        createdAt: new Date(Date.now() - 48 * 3600 * 1000),
      },
      {
        complaint: cmp2._id,
        status: COMPLAINT_STATUS.IN_PROGRESS,
        changedBy: maintenanceStaff._id,
        comment: 'Plumber dispatched to Block B.',
        createdAt: new Date(Date.now() - 20 * 3600 * 1000),
      },
      {
        complaint: cmp2._id,
        status: COMPLAINT_STATUS.RESOLVED,
        changedBy: maintenanceStaff._id,
        comment: 'Fixed brass valve and tested water lines.',
        createdAt: new Date(Date.now() - 4 * 3600 * 1000),
      },
    ]);

    // Complaint 3 - CLOSED with Feedback (Library AC)
    const cmp3 = await Complaint.create({
      complaintId: 'CMP-2026-0003',
      title: 'Central Library 2nd Floor reading room AC not cooling',
      description:
        'Temperature in the 2nd floor reading hall is very warm due to blower stoppage.',
      category: 'Infrastructure',
      location: 'Central Library, 2nd Floor Reference Section',
      priority: COMPLAINT_PRIORITY.MEDIUM,
      status: COMPLAINT_STATUS.CLOSED,
      student: student2._id,
      department: deptMaintenance._id,
      assignedStaff: maintenanceStaff._id,
      resolution: {
        text: 'HVAC filters were cleaned and refrigerant level topped up.',
        resolvedAt: new Date(Date.now() - 100 * 3600 * 1000),
        resolvedBy: maintenanceStaff._id,
      },
      closedAt: new Date(Date.now() - 80 * 3600 * 1000),
      feedback: {
        rating: 5,
        comment: 'Fixed very fast! Great job by the maintenance team.',
        createdAt: new Date(Date.now() - 80 * 3600 * 1000),
      },
    });

    await StatusHistory.create([
      {
        complaint: cmp3._id,
        status: COMPLAINT_STATUS.SUBMITTED,
        changedBy: student2._id,
        comment: 'Complaint filed by Priya Sharma.',
        createdAt: new Date(Date.now() - 120 * 3600 * 1000),
      },
      {
        complaint: cmp3._id,
        status: COMPLAINT_STATUS.ASSIGNED,
        changedBy: adminUser._id,
        department: deptMaintenance._id,
        assignedStaff: maintenanceStaff._id,
        createdAt: new Date(Date.now() - 110 * 3600 * 1000),
      },
      {
        complaint: cmp3._id,
        status: COMPLAINT_STATUS.RESOLVED,
        changedBy: maintenanceStaff._id,
        comment: 'HVAC serviced.',
        createdAt: new Date(Date.now() - 100 * 3600 * 1000),
      },
      {
        complaint: cmp3._id,
        status: COMPLAINT_STATUS.CLOSED,
        changedBy: student2._id,
        comment: 'Verified and closed by student with 5-star rating.',
        createdAt: new Date(Date.now() - 80 * 3600 * 1000),
      },
    ]);

    // Complaint 4 - SUBMITTED (Classroom fan)
    const cmp4 = await Complaint.create({
      complaintId: 'CMP-2026-0004',
      title: 'Ceiling fan regulator sparking in Lecture Hall 102',
      description:
        'The 3rd ceiling fan near the teacher podium sparks when switched on and makes heavy vibrating noise.',
      category: 'Electricity',
      location: 'Science Block, Lecture Hall 102',
      priority: COMPLAINT_PRIORITY.CRITICAL,
      status: COMPLAINT_STATUS.SUBMITTED,
      student: student2._id,
    });

    await StatusHistory.create({
      complaint: cmp4._id,
      status: COMPLAINT_STATUS.SUBMITTED,
      changedBy: student2._id,
      comment: 'Complaint submitted by Priya Sharma.',
      createdAt: new Date(Date.now() - 2 * 3600 * 1000),
    });

    // 4. Sample Notifications
    console.log('Creating Notifications...');
    await Notification.create([
      {
        user: adminUser._id,
        complaint: cmp4._id,
        message: 'New CRITICAL complaint: [CMP-2026-0004] Ceiling fan regulator sparking',
        type: NOTIFICATION_TYPES.COMPLAINT_CREATED,
        link: `/admin/complaints/${cmp4._id}`,
      },
      {
        user: student1._id,
        complaint: cmp1._id,
        message: 'Your ticket [CMP-2026-0001] is currently IN PROGRESS with Ravi Verma.',
        type: NOTIFICATION_TYPES.STATUS_UPDATED,
        link: `/student/complaints/${cmp1._id}`,
      },
      {
        user: student1._id,
        complaint: cmp2._id,
        message: 'Your ticket [CMP-2026-0002] has been marked as RESOLVED. Please review and close.',
        type: NOTIFICATION_TYPES.COMPLAINT_RESOLVED,
        link: `/student/complaints/${cmp2._id}`,
      },
    ]);

    console.log('\n======================================================');
    console.log('  Database Seeding Completed Successfully! 🚀');
    console.log('======================================================');
    console.log('\nDefault Demo Accounts:');
    console.log('  1. ADMIN:');
    console.log('     Email:    admin@campus.edu');
    console.log('     Password: Admin@123');
    console.log('  2. STAFF (IT Support):');
    console.log('     Email:    itstaff@campus.edu');
    console.log('     Password: Staff@123');
    console.log('  3. STAFF (Maintenance):');
    console.log('     Email:    maintenancestaff@campus.edu');
    console.log('     Password: Staff@123');
    console.log('  4. STUDENT 1:');
    console.log('     Email:    student@campus.edu');
    console.log('     Password: Student@123');
    console.log('  5. STUDENT 2:');
    console.log('     Email:    student2@campus.edu');
    console.log('     Password: Student@123');
    console.log('======================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  }
};

seedData();
