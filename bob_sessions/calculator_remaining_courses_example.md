# Calculator RemainingCourses - Mother-Tongue Example

## Twi Input (Original Request)
```
Me pɛ sɛ wɔyɛ Calculator RemainingCourses dwumadie no a ɛgyina hɔ ma adesua ahodoɔ dodoɔ a ɛsɛ sɛ sukuuni bi yɛ de wie ne mfitiaseɛ wɔ Ghana Sukuupɔn mu, denam adesua ahodoɔ a wɔawie no a wɔde toto adesua ahodoɔ a ɛho hia a wɔawie no ho
```

## English Translation (by Watsonx.ai)
"I want to create a Calculator RemainingCourses function that calculates the number of courses a student needs to complete their degree at the University of Ghana, by comparing completed courses against required courses"

## Generated JavaScript Code (by IBM Bob)

```javascript
/**
 * Calculate remaining courses needed for graduation
 * @param {Array} completedCourses - Array of completed course objects with {code, credits, grade}
 * @param {Array} requiredCourses - Array of required course objects with {code, credits, level}
 * @returns {Object} - {remaining, completed, total, remainingCredits, completedCredits, totalCredits, missingCourses}
 */
function calculateRemainingCourses(completedCourses, requiredCourses) {
    // Validate inputs
    if (!Array.isArray(completedCourses) || !Array.isArray(requiredCourses)) {
        showNotification('Invalid input: courses must be arrays', 'error');
        return null;
    }

    // Create a Set of completed course codes for fast lookup
    const completedCodesSet = new Set(
        completedCourses
            .filter(course => {
                // Only count passed courses (D and above)
                const grade = course.grade?.toUpperCase();
                return grade && !['E', 'F'].includes(grade);
            })
            .map(course => course.code?.toUpperCase())
    );

    // Calculate statistics
    let completedCredits = 0;
    let totalCredits = 0;
    let remainingCredits = 0;
    const missingCourses = [];

    // Process each required course
    requiredCourses.forEach(required => {
        const courseCode = required.code?.toUpperCase();
        const credits = parseInt(required.credits) || 0;
        
        totalCredits += credits;

        if (completedCodesSet.has(courseCode)) {
            // Course is completed
            completedCredits += credits;
        } else {
            // Course is missing
            remainingCredits += credits;
            missingCourses.push({
                code: required.code,
                credits: credits,
                level: required.level || 'Unknown'
            });
        }
    });

    const result = {
        remaining: missingCourses.length,
        completed: completedCodesSet.size,
        total: requiredCourses.length,
        remainingCredits: remainingCredits,
        completedCredits: completedCredits,
        totalCredits: totalCredits,
        missingCourses: missingCourses,
        percentageComplete: totalCredits > 0 ? 
            ((completedCredits / totalCredits) * 100).toFixed(2) : 0
    };

    // Show notification with summary
    showNotification(
        `Courses: ${result.completed}/${result.total} completed (${result.percentageComplete}%)`,
        'info'
    );

    return result;
}

/**
 * Display remaining courses in a formatted way
 * @param {Object} remainingData - Result from calculateRemainingCourses
 */
function displayRemainingCourses(remainingData) {
    if (!remainingData) {
        showNotification('No data to display', 'error');
        return;
    }

    console.log('=== DEGREE PROGRESS SUMMARY ===');
    console.log(`Total Courses: ${remainingData.total}`);
    console.log(`Completed: ${remainingData.completed} (${remainingData.percentageComplete}%)`);
    console.log(`Remaining: ${remainingData.remaining}`);
    console.log(`\nTotal Credits: ${remainingData.totalCredits}`);
    console.log(`Completed Credits: ${remainingData.completedCredits}`);
    console.log(`Remaining Credits: ${remainingData.remainingCredits}`);
    
    if (remainingData.missingCourses.length > 0) {
        console.log('\n=== MISSING COURSES ===');
        remainingData.missingCourses.forEach((course, index) => {
            console.log(`${index + 1}. ${course.code} - ${course.credits} credits (Level ${course.level})`);
        });
    }

    return remainingData;
}

// Example usage with UG GPA Calculator data structure
function exampleUsage() {
    // Example: Student's completed courses
    const completedCourses = [
        { code: 'MATH101', credits: 3, grade: 'B+' },
        { code: 'ENGL102', credits: 3, grade: 'A' },
        { code: 'COMP103', credits: 4, grade: 'B' },
        { code: 'PHYS104', credits: 3, grade: 'C+' }
    ];

    // Example: Required courses for degree
    const requiredCourses = [
        { code: 'MATH101', credits: 3, level: 100 },
        { code: 'ENGL102', credits: 3, level: 100 },
        { code: 'COMP103', credits: 4, level: 100 },
        { code: 'PHYS104', credits: 3, level: 100 },
        { code: 'MATH201', credits: 3, level: 200 },
        { code: 'COMP202', credits: 4, level: 200 },
        { code: 'STAT203', credits: 3, level: 200 }
    ];

    const result = calculateRemainingCourses(completedCourses, requiredCourses);
    displayRemainingCourses(result);
}
```

