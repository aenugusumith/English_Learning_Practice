import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

interface UserProfile {
  nativeLanguage?: string;
  currentLevel?: string;
  targetLevel?: string;
  focusAreas?: string[];
  previousMistakes?: string[];
}

interface FeedbackOptions {
  includePhonetics?: boolean;
  includeIdioms?: boolean;
  includeCulturalContext?: boolean;
  detailedGrammar?: boolean;
}

// Enhanced feedback generation with personalization
export const generateFeedback = async (
  transcript: string,
  userProfile?: UserProfile,
  options?: FeedbackOptions
) => {
  const profileContext = userProfile ? `
User Profile:
- Native Language: ${userProfile.nativeLanguage || 'Not specified'}
- Current Level: ${userProfile.currentLevel || 'Unknown'}
- Target Level: ${userProfile.targetLevel || 'Not specified'}
- Focus Areas: ${userProfile.focusAreas?.join(', ') || 'General improvement'}
- Common Past Mistakes: ${userProfile.previousMistakes?.join(', ') || 'None recorded'}
` : '';

  const prompt = `
You are an expert English-speaking coach specializing in personalized feedback.

${profileContext}

A user said:
"${transcript}"

Please analyze their spoken transcript and provide comprehensive, actionable feedback in this structure:

**🎯 Quick Assessment**:
- Fluency Score: X/10
- CEFR Level: A1, A2, B1, B2, C1, or C2
- Main Strength: [What they did well]
- Priority Focus: [Most important area to work on]

**🛠 Mistake Analysis & Corrections**:
${userProfile?.previousMistakes?.length ? 
`- 🔄 Recurring Patterns: [Check for previous mistakes]` : ''}
- ❌ Grammar Errors → ✅ Corrections with explanations
- ❌ Word Choice Issues → ✅ Better alternatives
- ❌ Pronunciation Concerns → ✅ Correct pronunciation${options?.includePhonetics ? ' [/fəˈnetɪk/]' : ''}

**💬 Vocabulary Enhancement**:
- 📈 Level-Up Words: [Suggest more advanced synonyms]
- 🌍 Natural Expressions: [More native-like phrasing]${options?.includeIdioms ? 
`- 💭 Relevant Idioms: [Appropriate idioms for this context]` : ''}
- 🎨 Collocations: [Word combinations that go together]

**🔊 Speech Flow & Delivery**:
- ⚡ Fluency Issues: [Hesitations, false starts, repetitions]
- 🔗 Connecting Words: [Better transitions and linking phrases]
- 💪 Confidence Boosters: [Ways to sound more assertive]
- 🎵 Rhythm & Stress: [Natural speech patterns]

**✍️ Enhanced Versions**:
- 🥉 Good Version: [Corrected version]
- 🥈 Better Version: [More natural/fluent version]
- 🥇 Advanced Version: [Higher-level vocabulary and structures]

**📚 Learning Recommendations**:
- 🎯 Immediate Focus: [Top 2-3 specific things to practice]
- 📖 Grammar Point: [One key grammar rule to study]
- 🎬 Practice Suggestion: [Specific exercise or activity]
- 🗣️ Speaking Drill: [Targeted speaking practice]

**🌟 Motivation & Progress**:
- 🎉 Celebrations: [What improved from typical learner mistakes]
- 📈 Next Milestone: [What to achieve next]
- 💡 Pro Tip: [One insider tip for faster improvement]

${options?.includeCulturalContext ? `
**🌍 Cultural Context**:
- 🤝 Cultural Appropriateness: [How this sounds to native speakers]
- 🏛️ Formal vs Informal: [Register analysis and alternatives]
` : ''}

**📊 Detailed Scoring** (if current level known):
- Grammar Accuracy: X/10
- Vocabulary Range: X/10
- Pronunciation: X/10
- Fluency: X/10
- Coherence: X/10

Make feedback encouraging, specific, and immediately actionable. Focus on the most impactful improvements first.`;

  try {
    const chatCompletion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7, // Balanced creativity and consistency
      max_tokens: 1500, // Detailed feedback
    });

    return chatCompletion.choices[0].message.content || '';
  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw new Error('Failed to generate feedback');
  }
};

