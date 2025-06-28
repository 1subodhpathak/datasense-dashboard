import {
  Search,
  Filter,
  BarChart3,
  GitMerge,
  Layers,
  Briefcase, // For Case Solver
  Monitor, // For Window Wizard
  Terminal, // For CTE Master
  Award,
  Trophy,
  Clock,
  Flag,
  Share,
  Brain,
  Swords,
  Calendar,
  Code,
  CircleUser,
  Medal,
  Database
} from "lucide-react";
import { LucideIcon } from "lucide-react";

export interface Badge {
  id: string;
  name: string;
  icon: LucideIcon;
  condition: string;
  currentValue: number;
  requiredValue: number;
  progress: number;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  progress: number;
  badges: Badge[];
  badgeImage?: string;
  gradient?: string;
}

// Updated milestone data according to the Excel sheet
export const milestones: Milestone[] = [
  {
    id: "query-explorer",
    title: "Query Explorer",
    description: "Basics of SQL Queries",
    icon: Search,
    progress: 100,
    badgeImage: "/badge final png/1.png",
    gradient: "linear-gradient(135deg, #bfc9d1 0%, #6e7c8a 100%)",
    badges: [
      {
        id: "sql-freshman",
        name: "SQL Freshman",
        icon: Database,
        condition: "Solve 10 SQL Questions",
        currentValue: 10,
        requiredValue: 10,
        progress: 100
      },
      {
        id: "battle-beginner",
        name: "Battle Beginner",
        icon: Swords,
        condition: "Win 2 SQL Battles",
        currentValue: 2,
        requiredValue: 2,
        progress: 100
      },
      {
        id: "sql-streak-5",
        name: "SQL Streak-5 Days",
        icon: Calendar,
        condition: "Solve 1 SQL problem daily for 5 days",
        currentValue: 5,
        requiredValue: 5,
        progress: 100
      }
    ]
  },
  {
    id: "filter-freak",
    title: "Filter Freak",
    description: "Filtering & Organizing Data",
    icon: Filter,
    progress: 60,
    badgeImage: "/badge final png/5.png",
    gradient: "linear-gradient(135deg, #00e2ff 0%, #3be6ff 100%)",
    badges: [
      {
        id: "pro-finder",
        name: "The Pro Finder",
        icon: Search,
        condition: "Solve 10 filtering problems",
        currentValue: 6,
        requiredValue: 10,
        progress: 60
      },
      {
        id: "battle-challenger",
        name: "Battle Challenger",
        icon: Swords,
        condition: "Win 5 SQL battles",
        currentValue: 3,
        requiredValue: 5,
        progress: 60
      },
      {
        id: "fast-hands",
        name: "Fast Hands",
        icon: Clock,
        condition: "Score >50% in a Live SQL Test",
        currentValue: 0,
        requiredValue: 1,
        progress: 0
      }
    ]
  },
  {
    id: "aggregation-guru",
    title: "Aggregation Guru",
    description: "Aggregation and Grouping Data",
    icon: BarChart3,
    progress: 20,
    badgeImage: "/badge final png/9.png",
    gradient: "linear-gradient(135deg, #ffb97a 0%, #c97a3f 100%)",
    badges: [
      {
        id: "aggregation-pro",
        name: "The Pro Aggregator",
        icon: BarChart3,
        condition: "Solve 10 GROUP BY & Aggregate problems",
        currentValue: 2,
        requiredValue: 10,
        progress: 20
      },
      {
        id: "warrior",
        name: "Warrior",
        icon: Swords,
        condition: "Win 10 SQL Battles",
        currentValue: 0,
        requiredValue: 10,
        progress: 0
      },
      {
        id: "sql-streak-10",
        name: "SQL Streak-10 Days",
        icon: Calendar,
        condition: "Solve 1 SQL problem daily for 10 days",
        currentValue: 0,
        requiredValue: 10,
        progress: 0
      }
    ]
  },
  {
    id: "join-ninja",
    title: "Join Ninja",
    description: "Mastering Joins and Relationships",
    icon: GitMerge,
    progress: 0,
    badgeImage: "/badge final png/13.png",
    gradient: "linear-gradient(135deg, #4be28a 0%, #1fae5b 100%)",
    badges: [
      {
        id: "joins-samurai",
        name: "Joins Samurai",
        icon: GitMerge,
        condition: "Solve 10 Easy and 10 Medium Join Questions",
        currentValue: 0,
        requiredValue: 20,
        progress: 0
      },
      {
        id: "join-combatant",
        name: "Join Combatant",
        icon: Swords,
        condition: "Win 15 SQL Battles",
        currentValue: 0,
        requiredValue: 15,
        progress: 0
      },
      {
        id: "join-grandmaster",
        name: "Join GrandMaster",
        icon: Trophy,
        condition: "Solve 10 Join Advanced Problems",
        currentValue: 0,
        requiredValue: 10,
        progress: 0
      }
    ]
  },
  {
    id: "subquery-slayer",
    title: "Subquery Slayer",
    description: "Learning Nested and Subqueries",
    icon: Layers,
    progress: 0,
    badgeImage: "/badge final png/17.png",
    gradient: "linear-gradient(135deg, #ffe066 0%, #e2b200 100%)",
    badges: [
      {
        id: "battle-commander",
        name: "Battle Commander",
        icon: Swords,
        condition: "Win 15 SQL Battles",
        currentValue: 0,
        requiredValue: 15,
        progress: 0
      },
      {
        id: "social-person",
        name: "The Social Person",
        icon: Share,
        condition: "Share Solution to 20 SQL Questions",
        currentValue: 0,
        requiredValue: 20,
        progress: 0
      },
      {
        id: "deep-thinker",
        name: "Deep Thinker",
        icon: Brain,
        condition: "Solve 10 Subquery Problems",
        currentValue: 0,
        requiredValue: 10,
        progress: 0
      }
    ]
  },
  {
    id: "case-solver",
    title: "Case Solver",
    description: "Conditional Logic with Case When",
    icon: Briefcase,
    progress: 0,
    badgeImage: "/badge final png/21.png",
    gradient: "linear-gradient(135deg, #ffb97a 0%, #ff6e00 100%)",
    badges: [
      {
        id: "gladiator",
        name: "The Gladiator",
        icon: Trophy,
        condition: "Complete 2 SQL Mock Tests",
        currentValue: 0,
        requiredValue: 2,
        progress: 0
      },
      {
        id: "conditional-thinker",
        name: "Conditional Thinker",
        icon: Code,
        condition: "Solve 10 Case-When Statement Questions",
        currentValue: 0,
        requiredValue: 10,
        progress: 0
      },
      {
        id: "veteran",
        name: "The Veteran",
        icon: Swords,
        condition: "Win 20 SQL Battles",
        currentValue: 0,
        requiredValue: 20,
        progress: 0
      }
    ]
  },
  {
    id: "window-wizard",
    title: "Window Wizard",
    description: "Mastering Window Functions",
    icon: Monitor,
    progress: 0,
    badgeImage: "/badge final png/25.png",
    gradient: "linear-gradient(135deg, #ff3b3b 0%, #b80000 100%)",
    badges: [
      {
        id: "rank-ruler",
        name: "Rank Ruler",
        icon: Swords,
        condition: "Win 25 SQL Battles",
        currentValue: 0,
        requiredValue: 25,
        progress: 0
      },
      {
        id: "window-watcher",
        name: "Window Watcher",
        icon: Monitor,
        condition: "Solve 25 Window Function Questions",
        currentValue: 0,
        requiredValue: 25,
        progress: 0
      },
      {
        id: "sql-streak-15",
        name: "SQL Streak-15 Days",
        icon: Calendar,
        condition: "Solve 1 SQL problem daily for 15 days",
        currentValue: 0,
        requiredValue: 15,
        progress: 0
      }
    ]
  },
  {
    id: "cte-master",
    title: "CTE Master",
    description: "Solving CTE Problems",
    icon: Terminal,
    progress: 0,
    badgeImage: "/badge final png/29.png",
    gradient: "linear-gradient(135deg, #b97aff 0%, #6e3bc9 100%)",
    badges: [
      {
        id: "architect",
        name: "Architect",
        icon: Trophy,
        condition: "Complete 5 SQL Mock Tests",
        currentValue: 0,
        requiredValue: 5,
        progress: 0
      },
      {
        id: "with-wizard",
        name: "With Wizard",
        icon: Code,
        condition: "Solve 25 CTE Questions",
        currentValue: 0,
        requiredValue: 25,
        progress: 0
      },
      {
        id: "sql-streak-25",
        name: "SQL Streak-25 Days",
        icon: Calendar,
        condition: "Solve 1 SQL problem daily for 25 days",
        currentValue: 0,
        requiredValue: 25,
        progress: 0
      }
    ]
  },
  {
    id: "sql-lord",
    title: "SQL Lord",
    description: "Complete Challenges",
    icon: Award,
    progress: 0,
    badgeImage: "/badge final png/33.png",
    gradient: "linear-gradient(135deg, #ffe066 0%, #ffb800 100%)",
    badges: [
      {
        id: "battle-titan",
        name: "Battle Titan",
        icon: Swords,
        condition: "Win 50 SQL Battles",
        currentValue: 0,
        requiredValue: 50,
        progress: 0
      },
      {
        id: "sql-marathoner",
        name: "SQL Marathoner",
        icon: Calendar,
        condition: "Solve 1 SQL Problem for 30 Days",
        currentValue: 0,
        requiredValue: 30,
        progress: 0
      },
      {
        id: "sql-slayer",
        name: "SQL Slayer",
        icon: Database,
        condition: "Solve 200 SQL Practice Questions",
        currentValue: 0,
        requiredValue: 200,
        progress: 0
      },
      {
        id: "database-warrior",
        name: "Database Warrior",
        icon: Database,
        condition: "Solve 250 SQL Practice Questions",
        currentValue: 0,
        requiredValue: 250,
        progress: 0
      },
      {
        id: "data-overlord",
        name: "Data Overlord",
        icon: Award,
        condition: "Solve 300 SQL Practice Questions",
        currentValue: 0,
        requiredValue: 300,
        progress: 0
      },
      {
        id: "mastermind",
        name: "Mastermind",
        icon: Trophy,
        condition: "Complete SQL 25 Mock Tests",
        currentValue: 0,
        requiredValue: 25,
        progress: 0
      },
      {
        id: "game-changer",
        name: "Game Changer",
        icon: CircleUser,
        condition: "Give 25 Customized SQL Tests",
        currentValue: 0,
        requiredValue: 25,
        progress: 0
      },
      {
        id: "cult",
        name: "Cult",
        icon: CircleUser,
        condition: "Give 10 Live SQL Tests",
        currentValue: 0,
        requiredValue: 10,
        progress: 0
      },
      {
        id: "influencer",
        name: "The Influencer",
        icon: Share,
        condition: "Share Solution to 50 SQL Questions",
        currentValue: 0,
        requiredValue: 50,
        progress: 0
      }
    ]
  }
];
