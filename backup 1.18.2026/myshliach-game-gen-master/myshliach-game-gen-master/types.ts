
export type GameGenerationInput = 
  | { type: 'text'; value: string }
  | { type: 'file'; data: string; mimeType: string };

export enum GameType {
  QUIZ = 'QUIZ',
  MATCHING = 'MATCHING',
  MEMORY = 'MEMORY',
  TRUE_FALSE = 'TRUE_FALSE',
  SEQUENCE = 'SEQUENCE',
  WORD_SEARCH = 'WORD_SEARCH',
  UNSCRAMBLE = 'UNSCRAMBLE',
  SORTING = 'SORTING',
  FILL_IN_BLANK = 'FILL_IN_BLANK',
  RIDDLE = 'RIDDLE',
  CROSSWORD = 'CROSSWORD',
  EMOJI_CHALLENGE = 'EMOJI_CHALLENGE',
  TRIVIA_TRAIL = 'TRIVIA_TRAIL',
  FIND_MATCH = 'FIND_MATCH',
}

export interface QuizItem {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
}

export interface MatchingItem {
  id: string;
  term: string;
  definition: string;
}

export interface SequenceItem {
  id: string;
  text: string;
  order: number;
}

export interface SortingItem {
  id: string;
  text: string;
  category: string;
}

export interface SortingData {
  categories: string[];
  items: SortingItem[];
}

export interface UnscrambleItem {
  id: string;
  original: string;
  hint: string;
}

export interface FillBlankData {
  storySegments: string[]; // Text split by blanks
  missingWords: string[]; // The words that go into the blanks
}

export interface RiddleItem {
  id: string;
  clues: string[]; // List of clues to reveal one by one
  answer: string;
}

export interface CrosswordItem {
  word: string;
  clue: string;
}

export interface EmojiChallengeItem {
  id: string;
  emojis: string;
  answer: string;
  hint: string;
  options: string[]; // Multiple choice options
}

export interface TriviaTrailItem {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
}

export interface GameData {
  title: string;
  instructions: string;
  type: GameType;
  quizContent?: QuizItem[];
  matchingContent?: MatchingItem[];
  sequenceContent?: SequenceItem[];
  sortingContent?: SortingData;
  unscrambleContent?: UnscrambleItem[];
  wordSearchContent?: string[];
  fillBlankContent?: FillBlankData;
  riddleContent?: RiddleItem[];
  crosswordContent?: CrosswordItem[];
  emojiContent?: EmojiChallengeItem[];
  triviaTrailContent?: TriviaTrailItem[];
  findMatchContent?: string[]; // List of 20-30 words/icons to use for generation
  mentorKey: string[];
}

export interface GameState {
  view: 'INPUT' | 'MENU' | 'LOADING' | 'GAME' | 'ERROR';
  inputData?: GameGenerationInput;
  data: GameData | null;
  error?: string;
}
