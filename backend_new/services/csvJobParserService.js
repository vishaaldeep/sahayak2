const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const User = require('../Model/User');
const Job = require('../Model/Job');
const Skill = require('../Model/Skill');

class CSVJobParserService {
    constructor() {
        this.csvFilePath = path.join(__dirname, '../../jobs_data.csv');
        this.defaultCoordinates = {
            'Mumbai': [72.8777, 19.0760],
            'Delhi': [77.1025, 28.7041],
            'Bangalore': [77.5946, 12.9716],
            'Chennai': [80.2707, 13.0827],
            'Kolkata': [88.3639, 22.5726],
            'Hyderabad': [78.4867, 17.3850],
            'Pune': [73.8567, 18.5204],
            'Ahmedabad': [72.5714, 23.0225],
            'Jaipur': [75.7873, 26.9124],
            'Lucknow': [80.9462, 26.8467],
            'Kanpur': [80.3319, 26.4499],
            'Nagpur': [79.0882, 21.1458],
            'Indore': [75.8577, 22.7196],
            'Thane': [72.9781, 19.2183],
            'Bhopal': [77.4126, 23.2599],
            'Visakhapatnam': [83.3018, 17.6868],
            'Pimpri-Chinchwad': [73.8567, 18.6298],
            'Patna': [85.1376, 25.5941],
            'Vadodara': [73.1812, 22.3072],
            'Ghaziabad': [77.4538, 28.6692],
            'Ludhiana': [75.8573, 30.9010],
            'Agra': [78.0081, 27.1767],
            'Nashik': [73.7898, 19.9975],
            'Faridabad': [77.3178, 28.4089],
            'Meerut': [77.7064, 28.9845],
            'Rajkot': [70.8022, 22.3039],
            'Kalyan-Dombivali': [73.1645, 19.2403],
            'Vasai-Virar': [72.8397, 19.4912],
            'Varanasi': [82.9739, 25.3176],
            'Srinagar': [74.7973, 34.0837],
            'Aurangabad': [75.3433, 19.8762],
            'Dhanbad': [86.4304, 23.7957],
            'Amritsar': [74.8723, 31.6340],
            'Navi Mumbai': [73.0297, 19.0330],
            'Allahabad': [81.8463, 25.4358],
            'Ranchi': [85.3240, 23.3441],
            'Howrah': [88.2636, 22.5958],
            'Coimbatore': [76.9558, 11.0168],
            'Jabalpur': [79.9864, 23.1815],
            'Gwalior': [78.1828, 26.2124],
            'Vijayawada': [80.6480, 16.5062],
            'Jodhpur': [73.0243, 26.2389],
            'Madurai': [78.1198, 9.9252],
            'Raipur': [81.6296, 21.2514],
            'Kota': [75.8648, 25.2138],
            'Guwahati': [91.7362, 26.1445],
            'Chandigarh': [76.7794, 30.7333],
            'Solapur': [75.9064, 17.6599],
            'Hubli-Dharwad': [75.1240, 15.3647],
            'Bareilly': [79.4304, 28.3670],
            'Moradabad': [78.7733, 28.8386],
            'Mysore': [76.6394, 12.2958],
            'Gurgaon': [77.0266, 28.4595],
            'Aligarh': [78.0880, 27.8974],
            'Jalandhar': [75.5762, 31.3260],
            'Tiruchirappalli': [78.7047, 10.7905],
            'Bhubaneswar': [85.8245, 20.2961],
            'Salem': [78.1460, 11.6643],
            'Mira-Bhayandar': [72.8544, 19.2952],
            'Warangal': [79.5941, 17.9689],
            'Thiruvananthapuram': [76.9366, 8.5241],
            'Guntur': [80.4365, 16.3067],
            'Bhiwandi': [73.0634, 19.3002],
            'Saharanpur': [77.5460, 29.9680],
            'Gorakhpur': [83.3732, 26.7606],
            'Bikaner': [73.3119, 28.0229],
            'Amravati': [77.7749, 20.9374],
            'Noida': [77.3910, 28.5355],
            'Jamshedpur': [86.1844, 22.8046],
            'Bhilai Nagar': [81.3509, 21.1938],
            'Cuttack': [85.8790, 20.4625],
            'Firozabad': [78.3957, 27.1592],
            'Kochi': [76.2673, 9.9312],
            'Bhavnagar': [72.1519, 21.7645],
            'Dehradun': [78.0322, 30.3165],
            'Durgapur': [87.3119, 23.5204],
            'Asansol': [86.9842, 23.6739],
            'Nanded': [77.2663, 19.1383],
            'Kolhapur': [74.2433, 16.7050],
            'Ajmer': [74.6399, 26.4499],
            'Akola': [77.0082, 20.7002],
            'Gulbarga': [76.8343, 17.3297],
            'Jamnagar': [70.0692, 22.4707],
            'Ujjain': [75.7849, 23.1765],
            'Loni': [77.2863, 28.7233],
            'Siliguri': [88.3953, 26.7271],
            'Jhansi': [78.6569, 25.4484],
            'Ulhasnagar': [73.1526, 19.2215],
            'Jammu': [74.8570, 32.7266],
            'Sangli-Miraj & Kupwad': [74.5815, 16.8524],
            'Mangalore': [74.8560, 12.9141],
            'Erode': [77.7172, 11.3410],
            'Belgaum': [74.4977, 15.8497],
            'Ambattur': [80.1548, 13.1143],
            'Tirunelveli': [77.6933, 8.7139],
            'Malegaon': [74.5815, 20.5579],
            'Gaya': [84.9994, 24.7914],
            'Jalgaon': [75.5626, 21.0077],
            'Udaipur': [73.6917, 24.5854],
            'Maheshtala': [88.2482, 22.4986]
        };
    }