// Generate pronunciation feedback specifically
export const generatePronunciationFeedback = async (transcript: string) => {
  const prompt = `
You are a pronunciation specialist. Analyze this transcript for pronunciation issues:

"${transcript}"

Provide feedback in this format:

**🔊 Pronunciation Analysis**:

**🎯 Likely Problem Sounds**:
- [Identify sounds that might be mispronounced based on common patterns]

**📝 Word-by-Word Breakdown**:
- word → /wɜːrd/ [Focus on difficult sounds]

**🌍 Common Non-Native Patterns**:
- [Typical pronunciation mistakes and corrections]

**🎵 Stress & Rhythm**:
- [Word stress and sentence rhythm guidance]

**🎧 Listen & Repeat**:
- [Specific words/phrases to practice]

**💡 Practice Tips**:
- [Targeted exercises for improvement]

Focus on the most impactful pronunciation improvements.`;

  try {
    const chatCompletion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.5,
      max_tokens: 1000,
    });

    return chatCompletion.choices[0].message.content || '';
  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw new Error('Failed to generate pronunciation feedback');
  }
};

// Generate conversation starters and follow-up questions
export const generateConversationPrompts = async (
  topic: string,
  userLevel: string = 'intermediate'
) => {
  const prompt = `
Generate conversation prompts for ${userLevel} English learners on the topic: "${topic}"

Provide:

**🎯 Warm-up Questions** (Easy starters):
- [3 simple questions to get comfortable]

**💬 Main Discussion Points** (Core conversation):
- [4-5 engaging questions that encourage longer responses]

**🌟 Challenge Questions** (Push their limits):
- [2-3 more complex questions for advanced practice]

**💭 Opinion & Experience**:
- [Questions that ask for personal views and experiences]

**📚 Vocabulary Preview**:
- [10-15 useful words/phrases for this topic with simple definitions]

**🎭 Role-Play Scenarios** (Optional):
- [2 situational conversations they can practice]

Make questions engaging and personally relevant to encourage natural responses.`;

  try {
    const chatCompletion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.8, // More creative for varied questions
      max_tokens: 1200,
    });

    return chatCompletion.choices[0].message.content || '';
  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw new Error('Failed to generate conversation prompts');
  }
};

// Generate personalized study plan
export const generateStudyPlan = async (
  currentLevel: string,
  targetLevel: string,
  timeAvailable: string,
  weakAreas: string[]
) => {
  const prompt = `
Create a personalized English study plan:

Current Level: ${currentLevel}
Target Level: ${targetLevel}
Time Available: ${timeAvailable}
Weak Areas: ${weakAreas.join(', ')}

Provide a structured plan:

**🎯 Learning Goals** (Next 4 weeks):
- [Specific, measurable objectives]

**📅 Weekly Schedule**:
- [Breakdown of daily activities]

**🔧 Priority Focus Areas**:
- Week 1: [Focus area and activities]
- Week 2: [Focus area and activities]
- Week 3: [Focus area and activities]
- Week 4: [Focus area and activities]

**📚 Resources & Materials**:
- [Specific recommendations for their level]

**🎯 Daily Practice Routine** (${timeAvailable}):
- [Realistic daily activities]

**📈 Progress Tracking**:
- [How to measure improvement]

**🎉 Milestones & Rewards**:
- [Motivation and celebration points]

Make it realistic, specific, and actionable for their situation.`;

  try {
    const chatCompletion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.6,
      max_tokens: 1500,
    });

    return chatCompletion.choices[0].message.content || '';
  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw new Error('Failed to generate study plan');
  }
};


