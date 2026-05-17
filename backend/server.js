require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const app = express();

const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'planety_secret';

// app.use(cors());
app.use(cors({
    origin: '*',
    credentials: true
}));
app.use(express.json());

// ─────────────────────────────────────────────────────────────
// ROOT & HEALTH ROUTES
// ─────────────────────────────────────────────────────────────

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🚀 PLANETY Backend API Running Successfully',
    version: '1.0.0',
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    server: 'PLANETY Backend',
    timestamp: new Date().toISOString(),
  });
});

// ─────────────────────────────────────────────────────────────
// IN-MEMORY DATABASE
// ─────────────────────────────────────────────────────────────

const db = {
  users: [
    {
      id: 'user-1',
      name: 'John Doe',
      email: 'john@planety.com',
      password: bcrypt.hashSync('password123', 10),
      role: 'Admin',
      avatar: 'JD',
      department: 'Engineering',
      joinedAt: '2023-01-15',
    },
    {
      id: 'user-2',
      name: 'Elena Rodriguez',
      email: 'elena@planety.com',
      password: bcrypt.hashSync('pass456', 10),
      role: 'Manager',
      avatar: 'ER',
      department: 'Data',
      joinedAt: '2023-03-10',
    },
    {
      id: 'user-3',
      name: 'Aisha Khan',
      email: 'aisha@planety.com',
      password: bcrypt.hashSync('employee123', 10),
      role: 'Employee',
      avatar: 'AK',
      department: 'Marketing',
      joinedAt: '2024-01-10',
    },
  ],

  goals: [
    {
      id: 'goal-1',
      userId: 'user-1',
      name: 'Website Redesign',
      description: 'Complete full redesign of company website with new branding.',
      status: 'on-track',
      progress: 72,
      dueDate: '2025-12-31',
      priority: 'high',
      milestones: [
        { id: 'm1', title: 'Wireframes complete', done: true },
        { id: 'm2', title: 'Design system built', done: true },
        { id: 'm3', title: 'Dev handoff', done: false },
      ],
      createdAt: new Date().toISOString(),
    },
  ],

  team: [
    {
      id: 'tm-1',
      name: 'Elena Rodriguez',
      avatar: 'ER',
      role: 'Manager',
      department: 'Data',
      project: 'Project Nebula',
      status: 'approved',
      score: 94,
      lastActive: 'Today, 10:30 AM',
      gradientClass: 'primary',
    },
    {
      id: 'tm-2',
      name: 'Kenji Tanaka',
      avatar: 'KT',
      role: 'Lead Designer',
      department: 'Design',
      project: 'UX Redesign',
      status: 'under-review',
      score: 88,
      lastActive: 'Yesterday, 4:15 PM',
      gradientClass: 'success',
    },
  ],

  performance: {
    quarterlyScore: 87,
    complianceRate: 98,
    goalsCompleted: 17,
    totalGoals: 20,
    trajectory: [
      { month: 'Jan', metricA: 62, metricB: 55 },
      { month: 'Feb', metricA: 68, metricB: 60 },
      { month: 'Mar', metricA: 71, metricB: 65 },
      { month: 'Apr', metricA: 75, metricB: 70 },
      { month: 'May', metricA: 80, metricB: 73 },
      { month: 'Jun', metricA: 78, metricB: 76 },
      { month: 'Jul', metricA: 84, metricB: 79 },
      { month: 'Aug', metricA: 87, metricB: 82 },
      { month: 'Sep', metricA: 91, metricB: 85 },
    ],

    departmentBreakdown: [
      { name: 'Engineering', score: 91 },
      { name: 'Design', score: 88 },
      { name: 'Marketing', score: 95 },
      { name: 'Data', score: 90 },
      { name: 'Sales', score: 83 },
    ],
  },
};

// ─────────────────────────────────────────────────────────────
// AUTH MIDDLEWARE
// ─────────────────────────────────────────────────────────────

function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      error: 'No token provided',
    });
  }

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({
      error: 'Invalid token',
    });
  }
}

// ─────────────────────────────────────────────────────────────
// AUTH ROUTES
// ─────────────────────────────────────────────────────────────

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  const user = db.users.find(u => u.email === email);

  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({
      error: 'Invalid email or password',
    });
  }

  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  const { password: _, ...safeUser } = user;

  res.json({
    success: true,
    token,
    user: safeUser,
  });
});

app.get('/api/auth/me', authMiddleware, (req, res) => {
  const user = db.users.find(u => u.id === req.user.id);

  if (!user) {
    return res.status(404).json({
      error: 'User not found',
    });
  }

  const { password: _, ...safeUser } = user;

  res.json(safeUser);
});

// ─────────────────────────────────────────────────────────────
// GOALS ROUTES
// ─────────────────────────────────────────────────────────────

