import { api } from './api'

export interface EmailTriggerEvent {
  event_type: 'user_registered' | 'job_posted' | 'application_submitted' | 'application_accepted' | 'application_rejected' | 'payment_received' | 'payment_failed' | 'profile_completed' | 'message_received' | 'subscription_expiring' | 'subscription_renewed' | 'custom_webhook'
  user_id: number
  user_role: 'talent' | 'manager' | 'admin'
  data: Record<string, any>
  recipient_email?: string
}

export interface EmailTrigger {
  id: number
  event_type: EmailTriggerEvent['event_type']
  trigger_name: string
  description: string
  conditions?: {
    user_role?: 'talent' | 'manager' | 'admin'
    delay_minutes?: number
    only_if_first_time?: boolean
    custom_condition?: string
  }
  is_active: boolean
}

export interface EmailTemplate {
  id: number
  name: string
  subject: string
  html_template: string
  text_template: string
  variables: string[]
  triggers: EmailTrigger[]
  is_active: boolean
}

class EmailTriggerService {
  /**
   * Process an event and trigger any matching emails
   */
  async processEvent(event: EmailTriggerEvent): Promise<void> {
    try {
      // In a real implementation, this would:
      // 1. Fetch all active email templates with triggers
      // 2. Find matching triggers for this event
      // 3. Check conditions and send emails
      
      console.log('Processing email trigger event:', event)
      
      // Demo implementation - show what would happen
      await this.demoProcessEvent(event)
      
      // Real implementation would make API calls:
      // await api.post('/notifications/trigger-event', event)
    } catch (error) {
      console.error('Failed to process email trigger event:', error)
    }
  }

  /**
   * Demo implementation showing trigger logic
   */
  private async demoProcessEvent(event: EmailTriggerEvent): Promise<void> {
    const demoTemplates = await this.getDemoTemplates()
    
    const matchingTriggers = demoTemplates
      .filter(template => template.is_active)
      .flatMap(template => 
        template.triggers
          .filter(trigger => trigger.is_active)
          .filter(trigger => trigger.event_type === event.event_type)
          .filter(trigger => this.checkConditions(trigger, event))
          .map(trigger => ({ trigger, template }))
      )

    console.log(`Found ${matchingTriggers.length} matching triggers for event ${event.event_type}`)

    for (const { trigger, template } of matchingTriggers) {
      await this.sendTriggeredEmail(trigger, template, event)
    }
  }

  /**
   * Check if trigger conditions match the event
   */
  private checkConditions(trigger: EmailTrigger, event: EmailTriggerEvent): boolean {
    if (!trigger.conditions) return true

    // Check user role condition
    if (trigger.conditions.user_role && trigger.conditions.user_role !== event.user_role) {
      return false
    }

    // Check first-time condition
    if (trigger.conditions.only_if_first_time) {
      // In real implementation, check if user has received this email before
      console.log('Would check if this is first time for user:', event.user_id)
    }

    return true
  }

  /**
   * Send a triggered email
   */
  private async sendTriggeredEmail(trigger: EmailTrigger, template: EmailTemplate, event: EmailTriggerEvent): Promise<void> {
    const delay = trigger.conditions?.delay_minutes || 0
    
    console.log(`Scheduling email "${template.name}" for trigger "${trigger.trigger_name}"${delay > 0 ? ` with ${delay} minute delay` : ''}`)

    // Replace variables in template
    const processedTemplate = this.processTemplate(template, event.data)
    
    const emailData = {
      template_id: template.id,
      trigger_id: trigger.id,
      recipient_email: event.recipient_email,
      user_id: event.user_id,
      subject: processedTemplate.subject,
      html_content: processedTemplate.html_template,
      text_content: processedTemplate.text_template,
      delay_minutes: delay,
      event_type: event.event_type,
      event_data: event.data
    }

    if (delay > 0) {
      // Schedule for later
      console.log('Email scheduled for delivery in', delay, 'minutes')
      // await api.post('/notifications/schedule', emailData)
    } else {
      // Send immediately
      console.log('Email queued for immediate delivery')
      // await api.post('/notifications/send', emailData)
    }
  }

