USE `internsphere_db`;

-- Pre-hashed password for 'password123' using bcrypt (rounds = 10):
-- '$2a$10$L1E.D4d5Edf8p3o7p6c4e.yJ34O9sXn36W.fP/K4a/cZ0n3z0S3s2'

INSERT INTO `users` (`id`, `name`, `email`, `password_hash`, `role`) VALUES
(1, 'Alex Mercer', 'alex@student.com', '$2a$10$L1E.D4d5Edf8p3o7p6c4e.yJ34O9sXn36W.fP/K4a/cZ0n3z0S3s2', 'candidate'),
(2, 'Sarah Connor', 'sarah@student.com', '$2a$10$L1E.D4d5Edf8p3o7p6c4e.yJ34O9sXn36W.fP/K4a/cZ0n3z0S3s2', 'candidate'),
(3, 'TechCorp HR', 'hr@techcorp.com', '$2a$10$L1E.D4d5Edf8p3o7p6c4e.yJ34O9sXn36W.fP/K4a/cZ0n3z0S3s2', 'employer'),
(4, 'DesignStudio Lead', 'lead@designstudio.com', '$2a$10$L1E.D4d5Edf8p3o7p6c4e.yJ34O9sXn36W.fP/K4a/cZ0n3z0S3s2', 'employer');

INSERT INTO `internships` (`id`, `title`, `company`, `description`, `requirements`, `location`, `stipend`, `duration`, `type`, `employer_id`) VALUES
(1, 'Software Engineering Intern', 'TechCorp', 'Join our core platform engineering team working on high-throughput microservices. You will build clean REST APIs and optimize database queries.', 'Knowledge of Node.js, Express, SQL, and Git is preferred.', 'Remote', '$1,200/month', '3 Months', 'remote', 3),
(2, 'Frontend Developer Intern', 'TechCorp', 'Help design and implement responsive, high-performance UI components for our main user-facing dashboard using React.', 'Strong understanding of React, JavaScript, and CSS layouts (Flexbox/Grid).', 'New York, NY', '$1,500/month', '6 Months', 'onsite', 3),
(3, 'UI/UX Design Intern', 'DesignStudio', 'Collaborate with product managers and developers to construct user flows, high-fidelity wireframes, and design components.', 'Proficiency in Figma, user research methodologies, and interactive design.', 'Hybrid (San Francisco, CA)', '$800/month', '3 Months', 'hybrid', 4);

INSERT INTO `applications` (`id`, `internship_id`, `candidate_id`, `resume_url`, `cover_letter`, `status`) VALUES
(1, 1, 1, '/uploads/alex_resume.pdf', 'I am really passionate about back-end development and love writing structured API services. I would love to join TechCorp.', 'Pending'),
(2, 3, 2, '/uploads/sarah_resume.pdf', 'Design is my passion. I want to build interfaces that look premium and work flawlessly.', 'Reviewing');
