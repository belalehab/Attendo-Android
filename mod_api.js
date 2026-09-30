import fs from 'fs';
let code = fs.readFileSync('src/screens/RosterScreen.tsx', 'utf8');
code = code.replace(/getApi\(\)\.exportStudentCardsPDF/g, '(await getApi()).exportStudentCardsPDF');
fs.writeFileSync('src/screens/RosterScreen.tsx', code, 'utf8');
console.log("Done");
