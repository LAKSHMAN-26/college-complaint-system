# College Grievance & Complaint Management System Specification

## Overview
A comprehensive MERN (MongoDB, Express.js, React, Node.js) web application designed for educational institutions to manage, route, track, and resolve campus-wide complaints efficiently.

## Core Features
1. **Three-Tier Role-Based Access Control**:
   - `STUDENT`: Register, submit complaints with attachments, track status history timeline, add comments, close resolved complaints, reopen unresolved ones, rate resolution.
   - `STAFF`: View department-assigned tickets, update workflow progress to `IN_PROGRESS`, add comments, upload resolution proof, mark tickets as `RESOLVED`.
   - `ADMIN`: Global analytics dashboard with Recharts, search & multi-filter across all complaints, department & staff assignment, lifecycle status management, department CRUD, and staff management.

2. **Complaint Lifecycle Pipeline**:
   `SUBMITTED` → `UNDER_REVIEW` → `ASSIGNED` → `IN_PROGRESS` → `RESOLVED` → `CLOSED` (with `REOPENED` and `REJECTED` transitions).

3. **Status History & Audit Trail**:
   Every status change logs the timestamp, actor, and comment, displayed in a visual timeline.

4. **Comments & Communication**:
   Interactive discussion thread on each complaint between students, staff, and admins.

5. **Attachment Handling**:
   Multer-based upload with automatic support for both local file storage (`/uploads`) and Cloudinary cloud storage.

6. **Automated Seed Data**:
   Preconfigured demo users for instant evaluation and testing.
