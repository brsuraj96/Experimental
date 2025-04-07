import { pgTable, serial, text, integer, boolean, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// User Table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  email: text('email'),
  created_at: timestamp('created_at').defaultNow()
});

// Game Progress Table
export const gameProgress = pgTable('game_progress', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').references(() => users.id).notNull(),
  game_type: text('game_type').notNull(),
  difficulty: text('difficulty').notNull(),
  level: integer('level').notNull().default(1),
  completed: integer('completed').notNull().default(0),
  last_played: timestamp('last_played').defaultNow()
});

// Game Session Table
export const gameSessions = pgTable('game_sessions', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').references(() => users.id).notNull(),
  game_type: text('game_type').notNull(),
  difficulty: text('difficulty').notNull(),
  moves: integer('moves').notNull().default(0),
  time_taken: integer('time_taken').notNull().default(0), // stored in seconds
  completed: boolean('completed').notNull().default(false),
  created_at: timestamp('created_at').defaultNow()
});

// Game Types Enum
export enum GameType {
  SUDOKU = 'Sudoku',
  SLIDE_TILES = 'Slide Tiles',
  FLOW_FREE = 'Flow Free',
  CROSSWORD = 'Crossword',
  JIGSAW = 'Jigsaw',
  MATCHSTICK = 'Matchstick',
  SPOT_DIFFERENCE = 'Spot the Difference',
  WATER_FLOW = 'Water Flow',
  TRIVIA = 'Trivia',
  RIDDLES = 'Riddles'
}

// Difficulty Enum
export enum Difficulty {
  EASY = 'Easy',
  MEDIUM = 'Medium',
  HARD = 'Hard'
}

// Type Definitions
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type GameProgress = typeof gameProgress.$inferSelect;
export type InsertGameProgress = typeof gameProgress.$inferInsert;
export type GameSession = typeof gameSessions.$inferSelect;
export type InsertGameSession = typeof gameSessions.$inferInsert;

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  progress: many(gameProgress),
  sessions: many(gameSessions)
}));

export const gameProgressRelations = relations(gameProgress, ({ one }) => ({
  user: one(users, {
    fields: [gameProgress.user_id],
    references: [users.id]
  })
}));

export const gameSessionsRelations = relations(gameSessions, ({ one }) => ({
  user: one(users, {
    fields: [gameSessions.user_id],
    references: [users.id]
  })
}));