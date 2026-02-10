// ===========================
// Projects Data Configuration
// ===========================

/*
  HOW TO ADD NEW PROJECTS:
  
  1. Add a new object to the PROJECTS array below
  2. Each project object should have these properties:
     - id: Unique identifier (use lowercase with hyphens)
     - title: Project name
     - description: Short description (2-3 sentences)
     - image: Image filename (place in /images folder)
     - tags: Array of technology tags
     - category: 'power-platform', 'data-science', or 'automation'
     - link: (Optional) External link or project folder path
     - github: (Optional) GitHub repository link
  
  3. Save this file and refresh the page to see your new project!
  
  EXAMPLE:
  {
    id: 'my-new-project',
    title: 'My Awesome Project',
    description: 'This project does amazing things. It uses cutting-edge technology to solve real-world problems.',
    image: 'my-project.jpg',
    tags: ['React', 'Node.js', 'MongoDB'],
    category: 'data-science',
    link: '/projects/my-new-project',
    github: 'https://github.com/yourusername/project'
  }
*/

const PROJECTS = [
  {
    id: 'attendance-tracker',
    title: 'Attendance Tracker Application',
    description: 'Enterprise-grade Power Apps solution for resource management, tracking daily attendance, calculating absenteeism by role/location/manager, with automated data archiving and real-time Power BI reporting.',
    image: 'images/attendance-tracker.jpg',
    tags: ['Power Apps', 'Power Automate', 'Power BI', 'SharePoint'],
    category: 'power-platform',
    link: null, // Add link when available
    featured: true
  },
  {
    id: 'kba-review',
    title: 'KBA Review Application',
    description: 'Knowledge article quality management system with Gen-AI optimization, automated email notifications, dynamic L2 team assignments, and ticketing tool-like workflow management.',
    image: 'images/kba-review.jpg',
    tags: ['Power Apps', 'AI Integration', 'Power Automate', 'Power BI'],
    category: 'power-platform',
    link: null,
    featured: true
  },
  {
    id: 'network-automation',
    title: 'Network Infrastructure Automation',
    description: 'Python automation scripts for identifying switch vulnerabilities, collecting configuration details and error logs via SSH, validating ports, and defining trunk ports and VLAN assignments.',
    image: 'images/network-automation.jpg',
    tags: ['Python', 'Netmiko', 'SSH', 'Network Security'],
    category: 'automation',
    link: null,
    featured: true
  },
  {
    id: 'power-bi-dashboards',
    title: 'Power BI Dashboards for Mondelēz',
    description: 'Designed and deployed comprehensive Power BI dashboards for Mondelēz International\'s EUC and EUC-Tech departments, enabling data-driven insights and improved decision-making across global operations.',
    image: 'images/powerbi-dashboard.jpg',
    tags: ['Power BI', 'Data Analytics', 'DAX', 'Data Visualization'],
    category: 'power-platform',
    link: null
  },
  {
    id: 'machine-learning-project',
    title: 'Machine Learning Analysis',
    description: 'Data science project utilizing Python libraries (Pandas, Scikit-learn, NumPy) for predictive modeling and statistical analysis. Implemented various ML algorithms for data-driven insights.',
    image: 'images/ml-project.jpg',
    tags: ['Python', 'Machine Learning', 'Pandas', 'Scikit-learn'],
    category: 'data-science',
    link: '/projects/ml_project'
  },
  {
    id: 'rpa-workflows',
    title: 'RPA Automation Workflows',
    description: 'Developed multiple Power Automate flows for automating repetitive tasks including data archiving, duplicate removal, email notifications, and cross-system integrations reducing manual effort by 70%.',
    image: 'images/rpa-workflows.jpg',
    tags: ['Power Automate', 'RPA', 'Process Automation', 'Integration'],
    category: 'automation',
    link: null
  },
  {
    id: 'cloud-infrastructure',
    title: 'Cloud Infrastructure Projects',
    description: 'Hands-on experience with AWS (EC2, S3, Lambda, VPC), Azure (Functions, Storage), and GCP services. Implemented cloud-based solutions for scalable and resilient applications.',
    image: 'images/cloud-infra.jpg',
    tags: ['AWS', 'Azure', 'GCP', 'Cloud Architecture'],
    category: 'automation',
    link: null
  }
];

// ===========================
// Project Categories Config
// ===========================

const PROJECT_CATEGORIES = {
  'all': 'All Projects',
  'power-platform': 'Power Platform',
  'data-science': 'Data Science',
  'automation': 'Automation'
};

// ===========================
// Helper Functions
// ===========================

/**
 * Get all projects
 */
function getAllProjects() {
  return PROJECTS;
}

/**
 * Get projects by category
 */
function getProjectsByCategory(category) {
  if (category === 'all') return PROJECTS;
  return PROJECTS.filter(project => project.category === category);
}

/**
 * Get featured projects
 */
function getFeaturedProjects() {
  return PROJECTS.filter(project => project.featured === true);
}

/**
 * Get project by ID
 */
function getProjectById(id) {
  return PROJECTS.find(project => project.id === id);
}

/**
 * Search projects by keyword
 */
function searchProjects(keyword) {
  const lowerKeyword = keyword.toLowerCase();
  return PROJECTS.filter(project => 
    project.title.toLowerCase().includes(lowerKeyword) ||
    project.description.toLowerCase().includes(lowerKeyword) ||
    project.tags.some(tag => tag.toLowerCase().includes(lowerKeyword))
  );
}

// ===========================
// Export for use in main.js
// ===========================

// Make functions available globally
window.ProjectsData = {
  getAllProjects,
  getProjectsByCategory,
  getFeaturedProjects,
  getProjectById,
  searchProjects,
  PROJECTS,
  PROJECT_CATEGORIES
};
