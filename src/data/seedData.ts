import { Course, UserProfile, NotificationItem, TaskStatus } from '../types/eduflow';

export const initialUserProfile: UserProfile = {
  name: 'Alex Rivera',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  planTier: 'Pro Student',
  email: 'alex.rivera@example.com',
  activeCourseId: 'aws-saa-c03',
  totalHoursStudied: 48.5,
  totalCertifications: 2,
  weeklyTargetHours: 15,
  preferences: {
    preferredStudyDays: [1, 2, 3, 4, 5],
    preferredStudyTime: 'morning',
    streakReminders: true,
    examCountdownAlerts: true,
    newResourceAlerts: true,
    accentColor: '#8B5CF6',
  },
};

export const initialNotifications: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Exam Countdown Alert ⏳',
    message: 'AWS Solutions Architect exam is in 14 days. Review high-yield topics today!',
    type: 'deadline',
    timestamp: '10m ago',
    read: false,
    linkTab: 'dashboard',
  },
  {
    id: 'notif-2',
    title: '🔥 7-Day Streak Milestone!',
    message: 'You have studied 7 days in a row. You earned the Consistent Learner badge!',
    type: 'streak',
    timestamp: '2h ago',
    read: false,
    linkTab: 'analytics',
  },
  {
    id: 'notif-3',
    title: 'New Cheat Sheet Available 📑',
    message: 'AWS VPC & Networking Architecture Cheat Sheet has been added to your Library.',
    type: 'resource',
    timestamp: '1d ago',
    read: true,
    linkTab: 'library',
  },
  {
    id: 'notif-4',
    title: 'Weekly Target Update 🎯',
    message: 'You have completed 12.5 of 20 study hours target this week. Almost there!',
    type: 'system',
    timestamp: '2d ago',
    read: true,
    linkTab: 'analytics',
  },
];

