import http from 'k6/http';
import { check, sleep } from 'k6';

// Open this test script itself to use as a dummy file upload binary
const dummyFile = open('load-test.js', 'b');

// k6 Load Test Configuration for 1000 Concurrent Virtual Users (VUs)
export const options = {
  stages: [
    { duration: '15s', target: 1000 }, // Ramp-up to 1000 concurrent users over 15s
    { duration: '45s', target: 1000 }, // Stay at 1000 users for 45s (sustained load)
    { duration: '15s', target: 0 },    // Ramp-down to 0 users over 15s
  ],
  thresholds: {
    http_req_failed: ['rate<0.05'],   // Error rate must be less than 5% under heavy stress
    http_req_duration: ['p(95)<1500'], // 95% of requests must complete under 1500ms
  },
};

export default function () {
  const baseUrl = 'http://localhost:8080/api';
  
  // Distribute roles: 90% of VUs are Students, 10% are Instructors
  const isInstructor = (__VU % 10 === 0);

  if (isInstructor) {
    // ==========================================
    // 👨‍🏫 INSTRUCTOR WORKFLOW
    // ==========================================
    const email = 'sharma@edutrack.edu';
    const password = 'prof123';

    // 1. Instructor Login
    const loginPayload = JSON.stringify({ email, password });
    const loginParams = { headers: { 'Content-Type': 'application/json' } };
    const loginRes = http.post(`${baseUrl}/auth/login`, loginPayload, loginParams);
    
    const loginOk = check(loginRes, {
      'instructor login is 200': (r) => r.status === 200,
    });

    if (!loginOk) {
      sleep(1);
      return;
    }

    const token = loginRes.json().token;
    const instructorId = loginRes.json().user.id;
    const authHeaders = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    // Generate a unique suffix for this iteration to satisfy database unique constraints
    const uniqueId = `${__VU}-${Math.floor(Math.random() * 10000000)}`;

    // 2. Instructor Creates a Class/Subject (State Write)
    const createSubjectPayload = JSON.stringify({
      name: `Load Test Class VU ${__VU}`,
      code: `LT-${uniqueId}`,
      description: 'Automatically generated load testing classroom instance',
      batchId: 1
    });

    const createSubjectRes = http.post(`${baseUrl}/subjects?instructorId=${instructorId}`, createSubjectPayload, { headers: authHeaders });
    const subjectCreatedOk = check(createSubjectRes, {
      'subject creation is 200': (r) => r.status === 200,
    });

    if (subjectCreatedOk) {
      const subjectId = createSubjectRes.json().id;

      // 3. Instructor Enrolls a Student manually with a unique email address (URL encoded to handle spaces safely)
      const fullNameParam = encodeURIComponent(`Test Student ${uniqueId}`);
      const emailParam = encodeURIComponent(`lt_student_${uniqueId}@edutrack.edu`);
      
      const enrollRes = http.post(`${baseUrl}/subjects/${subjectId}/students/manual?fullName=${fullNameParam}&email=${emailParam}`, {}, { headers: authHeaders });
      check(enrollRes, {
        'student enrollment is 200': (r) => r.status === 200,
      });

      // 4. Instructor views Submission Roster for Milestone 1
      const rosterRes = http.get(`${baseUrl}/submissions/milestone/1/roster`, { headers: authHeaders });
      const rosterOk = check(rosterRes, {
        'get milestone roster is 200': (r) => r.status === 200,
      });

      if (rosterOk && rosterRes.json().length > 0) {
        // Find a student roster entry that has a submission and grade it
        const submittedEntry = rosterRes.json().find(entry => entry.submissionId !== null);
        if (submittedEntry) {
          const reviewPayload = JSON.stringify({
            status: 'APPROVED',
            qualityRating: 5,
            feedback: 'Excellent work submitted under automated load test!'
          });
          const reviewRes = http.put(`${baseUrl}/submissions/${submittedEntry.submissionId}/review`, reviewPayload, { headers: authHeaders });
          check(reviewRes, {
            'grading review is 200': (r) => r.status === 200,
          });
        }
      }
    }

  } else {
    // ==========================================
    // 👨‍🎓 STUDENT WORKFLOW
    // ==========================================
    const demoEmails = [
      'anurag@edutrack.edu',
      'rahul@edutrack.edu',
      'priya@edutrack.edu'
    ];
    const email = demoEmails[(__VU - 1) % demoEmails.length];
    const password = 'student123';

    // 1. Student Login
    const loginPayload = JSON.stringify({ email, password });
    const loginParams = { headers: { 'Content-Type': 'application/json' } };
    const loginRes = http.post(`${baseUrl}/auth/login`, loginPayload, loginParams);
    
    const loginOk = check(loginRes, {
      'student login is 200': (r) => r.status === 200,
    });

    if (!loginOk) {
      sleep(1);
      return;
    }

    const token = loginRes.json().token;
    const studentId = loginRes.json().user.id;
    const authHeaders = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    // 2. Fetch Enrolled Subjects
    const subjectsRes = http.get(`${baseUrl}/subjects/student/${studentId}`, { headers: authHeaders });
    check(subjectsRes, {
      'student get subjects is 200': (r) => r.status === 200,
    });

    const subjects = subjectsRes.json();
    
    if (subjects && subjects.length > 0) {
      const subjectId = subjects[0].id;

      // 3. Fetch Milestones List
      const milestonesRes = http.get(`${baseUrl}/milestones/subject/${subjectId}`, { headers: authHeaders });
      const milestonesOk = check(milestonesRes, {
        'student get milestones is 200': (r) => r.status === 200,
      });

      // 4. Fetch Submissions List
      const submissionsRes = http.get(`${baseUrl}/submissions/student/${studentId}`, { headers: authHeaders });
      check(submissionsRes, {
        'student get submissions is 200': (r) => r.status === 200,
      });

      if (milestonesOk && milestonesRes.json().length > 0) {
        const milestoneId = milestonesRes.json()[0].id;

        // 5. Submit Work with File Upload (State Write)
        const uploadData = {
          milestoneId: milestoneId.toString(),
          studentId: studentId.toString(),
          file: http.file(dummyFile, 'load_test_file.js', 'text/javascript'),
          submissionLink: 'https://github.com/load-test/project',
          comments: 'Automated file upload stress submission.'
        };
        const uploadDataParams = {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        };

        const uploadRes = http.post(`${baseUrl}/submissions/upload`, uploadData, uploadDataParams);
        check(uploadRes, {
          'submission upload is 200 or 500 (locked)': (r) => r.status === 200 || r.status === 500,
        });
      }

      // 6. View Leaderboard
      const leaderboardRes = http.get(`${baseUrl}/leaderboard/subject/${subjectId}`, { headers: authHeaders });
      check(leaderboardRes, {
        'student view leaderboard is 200': (r) => r.status === 200,
      });

      // 7. View Classmates List
      const classmatesRes = http.get(`${baseUrl}/subjects/${subjectId}/students`, { headers: authHeaders });
      check(classmatesRes, {
        'student view classmates is 200': (r) => r.status === 200,
      });
    }
  }

  // Simulate thinking time gap of 2-3 seconds before repeating the loop
  sleep(Math.random() * 2 + 2);
}
