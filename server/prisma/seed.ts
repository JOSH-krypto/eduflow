import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding EduFlow database...');

  // 1. Create Demo User
  const passwordHash = await bcrypt.hash('DemoPass123!', 10);
  const user = await prisma.user.upsert({
    where: { email: 'alex.chen@university.edu' },
    update: {},
    create: {
      email: 'alex.chen@university.edu',
      passwordHash,
      name: 'Alex Chen',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      planTier: 'Pro Student',
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
    },
  });

  console.log(`👤 Created user: ${user.name} (${user.email})`);

  // 2. Create AWS Solutions Architect Course
  const course = await prisma.course.create({
    data: {
      userId: user.id,
      title: 'AWS Solutions Architect Associate',
      code: 'SAA-C03',
      category: 'Cloud Architecture',
      examDate: '2026-09-24',
      targetHoursPerWeek: 15,
      studiedHoursThisWeek: 9.5,
      streakDays: 7,
      completedSessionsToday: 2,
      phases: {
        create: [
          {
            phaseNumber: 1,
            title: 'Cloud Fundamentals & Identity Governance',
            description: 'Master IAM policies, STS AssumeRole, Organizations SCPs, and global security perimeters.',
            status: 'completed',
            dateRange: 'Week 1 – Week 2',
            progressPercent: 100,
            topicsCovered: ['IAM & STS', 'Organizations', 'KMS & Secrets Manager', 'Billing & Budgets'],
            subtopics: [
              { id: 'sub-1-1', title: 'IAM Policy Evaluation Logic & SCPs', durationMinutes: 30, completed: true, type: 'video' },
              { id: 'sub-1-2', title: 'STS Cross-Account Role Assumption', durationMinutes: 45, completed: true, type: 'lab' },
              { id: 'sub-1-3', title: 'KMS Key Policies & Envelope Encryption', durationMinutes: 30, completed: true, type: 'reading' },
            ],
          },
          {
            phaseNumber: 2,
            title: 'High Availability Compute & Elastic Networking',
            description: 'VPC subnets, Route Tables, Transit Gateway, Auto Scaling Groups, and Multi-AZ ALB setups.',
            status: 'in_progress',
            dateRange: 'Week 3 – Week 5',
            progressPercent: 65,
            topicsCovered: ['VPC Peering', 'ALB & NLB', 'Auto Scaling', 'Transit Gateway'],
            nextVideo: {
              type: 'video',
              label: 'NEXT VIDEO',
              title: 'VPC Peering vs Transit Gateway Hub-and-Spoke',
              duration: '22 min',
            },
            upcomingLab: {
              type: 'lab',
              label: 'UPCOMING LAB',
              title: 'Multi-AZ Auto Scaling & ALB Deployment',
              duration: '45 min',
            },
            subtopics: [
              { id: 'sub-2-1', title: 'Multi-AZ Auto Scaling & ALB Deployment', durationMinutes: 45, completed: false, type: 'lab' },
              { id: 'sub-2-2', title: 'Transit Gateway Hub-and-Spoke Setup', durationMinutes: 35, completed: false, type: 'video' },
              { id: 'sub-2-3', title: 'VPC Endpoints (PrivateLink vs Gateway)', durationMinutes: 25, completed: true, type: 'reading' },
            ],
          },
          {
            phaseNumber: 3,
            title: 'Resilient Storage & Serverless Microservices',
            description: 'S3 Lifecycle policies, DynamoDB Global Tables, Lambda event-driven patterns, and SQS FIFO.',
            status: 'locked',
            dateRange: 'Week 6 – Week 8',
            progressPercent: 0,
            topicsCovered: ['S3 Multi-Region', 'DynamoDB', 'Lambda & EventBridge', 'SQS & SNS'],
            subtopics: [
              { id: 'sub-3-1', title: 'S3 Cross-Region Replication & Lifecycle', durationMinutes: 30, completed: false, type: 'video' },
              { id: 'sub-3-2', title: 'DynamoDB Partition Key Design & DAX', durationMinutes: 45, completed: false, type: 'reading' },
              { id: 'sub-3-3', title: 'Decoupled Architectures with SQS FIFO', durationMinutes: 40, completed: false, type: 'lab' },
            ],
          },
        ],
      },
      tasks: {
        create: [
          {
            title: 'Complete Multi-AZ Auto Scaling & ALB Deployment Lab',
            type: 'lab',
            durationMinutes: 45,
            status: 'current',
            progressPercent: 0,
          },
          {
            title: 'Watch VPC Peering vs Transit Gateway Deep Dive',
            type: 'video',
            durationMinutes: 22,
            status: 'current',
            progressPercent: 0,
          },
          {
            title: 'Review IAM Policy Evaluation & SCP Hierarchy Notes',
            type: 'reading',
            durationMinutes: 30,
            status: 'completed',
            progressPercent: 100,
            completedAt: new Date(),
          },
        ],
      },
    },
  });

  console.log(`📚 Created course: ${course.title}`);

  // 3. Create initial Research Summary
  await prisma.researchSummary.create({
    data: {
      userId: user.id,
      courseId: course.id,
      title: 'VPC Peering vs Transit Gateway Architecture',
      originalText: 'VPC peering connection is a networking connection between two VPCs. Transit Gateway acts as a cloud router connecting VPCs and on-premises networks with centralized routing.',
      overview: 'Compares point-to-point VPC peering topologies with scalable hub-and-spoke AWS Transit Gateway architectures, highlighting transitive routing limitations and bandwidth limits.',
      keyConcepts: [
        { concept: 'VPC Peering', definition: 'Non-transitive point-to-point connection between 2 VPCs with zero bandwidth bottleneck and lowest cost.' },
        { concept: 'Transit Gateway', definition: 'Regional hub router managing thousands of VPCs and VPN/Direct Connect connections with centralized routing policies.' },
      ],
      examHighYield: [
        'VPC Peering has NO bandwidth limit and NO hourly gateway cost; use for simple 2-VPC private communication.',
        'Transit Gateway supports multicast and simplifies network architecture when connecting > 5 VPCs.',
      ],
      wordCount: 320,
      estimatedStudyTimeMinutes: 20,
      tags: ['VPC', 'Networking', 'TransitGateway', 'SAA-C03'],
    },
  });

  console.log('✅ Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
