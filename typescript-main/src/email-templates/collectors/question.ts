import inquirer from 'inquirer';

/**
 * Collect general question information from user
 */
export async function collectQuestionData(): Promise<any> {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'title',
      message: 'Question summary:',
      validate: (input: string) => input.length > 0 || 'Question summary is required'
    },
    {
      type: 'input',
      name: 'description',
      message: 'Detailed question:',
      validate: (input: string) => input.length > 10 || 'Please provide a detailed question (min 10 characters)'
    },
    {
      type: 'input',
      name: 'tried',
      message: 'What have you tried so far? (optional):'
    },
    {
      type: 'input',
      name: 'expected',
      message: 'What outcome are you looking for? (optional):'
    }
  ]);
  
  return answers;
}