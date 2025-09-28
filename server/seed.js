const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const ProgressItem = require('./models/ProgressItem');

dotenv.config();

const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected for Seeding...');

        // 1. Clear ALL existing data for a clean slate
        await ProgressItem.deleteMany({});
        await User.deleteMany({});
        console.log('Cleared all existing Users and Progress Items.');

        // 2. Define the users you want to create
        const userData = [
            { email: 'alice.johnson@example.com', password: 'password123', role: 'student' },
            { email: 'bob.williams@example.com', password: 'password123', role: 'student' },
            { email: 'charlie.brown@example.com', password: 'password123', role: 'student' },
            { email: 'prof.davis@example.com', password: 'password123', role: 'faculty' }
        ];

        // --- FIX IS HERE ---
        // 3. Create users one by one to ensure password hashing middleware is triggered
        console.log('Creating user accounts...');
        const createdUsers = [];
        for (const user of userData) {
            const newUser = await User.create(user);
            createdUsers.push(newUser);
        }
        console.log(`${createdUsers.length} user accounts created successfully with hashed passwords.`);
        
        // 4. Define the Hierarchical Task Template (no changes here)
        const milestoneTemplate = {
            name: 'Thesis Submission',
            itemType: 'Milestone',
            children: [
                {
                    name: 'Proposal Approval',
                    itemType: 'Stage',
                    children: [
                        { name: 'Write Literature Review', itemType: 'Task' },
                        { name: 'Submit Proposal Draft', itemType: 'Task' },
                    ],
                },
                {
                    name: 'Final Defense',
                    itemType: 'Stage',
                    children: [
                        { name: 'Submit Final Thesis', itemType: 'Task' },
                        { name: 'Prepare Presentation', itemType: 'Task' },
                    ],
                },
            ],
        };

        // 5. Recursive function to create items (no changes here)
        async function createItems(student, itemData, parent = null) {
            const newItem = await ProgressItem.create({
                student: student._id, name: itemData.name, itemType: itemData.itemType,
                parentId: parent ? parent._id : null,
                ancestors: parent ? [...parent.ancestors, parent._id] : [],
            });
            if (itemData.children && itemData.children.length > 0) {
                for (const child of itemData.children) {
                    await createItems(student, child, newItem);
                }
            }
        }
        
        // 6. Loop through each created student and assign tasks (no changes here)
        const students = createdUsers.filter(user => user.role === 'student');
        for (const student of students) {
            console.log(`\nAssigning task hierarchy to ${student.email}...`);
            await createItems(student, milestoneTemplate);
        }

        console.log('\n✅ Data Seeding Completed Successfully for all users!');
        process.exit();

    } catch (error) {
        console.error('❌ Error with data seeding:', error);
        process.exit(1);
    }
};

seedDatabase();


// run the Seed Script
// 1.Stop your backend server (`Ctrl + C`).
// 2. Run the new seed script from your `/server` directory:
    // node seed.js
    

