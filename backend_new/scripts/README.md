# Question Bank Population Script

This script populates the assessment question bank with 200 questions for each of the 18 skills.

## Skills Covered

The script creates questions for the following skills with their associated colors:

1. **Driving** (#3b82f6) - Categories: 2w, 3w, 4w
2. **Cooking** (#f59e42) - Categories: baker, chef
3. **Mechanic** (#6366f1) - Categories: 2w, 3w, 4w
4. **Waiter** (#10b981)
5. **Vehicle Cleaning** (#f472b6)
6. **Cleaning** (#a3e635)
7. **Bartending** (#fbbf24)
8. **Dishwashing** (#818cf8)
9. **Laundry** (#f87171)
10. **Gardening** (#22d3ee)
11. **Plumbing** (#0ea5e9)
12. **Carpentering** (#facc15)
13. **Painting** (#a21caf)
14. **Electric Work** (#f43f5e)
15. **Electronic Repair** (#14b8a6) - Categories: laptop, computer, mobile, speaker, mic
16. **Security Guards** (#64748b)
17. **Warehouse Works** (#f59e42)
18. **Constructor Labour** (#b91c1c)

## How to Run

### Prerequisites
- MongoDB should be running
- Environment variables should be set (MONGODB_URI)

### Run the Script

```bash
# Navigate to backend_new directory
cd backend_new

# Run the population script
npm run populate-questions
```

Or directly:
```bash
node scripts/populateQuestionBank.js
```

## What the Script Does

1. **Creates/Updates Skills**: Ensures all 18 skills exist in the database with correct colors and categories
2. **Generates Questions**: Creates 200 unique questions for each skill
3. **Question Variations**: Uses base question templates and generates variations to reach 200 questions per skill
4. **Difficulty Levels**: Assigns random difficulty levels (easy, medium, hard) to questions
5. **Categories**: Assigns appropriate categories to questions based on skill categories

## Question Structure

Each question has:
- **Question Text**: The actual question
- **4 Options**: Multiple choice options with exactly one correct answer
- **Difficulty Level**: easy, medium, or hard
- **Skill Association**: Linked to specific skill
- **Category**: Sub-category within the skill (if applicable)

## Database Impact

- **Total Questions**: 3,600 questions (200 × 18 skills)
- **Collections Updated**: 
  - `skills` - Skill definitions with colors
  - `assessmentquestions` - Question bank

## Safety Features

- **Duplicate Prevention**: Checks existing question count before adding
- **Data Validation**: Ensures exactly 4 options with 1 correct answer
- **Error Handling**: Graceful error handling and reporting
- **Connection Management**: Proper database connection lifecycle

## Output Example

```
🚀 Starting question bank population...

1. Creating/updating skills...
   ✅ Skill: driving
   ✅ Skill: cooking
   ...

2. Generating questions for each skill...
   ✅ Generated 200 questions for driving
   ✅ Generated 200 questions for cooking
   ...

🎉 Question bank population completed!

📊 Summary:
   Total Skills: 18
   Total Questions: 3,600
   Average Questions per Skill: 200
```

## Assessment Modal Integration

The assessment modal now uses skill-specific colors as themes:
- Progress bars use skill colors
- Buttons use skill colors
- Selected options highlight with skill colors
- Headers and scores display in skill colors

This creates a cohesive visual experience where each skill has its unique color theme throughout the assessment process.