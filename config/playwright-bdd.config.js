const path = require('path');

module.exports = {
  // BDD configuration
  importTestFrom: path.join(__dirname, '..', 'features', 'steps', 'fixtures.ts'),
  features: [path.join(__dirname, '..', 'features', '**', '*.feature')],
  steps: [path.join(__dirname, '..', 'features', 'steps', '**', '*.ts')],
  
  // Output test files location
  outputDir: path.join(__dirname, '..', '.features-gen'),
  
  // Enable quotes in step names for better parameter passing
  quotes: 'backtick',
};