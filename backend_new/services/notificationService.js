const Notification = require('../Model/Notification');
const UserSkill = require('../Model/UserSkill');
const User = require('../Model/User');

class NotificationService {
  
  // Create a new notification
  static async createNotification(userId, type, title, message, data = {}, actionUrl = null, actionText = null) {
    try {
      const notification = new Notification({
        user_id: userId,
        type,
        title,
        message,
        data,
        action_url: actionUrl,
        action_text: actionText
      });

      await notification.save();
      console.log(`Notification created for user ${userId}: ${type}`);
      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  // Notify seekers about new job matching their skills
  static async notifyJobMatch(job) {
    try {
      if (!job.skills_required || job.skills_required.length === 0) {
        return;
      }

      // Find all seekers who have the required skills
      const userSkills = await UserSkill.find({
        skill_id: { $in: job.skills_required }
      }).populate('user_id', '_id name role').populate('skill_id', 'name');

      const notifiedUsers = new Set();

      for (const userSkill of userSkills) {
        const user = userSkill.user_id;
        
        // Only notify seekers and avoid duplicate notifications
        if (user && user.role === 'seeker' && !notifiedUsers.has(user._id.toString())) {
          notifiedUsers.add(user._id.toString());

          const title = `New Job Match: ${job.title}`;
          const message = `A new job "${job.title}" matches your skill "${userSkill.skill_id.name}". Salary: ₹${job.salary_min}-₹${job.salary_max}`;
          
          await this.createNotification(
            user._id,
            'job_match',
            title,
            message,
            {
              job_id: job._id,
              job_title: job.title,
              skill_name: userSkill.skill_id.name,
              salary_min: job.salary_min,
              salary_max: job.salary_max,
              location: job.location
            },
            `/jobs/${job._id}`,
            'Apply Now'
          );
        }
      }

      console.log(`Job match notifications sent to ${notifiedUsers.size} seekers for job: ${job.title}`);
    } catch (error) {
      console.error('Error sending job match notifications:', error);
    }
  }

  // Notify about new loan suggestion
  static async notifyLoanSuggestion(userId, loanSuggestion) {
    try {
      const title = `New Loan Suggestion: ${loanSuggestion.skillName} Business`;
      const message = `We've found a loan opportunity for your ${loanSuggestion.skillName} skill. Amount: ₹${loanSuggestion.suggestedAmount.toLocaleString()} for ${loanSuggestion.businessName}`;
      
      await this.createNotification(
        userId,
        'loan_suggestion',
        title,
        message,
        {
          loan_id: loanSuggestion._id,
          skill_name: loanSuggestion.skillName,
          business_name: loanSuggestion.businessName,
          suggested_amount: loanSuggestion.suggestedAmount,
          interest_rate: loanSuggestion.interestRate
        },
        '/loan-suggestions',
        'View Details'
      );

      console.log(`Loan suggestion notification sent to user ${userId}`);
    } catch (error) {
      console.error('Error sending loan suggestion notification:', error);
    }
  }

  // Notify about credit score update
  static async notifyCreditScoreUpdate(userId, oldScore, newScore) {
    try {
      const scoreChange = newScore - oldScore;
      const changeText = scoreChange > 0 ? `increased by ${scoreChange}` : `decreased by ${Math.abs(scoreChange)}`;
      
      const title = 'Credit Score Updated';
      const message = `Your credit score has ${changeText}. New score: ${newScore}/100`;
      
      await this.createNotification(
        userId,
        'credit_score_update',
        title,
        message,
        {
          old_score: oldScore,
          new_score: newScore,
          change: scoreChange
        },
        '/credit-score',
        'View Details'
      );

      console.log(`Credit score update notification sent to user ${userId}: ${oldScore} → ${newScore}`);
    } catch (error) {
      console.error('Error sending credit score update notification:', error);
    }
  }

  // Notify about assessment assignment
  static async notifyAssessmentAssigned(userId, assessment) {
    try {
      const title = `Assessment Assigned: ${assessment.skill_id.name}`;
      const message = `You have been assigned an assessment for ${assessment.skill_id.name} skill. Complete it to verify your expertise.`;
      
      await this.createNotification(
        userId,
        'assessment_assigned',
        title,
        message,
        {
          assessment_id: assessment._id,
          skill_name: assessment.skill_id.name,
          job_title: assessment.job_id ? assessment.job_id.title : null,
          total_questions: assessment.total_questions,
          duration_minutes: assessment.duration_minutes
        },
        `/assessment/${assessment._id}`,
        'Take Assessment'
      );

      console.log(`Assessment assignment notification sent to user ${userId} for skill ${assessment.skill_id.name}`);
    } catch (error) {
      console.error('Error sending assessment assignment notification:', error);
    }
  }

  // Notify about assessment result
  static async notifyAssessmentResult(userId, assessment) {
    try {
      const passed = assessment.percentage >= 70;
      const title = `Assessment ${passed ? 'Passed' : 'Failed'}: ${assessment.skill_id.name}`;
      const message = `Your ${assessment.skill_id.name} assessment is complete. Score: ${assessment.percentage}% (${assessment.correct_answers}/${assessment.total_questions})`;
      
      await this.createNotification(
        userId,
        'assessment_result',
        title,
        message,
        {
          assessment_id: assessment._id,
          skill_name: assessment.skill_id.name,
          percentage: assessment.percentage,
          correct_answers: assessment.correct_answers,
          total_questions: assessment.total_questions,
          passed: passed
        },
        '/skills',
        'View Skills'
      );

      console.log(`Assessment result notification sent to user ${userId}: ${assessment.percentage}%`);
    } catch (error) {
      console.error('Error sending assessment result notification:', error);
    }
  }

  // Get notifications for a user
  static async getUserNotifications(userId, page = 1, limit = 20, unreadOnly = false) {
    try {
      const filter = { user_id: userId };
      if (unreadOnly) {
        filter.is_read = false;
      }

      const notifications = await Notification.find(filter)
        .sort({ created_at: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await Notification.countDocuments(filter);
      const unreadCount = await Notification.countDocuments({ user_id: userId, is_read: false });

      return {
        notifications,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        },
        unread_count: unreadCount
      };
    } catch (error) {
      console.error('Error fetching user notifications:', error);
      throw error;
    }
  }

  // Mark notification as read
  static async markAsRead(notificationId, userId) {
    try {
      const notification = await Notification.findOneAndUpdate(
        { _id: notificationId, user_id: userId },
        { is_read: true, read_at: new Date() },
        { new: true }
      );

      return notification;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  // Mark all notifications as read for a user
  static async markAllAsRead(userId) {
    try {
      const result = await Notification.updateMany(
        { user_id: userId, is_read: false },
        { is_read: true, read_at: new Date() }
      );

      return result;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  // Delete notification
  static async deleteNotification(notificationId, userId) {
    try {
      const result = await Notification.deleteOne({ _id: notificationId, user_id: userId });
      return result;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }

  // Get unread count for a user
  static async getUnreadCount(userId) {
    try {
      const count = await Notification.countDocuments({ user_id: userId, is_read: false });
      return count;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }
}

module.exports = NotificationService;