    /**
     * Parse CSV file and return job data
     * @returns {Promise<Array>} - Array of parsed job objects
     */
    async parseCSVFile() {
        return new Promise((resolve, reject) => {
            const jobs = [];
            
            if (!fs.existsSync(this.csvFilePath)) {
                reject(new Error('CSV file not found at: ' + this.csvFilePath));
                return;
            }

            fs.createReadStream(this.csvFilePath)
                .pipe(csv())
                .on('data', (row) => {
                    try {
                        const parsedJob = this.parseJobRow(row);
                        if (parsedJob) {
                            jobs.push(parsedJob);
                        }
                    } catch (error) {
                        console.error('Error parsing row:', error, row);
                    }
                })
                .on('end', () => {
                    console.log(`✅ Parsed ${jobs.length} jobs from CSV`);
                    resolve(jobs);
                })
                .on('error', (error) => {
                    console.error('Error reading CSV file:', error);
                    reject(error);
                });
        });
    }

    /**
     * Parse individual job row from CSV
     * @param {Object} row - CSV row object
     * @returns {Object} - Parsed job object
     */
    parseJobRow(row) {
        try {
            // Extract and clean data
            const companyName = this.cleanString(row['Company Name']);
            const jobTitle = this.cleanString(row['Job Title']);
            const jobDescription = this.cleanString(row['Job Description']);
            const location = this.cleanString(row['Location']);
            const experience = this.parseExperience(row['Total Experience']);
            const skills = this.parseSkills(row['Key Skills']);
            const salaryInfo = this.parseSalary(row['Salary']);
            const wageType = this.parseWageType(row['Salary/Wage Type']);
            const jobType = this.parseJobType(row['Nature of Job']);
            const openings = this.parseOpenings(row['Number of Openings']);
            const city = this.extractCity(location);
            const coordinates = this.getCoordinates(city);

            // Skip if essential data is missing
            if (!jobTitle || !companyName || !city) {
                console.warn('Skipping job due to missing essential data:', { jobTitle, companyName, city });
                return null;
            }

            return {
                originalData: row,
                parsedData: {
                    companyName,
                    title: jobTitle,
                    description: jobDescription,
                    location: location,
                    city: city,
                    coordinates: coordinates,
                    experience_required: experience,
                    skills: skills,
                    salary_min: salaryInfo.min,
                    salary_max: salaryInfo.max,
                    wage_type: wageType,
                    job_type: jobType,
                    number_of_openings: openings,
                    qualification: this.cleanString(row['Minimum Qualification']),
                    searchKeyword: this.cleanString(row['Search Keyword'])
                }
            };
        } catch (error) {
            console.error('Error parsing job row:', error);
            return null;
        }
    }

