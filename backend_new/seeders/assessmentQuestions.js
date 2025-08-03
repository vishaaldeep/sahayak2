const mongoose = require('mongoose');
const AssessmentQuestion = require('../models/AssessmentQuestion');
const Skill = require('../models/Skill');

// Question bank for different skills
const questionBanks = {
  'Driving': [
    {
      question: "What is the minimum age to get a driving license for a car in India?",
      options: [
        { text: "16 years", is_correct: false },
        { text: "18 years", is_correct: true },
        { text: "21 years", is_correct: false },
        { text: "25 years", is_correct: false }
      ],
      difficulty_level: "easy"
    },
    {
      question: "What does a red traffic light mean?",
      options: [
        { text: "Slow down", is_correct: false },
        { text: "Stop completely", is_correct: true },
        { text: "Proceed with caution", is_correct: false },
        { text: "Turn left only", is_correct: false }
      ],
      difficulty_level: "easy"
    },
    {
      question: "What is the speed limit in residential areas in India?",
      options: [
        { text: "30 km/h", is_correct: true },
        { text: "50 km/h", is_correct: false },
        { text: "60 km/h", is_correct: false },
        { text: "80 km/h", is_correct: false }
      ],
      difficulty_level: "medium"
    },
    {
      question: "When should you use the horn while driving?",
      options: [
        { text: "To express anger", is_correct: false },
        { text: "To warn other road users", is_correct: true },
        { text: "When stuck in traffic", is_correct: false },
        { text: "At night only", is_correct: false }
      ],
      difficulty_level: "easy"
    },
    {
      question: "What is the safe following distance behind another vehicle?",
      options: [
        { text: "1 second", is_correct: false },
        { text: "2 seconds", is_correct: false },
        { text: "3 seconds", is_correct: true },
        { text: "5 seconds", is_correct: false }
      ],
      difficulty_level: "medium"
    }
    // Add 195 more driving questions here...
  ],
  
  'Cooking': [
    {
      question: "At what temperature should chicken be cooked to ensure it's safe to eat?",
      options: [
        { text: "60°C", is_correct: false },
        { text: "65°C", is_correct: false },
        { text: "75°C", is_correct: true },
        { text: "85°C", is_correct: false }
      ],
      difficulty_level: "medium"
    },
    {
      question: "Which spice is known as the 'Queen of Spices'?",
      options: [
        { text: "Turmeric", is_correct: false },
        { text: "Cardamom", is_correct: true },
        { text: "Cinnamon", is_correct: false },
        { text: "Black pepper", is_correct: false }
      ],
      difficulty_level: "easy"
    },
    {
      question: "What is the main ingredient in a traditional Indian dal?",
      options: [
        { text: "Rice", is_correct: false },
        { text: "Wheat", is_correct: false },
        { text: "Lentils", is_correct: true },
        { text: "Corn", is_correct: false }
      ],
      difficulty_level: "easy"
    },
    {
      question: "Which cooking method uses dry heat to cook food?",
      options: [
        { text: "Boiling", is_correct: false },
        { text: "Steaming", is_correct: false },
        { text: "Roasting", is_correct: true },
        { text: "Poaching", is_correct: false }
      ],
      difficulty_level: "medium"
    },
    {
      question: "What is the ideal temperature for deep frying?",
      options: [
        { text: "120-140°C", is_correct: false },
        { text: "160-180°C", is_correct: true },
        { text: "200-220°C", is_correct: false },
        { text: "240-260°C", is_correct: false }
      ],
      difficulty_level: "medium"
    }
    // Add 195 more cooking questions here...
  ],

  'Plumbing': [
    {
      question: "What is the most common cause of a dripping faucet?",
      options: [
        { text: "Broken pipe", is_correct: false },
        { text: "Worn out washer", is_correct: true },
        { text: "Low water pressure", is_correct: false },
        { text: "Clogged drain", is_correct: false }
      ],
      difficulty_level: "easy"
    },
    {
      question: "Which tool is primarily used to cut pipes?",
      options: [
        { text: "Wrench", is_correct: false },
        { text: "Plunger", is_correct: false },
        { text: "Pipe cutter", is_correct: true },
        { text: "Screwdriver", is_correct: false }
      ],
      difficulty_level: "easy"
    },
    {
      question: "What does PVC stand for in plumbing?",
      options: [
        { text: "Plastic Vinyl Compound", is_correct: false },
        { text: "Polyvinyl Chloride", is_correct: true },
        { text: "Pressure Valve Control", is_correct: false },
        { text: "Pipe Valve Connection", is_correct: false }
      ],
      difficulty_level: "medium"
    },
    {
      question: "What is the standard water pressure in residential plumbing?",
      options: [
        { text: "20-30 PSI", is_correct: false },
        { text: "40-60 PSI", is_correct: true },
        { text: "80-100 PSI", is_correct: false },
        { text: "120-140 PSI", is_correct: false }
      ],
      difficulty_level: "medium"
    },
    {
      question: "Which joint is commonly used for copper pipes?",
      options: [
        { text: "Threaded joint", is_correct: false },
        { text: "Soldered joint", is_correct: true },
        { text: "Glued joint", is_correct: false },
        { text: "Welded joint", is_correct: false }
      ],
      difficulty_level: "hard"
    }
    // Add 195 more plumbing questions here...
  ],

  'Electrical': [
    {
      question: "What is the standard voltage for household electricity in India?",
      options: [
        { text: "110V", is_correct: false },
        { text: "220V", is_correct: true },
        { text: "240V", is_correct: false },
        { text: "380V", is_correct: false }
      ],
      difficulty_level: "easy"
    },
    {
      question: "What does AC stand for in electrical terms?",
      options: [
        { text: "Air Conditioning", is_correct: false },
        { text: "Alternating Current", is_correct: true },
        { text: "Automatic Control", is_correct: false },
        { text: "Active Circuit", is_correct: false }
      ],
      difficulty_level: "easy"
    },
    {
      question: "Which safety device protects against electrical overload?",
      options: [
        { text: "Switch", is_correct: false },
        { text: "Fuse", is_correct: true },
        { text: "Socket", is_correct: false },
        { text: "Wire", is_correct: false }
      ],
      difficulty_level: "medium"
    },
    {
      question: "What is the unit of electrical resistance?",
      options: [
        { text: "Volt", is_correct: false },
        { text: "Ampere", is_correct: false },
        { text: "Ohm", is_correct: true },
        { text: "Watt", is_correct: false }
      ],
      difficulty_level: "medium"
    },
    {
      question: "What color wire is typically used for grounding?",
      options: [
        { text: "Red", is_correct: false },
        { text: "Black", is_correct: false },
        { text: "Green", is_correct: true },
        { text: "Blue", is_correct: false }
      ],
      difficulty_level: "easy"
    }
    // Add 195 more electrical questions here...
  ]
};