  /**
   * Process template variables
   */
  private processTemplate(template: EmailTemplate, data: Record<string, any>) {
    let subject = template.subject
    let htmlTemplate = template.html_template
    let textTemplate = template.text_template

    // Replace variables in the format {{variableName}}
    for (const [key, value] of Object.entries(data)) {
      const placeholder = `{{${key}}}`
      subject = subject.replace(new RegExp(placeholder, 'g'), String(value))
      htmlTemplate = htmlTemplate.replace(new RegExp(placeholder, 'g'), String(value))
      textTemplate = textTemplate.replace(new RegExp(placeholder, 'g'), String(value))
    }

    return {
      subject,
      html_template: htmlTemplate,
      text_template: textTemplate
    }
  }

  /**
   * Get demo templates (in real implementation, fetch from API)
   */
  private async getDemoTemplates(): Promise<EmailTemplate[]> {
    return [
      {
        id: 1,
        name: 'Welcome Email',
        subject: 'Welcome to Dozyr, {{firstName}}!',
        html_template: '<h1>Welcome {{firstName}}!</h1><p>Thank you for joining Dozyr. Start your journey today!</p>',
        text_template: 'Welcome {{firstName}}! Thank you for joining Dozyr. Start your journey today!',
        variables: ['firstName', 'lastName'],
        triggers: [
          {
            id: 1,
            event_type: 'user_registered',
            trigger_name: 'New User Registration',
            description: 'Send welcome email when user completes registration',
            conditions: {
              delay_minutes: 0,
              only_if_first_time: true
            },
            is_active: true
          }
        ],
        is_active: true
      },
      {
        id: 2,
        name: 'Job Application Received',
        subject: 'New Application for {{jobTitle}}',
        html_template: '<h2>New Application</h2><p>{{applicantName}} has applied for {{jobTitle}}.</p>',
        text_template: 'New Application: {{applicantName}} has applied for {{jobTitle}}.',
        variables: ['applicantName', 'jobTitle', 'companyName'],
        triggers: [
          {
            id: 2,
            event_type: 'application_submitted',
            trigger_name: 'Application Notification',
            description: 'Notify manager when talent applies to their job',
            conditions: {
              user_role: 'manager',
              delay_minutes: 5
            },
            is_active: true
          }
        ],
        is_active: true
      },
      {
        id: 3,
        name: 'Payment Confirmation',
        subject: 'Payment Received - {{amount}}',
        html_template: '<h2>Payment Confirmed</h2><p>Your payment of {{amount}} has been processed successfully.</p>',
        text_template: 'Payment Confirmed: Your payment of {{amount}} has been processed successfully.',
        variables: ['amount', 'jobTitle', 'paymentDate'],
        triggers: [
          {
            id: 3,
            event_type: 'payment_received',
            trigger_name: 'Payment Confirmation',
            description: 'Send confirmation when payment is processed',
            conditions: {
              delay_minutes: 0
            },
            is_active: true
          }
        ],
        is_active: true
      }
    ]
  }

  /**
   * Manual trigger for testing
   */
  async testTrigger(eventType: EmailTriggerEvent['event_type'], testData: Record<string, any>): Promise<void> {
    const testEvent: EmailTriggerEvent = {
      event_type: eventType,
      user_id: 999,
      user_role: 'talent',
      recipient_email: 'test@example.com',
      data: testData
    }

    await this.processEvent(testEvent)
  }
}

export const emailTriggerService = new EmailTriggerService()

// Helper functions to trigger specific events
export const triggerUserRegistered = (userId: number, userData: { firstName: string, lastName: string, email: string, role: 'talent' | 'manager' }) => {
  return emailTriggerService.processEvent({
    event_type: 'user_registered',
    user_id: userId,
    user_role: userData.role,
    recipient_email: userData.email,
    data: userData
  })
}

export const triggerJobPosted = (managerId: number, managerEmail: string, jobData: { jobTitle: string, companyName: string }) => {
  return emailTriggerService.processEvent({
    event_type: 'job_posted',
    user_id: managerId,
    user_role: 'manager',
    recipient_email: managerEmail,
    data: jobData
  })
}

export const triggerApplicationSubmitted = (managerId: number, managerEmail: string, applicationData: { applicantName: string, jobTitle: string, companyName: string }) => {
  return emailTriggerService.processEvent({
    event_type: 'application_submitted',
    user_id: managerId,
    user_role: 'manager',
    recipient_email: managerEmail,
    data: applicationData
  })
}

export const triggerPaymentReceived = (userId: number, userEmail: string, paymentData: { amount: string, jobTitle: string, paymentDate: string }) => {
  return emailTriggerService.processEvent({
    event_type: 'payment_received',
    user_id: userId,
    user_role: 'talent',
    recipient_email: userEmail,
    data: paymentData
  })
}