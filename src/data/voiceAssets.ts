import type { FirstWord } from '@/data/words';

export type WordVoiceClips = {
  say: number;
  phrase: number;
};

// Pre-rendered neural parentese clips (en-US-JennyNeural via edge-tts).
export const wordVoiceClips: Record<string, WordVoiceClips> = {
  ba: {
    say: require('../../assets/voices/ba/say.mp3'),
    phrase: require('../../assets/voices/ba/phrase.mp3'),
  },
  ma: {
    say: require('../../assets/voices/ma/say.mp3'),
    phrase: require('../../assets/voices/ma/phrase.mp3'),
  },
  da: {
    say: require('../../assets/voices/da/say.mp3'),
    phrase: require('../../assets/voices/da/phrase.mp3'),
  },
  mama: {
    say: require('../../assets/voices/mama/say.mp3'),
    phrase: require('../../assets/voices/mama/phrase.mp3'),
  },
  dada: {
    say: require('../../assets/voices/dada/say.mp3'),
    phrase: require('../../assets/voices/dada/phrase.mp3'),
  },
  baby: {
    say: require('../../assets/voices/baby/say.mp3'),
    phrase: require('../../assets/voices/baby/phrase.mp3'),
  },
  hi: {
    say: require('../../assets/voices/hi/say.mp3'),
    phrase: require('../../assets/voices/hi/phrase.mp3'),
  },
  bye: {
    say: require('../../assets/voices/bye/say.mp3'),
    phrase: require('../../assets/voices/bye/phrase.mp3'),
  },
  more: {
    say: require('../../assets/voices/more/say.mp3'),
    phrase: require('../../assets/voices/more/phrase.mp3'),
  },
  alldone: {
    say: require('../../assets/voices/alldone/say.mp3'),
    phrase: require('../../assets/voices/alldone/phrase.mp3'),
  },
  up: {
    say: require('../../assets/voices/up/say.mp3'),
    phrase: require('../../assets/voices/up/phrase.mp3'),
  },
  uhoh: {
    say: require('../../assets/voices/uhoh/say.mp3'),
    phrase: require('../../assets/voices/uhoh/phrase.mp3'),
  },
  peekaboo: {
    say: require('../../assets/voices/peekaboo/say.mp3'),
    phrase: require('../../assets/voices/peekaboo/phrase.mp3'),
  },
  nightnight: {
    say: require('../../assets/voices/nightnight/say.mp3'),
    phrase: require('../../assets/voices/nightnight/phrase.mp3'),
  },
  woof: {
    say: require('../../assets/voices/woof/say.mp3'),
    phrase: require('../../assets/voices/woof/phrase.mp3'),
  },
  meow: {
    say: require('../../assets/voices/meow/say.mp3'),
    phrase: require('../../assets/voices/meow/phrase.mp3'),
  },
  moo: {
    say: require('../../assets/voices/moo/say.mp3'),
    phrase: require('../../assets/voices/moo/phrase.mp3'),
  },
  quack: {
    say: require('../../assets/voices/quack/say.mp3'),
    phrase: require('../../assets/voices/quack/phrase.mp3'),
  },
  ball: {
    say: require('../../assets/voices/ball/say.mp3'),
    phrase: require('../../assets/voices/ball/phrase.mp3'),
  },
  book: {
    say: require('../../assets/voices/book/say.mp3'),
    phrase: require('../../assets/voices/book/phrase.mp3'),
  },
  milk: {
    say: require('../../assets/voices/milk/say.mp3'),
    phrase: require('../../assets/voices/milk/phrase.mp3'),
  },
  water: {
    say: require('../../assets/voices/water/say.mp3'),
    phrase: require('../../assets/voices/water/phrase.mp3'),
  },
  shoe: {
    say: require('../../assets/voices/shoe/say.mp3'),
    phrase: require('../../assets/voices/shoe/phrase.mp3'),
  },
  moon: {
    say: require('../../assets/voices/moon/say.mp3'),
    phrase: require('../../assets/voices/moon/phrase.mp3'),
  },
};

export const praiseClips = [
  require('../../assets/voices/_praise/0.mp3'),
  require('../../assets/voices/_praise/1.mp3'),
  require('../../assets/voices/_praise/2.mp3'),
  require('../../assets/voices/_praise/3.mp3'),
  require('../../assets/voices/_praise/4.mp3'),
] as const;

export const finalPraiseClip = require('../../assets/voices/_praise/final.mp3');

export function clipsFor(word: FirstWord): WordVoiceClips | undefined {
  return wordVoiceClips[word.id];
}
