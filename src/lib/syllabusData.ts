import { SubjectType } from './supabase';

export interface SyllabusSubtopic {
  name: string;
  slug: string;
}

export interface SyllabusTopic {
  id: string;
  name: string;
  subtopics: SyllabusSubtopic[];
}

const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
};

export const ESSENCE_SUBTOPIC_NAME = '🦋⃝ 𝐄𝐒𝐒𝐄𝐍𝐂𝐄 ✨';
export const ESSENCE_SUBTOPIC_SLUG = 'essence';

export const ESSENCE_SUBTOPIC: SyllabusSubtopic = {
  name: ESSENCE_SUBTOPIC_NAME,
  slug: ESSENCE_SUBTOPIC_SLUG
};

const makeSubs = (list: string[]): SyllabusSubtopic[] => {
  return [
    ESSENCE_SUBTOPIC,
    ...list.map(item => ({
      name: item,
      slug: slugify(item).slice(0, 40)
    }))
  ];
};

export const SYLLABUS_DATA: Record<SubjectType, SyllabusTopic[]> = {
  Math: [
    {
      id: 'math-1',
      name: '1. Number System',
      subtopics: makeSubs([
        'Number types: Natural, Whole, Integer, Rational, Irrational, Real',
        'Prime and Composite Numbers',
        'Divisibility Rules (2 to 19)',
        'Factors, Multiples and Number of Factors',
        'Sum and Product of Factors',
        'HCF and LCM (Basic and Word Problems)',
        'HCF-LCM of Fractions and Decimals',
        'Unit Digit and Cyclicity',
        'Remainder Theorem and Tricks',
        'Factorial and Trailing Zeros',
        'Highest Power of a Number in n!',
        'Recurring Decimals',
        'Consecutive Numbers',
        'Digit-based and Reverse Number Problems',
        'Square, Cube and Root Properties',
        'Fermat and Euler Theorem (T2)',
        'Base Conversion: Binary, Octal, Hexadecimal (T2)',
        'Perfect Numbers, Co-primes, Twin Primes (T2)'
      ])
    },
    {
      id: 'math-2',
      name: '2. Simplification & Approximation',
      subtopics: makeSubs([
        'BODMAS and Order of Operations',
        'Fractions and Decimals',
        'Surds and Indices',
        'Square Root and Cube Root',
        'Approximation',
        'Comparison of Fractions',
        'Algebraic Identities Shortcuts',
        'Chain Fractions and Vinculum',
        'Calculation Tricks (Squares, Cubes, Tables)'
      ])
    },
    {
      id: 'math-3',
      name: '3. Percentage',
      subtopics: makeSubs([
        'Basic Percentage and Fraction Equivalents',
        'Successive Percentage Change',
        'Population Increase and Decrease',
        'Price and Consumption Relation',
        'Income, Expenditure and Saving',
        'Election and Votes (Invalid, Non-voters)',
        'Marks and Pass Percentage',
        'Percentage Change in Area and Volume',
        'Salary Hike, Cut and Tax',
        'Percentage with Ratio and Mixture (T2)',
        'Percentage-based Data Sufficiency (T2)'
      ])
    },
    {
      id: 'math-4',
      name: '4. Ratio & Proportion',
      subtopics: makeSubs([
        'Ratio Basics and Comparison',
        'Proportion (Direct, Inverse)',
        'Mean, Third and Fourth Proportional',
        'Compound and Duplicate Ratio',
        'Componendo-Dividendo',
        'Division of Amount in a Ratio',
        'Change in Ratio on Adding/Removing',
        'Coins and Currency Notes Ratio',
        'Variation (Direct, Inverse, Joint)',
        'Chain Ratio and Three-variable Ratio (T2)'
      ])
    },
    {
      id: 'math-5',
      name: '5. Average',
      subtopics: makeSubs([
        'Simple Average',
        'Weighted Average',
        'Average Speed',
        'Change in Average (Add, Remove, Replace)',
        'Average of Consecutive Numbers',
        'Average Age Problems',
        'Wrong Value Correction',
        'Average of First n Natural, Odd, Even Numbers',
        'Batting and Bowling Average',
        'Combining Averages of Groups'
      ])
    },
    {
      id: 'math-6',
      name: '6. Profit, Loss & Discount',
      subtopics: makeSubs([
        'CP, SP, MP Basics',
        'Profit and Loss Percentage',
        'Discount and Marked Price',
        'Successive Discount',
        'Dishonest Dealer (False Weight)',
        'Buy X Get Y Free',
        'Two Articles at Same SP',
        'Overall Profit/Loss on Mixed Trades',
        'Equivalent Single Discount',
        'Profit on Cost vs Profit on SP',
        'GST, Tax and Commission Problems',
        'Profit-Loss Algebra Setups (T2)'
      ])
    },
    {
      id: 'math-7',
      name: '7. Simple & Compound Interest',
      subtopics: makeSubs([
        'Simple Interest',
        'Compound Interest (Annual)',
        'CI Half-yearly and Quarterly',
        'Difference Between CI and SI (2, 3 Years)',
        'Equal Installments',
        'Sum Becoming n Times',
        'Different Rates for Different Years',
        'Fractional Time CI',
        'Borrow and Lend (Two Rates)',
        'Population Growth CI Formula'
      ])
    },
    {
      id: 'math-8',
      name: '8. Problems on Ages',
      subtopics: makeSubs([
        'Present, Past and Future Age',
        'Ratio-based Ages',
        'Sum and Difference of Ages',
        'Age After n Years Equations',
        'Average Age of a Family',
        'Ages with Multiples (x Times)'
      ])
    },
    {
      id: 'math-9',
      name: '9. Partnership',
      subtopics: makeSubs([
        'Simple Partnership (Capital × Time)',
        'Investment in Ratio',
        'Working and Sleeping Partner',
        'Entry or Exit of Partner During Year',
        'Profit Division with Commission',
        'Compound Partnership'
      ])
    },
    {
      id: 'math-10',
      name: '10. Mixture & Alligation',
      subtopics: makeSubs([
        'Alligation Rule and Cross Method',
        'Mean Price',
        'Mixing Two or More Varieties',
        'Replacement of Liquid (Repeated, Formula)',
        'Milk-Water Mixtures',
        'Quantity Added to Change Concentration',
        'Adulteration',
        'Alloy, Salt-Solution and Evaporation Problems (T2)'
      ])
    },
    {
      id: 'math-11',
      name: '11. Time & Work',
      subtopics: makeSubs([
        'Basic Work (Days, Efficiency)',
        'Efficiency and LCM Method',
        'Combined Work and Leaving Midway',
        'Alternate Day Work',
        'Men-Days-Hours',
        'Work and Wages',
        'Work in Fractions and Percentage',
        'A is x Times Efficient Than B',
        'Negative Work (Breaking, Spoiling)'
      ])
    },
    {
      id: 'math-12',
      name: '12. Pipes & Cisterns',
      subtopics: makeSubs([
        'Inlet and Outlet Pipes',
        'Leakage Problems',
        'Filling and Emptying Together',
        'Pipes Opened Alternately',
        'Partial Tank Filling Time',
        'Pipes of Different Capacity Ratio'
      ])
    },
    {
      id: 'math-13',
      name: '13. Time, Speed & Distance',
      subtopics: makeSubs([
        'Basic Speed, Time, Distance',
        'Unit Conversion (km/h and m/s)',
        'Average Speed',
        'Relative Speed (Same/Opposite Direction)',
        'Meeting and Catching Point',
        'Late/Early Arrival and Speed Change',
        'Ratio of Speed, Time and Distance',
        'Escalator and Moving Walkway',
        'Stoppage Time',
        'Chase and Head-start'
      ])
    },
    {
      id: 'math-14',
      name: '14. Problems on Trains',
      subtopics: makeSubs([
        'Train Crossing Pole and Platform',
        'Two Trains Same/Opposite Direction',
        'Train Crossing Man or Moving Object',
        'Length of Train and Speed',
        'Meeting Trains and Time After Meeting',
        'Bridge and Tunnel Crossing'
      ])
    },
    {
      id: 'math-15',
      name: '15. Boats & Streams',
      subtopics: makeSubs([
        'Upstream and Downstream',
        'Speed of Boat in Still Water',
        'Speed of Stream',
        'Average Speed in Round Trip',
        'Time Ratio Problems',
        'Swimmer and Current Problems'
      ])
    },
    {
      id: 'math-16',
      name: '16. Races & Circular Motion',
      subtopics: makeSubs([
        'Races (Head Start, Dead Heat)',
        'Circular Track (Meeting Point)',
        'Two Runners Same/Opposite Direction',
        'Number of Meeting Points',
        'Beat and Start on a Straight Track',
        'Clock-hand and Relative Angular Motion (T2)'
      ])
    },
    {
      id: 'math-17',
      name: '17. Algebra',
      subtopics: makeSubs([
        'Linear Equations (One, Two, Three Variables)',
        'Quadratic Equation and Nature of Roots',
        'Sum and Product of Roots',
        'Identities (a±b)² and (a±b)³',
        'a³+b³+c³−3abc and Variations',
        'x + 1/x Type Problems',
        'Polynomials (Remainder, Factor Theorem)',
        'Inequalities and Modulus',
        'Algebraic Fractions Simplification',
        'Maxima and Minima, AM ≥ GM (T2)',
        'Graph of Linear Equations and Pair of Lines (T2)',
        'Cubic Equation Roots Relation (T2)'
      ])
    },
    {
      id: 'math-18',
      name: '18. Lines & Angles',
      subtopics: makeSubs([
        'Types of Angles',
        'Complementary and Supplementary Angles',
        'Parallel Lines and Transversal',
        'Vertically Opposite and Co-interior Angles',
        'Angle Bisector and Angle Chasing'
      ])
    },
    {
      id: 'math-19',
      name: '19. Triangles',
      subtopics: makeSubs([
        'Types of Triangles and Angle Sum',
        'Congruence (SSS, SAS, ASA, RHS)',
        'Similarity and Ratio of Areas',
        'Centroid, Incentre, Circumcentre, Orthocentre',
        'Angles at Incentre, Orthocentre, Excentre',
        'Pythagoras Theorem and Triplets',
        'Basic Proportionality (Thales) and Mid-point Theorem',
        'Angle Bisector Theorem',
        'Apollonius Theorem',
        'Inradius and Circumradius Formulas',
        'Excentre, Ex-radii and Nine-point Circle (T2)',
        'Special Triangles: 30-60-90, 45-45-90 (T2)'
      ])
    },
    {
      id: 'math-20',
      name: '20. Quadrilaterals & Polygons',
      subtopics: makeSubs([
        'Parallelogram, Rectangle, Square, Rhombus',
        'Trapezium and Kite',
        'Cyclic Quadrilateral',
        'Properties of Diagonals',
        'Regular Polygons (Interior, Exterior Angles)',
        'Number of Diagonals and Sum of Angles',
        'Area of General Quadrilateral, Brahmagupta (T2)',
        'Polygon Inscribed in a Circle (T2)'
      ])
    },
    {
      id: 'math-21',
      name: '21. Circles',
      subtopics: makeSubs([
        'Chord, Arc and Angle Subtended',
        'Tangent Properties',
        'Direct and Transverse Common Tangents',
        'Secant-Tangent Theorem',
        'Cyclic Quadrilateral in a Circle',
        'Alternate Segment Theorem',
        'Two Circles Touching (Internal, External)',
        'Inscribed and Circumscribed Figures',
        'Length of Common Tangent and Radical Axis Basics (T2)'
      ])
    },
    {
      id: 'math-22',
      name: '22. Coordinate Geometry',
      subtopics: makeSubs([
        'Cartesian Plane and Quadrants',
        'Distance Formula',
        'Section Formula',
        'Midpoint and Centroid',
        'Slope and Equation of a Line (T2)',
        'Area of Triangle by Coordinates (T2)',
        'Equation of Circle and Tangent Basics (T2)'
      ])
    },
    {
      id: 'math-23',
      name: '23. Mensuration 2D',
      subtopics: makeSubs([
        'Triangle (Heron, Equilateral, Right, Isosceles)',
        'Rectangle, Square and Path',
        'Parallelogram, Rhombus and Trapezium',
        'Circle, Sector, Segment and Arc Length',
        'Ring and Semicircle',
        'Regular Polygon Area',
        'Inscribed and Circumscribed Figures',
        'Wheel Rotation and Distance',
        'Cost of Fencing, Painting, Tiling',
        'Combined Figures'
      ])
    },
    {
      id: 'math-24',
      name: '24. Mensuration 3D',
      subtopics: makeSubs([
        'Cube and Cuboid',
        'Cylinder and Hollow Cylinder',
        'Cone and Frustum',
        'Sphere and Hemisphere',
        'Prism and Pyramid',
        'Surface Area vs Volume',
        'Melting and Recasting',
        'Combined Solids',
        'Water Flow Through Pipe',
        'Tetrahedron and Regular Solids (T2)',
        'Largest Sphere or Cone from a Solid (T2)'
      ])
    },
    {
      id: 'math-25',
      name: '25. Trigonometry',
      subtopics: makeSubs([
        'T-ratios and Standard Angle Values',
        'Complementary and Allied Angles',
        'Basic Identities (sin² + cos² = 1)',
        'Identities Simplification and Proof',
        'Value-based Problems (sinθ + cosθ = k)',
        'Maxima and Minima of Trig Expressions',
        'Radian and Degree Measure',
        'Compound Angle Formulas (T2)',
        'Multiple Angle Formulas (T2)',
        'Sine Rule and Cosine Rule (T2)',
        'Basic Trigonometric Equations (T2)'
      ])
    },
    {
      id: 'math-26',
      name: '26. Height & Distance',
      subtopics: makeSubs([
        'Angle of Elevation',
        'Angle of Depression',
        'Building and Tower Problems',
        'Two-observer or Two-position Problems',
        'Shadow-based Questions',
        'Ladder, Kite and Bird Problems',
        'Ship and Lighthouse Problems',
        'Two Towers and Combined Angle Problems (T2)'
      ])
    },
    {
      id: 'math-27',
      name: '27. Data Interpretation',
      subtopics: makeSubs([
        'Table',
        'Bar Graph (Simple, Stacked, Multiple)',
        'Line Graph',
        'Pie Chart (Degree and Percentage)',
        'Mixed Graphs',
        'Caselet',
        'Missing Data',
        'Percentage Change and Ratio-based DI',
        'Radar Chart',
        'Histogram and Frequency Polygon (T2)'
      ])
    },
    {
      id: 'math-28',
      name: '28. Statistics (T2)',
      subtopics: makeSubs([
        'Mean (Direct, Assumed, Step-deviation)',
        'Median and Mode',
        'Empirical Relation (Mode = 3 Median − 2 Mean)',
        'Range and Quartile Deviation',
        'Mean Deviation',
        'Variance and Standard Deviation',
        'Coefficient of Variation',
        'Cumulative Frequency and Ogive',
        'Weighted and Combined Mean',
        'Frequency Distribution Tables'
      ])
    },
    {
      id: 'math-29',
      name: '29. Sequence & Series (T2)',
      subtopics: makeSubs([
        'AP (nth Term, Sum)',
        'GP (nth Term, Sum, Infinite GP)',
        'HP Basics',
        'Sum of n, n² and n³',
        'Arithmetic and Geometric Mean',
        'Insertion of Means'
      ])
    },
    {
      id: 'math-30',
      name: '30. Logarithm (T2)',
      subtopics: makeSubs([
        'Definition and Laws of Log',
        'Log of Product, Quotient, Power',
        'Change of Base',
        'Common Log and Characteristic',
        'Equations Solving with Logs',
        'Log and Indices Mix'
      ])
    },
    {
      id: 'math-31',
      name: '31. Permutation, Combination & Probability (T2)',
      subtopics: makeSubs([
        'Fundamental Principle of Counting',
        'Permutation',
        'Combination',
        'Arrangements with Repetition',
        'Probability Basics (Coin, Dice, Cards)',
        'Conditional and Independent Events',
        'Mutually Exclusive Events and Addition Rule',
        'Odds and Expected Outcomes'
      ])
    }
  ],

  Reasoning: [
    {
      id: 'reas-1',
      name: '1. Analogy',
      subtopics: makeSubs([
        'Word Analogy (Relation Based)',
        'Number Analogy (Operation, Square, Cube, Pair)',
        'Letter and Alphabet Analogy',
        'Alpha-numeric Analogy',
        'Concept, Function and Category Analogy',
        'Gender, Profession, Tool-user Relations',
        'Place-capital, Author-work Relations (GK Based)',
        'Two-pair and Matrix Analogy (T2)'
      ])
    },
    {
      id: 'reas-2',
      name: '2. Classification (Odd One Out)',
      subtopics: makeSubs([
        'Word Odd One Out',
        'Number Odd One Out (Prime, Square, Pattern)',
        'Letter-cluster Odd One Out',
        'Alpha-numeric Odd One Out',
        'Concept-based Classification',
        'Meaning and Category-based Classification'
      ])
    },
    {
      id: 'reas-3',
      name: '3. Series',
      subtopics: makeSubs([
        'Number Series (Difference, Ratio, Squares, Cubes, Primes)',
        'Missing Term',
        'Wrong Number in a Series',
        'Alternate and Two-step Series',
        'Alphabet Series',
        'Alpha-numeric Series',
        'Letter-cluster Series (2 and 3 Letters)',
        'Fibonacci and Mixed Pattern Series',
        'Multi-level Series, Difference of Difference (T2)'
      ])
    },
    {
      id: 'reas-4',
      name: '4. Coding-Decoding',
      subtopics: makeSubs([
        'Letter Shifting (+/-)',
        'Reverse Alphabet Coding',
        'Number Coding',
        'Letter-to-number Coding',
        'Mixed (Letter + Number) Coding',
        'Substitution Coding',
        'Fictitious Language (Sentence Coding)',
        'Matrix Coding',
        'Conditional or Sign Coding',
        'Decoding with Special Rule Set (T2)'
      ])
    },
    {
      id: 'reas-5',
      name: '5. Blood Relations',
      subtopics: makeSubs([
        'Direct Relation',
        'Pointing Statements',
        'Coded Blood Relations',
        'Family Tree',
        'Puzzle-based Relations',
        'Generation-wise Relations',
        'Photo or Picture-based Relations'
      ])
    },
    {
      id: 'reas-6',
      name: '6. Direction & Distance',
      subtopics: makeSubs([
        'Basic Directions',
        'Turns (Left, Right, 45° Turns)',
        'Shortest Distance',
        'Shadow-based Directions',
        'Distance Puzzles',
        'Final Direction of a Person',
        'Diagram-based Directions'
      ])
    },
    {
      id: 'reas-7',
      name: '7. Ranking & Order',
      subtopics: makeSubs([
        'Rank from Top, Bottom, Left, Right',
        'Total Number of Persons',
        'Position Swapping',
        'Comparison-based Ordering',
        'Height, Age and Marks Ordering',
        'Alphabetical Ranking',
        'Dictionary Order and Word Position',
        'Number of Persons Between Two'
      ])
    },
    {
      id: 'reas-8',
      name: '8. Syllogism',
      subtopics: makeSubs([
        'Statements and Conclusions (All, Some, No)',
        'Venn Diagram Method',
        'Possibility Cases (Either-Or)',
        'Only a Few and Some Not',
        'Two-statement and Three-statement Sets',
        'Reverse Syllogism',
        'Conclusions with Conditions'
      ])
    },
    {
      id: 'reas-9',
      name: '9. Venn Diagrams',
      subtopics: makeSubs([
        'Relation Between Classes (Venn Figure)',
        'Counting-based Venn (Numerical)',
        'Overlap Regions',
        'Three-circle Problems',
        'Logical Venn Figures'
      ])
    },
    {
      id: 'reas-10',
      name: '10. Seating Arrangement',
      subtopics: makeSubs([
        'Linear (Single Row, Double Row)',
        'Circular (Inside or Outside Facing)',
        'Rectangular and Square',
        'Parallel Rows',
        'Uncertain or Floating Arrangements',
        'Missing Arrangement',
        'Conditional Arrangement'
      ])
    },
    {
      id: 'reas-11',
      name: '11. Puzzles',
      subtopics: makeSubs([
        'Floor-based Puzzles',
        'Day and Month-based Puzzles',
        'Person-Profession-City Puzzles',
        'Box-based Puzzles',
        'Comparison-based Puzzles',
        'Scheduling and Tournaments',
        'Input-output (Machine) Arrangement',
        'Grouping and Team Formation'
      ])
    },
    {
      id: 'reas-12',
      name: '12. Mathematical Operations',
      subtopics: makeSubs([
        'Symbol Substitution',
        'Interchange of Signs and Numbers',
        'Fictitious Operators',
        'Number-based Operations (a # b = ...)',
        'Equation Balancing',
        'BODMAS with Substitution',
        'Given Operation se Value Nikalna'
      ])
    },
    {
      id: 'reas-13',
      name: '13. Inequality',
      subtopics: makeSubs([
        'Direct Inequality',
        'Coded Inequality',
        'Either-Or Case',
        'Chain Inequality',
        'Conclusion on Relations'
      ])
    },
    {
      id: 'reas-14',
      name: '14. Statement & Conclusion',
      subtopics: makeSubs([
        'Statement-Conclusion',
        'Statement-Assumption',
        'Statement-Argument',
        'Statement-Inference',
        'Cause and Effect',
        'Course of Action',
        'Decision Making',
        'Strengthening and Weakening an Argument (T2)'
      ])
    },
    {
      id: 'reas-15',
      name: '15. Calendar',
      subtopics: makeSubs([
        'Odd Days Concept',
        'Leap Year Rules',
        'Day of a Given Date',
        'Day After or Before n Days',
        'Repeating Calendar Years',
        'Date-to-date Day Gap',
        'Century-wise Day Code',
        'Calendar Puzzles (First, Last Day)'
      ])
    },
    {
      id: 'reas-16',
      name: '16. Clock',
      subtopics: makeSubs([
        'Angle Between Hands',
        'Hands Overlap, Opposite, Right Angle',
        'Time Gain or Loss',
        'Mirror Image of a Clock',
        'Wrong Clock Problems',
        'Number of Times Hands Meet in a Day',
        'Reflected Time'
      ])
    },
    {
      id: 'reas-17',
      name: '17. Alphabet & Word Tests',
      subtopics: makeSubs([
        'Alphabet Position (Forward, Backward)',
        'Letter-word Counting',
        'Meaningful Word Formation',
        'Word Arrangement (Dictionary Order)',
        'Letter Repetition and Pairs',
        'Words Logical Sequence (Stages, Size, Time)',
        'Typing or Letter Shifting in a Word'
      ])
    },
    {
      id: 'reas-18',
      name: '18. Number-Based Tests',
      subtopics: makeSubs([
        'Number Ranking',
        'Number Arrangement',
        'Number Puzzle (Matrix, Triad)',
        'Number Based on Digits',
        'Number-letter Mixed Tests'
      ])
    },
    {
      id: 'reas-19',
      name: '19. Missing Number',
      subtopics: makeSubs([
        'Number in a Matrix',
        'Figure-based Missing Number (Circle, Triangle)',
        'Row and Column Rule',
        'Diagonal Rule',
        'Square and Cube-based Rule',
        'Alphabet Missing in a Figure'
      ])
    },
    {
      id: 'reas-20',
      name: '20. Mirror & Water Image',
      subtopics: makeSubs([
        'Mirror Image of Letters and Numbers',
        'Mirror Image of Figures',
        'Water Image',
        'Mirror Image of Words and Clusters',
        'Lateral Inversion'
      ])
    },
    {
      id: 'reas-21',
      name: '21. Paper Folding & Cutting',
      subtopics: makeSubs([
        'Paper Folding',
        'Paper Cutting and Punching',
        'Unfolding Pattern',
        'Hole Counting',
        'Folding with a Design'
      ])
    },
    {
      id: 'reas-22',
      name: '22. Figure Counting & Embedded Figures',
      subtopics: makeSubs([
        'Triangle Counting',
        'Square and Rectangle Counting',
        'Line Segment Counting',
        'Embedded Figure (Hidden Shape)',
        'Count of Circles, Pentagons',
        'Complex Diagram Counting'
      ])
    },
    {
      id: 'reas-23',
      name: '23. Cubes & Dice',
      subtopics: makeSubs([
        'Dice (Adjacent, Opposite Faces)',
        'Two or Three-position Dice',
        'Cube Cutting (Painted Faces)',
        'Cube Counting',
        'Cube Unfolding',
        'Net Folding'
      ])
    },
    {
      id: 'reas-24',
      name: '24. Figure Series, Analogy & Classification',
      subtopics: makeSubs([
        'Figure Series (Rotation, Shading, Addition)',
        'Figure Analogy',
        'Figure Classification (Odd One Out)',
        'Pattern Completion',
        'Missing Figure',
        'Figure Matrix',
        'Grouping of Identical Figures',
        'Rotation and Reflection'
      ])
    },
    {
      id: 'reas-25',
      name: '25. Construction & Completion of Figures',
      subtopics: makeSubs([
        'Figure Formation from Parts',
        'Figure Completion',
        'Counting Symmetrical Figures',
        'Dot Situation',
        'Joining Pieces of a Shape'
      ])
    },
    {
      id: 'reas-26',
      name: '26. Data Sufficiency (T2)',
      subtopics: makeSubs([
        'Two Statements (I and II) Type',
        'Question with Statements',
        'Quantitative Data Sufficiency',
        'Rank, Direction and Relation Sufficiency'
      ])
    },
    {
      id: 'reas-27',
      name: '27. Eligibility & Decision Making (T2)',
      subtopics: makeSubs([
        'Selection Based on Conditions',
        'Rule-based Eligibility',
        'Multiple-criteria Elimination'
      ])
    }
  ],

  English: [
    {
      id: 'eng-1',
      name: '1. Reading Comprehension',
      subtopics: makeSubs([
        'Factual (Direct) Questions',
        'Inference and Conclusion',
        'Main Idea, Theme and Title',
        'Vocabulary in Context',
        'Tone and Author Attitude',
        'True or False Statements',
        'Literary, Scientific, Social and Economic Passages',
        'Long Passages (500+ Words) (T2)'
      ])
    },
    {
      id: 'eng-2',
      name: '2. Cloze Test',
      subtopics: makeSubs([
        'Grammar-based Blanks',
        'Vocabulary-based Blanks',
        'Connector and Preposition Blanks',
        'Passage Coherence'
      ])
    },
    {
      id: 'eng-3',
      name: '3. Spot the Error',
      subtopics: makeSubs([
        'Error in Tense and Verb Form',
        'Subject-Verb Agreement',
        'Article and Preposition',
        'Pronoun and Adjective Errors',
        'Conjunction and Adverb Errors',
        'Parallel Structure',
        'Word-order Error',
        'No Error Cases'
      ])
    },
    {
      id: 'eng-4',
      name: '4. Sentence Improvement',
      subtopics: makeSubs([
        'Underlined Part Replacement',
        'Idiomatic Expression Correction',
        'Tense and Voice Improvement',
        'Redundancy and Wordiness',
        'Comparison and Parallelism Fixes'
      ])
    },
    {
      id: 'eng-5',
      name: '5. Fill in the Blanks',
      subtopics: makeSubs([
        'Single Blank',
        'Double Blank',
        'Grammar-based Blanks',
        'Vocabulary-based Blanks',
        'Preposition and Phrasal Verb Blanks',
        'Collocations'
      ])
    },
    {
      id: 'eng-6',
      name: '6. Para Jumbles',
      subtopics: makeSubs([
        'PQRS Rearrangement',
        'First or Last Sentence Fixed',
        'Connectors and Pronoun Tracking',
        'Chronological Order',
        'Sentence-pair (1-6 Type)'
      ])
    },
    {
      id: 'eng-7',
      name: '7. Sentence & Paragraph Completion (T2)',
      subtopics: makeSubs([
        'Complete the Sentence',
        'Paragraph Logical Ending',
        'Sentence Insertion in a Paragraph',
        'Coherence and Flow'
      ])
    },
    {
      id: 'eng-8',
      name: '8. Synonyms',
      subtopics: makeSubs([
        'PYQ Common Words',
        'Contextual Synonym',
        'Advanced Words (Tier 2 Level)',
        'Editorial Vocabulary',
        'Root Words (Latin, Greek)'
      ])
    },
    {
      id: 'eng-9',
      name: '9. Antonyms',
      subtopics: makeSubs([
        'PYQ Common Words',
        'Contextual Antonym',
        'Prefix-based Opposites (un-, in-, dis-)',
        'Advanced Words (Tier 2 Level)',
        'Root Words se Antonym'
      ])
    },
    {
      id: 'eng-10',
      name: '10. One Word Substitution',
      subtopics: makeSubs([
        'Persons (-cracy, -phile, -phobe)',
        'Collections and Groups',
        'Medical and Professions',
        'Study of (-ology)',
        'Types of Government',
        'Animal and Bird-related Words'
      ])
    },
    {
      id: 'eng-11',
      name: '11. Idioms & Phrases',
      subtopics: makeSubs([
        'Body-part Idioms',
        'Animal Idioms',
        'Colour Idioms',
        'Food and Everyday Idioms',
        'Proverbs',
        'Foreign (Latin, French) Phrases'
      ])
    },
    {
      id: 'eng-12',
      name: '12. Phrasal Verbs',
      subtopics: makeSubs([
        'Verbs with Up, Down, Off, Out',
        'Put, Take, Get, Turn, Break',
        'Multi-particle Phrasal Verbs (T2)',
        'Meaning and Usage'
      ])
    },
    {
      id: 'eng-13',
      name: '13. Homonyms, Homophones & Paronyms',
      subtopics: makeSubs([
        'Homophones (Sound-alike)',
        'Homonyms (Same Spelling)',
        'Paronyms and Confusable Words',
        'Commonly Confused Words (Affect/Effect, Principal/Principle)'
      ])
    },
    {
      id: 'eng-14',
      name: '14. Spelling Correction',
      subtopics: makeSubs([
        'Misspelt Word Identification',
        'Double-letter Rules',
        'IE/EI Rule',
        'Silent Letters',
        'Commonly Misspelt Words'
      ])
    },
    {
      id: 'eng-15',
      name: '15. Word Formation',
      subtopics: makeSubs([
        'Prefixes',
        'Suffixes',
        'Noun, Verb, Adjective Forms of a Word',
        'Compound Words'
      ])
    },
    {
      id: 'eng-16',
      name: '16. Parts of Speech',
      subtopics: makeSubs([
        'Noun (Types, Number, Gender)',
        'Pronoun (Types, Case)',
        'Adjective (Types, Order)',
        'Verb (Transitive, Intransitive, Auxiliary)',
        'Adverb (Types, Position)',
        'Preposition',
        'Conjunction',
        'Interjection'
      ])
    },
    {
      id: 'eng-17',
      name: '17. Articles & Determiners',
      subtopics: makeSubs([
        'A, An, The Rules',
        'Omission of Articles',
        'Quantifiers (Some, Any, Much, Many, Few, Little)',
        'Demonstratives and Possessives',
        'Distributive Determiners (Each, Every, Either, Neither)'
      ])
    },
    {
      id: 'eng-18',
      name: '18. Tenses',
      subtopics: makeSubs([
        'Simple, Continuous, Perfect, Perfect Continuous',
        'Sequence of Tenses',
        'Tense in Conditional Sentences',
        'Time Expressions (Since, For, Ago)',
        'Special Uses of Present and Past Tense'
      ])
    },
    {
      id: 'eng-19',
      name: '19. Subject-Verb Agreement',
      subtopics: makeSubs([
        'Singular and Plural Subjects',
        'Either-Or, Neither-Nor',
        'Collective Nouns',
        'Subject with With, As Well As',
        'Uncountable and Always-plural Nouns',
        'Titles and Quantities'
      ])
    },
    {
      id: 'eng-20',
      name: '20. Pronouns',
      subtopics: makeSubs([
        'Personal and Reflexive Pronouns',
        'Relative Pronouns (Who, Whom, Which, That)',
        'Pronoun-antecedent Agreement',
        'Case of Pronouns',
        'Indefinite and Reciprocal Pronouns'
      ])
    },
    {
      id: 'eng-21',
      name: '21. Adjectives & Adverbs',
      subtopics: makeSubs([
        'Degrees of Comparison',
        'Order of Adjectives',
        'Comparative and Superlative Errors',
        'Adverb Placement',
        'Enough, Too, So, Such',
        'Later/Latter, Elder/Older Type Pairs'
      ])
    },
    {
      id: 'eng-22',
      name: '22. Prepositions',
      subtopics: makeSubs([
        'Time and Place Prepositions',
        'Dependent Prepositions (Verb + Prep)',
        'Adjective + Preposition',
        'Noun + Preposition',
        'Omission and Extra Prepositions'
      ])
    },
    {
      id: 'eng-23',
      name: '23. Conjunctions & Connectors',
      subtopics: makeSubs([
        'Coordinating Conjunctions',
        'Subordinating Conjunctions',
        'Correlative Pairs (Not Only...But Also)',
        'Linking Words (However, Therefore)',
        'Though/Although, Unless, Lest'
      ])
    },
    {
      id: 'eng-24',
      name: '24. Modals, Conditionals & Non-finites',
      subtopics: makeSubs([
        'Modal Verbs (Can, May, Must, Should, Would)',
        'Conditionals (Type 0, 1, 2, 3)',
        'Infinitive and Gerund',
        'Participles',
        'Subjunctive Mood',
        'Used To, Would, Dare, Need'
      ])
    },
    {
      id: 'eng-25',
      name: '25. Active-Passive Voice',
      subtopics: makeSubs([
        'Voice in All Tenses',
        'Passive with Modals',
        'Imperative Sentences',
        'Interrogative Sentences',
        'Intransitive and Verbs Without Passive',
        'Two-object Sentences'
      ])
    },
    {
      id: 'eng-26',
      name: '26. Direct-Indirect Speech',
      subtopics: makeSubs([
        'Reporting Verbs',
        'Tense Change Rules',
        'Pronoun and Time-place Change',
        'Questions, Commands and Requests',
        'Exclamatory and Optative Sentences',
        'Mixed Sentence Narration'
      ])
    },
    {
      id: 'eng-27',
      name: '27. Sentence Structure & Transformation',
      subtopics: makeSubs([
        'Simple, Compound, Complex Sentences',
        'Phrases and Clauses',
        'Parallelism',
        'Redundancy',
        'Sentence Transformation (Affirmative/Negative)',
        'Word Order and Inversion',
        'Degree Transformation'
      ])
    }
  ],

  GK: [
    {
      id: 'gk-1',
      name: '1. Ancient Indian History',
      subtopics: makeSubs([
        'Prehistoric Ages (Paleolithic to Chalcolithic)',
        'Indus Valley Civilization (Sites, Features)',
        'Vedic Age (Early, Later)',
        'Mahajanapadas and Rise of Magadh',
        'Jainism and Buddhism (Councils)',
        'Mauryan Empire (Ashoka, Arthashastra)',
        'Post-Mauryan (Shunga, Kushan, Satavahana)',
        'Gupta Empire and Golden Age',
        'Sangam Age and South Dynasties',
        'Harsha and Chalukya, Pallava, Chola, Rashtrakuta',
        'Foreign Travellers (Fa-Hien, Hiuen Tsang)',
        'Inscriptions and Coins'
      ])
    },
    {
      id: 'gk-2',
      name: '2. Medieval Indian History',
      subtopics: makeSubs([
        'Rajput, Arab Invasion, Ghaznavi and Ghori',
        'Delhi Sultanate (Five Dynasties, Administration)',
        'Vijayanagara and Bahmani Kingdoms',
        'Bhakti and Sufi Movements',
        'Mughal Empire (Babur to Aurangzeb)',
        'Mughal Administration (Mansabdari, Land Revenue)',
        'Sher Shah Suri',
        'Marathas (Shivaji, Peshwas)',
        'Sikh History and Regional Kingdoms',
        'Medieval Art, Architecture and Literature',
        'Foreign Travellers (Ibn Battuta, Bernier)'
      ])
    },
    {
      id: 'gk-3',
      name: '3. Modern Indian History',
      subtopics: makeSubs([
        'European Arrival (Portuguese, Dutch, French, British)',
        'Plassey, Buxar and British Expansion',
        'Governor-Generals and Viceroys',
        'Revolt of 1857',
        'Socio-religious Reform Movements',
        'INC Establishment, Moderates and Extremists',
        'Partition of Bengal and Swadeshi',
        'Home Rule and Lucknow Pact',
        'Gandhian Era (Champaran, NCM, CDM, Quit India)',
        'Revolutionary Movements and INA',
        'Constitutional Acts (1909, 1919, 1935)',
        'Cabinet Mission and Partition',
        'Peasant, Tribal and Labour Movements',
        'Important Newspapers and Books',
        'Princely States Integration'
      ])
    },
    {
      id: 'gk-4',
      name: '4. World History',
      subtopics: makeSubs([
        'Renaissance and Reformation',
        'American Revolution',
        'French Revolution',
        'Industrial Revolution',
        'Russian Revolution',
        'World War I and II',
        'League of Nations and UN',
        'Cold War and Decolonisation',
        'Fascism and Nazism',
        'Important Treaties'
      ])
    },
    {
      id: 'gk-5',
      name: '5. Art & Culture',
      subtopics: makeSubs([
        'Classical and Folk Dances',
        'Music (Hindustani, Carnatic, Instruments, Gharanas)',
        'Painting Styles (Madhubani, Warli, Mughal, Pahari)',
        'Temple Architecture (Nagara, Dravida, Vesara)',
        'Indo-Islamic Architecture',
        'Stupa and Rock-cut Caves',
        'Festivals and Fairs',
        'UNESCO World Heritage Sites',
        'Handicrafts and Textiles',
        'GI Tags',
        'Classical Languages and Literature',
        'Folk Theatre and Puppetry',
        'Museums and Archaeological Sites',
        'Intangible Heritage (Yoga, Kumbh, Durga Puja)'
      ])
    },
    {
      id: 'gk-6',
      name: '6. Indian Geography',
      subtopics: makeSubs([
        'Physiographic Divisions (Himalaya, Plains, Plateau, Coasts, Islands)',
        'Rivers and Drainage System',
        'Climate and Monsoon',
        'Soils',
        'Natural Vegetation',
        'National Parks, Sanctuaries and Biosphere Reserves',
        'Agriculture and Crops',
        'Minerals and Industries',
        'Transport (Ports, Railways, Highways, Airports)',
        'Population and Census',
        'Dams, Lakes, Passes and Straits',
        'Power Plants and Energy Resources',
        'States, Capitals and Boundaries'
      ])
    },
    {
      id: 'gk-7',
      name: '7. World Geography',
      subtopics: makeSubs([
        'Universe and Solar System',
        'Earth Motions (Rotation, Revolution)',
        'Latitude, Longitude and Time Zones',
        'Interior of the Earth',
        'Rocks and Minerals',
        'Landforms',
        'Atmosphere and Its Layers',
        'Winds and Pressure Belts',
        'Oceanography (Currents, Tides)',
        'Continents and Major Countries',
        'Rivers, Lakes, Mountains, Deserts of the World',
        'Climatic Regions',
        'World Straits, Canals and Boundaries'
      ])
    },
    {
      id: 'gk-8',
      name: '8. Indian Polity',
      subtopics: makeSubs([
        'Constitutional Development (Regulating Act to 1935)',
        'Constituent Assembly and Making of Constitution',
        'Preamble',
        'Fundamental Rights',
        'Directive Principles',
        'Fundamental Duties',
        'Parliament (Lok Sabha, Rajya Sabha, Procedures)',
        'President and Vice President',
        'Prime Minister and Council of Ministers',
        'Governor, CM and State Legislature',
        'Judiciary (Supreme Court, High Courts, PIL)',
        'Constitutional Amendments',
        'Emergency Provisions',
        'Panchayati Raj (73rd) and Municipalities (74th)',
        'Constitutional Bodies (EC, CAG, UPSC, Finance Commission)',
        'Non-constitutional Bodies (NITI Aayog, NHRC)',
        'Schedules, Articles and Parts',
        'Centre-State Relations',
        'Citizenship',
        'Official Language',
        'Elections and Political Parties'
      ])
    },
    {
      id: 'gk-9',
      name: '9. Indian Economy',
      subtopics: makeSubs([
        'Basic Concepts (GDP, GNP, NNP, Per Capita Income)',
        'Planning and Five-Year Plans',
        'NITI Aayog',
        'Banking (RBI, Commercial Banks, NBFC, Payment Banks)',
        'Monetary Policy (CRR, SLR, Repo)',
        'Taxation (Direct, Indirect, GST)',
        'Union Budget (Fiscal Deficit, Revenue Deficit)',
        'Inflation (WPI, CPI)',
        'Poverty and Unemployment',
        'Financial Markets (SEBI, Stock Exchange, Insurance)',
        'International Trade and BoP',
        'IMF, World Bank, WTO, AIIB, BRICS',
        'FDI, FPI and Forex',
        'Agriculture (Green Revolution, MSP)',
        'Industrial Policies',
        'Government Schemes',
        'Digital Payments (UPI)',
        'Sectors of Economy'
      ])
    },
    {
      id: 'gk-10',
      name: '10. Physics',
      subtopics: makeSubs([
        'Units and Measurements',
        'Motion and Newton Laws',
        'Work, Energy and Power',
        'Gravitation',
        'Properties of Matter (Pressure, Density, Viscosity)',
        'Heat and Thermodynamics',
        'Sound',
        'Light (Reflection, Refraction, Lenses, Human Eye)',
        'Electricity (Ohm Law, Circuits)',
        'Magnetism and Electromagnetic Induction',
        'Modern Physics (Atom, Nuclear, Semiconductors)',
        'Scientific Instruments',
        'Inventions and Discoveries',
        'Electromagnetic Waves',
        'Satellites and Space Science (T2)'
      ])
    },
    {
      id: 'gk-11',
      name: '11. Chemistry',
      subtopics: makeSubs([
        'States of Matter',
        'Atomic Structure',
        'Periodic Table',
        'Chemical Bonding',
        'Acids, Bases and Salts (pH)',
        'Metals and Non-metals',
        'Carbon and Its Compounds',
        'Chemical Reactions and Equations',
        'Common Chemicals (Baking Soda, Bleaching Powder, Plaster of Paris)',
        'Alloys and Ores',
        'Polymers, Plastics and Fuels',
        'Environmental Chemistry (Hardness of Water, Pollutants)',
        'Fertilisers',
        'Glass, Cement and Ceramics',
        'Chemistry in Everyday Life (Soaps, Drugs)',
        'Mole Concept and Gas Laws (T2)'
      ])
    },
    {
      id: 'gk-12',
      name: '12. Biology',
      subtopics: makeSubs([
        'Cell (Organelles, Cell Division)',
        'Tissues (Plant and Animal)',
        'Human Body Systems (Digestive, Circulatory, Respiratory, Excretory)',
        'Nervous and Endocrine System',
        'Skeletal, Muscular and Reproductive System',
        'Nutrition (Vitamins, Minerals, Deficiency Diseases)',
        'Diseases (Bacterial, Viral, Fungal, Protozoan, Genetic)',
        'Vaccines and Immunity',
        'Genetics and Evolution',
        'Plant Physiology (Photosynthesis, Respiration, Transpiration)',
        'Plant Hormones',
        'Classification and Biodiversity',
        'Reproduction in Plants and Animals',
        'Biotechnology',
        'Animal Husbandry and Economic Botany'
      ])
    },
    {
      id: 'gk-13',
      name: '13. Environment & Ecology',
      subtopics: makeSubs([
        'Ecosystem and Food Chain',
        'Biodiversity Hotspots',
        'Protected Areas (NP, WLS, Biosphere Reserve)',
        'Conventions (Ramsar, CITES, Montreal, Kyoto, Paris)',
        'Climate Change and Global Warming',
        'Pollution (Air, Water, Soil, Noise)',
        'Renewable Energy',
        'Disaster Management (Flood, Earthquake, Cyclone)',
        'Wildlife and Environment Acts',
        'IUCN Red List and Species',
        'Environmental Movements (Chipko, Silent Valley)'
      ])
    },
    {
      id: 'gk-14',
      name: '14. Static GK',
      subtopics: makeSubs([
        'Important Days and Themes',
        'Books and Authors',
        'First in India and World',
        'Famous Personalities',
        'International Organisations and HQs',
        'Countries, Capitals and Currencies',
        'Defence (Missiles, Exercises, Ranks)',
        'Dams, Ports and Power Plants',
        'Monuments and Important Places',
        'Committees, Commissions and Reports',
        'Indices and Rankings (HDI, GHI)',
        'Abbreviations and Full Forms',
        'Nicknames of Cities and States'
      ])
    },
    {
      id: 'gk-15',
      name: '15. Awards & Honours',
      subtopics: makeSubs([
        'Bharat Ratna and Padma Awards',
        'Nobel Prize',
        'Jnanpith, Sahitya Akademi, Booker, Pulitzer',
        'Sports Awards (Khel Ratna, Arjuna, Dronacharya)',
        'Film Awards (Dadasaheb Phalke, Oscar, National Film)',
        'Peace and Gallantry Awards (Param Vir Chakra, Ashoka Chakra)',
        'Other National and International Awards'
      ])
    },
    {
      id: 'gk-16',
      name: '16. Sports',
      subtopics: makeSubs([
        'Olympics and Paralympics',
        'Asian and Commonwealth Games',
        'Cricket (Records, Trophies, IPL)',
        'Football, Hockey, Tennis, Badminton',
        'Grand Slams and Trophies',
        'Stadiums and Venues',
        'Sports Terminology and Number of Players',
        'Chess, Shooting, Athletics',
        'Indian Sports Federations',
        'Sports Personalities'
      ])
    },
    {
      id: 'gk-17',
      name: '17. Current Affairs',
      subtopics: makeSubs([
        'National and International News',
        'Appointments and Resignations',
        'Summits, Conferences and MoUs',
        'Government Schemes and Policies',
        'Union Budget and Economic Data',
        'Awards and Honours (Last 12 Months)',
        'Sports Events (Last 12 Months)',
        'Science, Space (ISRO) and Defence Tests',
        'Reports and Indices',
        'Obituaries',
        'New Books and Authors',
        'Important Days Themes',
        'Environment and COP Meetings'
      ])
    }
  ],

  Computer: [
    {
      id: 'comp-1',
      name: '1. Computer Basics',
      subtopics: makeSubs([
        'Generations of Computers',
        'Types of Computers',
        'Input and Output Devices',
        'CPU and Its Parts',
        'Memory (RAM, ROM, Cache)',
        'Storage Devices',
        'Units of Memory (Bit to TB)',
        'Booting and Types of Boot'
      ])
    },
    {
      id: 'comp-2',
      name: '2. Software & Operating Systems',
      subtopics: makeSubs([
        'System Software vs Application Software',
        'Operating System Functions',
        'Windows Basics and File Management',
        'Linux and Mobile OS Basics',
        'Utility Software',
        'Programming Languages (Low, High Level)',
        'Compilers and Interpreters'
      ])
    },
    {
      id: 'comp-3',
      name: '3. MS Office',
      subtopics: makeSubs([
        'MS Word (Formatting, Mail Merge, Shortcuts)',
        'MS Excel (Formulas, Functions, Charts)',
        'MS PowerPoint (Slides, Transitions)',
        'Keyboard Shortcuts',
        'File Extensions',
        'Access and Outlook Basics'
      ])
    },
    {
      id: 'comp-4',
      name: '4. Internet & Networking',
      subtopics: makeSubs([
        'Network Types (LAN, WAN, MAN)',
        'Topologies',
        'Protocols (HTTP, FTP, TCP/IP, SMTP)',
        'IP Address and DNS',
        'Browsers and Search Engines',
        'Email (CC, BCC, Attachments)',
        'WWW, URL and Web Terms',
        'Wi-Fi, Bluetooth, Modem, Router'
      ])
    },
    {
      id: 'comp-5',
      name: '5. Cyber Security',
      subtopics: makeSubs([
        'Virus, Worm, Trojan and Malware',
        'Phishing and Spoofing',
        'Firewall, Antivirus and Encryption',
        'Hacking Types',
        'Cyber Laws and IT Act',
        'Safe Online Practices'
      ])
    },
    {
      id: 'comp-6',
      name: '6. Number Systems & Logic',
      subtopics: makeSubs([
        'Binary, Octal, Decimal, Hexadecimal',
        'Number Conversion',
        'ASCII and Unicode',
        'Logic Gates Basics'
      ])
    },
    {
      id: 'comp-7',
      name: '7. Databases',
      subtopics: makeSubs([
        'DBMS Basics',
        'Keys (Primary, Foreign)',
        'Tables, Records and Fields',
        'SQL Basics'
      ])
    },
    {
      id: 'comp-8',
      name: '8. Emerging Tech & Digital India',
      subtopics: makeSubs([
        'Artificial Intelligence and Machine Learning',
        'Cloud Computing',
        'IoT and Blockchain',
        'Digital India Initiatives',
        'E-governance and UPI',
        'Computer Abbreviations and Full Forms'
      ])
    }
  ]
};
