/// <reference types="node" />
import axios from "axios";

/**
 * Sample script to create test data in MongoDB
 * This script creates 2 sample MCQ tests and 2 sample Coding tests
 * 
 * Usage:
 * npx ts-node backend/seedTests.ts
 * 
 * Make sure the backend server is running and MongoDB is connected
 */

const API_URL = "http://localhost:3000";

// Sample MCQ Test Data
const mcqTest1 = {
  title: "JavaScript Fundamentals",
  company: "Tech Startup Inc",
  type: "MCQ",
  description: "Test your knowledge on JavaScript basics including variables, functions, and object manipulation.",
  duration: 30,
  totalQuestions: 5,
  difficulty: "Easy",
  passingScore: 60,
  questions: [
    {
      questionText: "What will be the output of the following code?\nlet x = 5;\nlet y = 5;\nconsole.log(x === y);",
      options: ["true", "false", "undefined", "error"],
      correctAnswer: 0,
      marks: 1,
      explanation: "The === operator checks for both value and type equality. Since both x and y are the number 5, the result is true."
    },
    {
      questionText: "Which of the following is a correct way to declare a variable in JavaScript?",
      options: ["variable x = 5;", "v x = 5;", "let x = 5;", "define x = 5;"],
      correctAnswer: 2,
      marks: 1,
      explanation: "The correct way to declare a variable is using 'let', 'const', or 'var' keywords. 'let x = 5;' is valid ES6 syntax."
    },
    {
      questionText: "What is the result of: typeof undefined",
      options: ["'undefined'", "'object'", "'null'", "undefined"],
      correctAnswer: 0,
      marks: 1,
      explanation: "typeof undefined returns the string 'undefined'."
    },
    {
      questionText: "Which array method removes items from an array and returns the removed items?",
      options: ["slice()", "splice()", "split()", "slice() and splice()"],
      correctAnswer: 1,
      marks: 1,
      explanation: "splice() modifies the original array and returns the removed items, while slice() returns a shallow copy without modifying the original."
    },
    {
      questionText: "What will be logged to the console?\nconsole.log([1, 2] + [3, 4]);",
      options: ["[1, 2, 3, 4]", "'1,23,4'", "[1,2,3,4]", "NaN"],
      correctAnswer: 1,
      marks: 1,
      explanation: "Arrays are converted to strings when using the + operator. [1,2] becomes '1,2' and [3,4] becomes '3,4', resulting in '1,23,4'."
    }
  ],
  proctoringEnabled: true,
  webcamRequired: false,
  isActive: true,
};

const mcqTest2 = {
  title: "React Advanced Concepts",
  company: "Digital Solutions Ltd",
  type: "MCQ",
  description: "Advanced React knowledge including hooks, context API, and performance optimization.",
  duration: 45,
  totalQuestions: 8,
  difficulty: "Hard",
  passingScore: 70,
  questions: [
    {
      questionText: "What is the main purpose of useCallback in React?",
      options: [
        "To memoize callback functions and prevent unnecessary re-renders",
        "To call functions during render",
        "To handle errors in callbacks",
        "To log callback executions"
      ],
      correctAnswer: 0,
      marks: 2,
      explanation: "useCallback returns a memoized callback function, useful for optimization when passing callbacks to child components."
    },
    {
      questionText: "When should you use useLayoutEffect instead of useEffect?",
      options: [
        "Always use useLayoutEffect",
        "When you need to read layout values or perform DOM measurements",
        "Never use useLayoutEffect",
        "When working with async operations"
      ],
      correctAnswer: 1,
      marks: 2,
      explanation: "useLayoutEffect runs synchronously after DOM mutations, making it ideal for reading layout or triggering reflows."
    },
    {
      questionText: "What is the difference between controlled and uncontrolled components?",
      options: [
        "There is no difference",
        "Controlled components have React state managing form data; uncontrolled components manage their own state",
        "Uncontrolled components are faster",
        "Controlled components cannot use onChange"
      ],
      correctAnswer: 1,
      marks: 2,
      explanation: "Controlled components have their state managed by React; uncontrolled components manage their own internal state using refs."
    },
    {
      questionText: "How do you prevent a component from rendering with React.memo?",
      options: [
        "Use shouldComponentUpdate",
        "Wrap the component with React.memo and provide a custom comparison function",
        "Set display: none",
        "Use CSS to hide it"
      ],
      correctAnswer: 1,
      marks: 2,
      explanation: "React.memo memoizes a component and can accept a custom comparison function to prevent unnecessary re-renders."
    },
    {
      questionText: "What is the purpose of the dependency array in useEffect?",
      options: [
        "To specify dependencies that trigger effect re-run",
        "To store global variables",
        "To define component lifecycle",
        "To handle errors"
      ],
      correctAnswer: 0,
      marks: 2,
      explanation: "The dependency array tells React when to re-run the effect. Empty array means run once; no array means run on every render."
    },
    {
      questionText: "How can you optimize performance when rendering large lists?",
      options: [
        "Use key prop and React.memo",
        "Use virtualization (windowing)",
        "Remove render optimizations",
        "Both A and B"
      ],
      correctAnswer: 3,
      marks: 2,
      explanation: "Use key prop for proper reconciliation, React.memo for preventing re-renders, and virtualization to render only visible items."
    },
    {
      questionText: "What is the purpose of useReducer?",
      options: [
        "To manage complex state logic",
        "To replace useState",
        "To handle API calls",
        "To debug components"
      ],
      correctAnswer: 0,
      marks: 2,
      explanation: "useReducer is ideal for managing complex state logic with multiple sub-values or dependencies between state values."
    },
    {
      questionText: "What is code splitting in React and why is it important?",
      options: [
        "Splitting code into multiple files",
        "Dynamic import of modules to reduce bundle size",
        "Breaking the app into components",
        "Splitting CSS and JavaScript"
      ],
      correctAnswer: 1,
      marks: 2,
      explanation: "Code splitting uses dynamic imports or lazy loading to load code only when needed, reducing initial bundle size."
    }
  ],
  proctoringEnabled: true,
  webcamRequired: true,
  isActive: true,
};