export const seedCourses: Course[] = [
  {
    id: 'aws-saa-c03',
    title: 'AWS Solutions Architect',
    code: 'SAA-C03',
    category: 'Cloud Architecture',
    examDate: '2026-09-24', // calculated to represent target date
    targetHoursPerWeek: 20,
    studiedHoursThisWeek: 12.5,
    streakDays: 7,
    completedSessionsToday: 3,
    phases: [
      {
        id: 'aws-phase-1',
        phaseNumber: 1,
        title: 'Cloud Fundamentals & Identity Governance',
        description: 'Core AWS concepts, global infrastructure, IAM policies, STS AssumeRole, and multi-account organization security boundaries.',
        status: 'completed',
        dateRange: 'May 15 – May 24',
        progressPercent: 100,
        topicsCovered: ['IAM Roles & SCPs', 'CloudWatch', 'AWS Organizations', 'Billing Alarms', 'STS Tokens'],
        subtopics: [
          { id: 'sub-1', title: 'Global Infrastructure: Regions & AZs', durationMinutes: 30, completed: true, type: 'video' },
          { id: 'sub-2', title: 'IAM Policies, Roles & Multi-Factor Auth', durationMinutes: 45, completed: true, type: 'video' },
          { id: 'sub-3', title: 'Hands-on: Provisioning Cross-Account Access', durationMinutes: 60, completed: true, type: 'lab' },
          { id: 'sub-4', title: 'Phase 1 Assessment & Quiz', durationMinutes: 25, completed: true, type: 'quiz' },
        ],
      },
      {
        id: 'aws-phase-2',
        phaseNumber: 2,
        title: 'High Availability & Resilient Compute Architectures',
        description: 'Designing fault-tolerant EC2 auto-scaling tiers, Application Load Balancers, complex custom VPC subnets, and Route 53 failover.',
        status: 'in_progress',
        dateRange: 'May 25 – June 4',
        progressPercent: 64,
        topicsCovered: ['EC2 Auto Scaling', 'ALB vs NLB', 'VPC Peering', 'NAT Gateways', 'Route 53 DNS'],
        nextVideo: {
          type: 'video',
          label: 'NEXT VIDEO',
          title: 'VPC Peering & Transit Gateway Deep Dive',
          duration: '28 min',
          iconName: 'video',
        },
        upcomingLab: {
          type: 'lab',
          label: 'UPCOMING LAB',
          title: 'Multi-AZ Auto Scaling & ALB Deployment',
          duration: '45 min',
          iconName: 'terminal',
        },
        subtopics: [
          { id: 'sub-5', title: 'EC2 Instance Types, Placement Groups & Pricing', durationMinutes: 40, completed: true, type: 'video' },
          { id: 'sub-6', title: 'ALB vs NLB Routing Rules & Target Groups', durationMinutes: 45, completed: true, type: 'video' },
          { id: 'sub-7', title: 'VPC Subnets, Route Tables & NAT Gateways', durationMinutes: 50, completed: true, type: 'video' },
          { id: 'sub-8', title: 'VPC Peering & Transit Gateway Deep Dive', durationMinutes: 28, completed: true, type: 'video' },
          { id: 'sub-9', title: 'Multi-AZ Auto Scaling & ALB Deployment', durationMinutes: 45, completed: false, type: 'lab' },
          { id: 'sub-10', title: 'Route 53 Latency, Geolocation & DNS Failover', durationMinutes: 35, completed: false, type: 'reading' },
          { id: 'sub-11', title: 'Compute & Networking Practice Drill #2', durationMinutes: 30, completed: false, type: 'quiz' },
        ],
      },
      {
        id: 'aws-phase-3',
        phaseNumber: 3,
        title: 'Storage Optimization & Database Resilience',
        description: 'Scalable data persistence with S3 Intelligent-Tiering, multi-AZ RDS databases, DynamoDB Global Tables, and Aurora Serverless.',
        status: 'locked',
        dateRange: 'June 5 – June 10',
        progressPercent: 0,
        unlockRequirement: 'Complete Phase 2 (Auto Scaling & VPC Lab)',
        topicsCovered: ['S3 Intelligent-Tiering', 'EBS Provisioned IOPS', 'RDS Multi-AZ', 'DynamoDB DAX', 'Aurora Serverless'],
        subtopics: [
          { id: 'sub-12', title: 'S3 Storage Classes & Lifecycle Policies', durationMinutes: 40, completed: false, type: 'video' },
          { id: 'sub-13', title: 'EBS Volume Types: gp3 vs io2 Block Express', durationMinutes: 35, completed: false, type: 'reading' },
          { id: 'sub-14', title: 'RDS Multi-AZ vs Read Replicas Comparison', durationMinutes: 45, completed: false, type: 'video' },
          { id: 'sub-15', title: 'DynamoDB Partition Keys, GSI and LSI', durationMinutes: 50, completed: false, type: 'video' },
          { id: 'sub-16', title: 'Hands-on: Disaster Recovery Failover Lab', durationMinutes: 60, completed: false, type: 'lab' },
        ],
      },
      {
        id: 'aws-phase-4',
        phaseNumber: 4,
        title: 'Final Exam Cram & Full-Length Practice Exams',
        description: 'Timed full-length mock examinations, high-probability trap questions, exam-day time management strategies, and final readiness review.',
        status: 'locked',
        dateRange: 'June 11 – June 12',
        progressPercent: 0,
        unlockRequirement: 'Complete Phase 3 (Database Resilience)',
        topicsCovered: ['Full Mock Exam 1', 'Full Mock Exam 2', 'Trap Questions Review', 'Cheat Sheet Recaps'],
        subtopics: [
          { id: 'sub-17', title: 'Full-Length Timed Practice Exam 1 (65 Qs)', durationMinutes: 130, completed: false, type: 'practice' },
          { id: 'sub-18', title: 'Deep-dive Analysis of Practice Exam 1 Errors', durationMinutes: 60, completed: false, type: 'reading' },
          { id: 'sub-19', title: 'Full-Length Timed Practice Exam 2 (65 Qs)', durationMinutes: 130, completed: false, type: 'practice' },
          { id: 'sub-20', title: 'Exam Day Readiness Checklist & Quick Cram', durationMinutes: 40, completed: false, type: 'reading' },
        ],
      },
    ],
    agenda: [
      {
        id: 'task-1',
        title: 'IAM Role Delegation & Cross-Account Access',
        type: 'video',
        durationMinutes: 45,
        status: 'completed',
        phaseId: 'aws-phase-1',
        completedAt: '2026-09-09T09:30:00Z',
      },
      {
        id: 'task-2',
        title: 'Deploy Application Load Balancer with SSL',
        type: 'lab',
        durationMinutes: 60,
        status: 'completed',
        phaseId: 'aws-phase-2',
        completedAt: '2026-09-09T11:45:00Z',
      },
      {
        id: 'task-3',
        title: 'VPC Peering & Transit Gateway Deep Dive',
        type: 'video',
        durationMinutes: 28,
        status: 'completed',
        phaseId: 'aws-phase-2',
        completedAt: '2026-09-09T14:15:00Z',
      },
      {
        id: 'task-4',
        title: 'Multi-AZ Auto Scaling & ALB Deployment',
        type: 'lab',
        durationMinutes: 45,
        status: 'current',
        phaseId: 'aws-phase-2',
      },
      {
        id: 'task-5',
        title: 'Route53 Routing Policies & DNS Failover',
        type: 'quiz',
        durationMinutes: 20,
        status: 'locked',
        phaseId: 'aws-phase-2',
      },
      {
        id: 'task-6',
        title: 'Compute & Networking Practice Drill #2',
        type: 'practice',
        durationMinutes: 35,
        status: 'locked',
        phaseId: 'aws-phase-2',
      },
    ],
    resources: [
      {
        id: 'res-1',
        title: 'AWS SAA-C03 Comprehensive Exam Cheat Sheet',
        type: 'cheatsheet',
        category: 'Quick Reference',
        estimatedTime: '15 min read',
        isBookmarked: true,
        description: 'Consolidated memory triggers, service limits, architectural patterns, and exam trap alerts.',
        tags: ['Cheat Sheet', 'SAA-C03', 'High Yield'],
        contentMarkdown: `# AWS Solutions Architect (SAA-C03) Exam Cheat Sheet

## 1. Storage Comparison
| Storage Type | Use Case | Protocol | Max Throughput |
|--------------|----------|----------|----------------|
| **S3 Standard** | General object storage | HTTP/REST | Unlimited |
| **S3 Glacier Flexible** | Archive (3-5h retrieval) | HTTP/REST | Batch |
| **EBS gp3** | General SSD block storage | Block (NVMe) | Up to 1,000 MB/s |
| **EFS** | Multi-AZ Linux shared storage | NFSv4 | Up to 10+ GB/s |
| **FSx for Lustre** | High performance compute | POSIX | Hundreds of GB/s |

## 2. Decoupling & Event-Driven Patterns
- **SQS Standard**: At-least-once delivery, best-effort ordering, nearly unlimited throughput.
- **SQS FIFO**: Exactly-once processing, strict first-in-first-out, up to 3,000 msgs/s with batching.
- **SNS**: Fan-out architecture (1 message to multiple SQS queues, Lambdas, or HTTP endpoints).
- **EventBridge**: Content-based filtering, schema registry, 3rd party SaaS integration.

## 3. High Availability Checklist
- ALB across at least 2 Public Subnets in different AZs.
- Auto Scaling Group with Target Tracking policy on EC2 instances across 2+ Private Subnets.
- Multi-AZ RDS for automated failover (synchronous replication) + Read Replicas (asynchronous) for read scale.`,
        flashcards: [
          { id: 'fc-1', question: 'What is the primary difference between S3 Transfer Acceleration and CloudFront for uploads?', answer: 'Transfer Acceleration uses CloudFront Edge locations to route traffic over AWS backbone directly to an S3 bucket; CloudFront provides edge caching for both reads and writes.', tag: 'Storage' },
          { id: 'fc-2', question: 'How do you encrypt existing unencrypted EBS volumes without data loss?', answer: 'Create a snapshot of the unencrypted volume, copy the snapshot while enabling encryption, then create a new encrypted volume from that copied snapshot.', tag: 'Security' },
          { id: 'fc-3', question: 'When should you choose Aurora Global Databases over Multi-Region RDS Read Replicas?', answer: 'Aurora Global Databases provide sub-second cross-region replication latency and fast failover (<1 minute) with minimal performance impact on the primary database.', tag: 'Databases' },
        ]
      },
      {
        id: 'res-2',
        title: 'AWS Well-Architected Framework: 6 Pillars Deep Dive',
        type: 'doc',
        category: 'Architecture Guides',
        estimatedTime: '30 min read',
        isBookmarked: true,
        description: 'Official design principles for Operational Excellence, Security, Reliability, Performance, Cost, and Sustainability.',
        tags: ['Well-Architected', 'Best Practices', 'Pillars'],
        contentMarkdown: `# AWS Well-Architected Framework

The Well-Architected Framework helps cloud architects build secure, high-performing, resilient, and efficient infrastructure for their applications.

### The 6 Pillars:
1. **Operational Excellence**: Run and monitor systems to deliver business value and continually improve processes.
2. **Security**: Protect information, systems, and assets while delivering business value through risk assessments and mitigation strategies.
3. **Reliability**: Ensure a workload performs its intended function correctly and consistently when expected.
4. **Performance Efficiency**: Use computing resources efficiently to meet requirements and maintain efficiency as demand changes.
5. **Cost Optimization**: Avoid unnecessary costs and optimize ongoing cloud spend.
6. **Sustainability**: Minimize the environmental impacts of running cloud workloads.`,
      },
      {
        id: 'res-3',
        title: 'Hands-on Lab Walkthrough: VPC Peering & Transit Gateway',
        type: 'lab',
        category: 'Hands-on Labs',
        estimatedTime: '45 min lab',
        isBookmarked: false,
        description: 'Step-by-step interactive CLI and console guide to building a hub-and-spoke multi-VPC network topology.',
        tags: ['VPC', 'Transit Gateway', 'Networking'],
        contentMarkdown: `# Lab: Multi-VPC Architecture with Transit Gateway

### Objectives:
- Create 3 distinct VPCs (Prod, Dev, Shared Services).
- Provision an AWS Transit Gateway and configure VPC Attachments.
- Update Route Tables to enable private routing between Prod and Shared Services without transitive peering limitations.
- Test ICMP and HTTP connectivity between private instances.`,
      },
      {
        id: 'res-4',
        title: 'Interactive Practice Exam Simulator (65 Scenario Questions)',
        type: 'quiz',
        category: 'Practice Exams',
        estimatedTime: '130 min',
        isBookmarked: false,
        description: 'Realistic exam simulation with timer, question flaggers, domain score breakdowns, and detailed answer explanations.',
        tags: ['Practice Exam', 'Mock Test', 'SAA-C03'],
        flashcards: [
          { id: 'fc-4', question: 'An application requires 99.99% availability and needs to store session state in a sub-millisecond in-memory cache. What architecture should you propose?', answer: 'Deploy Amazon ElastiCache for Redis with Multi-AZ enabled and Automatic Failover across multiple Availability Zones.', tag: 'Architecture' },
          { id: 'fc-5', question: 'Which AWS service allows real-time streaming ingestion of terabytes of log data with SQL transformations before loading to S3?', answer: 'Amazon Kinesis Data Firehose with an integrated AWS Lambda data transformation function or Amazon Managed Service for Apache Flink.', tag: 'Analytics' },
        ]
      },
      {
        id: 'res-5',
        title: 'IAM Policy Simulator & Policy Evaluation Logic Guide',
        type: 'doc',
        category: 'Security & IAM',
        estimatedTime: '20 min read',
        isBookmarked: false,
        description: 'Detailed breakdown of Explicit Deny vs Explicit Allow evaluation order, SCPs, Permission Boundaries, and Resource Policies.',
        tags: ['IAM', 'Security', 'Policies'],
      },
    ],
    weeklyActivity: [
      { day: 'Mon', shortDate: '06/03', hours: 2.5, targetHours: 2.8, studied: true },
      { day: 'Tue', shortDate: '06/04', hours: 3.0, targetHours: 2.8, studied: true },
      { day: 'Wed', shortDate: '06/05', hours: 1.5, targetHours: 2.8, studied: true },
      { day: 'Thu', shortDate: '06/06', hours: 2.0, targetHours: 2.8, studied: true },
      { day: 'Fri', shortDate: '06/07', hours: 1.0, targetHours: 2.8, studied: true },
      { day: 'Sat', shortDate: '06/08', hours: 2.5, targetHours: 2.8, studied: true },
      { day: 'Sun', shortDate: '06/09', hours: 0.0, targetHours: 2.8, studied: true }, // Current active day / in progress
    ],
    topicMastery: [
      { topic: 'Compute & Scaling', masteryPercent: 82, totalQuestions: 45, correctQuestions: 37 },
      { topic: 'VPC & Networking', masteryPercent: 74, totalQuestions: 40, correctQuestions: 30 },
      { topic: 'Storage & S3', masteryPercent: 88, totalQuestions: 35, correctQuestions: 31 },
      { topic: 'IAM & Security', masteryPercent: 92, totalQuestions: 50, correctQuestions: 46 },
      { topic: 'Database Resilience', masteryPercent: 65, totalQuestions: 30, correctQuestions: 20 },
      { topic: 'Cost Optimization', masteryPercent: 70, totalQuestions: 25, correctQuestions: 18 },
    ],
  },
  {
    id: 'gcp-pca',
    title: 'Google Cloud Professional Architect',
    code: 'GCP-PCA',
    category: 'Cloud Engineering',
    examDate: '2026-10-18',
    targetHoursPerWeek: 15,
    studiedHoursThisWeek: 8.0,
    streakDays: 4,
    completedSessionsToday: 1,
    phases: [
      {
        id: 'gcp-phase-1',
        phaseNumber: 1,
        title: 'GCP Resource Hierarchy & IAM Governance',
        description: 'Organizations, Folders, Projects, Cloud IAM roles, Service Accounts, and Workload Identity Federation.',
        status: 'completed',
        dateRange: 'May 01 – May 14',
        progressPercent: 100,
        topicsCovered: ['Resource Hierarchy', 'IAM & Service Accounts', 'Workload Identity', 'Cloud Audit Logs'],
        subtopics: [
          { id: 'gsub-1', title: 'Organization Policies & Hierarchical Firewalls', durationMinutes: 40, completed: true, type: 'video' },
          { id: 'gsub-2', title: 'Service Account Best Practices & Impersonation', durationMinutes: 35, completed: true, type: 'reading' },
        ],
      },
      {
        id: 'gcp-phase-2',
        phaseNumber: 2,
        title: 'Compute Engine, GKE & Hybrid Networking',
        description: 'Managed Instance Groups, Google Kubernetes Engine cluster architectures, Shared VPCs, and Cloud Interconnect.',
        status: 'in_progress',
        dateRange: 'May 15 – June 10',
        progressPercent: 45,
        topicsCovered: ['GKE Autopilot', 'Shared VPC', 'Cloud VPN', 'Cloud Armor', 'Cloud Run'],
        nextVideo: {
          type: 'video',
          label: 'NEXT VIDEO',
          title: 'GKE Multi-Cluster Ingress & Service Mesh',
          duration: '32 min',
        },
        upcomingLab: {
          type: 'lab',
          label: 'UPCOMING LAB',
          title: 'Deploying Shared VPC with Cloud Armor Protection',
          duration: '50 min',
        },
        subtopics: [
          { id: 'gsub-3', title: 'GKE Standard vs Autopilot Clusters', durationMinutes: 40, completed: true, type: 'video' },
          { id: 'gsub-4', title: 'Shared VPC & Private Service Connect', durationMinutes: 45, completed: true, type: 'video' },
          { id: 'gsub-5', title: 'GKE Multi-Cluster Ingress & Service Mesh', durationMinutes: 32, completed: false, type: 'video' },
          { id: 'gsub-6', title: 'Deploying Shared VPC with Cloud Armor', durationMinutes: 50, completed: false, type: 'lab' },
        ],
      },
      {
        id: 'gcp-phase-3',
        phaseNumber: 3,
        title: 'Big Data, AI & Spanner Resilience',
        description: 'Cloud Spanner globally synchronized databases, BigQuery warehouse performance, and Cloud Dataflow pipelines.',
        status: 'locked',
        dateRange: 'June 11 – June 28',
        progressPercent: 0,
        unlockRequirement: 'Complete Phase 2 (GKE & Hybrid Networking)',
        topicsCovered: ['Cloud Spanner', 'BigQuery Partitioning', 'Cloud Dataflow', 'Pub/Sub'],
        subtopics: [
          { id: 'gsub-7', title: 'Cloud Spanner TrueTime & Global Consistency', durationMinutes: 45, completed: false, type: 'video' },
        ],
      },
    ],
    agenda: [
      { id: 'gtask-1', title: 'Shared VPC & Private Service Connect Deep Dive', type: 'video', durationMinutes: 45, status: 'completed' as TaskStatus },
      { id: 'gtask-2', title: 'GKE Multi-Cluster Ingress & Service Mesh', type: 'video', durationMinutes: 32, status: 'current' as TaskStatus },
      { id: 'gtask-3', title: 'Deploying Shared VPC with Cloud Armor Protection', type: 'lab', durationMinutes: 50, status: 'locked' as TaskStatus },
    ],
    resources: [
      {
        id: 'gres-1',
        title: 'Google Cloud Professional Architect Exam Blueprint',
        type: 'cheatsheet',
        category: 'Quick Reference',
        estimatedTime: '20 min read',
        isBookmarked: true,
        description: 'Case study analysis (EHR Healthcare, Mountkirk Games, TerramEarth), storage selection chart, and GKE sizing.',
        tags: ['GCP', 'PCA', 'Case Studies'],
      },
    ],
    weeklyActivity: [
      { day: 'Mon', shortDate: '06/03', hours: 1.5, targetHours: 2.1, studied: true },
      { day: 'Tue', shortDate: '06/04', hours: 2.0, targetHours: 2.1, studied: true },
      { day: 'Wed', shortDate: '06/05', hours: 2.5, targetHours: 2.1, studied: true },
      { day: 'Thu', shortDate: '06/06', hours: 2.0, targetHours: 2.1, studied: true },
      { day: 'Fri', shortDate: '06/07', hours: 0.0, targetHours: 2.1, studied: false },
      { day: 'Sat', shortDate: '06/08', hours: 0.0, targetHours: 2.1, studied: false },
      { day: 'Sun', shortDate: '06/09', hours: 0.0, targetHours: 2.1, studied: false },
    ],
    topicMastery: [
      { topic: 'GCP IAM & Security', masteryPercent: 85, totalQuestions: 30, correctQuestions: 26 },
      { topic: 'GKE & Compute', masteryPercent: 70, totalQuestions: 35, correctQuestions: 25 },
      { topic: 'VPC Networking', masteryPercent: 65, totalQuestions: 25, correctQuestions: 16 },
      { topic: 'Storage & Spanner', masteryPercent: 60, totalQuestions: 20, correctQuestions: 12 },
    ],
  },
  {
    id: 'k8s-cka',
    title: 'Certified Kubernetes Administrator',
    code: 'CKA',
    category: 'DevOps & Containers',
    examDate: '2026-11-05',
    targetHoursPerWeek: 18,
    studiedHoursThisWeek: 6.0,
    streakDays: 3,
    completedSessionsToday: 0,
    phases: [
      {
        id: 'cka-phase-1',
        phaseNumber: 1,
        title: 'Cluster Architecture, Installation & Configuration',
        description: 'kubeadm cluster provisioning, etcd snapshot backup/restore, control plane components, and RBAC authorization.',
        status: 'in_progress',
        dateRange: 'June 01 – June 18',
        progressPercent: 30,
        topicsCovered: ['kubeadm', 'etcd backup', 'RBAC', 'Kubelet TLS', 'Upgrading Clusters'],
        nextVideo: {
          type: 'video',
          label: 'NEXT VIDEO',
          title: 'etcd Snapshot Backup and Restore Masterclass',
          duration: '35 min',
        },
        upcomingLab: {
          type: 'lab',
          label: 'UPCOMING LAB',
          title: 'Hands-on: Upgrading Control Plane Nodes from v1.29 to v1.30',
          duration: '45 min',
        },
        subtopics: [
          { id: 'csub-1', title: 'Control Plane Architecture & static pods', durationMinutes: 40, completed: true, type: 'video' },
          { id: 'csub-2', title: 'RBAC Roles, RoleBindings & ServiceAccounts', durationMinutes: 35, completed: true, type: 'video' },
          { id: 'csub-3', title: 'etcd Snapshot Backup and Restore Masterclass', durationMinutes: 35, completed: false, type: 'video' },
          { id: 'csub-4', title: 'Upgrading Control Plane Nodes with kubeadm', durationMinutes: 45, completed: false, type: 'lab' },
        ],
      },
    ],
    agenda: [
      { id: 'ctask-1', title: 'Control Plane static pod debugging', type: 'video', durationMinutes: 40, status: 'completed' as TaskStatus },
      { id: 'ctask-2', title: 'etcd Snapshot Backup and Restore Masterclass', type: 'video', durationMinutes: 35, status: 'current' as TaskStatus },
      { id: 'ctask-3', title: 'Upgrading Control Plane Nodes with kubeadm', type: 'lab', durationMinutes: 45, status: 'locked' as TaskStatus },
    ],
    resources: [
      {
        id: 'cres-1',
        title: 'CKA Imperative kubectl Command Cheat Sheet',
        type: 'cheatsheet',
        category: 'Command Line Quick Reference',
        estimatedTime: '15 min read',
        isBookmarked: true,
        description: 'Fast kubectl generator flags, jsonpath filters, and vim configuration tips for the live exam terminal.',
        tags: ['kubectl', 'CKA', 'Terminal'],
      },
    ],
    weeklyActivity: [
      { day: 'Mon', shortDate: '06/03', hours: 2.0, targetHours: 2.5, studied: true },
      { day: 'Tue', shortDate: '06/04', hours: 2.0, targetHours: 2.5, studied: true },
      { day: 'Wed', shortDate: '06/05', hours: 2.0, targetHours: 2.5, studied: true },
      { day: 'Thu', shortDate: '06/06', hours: 0.0, targetHours: 2.5, studied: false },
      { day: 'Fri', shortDate: '06/07', hours: 0.0, targetHours: 2.5, studied: false },
      { day: 'Sat', shortDate: '06/08', hours: 0.0, targetHours: 2.5, studied: false },
      { day: 'Sun', shortDate: '06/09', hours: 0.0, targetHours: 2.5, studied: false },
    ],
    topicMastery: [
      { topic: 'Cluster Architecture', masteryPercent: 60, totalQuestions: 20, correctQuestions: 12 },
      { topic: 'Workloads & Scheduling', masteryPercent: 55, totalQuestions: 25, correctQuestions: 14 },
    ],
  },
];
