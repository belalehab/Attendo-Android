import fs from 'fs';
let code = fs.readFileSync('src/screens/RosterScreen.tsx', 'utf8');

const importRegex = /import \{ (.*?) \} from 'lucide-react';/g;
code = code.replace(importRegex, (match, p1) => {
    if (!p1.includes('QrCode')) {
        return `import { ${p1}, QrCode } from 'lucide-react';`;
    }
    return match;
});

const archiveButtonRegex = /<button \s*onClick=\{\(\) => handleArchive\(s\.national_id\)\}\s*className="p-2 text-gray-500 hover:text-rose-400 transition-colors"\s*>\s*<Archive size=\{18\} \/>\s*<\/button>/m;
const buttonsReplace = `<div className="flex items-center gap-1">
              <button 
                onClick={async () => {
                  const toastId = toast.loading("Generating QR PDF...");
                  const res = await api.exportStudentCardsPDF(activeWorkspace || "", s.national_id);
                  if (res.success) {
                    toast.success("QR PDF Saved Successfully!", { id: toastId });
                  } else if (res.msg !== 'Cancelled') {
                    toast.error("Failed: " + res.msg, { id: toastId });
                  } else {
                    toast.dismiss(toastId);
                  }
                }}
                className="p-2 text-gray-500 hover:text-teal-400 transition-colors"
                title="Download QR"
              >
                <QrCode size={18} />
              </button>
              <button 
                onClick={() => handleArchive(s.national_id)}
                className="p-2 text-gray-500 hover:text-rose-400 transition-colors"
                title="Archive Student"
              >
                <Archive size={18} />
              </button>
            </div>`;

code = code.replace(archiveButtonRegex, buttonsReplace);

fs.writeFileSync('src/screens/RosterScreen.tsx', code, 'utf8');
console.log("Done RosterScreen");