    /**
     * Import selected jobs to database
     * @param {Array} selectedJobs - Array of job indices to import
     * @returns {Promise<Object>} - Import results
     */
    async importJobsToDatabase(selectedJobs = []) {
        try {
            console.log(`🎯 Starting import of ${selectedJobs.length} jobs to database`);
            
            // Parse CSV first
            const allJobs = await this.parseCSVFile();
            
            // Filter selected jobs
            const jobsToImport = selectedJobs.length > 0 
                ? selectedJobs.map(index => allJobs[index]).filter(Boolean)
                : allJobs;

            if (jobsToImport.length === 0) {
                return {
                    success: false,
                    message: 'No jobs selected for import',
                    imported: 0,
                    failed: 0,
                    errors: []
                };
            }

            // Get or create system employer for CSV imports
            const systemEmployer = await this.getOrCreateSystemEmployer();
            
            const results = {
                success: true,
                imported: 0,
                failed: 0,
                errors: [],
                jobs: []
            };

            // Import jobs one by one
            for (let i = 0; i < jobsToImport.length; i++) {
                try {
                    const jobData = jobsToImport[i];
                    const importedJob = await this.importSingleJob(jobData, systemEmployer._id);
                    
                    if (importedJob) {
                        results.imported++;
                        results.jobs.push({
                            title: importedJob.title,
                            company: jobData.parsedData.companyName,
                            id: importedJob._id
                        });
                    } else {
                        results.failed++;
                        results.errors.push(`Failed to import: ${jobData.parsedData.title}`);
                    }
                } catch (error) {
                    results.failed++;
                    results.errors.push(`Error importing ${jobsToImport[i]?.parsedData?.title || 'Unknown'}: ${error.message}`);
                    console.error('Error importing job:', error);
                }
            }

            results.message = `Import completed: ${results.imported} successful, ${results.failed} failed`;
            console.log(`✅ Import completed: ${results.imported} imported, ${results.failed} failed`);
            
            return results;

        } catch (error) {
            console.error('Error in importJobsToDatabase:', error);
            return {
                success: false,
                message: 'Import failed: ' + error.message,
                imported: 0,
                failed: 0,
                errors: [error.message]
            };
        }
    }

    /**
     * Import a single job to database
     * @param {Object} jobData - Parsed job data
     * @param {String} employerId - Employer ID
     * @returns {Promise<Object>} - Created job object
     */
    async importSingleJob(jobData, employerId) {
        try {
            const { parsedData } = jobData;
            
            // Create/find skills
            const skillIds = await this.createOrFindSkills(parsedData.skills);
            
            // Create job object
            const jobObject = {
                employer_id: employerId,
                title: parsedData.title,
                description: parsedData.description,
                responsibilities: parsedData.description, // Use description as responsibilities
                skills_required: skillIds,
                experience_required: parsedData.experience_required,
                assessment_required: false, // Default to false for CSV imports
                number_of_openings: parsedData.number_of_openings,
                job_type: parsedData.job_type,
                duration: 'Not specified',
                wage_type: parsedData.wage_type,
                salary_min: parsedData.salary_min,
                salary_max: parsedData.salary_max,
                negotiable: true, // Default to true for CSV imports
                leaves_allowed: 0,
                openings_hired: 0,
                is_archived: false,
                city: parsedData.city,
                location: {
                    type: 'Point',
                    coordinates: parsedData.coordinates
                },
                // Additional metadata for CSV imports
                csv_import: true,
                csv_company_name: parsedData.companyName,
                csv_qualification: parsedData.qualification,
                csv_search_keyword: parsedData.searchKeyword
            };

            // Create and save job
            const job = new Job(jobObject);
            const savedJob = await job.save();
            
            console.log(`✅ Imported job: ${savedJob.title} at ${parsedData.companyName}`);
            return savedJob;

        } catch (error) {
            console.error('Error importing single job:', error);
            throw error;
        }
    }