## Twi Explanation (by Watsonx.ai)

```
Dwumadie yi yɛ "calculateRemainingCourses" a ɛboa sukuuni bi hu adesua ahodoɔ dodoɔ a aka a ɛsɛ sɛ ɔyɛ de wie ne mfitiaseɛ.

Sɛnea ɛyɛ adwuma:

1. **Nhwehwɛmu (Validation)**: Ɛhwɛ sɛ adesua ahodoɔ a wɔde aba no yɛ nokware

2. **Adesua a wɔawie no (Completed Courses)**: Ɛkyerɛkyerɛ adesua ahodoɔ a sukuuni no awie a ɔnyaa grade pa (D ne nea ɛboro saa)

3. **Adesua a ɛho hia (Required Courses)**: Ɛde adesua ahodoɔ a ɛho hia no toto adesua a wɔawie no ho

4. **Nkontaabu (Calculations)**:
   - Adesua dodoɔ a aka (remaining courses)
   - Credits dodoɔ a aka (remaining credits)
   - Percentage a wɔawie (completion percentage)

5. **Nsɛm a ɛda adi (Results)**: Ɛkyerɛ:
   - Adesua dodoɔ a wɔawie ne nea aka
   - Credits dodoɔ a wɔawie ne nea aka
   - Adesua ahodoɔ pɔtee a aka a ɛsɛ sɛ wɔyɛ

Dwumadie yi de showNotification di dwuma de kyerɛ nsɛm a ɛho hia, na ɛde localStorage data structure a wɔde di dwuma wɔ UG GPA Calculator no mu.

Sɛ wopɛ sɛ wode di dwuma a, fa adesua ahodoɔ a wɔawie no ne adesua ahodoɔ a ɛho hia no to mu, na ɛbɛkyerɛ wo nea aka no nyinaa.
```

## Integration with UG GPA Calculator

This function integrates seamlessly with the existing UG GPA Calculator codebase:

- Uses the same `showNotification()` function for user feedback
- Follows the same camelCase naming convention
- Compatible with the existing grade system (A, B+, B, C+, C, D+, D, E, F)
- Works with the localStorage data structure
- Can be called from any part of the application

## Usage in the Application

```javascript
// Add to the GPA Calculator's script.js
// Call when user wants to check degree progress
document.getElementById('checkProgressBtn')?.addEventListener('click', () => {
    const completed = courses.filter(c => c.grade && !['E', 'F'].includes(c.grade));
    const required = getRequiredCoursesForProgram(currentProfile.program);
    
    const progress = calculateRemainingCourses(completed, required);
    displayRemainingCourses(progress);
});
```

---

**Generated by Mother-Tongue** 🌍  
*Code in the language you think in*