// Function to generate more questions for each skill
const generateMoreQuestions = (skillName, baseQuestions) => {
  const questions = [...baseQuestions];
  
  // Generate variations and additional questions to reach 200 total
  while (questions.length < 200) {
    // Create variations of existing questions
    const baseQuestion = baseQuestions[questions.length % baseQuestions.length];
    const variation = {
      ...baseQuestion,
      question: `${baseQuestion.question} (Variation ${Math.floor(questions.length / baseQuestions.length) + 1})`,
      difficulty_level: ['easy', 'medium', 'hard'][Math.floor(Math.random() * 3)]
    };
    questions.push(variation);
  }
  
  return questions;
};

const seedAssessmentQuestions = async () => {
  try {
    console.log('Starting to seed assessment questions...');
    
    // Clear existing questions
    await AssessmentQuestion.deleteMany({});
    console.log('Cleared existing assessment questions');
    
    // Get all skills
    const skills = await Skill.find({});
    console.log(`Found ${skills.length} skills`);
    
    for (const skill of skills) {
      console.log(`Seeding questions for skill: ${skill.name}`);
      
      let questions = [];
      
      if (questionBanks[skill.name]) {
        // Use predefined questions and generate more
        questions = generateMoreQuestions(skill.name, questionBanks[skill.name]);
      } else {
        // Generate generic questions for skills not in the bank
        questions = generateGenericQuestions(skill.name);
      }
      
      // Prepare questions for insertion
      const questionsToInsert = questions.map(q => ({
        skill_id: skill._id,
        question: q.question,
        options: q.options,
        difficulty_level: q.difficulty_level || 'medium',
        category: skill.category || 'General'
      }));
      
      // Insert questions in batches
      await AssessmentQuestion.insertMany(questionsToInsert);
      console.log(`Inserted ${questionsToInsert.length} questions for ${skill.name}`);
    }
    
    console.log('Assessment questions seeded successfully!');
  } catch (error) {
    console.error('Error seeding assessment questions:', error);
  }
};

// Generate generic questions for skills not in the predefined bank
const generateGenericQuestions = (skillName) => {
  const genericQuestions = [];
  
  for (let i = 1; i <= 200; i++) {
    genericQuestions.push({
      question: `What is an important aspect of ${skillName}? (Question ${i})`,
      options: [
        { text: "Safety first", is_correct: true },
        { text: "Speed over quality", is_correct: false },
        { text: "Ignoring guidelines", is_correct: false },
        { text: "Working without tools", is_correct: false }
      ],
      difficulty_level: ['easy', 'medium', 'hard'][i % 3]
    });
  }
  
  return genericQuestions;
};

module.exports = { seedAssessmentQuestions };