    /**
     * Get or create system employer for CSV imports
     * @returns {Promise<Object>} - System employer object
     */
    async getOrCreateSystemEmployer() {
        try {
            // Look for existing system employer
            let systemEmployer = await User.findOne({ 
                email: 'system.csv.imports@sahayak.com',
                role: 'employer'
            });

            if (!systemEmployer) {
                // Create system employer
                systemEmployer = new User({
                    name: 'CSV Import System',
                    email: 'system.csv.imports@sahayak.com',
                    phone_number: '0000000000',
                    role: 'employer',
                    city: 'System',
                    verified: true,
                    password: 'system_password_' + Date.now(), // Random password
                    company_name: 'CSV Import System'
                });

                await systemEmployer.save();
                console.log('✅ Created system employer for CSV imports');
            }

            return systemEmployer;
        } catch (error) {
            console.error('Error getting/creating system employer:', error);
            throw error;
        }
    }

    /**
     * Create or find skills in database
     * @param {Array} skillNames - Array of skill names
     * @returns {Promise<Array>} - Array of skill ObjectIds
     */
    async createOrFindSkills(skillNames) {
        try {
            const skillIds = [];
            
            for (const skillName of skillNames) {
                if (!skillName || skillName.trim() === '') continue;
                
                // Look for existing skill
                let skill = await Skill.findOne({ 
                    name: { $regex: new RegExp('^' + skillName.trim() + '$', 'i') }
                });

                if (!skill) {
                    // Create new skill
                    skill = new Skill({
                        name: skillName.trim(),
                        category: 'General', // Default category
                        description: `Skill imported from CSV: ${skillName}`
                    });
                    await skill.save();
                    console.log(`✅ Created new skill: ${skillName}`);
                }

                skillIds.push(skill._id);
            }

            return skillIds;
        } catch (error) {
            console.error('Error creating/finding skills:', error);
            return [];
        }
    }

    // Helper methods for parsing CSV data

    cleanString(str) {
        if (!str) return '';
        return str.toString().trim().replace(/\r?\n/g, ' ').replace(/\s+/g, ' ');
    }

    parseExperience(expStr) {
        if (!expStr) return 0;
        const match = expStr.toString().match(/(\d+)/);
        return match ? parseInt(match[1]) : 0;
    }

    parseSkills(skillsStr) {
        if (!skillsStr) return [];
        return skillsStr.toString()
            .split(',')
            .map(skill => skill.trim())
            .filter(skill => skill.length > 0)
            .slice(0, 10); // Limit to 10 skills
    }

    parseSalary(salaryStr) {
        if (!salaryStr || salaryStr.toString().toLowerCase().includes('n/a')) {
            return { min: 10000, max: 50000 }; // Default range
        }

        const cleanSalary = salaryStr.toString().replace(/[^\d\-\s]/g, '');
        const match = cleanSalary.match(/(\d+)\s*-\s*(\d+)/);
        
        if (match) {
            return {
                min: parseInt(match[1]),
                max: parseInt(match[2])
            };
        }

        // Single number
        const singleMatch = cleanSalary.match(/(\d+)/);
        if (singleMatch) {
            const amount = parseInt(singleMatch[1]);
            return {
                min: amount,
                max: amount * 1.2 // 20% higher for max
            };
        }

        return { min: 10000, max: 50000 }; // Default
    }

    parseWageType(wageTypeStr) {
        if (!wageTypeStr) return 'monthly';
        
        const wageType = wageTypeStr.toString().toLowerCase();
        if (wageType.includes('daily')) return 'daily';
        if (wageType.includes('weekly')) return 'weekly';
        if (wageType.includes('monthly')) return 'monthly';
        if (wageType.includes('task') || wageType.includes('project')) return 'per_task';
        
        return 'monthly'; // Default
    }

    parseJobType(jobTypeStr) {
        if (!jobTypeStr) return 'full_time';
        
        const jobType = jobTypeStr.toString().toLowerCase();
        if (jobType.includes('part')) return 'part_time';
        if (jobType.includes('contract')) return 'contract';
        if (jobType.includes('gig') || jobType.includes('freelance')) return 'gig';
        
        return 'full_time'; // Default
    }

    parseOpenings(openingsStr) {
        if (!openingsStr) return 1;
        const match = openingsStr.toString().match(/(\d+)/);
        return match ? Math.max(1, parseInt(match[1])) : 1;
    }

    extractCity(locationStr) {
        if (!locationStr) return 'Unknown';
        
        // Try to extract city from location string
        const location = locationStr.toString();
        
        // Look for patterns like "City, State" or "District: City, State: State"
        const cityMatch = location.match(/(?:District:\s*)?([^,]+)(?:,\s*State:|$)/i);
        if (cityMatch) {
            return cityMatch[1].trim();
        }

        // Fallback: take first part before comma
        const parts = location.split(',');
        return parts[0].trim() || 'Unknown';
    }

    getCoordinates(city) {
        if (!city || city === 'Unknown') {
            return [77.1025, 28.7041]; // Default to Delhi
        }

        // Try exact match first
        if (this.defaultCoordinates[city]) {
            return this.defaultCoordinates[city];
        }

        // Try partial match
        const cityLower = city.toLowerCase();
        for (const [knownCity, coords] of Object.entries(this.defaultCoordinates)) {
            if (knownCity.toLowerCase().includes(cityLower) || cityLower.includes(knownCity.toLowerCase())) {
                return coords;
            }
        }

        // Default coordinates (Delhi)
        return [77.1025, 28.7041];
    }

    /**
     * Get CSV statistics
     * @returns {Promise<Object>} - CSV statistics
     */
    async getCSVStatistics() {
        try {
            const jobs = await this.parseCSVFile();
            
            const stats = {
                totalJobs: jobs.length,
                companies: [...new Set(jobs.map(job => job.parsedData.companyName))].length,
                cities: [...new Set(jobs.map(job => job.parsedData.city))].length,
                avgSalaryMin: Math.round(jobs.reduce((sum, job) => sum + job.parsedData.salary_min, 0) / jobs.length),
                avgSalaryMax: Math.round(jobs.reduce((sum, job) => sum + job.parsedData.salary_max, 0) / jobs.length),
                jobTypes: this.getDistribution(jobs, 'job_type'),
                wageTypes: this.getDistribution(jobs, 'wage_type'),
                topCities: this.getTopItems(jobs, 'city', 10),
                topCompanies: this.getTopItems(jobs, 'companyName', 10),
                experienceRange: {
                    min: Math.min(...jobs.map(job => job.parsedData.experience_required)),
                    max: Math.max(...jobs.map(job => job.parsedData.experience_required)),
                    avg: Math.round(jobs.reduce((sum, job) => sum + job.parsedData.experience_required, 0) / jobs.length)
                }
            };

            return stats;
        } catch (error) {
            console.error('Error getting CSV statistics:', error);
            throw error;
        }
    }

    getDistribution(jobs, field) {
        const distribution = {};
        jobs.forEach(job => {
            const value = job.parsedData[field] || 'Unknown';
            distribution[value] = (distribution[value] || 0) + 1;
        });
        return distribution;
    }

    getTopItems(jobs, field, limit = 10) {
        const counts = {};
        jobs.forEach(job => {
            const value = job.parsedData[field] || 'Unknown';
            counts[value] = (counts[value] || 0) + 1;
        });

        return Object.entries(counts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, limit)
            .map(([name, count]) => ({ name, count }));
    }
}

module.exports = new CSVJobParserService();