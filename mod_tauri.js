import fs from 'fs';
let code = fs.readFileSync('src/tauriApi.ts', 'utf8');

const targetStr = `exportStudentCardsPDF: async (workspace: string) => {`;
const replaceStr = `exportStudentCardsPDF: async (workspace: string, specificId?: string) => {`;
code = code.replace(targetStr, replaceStr);

const pathRegex = /defaultPath: \`Grade_\$\{workspace\}_QR_Cards\.pdf\`/g;
code = code.replace(pathRegex, "defaultPath: specificId ? `${specificId}_QR.pdf` : `Grade_${workspace}_QR_Cards.pdf`");

const sqlRegex = /const data: any\[\] = await db\.select\("SELECT \* FROM students WHERE grade = \$1 AND is_deleted = 0 ORDER BY name ASC", \[workspace\]\);/g;
const sqlReplace = `let data: any[] = [];
        if (specificId) {
            data = await db.select("SELECT * FROM students WHERE grade = $1 AND national_id = $2 AND is_deleted = 0", [workspace, specificId]);
        } else {
            data = await db.select("SELECT * FROM students WHERE grade = $1 AND is_deleted = 0 ORDER BY name ASC", [workspace]);
        }`;
code = code.replace(sqlRegex, sqlReplace);

fs.writeFileSync('src/tauriApi.ts', code, 'utf8');
console.log("Done tauriApi");
