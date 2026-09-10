import { ExamPlan } from '../types/plan';

// Helper to format date YYYY-MM-DD
export function formatDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatShortDay(d: Date): string {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return `${days[d.getDay()]} ${d.getDate()}`;
}

export function addDays(d: Date, days: number): Date {
  const result = new Date(d);
  result.setDate(result.getDate() + days);
  return result;
}

export function createDefaultExams(): ExamPlan[] {
  const now = new Date();
  const todayStr = formatDate(now);
  const examDate1 = formatDate(addDays(now, 21));
  const examDate2 = formatDate(addDays(now, 14));

  const day0 = formatDate(now);
  const day1 = formatDate(addDays(now, 1));
  const day2 = formatDate(addDays(now, 2));
  const day3 = formatDate(addDays(now, 4));
  const day4 = formatDate(addDays(now, 5));
  const day5 = formatDate(addDays(now, 7));
  const day6 = formatDate(addDays(now, 8));

  return [
    {
      id: 'exam-ap-bio-2026',
      title: 'AP Biology & Molecular Genetics',
      examDate: examDate1,
      syllabus: `Cell Structure & Organelles\nMembrane Transport & Osmosis (hard)\nCellular Respiration & Glycolysis (hard)\nPhotosynthesis Light/Dark Cycles\nCell Communication & Signaling\nDNA Replication & Repair (hard)\nTranscription & RNA Processing\nTranslation & Protein Folding\nMeiosis & Chromosomal Inheritance\nGene Regulation & Operons (hard)\nEvolutionary Mechanisms & Selection\nEcosystem Dynamics & Energy Flow`,
      studyDays: [1, 2, 3, 4, 5, 6], // Mon-Sat
      hoursPerDay: 3,
      createdAt: new Date().toISOString(),
      completedSessionIds: {
        's-1-1': true,
        's-1-2': true,
      },
      tips: [
        'Draw metabolic pathway flowcharts by hand on chalkboards or scrap paper to master glycolysis.',
        'Spaced repetition is critical for enzyme nomenclature and co-factors.',
        'Practice FRQs (Free Response Questions) under timed 25-minute blocks.',
        'Save the last 48 hours before the exam for formula recall and high-yield flashcards.'
      ],
      phases: [
        {
          id: 'phase-1',
          type: 'daily',
          label: 'Week 1: Cell Foundations',
          dateRange: `${formatShortDay(now)} – ${formatShortDay(addDays(now, 6))}`,
          entries: [
            {
              id: 'entry-1',
              label: formatShortDay(now),
              date: day0,
              focus: 'Cell Architecture & Membrane Flux',
              sessions: [
                { id: 's-1-1', topic: 'Organelles & Endomembrane', hours: 1.5, mode: 'learn' },
                { id: 's-1-2', topic: 'Osmosis & Water Potential', hours: 1.5, mode: 'practice' }
              ]
            },
            {
              id: 'entry-2',
              label: formatShortDay(addDays(now, 1)),
              date: day1,
              focus: 'Cellular Respiration Pathways',
              sessions: [
                { id: 's-2-1', topic: 'Glycolysis & Krebs Cycle', hours: 2, mode: 'learn' },
                { id: 's-2-2', topic: 'Oxidative Phosphorylation', hours: 1, mode: 'revise' }
              ]
            },
            {
              id: 'entry-3',
              label: formatShortDay(addDays(now, 2)),
              date: day2,
              focus: 'Photosynthesis Mechanisms',
              sessions: [
                { id: 's-3-1', topic: 'Light Reactions & Calvin Cycle', hours: 2, mode: 'learn' },
                { id: 's-3-2', topic: 'Bioenergetics Diagramming', hours: 1, mode: 'practice' }
              ]
            },
            {
              id: 'entry-4',
              label: formatShortDay(addDays(now, 4)),
              date: day3,
              focus: 'Cell Signal Transduction',
              sessions: [
                { id: 's-4-1', topic: 'Receptor Tyrosine Kinases', hours: 1.5, mode: 'learn' },
                { id: 's-4-2', topic: 'G-Protein Secondary Messengers', hours: 1.5, mode: 'revise' }
              ]
            },
            {
              id: 'entry-5',
              label: formatShortDay(addDays(now, 5)),
              date: day4,
              focus: 'DNA Mechanics & Replication',
              sessions: [
                { id: 's-5-1', topic: 'DNA Polymerase & Replication Fork', hours: 2, mode: 'learn' },
                { id: 's-5-2', topic: 'Mismatch Repair & Telomeres', hours: 1, mode: 'practice' }
              ]
            }
          ]
        },
        {
          id: 'phase-2',
          type: 'daily',
          label: 'Week 2: Genetics & Regulation',
          dateRange: `${formatShortDay(addDays(now, 7))} – ${formatShortDay(addDays(now, 13))}`,
          entries: [
            {
              id: 'entry-6',
              label: formatShortDay(addDays(now, 7)),
              date: day5,
              focus: 'Gene Regulation & Operons',
              sessions: [
                { id: 's-6-1', topic: 'Lac & Trp Operons', hours: 1.5, mode: 'learn' },
                { id: 's-6-2', topic: 'Eukaryotic Transcription Factors', hours: 1.5, mode: 'practice' }
              ]
            },
            {
              id: 'entry-7',
              label: formatShortDay(addDays(now, 8)),
              date: day6,
              focus: 'Meiosis & Linkage Mapping',
              sessions: [
                { id: 's-7-1', topic: 'Crossing Over & Non-Disjunction', hours: 1.5, mode: 'revise' },
                { id: 's-7-2', topic: 'Punnett Squares & Chi-Square', hours: 1.5, mode: 'practice' }
              ]
            },
            {
              id: 'entry-8',
              label: formatShortDay(addDays(now, 10)),
              date: formatDate(addDays(now, 10)),
              focus: 'Biotechnology & Gel Electrophoresis',
              sessions: [
                { id: 's-8-1', topic: 'PCR & CRISPR-Cas9', hours: 1.5, mode: 'learn' },
                { id: 's-8-2', topic: 'Restriction Digest Lab Analysis', hours: 1.5, mode: 'practice' }
              ]
            }
          ]
        },
        {
          id: 'phase-3',
          type: 'weekly',
          label: 'Week 3: Final Synthesis & Mocks',
          dateRange: `${formatShortDay(addDays(now, 14))} – ${formatShortDay(addDays(now, 20))}`,
          entries: [
            {
              id: 'entry-9',
              label: 'Full Mock Exam 1',
              date: formatDate(addDays(now, 15)),
              focus: 'Section 1 Multiple Choice Drill',
              sessions: [
                { id: 's-9-1', topic: 'Timed 60-Question AP Diagnostic', hours: 2, mode: 'practice' },
                { id: 's-9-2', topic: 'Error Analysis & Weak Spots', hours: 1, mode: 'revise' }
              ]
            },
            {
              id: 'entry-10',
              label: 'Full Mock Exam 2',
              date: formatDate(addDays(now, 18)),
              focus: 'Free Response Question Mastery',
              sessions: [
                { id: 's-10-1', topic: 'FRQ Section Timed Sprint', hours: 2, mode: 'practice' },
                { id: 's-10-2', topic: 'Rubric Scoring & Self-Audit', hours: 1, mode: 'revise' }
              ]
            },
            {
              id: 'entry-11',
              label: 'Eve of Exam Review',
              date: formatDate(addDays(now, 20)),
              focus: 'Light Formula & Flow Review',
              sessions: [
                { id: 's-11-1', topic: 'High-Yield Sheet Fast Scan', hours: 1, mode: 'revise' },
                { id: 's-11-2', topic: 'Rest & Mental Readiness', hours: 0.5, mode: 'revise' }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'exam-aws-cloud-2026',
      title: 'AWS Certified Solutions Architect',
      examDate: examDate2,
      syllabus: `IAM Policies & Multi-Account Architecture\nEC2 Auto Scaling & Load Balancing (hard)\nVPC Subnets, Routing & Transit Gateway (hard)\nS3 Storage Tiers & Lifecycle Policies\nRDS Multi-AZ, Aurora Global & DynamoDB (hard)\nServerless Lambda, EventBridge & SQS\nCloudFront Caching, WAF & Shield\nDisaster Recovery RTO/RPO Strategies\nCost Optimization & AWS Organizations`,
      studyDays: [1, 3, 5, 6, 0], // Mon, Wed, Fri, Sat, Sun
      hoursPerDay: 2.5,
      createdAt: new Date().toISOString(),
      completedSessionIds: {},
      tips: [
        'Pay special attention to VPC Peering vs Transit Gateway scenarios in practice questions.',
        'Memorize DynamoDB partition keys and GSI vs LSI limits.',
        'Eliminate options with anti-patterns first on scenario questions.'
      ],
      phases: [
        {
          id: 'aws-p1',
          type: 'daily',
          label: 'Week 1: Core Compute & Networking',
          dateRange: `${formatShortDay(now)} – ${formatShortDay(addDays(now, 6))}`,
          entries: [
            {
              id: 'aws-e1',
              label: formatShortDay(now),
              date: todayStr,
              focus: 'VPC Architecture & Subnet Routing',
              sessions: [
                { id: 'aws-s1', topic: 'CIDR Blocks, NAT Gateways', hours: 1.5, mode: 'learn' },
                { id: 'aws-s2', topic: 'Security Groups vs NACLs Drill', hours: 1, mode: 'practice' }
              ]
            },
            {
              id: 'aws-e2',
              label: formatShortDay(addDays(now, 2)),
              date: day2,
              focus: 'EC2 Compute & Auto Scaling',
              sessions: [
                { id: 'aws-s3', topic: 'ALB/NLB Path-Based Routing', hours: 1.5, mode: 'learn' },
                { id: 'aws-s4', topic: 'ASG Target Tracking Policies', hours: 1, mode: 'revise' }
              ]
            }
          ]
        },
        {
          id: 'aws-p2',
          type: 'daily',
          label: 'Week 2: Databases & Serverless',
          dateRange: `${formatShortDay(addDays(now, 7))} – ${formatShortDay(addDays(now, 13))}`,
          entries: [
            {
              id: 'aws-e3',
              label: formatShortDay(addDays(now, 8)),
              date: day6,
              focus: 'Relational & NoSQL Resiliency',
              sessions: [
                { id: 'aws-s5', topic: 'Aurora Replicas & Failover', hours: 1.5, mode: 'learn' },
                { id: 'aws-s6', topic: 'DynamoDB DAX & Streams', hours: 1, mode: 'practice' }
              ]
            }
          ]
        }
      ]
    }
  ];
}
