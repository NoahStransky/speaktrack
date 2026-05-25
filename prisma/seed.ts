import { PrismaClient } from '@/app/generated/prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient({ adapter: new PrismaLibSql({ url: 'file:./prisma/dev.db' }) });

const seedResources = [
  { type: 'shadowing', title: 'How great leaders inspire action — Simon Sinek', url: 'https://www.ted.com/talks/simon_sinek_how_great_leaders_inspire_action', content: 'Iconic TED talk. Clear, slow delivery — excellent for shadowing practice.', tags: 'ted,motivation,leadership,shadowing,beginner' },
  { type: 'shadowing', title: 'The power of vulnerability — Brené Brown', url: 'https://www.ted.com/talks/brene_brown_the_power_of_vulnerability', content: 'Conversational style, great for practicing natural English rhythm.', tags: 'ted,communication,shadowing,intermediate' },
  { type: 'shadowing', title: 'Do schools kill creativity? — Sir Ken Robinson', url: 'https://www.ted.com/talks/sir_ken_robinson_do_schools_kill_creativity', content: 'Witty, humorous delivery. Good for practicing timing and humor.', tags: 'ted,education,creativity,shadowing,humor' },
  { type: 'shadowing', title: 'Your body language may shape who you are — Amy Cuddy', url: 'https://www.ted.com/talks/amy_cuddy_your_body_language_may_shape_who_you_are', content: 'Clear academic English with personal story.', tags: 'ted,psychology,shadowing,intermediate' },
  { type: 'shadowing', title: 'The Future of Programming — Uncle Bob Martin', url: 'https://www.youtube.com/watch?v=ecIWPzGEbFc', content: 'Clear enunciation, repeats key points — excellent for tech English.', tags: 'tech,programming,clean-code,shadowing,advanced' },
  { type: 'link', title: '6 Minute English — BBC Learning English', url: 'https://www.bbc.co.uk/learningenglish/english/features/6-minute-english', content: 'Weekly 6-minute episodes with transcripts. Perfect daily listening.', tags: 'bbc,podcast,daily,beginner,listening' },
  { type: 'link', title: 'The Changelog — Conversations about software', url: 'https://changelog.com/podcast', content: 'Long-form developer interviews. Natural tech conversation English.', tags: 'tech,podcast,software,advanced,listening' },
  { type: 'link', title: 'Syntax.fm — Web Development Podcast', url: 'https://syntax.fm/', content: 'Two devs discussing web tech. Casual modern English.', tags: 'tech,podcast,webdev,intermediate,listening' },
  { type: 'link', title: 'YouGlish — Pronunciation Search Engine', url: 'https://youglish.com/', content: 'Hear any word/phrase pronounced in real YouTube videos.', tags: 'pronunciation,tool,essential' },
  { type: 'link', title: 'VOA Learning English', url: 'https://learningenglish.voanews.com/', content: 'News articles with audio. Slower, clearer English for learners.', tags: 'news,reading,listening,beginner' },
  { type: 'phrase', title: 'Standup update template', content: 'Yesterday I worked on [X]. Today I\'m planning to [Y]. I\'m blocked on [Z].', tags: 'work,standup,meeting,daily' },
  { type: 'phrase', title: 'Asking for clarification in meetings', content: '"Sorry, could you say that again?" / "Just to make sure I understand..." / "Could you elaborate on that?"', tags: 'meeting,clarification,polite,essential' },
  { type: 'phrase', title: 'Code review feedback phrases', content: '"I wonder if we could simplify this by..." / "Have you considered [alternative]?" / "This looks good! One small suggestion..."', tags: 'code-review,feedback,collaboration,work' },
  { type: 'phrase', title: 'Giving a tech presentation — transitions', content: '"Let\'s move on to..." / "That brings me to my next point..." / "To illustrate this..." / "In summary..."', tags: 'presentation,public-speaking,transitions,work' },
  { type: 'phrase', title: 'Australian workplace phrases', content: '"No worries" (it\'s fine). "Arvo" (afternoon). "How\'re you going?" (How are you?). "Good on ya" (well done).', tags: 'australia,workplace,culture,slang' },
  { type: 'phrase', title: 'Small talk at work', content: '"How was your weekend?" / "Any plans for the holiday?" / "The weather\'s been nice lately, hasn\'t it?"', tags: 'small-talk,work,social,essential' },
  { type: 'phrase', title: 'Expressing uncertainty politely', content: '"I\'m not 100% sure, but I think..." / "Let me double-check and get back to you." / "Off the top of my head..."', tags: 'meeting,uncertainty,polite,essential' },
];

async function main() {
  console.log('Seeding database...');

  const demoPassword = await bcrypt.hash('demo1234', 12);
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@speaktrack.app' },
    update: {},
    create: { email: 'demo@speaktrack.app', name: 'Demo User', passwordHash: demoPassword, nativeLanguage: 'Chinese' },
  });

  for (const resource of seedResources) {
    await prisma.resource.create({ data: { ...resource, userId: demoUser.id, isPublic: true } });
  }

  const sampleLogs = Array.from({ length: 21 }, (_, i) => {
    const date = new Date(); date.setDate(date.getDate() - (20 - i));
    const hasActivity = Math.random() > 0.3;
    return {
      userId: demoUser.id, date,
      shadowingDone: hasActivity && Math.random() > 0.4, shadowingMinutes: hasActivity ? Math.floor(Math.random() * 20) + 5 : 0,
      voiceNoteDone: hasActivity && Math.random() > 0.5, coffeeChatDone: hasActivity && Math.random() > 0.7,
      energyLevel: Math.floor(Math.random() * 3) + 2, notes: hasActivity ? 'Practiced pronunciation' : '',
    };
  });

  for (const log of sampleLogs) {
    await prisma.dailyLog.upsert({ where: { userId_date: { userId: demoUser.id, date: log.date } }, update: log, create: log });
  }

  console.log(`Seeded: demo user (demo@speaktrack.app / demo1234)`);
  console.log(`Seeded: ${seedResources.length} resources, ${sampleLogs.length} daily logs`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