app.get('/api/goals', authMiddleware, (req, res) => {
  const userGoals = db.goals.filter(g => g.userId === req.user.id);
  res.json(userGoals);
});

app.post('/api/goals', authMiddleware, (req, res) => {
  const { name, description, dueDate, priority, milestones } = req.body;

  if (!name) {
    return res.status(400).json({
      error: 'Goal name is required',
    });
  }

  const goal = {
    id: 'goal-' + uuidv4(),
    userId: req.user.id,
    name,
    description: description || '',
    status: 'on-track',
    progress: 0,
    dueDate: dueDate || '',
    priority: priority || 'medium',
    milestones: (milestones || []).map((m, i) => ({
      id: 'm' + i,
      title: typeof m === 'string' ? m : m.title,
      done: false,
    })),
    createdAt: new Date().toISOString(),
  };

  db.goals.push(goal);

  res.status(201).json(goal);
});

app.put('/api/goals/:id', authMiddleware, (req, res) => {
  const idx = db.goals.findIndex(
    g => g.id === req.params.id && g.userId === req.user.id
  );

  if (idx === -1) {
    return res.status(404).json({
      error: 'Goal not found',
    });
  }

  db.goals[idx] = {
    ...db.goals[idx],
    ...req.body,
    id: req.params.id,
    userId: req.user.id,
  };

  res.json(db.goals[idx]);
});

app.patch('/api/goals/:id/milestone/:milestoneId', authMiddleware, (req, res) => {
  const goal = db.goals.find(
    g => g.id === req.params.id && g.userId === req.user.id
  );

  if (!goal) {
    return res.status(404).json({
      error: 'Goal not found',
    });
  }

  const milestone = goal.milestones.find(
    m => m.id === req.params.milestoneId
  );

  if (!milestone) {
    return res.status(404).json({
      error: 'Milestone not found',
    });
  }

  milestone.done = req.body.done;

  const done = goal.milestones.filter(m => m.done).length;

  goal.progress = Math.round(
    (done / goal.milestones.length) * 100
  );

  res.json(goal);
});

app.delete('/api/goals/:id', authMiddleware, (req, res) => {
  const idx = db.goals.findIndex(
    g => g.id === req.params.id && g.userId === req.user.id
  );

  if (idx === -1) {
    return res.status(404).json({
      error: 'Goal not found',
    });
  }

  db.goals.splice(idx, 1);

  res.json({
    success: true,
  });
});

// ─────────────────────────────────────────────────────────────
// TEAM ROUTES
// ─────────────────────────────────────────────────────────────

app.get('/api/team', authMiddleware, (req, res) => {
  res.json(db.team);
});

// ─────────────────────────────────────────────────────────────
// PERFORMANCE ROUTES
// ─────────────────────────────────────────────────────────────

app.get('/api/performance', authMiddleware, (req, res) => {
  const goals = db.goals.filter(g => g.userId === req.user.id);

  const completed = goals.filter(
    g => g.status === 'completed'
  ).length;

  res.json({
    ...db.performance,
    goalsCompleted:
      completed || db.performance.goalsCompleted,
    totalGoals:
      goals.length || db.performance.totalGoals,
  });
});

// ─────────────────────────────────────────────────────────────
// DASHBOARD ROUTES
// ─────────────────────────────────────────────────────────────

app.get('/api/dashboard', authMiddleware, (req, res) => {
  const userGoals = db.goals.filter(
    g => g.userId === req.user.id
  );

  const onTrack = userGoals.filter(
    g => g.status === 'on-track'
  ).length;

  const atRisk = userGoals.filter(
    g => g.status === 'at-risk'
  ).length;

  const completed = userGoals.filter(
    g => g.status === 'completed'
  ).length;

  const avgProgress = userGoals.length
    ? Math.round(
        userGoals.reduce((s, g) => s + g.progress, 0) /
          userGoals.length
      )
    : 0;

  res.json({
    goalCompletion: avgProgress,
    totalGoals: userGoals.length,
    onTrack,
    atRisk,
    completed,
    complianceRate: db.performance.complianceRate,

    activeGoals: userGoals.slice(0, 3).map(g => ({
      id: g.id,
      name: g.name,
      status: g.status,
      progress: g.progress,
    })),

    recentActivity: db.team.slice(0, 3).map(m => ({
      name: m.name,
      action: 'Submitted review',
      time: m.lastActive,
    })),
  });
});

// ─────────────────────────────────────────────────────────────
// START SERVER
// ─────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`🚀 PLANETY Backend running on port ${PORT}`);

  console.log('\n🧪 Demo Accounts:\n');

  console.log('Admin');
  console.log('Email: john@planety.com');
  console.log('Password: password123\n');

  console.log('Manager');
  console.log('Email: elena@planety.com');
  console.log('Password: pass456\n');

  console.log('Employee');
  console.log('Email: aisha@planety.com');
  console.log('Password: employee123\n');
});