import 'dotenv/config';
import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import { prisma } from './prisma/prisma.service';
const BASE_URL = 'http://localhost:3000';

async function runTest() {
    console.log('--- Starting AI Interview Upload Test ---');

    // 1. Fetch an existing application ID from the DB to satisfy foreign key constraints
    console.log('Fetching an existing application from DB...');
    const application = await prisma.applications.findFirst();
    
    if (!application) {
        console.error('No applications found in the DB. Please seed the DB first.');
        process.exit(1);
    }
    
    const applicationId = application.id;
    console.log(`Using Application ID: ${applicationId}`);

    // Create a dummy webm file for testing
    const dummyFilePath = path.join(__dirname, 'dummy_test_video.webm');
    fs.writeFileSync(dummyFilePath, 'dummy video content');

    // 2. Prepare FormData
    const form = new FormData();
    form.append('applicationId', applicationId);
    form.append('questions', JSON.stringify(["Tell me about yourself?", "What are your strengths?"]));
    form.append('video', fs.createReadStream(dummyFilePath));

    // 3. Send Request and Measure Time
    console.log('Sending upload request to backend...');
    const startTime = Date.now();
    
    try {
        const response = await axios.post(`${BASE_URL}/ai-interview/submit`, form, {
            headers: {
                ...form.getHeaders()
            }
        });
        
        const endTime = Date.now();
        const duration = endTime - startTime;

        console.log(`Response Status: ${response.status}`);
        console.log(`Response Body:`, response.data);
        console.log(`Response Time: ${duration}ms`);

        // Check assertions
        if (response.data.status === 'PROCESSING') {
            console.log('✅ Status is PROCESSING');
        } else {
            console.error('❌ Status is not PROCESSING');
        }

        if (duration < 2000) {
            console.log('✅ Response time is under 2 seconds');
        } else {
            console.error('❌ Response time exceeded 2 seconds');
        }

        // 4. Verify DB Insert
        console.log('Verifying DB insert...');
        // We might need a small delay since the insert is async, but wait, the insert in our controller is sync (awaited). The trigger to AI is async.
        const interviewRecord = await (prisma as any).interviews.findUnique({
            where: { application_id: applicationId }
        });

        if (interviewRecord && interviewRecord.status === 'Processing') {
            console.log('✅ Interview record created successfully with status Processing');
        } else {
            console.error('❌ Interview record not found or status incorrect');
        }

    } catch (error: any) {
        console.error('Error during upload test:', error.response?.data || error.message);
    } finally {
        // Cleanup
        if (fs.existsSync(dummyFilePath)) {
            fs.unlinkSync(dummyFilePath);
        }
        await prisma.$disconnect();
    }
}

runTest();
