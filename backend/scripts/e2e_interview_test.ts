import 'dotenv/config';
import { prisma } from '../prisma/prisma.service';
import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';
import bcrypt from 'bcrypt';

const PORT = process.env.PORT || 3000;
const BASE_URL = `http://localhost:${PORT}`;

async function runE2ETest() {
    console.log('--- BẮT ĐẦU TEST E2E AI INTERVIEW ---');
    
    let hrUser, candUser, company, hrProfile, job, application;
    const videoFileName = 'test_video.webm';

    try {
        // ---------------------------------------------------------
        // 1. Chuẩn bị Dữ liệu (Setup)
        // ---------------------------------------------------------
        console.log('\n1. Đang chuẩn bị dữ liệu giả lập (Setup)...');
        
        const timestamp = Date.now();
        const hrEmail = `e2e_hr_${timestamp}@test.com`;
        const candEmail = `e2e_cand_${timestamp}@test.com`;
        const password = 'Password123!';
        const passwordHash = await bcrypt.hash(password, 10);
        
        hrUser = await prisma.users.create({
            data: { full_name: 'E2E HR User', email: hrEmail, password_hash: passwordHash, role: 'HR' }
        });

        candUser = await prisma.users.create({
            data: { full_name: 'E2E Candidate', email: candEmail, password_hash: passwordHash, role: 'User' }
        });

        company = await prisma.companies.create({
            data: { name: 'E2E Test Company' }
        });

        hrProfile = await prisma.hr_profiles.create({
            data: { user_id: hrUser.id, company_id: company.id }
        });

        const candidate = await prisma.candidates.create({
            data: { user_id: candUser.id }
        });

        job = await prisma.jobs.create({
            data: {
                company_id: company.id,
                hr_id: hrProfile.id,
                title: 'E2E Automation QA',
                description: 'Test job for E2E'
            }
        });

        application = await prisma.applications.create({
            data: {
                job_id: job.id,
                candidate_id: candidate.id,
                cv_url: 'http://example.com/cv.pdf'
            }
        });

        console.log(`=> Đã tạo Application ID: ${application.id}`);

        // Download Sample Video
        console.log(`\n2. Đang tải video mẫu về file ${videoFileName}...`);
        const videoUrl = 'https://upload.wikimedia.org/wikipedia/commons/transcoded/2/22/Volcano_Lava_Sample.webm/Volcano_Lava_Sample.webm.360p.webm';
        
        const response = await axios({ 
            method: 'GET', 
            url: videoUrl, 
            responseType: 'stream',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });
        const writer = fs.createWriteStream(videoFileName);
        response.data.pipe(writer);
        await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });
        console.log('=> Tải video thành công.');

        // ---------------------------------------------------------
        // 2. Chạy Test E2E (Execution)
        // ---------------------------------------------------------
        console.log('\n3. Đăng nhập với HR để lấy Token...');
        const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
            email: hrEmail,
            password: password
        });
        const hrToken = loginRes.data.data.token;
        console.log('=> Đăng nhập HR thành công.');

        console.log('\n4. Gửi request Upload Video (POST /ai-interview/submit)...');
        const formData = new FormData();
        formData.append('applicationId', application.id);
        formData.append('video', fs.createReadStream(videoFileName));

        const uploadRes = await axios.post(`${BASE_URL}/ai-interview/submit`, formData, {
            headers: formData.getHeaders()
        });
        console.log(`=> Upload thành công, phản hồi trạng thái: ${uploadRes.data.status}`);

        console.log('\n5. Đang chờ AI phân tích (Polling mỗi 5 giây)...');
        let aiStatus = 'Processing';
        let resultData = null;

        while (true) {
            try {
                const resultRes = await axios.get(`${BASE_URL}/ai-interview/result/${application.id}`, {
                    headers: { 'Authorization': `Bearer ${hrToken}` }
                });
                
                aiStatus = resultRes.data.data.status;
                
                if (aiStatus === 'Processing' || aiStatus === 'Pending') {
                    console.log(`=> [${new Date().toLocaleTimeString()}] Trạng thái: ${aiStatus} - Đang chờ AI phân tích...`);
                    await new Promise(res => setTimeout(res, 5000));
                } else if (aiStatus === 'Analyzed' || aiStatus === 'DONE') {
                    console.log(`=> [${new Date().toLocaleTimeString()}] Phân tích hoàn tất!`);
                    resultData = resultRes.data.data;
                    break;
                } else if (aiStatus === 'Failed' || aiStatus === 'FAILED') {
                    console.error(`=> [${new Date().toLocaleTimeString()}] Phân tích thất bại!`);
                    break;
                } else {
                    console.log(`=> Trạng thái không xác định: ${aiStatus}`);
                    await new Promise(res => setTimeout(res, 5000));
                }

            } catch (err: any) {
                if (err.response && err.response.status === 404) {
                    console.log(`=> [${new Date().toLocaleTimeString()}] AI chưa lưu kết quả (404), đang thử lại...`);
                    await new Promise(res => setTimeout(res, 5000));
                } else {
                    throw err;
                }
            }
        }

        if (resultData) {
            console.log('\n--- KẾT QUẢ PHÂN TÍCH ---');
            console.log(`Trạng thái: ${resultData.status}`);
            console.log(`Điểm tổng (Interview): ${resultData.interview_score ?? 'N/A'}`);
            console.log(`Thái độ (Attitude): ${resultData.attitude_score ?? 'N/A'}`);
            console.log(`Giao tiếp (Communication): ${resultData.communication_score ?? 'N/A'}`);
            console.log(`Nhận xét môi trường: ${resultData.environment_note ?? 'Không có'}`);
            console.log('-------------------------\n');
        }

    } catch (error: any) {
        console.error('\n[LỖI TRONG QUÁ TRÌNH TEST]:', error.response?.data || error.message);
    } finally {
        // ---------------------------------------------------------
        // 3. Cleanup (Teardown)
        // ---------------------------------------------------------
        console.log('\n6. Dọn dẹp môi trường (Teardown)...');
        
        if (fs.existsSync(videoFileName)) {
            fs.unlinkSync(videoFileName);
            console.log('=> Đã xóa file video tạm.');
        }

        if (application) {
            await prisma.applications.deleteMany({ where: { id: application.id } }).catch(()=>null);
        }
        if (job) {
            await prisma.jobs.deleteMany({ where: { id: job.id } }).catch(()=>null);
        }
        if (hrUser) {
            await prisma.users.deleteMany({ where: { id: hrUser.id } }).catch(()=>null);
        }
        if (candUser) {
            await prisma.users.deleteMany({ where: { id: candUser.id } }).catch(()=>null);
        }
        if (company) {
            await prisma.companies.deleteMany({ where: { id: company.id } }).catch(()=>null);
        }

        console.log('=> Đã xóa các bản ghi giả lập trong Database.');
        await prisma.$disconnect();
        console.log('--- TEST E2E KẾT THÚC ---');
    }
}

runE2ETest();
