import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('Password123!', 12);

  console.log('Seeding database...');

  // 1. Users
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@fredocloud.com' },
    update: { password: hashedPassword },
    create: {
      email: 'demo@fredocloud.com',
      password: hashedPassword,
      name: 'Demo User',
    },
  });

  const teamUser = await prisma.user.upsert({
    where: { email: 'team@fredocloud.com' },
    update: { password: hashedPassword },
    create: {
      email: 'team@fredocloud.com',
      password: hashedPassword,
      name: 'Sarah Chen',
      avatarUrl: 'https://res.cloudinary.com/demo/image/upload/v1670845341/cld-sample-5.jpg'
    },
  });

  // 2. Workspace
  const workspace = await prisma.workspace.upsert({
    where: { id: 'demo-workspace' },
    update: { name: 'Fredocloud HQ' },
    create: {
      id: 'demo-workspace',
      name: 'Fredocloud HQ',
      description: 'The central hub for all Fredocloud operations and strategic planning.',
      accentColor: '#6366f1',
    },
  });

  // 3. Memberships
  await prisma.workspaceMember.upsert({
    where: { userId_workspaceId: { userId: demoUser.id, workspaceId: workspace.id } },
    update: { role: 'ADMIN' },
    create: { userId: demoUser.id, workspaceId: workspace.id, role: 'ADMIN' },
  });

  await prisma.workspaceMember.upsert({
    where: { userId_workspaceId: { userId: teamUser.id, workspaceId: workspace.id } },
    update: { role: 'MEMBER' },
    create: { userId: teamUser.id, workspaceId: workspace.id, role: 'MEMBER' },
  });

  // 4. Goals & Milestones
  const goalsCount = await prisma.goal.count({ where: { workspaceId: workspace.id } });
  if (goalsCount === 0) {
    console.log('Creating demo goals...');
    
    // Goal 1: Q2 Product Launch (Completed)
    const g1 = await prisma.goal.create({
      data: {
        title: 'Q2 Product Expansion',
        description: 'Launch the mobile application and expand into 3 new regional markets.',
        status: 'COMPLETED',
        dueDate: new Date('2026-06-30'),
        ownerId: demoUser.id,
        workspaceId: workspace.id,
        updatedAt: new Date('2026-03-15'),
        milestones: {
          create: [
            { title: 'Mobile Beta Testing', progress: 100 },
            { title: 'App Store Submission', progress: 100 },
            { title: 'Market Analysis - EMEA', progress: 100 }
          ]
        }
      }
    });

    // Goal 2: Infrastructure Modernization (In Progress)
    const g2 = await prisma.goal.create({
      data: {
        title: 'Cloud Infrastructure Upgrade',
        description: 'Migrate core services to a serverless architecture to improve scalability and reduce costs.',
        status: 'IN_PROGRESS',
        dueDate: new Date('2026-12-31'),
        ownerId: demoUser.id,
        workspaceId: workspace.id,
        milestones: {
          create: [
            { title: 'Evaluate Cloud Providers', progress: 100 },
            { title: 'Database Migration Plan', progress: 60 },
            { title: 'Implement CI/CD Pipelines', progress: 20 }
          ]
        }
      }
    });

    // Goal 3: Brand Identity Refresh (Not Started)
    const g3 = await prisma.goal.create({
      data: {
        title: '2026 Brand Refresh',
        description: 'Modernize the brand visual identity and core messaging for a younger demographic.',
        status: 'NOT_STARTED',
        dueDate: new Date('2026-09-15'),
        ownerId: teamUser.id,
        workspaceId: workspace.id,
        milestones: {
          create: [
            { title: 'Agency Selection', progress: 0 },
            { title: 'Visual Identity Guide', progress: 0 }
          ]
        }
      }
    });

    // 5. Action Items
    console.log('Creating action items...');
    await prisma.actionItem.createMany({
      data: [
        {
          title: 'Review infrastructure costs',
          description: 'Analyze last month\'s AWS bill and identify optimization opportunities.',
          status: 'DONE',
          priority: 'HIGH',
          assigneeId: demoUser.id,
          workspaceId: workspace.id,
          goalId: g2.id,
          updatedAt: new Date()
        },
        {
          title: 'Draft design brief',
          description: 'Outline core requirements for the brand refresh agency.',
          status: 'TODO',
          priority: 'MEDIUM',
          assigneeId: teamUser.id,
          workspaceId: workspace.id,
          goalId: g3.id
        },
        {
          title: 'Fix mobile auth bug',
          description: 'Login intermittently fails on iOS 17. Investigation needed.',
          status: 'IN_PROGRESS',
          priority: 'URGENT',
          assigneeId: teamUser.id,
          workspaceId: workspace.id
        },
        {
          title: 'Update team handbook',
          status: 'TODO',
          priority: 'LOW',
          assigneeId: demoUser.id,
          workspaceId: workspace.id
        }
      ]
    });

    // 6. Announcements
    console.log('Creating announcements...');
    await prisma.announcement.create({
      data: {
        title: 'Welcome to FredoCloud!',
        content: '<p>Welcome to our new team hub. This is where we will track all our <strong>strategic goals</strong> and <strong>daily tasks</strong>. Feel free to explore and set up your profile!</p>',
        isPinned: true,
        authorId: demoUser.id,
        workspaceId: workspace.id,
      }
    });

    await prisma.announcement.create({
      data: {
        title: 'Infrastructure Maintenance',
        content: '<p>We will be performing scheduled maintenance on our cloud servers this Sunday at 2:00 AM UTC. Expect minor downtime.</p>',
        authorId: teamUser.id,
        workspaceId: workspace.id,
      }
    });

    // 7. Activities
    await prisma.activity.create({
      data: {
        content: 'Started working on the database migration plan.',
        goalId: g2.id,
        userId: demoUser.id
      }
    });
  }

  console.log('Seed completed successfully!');
  console.log('Demo Credentials:');
  console.log(' - Admin: demo@fredocloud.com / Password123!');
  console.log(' - Member: team@fredocloud.com / Password123!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });