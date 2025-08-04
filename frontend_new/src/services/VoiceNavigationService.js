/**
 * Voice Navigation Service for Sahayak Platform
 * Handles voice commands for navigation and app interactions
 */

class VoiceNavigationService {
  constructor(navigate, retellClient) {
    this.navigate = navigate;
    this.retellClient = retellClient;
    this.isListening = false;
    this.currentUser = null;
    
    // Voice command patterns and their corresponding intents
    this.voiceCommands = {
      // Navigation Commands
      navigation: {
        'go to jobs': 'navigate_jobs',
        'open jobs': 'navigate_jobs',
        'show me jobs': 'navigate_jobs',
        'find jobs': 'navigate_jobs',
        'job search': 'navigate_jobs',
        
        'go to profile': 'navigate_profile',
        'open my profile': 'navigate_profile',
        'show profile': 'navigate_profile',
        'edit profile': 'navigate_profile',
        
        'open wallet': 'navigate_wallet',
        'go to wallet': 'navigate_wallet',
        'show my wallet': 'navigate_wallet',
        'check balance': 'navigate_wallet',
        'my money': 'navigate_wallet',
        
        'go to skills': 'navigate_skills',
        'open skills': 'navigate_skills',
        'show my skills': 'navigate_skills',
        'skill assessment': 'navigate_skills',
        
        'go home': 'navigate_home',
        'go to dashboard': 'navigate_home',
        'take me home': 'navigate_home',
        'main page': 'navigate_home',
        
        'go to applications': 'navigate_applications',
        'show applications': 'navigate_applications',
        'my applications': 'navigate_applications',
        'application status': 'navigate_applications',
        
        'go to settings': 'navigate_settings',
        'open settings': 'navigate_settings',
        'app settings': 'navigate_settings',
      },
      
      // Action Commands
      actions: {
        'log me out': 'action_logout',
        'sign out': 'action_logout',
        'logout': 'action_logout',
        'exit': 'action_logout',
        
        'search for jobs': 'action_search_jobs',
        'find work': 'action_search_jobs',
        'look for jobs': 'action_search_jobs',
        
        'apply for job': 'action_apply_job',
        'submit application': 'action_apply_job',
        
        'check notifications': 'action_notifications',
        'show notifications': 'action_notifications',
        'any updates': 'action_notifications',
        
        'refresh page': 'action_refresh',
        'reload': 'action_refresh',
        'update page': 'action_refresh',
        
        'go back': 'action_go_back',
        'previous page': 'action_go_back',
        'back': 'action_go_back',
      },
      
      // Information Commands
      information: {
        'read this page': 'info_read_page',
        'what is on this page': 'info_read_page',
        'describe page': 'info_read_page',
        
        'show my balance': 'info_wallet_balance',
        'how much money do i have': 'info_wallet_balance',
        'wallet balance': 'info_wallet_balance',
        
        'how many jobs': 'info_job_count',
        'available jobs': 'info_job_count',
        'job listings': 'info_job_count',
        
        'my skill score': 'info_skill_score',
        'skill rating': 'info_skill_score',
        'assessment results': 'info_skill_score',
        
        'application status': 'info_application_status',
        'job applications': 'info_application_status',
        'where are my applications': 'info_application_status',
      },
      
      // Help Commands
      help: {
        'help': 'help_general',
        'what can you do': 'help_general',
        'voice commands': 'help_general',
        'how to use': 'help_general',
        'help me': 'help_general',
        
        'help with jobs': 'help_jobs',
        'how to find jobs': 'help_jobs',
        'job search help': 'help_jobs',
        
        'help with profile': 'help_profile',
        'how to update profile': 'help_profile',
        'profile help': 'help_profile',
      }
    };
    
    // Initialize voice recognition
    this.initializeVoiceRecognition();
  }
  
  /**
   * Initialize voice recognition with Retell
   */
  initializeVoiceRecognition() {
    if (this.retellClient) {
      // Listen for transcripts from Retell
      this.retellClient.on('transcript', (transcript) => {
        this.handleVoiceInput(transcript.text);
      });
      
      // Listen for conversation events
      this.retellClient.on('conversationStarted', () => {
        this.isListening = true;
        this.speak('Voice assistant activated. How can I help you navigate the app?');
      });
      
      this.retellClient.on('conversationEnded', () => {
        this.isListening = false;
      });
      
      // Listen for errors
      this.retellClient.on('error', (error) => {
        console.error('Voice recognition error:', error);
        this.speak('Sorry, I had trouble understanding that. Please try again.');
      });
    }
  }
  
  /**
   * Process voice input and determine intent
   */
  handleVoiceInput(transcript) {
    if (!transcript || !this.isListening) return;
    
    const normalizedInput = transcript.toLowerCase().trim();
    console.log('Voice input received:', normalizedInput);
    
    // Find matching intent
    const intent = this.findIntent(normalizedInput);
    
    if (intent) {
      console.log('Intent detected:', intent);
      this.executeIntent(intent, normalizedInput);
    } else {
      // Fallback for unrecognized commands
      this.handleUnrecognizedCommand(normalizedInput);
    }
  }
  
  /**
   * Find intent from voice input
   */
  findIntent(input) {
    // Check all command categories
    for (const category of Object.values(this.voiceCommands)) {
      for (const [phrase, intent] of Object.entries(category)) {
        if (this.matchesPhrase(input, phrase)) {
          return intent;
        }
      }
    }
    return null;
  }
  
  /**
   * Check if input matches a command phrase
   */
  matchesPhrase(input, phrase) {
    // Exact match
    if (input === phrase) return true;
    
    // Contains all words from phrase
    const phraseWords = phrase.split(' ');
    const inputWords = input.split(' ');
    
    return phraseWords.every(word => 
      inputWords.some(inputWord => 
        inputWord.includes(word) || word.includes(inputWord)
      )
    );
  }
  
  /**
   * Execute the determined intent
   */
  async executeIntent(intent, originalInput) {
    try {
      switch (intent) {
        // Navigation Intents
        case 'navigate_jobs':
          this.navigateToJobs();
          break;
        case 'navigate_profile':
          this.navigateToProfile();
          break;
        case 'navigate_wallet':
          this.navigateToWallet();
          break;
        case 'navigate_skills':
          this.navigateToSkills();
          break;
        case 'navigate_home':
          this.navigateToHome();
          break;
        case 'navigate_applications':
          this.navigateToApplications();
          break;
        case 'navigate_settings':
          this.navigateToSettings();
          break;
          
        // Action Intents
        case 'action_logout':
          this.performLogout();
          break;
        case 'action_search_jobs':
          this.performJobSearch();
          break;
        case 'action_apply_job':
          this.performJobApplication();
          break;
        case 'action_notifications':
          this.showNotifications();
          break;
        case 'action_refresh':
          this.refreshPage();
          break;
        case 'action_go_back':
          this.goBack();
          break;
          
        // Information Intents
        case 'info_read_page':
          this.readCurrentPage();
          break;
        case 'info_wallet_balance':
          await this.readWalletBalance();
          break;
        case 'info_job_count':
          await this.readJobCount();
          break;
        case 'info_skill_score':
          await this.readSkillScore();
          break;
        case 'info_application_status':
          await this.readApplicationStatus();
          break;
          
        // Help Intents
        case 'help_general':
          this.provideGeneralHelp();
          break;
        case 'help_jobs':
          this.provideJobsHelp();
          break;
        case 'help_profile':
          this.provideProfileHelp();
          break;
          
        default:
          this.handleUnrecognizedCommand(originalInput);
      }
    } catch (error) {
      console.error('Error executing intent:', error);
      this.speak('Sorry, I encountered an error while processing your request.');
    }
  }
  
  // Navigation Methods
  navigateToJobs() {
    this.navigate('/jobs');
    this.speak('Navigating to jobs page. Here you can search and apply for jobs.');
  }
  
  navigateToProfile() {
    this.navigate('/profile');
    this.speak('Opening your profile. You can update your information here.');
  }
  
  navigateToWallet() {
    this.navigate('/wallet');
    this.speak('Opening your wallet. You can check your balance and transactions here.');
  }
  
  navigateToSkills() {
    this.navigate('/skills');
    this.speak('Opening skills page. You can take assessments and view your skill ratings here.');
  }
  
  navigateToHome() {
    this.navigate('/');
    this.speak('Taking you to the home page.');
  }
  
  navigateToApplications() {
    this.navigate('/applications');
    this.speak('Showing your job applications and their status.');
  }
  
  navigateToSettings() {
    this.navigate('/settings');
    this.speak('Opening app settings.');
  }
  
  // Action Methods
  performLogout() {
    this.speak('Logging you out. Goodbye!');
    setTimeout(() => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      this.navigate('/login');
    }, 2000);
  }
  
  performJobSearch() {
    this.navigate('/jobs');
    this.speak('Let me help you search for jobs. What type of work are you looking for?');
    // Could trigger job search modal or focus search input
  }
  
  performJobApplication() {
    this.speak('To apply for a job, please navigate to the jobs page and select a job you are interested in.');
  }
  
  showNotifications() {
    // Trigger notifications panel
    const notificationButton = document.querySelector('[data-notifications]');
    if (notificationButton) {
      notificationButton.click();
      this.speak('Showing your notifications.');
    } else {
      this.speak('No notifications panel found on this page.');
    }
  }
  
  refreshPage() {
    this.speak('Refreshing the page.');
    window.location.reload();
  }
  
  goBack() {
    this.speak('Going back to the previous page.');
    window.history.back();
  }
  
  // Information Methods
  readCurrentPage() {
    const pageTitle = document.title;
    const mainContent = this.extractPageContent();
    
    this.speak(`You are on the ${pageTitle} page. ${mainContent}`);
  }
  
  async readWalletBalance() {
    try {
      // Fetch wallet balance from API
      const response = await fetch('/api/wallet/balance', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        this.speak(`Your current wallet balance is ${data.balance} rupees.`);
      } else {
        this.speak('Unable to fetch your wallet balance at the moment.');
      }
    } catch (error) {
      this.speak('Error retrieving wallet balance.');
    }
  }
  
  async readJobCount() {
    try {
      const response = await fetch('/api/jobs', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const count = Array.isArray(data) ? data.length : data.total || 0;
        this.speak(`There are ${count} jobs available for you.`);
      } else {
        this.speak('Unable to fetch job count at the moment.');
      }
    } catch (error) {
      this.speak('Error retrieving job information.');
    }
  }
  
  async readSkillScore() {
    try {
      const response = await fetch('/api/user-skills', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.length > 0) {
          const avgScore = data.reduce((sum, skill) => sum + skill.score, 0) / data.length;
          this.speak(`Your average skill score is ${Math.round(avgScore)} percent.`);
        } else {
          this.speak('You have not taken any skill assessments yet.');
        }
      } else {
        this.speak('Unable to fetch your skill scores at the moment.');
      }
    } catch (error) {
      this.speak('Error retrieving skill information.');
    }
  }
  
  async readApplicationStatus() {
    try {
      const response = await fetch('/api/applications', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.length > 0) {
          const pending = data.filter(app => app.status === 'applied').length;
          const accepted = data.filter(app => app.status === 'hired').length;
          this.speak(`You have ${data.length} total applications. ${pending} are pending and ${accepted} have been accepted.`);
        } else {
          this.speak('You have not submitted any job applications yet.');
        }
      } else {
        this.speak('Unable to fetch your application status at the moment.');
      }
    } catch (error) {
      this.speak('Error retrieving application information.');
    }
  }
  
  // Help Methods
  provideGeneralHelp() {
    const helpText = `I can help you navigate the app with voice commands. You can say things like:
    "Go to jobs" to see available jobs,
    "Open my wallet" to check your balance,
    "Show my profile" to edit your information,
    "Log me out" to sign out,
    or "Help with jobs" for specific job-related commands.`;
    
    this.speak(helpText);
  }
  
  provideJobsHelp() {
    const helpText = `For jobs, you can say:
    "Go to jobs" to see all available jobs,
    "Search for jobs" to find specific work,
    "How many jobs" to hear the count of available positions,
    or "Apply for job" for application guidance.`;
    
    this.speak(helpText);
  }
  
  provideProfileHelp() {
    const helpText = `For your profile, you can say:
    "Go to profile" to edit your information,
    "Show my skills" to see your skill assessments,
    "My skill score" to hear your average rating,
    or "Update profile" to make changes.`;
    
    this.speak(helpText);
  }
  
  // Utility Methods
  extractPageContent() {
    // Extract meaningful content from the current page
    const headings = Array.from(document.querySelectorAll('h1, h2, h3'))
      .map(h => h.textContent.trim())
      .filter(text => text.length > 0)
      .slice(0, 3);
    
    if (headings.length > 0) {
      return `The main sections are: ${headings.join(', ')}.`;
    }
    
    return 'This page contains various options and information.';
  }
  
  handleUnrecognizedCommand(input) {
    const suggestions = [
      'Try saying "go to jobs" to see available work',
      'Say "open my wallet" to check your balance',
      'Try "help" to hear all available commands',
      'Say "go to profile" to edit your information'
    ];
    
    const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
    
    this.speak(`I didn't understand "${input}". ${randomSuggestion}.`);
  }
  
  speak(text) {
    if (this.retellClient && this.retellClient.speak) {
      this.retellClient.speak(text);
    } else {
      // Fallback to browser speech synthesis
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 0.8;
        speechSynthesis.speak(utterance);
      }
      console.log('Voice Assistant:', text);
    }
  }
  
  // Public methods for external control
  setCurrentUser(user) {
    this.currentUser = user;
  }
  
  startListening() {
    this.isListening = true;
  }
  
  stopListening() {
    this.isListening = false;
  }
  
  // Get all available commands for help
  getAllCommands() {
    const allCommands = {};
    for (const [category, commands] of Object.entries(this.voiceCommands)) {
      allCommands[category] = Object.keys(commands);
    }
    return allCommands;
  }
}

export default VoiceNavigationService;