// Sample Coding Tests
const codingTest1 = {
  title: "Sum of Two Numbers",
  company: "CodeChallenge Corp",
  type: "Coding",
  description: "Write a function that takes two numbers and returns their sum.",
  duration: 20,
  totalQuestions: 1,
  difficulty: "Easy",
  passingScore: 50,
  codingProblems: [
    {
      title: "Sum of Two Numbers",
      description: "Write a function called 'sum' that takes two numbers as parameters and returns their sum.\n\nExample:\nsum(2, 3) should return 5\nsum(-1, 1) should return 0",
      inputFormat: "Two space-separated integers",
      outputFormat: "A single integer representing the sum",
      constraints: "-1000 <= n <= 1000",
      examples: [
        {
          input: "2 3",
          output: "5",
          explanation: "2 + 3 = 5"
        },
        {
          input: "-5 3",
          output: "-2",
          explanation: "-5 + 3 = -2"
        }
      ],
      testCases: [
        {
          input: "1 1",
          expectedOutput: "2",
          isHidden: false
        },
        {
          input: "0 0",
          expectedOutput: "0",
          isHidden: false
        },
        {
          input: "-10 5",
          expectedOutput: "-5",
          isHidden: true
        }
      ],
      difficulty: "Easy",
      marks: 10
    }
  ],
  proctoringEnabled: false,
  webcamRequired: false,
  isActive: true,
};

const codingTest2 = {
  title: "Array Manipulation",
  company: "TechCorp Solutions",
  type: "Coding",
  description: "Advanced array manipulation problems",
  duration: 60,
  totalQuestions: 2,
  difficulty: "Medium",
  passingScore: 50,
  codingProblems: [
    {
      title: "Find Duplicates",
      description: "Given an array of integers, find all numbers that appear more than once.\n\nReturn the duplicate elements in sorted order.",
      inputFormat: "First line: n (array size)\nSecond line: n space-separated integers",
      outputFormat: "Space-separated duplicate numbers in sorted order",
      constraints: "1 <= n <= 100\n-1000 <= arr[i] <= 1000",
      examples: [
        {
          input: "5\n1 2 2 3 3",
          output: "2 3",
          explanation: "2 and 3 appear more than once"
        },
        {
          input: "4\n1 1 1 1",
          output: "1",
          explanation: "Only 1 is duplicate"
        }
      ],
      testCases: [
        {
          input: "3\n1 2 3",
          expectedOutput: "",
          isHidden: false
        },
        {
          input: "6\n1 2 2 3 3 4",
          expectedOutput: "2 3",
          isHidden: true
        }
      ],
      difficulty: "Medium",
      marks: 15
    },
    {
      title: "Matrix Spiral",
      description: "Print a matrix in spiral order (clockwise starting from top-left).",
      inputFormat: "First line: n m (matrix dimensions)\nNext n lines: m space-separated integers",
      outputFormat: "Space-separated integers in spiral order",
      constraints: "1 <= n, m <= 10",
      examples: [
        {
          input: "3 3\n1 2 3\n4 5 6\n7 8 9",
          output: "1 2 3 6 9 8 7 4 5",
          explanation: "Spiral: right, down, left, up, continue"
        }
      ],
      testCases: [
        {
          input: "1 4\n1 2 3 4",
          expectedOutput: "1 2 3 4",
          isHidden: false
        },
        {
          input: "2 2\n1 2\n3 4",
          expectedOutput: "1 2 4 3",
          isHidden: true
        }
      ],
      difficulty: "Medium",
      marks: 15
    }
  ],
  proctoringEnabled: true,
  webcamRequired: true,
  isActive: true,
};

/**
 * Create a test in the database
 */
async function createTest(test: any, adminToken: string) {
  try {
    // This would require an endpoint to create tests (admin functionality)
    console.log(`Would create test: ${test.title}`);
    console.log("Note: Test creation requires admin endpoint implementation");
  } catch (error) {
    console.error(`Error creating test:`, error);
  }
}

/**
 * Seed the database with sample tests
 */
async function seedTests() {
  console.log("🌱 Starting test data seeding...\n");

  try {
    // In production, you would:
    // 1. Get an admin authentication token
    // 2. Call an admin endpoint to create tests
    // 3. Associate tests with an admin user

    console.log("Sample Tests Data:");
    console.log("==================\n");

    console.log("1️⃣  MCQ Test 1: JavaScript Fundamentals");
    console.log(JSON.stringify(mcqTest1, null, 2));
    console.log("\n");

    console.log("2️⃣  MCQ Test 2: React Advanced Concepts");
    console.log(JSON.stringify(mcqTest2, null, 2));
    console.log("\n");

    console.log("3️⃣  Coding Test 1: Sum of Two Numbers");
    console.log(JSON.stringify(codingTest1, null, 2));
    console.log("\n");

    console.log("4️⃣  Coding Test 2: Array Manipulation");
    console.log(JSON.stringify(codingTest2, null, 2));
    console.log("\n");

    console.log("✅ Sample test data prepared!");
    console.log("\n📋 To create these tests in your database:");
    console.log("1. Create an admin endpoint: POST /api/admin/tests");
    console.log("2. Use MongoDB connection to insert the test documents");
    console.log("3. Ensure Test model is updated with all required fields");

  } catch (error) {
    console.error("❌ Error seeding tests:", error);
    process.exit(1);
  }
}

// Run the seeding function
seedTests();
