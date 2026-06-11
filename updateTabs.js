import * as fs from 'fs';

const filePath = './src/components/TeacherDashboard.tsx';
let txt = fs.readFileSync(filePath, 'utf-8');

txt = txt.replace(/{activeTab === 'students' && \(/g, "{(academy?.subscriptionStatus === 'active' || activeTab === 'billing') && activeTab === 'students' && (");
txt = txt.replace(/{activeTab === 'batches' && \(/g, "{(academy?.subscriptionStatus === 'active' || activeTab === 'billing') && activeTab === 'batches' && (");
txt = txt.replace(/{activeTab === 'attendance' && \(/g, "{(academy?.subscriptionStatus === 'active' || activeTab === 'billing') && activeTab === 'attendance' && (");
txt = txt.replace(/{activeTab === 'fees' && \(/g, "{(academy?.subscriptionStatus === 'active' || activeTab === 'billing') && activeTab === 'fees' && (");
txt = txt.replace(/{activeTab === 'notices' && \(/g, "{(academy?.subscriptionStatus === 'active' || activeTab === 'billing') && activeTab === 'notices' && (");
txt = txt.replace(/{activeTab === 'schedule' && \(/g, "{(academy?.subscriptionStatus === 'active' || activeTab === 'billing') && activeTab === 'schedule' && (");
txt = txt.replace(/{activeTab === 'portfolio' && \(/g, "{(academy?.subscriptionStatus === 'active' || activeTab === 'billing') && activeTab === 'portfolio' && (");
txt = txt.replace(/{activeTab === 'chat' && \(/g, "{(academy?.subscriptionStatus === 'active' || activeTab === 'billing') && activeTab === 'chat' && (");
txt = txt.replace(/{\(activeTab === 'extra-module' \|\| activeTab === 'homeworks'\) && academy && \(/g, "{(academy?.subscriptionStatus === 'active' || activeTab === 'billing') && (activeTab === 'extra-module' || activeTab === 'homeworks') && academy && (");
txt = txt.replace(/{activeTab === 'public-profile' && academy && \(/g, "{(academy?.subscriptionStatus === 'active' || activeTab === 'billing') && activeTab === 'public-profile' && academy && (");
txt = txt.replace(/{activeTab === 'teachers' && academy && \(/g, "{(academy?.subscriptionStatus === 'active' || activeTab === 'billing') && activeTab === 'teachers' && academy && (");
txt = txt.replace(/{activeTab === 'subjects' && academy && \(/g, "{(academy?.subscriptionStatus === 'active' || activeTab === 'billing') && activeTab === 'subjects' && academy && (");
txt = txt.replace(/{activeTab === 'tests' && academy && \(/g, "{(academy?.subscriptionStatus === 'active' || activeTab === 'billing') && activeTab === 'tests' && academy && (");
txt = txt.replace(/{activeTab === 'settings' && academy && \(/g, "{(academy?.subscriptionStatus === 'active' || activeTab === 'billing') && activeTab === 'settings' && academy && (");


fs.writeFileSync(filePath, txt, 'utf-8');
console.log('Done!');
